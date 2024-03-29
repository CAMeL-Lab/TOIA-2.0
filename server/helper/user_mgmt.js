const connection = require("../configs/db-connection");
const logger = require("../logger");
const { Configuration, OpenAIApi } = require("openai");
const fs = require("fs");
const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const QuestionTypes = [
	"filler",
	"greeting",
	"answer",
	"exit",
	"no-answer",
	"y/n-answer",
];

function emailExists(email) {
	return new Promise(resolve => {
		let query = `SELECT id FROM toia_user WHERE email = ?`;
		connection.query(query, [email], (err, entry) => {
			if (err) throw err;
			if (entry.length === 0) {
				resolve(false);
			} else {
				resolve(true);
			}
		});
	});
}

module.exports.isValidUser = function (userId) {
	return new Promise((resolve, reject) => {
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
	});
};

async function addQuestionIfNew(
	question,
	suggested_type,
	onboarding = 0,
	priority = 100,
	trigger_suggester = 1,
	language = "en-US"
) {
	return new Promise(resolve => {
		let query = `SELECT * FROM questions WHERE question = ? AND language = ? AND onboarding = 0 LIMIT 1`;
		connection.query(query, [question, language], (err, result) => {
			if (err) throw err;
			if (result.length === 0) {
				addQuestion(
					question,
					suggested_type,
					onboarding,
					priority,
					trigger_suggester,
					language
				).then(insertedID => {
					resolve(insertedID);
				});
			} else {
				resolve(result[0].id);
			}
		});
	});
}

async function addQuestion(
	question,
	suggested_type,
	onboarding = 0,
	priority = 100,
	trigger_suggester = 1,
	language = "en-US"
) {
	return new Promise((resolve, reject) => {
		if (!QuestionTypes.find(t => t === suggested_type)) {
			reject("Invalid Type!");
		} else {
			let query = `INSERT INTO questions(question, suggested_type, onboarding, priority, trigger_suggester, language) VALUES(?, ?, ?, ?, ?, ?);`;
			connection.query(
				query,
				[
					question,
					suggested_type,
					onboarding,
					priority,
					trigger_suggester,
					language
				],
				(err, result) => {
					if (err) throw err;
					resolve(result.insertId);
				},
			);
		}
	});
}

async function linkSuggestedQuestionUser(userId, quesId, isPending = 1) {
	return new Promise((resolve, reject) => {
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
	});
}

const searchSuggestion = (question, user_id) => {
	return new Promise(resolve => {
		let query = `SELECT id_question FROM question_suggestions WHERE id_question in (SELECT id FROM questions WHERE question = ?) AND toia_id = ?`;
		connection.query(query, [question, user_id], (err, entries) => {
			if (err) throw err;
			resolve(entries);
		});
	});
};

const searchRecorded = (question, user_id) => {
	return new Promise(resolve => {
		let query = `SELECT id_question FROM videos_questions_streams WHERE id_question in (SELECT id FROM questions WHERE question = ?) AND id_video in (SELECT id_video FROM video WHERE toia_id = ?)`;
		connection.query(query, [question, user_id], (err, entries) => {
			if (err) throw err;
			resolve(entries);
		});
	});
};

const saveSuggestedQuestion = async function (
	userId,
	question,
	suggested_type = "answer",
	priority = 100,
) {
	let quesId = await addQuestion(question, suggested_type, 0, priority, 1);
	return new Promise((resolve, reject) => {
		linkSuggestedQuestionUser(userId, quesId)
			.then(() => {
				resolve(quesId);
			})
			.catch(() => {
				reject();
			});
	});
};

function isSuggestedQuestion(quesId, userId) {
	return new Promise(resolve => {
		let query = `SELECT 1 FROM question_suggestions WHERE id_question=? AND toia_ID=? LIMIT 1`;
		connection.query(query, [quesId, userId], (err, result) => {
			if (err) throw err;
			resolve(result.length === 1);
		});
	});
}

const linkStreamVideoQuestion = (streamID, videoID, quesID, type, ada_search=null) => {
	return new Promise(resolve => {
		if (!QuestionTypes.find(t => t === type)) {
			reject("Invalid Type!");
		} else {
			let linkQuesQuery = `INSERT INTO videos_questions_streams(id_video, id_question, id_stream, type, ada_search) VALUES(?, ?, ?, ?, ?);`;
			connection.query(
				linkQuesQuery,
				[videoID, quesID, streamID, type, ada_search],
				err => {
					if (err) throw err;
					console.log(
						"Linked video id: " +
							videoID +
							" question id: " +
							quesID +
							" stream id: " +
							streamID,
					);
					resolve();
				},
			);
		}
	});
};

