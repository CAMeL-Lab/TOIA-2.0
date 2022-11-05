const app = require('../server');
const request = require('supertest');
const assert = require("assert");
const connection = require('../configs/db-connection');
const onBoardingQs = require('../configs/onboarding-questions.json');
const _ = require("lodash");
const fs = require("fs");
const path = require("path");
const { record } = require('node-record-lpcm16');

// connection.query("begin;");


// Note: Sometimes the values returned in response
// will be in res.text or res.body instead of res.data.

const user = {
    firstName: '0A_TEST',
    lastName: 'DELETE',
    email: 'someone1249@example.com',
    pwd: "123",
    wrong_pwd: "1234",
    language: 'ENG',
    profile_pic: path.join(__dirname , "./test_files/avatar.jpg"), // PATH to any image file
    // video: path.join(__dirname , "./test_files/sample_video.mp4"), // Path to any video file
    // videoType: 'greeting'
};

const user_videos = {
    filler_1: {
        video: path.join(__dirname , "./test_files/filler_1.mp4"),
        answer: ".",
        videoType: 'filler',
    },
    filler_2: {
        video: path.join(__dirname , "./test_files/filler_2.mp4"),
        answer: ".",
        videoType: 'filler',
    },
    filler_3: {
        video: path.join(__dirname , "./test_files/filler_3.mp4"),
        answer: ".",
        videoType: 'filler',
    },
    filler_4: {
        video: path.join(__dirname , "./test_files/filler_4.mp4"),
        answer: ".",
        videoType: 'filler',
    },
    answer_1: {
        video: path.join(__dirname , "./test_files/answer_16.mp4"),
        answer: "My name is Muhammad Ali.",
        videoType: 'answer',
    },
    answer_2: {
        video: path.join(__dirname , "./test_files/answer_17.mp4"),
        answer: "I was born in Pakistan in the city of Faisalabad on the 28th of August 2001.",
        videoType: 'answer',
    },
    answer_3: {
        video: path.join(__dirname , "./test_files/answer_18.mp4"),
        answer: "Currently, I\'m a student at NYU Abu Dhabi and  I am double majoring in Mathematics and Computer Science.",
        videoType: 'answer',
    },
    greeting: {
        video: path.join(__dirname , "./test_files/greeting.mp4"),
        answer: "Hi there.",
        videoType: 'answer',
    },
}

const wrong_user = {
    email: 'iDoNotExist@someWrongDomain.com',
    pwd: "123",
    toia_id: "-1",
};

const stream = {
    name: "Cool Stream",
    display_pic: path.join(__dirname, "./test_files/avatar.jpg"),   // PATH to any image file
    privacy: "public"
};

const custom_questions = [
    {
        "question":"Will this test run well?"
    },
    {
        "question":"Hey, how was the trip?"
    },
    {
        "question":"So, what's up?"
    }
]

const dummy_answer = "I hope these tests run well!";

// 10 out of 33 routes being tested

// jest.setTimeout(20000);
// User Registration & Login
describe('register', () => {

    it('returns 200 if user is registered', (done) => {
        request(app)
            .post('/api/createTOIA')
            .attach('blob', user.profile_pic)
            .field('firstName', user.firstName)
            .field('lastName', user.lastName)
            .field('email', user.email)
            .field('pwd', user.pwd)
            .field('language', user.language)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                expect(res.body.first_name).toEqual(user.firstName);
                user.toia_id = res.body.new_toia_ID;
                return done();
            });
    });

    it('returns 400 if email already there', (done) => {
        request(app)
            .post('/api/createTOIA')
            .attach('blob', user.profile_pic)
            .field('firstName', user.firstName)
            .field('lastName', user.lastName)
            .field('email', user.email)
            .field('pwd', user.pwd)
            .field('language', user.language)
            .expect(400)
            .end(function(err, res) {
                if (err) return done(err);
                expect(res.text).toEqual('Email already exists');
                return done();
            });
    });
});

