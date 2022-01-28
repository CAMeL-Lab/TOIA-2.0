//Set up requirements
const express = require('express');
const mkdirp = require('mkdirp');
const fs = require('fs');
const bodyParser = require('body-parser');
require('mysql2');
require('dotenv').config();
const stream = require('stream');
const crypto = require('crypto');
const path = require('path');
const {Storage} = require('@google-cloud/storage');
const bcrypt = require('bcrypt');
var multiparty = require('multiparty');

const cors = require('cors');
const axios = require('axios');
//google speech to text
const recorder = require('node-record-lpcm16');
const speech = require('@google-cloud/speech');

// Creates a client
const client = new speech.SpeechClient();
const compression = require('compression')

const Tracker = require('./tracker/tracker');
const {
    isValidUser, saveSuggestedQuestion,
    addQuestion, isSuggestedQuestion, emailExists, linkStreamVideoQuestion, suggestionSetPending, isOnBoardingQuestion,
    isRecorded, getQuestionInfo, getStreamInfo, shouldTriggerSuggester
} = require('./helper/user_mgmt');

const connection = require('./configs/db-connection');
//const {transcribeAudio, recognizeStream, responseChunks} = require('./speech_to_text/speech_to_text')
const speech_to_text = require('./speech_to_text/speech_to_text');

// setting up the salt rounds for bcrypt
const saltRounds = 12;


// main recording parameters
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';

let recording = null;
let recognizeStream;

let streamingLimit = 210000; // 3.5 sec
let timeout;


// chucks of transcript from speech to text
let responseChunks = [];


//Create an 'express' instance
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static('./public'));
app.use(compression())
app.use(cors());


// if on development, server static files
const localAccountsDir = path.join(__dirname, 'Accounts/');
const localAssetsDir = path.join(__dirname, 'assets/');
if (process.env.ENVIRONMENT === "development") {
    app.use(express.static(localAccountsDir));
    app.use(express.static(localAssetsDir));
}

const gc = new Storage({
    keyFilename: path.join(__dirname, "/toia-capstone-2021-dc5b358c68c2.json"),
    projectId: 'toia-capstone-2021'
});
let videoStore = gc.bucket(process.env.GC_BUCKET);

// functions for google speech to text api
//####################################################
// Create a recognize stream
let streamStarted = true;
async function createStream(req, res){
    recognizeStream = await client
    .streamingRecognize(speech_to_text.request)
    .on('error', console.error)
    .on('data', async (data) =>{
        if(!streamStarted) return;
        //speechCallback(data);
        process.stdout.write(
        data.results[0] && data.results[0].alternatives[0]
        ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
        : '\n\nReached transcription time limit, press Ctrl+C\n'
    ) 
        await responseChunks.push(`${data.results[0].alternatives[0].transcript}`);
        
        if(req.body.params && req.body.params.fromRecorder === false){

            let response = "";
            let noSpaces = [];
            //console.log(responseChunks)
            responseChunks.forEach(elem => noSpaces.push(elem.trim()))

            let uniqueChars = [...new Set(noSpaces)];
            //console.log("set elements: ", uniqueChars);
            await uniqueChars.forEach(elem => response +=  (elem + " ")); //res.write(elem));
            res.send(response);
            console.log("response sent: ", response);
            FinishTrancription();
            return;

            }
        }
    );
    timeout = setTimeout(restartStream, streamingLimit);
    }

async function transcribeAudio(req, res){
    responseChunks = []
    console.log("transcribeAudio called")
    createStream(req, res);
    //console.log(recorder)
    recording = recorder
    .record({
    sampleRateHertz: sampleRateHertz,
    threshold: 0,
    verbose: false,
    recordProgram: 'rec', // Try also "arecord" or "sox"
    silence: '1000.0',
    })
    recording.stream()
        .on('error', console.error)
        .pipe(recognizeStream);

    // Restart stream when streamingLimit expires
    //setTimeout(createStream, streamingLimit);

    
}

function speechCallback(stream, incoming_which_stream) {
    let stdoutText = stream.results[0].alternatives[0].transcript;
    console.log(stdoutText);
}

function restartStream() {
    if (recognizeStream) {
        recognizeStream.removeListener('data', speechCallback);
        recognizeStream.destroy();
        recognizeStream = null;
        console.log("restarted successfully!")
    }
}

//function for reinstantiating recorder
function FinishTrancription() {
    try {
      console.log("Ending...")
      recording.stop();
      //recognizeStream.end();
      //recognizeStream.removeListener();
      //recognizeStream = null;
    }
    catch (exception_var) {
      console.log("No recording on going");
    }
  
  }
//########################################

