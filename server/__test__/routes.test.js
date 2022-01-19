const app = require('../server');
const request = require('supertest');
const assert = require("assert");
const connection = require('../configs/db-connection');
const onBoardingQs = require('../configs/onboarding-questions.json');
const _ = require("lodash");
const fs = require("fs");

const user = {
    firstName: 'Bishnu',
    lastName: 'Dev',
    email: 'someone1249@example.com',
    pwd: 123,
    language: 'English',
    profile_pic: "C:\\Users\\Acer\\Desktop\\anime.jpg",
    video:"C:\\Users\\Acer\\Downloads\\SampleVideo_1280x720_1mb.mp4",
    videoType:'greeting'
};

const stream = {
    name: "Cool Stream",
    display_pic: "C:\\Users\\Acer\\Desktop\\anime.jpg",
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

// User Registration & Login
describe('register', () => {

    it('returns 200 if user is registered', (done) => {
        request(app)
            .post('/createTOIA')
            .attach('blob', user.profile_pic)
            .field('firstName', user.firstName)
            .field('lastName', user.lastName)
            .field('email', user.email)
            .field('pwd', user.pwd)
            .field('language', user.language)
            .expect(200)
            .end(function(err, res) {
                if (err) return done(err);
                assert(res.body.first_name === user.firstName);
                user.toia_id = res.body.new_toia_ID;
                return done();
            });
    })

    it('return 400 if email already there', (done) => {
        request(app)
            .post('/createTOIA')
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
    })
})

// TODO: Write test for user login


// Streams
let totalStreams;
let userStreams;
describe('GET /getUserStreams', () => {
    it('returns one stream with name ALL', (done) => {
        request(app)
            .post('/getUserStreams')
            .send({
                "params":{
                    "toiaID":user.toia_id,
                    "toiaName":user.firstName
                }
            })
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                assert(res.body[0].toia_id === user.toia_id);
                totalStreams = res.body.length;
                done();
            });
    })
})

describe('GET /createNewStream', () => {
    it('returns list of all streams including new one', (done) => {
        request(app)
            .post('/createNewStream')
            .attach('blob', stream.display_pic)
            .field('toiaName', user.firstName)
            .field('toiaID', user.toia_id)
            .field('newStreamName', stream.name)
            .field('newStreamPrivacy', stream.privacy)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                totalStreams++;
                assert(res.body.length === totalStreams);
                for (const stream of res.body){
                    assert(stream.toia_id === user.toia_id);
                }
                done();
            });
    });
})

describe('GET /getUserStreams', () => {
    it('returns all streams of a user', (done) => {
        request(app)
            .post('/getUserStreams')
            .send({
                "params":{
                    "toiaID":user.toia_id,
                    "toiaName":user.firstName
                }
            })
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                assert(res.body.length === totalStreams);
                for (const stream of res.body){
                    assert(stream.toia_id === user.toia_id);
                }
                userStreams = res.body;
                done();
            });
    })
})

// On-boarding Questions
describe('GET /questions/onboarding/:user_id/pending', () => {
    it('returns on-boarding questions', (done) => {
        request(app)
            .get(`/questions/onboarding/${user.toia_id}/pending`)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);

                assert(res.body.length === onBoardingQs.length);

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
})

describe('GET /questions/onboarding/:user_id/completed', () => {
    it('returns empty array', (done) => {
        request(app)
            .get(`/questions/onboarding/${user.toia_id}/completed`)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);

                assert(res.body.length === 0);
                done();
            });
    })
})

// Suggestions
describe('GET /questions/suggestions/:user_id/pending/', () => {
    it('returns empty array', (done) => {
        request(app)
            .get(`/questions/suggestions/${user.toia_id}/pending`)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);

                assert(res.body.length === 0);
                done();
            });
    })
})

describe('POST /saveSuggestedQuestion/:user_id', () => {
    it('returns empty array', (done) => {
        request(app)
            .post(`/saveSuggestedQuestion/${user.toia_id}`)
            .send({"q":custom_questions[0].question})
            .expect(200)
            .end(function (err){
                if (err) return done(err);
                done();
            });
    })
})

let suggested_questions;
describe('GET /questions/suggestions/:user_id/pending/', () => {
    it('returns array with 1 question object', (done) => {
        request(app)
            .get(`/questions/suggestions/${user.toia_id}/pending`)
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);

                assert(res.body.length === 1);
                assert(res.body[0].question === custom_questions[0].question);
                assert(res.body[0].trigger_suggester === 1);

                suggested_questions = res.body;
                done();
            });
    })
})

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
            .post('/recorder')
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
            .expect(200)
            .end(function (err, res){
                if (err) return done(err);
                expect(res.text).toEqual('Success');
                done();
            });
    })
})

// Suggestions once again
// TODO: Onboarding and suggestion logic is flawed.

afterAll(() => {
    connection.end();
});