// Login
describe('login', () => {

    // let body = {"email": user.email, "pwd": user.pwd};

    it('returns 200 if user has logged in', (done) => {
        request(app)
            .post('/api/login')
            // .send({"body": {email: user.email, pwd: user.pwd}})
            .send({
                "email": user.email, 
                "pwd": user.pwd
            })
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                if (res.text == "-1") return done("No such user");
                if (res.text == "-2") return done("Wrong password")
                expect(res.body.toia_id).toEqual(user.toia_id);
                expect(res.body.firstName).toEqual(user.firstName);
                return done();
            });
    });

    it('returns -1 in body if email does not exist', (done) => {
        request(app)
            .post('/api/login')
            .send({"email": wrong_user.email, "pwd": wrong_user.pwd})
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                expect(res.text).toEqual('-1');
                return done();
            });
    });

    it('returns -2 in body if the password is wrong', (done) => {
        // body.pwd = user.wrong_pwd; // change pwd in body to the wrong pwd
        request(app)
            .post('/api/login')
            .send({
                "email": user.email, 
                "pwd": user.wrong_pwd
            })
            // .field('email', user.email)
            // .field('pwd', user.wrong_pwd)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                expect(res.text).toEqual('-2');
                return done();
            });
    });
});


// Streams
describe('GET /getAllStreams', () => {
    it('returns at least one stream', (done) => {
        request(app)
            .get('/api/getAllStreams')
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                expect(res.body.length).toBeGreaterThanOrEqual(1);
                done();
            });
    });
});

let totalStreams;
let allStreams;
describe('GET /getUserStreams', () => {
    it('returns one stream with name All', (done) => {
        request(app)
            .post('/api/getUserStreams')
            .send({
                "params":{
                    "toiaID":user.toia_id,
                }
            })
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                expect(res.body[0].toia_id).toEqual(user.toia_id);
                expect(res.body[0].name).toEqual("All");
                // assert(res.body[0].toia_id === user.toia_id);
                totalStreams = res.body.length;
                allStreams = res.body;
                done();
            });
    });

    it('returns error when given invalid toia id', (done) => {
        request(app)
            .post('/api/getUserStreams')
            .send({
                "params":{
                    "toiaID":wrong_user.toia_id,
                }
            })
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                expect(res.text).toEqual("No streams!");
                done();
            });
    });
});

describe('GET /createNewStream', () => {
    it('returns list of all streams including new one', (done) => {
        request(app)
            .post('/api/createNewStream')
            .attach('blob', stream.display_pic)
            .field('toiaName', user.firstName)
            .field('toiaID', user.toia_id)
            .field('newStreamName', stream.name)
            .field('newStreamPrivacy', stream.privacy)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                totalStreams++;
                allStreams = res.body;
                expect(res.body.length).toEqual(totalStreams);
                for (const stream of res.body){
                    expect(stream.toia_id).toEqual(user.toia_id);
                }
                done();
            });
    });
});

describe('GET /getUserStreams (check if adding new stream has worked)', () => {
    it('returns all streams of a user', (done) => {
        request(app)
            .post('/api/getUserStreams')
            .send({
                "params":{
                    "toiaID":user.toia_id,
                    "toiaName":user.firstName
                }
            })
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                // assert(res.body.length === totalStreams);
                expect(res.body.length).toEqual(totalStreams);
                for (const stream of res.body){
                    expect(stream.toia_id).toEqual(user.toia_id);
                    // assert(stream.toia_id === user.toia_id);
                }
                userStreams = res.body;
                done();
            });
    })
});

// On-boarding Questions
let onBoardingQuestions = [];
describe('GET /questions/onboarding/:user_id/pending', () => {
    it('returns on-boarding questions', (done) => {
        request(app)
            .get(`/api/questions/onboarding/${user.toia_id}/pending`)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);

                // assert(res.body.length === onBoardingQs.length);
                expect(res.body.length).toEqual(onBoardingQs.length);
                onBoardingQuestions = [...res.body];
                // console.log(onBoardingQuestions);

                let resCopy = _.cloneDeep(res.body);
                for (let i = 0; i < resCopy.length; i++){
                    delete resCopy[i].id
                    delete resCopy[i].onboarding
                    resCopy[i].trigger_suggester = (resCopy[i].trigger_suggester === 1)
                }

                assert(_.isEqual(resCopy, onBoardingQs));
                done();
            });
    })
});

