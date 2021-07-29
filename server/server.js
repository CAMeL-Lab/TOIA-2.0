//Set up requirements

const express = require('express');
const mkdirp = require('mkdirp');
const fs = require('fs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
require('dotenv').config();
const stream = require('stream');
const crypto = require('crypto');
const path = require('path');
const {Storage} = require('@google-cloud/storage');

var multiparty = require('multiparty');

const cors = require('cors');
const axios=require('axios');
const { callbackify } = require('util');
const { ENETUNREACH } = require('constants');

//Create an 'express' instance

const app = express();
const server = app.listen(process.env.PORT || 3001, () => console.log('Server is listening!'));
 
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static('./public'));
app.use(cors());

let config;
let connection;

//Connect to CloudSQL database for Production
if(process.env.ENVIRONMENT=='production'){

	config = {
		user: process.env.DB_USERNAME,
		database: process.env.DB_DATABASE,
		password: process.env.DB_PASSWORD,
	}

	config.socketPath = `/cloudsql/${process.env.DB_INSTANCE_CONNECTION_NAME}`;

	connection = mysql.createConnection(config);

}else if(process.env.ENVIRONMENT=='development'){
	console.log('wohoo');
	connection = mysql.createConnection({
		host: process.env.DB_HOST,
		user: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE
	});

	connection.connect();
}

const gc = new Storage({
	keyFilename: path.join(__dirname,"/toia-capstone-2021-a17d9d7dd482.json"),
	projectId:'toia-capstone-2021'
});
let videoStore=gc.bucket(process.env.GC_BUCKET);

app.post('/createTOIA',cors(),(req,res)=>{

	let suggestions=['Record a filler video!','Record a greeting!','Where are you from?','Do you have any hobbies?','Do you have any siblings?'];
	let inserted=0;

    let form = new multiparty.Form();
    form.parse(req, function(err, fields, file) {


		// await videoStore.upload(file.blob[0].path, {
		// 	destination: `Accounts/${fields.firstName[0]}_${fields.id[0]}/Videos/${videoID}`
		// });

		let queryCreateTOIA=`INSERT INTO toia_user(first_name, last_name, email, password, language) VALUES("${fields.firstName[0]}","${fields.lastName[0]}","${fields.email[0]}","${fields.pwd[0]}","${fields.language[0]}");`
		connection.query(queryCreateTOIA, (err,entry,responses)=>{
			if (err){
				throw err;
			}else{
				let queryAllStream=`INSERT INTO stream(name, toia_id, private, likes, views) VALUES("All",${entry.insertId},0,0,0);`
				connection.query(queryAllStream, async (err,stream_entry,field)=>{
					if (err){
						throw err;
					}else{

						await videoStore.upload(file.blob[0].path, {
							destination: `Accounts/${fields.firstName[0]}_${entry.insertId}/StreamPic/All_${stream_entry.insertId}.jpg`
						});

						suggestions.forEach((suggestedQ)=>{
							let queryAddQs=`INSERT INTO question_suggestions(question, priority, toia_id) VALUES("${suggestedQ}",1,${entry.insertId});`
							connection.query(queryAddQs,(err,responsiveness,answerreceived)=>{
								if(err){
									throw err;
								}else{
									inserted++;
									
									if(inserted==suggestions.length){
										res.send({new_toia_ID: entry.insertId});
									}
								}
							});
						});
					}
				});
			}
		});

	});

});

app.post('/login',cors(),(req,res)=>{

	let query_checkEmailExists=`SELECT COUNT(*) AS cnt FROM toia_user WHERE email="${req.body.email}";`

	connection.query(query_checkEmailExists,(err,entry,fields)=>{
		if(err){
			throw err;
		}
		else{
			if(entry[0].cnt==0){
				res.send("-1");
			}else{
				let query_checkPasswordCorrect=`SELECT * FROM toia_user WHERE email="${req.body.email}";`
		
				connection.query(query_checkPasswordCorrect, (err,entry,fields)=>{
					if (err){
						throw err;
					}
					else{
						
						if(entry[0].password==req.body.pwd){
							let userData={
								toia_id:entry[0].id,
								firstName:entry[0].first_name,
								language:entry[0].language
							}
							res.send(userData);
						}else{
							res.send("-2");
						}
					}
				});
			}
		}
	});
});