const suggestionSetPending = (id_question, user_id, isPending) => {
	return new Promise(resolve => {
		if (isPending) {
			isPending = 1;
		} else {
			isPending = 0;
		}
		let query = `UPDATE question_suggestions SET isPending=? WHERE id_question=? AND toia_id=?`;
		connection.query(query, [isPending, id_question, user_id], err => {
			if (err) throw err;
			resolve();
		});
	});
};

const isOnBoardingQuestion = id_question => {
	return new Promise(resolve => {
		let query = `SELECT id FROM questions WHERE onboarding = 1 AND id = ?`;
		connection.query(query, [id_question], (err, entry) => {
			if (err) throw err;
			if (entry.length === 1) {
				resolve(true);
			} else {
				resolve(false);
			}
		});
	});
};

const isRecorded = (id_question, user_id) => {
	return new Promise(resolve => {
		let query = `SELECT * FROM videos_questions_streams WHERE id_question = ? AND id_video IN (SELECT id_video FROM video WHERE toia_id = ?)`;
		connection.query(query, [id_question, user_id], (err, entry) => {
			if (err) throw err;
			if (entry.length !== 0) {
				resolve(true);
			} else {
				resolve(false);
			}
		});
	});
};

const getQuestionInfo = id => {
	return new Promise(resolve => {
		let query = `SELECT id as id_question, question, suggested_type, onboarding, priority, trigger_suggester, language FROM questions WHERE id=?`;
		connection.query(query, [id], (err, entry) => {
			if (err) throw err;
			if (entry.length === 0) {
				resolve(null);
			} else {
				resolve(entry[0]);
			}
		});
	});
};

const getStreamInfo = id => {
	return new Promise(resolve => {
		let query = `SELECT * FROM stream WHERE id_stream=?`;
		connection.query(query, [id], (err, entry) => {
			if (err) throw err;
			if (entry.length === 0) {
				resolve(null);
			} else {
				resolve(entry[0]);
			}
		});
	});
};

const shouldTriggerSuggester = id_question => {
	return new Promise(resolve => {
		let query = `SELECT id FROM questions WHERE trigger_suggester = 1 AND id = ?`;
		connection.query(query, [id_question], (err, entry) => {
			if (err) throw err;
			if (entry.length === 1) {
				resolve(true);
			} else {
				resolve(false);
			}
		});
	});
};

const getQuestionType = id_question => {
	return new Promise(resolve => {
		getQuestionInfo(id_question).then(result => {
			if (result) {
				resolve(result.suggested_type);
			} else {
				resolve(null);
			}
		});
	});
};

const getQuestionValue = id_question => {
	return new Promise(resolve => {
		getQuestionType(id_question).then(question => {
			if (question) {
				resolve(question.question);
			} else {
				resolve(null);
			}
		});
	});
};

const deleteSuggestionEntry = (user_id, id_question) => {
	return new Promise(resolve => {
		let query = `DELETE FROM question_suggestions WHERE id_question = ? AND toia_id = ?`;
		connection.query(query, [id_question, user_id], err => {
			if (err) throw err;
			resolve();
		});
	});
};

const updateSuggestedQuestion = (user_id, id_question, new_value) => {
	return new Promise(async (resolve, reject) => {
		if (await isSuggestedQuestion(id_question, user_id)) {
			// Check if new_value is same as old value
			const old_value = await getQuestionValue(id_question);
			if (old_value === new_value) {
				resolve({
					question_id: id_question,
					user_id: user_id,
					question: new_value,
				});
			} else {
				let query = `SELECT * FROM question_suggestions WHERE id_question = ?`;
				connection.query(query, [id_question], async (err, entries) => {
					if (err) throw err;
					if (entries.length === 1) {
						let query_update = `UPDATE questions SET question = ? WHERE id = ?`;
						connection.query(
							query_update,
							[new_value, id_question],
							err => {
								if (err) throw err;
								resolve({
									question_id: id_question,
									user_id: user_id,
									question: new_value,
								});
							},
						);
					} else {
						// DO NOT update existing record! Same suggestion for multiple user. Add new record.
						await deleteSuggestionEntry(user_id, id_question);

						let old_question_type = await getQuestionType(
							id_question,
						);
						saveSuggestedQuestion(
							user_id,
							new_value,
							old_question_type,
						).then(new_q_id => {
							resolve({
								question_id: new_q_id,
								user_id: user_id,
								question: new_value,
							});
						});
					}
				});
			}
		} else {
			reject({
				error: "Provided user id and suggested question id pair doesn't exist.",
			});
		}
	});
};