describe('GET /questions/onboarding/:user_id/completed', () => {
    it('returns empty array', (done) => {
        request(app)
            .get(`/api/questions/onboarding/${user.toia_id}/completed`)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);

                // assert(res.body.length === 0);
                expect(res.body.length).toEqual(0);
                done();
            });
    })
});

// Suggestions
describe('GET /questions/suggestions/:user_id/pending/', () => {
    it('returns empty array', (done) => {
        request(app)
            .get(`/api/questions/suggestions/${user.toia_id}/pending`)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);

                // assert(res.body.length === 0);
                expect(res.body.length).toEqual(0);
                done();
            });
    })
});

describe('POST /saveSuggestedQuestion/:user_id', () => {
    it('returns empty array', (done) => {
        request(app)
            .post(`/api/saveSuggestedQuestion/${user.toia_id}`)
            .send({"q":custom_questions[0].question})
            .expect(200)
            .end(function (err){
                if (err) return done(err);
                done();
            });
    })
});

describe('POST /getLastestQuestionSuggestion', () => {
    it('returns latest question suggestion object', (done) => {
        request(app)
            .post(`/api/getLastestQuestionSuggestion`)
            .send({
                params: {
                    toiaID: user.toia_id
                }
            })
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                expect(res.body.question).toEqual(custom_questions[0].question);
                done();
            });
    });
    it('returns 404 on wrong toia id', (done) => {
        request(app)
            .post(`/api/getLastestQuestionSuggestion`)
            .send({
                params: {
                    toiaID: -1,
                }
            })
            .expect(404)
            .end(function (err, res){
                if (err) return done(err);
                done();
            });
    });
});

describe('POST /getUserSuggestedQs', () => {
    it('returns non-empty array', (done) => {
        request(app)
            .post(`/api/getUserSuggestedQs`)
            .send({
                "params":{
                    "toiaID":user.toia_id,
                }
            })
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                expect(res.body.length).toBeGreaterThanOrEqual(1);
                done();
            });
    })
});

// let suggested_questions = onBoardingQuestions;
describe('GET /questions/suggestions/:user_id/pending/ (check if adding new question suggestion worked)', () => {
    it('returns array with 1 question object', (done) => {
        request(app)
            .get(`/api/questions/suggestions/${user.toia_id}/pending`)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);

                // assert(res.body.length === 1);
                expect(res.body.length).toEqual(1);
                // assert(res.body[0].question === custom_questions[0].question);
                expect(res.body[0].question).toEqual(custom_questions[0].question);
                // assert(res.body[0].trigger_suggester === 1);
                expect(res.body[0].trigger_suggester).toEqual(1);

                
                // suggested_questions = res.body;
                // console.log(suggested_questions);
                done();
            });
    })
});

