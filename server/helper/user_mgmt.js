const connection = require('../configs/db-connection');

const QuestionTypes = ['filler', 'greeting', 'answer', 'exit', 'no-answer', 'y/n-answer'];

function emailExists(email) {
    return new Promise(((resolve) => {
        let query = `SELECT id FROM toia_user WHERE email = ?`;
        connection.query(query, [email], (err, entry) => {
            if (err) throw err;
            if (entry.length === 0) {
                resolve(false);
            } else {
                resolve(true);
            }
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
                if (result.length === 1) {
                    resolve(true);
                } else {
                    reject(false);
                }
            }
        });
    }))
}

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

const saveSuggestedQuestion = async function (userId, question, suggested_type = 'answer', priority = 100) {
    let quesId = await addQuestion(question, suggested_type, 0, priority, 1);
    return new Promise((resolve, reject) => {
        linkSuggestedQuestionUser(userId, quesId).then(() => {
            resolve(quesId);
        }).catch(() => {
            reject();
        })
    })
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
            if (entry.length === 1) {
                resolve(true);
            } else {
                resolve(false);
            }
        })
    }))
}

const isRecorded = (id_question, user_id) => {
    return new Promise(((resolve) => {
        let query = `SELECT * FROM videos_questions_streams WHERE id_question = ? AND id_video IN (SELECT id_video FROM video WHERE toia_id = ?)`;
        connection.query(query, [id_question, user_id], (err, entry) => {
            if (err) throw err;
            if (entry.length !== 0) {
                resolve(true);
            } else {
                resolve(false);
            }
        })
    }))
}

const getQuestionInfo = (id) => {
    return new Promise(((resolve) => {
        let query = `SELECT id as id_question, question, suggested_type, onboarding, priority, trigger_suggester FROM questions WHERE id=?`;
        connection.query(query, [id], (err, entry) => {
            if (err) throw err;
            if (entry.length === 0) {
                resolve(null);
            } else {
                resolve(entry[0]);
            }
        })
    }))
}

const getStreamInfo = (id) => {
    return new Promise((resolve => {
        let query = `SELECT * FROM stream WHERE id_stream=?`;
        connection.query(query, [id], (err, entry) => {
            if (err) throw err;
            if (entry.length === 0) {
                resolve(null);
            } else {
                resolve(entry[0]);
            }
        })
    }))
}

const shouldTriggerSuggester = (id_question) => {
    return new Promise((resolve => {
        let query = `SELECT id FROM questions WHERE trigger_suggester = 1 AND id = ?`;
        connection.query(query, [id_question], (err, entry) => {
            if (err) throw err;
            if (entry.length === 1) {
                resolve(true);
            } else {
                resolve(false);
            }
        })
    }));
}

const getQuestionType = (id_question) => {
    return new Promise((resolve => {
        getQuestionInfo(id_question).then((result) => {
            if (result) {
                resolve(result.suggested_type);
            } else {
                resolve(null);
            }
        })
    }))
}

const getQuestionValue = (id_question) => {
    return new Promise((resolve => {
        getQuestionType(id_question).then((question) => {
            if (question){
                resolve(question.question);
            } else {
                resolve(null);
            }
        })
    }))
}

const deleteSuggestionEntry = (user_id, id_question) => {
    return new Promise((resolve => {
        let query = `DELETE FROM question_suggestions WHERE id_question = ? AND toia_id = ?`;
        connection.query(query, [id_question, user_id], (err) => {
            if (err) throw err;
            resolve();
        })
    }));
}

const updateSuggestedQuestion = (user_id, id_question, new_value) => {
    return new Promise(async (resolve, reject) => {
        if (await isSuggestedQuestion(id_question, user_id)) {
            // Check if new_value is same as old value
            const old_value = await getQuestionValue(id_question);
            if (old_value === new_value){
                resolve({
                    question_id: id_question,
                    user_id: user_id,
                    question: new_value
                });
            } else {
                let query = `SELECT * FROM question_suggestions WHERE id_question = ?`;
                connection.query(query, [id_question], async (err, entries) => {
                    if (err) throw err;
                    if (entries.length === 1) {
                        let query_update = `UPDATE questions SET question = ? WHERE id = ?`;
                        connection.query(query_update, [new_value, id_question], (err) => {
                            if (err) throw err;
                            resolve({
                                question_id: id_question,
                                user_id: user_id,
                                question: new_value
                            });
                        })
                    } else {
                        // DO NOT update existing record! Same suggestion for multiple user. Add new record.
                        await deleteSuggestionEntry(user_id, id_question);

                        let old_question_type = await getQuestionType(id_question);
                        saveSuggestedQuestion(user_id, new_value, old_question_type).then((new_q_id) => {
                            resolve({
                                question_id: new_q_id,
                                user_id: user_id,
                                question: new_value
                            })
                        });
                    }
                })
            }
        } else {
            reject({"error": "Provided user id and suggested question id pair doesn't exist."})
        }
    })
}

const isEditing = (req) => {
    if (!req.hasOwnProperty('fields')) throw "Request object must have a property called fields.";

    let fields = req.fields;
    return fields.hasOwnProperty('is_editing') && fields.is_editing[0] === 'true';
}

const isSaveAsNew = (req) => {
    if (!req.hasOwnProperty('fields')) throw "Request object must have a property called fields.";

    let fields = req.fields;
    return fields.hasOwnProperty('save_as_new') && fields.save_as_new[0] === 'true';
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
module.exports.shouldTriggerSuggester = shouldTriggerSuggester;
module.exports.saveSuggestedQuestion = saveSuggestedQuestion;
module.exports.getQuestionType = getQuestionType;
module.exports.deleteSuggestionEntry = deleteSuggestionEntry;
module.exports.updateSuggestedQuestion = updateSuggestedQuestion;
module.exports.isEditing = isEditing;
module.exports.isSaveAsNew = isSaveAsNew;
module.exports.getQuestionValue = getQuestionValue;