app.post('/createTOIA', cors(), async (req, res) => {
    let form = new multiparty.Form();
    form.parse(req, async function (err, fields, file) {
        // Check if email already exist
        if (await emailExists(fields.email[0])) {
            res.status(400).send("Email already exists");
            return;
        }

        // hashing the password before saving
        const hashedPwd = await bcrypt.hash(fields.pwd[0], saltRounds);

        let queryCreateTOIA = `INSERT INTO toia_user(first_name, last_name, email, password, language) VALUES("${fields.firstName[0]}","${fields.lastName[0]}","${fields.email[0]}","${hashedPwd}","${fields.language[0]}");`
        connection.query(queryCreateTOIA, (err, entry) => {
            if (err) {
                throw err;
            } else {
                let queryAllStream = `INSERT INTO stream(name, toia_id, private, likes, views) VALUES("All",${entry.insertId},0,0,0);`
                connection.query(queryAllStream, async (err, stream_entry) => {
                    if (err) {
                        throw err;
                    } else {

                        return new Promise((async (resolve) => {
                            // save file to local storage during development
                            if (process.env.ENVIRONMENT === "development") {
                                let dest = `Accounts/${fields.firstName[0]}_${entry.insertId}/StreamPic/`;
                                let destFileName = `All_${stream_entry.insertId}.jpg`;
                                mkdirp(dest).then(() => {
                                    fs.rename(file.blob[0].path, dest + destFileName, (error) => {
                                        if (error) throw error;
                                        resolve();
                                    });
                                });
                            } else {
                                // save file to google cloud when in production
                                await videoStore.upload(file.blob[0].path, {
                                    destination: `Accounts/${fields.firstName[0]}_${entry.insertId}/StreamPic/All_${stream_entry.insertId}.jpg`
                                });
                                resolve();
                            }
                        })).then(() => {
                            res.send({
                                new_toia_ID: entry.insertId,
                                first_name: fields.firstName[0] // This is used for running tests.
                            });
                        })
                    }
                });
            }
        });
    });
});

app.post('/login', cors(), (req, res) => {

    let query_checkEmailExists = `SELECT COUNT(*) AS cnt
                                  FROM toia_user
                                  WHERE email = "${req.body.email}";`

    connection.query(query_checkEmailExists, (err, entry) => {
        if (err) {
            throw err;
        } else {
            if (entry[0].cnt === 0) {
                res.send("-1");
            } else {
                let query_checkPasswordCorrect = `SELECT *
                                                  FROM toia_user
                                                  WHERE email = "${req.body.email}";`

                connection.query(query_checkPasswordCorrect, async (err, entry, fields) => {
                    if (err) {
                        throw err;
                    } else {
                        // checking for password validity
                        const isValidPassword = await bcrypt.compare(req.body.pwd, entry[0].password);
                        if (isValidPassword) {
                            let userData = {
                                toia_id: entry[0].id,
                                firstName: entry[0].first_name,
                                language: entry[0].language
                            }
                            res.send(userData);
                        } else {
                            res.send("-2");
                        }
                    }
                });
            }
        }
    });
});

app.get('/getAllStreams', cors(), (req, res) => {
    let query_allStreams = `SELECT toia_user.id,
                                   toia_user.first_name,
                                   toia_user.last_name,
                                   stream.id_stream,
                                   stream.name,
                                   stream.likes,
                                   stream.views
                            FROM stream
                            LEFT JOIN toia_user ON toia_user.id = stream.toia_id
                            WHERE stream.private = 0
                            ORDER BY stream.name ASC;`
    connection.query(query_allStreams, (err, entries) => {
        if (err) {
            throw err;
        } else {
            if (entries.length === 0) {
                res.status(404).send("Not found!");
                return;
            }

            let counter = 0;

            const config = {
                action: 'read',
                expires: '07-14-2022',
            };

            function callback() {
                res.send(entries);
            }


            entries.forEach((entry) => {

                // send local storage image when in development
                if (process.env.ENVIRONMENT === "development") {
                    entry.pic = `/${entry.first_name}_${entry.id}/StreamPic/${entry.name}_${entry.id_stream}.jpg`;
                    counter++;

                    if (counter === entries.length) {
                        callback();
                    }
                    return;
                }

                videoStore.file(`Accounts/${entry.first_name}_${entry.id}/StreamPic/${entry.name}_${entry.id_stream}.jpg`).getSignedUrl(config, function (err, url) {
                    if (err) {
                        console.error(err);
                        return;
                    } else {
                        entry.pic = url;

                        counter++;

                        if (counter === entries.length) {
                            callback();
                        }
                    }
                });
            });
        }
    });
});