// Video Recorder
let recordedQuestions = [];
describe('POST /recorder', () => {

    // Record the first onboarding question: What is your name?
    it('returns status 200 and message "Success"', (done) => {
        let thumb_base64 = fs.readFileSync(user.profile_pic, 'base64');
        // const lastSuggested = {
        //     id_question: suggested_questions[0].id,
        //     question: suggested_questions[0].question
        // }

        // Q: What is your name?
        expect(onBoardingQuestions[15].question).toEqual("What is your name?");
        expect(onBoardingQuestions[15].id).toEqual(16);
        const onBoardingQuestion16 = {
            id_question: onBoardingQuestions[15].id,
            question: onBoardingQuestions[15].question
        }
        // const quesToSend = [lastSuggested, ...custom_questions];
        const quesToSend = [onBoardingQuestion16];

        let userStreamsCopy = userStreams.map((s) => {
            return {
                id: s.id_stream,
                name: s.name
            }
        });

        request(app)
            .post('/api/recorder')
            .set("Content-type", "multipart/form-data")
            .attach('blob', user_videos.answer_1.video)
            .field('thumb', thumb_base64)
            .field('id', user.toia_id)
            .field('name', user.firstName)
            .field('language', user.language)
            .field('questions', JSON.stringify(quesToSend))
            .field('answer', user_videos.answer_1.answer)
            // .field('videoType', user.videoType)
            .field('videoType', user_videos.answer_1.videoType)
            .field('private', false)
            .field('streams', JSON.stringify(userStreamsCopy))
            .field('video_duration', 2)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                expect(res.text).toEqual('Success');
                recordedQuestions.push(onBoardingQuestions[15].question);
                done();
            });
    });

    // Record another onboarding question: Where and when were you born?
    it('returns status 200 and message "Success"', (done) => {
        let thumb_base64 = fs.readFileSync(user.profile_pic, 'base64');
        // const lastSuggested = {
        //     id_question: suggested_questions[0].id,
        //     question: suggested_questions[0].question
        // }

        // Q: What is your name?
        expect(onBoardingQuestions[16].question).toEqual("Where and when were you born?");
        expect(onBoardingQuestions[16].id).toEqual(17);
        const onBoardingQuestion17 = {
            id_question: 17,
            question: "Where and when were you born?"
        }
        // const quesToSend = [lastSuggested, ...custom_questions];
        const quesToSend = [onBoardingQuestion17];

        let userStreamsCopy = userStreams.map((s) => {
            return {
                id: s.id_stream,
                name: s.name
            }
        });

        request(app)
            .post('/api/recorder')
            .set("Content-type", "multipart/form-data")
            .attach('blob', user_videos.answer_2.video)
            .field('thumb', thumb_base64)
            .field('id', user.toia_id)
            .field('name', user.firstName)
            .field('language', user.language)
            .field('questions', JSON.stringify(quesToSend))
            .field('answer', user_videos.answer_2.answer)
            // .field('videoType', user.videoType)
            .field('videoType', user_videos.answer_2.videoType)
            .field('private', false)
            .field('streams', JSON.stringify(userStreamsCopy))
            .field('video_duration', 2)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                expect(res.text).toEqual('Success');
                recordedQuestions.push(onBoardingQuestions[16].question);
                done();
            });
    });

    // Record another onboarding question: What do you do for a living?
    it('returns status 200 and message "Success"', (done) => {
        let thumb_base64 = fs.readFileSync(user.profile_pic, 'base64');
        // const lastSuggested = {
        //     id_question: suggested_questions[0].id,
        //     question: suggested_questions[0].question
        // }

        // Q: What is your name?
        expect(onBoardingQuestions[17].question).toEqual("What do you do for a living?");
        expect(onBoardingQuestions[17].id).toEqual(18);
        const onBoardingQuestion18 = {
            id_question: onBoardingQuestions[17].id,
            question: onBoardingQuestions[17].question
        }
        // const quesToSend = [lastSuggested, ...custom_questions];
        const quesToSend = [onBoardingQuestion18];

        let userStreamsCopy = userStreams.map((s) => {
            return {
                id: s.id_stream,
                name: s.name
            }
        });

        request(app)
            .post('/api/recorder')
            .set("Content-type", "multipart/form-data")
            .attach('blob', user_videos.answer_3.video)
            .field('thumb', thumb_base64)
            .field('id', user.toia_id)
            .field('name', user.firstName)
            .field('language', user.language)
            .field('questions', JSON.stringify(quesToSend))
            .field('answer', user_videos.answer_3.answer)
            // .field('videoType', user.videoType)
            .field('videoType', user_videos.answer_3.videoType)
            .field('private', false)
            .field('streams', JSON.stringify(userStreamsCopy))
            .field('video_duration', 2)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                expect(res.text).toEqual('Success');
                recordedQuestions.push(onBoardingQuestions[17].question);
                done();
            });
    });
});

