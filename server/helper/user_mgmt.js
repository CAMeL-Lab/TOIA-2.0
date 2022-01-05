const mysql = require('mysql');
const {QuestionDelimiter} = require('./config');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

connection.connect();

const tableName = 'toia_user';

module.exports.isValidUser = function (userId) {
    return new Promise(((resolve, reject) => {
        const query_String = `SELECT * FROM ${tableName} WHERE id=?`;
        connection.query(query_String, [userId], function (err, result){
            if (err){
                console.log(err);
                reject();
            } else {
                if (result.length === 1) resolve(true);
                reject(false);
            }
        });
    }))
}

module.exports.saveSuggestedQuestion = function (userId, question, type='answer', priority=0) {
    return new Promise(((resolve, reject) => {
        const queryAddQs = `INSERT INTO question_suggestions(question, priority, toia_id, type) VALUES(?, ?, ?, ?);`
        connection.query(queryAddQs, [question, priority, userId, type],(err, result, fields) => {
            if (err) {
                throw err;
            } else {
                if (result.affectedRows === 1){
                    resolve();
                } else {
                    reject();
                }
            }
        });
    }))
}

module.exports.parseQuestionsFromString = function (questionSting) {
    return questionSting.split(QuestionDelimiter);
}

module.exports.generateStringFromQuestions = function (questions) {
    let result = "";
    for (let i = 0; i < questions.length; i++){
        let question = questions[i];
        if (i !== (questions.length - 1)){
            result = result + question + QuestionDelimiter ;
        } else {
            result = result + question;
        }
    }
    return result;
}