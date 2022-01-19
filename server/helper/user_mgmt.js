const connection = require('../configs/db-connection');

const QuestionTypes = ['filler', 'greeting', 'answer', 'exit', 'no-answer', 'y/n-answer'];

function emailExists(email) {
    return new Promise(((resolve) => {
        let query = `SELECT id FROM toia_user WHERE email = ?`;
        connection.query(query, [email], (err, entry) => {
            if (err) throw err;
            if (entry.length === 0) resolve(false);
            resolve(true);
        })
    }))
}

module.exports.isValidUser = function (userId) {
    return new Promise(((resolve, reject) => {
        const query_String = `SELECT * FROM toia_user WHERE id=?`;
        connection.query(query_String, [userId], function (err, result) {
            if (err) {
                console.log(err);
                reject();
            } else {
                if (result.length === 1) resolve(true);
                reject(false);
            }
        });
    }))
}

// TODO: Add additional function, addQuestionIfNew
async function addQuestionIfNew(question, suggested_type, onboarding=0, priority=100, trigger_suggester=1){
    return new Promise((resolve => {
        let query = `SELECT * FROM questions WHERE question = ? AND onboarding = 0 LIMIT 1`;
        connection.query(query, [question], (err, result) => {
            if (err) throw err;
            if (result.length === 0){
                addQuestion(question, suggested_type, onboarding, priority, trigger_suggester).then((insertedID) => {
                    resolve(insertedID);
                })
            } else {
                resolve(result[0].id);
            }
        })
    }))
}

async function addQuestion(question, suggested_type, onboarding = 0, priority = 100, trigger_suggester = 1) {
    return new Promise(((resolve, reject) => {
        if (!(QuestionTypes.find((t) => t === suggested_type))) {
            reject('Invalid Type!');
        } else {
            let query = `INSERT INTO questions(question, suggested_type, onboarding, priority, trigger_suggester) VALUES(?, ?, ?, ?, ?);`;
            connection.query(query, [question, suggested_type, onboarding, priority, trigger_suggester], (err, result) => {
                if (err) throw err;
                resolve(result.insertId);
            })
        }
    }))
}

async function linkSuggestedQuestionUser(userId, quesId, isPending = 1) {
    return new Promise(((resolve, reject) => {
        let query = `INSERT INTO question_suggestions(id_question, toia_id, isPending) VALUES(?, ?, ?)`;
        connection.query(query, [quesId, userId, isPending], (err, result) => {
            if (err) {
                throw err;
            } else {
                if (result.affectedRows === 1) {
                    resolve();
                } else {
                    reject();
                }
            }
        });
    }));
}

module.exports.saveSuggestedQuestion = async function (userId, question, suggested_type = 'answer', priority = 100) {
    let quesId = await addQuestion(question, suggested_type, 0, priority, 1);
    return linkSuggestedQuestionUser(userId, quesId);
}

module.exports.videoGetAllQuestions = function (videoId) {
    return new Promise(((resolve) => {
        let query = `SELECT questions.* FROM questions INNER JOIN videos_questions ON questions.id = videos_questions.id_question WHERE videos_questions.id_video = ?`;
        connection.query(query, [videoId], (err, result) => {
            if (err) throw err;
            resolve(result);
        });
    }))
}

function isSuggestedQuestion(quesId, userId) {
    return new Promise(((resolve) => {
        let query = `SELECT 1 FROM question_suggestions WHERE id_question=? AND toia_ID=? LIMIT 1`;
        connection.query(query, [quesId, userId], (err, result) => {
            if (err) throw err;
            resolve(result.length === 1);
        })
    }))
}

const linkStreamVideoQuestion = (streamID, videoID, quesID, type) => {
    return new Promise(((resolve) => {
        if (!(QuestionTypes.find((t) => t === type))) {
            reject('Invalid Type!');
        } else {
            let linkQuesQuery = `INSERT INTO videos_questions_streams(id_video, id_question, id_stream, type) VALUES(?, ?, ?, ?);`;
            connection.query(linkQuesQuery, [videoID, quesID, streamID, type], (err) => {
                if (err) throw err;
                console.log("Linked video id: " + videoID + " question id: " + quesID + " stream id: " + streamID);
                resolve();
            })
        }
    }))
}

const suggestionSetPending = (id_question, user_id, isPending) => {
    return new Promise(((resolve) => {
        if (isPending) {
            isPending = 1;
        } else {
            isPending = 0;
        }
        let query = `UPDATE question_suggestions SET isPending=? WHERE id_question=? AND toia_id=?`;
        connection.query(query, [isPending, id_question, user_id], (err) => {
            if (err) throw err;
            resolve();
        });
    }))
}

const isOnBoardingQuestion = (id_question) => {
    return new Promise(((resolve) => {
        let query = `SELECT id FROM questions WHERE onboarding = 1 AND id = ?`;
        connection.query(query, [id_question], (err, entry) => {
            if (err) throw err;
            if (entry.length === 1) resolve(true);
            resolve(false);
        })
    }))
}

const isRecorded = (id_question, user_id) => {
    return new Promise(((resolve) => {
        let query = `SELECT * FROM videos_questions_streams WHERE id_question = ? AND id_video IN (SELECT id_video FROM video WHERE toia_id = ?)`;
        connection.query(query, [id_question, user_id], (err, entry) => {
            if (err) throw err;
            if (entry.length !== 0) resolve(true);
            resolve(false);
        })
    }))
}

const getQuestionInfo = (id) => {
    return new Promise(((resolve) => {
        let query = `SELECT id as id_question, question, suggested_type, onboarding, priority, trigger_suggester FROM questions WHERE id=?`;
        connection.query(query, [id], (err, entry) => {
            if (err) throw err;
            if (entry.length === 0) resolve(undefined);
            resolve(entry[0]);
        })
    }))
}

const getStreamInfo = (id) => {
    return new Promise((resolve => {
        let query = `SELECT * FROM stream WHERE id_stream=?`;
        connection.query(query, [id], (err, entry) => {
            if (err) throw err;
            if (entry.length === 0) resolve(undefined);
            resolve(entry[0]);
        })
    }))
}

module.exports.addQuestion = addQuestion;
module.exports.isSuggestedQuestion = isSuggestedQuestion;
module.exports.emailExists = emailExists;
module.exports.linkStreamVideoQuestion = linkStreamVideoQuestion;
module.exports.suggestionSetPending = suggestionSetPending;
module.exports.isOnBoardingQuestion = isOnBoardingQuestion;
module.exports.isRecorded = isRecorded;
module.exports.getQuestionInfo = getQuestionInfo;
module.exports.getStreamInfo = getStreamInfo;