let answeredQuestionsForAllStreams;
describe('GET /questions/answered/:user_id', () => {
    it('returns answered questions for all streams', (done) => {
        request(app)
            .get(`/api/questions/answered/${user.toia_id}`)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);

                expect(res.body.length).toEqual(6); // 3 videos recorded on both streams
                answeredQuestionsForAllStreams = res.body;
                // Check if first question is "What is your name"
                expect(res.body[0].question).toEqual("What is your name?");
                done();
            });
    });

    it('returns 404 for invalid toia id', (done) => {
        request(app)
            .get(`/api/questions/answered/${wrong_user.toia_id}`)
            .expect(404)
            .end(function (err, res){
                if (err) return done(err);
                done();
            });
    });
});

let answeredQuestionsFor1stStream;
let answeredQuestionsFor2ndStream;
describe('GET /questions/answered/:user_id/:stream_id', () => {
    it('returns answered questions for 1st stream', (done) => {
        request(app)
            .get(`/api/questions/answered/${user.toia_id}/${allStreams[0].id_stream}`)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);

                expect(res.body.length).toEqual(3); // 3 videos recorded in that stream
                answeredQuestionsFor1stStream = res.body;
                // Check if first question is "What is your name"
                expect(res.body[0].question).toEqual("What is your name?");
                done();
            });
    });
    it('returns answered questions for 2nd stream', (done) => {
        request(app)
            .get(`/api/questions/answered/${user.toia_id}/${allStreams[1].id_stream}`)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);

                expect(res.body.length).toEqual(3); // 3 videos recorded in that stream
                answeredQuestionsFor2ndStream = res.body;
                // Check if first question is "What is your name"
                expect(res.body[0].question).toEqual("What is your name?");
                done();
            });
    });
    it('returns 404 for invalid toia id', (done) => {
        request(app)
            .get(`/api/questions/answered/-1/${allStreams[1].id_stream}`)
            .expect(404)
            .end(function (err, res){
                if (err) return done(err);
                done();
            });
    });
    it('returns empty array for invalid stream id', (done) => {
        request(app)
            .get(`/api/questions/answered/${user.toia_id}/-1`)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                expect(res.body.length).toEqual(0);
                done();
            });
    });
});

// let avatarVideos;
// describe('GET /videos/:user_id with query params', () => {
//     it('returns all video urls for toia user', (done) => {
//         request(app)
//             .get(`/api/videos/${user.toia_id}`)
//             .expect(200)
//             .end(function (err, res){
//                 if (err) return done(err);
//                 console.log("==============");
//                 console.log(res.body);
//                 expect(res.body.length).toEqual(3); // 3 videos recorded in total
//                 avatarVideos = res.body;
//                 // Check if the first video answers the question "What is your name?"
//                 expect(res.body[0].questions[0]).toEqual("What is your name?");
//                 done();
//             });
//     });

//     it('returns 404 for invalid toia id', (done) => {
//         request(app)
//             .get(`/api/videos/-1`)
//             .expect(404)
//             .end(function (err, res){
//                 if (err) return done(err);
//                 done();
//             });
//     });
// });

describe('GET /getSmartQuestions', () => {
    it('returns max 5 questions from db (dumb suggestion)', (done) => {
        request(app)
            .post(`/api/getSmartQuestions`)
            .send({
                params: {
                    avatar_id: user.toia_id,
                    stream_id: allStreams[0].id_stream,
                }
            })
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);

                expect(res.body.length).toEqual(3); // 3 videos recorded on both streams
                //  Since only 3 questions have been answered, we expect those 3 questions to be suggested
                for (let i = 0; i < recordedQuestions.length; i++){
                    expect(res.body[i]).toEqual(recordedQuestions[i]);
                }
                done();
            });
    });

    it('returns 404 for invalid toia id', (done) => {
        request(app)
            .get(`/api/questions/answered/-1`)
            .expect(404)
            .end(function (err, res){
                if (err) return done(err);
                done();
            });
    });
});