const isEditing = req => {
	if (!req.hasOwnProperty("fields"))
		throw "Request object must have a property called fields.";

	let fields = req.fields;
	return (
		fields.hasOwnProperty("is_editing") && fields.is_editing[0] === "true"
	);
};

const isSaveAsNew = req => {
	if (!req.hasOwnProperty("fields"))
		throw "Request object must have a property called fields.";

	let fields = req.fields;
	return (
		fields.hasOwnProperty("save_as_new") && fields.save_as_new[0] === "true"
	);
};

const isUserStream = (user_id, stream_id) => {
	return new Promise(resolve => {
		let query = `SELECT 1 FROM stream WHERE id_stream = ? AND toia_id = ?`;
		connection.query(query, [stream_id, user_id], (err, result) => {
			if (err) throw err;
			resolve(result.length === 1);
		});
	});
};

const getStreamTotalVideosCount = (user_id, stream_id = null) => {
	return new Promise(async resolve => {
		let query;
		let queryParams;
		if (stream_id) {
			const belongsToUser = await isUserStream(user_id, stream_id);
			if (belongsToUser) {
				query = `SELECT DISTINCT id_video FROM videos_questions_streams WHERE id_stream = ?`;
				queryParams = [stream_id];
			} else {
				resolve(0);
				return;
			}
		} else {
			query = `SELECT DISTINCT id_video FROM videos_questions_streams WHERE id_stream IN (SELECT id_stream FROM stream WHERE toia_id = ?)`;
			queryParams = [user_id];
		}
		connection.query(query, queryParams, (err, result) => {
			if (err) throw err;
			resolve(result.length);
		});
	});
};

const getUserTotalVideosCount = user_id => {
	return getStreamTotalVideosCount(user_id);
};

const getUserTotalVideoDuration = user_id => {
	return new Promise(resolve => {
		let query = `SELECT DISTINCT video.id_video, video.duration_seconds FROM video 
                    INNER JOIN videos_questions_streams ON videos_questions_streams.id_video = video.id_video
                    WHERE video.toia_id = ?`;
		connection.query(query, [user_id], (err, entries) => {
			if (err) throw err;

			let totalLengthSeconds = entries.reduce((total, currentVal) => {
				return total + currentVal.duration_seconds;
			}, 0);

			resolve(totalLengthSeconds);
		});
	});
};