app.post('/getUserSuggestedQs', cors(), (req, res) => {
    let limitQuestions = 0;

    let query_fetchSuggestions = `SELECT question_suggestions.id_question, questions.question, questions.suggested_type as type, questions.priority
                                  FROM questions
                                  INNER JOIN question_suggestions ON question_suggestions.id_question = questions.id
                                  WHERE question_suggestions.toia_id = ? AND question_suggestions.isPending = 1
                                  ORDER BY questions.priority DESC;`
    let query_params = [req.body.params.toiaID];

    if (req.body.params.limit !== undefined) {
        limitQuestions = req.body.params.limit;
        query_fetchSuggestions = `SELECT question_suggestions.id_question, questions.question, questions.suggested_type as type, questions.priority
                                  FROM questions
                                  INNER JOIN question_suggestions ON question_suggestions.id_question = questions.id
                                  WHERE question_suggestions.toia_id = ? AND question_suggestions.isPending = 1
                                  ORDER BY questions.priority DESC LIMIT ?;`
        query_params = [req.body.params.toiaID, limitQuestions];
    }


    connection.query(query_fetchSuggestions, query_params, (err, entries) => {
        if (err) {
            throw err;
        } else {
            if (entries.length === 0) {
                res.send([]);
                return;
            }

            let count = 0;

            const config = {
                action: 'read',
                expires: '07-14-2022',
            };

            function callback() {
                res.send(entries);
            }


            // TODO: No longer need thumbnail
            entries.forEach((entry) => {

                // send local storage image when in development
                if (process.env.ENVIRONMENT === "development") {
                    entry.pic = `/Placeholder/questionmark.jpg`;
                    count++;

                    if (count === entries.length) {
                        callback();
                    }
                    return;
                }

                videoStore.file(`Placeholder/questionmark.png`).getSignedUrl(config, function (err, url) {
                    if (err) {
                        console.error(err);
                    } else {
                        entry.pic = url;

                        count++;

                        if (count === entries.length) {
                            callback();
                        }
                    }
                });
            });
        }
    });
});

app.post('/removeSuggestedQ', cors(), (req, res) => {
    // TODO: don't remove. Mark as done
    let query_removeSuggestedQ = `DELETE
                                  FROM question_suggestions
                                  WHERE id_question = "${req.body.params.suggestedQID}";`
    connection.query(query_removeSuggestedQ, (err) => {
        if (err) {
            throw err;
        } else {
            res.send('Deleted successfully!');
        }
    });
});

app.post('/getUserVideos', cors(), (req, res) => {
    let query_userVideos = `SELECT *
                            FROM video
                            WHERE toia_id = "${req.body.params.toiaID}"
                            ORDER BY idx DESC;`;
    connection.query(query_userVideos, (err, entries) => {
        if (err) {
            throw err;
        } else {

            let cnt = 0;

            const config = {
                action: 'read',
                expires: '07-14-2022',
            };

            function callback() {
                res.send(entries);
            }

            if (cnt === entries.length) {
                callback();
            }

            // TODO: Thumbnails not needed anymore
            entries.forEach((entry) => {
                // send local storage image when in development
                if (process.env.ENVIRONMENT === "development") {
                    entry.pic = `/${req.body.params.toiaName}_${req.body.params.toiaID}/VideoThumb/${entry.id_video + ".jpg"}`;
                    cnt++;

                    if (cnt === entries.length) {
                        callback();
                    }
                    return;
                }

                videoStore.file(`Accounts/${req.body.params.toiaName}_${req.body.params.toiaID}/VideoThumb/${entry.id_video}`).getSignedUrl(config, function (err, url) {
                    if (err) {
                        console.error(err);

                    } else {
                        entry.pic = url;
                        cnt++;

                        if (cnt === entries.length) {
                            callback();
                        }
                    }
                });
            });

        }
    });
});

app.post('/getUserStreams', cors(), async (req, res) => {
    let query_userStreams = `SELECT *
                             FROM stream
                             WHERE toia_id = "${req.body.params.toiaID}" 
                             ORDER BY id_stream`;
    connection.query(query_userStreams, async (err, entries) => {
        if (err) {
            throw err;
        } else {
            if (entries.length === 0) throw "No streams!";


            let counter = 0;

            const config = {
                action: 'read',
                expires: '07-14-2022',
            };

            function callback() {
                res.send(entries);
            }

            entries.forEach((entry) => {
                // send local storage image when in development
                if (process.env.ENVIRONMENT === "development") {
                    entry.pic = `/${req.body.params.toiaName}_${req.body.params.toiaID}/StreamPic/${entry.name}_${entry.id_stream}.jpg`;
                    counter++;

                    if (counter === entries.length) {
                        callback();
                    }
                    return;
                }

                // send gcloud image when in production
                videoStore.file(`Accounts/${req.body.params.toiaName}_${req.body.params.toiaID}/StreamPic/${entry.name}_${entry.id_stream}.jpg`).getSignedUrl(config, function (err, url) {
                    if (err) {
                        console.error(err);
                    } else {
                        entry.pic = url;
                        counter++;

                        if (counter === entries.length) {
                            callback();
                        }
                    }
                });
            });

        }
    });

});