// Videos
let videos;
describe('POST /getUserVideos', () => {
    it('returns 3 video', (done) => {
        request(app)
            .post(`/api/getUserVideos`)
            .send({
                "params":{
                    "toiaID":user.toia_id,
                }
            })
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                videos = [...res.body];
                let totalVideos = res.body.length;
                expect(totalVideos).toEqual(3);

                // Check if video ids line up
                for (let i = 0; i < totalVideos; i++){
                    expect(res.body[totalVideos-i-1].id_video).toEqual(answeredQuestionsFor1stStream[i].id_video);
                }
                
                done();
            });
    });
});

describe('POST /getUserVideosCount', () => {
    it('returns a count of 3 videos', (done) => {
        request(app)
            .post(`/api/getUserVideosCount`)
            .send({
                "user_id":user.toia_id,
            })
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                expect(res.body.count).toEqual(3);
                done();
            });
    });
});

describe('POST /getTotalVideoDuration', () => {
    it('returns ~2 seconds', (done) => {
        request(app)
            .post(`/api/getTotalVideoDuration`)
            .send({
                "user_id":user.toia_id,
            })
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                expect(res.body.total_duration).toEqual(6); // 3 videos, 2 second each = 6 total seconds
                done();
            });
    });
});


describe('POST /getStreamVideosCount', () => {
    it('returns a count of 3 videos', (done) => {
        request(app)
            .post(`/api/getStreamVideosCount`)
            .send({
                user_id: user.toia_id,
                stream_id: allStreams[0].id_stream,
            })
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                expect(res.body.count).toEqual(3); // 3 videos
                done();
            });
    });
    it('returns 404 on invalid toia id', (done) => {
        request(app)
            .post(`/api/getStreamVideosCount`)
            .send({
                user_id: -1,
                stream_id: allStreams[0].id_stream,
            })
            .expect(404)
            .end(function (err){
                if (err) return done(err);
                done();
            });
    });
});


describe('POST /getAdaSearch', () => {
    // it('returns empty body with 200', (done) => {
    //     request(app)
    //         .post(`/api/getAdaSearch`)
    //         .send({
    //             "video_id":videos[0].id,
    //             "question_id": 18,
    //         })
    //         .expect(200)
    //         .end(function (err, res){
    //             if (err) return done(err);
    //             expect(res.body).toEqual("");  // 1024 is the ada_search vector length
    //             done();
    //         });
    // });
    it('returns 403 on wrong question id', (done) => {
        request(app)
            .post(`/api/getAdaSearch`)
            .send({
                "video_id":videos[0].id,
                "question_id": -1,
            })
            .expect(403)
            .end(function (err, res){
                if (err) return done(err);
                done();
            });
    });
    it('returns 403 on wrong video id', (done) => {
        request(app)
            .post(`/api/getAdaSearch`)
            .send({
                "video_id":-1,
                "question_id": 18,
            })
            .expect(403)
            .end(function (err, res){
                if (err) return done(err);
                done();
            });
    });
});

// describe('POST /saveAdaSearch', () => {
//     it('returns ~2 seconds', (done) => {
//         request(app)
//             .post(`/api/saveAdaSearch`)
//             .send({
//                 "video_id":videos[0].id,
//                 "question_id":user.video_id,
//                 "data": new Array(1024).fill(0), // 1024 is the ada_search vector length
//             })
//             .expect(200)
//             .end(function (err, res){
//                 if (err) return done(err);
//                 done();
//             });
//     });
// });

// describe('POST /getAdaSearch', () => {
//     it('returns ~2 seconds', (done) => {
//         request(app)
//             .post(`/api/getAdaSearch`)
//             .send({
//                 "video_id":videos[0].id,
//                 "question_id":user.video_id,
//             })
//             .expect(200)
//             .end(function (err, res){
//                 if (err) return done(err);
//                 const array_length = JSON.parse(res.body).length;
//                 expect(array_length).toEqual(1024);  // 1024 is the ada_search vector length
//                 done();
//             });
//     });
// });

