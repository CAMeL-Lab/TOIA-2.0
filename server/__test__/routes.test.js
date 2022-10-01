const app = require('../server');
const request = require('supertest');
const assert = require("assert");
const connection = require('../configs/db-connection');
const onBoardingQs = require('../configs/onboarding-questions.json');
const _ = require("lodash");
const fs = require("fs");
const path = require("path");

connection.query("begin;");


// Note: Sometimes the values returned in response
// will be in res.text or res.body instead of res.data.

const user = {
    firstName: 'Bishnu',
    lastName: 'Dev',
    email: 'someone1249@example.com',
    pwd: 123,
    wrong_pwd: 1234,
    language: 'English',
    profile_pic: path.join(__dirname , "./test_files/avatar.jpg"), // PATH to any image file
    video: path.join(__dirname , "./test_files/sample_video.mp4"), // Path to any video file
    videoType: 'greeting'
};

const wrong_user = {
    email: 'iDoNotExist@someWrongDomain.com',
    pwd: 123,
    toia_id: -1,
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

    it('returns 200 if user has logged in', (done) => {
        request(app)
            .post('/api/login')
            .field('email', user.email)
            .field('pwd', user.pwd)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                expect(res.body.toia_id).toEqual(user.toiaID);
                expect(res.body.firstName).toEqual(user.firstName);
                return done();
            });
    });

    it('returns -1 in body if email does not exist', (done) => {
        request(app)
            .post('/api/login')
            .field('email', wrong_user.email)
            .field('pwd', wrong_user.pwd)
            .expect(400)
            .end(function(err, res) {
                if (err) return done(err);
                expect(res.text).toEqual('-1');
                return done();
            });
    });

    it('returns -2 in body if the password is wrong', (done) => {
        request(app)
            .post('/api/createTOIA')
            .field('email', user.email)
            .field('pwd', user.wrong_pwd)
            .expect(400)
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
            .post('/api/getAllStreams')
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                expect(res.body.entries.length).toBeGreaterThanOrEqualTo(1);
                done();
            });
    });
});

let totalStreams;
let userStreams;
describe('GET /getUserStreams', () => {
    it('returns one stream with name ALL', (done) => {
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
                expect(res.body[0].name).toEqual("ALL");
                // assert(res.body[0].toia_id === user.toia_id);
                totalStreams = res.body.length;
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
                // assert(res.body.length === totalStreams);
                expect(res.body.length).toEqual(totalStreams);
                for (const stream of res.body){
                    // assert(stream.toia_id === user.toia_id);
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
describe('GET /questions/onboarding/:user_id/pending', () => {
    it('returns on-boarding questions', (done) => {
        request(app)
            .get(`/api/questions/onboarding/${user.toia_id}/pending`)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);

                // assert(res.body.length === onBoardingQs.length);
                expect(res.body.length).toEqual(onBoardingQs.length);

                let resCopy = [...res.body];
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
                console.log(res.body);
                expect(res.body.length).toBeGreaterThanOrEqualTo(1);
                done();
            });
    })
});

let suggested_questions;
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

                suggested_questions = res.body;
                done();
            });
    })
});

// Video Recorder
describe('POST /recorder', () => {
    it('returns status 200 and message "Success"', (done) => {
        let thumb_base64 = fs.readFileSync(user.profile_pic, 'base64');
        const lastSuggested = {
            id_question: suggested_questions[0].id,
            question: suggested_questions[0].question
        }
        const quesToSend = [lastSuggested, ...custom_questions];

        let userStreamsCopy = userStreams.map((s) => {
            return {
                id: s.id_stream,
                name: s.name
            }
        });

        request(app)
            .post('/api/recorder')
            .set("Content-type", "multipart/form-data")
            .attach('blob', user.video)
            .field('thumb', thumb_base64)
            .field('id', user.toia_id)
            .field('name', user.firstName)
            .field('language', user.language)
            .field('questions', JSON.stringify(quesToSend))
            .field('answer', dummy_answer)
            .field('videoType', user.videoType)
            .field('private', false)
            .field('streams', JSON.stringify(userStreamsCopy))
            .field('video_duration', 2)
            // .field('start_time', recordStartTimestamp)
            // .field('end_time', endTimestamp)
            .expect(200)
            .end(function (err, res){
                // console.log("========================");
                // console.log(res.text);
                // console.log(res.body);
                expect(res.text).toEqual('Success');
                if (err) return done(err);
                done();
            });
    })
});

// Videos
describe('POST /getUserVideos', () => {
    it('returns 1 video', (done) => {
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
                console.log(res.body);
                expect(res.body.length).toEqual(1);
                expect(res.body[0].answer).toEqual(dummy_answer);
                done();
            });
    });
});

describe('POST /getUserVideosCount', () => {
    it('returns a count of 1 video', (done) => {
        request(app)
            .post(`/api/getUserVideosCount`)
            .send({
                "params":{
                    "toiaID":user.toia_id,
                }
            })
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                console.log(res.body);
                expect(res.body.count).toEqual(1);
                done();
            });
    });
});

describe('POST /getTotalVideoDuration', () => {
    it('returns ~2 seconds', (done) => {
        request(app)
            .post(`/api/getUserVideosCount`)
            .send({
                "params":{
                    "toiaID":user.toia_id,
                }
            })
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                console.log(res.body);
                expect(res.body.total_duration).toEqual(1);
                done();
            });
    });
});

// TODO: Add further tests
// TODO: 
// - Add 2-4 more videos as questions
// - Add 2-4 filler videos
// - Routes to check:
// --- /removeSuggestedQ ???
// --- /getVideoPlayback
// --- /fillerVideo
// --- /player
// --- /recorder (need to check if previous video id gets deleted)
// --- /getSmartQuestions
// --- /getLastestQuestionSuggestion'
// --- /questions/suggestions/:user_id/edit ???
// --- /questions/suggestions/:user_id/discard
// --- /questions/answered/delete
// --- /questions/answered/:user_id
// --- /questions/answered/:user_id/:stream_id
// --- /videos/:user_id/
// --- /getUserData
// --- /getStreamVideosCount
// --- /save_player_feedback
// --- /permission/stream
// --- /saveAdaSearch
// --- 
// --- 
// --- 
// --- 

afterAll(() => {
    connection.query("ROLLBACK;");
    connection.end();
});