app.post('/createNewStream', cors(), (req, res) => {

    let privacySetting = 0;
    let form = new multiparty.Form();

    form.parse(req, function (err, fields, file) {
        if (fields.newStreamName[0] === 'All'){
            res.status(400).send("Stream With Name 'All' Already Exists");
            return;
        }

        if (fields.newStreamPrivacy[0] === 'private') {
            privacySetting = 1;
        }

        let query_createStream = `INSERT INTO stream(name, toia_id, private, likes, views)
                                  VALUES ("${fields.newStreamName[0]}", ${fields.toiaID[0]}, ${privacySetting}, 0, 0)`

        connection.query(query_createStream, async (err, entry) => {
            if (err) {
                throw err;
            } else {

                // save file to local storage during development
                if (process.env.ENVIRONMENT === "development") {
                    let dest = `Accounts/${fields.toiaName[0]}_${fields.toiaID[0]}/StreamPic/`;
                    let destFileName = `${fields.newStreamName[0]}_${entry.insertId}.jpg`;
                    mkdirp(dest).then(() => {
                        fs.rename(file.blob[0].path, dest + destFileName, (error) => {
                            if (error) {
                                console.log(error);
                            }
                        });
                    });
                } else {
                    await videoStore.upload(file.blob[0].path, {
                        destination: `Accounts/${fields.toiaName[0]}_${fields.toiaID[0]}/StreamPic/${fields.newStreamName[0]}_${entry.insertId}.jpg`
                    });
                }

                let query_allStreamsUpdated = `SELECT *
                                               FROM stream
                                               WHERE toia_id = "${fields.toiaID[0]}";`

                connection.query(query_allStreamsUpdated, (err, entries, field) => {
                    if (err) {
                        throw err;
                    } else {

                        let counter = 0;

                        const config = {
                            action: 'read',
                            expires: '07-14-2022',
                        };

                        function callback() {
                            res.send(entries);
                        }


                        entries.forEach((streamEntry) => {

                            // send local storage image when in development
                            if (process.env.ENVIRONMENT === "development") {
                                streamEntry.pic = `/${fields.toiaName[0]}_${fields.toiaID[0]}/StreamPic/${streamEntry.name}_${streamEntry.id_stream}.jpg`;
                                counter++;

                                if (counter === entries.length) {
                                    callback();
                                }
                                return;
                            }

                            videoStore.file(`Accounts/${fields.toiaName[0]}_${fields.toiaID[0]}/StreamPic/${streamEntry.name}_${streamEntry.id_stream}.jpg`).getSignedUrl(config, function (err, url) {
                                if (err) {
                                    console.error(err);
                                } else {
                                    streamEntry.pic = url;

                                    counter++;

                                    if (counter === entries.length) {
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

app.post('/getVideoPlayback', cors(), (req, res) => {

    let query_getTOIAInfo = `SELECT *
                             FROM video
                             INNER JOIN toia_user ON video.toia_id = toia_user.id
                             WHERE video.id_video = ?`;

    connection.query(query_getTOIAInfo, [req.body.params.playbackVideoID], (err, entries) => {
        if (err) {
            throw err;
        } else {
            if (entries.length === 0) {
                res.sendStatus(400);
                return;
            }

            const config = {
                action: 'read',
                expires: '07-14-2022',
            };

            if (process.env.ENVIRONMENT === "development") {
                let vidPrivacy;
                let url = `/${entries[0].first_name}_${entries[0].id}/Videos/${req.body.params.playbackVideoID}`;

                if (entries[0].private === 0) {
                    vidPrivacy = 'Public';
                } else {
                    vidPrivacy = 'Private';
                }

                let dataObj = {
                    videoURL: url,
                    videoAnswer: entries[0].answer,
                    videoPrivacy: vidPrivacy
                }

                res.send(dataObj);
                return;
            }

            videoStore.file(`Accounts/${entries[0].first_name}_${entries[0].id}/Videos/${req.body.params.playbackVideoID}`).getSignedUrl(config, function (err, url) {
                if (err) {
                    console.error(err);
                } else {
                    let vidPrivacy;

                    if (entries[0].private === 0) {
                        vidPrivacy = 'Public';
                    } else {
                        vidPrivacy = 'Private';
                    }

                    let dataObj = {
                        videoURL: url,
                        videoAnswer: entries[0].answer,
                        videoPrivacy: vidPrivacy
                    }

                    res.send(dataObj);
                }
            });
        }
    });
});

app.post('/fillerVideo', cors(), (req, res) => {

    let query_getFiller = `SELECT * FROM questions 
                            INNER JOIN videos_questions_streams ON videos_questions_streams.id_question = questions.id
                            INNER JOIN video ON video.id_video = videos_questions_streams.id_video
                            WHERE video.toia_id = ? AND videos_questions_streams.type = ?`

    connection.query(query_getFiller, [req.body.params.toiaIDToTalk, "filler"], (err, entries) => {
        if (err) {
            throw err;
        } else {
            if (entries.length === 0) {
                res.status(400).send("No Videos");
                return;
            }

            const config = {
                action: 'read',
                expires: '07-14-2022',
            };

            if (process.env.ENVIRONMENT === "development") {
                res.send(`/${req.body.params.toiaFirstNameToTalk}_${req.body.params.toiaIDToTalk}/Videos/${entries[Math.floor(Math.random() * entries.length)].id_video}`);
                return;
            }

            videoStore.file(`Accounts/${req.body.params.toiaFirstNameToTalk}_${req.body.params.toiaIDToTalk}/Videos/${entries[Math.floor(Math.random() * entries.length)].id_video}`).getSignedUrl(config, function (err, url) {
                if (err) {
                    console.error(err);
                } else {
                    res.send(url);
                }
            });
        }
    });
});

app.post('/player', cors(), (req, res) => {
    // TODO: Review DM API calls
    console.log("player question= ", req.body.params.question.current, req.body.params);
    axios.post(`${process.env.DM_ROUTE}`, {
        params: {
            query: req.body.params.question.current,
            avatar_id: req.body.params.toiaIDToTalk,
            stream_id: req.body.params.streamIdToTalk
        }

    }).then((videoDetails) => {

        const config = {
            action: 'read',
            expires: '07-14-2022',
        };


        if (process.env.ENVIRONMENT === "development") {
            console.log(videoDetails.data.id_video)
            if (videoDetails.data.id_video === "204"){
                res.send("error")
                return;
            }
            res.send(`/${req.body.params.toiaFirstNameToTalk}_${req.body.params.toiaIDToTalk}/Videos/${videoDetails.data.id_video}`);
            return;
        }

        videoStore.file(`Accounts/${req.body.params.toiaFirstNameToTalk}_${req.body.params.toiaIDToTalk}/Videos/${videoDetails.data.id_video}`).getSignedUrl(config, function (err, url) {
            if (err) {
                console.error(err);
            } else {
                res.send(url);
            }
        });
    }).catch((err) => {
        res.send("error");
        console.log(err)
    });
});

// All create and update video requests pass through this middleware that performs necessary operation and then falls back to downstream routes
app.use('/recorder', cors(), async (req, res, next) => {
    const form = new multiparty.Form();

    form.parse(req,  (err, fields, file) => {
        req.fields = fields;
        req.file = file;

        // TODO: Delete files
        if (fields.hasOwnProperty('is_editing') && fields.is_editing[0] === 'true'){
            if (!fields.hasOwnProperty('save_as_new')){
                res.status(400).send("Field 'save_as_new' not defined!");
            } else {
                if (fields.save_as_new[0] === 'true'){
                    next();
                } else {
                    if (!fields.hasOwnProperty('old_video_id') || !fields.hasOwnProperty('old_video_type')){
                        res.status(400).send("Old Video ID & Type Not Provided!");
                    } else {
                        const oldVideoID = fields.old_video_id;
                        const oldType = fields.old_video_type;
                        const userId = fields.id[0];

                        let query = `DELETE FROM videos_questions_streams WHERE id_video = ? AND type = ? AND id_video IN (SELECT id_video FROM video WHERE toia_id = ?)`;
                        connection.query(query, [oldVideoID, oldType, userId], async (err, result) => {
                            if (err) throw err;
                            console.log("Deleted old entries!");
                            next();
                        })
                    }
                }
            }
        } else {
            next();
        }
    })
})

app.post('/recorder', cors(), async (req, res) => {
    let isPrivate;
    let vidIndex;
    let videoStreams;

    const fields = req.fields;
    const file = req.file;
    let answer = fields.answer[0].trim();

    // Append the answer with '.' if necessary
    if (answer.slice(-1) !== '.' && answer.slice(-1) !== '!' && answer.slice(-1) !== '?') answer = answer + ".";

    if (fields.private[0] === 'false') {
        isPrivate = 0;
    } else if (fields.private[0] === 'true') {
        isPrivate = 1;
    } else {
        throw new Error("Invalid value for field 'private'");
    }

    videoStreams = JSON.parse(fields.streams[0]);

    let questionsObj = JSON.parse(fields.questions[0]);
    if (questionsObj.length === 0) {
        res.status(400).send("No question supplied!");
        return;
    }

    let query_getNextIndex = `SELECT MAX(idx) AS maxIndex
                              FROM video;`;
    connection.query(query_getNextIndex, async (err, entry, data) => {
        if (err) {
            throw err;
        } else {

            if (entry[0].maxIndex == null) {
                vidIndex = 0;
            } else {
                vidIndex = entry[0].maxIndex + 1;
            }

            crypto.pseudoRandomBytes(32, async function (err, raw) {
                let videoID = fields.name[0] + '_' + fields.id[0] + '_' + vidIndex + '_' + (raw.toString('hex') + Date.now()).slice(0, 8) + '.mp4';

                let bufferStream = new stream.PassThrough();
                bufferStream.end(Buffer.from(fields.thumb[0].replace(/^data:image\/\w+;base64,/, ""), 'base64'));

                if (process.env.ENVIRONMENT === "development") {
                    // Save thumbnail
                    let thumbDest = `Accounts/${fields.name[0]}_${fields.id[0]}/VideoThumb/`;
                    let thumbName = videoID + ".jpg";
                    mkdirp(thumbDest).then(() => {
                        let buf = Buffer.from(fields.thumb[0].replace(/^data:image\/\w+;base64,/, ""), 'base64');
                        fs.writeFile(thumbDest + thumbName, buf, (error) => {
                            if (error) {
                                console.log(error);
                            }
                        });
                    });
                } else {
                    let videoThumbFile = videoStore.file(`Accounts/${fields.name[0]}_${fields.id[0]}/VideoThumb/${videoID}`);

                    bufferStream.pipe(videoThumbFile.createWriteStream({
                        metadata: {
                            contentType: 'image/jpeg'
                        }
                    }))
                        .on('error', function (err) {
                            throw err;
                        })
                        .on('finish', () => {
                            console.log('Thumbnail uploaded!')
                        });
                }


                // save file to local storage during development
                if (process.env.ENVIRONMENT === "development") {
                    let dest = `Accounts/${fields.name[0]}_${fields.id[0]}/Videos/`;
                    let destFileName = videoID;
                    mkdirp(dest).then(() => {
                        fs.rename(file.blob[0].path, dest + destFileName, (error) => {
                            if (error) {
                                console.log(error);
                            }
                        });
                    });
                } else {
                    // save file to google cloud when in production
                    await videoStore.upload(file.blob[0].path, {
                        destination: `Accounts/${fields.name[0]}_${fields.id[0]}/Videos/${videoID}`
                    });
                }

                let query_saveVideo = `INSERT INTO video(id_video, toia_id, idx, private, answer, language, likes, views)
                                       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;

                connection.query(query_saveVideo, [videoID, fields.id[0], vidIndex, isPrivate, answer, fields.language[0], 0, 0], async (err) => {
                    if (err) {
                        throw err;
                    } else {
                        console.log("Video entry created in database");

                        for (const q of questionsObj) {
                            let q_id = q.id_question || -1;
                            let questionInfo = await getQuestionInfo(q_id);

                            if (questionInfo && questionInfo.question !== q.question){
                                q_id = -1;
                            }

                            if (await isSuggestedQuestion(q_id, fields.id[0])) {
                                console.log("Recorded a suggested question!");
                                await suggestionSetPending(q_id, fields.id[0], false);
                            } else {
                                let on_board = await isOnBoardingQuestion(q_id);
                                if (!on_board || (on_board && await isRecorded(q_id, fields.id[0]))) {
                                    console.log("Added question manually!");
                                    q_id = await addQuestion(q.question, fields.videoType[0]);
                                } else {
                                    console.log("Recorded an on-boarding question!");
                                }
                            }

                            for (const streamToLink of videoStreams) {
                                await linkStreamVideoQuestion(streamToLink.id, videoID, q_id, fields.videoType[0]);
                            }

                            //Generate suggested questions
                            if (await shouldTriggerSuggester(q_id) && (fields.hasOwnProperty('is_editing') && fields.is_editing[0] === 'true')) {
                                axios.post(`${process.env.Q_API_ROUTE}`, {
                                    qa_pair: q.question + " " + answer,
                                    callback_url: req.protocol + '://' + req.get('host') + "/saveSuggestedQuestion/" + fields.id[0]
                                }).catch(function (error) {
                                    console.log("=============== Error with Q_API ============")
                                    console.log(error);
                                });
                            }
                        }

                        res.send("Success");
                    }
                });
            });
        }
    });
});

app.post('/getLastestQuestionSuggestion', cors(), (req, res) => {
    const query_fetchSuggestions = `SELECT question_suggestions.id_question, questions.question, questions.suggested_type as type
                                  FROM question_suggestions
                                  INNER JOIN questions ON questions.id = question_suggestions.id_question
                                  WHERE question_suggestions.toia_id = ? AND question_suggestions.isPending = 1
                                  ORDER BY question_suggestions.id_question DESC LIMIT 1;`;
    connection.query(query_fetchSuggestions, [req.body.params.toiaID], (err, entries) => {
        if (err) throw err;
        if (entries.length === 0) {
            res.sendStatus(404);
            return;
        }

        let count = 0;

        const config = {
            action: 'read',
            expires: '07-14-2022',
        };

        function callback() {
            res.send(entries[0]);
        }

        // TODO: Won't need thumbnails
        entries.forEach((entry) => {

            // send local storage image when in development
            if (process.env.ENVIRONMENT === "development") {
                entry.pic = `/Placeholder/questionmark.jpg`;
                count++;

                if (count === entries.length) {
                    callback();
                }
                return;
            }

            videoStore.file(`Placeholder/questionmark.png`).getSignedUrl(config, function (err, url) {
                if (err) {
                    throw err;
                } else {
                    entry.pic = url;

                    count++;

                    if (count === entries.length) {
                        callback();
                    }
                }
            });
        });
    })
});

app.post('/saveSuggestedQuestion/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    isValidUser(user_id).then((success) => {
        if (req.body.q === undefined) {
            res.sendStatus(400);
            return;
        }
        saveSuggestedQuestion(user_id, req.body.q).then(() => {
            res.sendStatus(200);
        }, () => {
            res.sendStatus(500);
        })
    }, (reject) => {
        if (reject === false) console.log("Provided user id doesn't exist");
        res.sendStatus(404);
    })
})

app.get('/questions/onboarding/:user_id/pending', (req, res) => {
    const user_id = req.params.user_id;
    isValidUser(user_id).then(() => {
        let query = `SELECT id, question, suggested_type as type, onboarding, priority, trigger_suggester FROM questions WHERE onboarding = 1 AND id NOT IN (SELECT videos_questions_streams.id_question as id FROM videos_questions_streams INNER JOIN video ON videos_questions_streams.id_video = video.id_video WHERE video.toia_id = ?)`;
        connection.query(query, [user_id], (err, entries) => {
            if (err) throw err;
            res.send(entries);
        })
    }, (reject) => {
        if (reject === false) console.log("Provided user id doesn't exist");
        res.sendStatus(404);
    })
})

app.get('/questions/onboarding/:user_id/completed', (req, res) => {
    const user_id = req.params.user_id;
    isValidUser(user_id).then(() => {
        let query = `SELECT id, question, suggested_type as type, onboarding, priority, trigger_suggester FROM questions 
                    WHERE onboarding = 1 AND id IN (SELECT videos_questions_streams.id_question as id FROM videos_questions_streams
                                                                                                    INNER JOIN video ON videos_questions_streams.id_video = video.id_video WHERE video.toia_id = ?)`;
        connection.query(query, [user_id], (err, entries) => {
            if (err) throw err;
            res.send(entries);
        })
    }, (reject) => {
        if (reject === false) console.log("Provided user id doesn't exist");
        res.sendStatus(404);
    })
})

app.get('/questions/suggestions/:user_id/pending', (req, res) => {
    const user_id = req.params.user_id;
    isValidUser(user_id).then(() => {
        let query = `SELECT id, question, suggested_type as type, onboarding, priority, trigger_suggester FROM questions 
                    INNER JOIN question_suggestions ON questions.id = question_suggestions.id_question 
                    WHERE question_suggestions.toia_id = ? AND isPending = 1`;
        connection.query(query, [user_id], (err, entries) => {
            if (err) throw err;
            res.send(entries);
        })
    }, (reject) => {
        if (reject === false) console.log("Provided user id doesn't exist");
        res.sendStatus(404);
    })
})

app.post('/questions/answered/delete', (req, res) => {
    const user_id = req.body.user_id || null;
    const ques_id = req.body.question_id  || null;
    const video_id = req.body.video_id || null;

    if (!user_id || !ques_id || !video_id){
        res.sendStatus(400);
        return;
    }

    isValidUser(user_id).then(()=>{
        let query = `DELETE FROM videos_questions_streams WHERE id_video = ? AND id_question = ? AND id_video IN (SELECT id_video FROM video WHERE toia_id = ?)`;
        connection.query(query, [video_id, ques_id, user_id], (err, result) => {
            if (err) throw err;
            console.log("Deleted video_id: " + video_id + " question_id: " + ques_id + " of user_id: " + user_id);
            res.sendStatus(200);
        })
    }, (reject) => {
        if (reject === false) console.log("Provided user id doesn't exist");
        res.sendStatus(404);
    })
})

app.get('/questions/answered/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    isValidUser(user_id).then(() => {
        let query = `SELECT questions.*, videos_questions_streams.type, videos_questions_streams.id_video FROM questions 
                    INNER JOIN videos_questions_streams ON videos_questions_streams.id_question = questions.id 
                    WHERE videos_questions_streams.id_video IN (SELECT id_video FROM video WHERE toia_id = ?)`;
        connection.query(query, [user_id], (err, entries) => {
            if (err) throw err;
            res.send(entries);
        })
    }, (reject) => {
        if (reject === false) console.log("Provided user id doesn't exist");
        res.sendStatus(404);
    })
})

app.get('/questions/answered/:user_id/:stream_id', (req, res) => {
    const user_id = req.params.user_id;
    const stream_id = req.params.stream_id;
    isValidUser(user_id).then(() => {
        let query = `SELECT questions.*, videos_questions_streams.id_video, videos_questions_streams.type FROM questions INNER JOIN videos_questions_streams ON videos_questions_streams.id_question = questions.id WHERE videos_questions_streams.id_stream = ?`;
        connection.query(query, [stream_id], (err, entries) => {
            if (err) throw err;
            res.send(entries);
        })
    }, (reject) => {
        if (reject === false) console.log("Provided user id doesn't exist");
        res.sendStatus(404);
    })
})

app.get('/videos/:user_id/', async (req, res) => {
    const user_id = req.params.user_id;
    const video_id = req.query.video_id || null;
    const type = req.query.type || null;

    isValidUser(user_id).then(() => {
        let query = `SELECT * FROM videos_questions_streams WHERE id_video = ? AND id_video IN (SELECT id_video FROM video WHERE toia_id = ?) AND type = ?`;
        connection.query(query, [video_id, user_id, type], async (err, entries) => {
            if (err) throw err;
            let unique_questions = entries.filter((entry, index) => entries.findIndex((s) => entry.id_question === s.id_question) === index);
            let unique_streams = entries.filter((entry, index) => entries.findIndex((s) => entry.id_stream === s.id_stream) === index);

            let questions_list = [];
            let streams_list = [];
            for (const q of unique_questions) {
                let tmp = await getQuestionInfo(q.id_question);
                if (tmp) {
                    questions_list.push(tmp);
                }
            }

            for (const s of unique_streams) {
                let tmp = await getStreamInfo(s.id_stream);
                if (tmp) {
                    streams_list.push(tmp);
                }
            }

            let response_obj = {
                video_id: video_id,
                type: type,
                questions: questions_list,
                streams: streams_list
            }

            res.send(response_obj);
        });
    }, (reject) => {
        if (reject === false) console.log("Provided user id doesn't exist");
        res.sendStatus(404);
    })
});

//getting user data to populate settings 
app.post('/getUserData', cors(), (req, res) =>{
    let query_getUserData = `SELECT *
                                FROM toia_user
                                WHERE id = "${req.body.params.toiaID}";`
    connection.query(query_getUserData, (err, entries, fields) => {
        if (err){
            throw err;
        } 
        console.log("user data sent!")
        res.send(Object.values(entries))
        
    })
})

app.post('/transcribeAudio', cors(), async (req, res)=>{
    // transcribing audio
    streamStarted = true;

    FinishTrancription()
    await createStream(req, res);
    
    await transcribeAudio(req, res);

    //setTimeout(FinishTrancription, 200);
    
    //res.end();
    return;
})

// transcription for frontend
// app.post('/getTranscribedAudio', cors(), async (req, res)=>{
//     // transcribing audio
//     streamStarted = true;
//     FinishTrancription()
    
//     await createStream(req, res);
//     await transcribeAudio(req, res);
//     console.log("frontend: ", responseChunks)
    
//     //return;
    
// })

app.post('/endTranscription', cors(), async (req, res)=>{
    FinishTrancription();
    //console.log("returned responses: ", speech_to_text.returnResponses())
    let response = "";
    let noSpaces = [];
    //console.log(responseChunks)
    responseChunks.forEach(elem => noSpaces.push(elem.trim()))

    let uniqueChars = [...new Set(noSpaces)];
    //console.log("set elements: ", uniqueChars);
    await uniqueChars.forEach(elem => response +=  (elem + " ")); //res.write(elem));
    //console.log("response: ", response);
    
    return res.send(response);//res.end() 
})

app.use('/tracker', Tracker);

module.exports = app;