app.get('/getAllStreams',cors(),(req,res)=>{
	let query_allStreams=`SELECT toia_user.id, toia_user.first_name, toia_user.last_name, stream.id_stream, stream.name, stream.likes, stream.views FROM stream LEFT JOIN toia_user ON toia_user.id = stream.toia_id WHERE stream.private=0 ORDER BY stream.name ASC;`
	connection.query(query_allStreams, (err,entries,fields)=>{
		if (err){
			throw err;
		}
		else{

			let counter=0;

			const config = {
				action: 'read',
				expires: '07-14-2022',
			};

			function callback(){
				res.send(entries);	
			}

		
			entries.forEach((entry)=>{

				videoStore.file(`Accounts/${entry.first_name}_${entry.id}/StreamPic/${entry.name}_${entry.id_stream}.jpg`).getSignedUrl(config, function(err, url) {
					if (err) {
						console.error(err);
						return;
					}else{
							entry.pic=url;
			
							counter++;
					
							if(counter==entries.length){
								callback();
							}
					}
				});
			});
		}
	});
});

app.post('/getUserSuggestedQs',cors(),(req,res)=>{

	let query_fetchSuggestions=`SELECT id_question, question FROM question_suggestions WHERE toia_id="${req.body.params.toiaID}" ORDER BY id_question ASC;`
	connection.query(query_fetchSuggestions, (err,entries,fields)=>{
		if(err){
			throw err;
		}else{

			let count=0;

			const config = {
				action: 'read',
				expires: '07-14-2022',
			};

			function callback(){
				res.send(entries);	
			}

			entries.forEach((entry)=>{

				videoStore.file(`Placeholder/questionmark.png`).getSignedUrl(config, function(err, url) {
					if (err) {
						console.error(err);
						return;
					}else{
							entry.pic=url;
			
							count++;
					
							if(count==entries.length){
								callback();
							}
					}
				});
			});
		}
	});
});

app.post('/removeSuggestedQ',cors(),(req,res)=>{

	let query_removeSuggestedQ=`DELETE FROM question_suggestions WHERE id_question="${req.body.params.suggestedQID}";`
	connection.query(query_removeSuggestedQ, (err,entries,fields)=>{
		if(err){
			throw err;
		}else{
			res.send('Deleted successfully!');
		}
	});

});

app.post('/getUserVideos',cors(),(req,res)=>{
	console.log("request received");
	let query_userVideos=`SELECT * FROM video WHERE toia_id="${req.body.params.toiaID}" ORDER BY idx DESC;`;
	connection.query(query_userVideos, (err,entries,fields)=>{
		if (err){
			throw err;
		}
		else{
			console.log(entries);

			let cnt=0;

			const config = {
				action: 'read',
				expires: '07-14-2022',
			};

			function callback(){
				console.log(entries);
				res.send(entries);	
			}

			if(cnt==entries.length){
				callback();
			}

		
			entries.forEach((entry)=>{

				videoStore.file(`Accounts/${req.body.params.toiaName}_${req.body.params.toiaID}/VideoThumb/${entry.id_video}`).getSignedUrl(config, function(err, url) {
					if (err) {
						console.error(err);
						return;
					}else{
							entry.pic=url;
							cnt++;
					
							if(cnt==entries.length){
								callback();
							}
					}
				});
			});

		}		
	});
});

app.post('/getUserStreams',cors(),async (req,res)=>{
	console.log('request received');
	let query_userStreams=`SELECT * FROM stream WHERE toia_id="${req.body.params.toiaID}";`;
	connection.query(query_userStreams, async (err,entries,fields)=>{
		if (err){
			throw err;
		}
		else{
			let counter=0;

			const config = {
				action: 'read',
				expires: '07-14-2022',
			};

			function callback(){
				console.log(entries);
				res.send(entries);	
			}

		
			entries.forEach((entry)=>{

				videoStore.file(`Accounts/${req.body.params.toiaName}_${req.body.params.toiaID}/StreamPic/${entry.name}_${entry.id_stream}.jpg`).getSignedUrl(config, function(err, url) {
					if (err) {
						console.error(err);
						return;
					}else{
							entry.pic=url;
							counter++;
					
							if(counter==entries.length){
								callback();
							}
					}
				});
			});
		
		}		
	});

});