const savePlayerFeedback = (video_id, question, rating, video_language, interactor_language, similarity_score = null, subject="UNKNOWN", user_id = null) => {
	return new Promise((resolve, reject) => {
		let current_timestamp = +new Date();

		let query = `INSERT INTO player_feedback(timestamp, video_id, user_id, question, rating, video_language, interactor_language, similarity_score, subject) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;
		connection.query(query, [current_timestamp, video_id, user_id, question, rating, video_language, interactor_language, similarity_score, subject], err => {
			if (err){ 
				console.error(err);
				reject(err);
				return;
			}
			resolve();
		});
	});
};

const saveConversationLog = (
	interactor_id,
	toia_id,
	filler,
	question_asked,
	video_played,
	ada_similarity_score = null,
	mode = "UNKNOWN",
) => {
	return;
	// return new Promise(resolve => {
	// 	// resolve();
	// 	let currentTimestamp = +new Date();
	// 	const query = `INSERT INTO conversations_log(interactor_id, toia_id, timestamp, filler, question_asked, video_played, ada_similarity_score, video_language, interactor_language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

	// 	connection.query(
	// 		query,
	// 		[
	// 			interactor_id,
	// 			toia_id,
	// 			currentTimestamp,
	// 			filler,
	// 			question_asked,
	// 			video_played,
	// 			ada_similarity_score,
	// 	     video_language,
	// 	     interactor_language
	// 		],
	// 		(err, res) => {
	// 			if (err) throw err;
	// 			resolve();
	// 		},
	// 	);
	// });
};

const canAccessStream = (user_id, stream_id) => {
	return new Promise(resolve => {
		let query = `SELECT 1 FROM stream_view_permission WHERE toia_id = ? AND stream_id = ? UNION SELECT 1 FROM stream WHERE id_stream = ? AND toia_id = ?`;
		connection.query(
			query,
			[user_id, stream_id, stream_id, user_id],
			(err, entry) => {
				if (err) throw err;
				if (entry.length === 1) {
					resolve(true);
				} else {
					resolve(false);
				}
			},
		);
	});
};

const getAccessibleStreams = user_id => {
	return new Promise(resolve => {
		let query = `(SELECT id_stream FROM stream where toia_id = ?) UNION (SELECT stream_id FROM stream_view_permission WHERE toia_id = ?);`;
		connection.query(query, [user_id, user_id], (err, entries) => {
			if (err) throw err;
			let stream_ids = entries.map(item => {
				return item.id_stream;
			});
			resolve(stream_ids);
		});
	});
};

const saveAdaSearch = (data, question_id, video_id) => {
	let buff = new Buffer.from(data);
	let base64data = buff.toString("base64");

	let query = `UPDATE videos_questions_streams SET ada_search=? WHERE id_video=? AND id_question=?`;

	return new Promise(resolve => {
		connection.query(
			query,
			[base64data, video_id, question_id],
			(err, result) => {
				if (err) throw err;
				resolve(true);
			},
		);
	});
};

const getAdaSearch = (question_id, video_id) => {
	let query = `SELECT ada_search FROM videos_questions_streams WHERE id_video=? AND id_question=?`;

	return new Promise(resolve => {
		connection.query(query, [video_id, question_id], (err, entry) => {
			if (err) throw err;
			if (entry.length === 0) resolve(null);

			let ada_search_encoded = entry[0].ada_search;
			let buff = new Buffer.from(ada_search_encoded, "base64");
			resolve(buff.toString("ascii"));
		});
	});
};

const getVideoDetails = id_video => {
	let query = `SELECT * FROM video WHERE id_video=?`;

	return new Promise((resolve, reject) => {
		connection.query(query, [id_video], (err, entry) => {
			if (err) throw err;
			if (entry.length === 0) reject();
			resolve(entry[0]);
		});
	});
};

const getExactMatchVideo = (stream_id, question) => {
	let query = `SELECT videos_questions_streams.*, video.answer, video.language FROM videos_questions_streams
                LEFT JOIN questions ON questions.id = videos_questions_streams.id_question
                INNER JOIN video ON video.id_video = videos_questions_streams.id_video
                WHERE videos_questions_streams.id_stream = ? AND
                questions.question = ? LIMIT 1;`;

	return new Promise(resolve => {
		connection.query(query, [stream_id, question], (err, entry) => {
			if (err) throw err;
			if (entry.length === 0) {
				resolve(null);
			} else {
				resolve(entry[0]);
			}
		});
	});
};

const getEmbeddings = async (question, answer) => {
	try {
		const embeddings = await openai.createEmbedding({
			model: "text-search-ada-doc-001",
			input: "Question: " + question + "; Answer: " + answer,
		});

		return embeddings.data.data[0].embedding;
	} catch (e) {
		console.error(e);
	}
};

const getVideoLatestIDX = async () => {
	let query = `SELECT max(idx) FROM video`;

	return new Promise(resolve => {
		connection.query(query, (err, result) => {
			if (err) throw err;
			resolve(result[0]["max(idx)"]);
		});
	});
};

const addVideoEntry = async (id_video, toia_id, answer, duration_seconds) => {
	let query =
		"INSERT INTO `video`(`id_video`, `toia_id`, `idx`, `private`, `answer`, `language`, `likes`, `views`, `duration_seconds`) VALUES (?,?,?,?,?,?,?,?,?)";

	const idx = (await getVideoLatestIDX()) + 1;
	return new Promise(resolve => {
		connection.query(
			query,
			[id_video, toia_id, idx, 0, answer, "EN", 0, 0, duration_seconds],
			(err, result) => {
				if (err) throw err;
				resolve();
			},
		);
	});
};


const addTimeForTranscript = (time1, delaySeconds, delayNanos) =>{
  let seconds = parseInt(time1.seconds) + delaySeconds;
  let nanos = parseInt(time1.nanos) + delayNanos;
  
  if (nanos >= 1000000000) {
    seconds += 1;
    nanos -= 1000000000;
  }
  
  return {
    "seconds": seconds.toString(),
    "nanos": nanos
  };
};

const matchTranscription = (data, transcript) => {
	let manualTranscript = transcript.trim().split(" ");
	console.log(manualTranscript);
	if (manualTranscript.length == 0 || transcript.trim() == '') {
	  return [];
	}
  
	let newSpeechTranscript = [];
	let prevEndTimeSeconds = 0;
	let prevEndTimeNanos = 0;
  
	let subData = JSON.parse(data[0]);
	let subSpeechTranscript = []; // For maintaining the dimensions
  
	let speechTranscript = [];
	for (let j = 0; j < subData.length; j++) {
  
	  let miniSpeechTranscript = subData[j];
	  let sTLength = miniSpeechTranscript.length;
  
	  for (let k = 0; k < sTLength; k++) {
		miniSpeechTranscript[k].startTime = addTimeForTranscript(
		  miniSpeechTranscript[k].startTime,
		  prevEndTimeSeconds,
		  prevEndTimeNanos
		);
		miniSpeechTranscript[k].endTime = addTimeForTranscript(
		  miniSpeechTranscript[k].endTime,
		  prevEndTimeSeconds,
		  prevEndTimeNanos
		);
		speechTranscript.push(miniSpeechTranscript[k]);
	  }
	  prevEndTimeSeconds += parseInt(
		miniSpeechTranscript[miniSpeechTranscript.length - 1].endTime.seconds
	  );
	  prevEndTimeNanos +=
		miniSpeechTranscript[miniSpeechTranscript.length - 1].endTime.nanos;
	}
	// Start of actual alignment code
  
	// Look at length of each array (manualTranscript and speechTranscript) and perform calculations
  
	let mTLength = manualTranscript.length;
	let sTLength = speechTranscript.length;
  
	if (sTLength <= mTLength) {
	  let wordsPerBucket = Math.floor(mTLength / sTLength);
	  let remainder = mTLength % sTLength;
  
	  let mTPosition = 0;
	  // Put extra in the buckets in the beginning because of remainder (unequal division/distribution)
	  for (let k = 0; k < sTLength; k++) {
		let tempWordsPerBucket = wordsPerBucket + (k < remainder ? 1 : 0);
  
		//   speechTranscript[k].word = joined_words;
		let joined_words = manualTranscript
				.slice(mTPosition, mTPosition + tempWordsPerBucket)
				.join(" ");
  
		subSpeechTranscript.push({
		  ...speechTranscript[k],
		  word: joined_words,
		});
		mTPosition += tempWordsPerBucket;
	  }
	  newSpeechTranscript.push(subSpeechTranscript);
	} else {
	  let wordsPerBucket = Math.floor(sTLength / mTLength);
	  let remainder = sTLength % mTLength;
  
	  let sTPosition = 0;
  
	  for (let k = 0; k < mTLength; k++) {
		let tempWordsPerBucket = wordsPerBucket + (k < remainder ? 1 : 0);
  
		let startTime = speechTranscript[sTPosition].startTime;
		let endTime =
		  speechTranscript[sTPosition + tempWordsPerBucket - 1].endTime;
  
		// create obj that represents a time frame for speech
		subSpeechTranscript.push({
		  startTime: startTime,
		  endTime: endTime,
		  confidence: 0,
		  speakerTag: 0,
		  word: manualTranscript[k],
		});
		sTPosition += tempWordsPerBucket;
	  }
	  newSpeechTranscript.push(subSpeechTranscript);
	}
	return JSON.stringify(newSpeechTranscript);
  };

  
module.exports.addQuestion = addQuestion;
module.exports.addQuestionIfNew = addQuestionIfNew;
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
module.exports.getStreamTotalVideosCount = getStreamTotalVideosCount;
module.exports.getUserTotalVideosCount = getUserTotalVideosCount;
module.exports.getUserTotalVideoDuration = getUserTotalVideoDuration;
module.exports.searchSuggestion = searchSuggestion;
module.exports.searchRecorded = searchRecorded;
module.exports.savePlayerFeedback = savePlayerFeedback;
module.exports.saveConversationLog = saveConversationLog;
module.exports.canAccessStream = canAccessStream;
module.exports.saveAdaSearch = saveAdaSearch;
module.exports.getAdaSearch = getAdaSearch;
module.exports.getAccessibleStreams = getAccessibleStreams;
module.exports.getVideoDetails = getVideoDetails;
module.exports.getExactMatchVideo = getExactMatchVideo;
module.exports.fetchEmbeddings = getEmbeddings;
module.exports.getVideoLatestIDX = getVideoLatestIDX;
module.exports.addVideoEntry = addVideoEntry;
module.exports.QuestionTypes = QuestionTypes;
module.exports.getEmbeddings = getEmbeddings;
module.exports.matchTranscription = matchTranscription;