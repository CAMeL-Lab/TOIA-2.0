//Set up requirements

const express = require('express');
const mkdirp = require('mkdirp');
const fs = require('fs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
require('dotenv').config();

const Buffer = require('buffer');
const multer  = require('multer');
const crypto = require('crypto');
const mime = require('mime');
const path = require('path');

const cors = require('cors');

const axios=require('axios');

//Create an 'express' instance

const app = express()
const server = app.listen(process.env.PORT || 3000, () => console.log('Server is listening!'));


app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(express.json())

app.use(express.static('./public'));

//Connect to MySQL database

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
})

connection.connect()

let count=24000;
let name='';
let video_id='';

let answerTheseQuestions=["What is your favorite sport?","What is your designation?","Where do you live?","Who is your favorite actor?"];
let index=0;
//Check if entry exists in database, otherwise create one

// async function getPath(avatarName){
// 	let query=`SELECT COUNT(*) AS present FROM avatar WHERE name="${avatarName}";`

// 	 connection.query(query, (err,rows,fields)=>{

// 		if (err){
// 			throw err;
// 		}
// 		else{
	
// 			if(rows[0].present==0){
// 				console.log('wooh')
// 				mkdirp(`./public/static/avatar_garden/${avatarName}`);
// 				mkdirp(`./public/static/avatar_garden/${avatarName}/videos`);

// 			}
// 			let path= `./public/static/avatar_garden/${avatarName}/videos`;
// 		}
// 	});

// }


let storage = multer.diskStorage({
	destination: function (req, file, cb) {
		//cb(null,`./public/static/avatar_garden/${req.body.name}/videos`);
		cb(null,`./public/static/avatar_garden/${name}/videos`);
	},
	filename: function (req, file, cb) {
		crypto.pseudoRandomBytes(16, function (err, raw) {
			video_id=(raw.toString('hex') + Date.now()).slice(0,32);
			cb(null, name+video_id + '.' + mime.getExtension(file.mimetype));
		});
  }
});

let upload = multer({
	storage:storage
});
// var type = upload.single('blob');

//Migrating the Margarita2019 Knowledge Base


// let json = JSON.parse(fs.readFileSync('script.json'));


// for(let i=0;i<json.rows.length;i++){

// 	if(json.rows[i]['doc']['english-question']!='FILLER'){
// 		let query = 'INSERT INTO video(id_video, avatar_id_avatar, idx, question, answer, type) VALUES("'+json.rows[i]['id']+'",1,'+json.rows[i]['doc']['index']+',"'+json.rows[i]['doc']['english-question']+'","'+json.rows[i]['doc']['english-answer']+'","answer");'
		
// 		connection.query(query,(err,result,fields)=>{
// 			if (err) throw err;
// 			else{delete json.rows[i];}
// 		});
// 	}
// }


// Quering the database

// let ans=[]
// question="What city would you most like to live in?"
// query='SELECT * FROM video;';
// console.log(query);
// connection.query(query, (err,entries,fields)=>{
// 	if (err){
// 		throw err;
// 	}
// 	else{console.log(entries.length);}

// })



// Figuring out authentication

// //configuring authentication

// passport.use(new LocalStrategy((username, password, success)=>{
	
// }));


// //Login page

// app.get('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: true })
// )


// Implementing the recorder