app.post('/createNewStream',cors(),(req,res)=>{

	let privacySetting=0;
    let form = new multiparty.Form();

    form.parse(req, function(err, fields, file) {
		if(fields.newStreamPrivacy[0]=='private'){
			privacySetting=1;
		}

		let query_createStream=`INSERT INTO stream(name, toia_id, private, likes, views) VALUES("${fields.newStreamName[0]}",${fields.toiaID[0]},${privacySetting},0,0)`

		connection.query(query_createStream, async (err,entry,field)=>{
			if (err){
				throw err;
			}
			else{
	
				await videoStore.upload(file.blob[0].path, {
					destination: `Accounts/${fields.toiaName[0]}_${fields.toiaID[0]}/StreamPic/${fields.newStreamName[0]}_${entry.insertId}.jpg`
				});
	
				let query_allStreamsUpdated=`SELECT * FROM stream WHERE toia_id="${fields.toiaID[0]}";`
	
				connection.query(query_allStreamsUpdated, (err,entries,field)=>{
					if (err){
						throw err;
					}
					else{

						let counter=0;

						const config = {
							action: 'read',
							expires: '07-14-2022',
						};
			
						function callback(){
							res.send(entries);	
						}
			
					
						entries.forEach((streamEntry)=>{
			
							videoStore.file(`Accounts/${fields.toiaName[0]}_${fields.toiaID[0]}/StreamPic/${streamEntry.name}_${streamEntry.id_stream}.jpg`).getSignedUrl(config, function(err, url) {
								if (err) {
									console.error(err);
									return;
								}else{
										streamEntry.pic=url;
						
										counter++;
								
										if(counter==entries.length){
											callback();
										}
								}
							});
						});

					}
				});
			}		
		});


	});
});

app.post('/getStreamVideos', cors(),(req,res)=>{

	let query_streamVideos=`SELECT * FROM video INNER JOIN stream_has_video ON video.id_video=stream_has_video.video_id_video WHERE stream_has_video.stream_id_stream=${req.body.params.streamID} ORDER BY idx DESC;`;

	connection.query(query_streamVideos, (err,entries,fields)=>{
		if (err){
			throw err;
		}
		else{

			let cnt=0;

			const config = {
				action: 'read',
				expires: '07-14-2022',
			};

			function callback(){
				res.send(entries);	
			}


			if(cnt==entries.length){
				callback();
			}


			entries.forEach((entry)=>{

				videoStore.file(`Accounts/${req.body.params.toiaName}_${req.body.params.toiaID}/VideoThumb/${entry.id_video}`).getSignedUrl(config, function(err, url) {
					if (err) {
						console.error(err);
						return;
					}else{
							entry.pic=url;
							cnt++;
					
							if(cnt==entries.length){
								callback();
							}
					}
				});
			});

		}	
	});
});

app.post('/getVideoPlayback',cors(),(req,res)=>{
	
	let query_getTOIAInfo=`SELECT * FROM video INNER JOIN toia_user ON video.toia_id=toia_user.id WHERE video.id_video="${req.body.params.playbackVideoID}"`;
	
	connection.query(query_getTOIAInfo,(err,entries,fields)=>{
		if(err){
			throw err;
		}else{
			console.log(entries);

			const config = {
				action: 'read',
				expires: '07-14-2022',
			};
	
			videoStore.file(`Accounts/${entries[0].first_name}_${entries[0].id}/Videos/${req.body.params.playbackVideoID}`).getSignedUrl(config, function(err, url) {
				if (err) {
					console.error(err);
					return;
				}else{
					let vidPrivacy;

					if(entries[0].private==0){
						vidPrivacy='Public';
					}else{
						vidPrivacy='Private';
					}

					let dataObj={
						videoURL: url,
						videoType: entries[0].type,
						videoQuestion: entries[0].question,
						videoAnswer: entries[0].answer,
						videoPrivacy: vidPrivacy
					}

					res.send(dataObj);
				}
			});
		}
	});
});


