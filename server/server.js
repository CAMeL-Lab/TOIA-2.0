//Set up requirements

const express = require('express');
const mkdirp = require('mkdirp');
const fs = require('fs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
require('dotenv').config();

const Buffer = require('buffer');
const multer  = require('multer');
const crypto=require('crypto');
const mime = require('mime');

const cors = require('cors');

const axios=require('axios');

//Create an 'express' instance

const app = express()
const server = app.listen(process.env.PORT || 3000, () => console.log('Server is listening!'));


app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(express.json())


//Connect to MySQL database

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
})

connection.connect()


let avatarName='';
let video_id='';
let count=9000;

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
		cb(null,`./public/static/avatar_garden/${avatarName}/videos`);
	},
	filename: function (req, file, cb) {
		crypto.pseudoRandomBytes(16, function (err, raw) {
			video_id=(raw.toString('hex') + Date.now()).slice(0,32);
			cb(null, avatarName+'_'+video_id + '.' + mime.getExtension(file.mimetype));
		});
  }
});

var upload = multer({storage:storage});
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
	console.log(req.params);
});

app.get('/player/:avatar/:language/:question',(req,res)=>{
	
	const question=req.params.question+'?';
	const avatar=req.params.avatar;
	const language=req.params.language;

	console.log(question,avatar,language)

	let query_avatar_id=`SELECT id_avatar FROM avatar WHERE name="${avatar}" AND language="en-US"`;

	let query = `SELECT id_video,idx,answer FROM video WHERE avatar_id_avatar in (${query_avatar_id}) AND question="${question}";`;

	connection.query(query, (err,entry,fields)=>{
		if (err){
			throw err;
		}
		else{
			let video_id=entry[0].id_video;
			let index=entry[0].idx;
			let answer=entry[0].answer;
			
			let video_file=avatar.toLowerCase()+'2019_'+index+'_'+video_id+'.mp4';
			let video_path='./public/static/avatar_garden/margarita2019/videos/'+video_file;
		
			res.sendFile(video_path, { root: __dirname });
		}
	});
});



app.post('/createAvatar',(req,res)=>{
	
	let isPrivate;

	if(req.body.privacySetting=='public'){
		isPrivate=0;

	}else{
		isPrivate=1;
	}

	let queryCreateAvatar;
	if(req.body.bio!=''){
		queryCreateAvatar=`INSERT INTO avatar(name,is_private,description,language) VALUES("${req.body.name}",${isPrivate},"${req.body.bio}","${req.body.language}");`
	}else{
		queryCreateAvatar=`INSERT INTO avatar(name,is_private,language) VALUES("${req.body.name}",${isPrivate},"${req.body.language}");`
	}

	connection.query(queryCreateAvatar, (err,entry,fields)=>{
		if (err){
			throw err;
		}
	});
	mkdirp(`./public/static/avatar_garden/${req.body.name}`);
	mkdirp(`./public/static/avatar_garden/${req.body.name}/videos`);
	avatarName=req.body.name;

});


app.get('/getQuestions',(req,res)=>{
	axios.get('https://toia-question-generator.herokuapp.com/getMandataoryQuestions').then((questionArr)=>{
		console.log('yehee');
		res.send(questionArr.data.mandatoryQuestions);
	})
});

app.post('/recorder',upload.any(),(req,res)=>{


	console.log('Save successful');

	let question = req.body.question;
	let answer = req.body.answer;
	let idAvatar;
	let getAvatarIdQuery=`SELECT id_avatar FROM avatar WHERE name="${avatarName}";`;
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