describe('GET /questions/answered/delete', () => {
    // CAUTION: Deletes video in all streams where it is present
    it('deletes 1 question from the 2nd stream', (done) => {
        request(app)
            .post(`/api/questions/answered/delete`) 
            .send({
                user_id: user.toia_id,
                question_id: answeredQuestionsFor2ndStream[0].id,
                video_id: answeredQuestionsFor2ndStream[0].id_video,
            })
            .expect(200)
            .end(function (err){
                if (err) return done(err);
                answeredQuestionsFor2ndStream.shift();
                done();
            });
    });
    it('returns 404 for invalid toia id', (done) => {
        request(app)
            .post(`/api/questions/answered/delete`)
            .send({
                user_id: -1,
                question_id: answeredQuestionsFor2ndStream[0].id,
                video_id: answeredQuestionsFor2ndStream[0].id_video,
            })
            .expect(404)
            .end(function (err){
                if (err) return done(err);
                done();
            });
    });
    it('returns 404 for invalid question id', (done) => {
        request(app)
            .post(`/api/questions/answered/delete`)
            .send({
                user_id: user.toia_id,
                question_id: -1,
                video_id: answeredQuestionsFor2ndStream[0].id_video,
            })
            .expect(404)
            .end(function (err){
                if (err) return done(err);
                done();
            });
    });
    // CAUTION: fails when video_id is not string
    it('returns 404 for invalid video id', (done) => {
        request(app)
            .post(`/api/questions/answered/delete`)
            .send({
                user_id: user.toia_id,
                question_id: answeredQuestionsFor2ndStream[0].id,
                video_id: "-1",
            })
            .expect(404)
            .end(function (err){
                if (err) return done(err);
                done();
            });
    });
    it('returns 400 for null toia id', (done) => {
        request(app)
            .post(`/api/questions/answered/delete`)
            .send({
                question_id: answeredQuestionsFor2ndStream[0].id,
                video_id: answeredQuestionsFor2ndStream[0].id_video,
            })
            .expect(400)
            .end(function (err){
                if (err) return done(err);
                done();
            });
    });
});

// /permission/stream
describe('GET /permission/stream', () => {
    it('allows toia user to access 1st stream', (done) => {
        request(app)
            .post(`/api/permission/stream`)
            .send({
                user_id: user.toia_id,
                stream_id: allStreams[0].id_stream,
            })
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                done();
            });
    });

    it('allows toia user to access 2nd stream', (done) => {
        request(app)
            .post(`/api/permission/stream`)
            .send({
                user_id: user.toia_id,
                stream_id: allStreams[1].id_stream,
            })
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                done();
            });
    });

    it('returns 401 for invalid toia id', (done) => {
        request(app)
            .post(`/api/permission/stream`)
            .send({
                user_id: -1,
                stream_id: allStreams[0].id_stream,
            })
            .expect(401)
            .end(function (err, res){
                if (err) return done(err);
                done();
            });
    });
});

describe('GET /permission/streams', () => {
    it('returns stream ids that user can access', (done) => {
        request(app)
            .get(`/api/permission/streams?user_id=${user.toia_id}`)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                for (let i = 0; i < allStreams.length; i++){
                    expect(res.body[i]).toEqual(allStreams[i].id_stream);
                }
                done();
            });
    });

    it('returns empty array for invalid toia id', (done) => {
        request(app)
            .get(`/api/permission/streams?user_id=-1`)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                expect(res.body.length).toEqual(0);
                done();
            });
    });
});


// // TODO: Add further tests
// // TODO: 
// // - Add 2-4 more videos as questions
// // - Add 2-4 filler videos
// // - Routes to check:
// // --- /removeSuggestedQ ???
// // --- /getVideoPlayback
// // --- /fillerVideo
// // --- /player
// // --- /recorder (need to check if previous video id gets deleted)
// // --- /questions/suggestions/:user_id/edit ???
// // --- /questions/suggestions/:user_id/discard
// // --- /videos/:user_id/
// // --- /getUserData
// // --- /save_player_feedback
// // --- /saveAdaSearch
// // --- /getAdaSearch
// // --- 
// // --- 
// // --- 

afterAll(() => {
    connection.query("ROLLBACK;");
    connection.end();
});