app.post('/fillerVideo',cors(),(req,res)=>{

	let query_getFiller=`SELECT * FROM video WHERE toia_id=${req.body.params.toiaIDToTalk} AND type="filler";`

	connection.query(query_getFiller,(err,entries,fields)=>{
		if(err){
			throw err;
		}else{
			
			console.log(entries[Math.floor(Math.random() * entries.length)].id_video);

			const config = {
				action: 'read',
				expires: '07-14-2022',
			};
	
			videoStore.file(`Accounts/${req.body.params.toiaFirstNameToTalk}_${req.body.params.toiaIDToTalk}/Videos/${entries[Math.floor(Math.random() * entries.length)].id_video}`).getSignedUrl(config, function(err, url) {
				if (err) {
					console.error(err);
					return;
				}else{
					res.send(url);
				}
			});
			
		}
	});
});

app.post('/player',cors(),(req,res)=>{

	console.log(req.body.params);

	axios.post(`${process.env.DM_ROUTE}`,{
		params:{
			query: req.body.params.question,
			avatar_id : req.body.params.toiaIDToTalk,
			stream_id: req.body.params.streamIdToTalk
		}
	}).then((videoDetails)=>{

		console.log(videoDetails.data);

		const config = {
			action: 'read',
			expires: '07-14-2022',
		};

		videoStore.file(`Accounts/${req.body.params.toiaFirstNameToTalk}_${req.body.params.toiaIDToTalk}/Videos/${videoDetails.data.id_video}`).getSignedUrl(config, function(err, url) {
			if (err) {
				console.error(err);
				return;
			}else{
				res.send(url);
			}
		});
	});
});


app.post('/recorder',cors(),async (req,res)=>{
	
	let isPrivate;
	let vidIndex;
	let videoStreams;

    let form = new multiparty.Form();
    form.parse(req, function(err, fields, file) {

		if(fields.private[0]=='false'){
			isPrivate=0;
		}else{
			isPrivate=1;
		}

		videoStreams=JSON.parse(fields.streams[0]);

		let query_getNextIndex=`SELECT MAX(idx) AS maxIndex FROM video;`;
		connection.query(query_getNextIndex, async (err,entry,data)=>{
			if (err){
				throw err;
			}
			else{

				if(entry[0].maxIndex==null){
					vidIndex=0;
				}else{
					vidIndex=entry[0].maxIndex+1;
				}
	
				crypto.pseudoRandomBytes(32, async function (err, raw) {
					videoID=fields.name[0]+'_'+fields.id[0]+'_'+vidIndex+'_'+(raw.toString('hex') + Date.now()).slice(0,8)+'.mp4';
	
					let bufferStream = new stream.PassThrough();
					bufferStream.end(Buffer.from(fields.thumb[0].replace(/^data:image\/\w+;base64,/, ""), 'base64'));

					let videoThumbFile=videoStore.file(`Accounts/${fields.name[0]}_${fields.id[0]}/VideoThumb/${videoID}`);

					bufferStream.pipe(videoThumbFile.createWriteStream({
						metadata: {
						  contentType: 'image/jpeg'
						}
					  }))
					  .on('error', function(err) {throw err;})
					  .on('finish',()=>{console.log('Thumbnail uploaded!')});

					await videoStore.upload(file.blob[0].path, {
						destination: `Accounts/${fields.name[0]}_${fields.id[0]}/Videos/${videoID}`
					});


					let query_saveVideo = `INSERT INTO video(id_video,question,answer,type,toia_id,idx,private,language,likes,views) VALUES("${videoID}","${fields.question[0]}","${fields.answer[0]}","${fields.videoType[0]}",${fields.id[0]},${vidIndex},${isPrivate},"${fields.language[0]}",0,0);`;

					connection.query(query_saveVideo, (err,entry,results)=>{
						if (err){
							throw err;
						}else{
							console.log("Video entry created in database")

							videoStreams.forEach((streamToLink)=>{
								let query_saveStream = `INSERT INTO stream_has_video(stream_id_stream,video_id_video) VALUES(${streamToLink.id},"${videoID}");`
								connection.query(query_saveStream, (err,entry,results)=>{
									if (err){
										throw err;
									}else{
										console.log(`Video linked to stream "${streamToLink.name}"`);
									}
								});
							});
						}
					});

				});
			}		
		});
    });
});