app.post('/login',(req,res)=>{

	req.body.email
	req.body.pwd

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
						console.log(entry);
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

app.get('/getAllAvatars',(req,res)=>{

	let getAvatarQuery=`SELECT name,id_avatar FROM avatar;`;
	connection.query(getAvatarQuery, (err,entry,fields)=>{
		if (err){
			throw err;
		}
		else{
			console.log(entry.map(avatar=>[avatar.name,avatar.id_avatar]));
			res.send(entry.map(avatar=>[avatar.name,avatar.id_avatar]));
		}

	});
			
});

app.get('/getAvatarInfo',(req,res)=>{
	console.log('hihihi');
	let query_avatar_info=`SELECT name,language,description FROM avatar WHERE id_avatar="${req.query.avatarID}";`
	connection.query(query_avatar_info, (err,entry,fields)=>{
		if (err){
			throw err;
		}
		else{
			let avatarInfo={
				name: entry[0].name,
				language: entry[0].language,
				bio: entry[0].description
			}

			res.send(avatarInfo);
		}		
	});

});


app.get('/player/:avatarID/:avatarName/:language/:question',(req,res)=>{
	
	let question=req.params.question+'?';
	let avatarID=req.params.avatarID;
	let avatarName=req.params.avatarName;
	let language=req.params.language;

	axios.post('http://localhost:5000/dialogue_manager',{
		query: question,
		avatar_name: avatarName,
		KB_version: "1.0",
		language: "US-en",
		avatar_id:avatarID
	}).then((videoDetails)=>{
		let answerToQuestion=videoDetails.data.answer;
		let query_avatar_idx=`SELECT idx FROM video WHERE avatar_id_avatar=${avatarID} AND id_video="${videoDetails.data.id_video}";`
		connection.query(query_avatar_idx,(err,entry,fields)=>{
			if (err){
				throw err;
			}
			else{
				let index=entry[0].idx;
				let video_file=''
				console.log(avatarName);
				if(avatarName=='Margarita'){
					video_file='margarita2019_'+index+'_'+videoDetails.data.id_video+'.mp4';
				}else{
					video_file=avatarName+videoDetails.data.id_video+'.webm';
				}
				let video_path=`./public/static/avatar_garden/${avatarName}/videos/${video_file}`;
				
				res.sendFile(video_path, { root: __dirname });
			}
		});

	});
});

app.post('/createTOIA',(req,res)=>{

	let queryCreateTOIA=`INSERT INTO toia_user(first_name, last_name, email, password, language) VALUES("${req.body.firstName}","${req.body.lastName}","${req.body.email}","${req.body.pwd}","${req.body.language}");`
	connection.query(queryCreateTOIA, (err,entry,fields)=>{
		if (err){
			throw err;
		}else{
			console.log(entry.insertId);
			res.send({new_toia_ID: entry.insertId});
		}
	});
	mkdirp(`./public/static/avatar_garden/${req.body.firstName}`);
	mkdirp(`./public/static/avatar_garden/${req.body.firstName}/videos`);

});


app.get('/getQuestions',(req,res)=>{
	// axios.get('http://localhost:4000/getMandatoryQuestions').then((questionArr)=>{
	// 	console.log('yehee');
	// 	res.send(questionArr.data.mandatoryQuestions);
	// })
	res.send(["What is your name?","How are you?","Where are you from?"]);
});

app.post('/recorder',upload.any(),(req,res)=>{

	// upload(req,res,(err)=>{
	// 	if(err){
	// 		console.log('oops');
	// 	}else{
	// 		console.log(req.file);
	// 	}
	// });
	// console.log('Save successful');

	let question = req.body.question;
	let answer = req.body.answer;
	console.log(req.body);
	let qa_pair=question+' '+answer;
	console.log(qa_pair);
	// axios.post('http://localhost:4000/generateNextQ',{
	// 	qa_pair
	// }).then((nextQuestions)=>{
	// 	console.log('yehee');
	// 	res.send(nextQuestions.data.q[0]);
	// });
	res.send(answerTheseQuestions[index]);
	index=index+1;

	let idAvatar;
	let getAvatarIdQuery=`SELECT id_avatar FROM avatar WHERE name="${req.body.name}";`;
	connection.query(getAvatarIdQuery,(err,entry,fields)=>{
		if (err){
			throw err;
		}
		else{
			console.log(entry);
			idAvatar=entry[0].id_avatar;
			let querySaveVideo = `INSERT INTO video(id_video,question,answer,type,avatar_id_avatar,idx) VALUES("${video_id}","${question}","${answer}","answer",${idAvatar},${count});`;

		
			connection.query(querySaveVideo, (err,entry,fields)=>{
				if (err){
					throw err;
				}else{
					axios.post('http://localhost:5000/update_avatar',{
						question,
						answer,
						KB_version: "1.0",
						language: "US-en",
						id_video:video_id,
						avatar_id:idAvatar
					});
				}
			});
		}
	});
	count=count+20;










			
	// 		let video_file=avatar.toLowerCase()+'2019_'+index+'_'+video_id+'.mp4';
	// 		let video_path='./public/static/avatar_garden/margarita2019/videos/'+video_file;
			
	// 		res.sendFile(video_path, { root: __dirname });
	// 	}
	// });

	// var avatarName = req.file.originalname.substr(0,req.file.originalname.indexOf('_'));
	// fs.rename(__dirname + '/public/uploads/' + req.file.filename, __dirname + '/public/avatar-garden/' + '/videos/' + req.file.originalname, (err) => {
	//   if (err) throw err;
	//   console.log('Rename complete!');
	// });
	// const url = URL.createObjectURL(videoData);

	// const a = document.createElement("a");
 //    a.style = "display: none";
 //    a.href = url;
 //    a.download = inputName+".mp4";
 //    a.click();
	// const avatarName = req.params.avatar;
	// const currLanguage = req.params.language;
	// const question = req.params.question;
	// const answer = req.params.answer;
	// const videoData = req.params.videoData;
	// const isPrivate = req.params.isPrivate


	// let query=`SELECT COUNT(*) FROM avatar WHERE name="${avatarName}";`
	// connection.query(query, (err,entry,fields)=>{
	// 	if (err){
	// 		throw err;
	// 	}
	// 	else{
	// 		if(entry[0]==0){

	// 			mkdirp(`./static/avatar_garden/${avatarName}`);
	// 			mkdirp(`./static/avatar_garden/${avatarName}/videos`)

	// 			fs.mkdirSync(dir);
	// 			fs.mkdirSync(`./static/avatar_garden/${avatarName}/videos`)

	//         	const url = URL.createObjectURL(videoData);

	// 			const a = document.createElement("a");
	// 	        a.style = "display: none";
	// 	        a.href = url;
	// 	        a.download = inputName+".mp4";
	// 	        a.click();
	// 			//make directory
	// 		}
	// 	}
	// })
	
});