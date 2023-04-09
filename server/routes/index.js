require('dotenv').config()

const express = require('express');
const router = express.Router();
const onboardingQuestions = require("../configs/onboarding-questions.json");

const questions = require('./questions');
router.use('/questions',questions);

const amqp = require('amqplib');
const cors = require("cors");
const multiparty = require("multiparty");
const {
	emailExists,
	isEditing,
	isSaveAsNew,
	getQuestionInfo,
	isSuggestedQuestion,
	suggestionSetPending,
	isOnBoardingQuestion,
	isRecorded,
	addQuestion,
	linkStreamVideoQuestion,
	shouldTriggerSuggester,
	isValidUser,
	saveSuggestedQuestion,
	updateSuggestedQuestion,
	getStreamInfo,
	getStreamTotalVideosCount,
	getUserTotalVideosCount,
	getUserTotalVideoDuration,
	searchRecorded,
	searchSuggestion,
	savePlayerFeedback,
	saveConversationLog,
	canAccessStream,
	saveAdaSearch,
	getAdaSearch,
	getAccessibleStreams,
	getVideoDetails,
	getExactMatchVideo,
	matchTranscription,
} = require("../helper/user_mgmt");
const bcrypt = require("bcrypt");
const connection = require("../configs/db-connection");
const mkdirp = require("mkdirp");
const fs = require("fs");
const axios = require("axios");
const crypto = require("crypto");
const stream = require("stream");
const { Buffer } = require("buffer");
const { TrackRecordVideo, TrackEditVideo } = require("../tracker/tracker");
const { Storage } = require("@google-cloud/storage");
const path = require("path");
const mv = require("mv");

const logger = require("../logger/index");

// setting up the salt rounds for bcrypt
const saltRounds = 12;

const gc = new Storage({
	keyFilename: process.env.GOOGLE_CLOUD_STORE_CREDENTIALS,
	projectId: "toia-capstone-2021",
});
let videoStore = gc.bucket(process.env.GC_BUCKET);
let subtitleStore = gc.bucket(process.env.SUBTITLES_BUCKET);

// Allow cross-origin get requests
if (process.env.ENVIRONMENT === "production") {
	async function configureBucketCors() {
		const responseHeader = "Content-Type";
		const maxAgeSeconds = 3600;
		const method = "GET";
		const origin =
			process.env.EXPRESS_HOST + ":" + process.env.EXPRESS_PORT;

		await gc.bucket(process.env.SUBTITLES_BUCKET).setCorsConfiguration([
			{
				maxAgeSeconds,
				method: [method],
				origin: [origin],
				responseHeader: [responseHeader],
				credentials: true
			},
		]);

		await gc.bucket(process.env.GC_BUCKET).setCorsConfiguration([
			{
				maxAgeSeconds,
				method: [method],
				origin: [origin],
				responseHeader: [responseHeader],
			},
		]);

		console.log(`Bucket ${process.env.GC_BUCKET} was updated with a CORS config
                  to allow ${method} requests from ${origin} sharing 
                  ${responseHeader} responses across origins`);
		
		console.log(`Bucket ${process.env.SUBTITLES_BUCKET} was updated with a CORS config
                  to allow ${method} requests from ${origin} sharing 
                  ${responseHeader} responses across origins`);		  
	}

	configureBucketCors().catch(console.error);
}

router.post("/createTOIA", cors(), async (req, res) => {
	let form = new multiparty.Form();
	form.parse(req, async function (err, fields, file) {
		// Check if email already exist
		if (await emailExists(fields.email[0])) {
			res.status(400).send("Email already exists");
			return;
		}

		// hashing the password before saving
		const hashedPwd = await bcrypt.hash(fields.pwd[0], saltRounds);

		let queryCreateTOIA = `INSERT INTO toia_user(first_name, last_name, email, password, language) VALUES("${fields.firstName[0]}","${fields.lastName[0]}","${fields.email[0]}","${hashedPwd}","${fields.language[0]}");`;
		connection.query(queryCreateTOIA, (err, entry) => {
			if (err) {
				throw err;
			} else {
				let queryAllStream = `INSERT INTO stream(name, toia_id, private, likes, views) VALUES("All",${entry.insertId},0,0,0);`;
				connection.query(queryAllStream, async (err, stream_entry) => {
					if (err) {
						throw err;
					} else {
						return new Promise(async resolve => {
							// save file to local storage during development
							if (process.env.ENVIRONMENT === "development") {
								let dest = `Accounts/${fields.firstName[0]}_${entry.insertId}/StreamPic/`;
								let destFileName = `All_${stream_entry.insertId}.jpg`;
								mkdirp(dest).then(() => {
									if (file?.blob?.[0]?.path == undefined){
										resolve();
										return;
									}
									mv(
										file.blob[0].path,
										dest + destFileName,
										error => {
											if (error) throw error;
											resolve();
										},
									);
								});
							} else {
								if (file?.blob?.[0]?.path == undefined){
									resolve();
									return;
								}
								// save file to google cloud when in production
								await videoStore.upload(file.blob[0].path, {
									destination: `Accounts/${fields.firstName[0]}_${entry.insertId}/StreamPic/All_${stream_entry.insertId}.jpg`,
								});
								resolve();
							}
						}).then(() => {
							res.send({
								new_toia_ID: entry.insertId,
								first_name: fields.firstName[0], // This is used for running tests.
							});
						});
					}
				});
			}
		});
	});
});

router.post("/login", cors(), (req, res) => {
	let query_checkEmailExists = `SELECT COUNT(*) AS cnt
                                  FROM toia_user
                                  WHERE email = "${req.body.email}";`;

	connection.query(query_checkEmailExists, (err, entry) => {
		if (err) {
			throw err;
		} else {
			if (entry[0].cnt === 0) {
				res.send("-1");
			} else {
				let query_checkPasswordCorrect = `SELECT *
                                                  FROM toia_user
                                                  WHERE email = "${req.body.email}";`;

				connection.query(
					query_checkPasswordCorrect,
					async (err, entry) => {
						if (err) {
							throw err;
						} else {
							// checking for password validity
							const isValidPassword = await bcrypt.compare(
								req.body.pwd,
								entry[0].password,
							);
							if (isValidPassword) {
								let userData = {
									toia_id: entry[0].id,
									firstName: entry[0].first_name,
									language: entry[0].language,
								};

								res.send(userData);
							} else {
								res.send("-2");
							}
						}
					},
				);
			}
		}
	});
});

router.get("/getAllStreams", cors(), (req, res) => {
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
                            ORDER BY stream.name ASC;`;
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
				action: "read",
				expires: "07-14-2025",
			};

			function callback() {
				res.send(entries);
			}

			entries.forEach(entry => {
				// send local storage image when in development
				if (process.env.ENVIRONMENT === "development") {
					entry.pic = `/${entry.first_name}_${entry.id}/StreamPic/${entry.name}_${entry.id_stream}.jpg`;
					counter++;

					if (counter === entries.length) {
						callback();
					}
					return;
				}

				videoStore
					.file(
						`Accounts/${entry.first_name}_${entry.id}/StreamPic/${entry.name}_${entry.id_stream}.jpg`,
					)
					.getSignedUrl(config, function (err, url) {
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

router.post("/getUserSuggestedQs", cors(), (req, res) => {
	let limitQuestions = 0;

	let query_fetchSuggestions = `SELECT question_suggestions.id_question, questions.question, questions.suggested_type as type, questions.priority
                                  FROM questions
                                  INNER JOIN question_suggestions ON question_suggestions.id_question = questions.id
                                  WHERE question_suggestions.toia_id = ? AND question_suggestions.isPending = 1
                                  ORDER BY questions.priority DESC;`;
	let query_params = [req.body.params.toiaID];

	if (req.body.params.limit !== undefined) {
		limitQuestions = req.body.params.limit;
		query_fetchSuggestions = `SELECT question_suggestions.id_question, questions.question, questions.suggested_type as type, questions.priority
                                  FROM questions
                                  INNER JOIN question_suggestions ON question_suggestions.id_question = questions.id
                                  WHERE question_suggestions.toia_id = ? AND question_suggestions.isPending = 1
                                  ORDER BY questions.priority DESC LIMIT ?;`;
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
				action: "read",
				expires: "07-14-2025",
			};

			function callback() {
				res.send(entries);
			}

			// TODO: No longer need thumbnail
			entries.forEach(entry => {
				// send local storage image when in development
				if (process.env.ENVIRONMENT === "development") {
					entry.pic = `/Placeholder/questionmark.jpg`;
					count++;

					if (count === entries.length) {
						callback();
					}
					return;
				}

				videoStore
					.file(`Placeholder/questionmark.png`)
					.getSignedUrl(config, function (err, url) {
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

router.post("/removeSuggestedQ", cors(), (req, res) => {
	// TODO: don't remove. Mark as done
	let query_removeSuggestedQ = `DELETE
                                  FROM question_suggestions
                                  WHERE id_question = "${req.body.params.suggestedQID}";`;
	connection.query(query_removeSuggestedQ, err => {
		if (err) {
			throw err;
		} else {
			res.send("Deleted successfully!");
		}
	});
});

router.post("/getUserVideos", cors(), (req, res) => {
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
				action: "read",
				expires: "07-14-2025",
			};

			function callback() {
				res.send(entries);
			}

			if (cnt === entries.length) {
				callback();
			}

			// TODO: Thumbnails not needed anymore
			entries.forEach(entry => {
				// send local storage image when in development
				if (process.env.ENVIRONMENT === "development") {
					entry.pic = `/${req.body.params.toiaName}_${
						req.body.params.toiaID
					}/VideoThumb/${entry.id_video + ".jpg"}`;
					cnt++;

					if (cnt === entries.length) {
						callback();
					}
					return;
				}

				videoStore
					.file(
						`Accounts/${req.body.params.toiaName}_${req.body.params.toiaID}/VideoThumb/${entry.id_video}`,
					)
					.getSignedUrl(config, function (err, url) {
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

router.post("/getUserStreams", cors(), async (req, res) => {
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
				action: "read",
				expires: "07-14-2025",
			};

			function callback() {
				res.send(entries);
			}

			for (const entry of entries) {
				entry.videos_count = await getStreamTotalVideosCount(
					req.body.params.toiaID,
					entry.id_stream,
				);

				// send local storage image when in development
				if (process.env.ENVIRONMENT === "development") {
					entry.pic = `/${req.body.params.toiaName}_${req.body.params.toiaID}/StreamPic/${entry.name}_${entry.id_stream}.jpg`;
					counter++;

					if (counter === entries.length) {
						callback();
					}
					continue;
				}

				// send gcloud image when in production
				videoStore
					.file(
						`Accounts/${req.body.params.toiaName}_${req.body.params.toiaID}/StreamPic/${entry.name}_${entry.id_stream}.jpg`,
					)
					.getSignedUrl(config, function (err, url) {
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
			}
		}
	});
});

router.post("/createNewStream", cors(), (req, res) => {
	let privacySetting = 0;
	let form = new multiparty.Form();

	form.parse(req, function (err, fields, file) {
		if (fields.newStreamName[0] === "All") {
			res.status(400).send("Stream With Name 'All' Already Exists");
			return;
		}

		if (fields.newStreamPrivacy[0] === "private") {
			privacySetting = 1;
		}

		let query_createStream = `INSERT INTO stream(name, toia_id, private, likes, views)
                                  VALUES ("${fields.newStreamName[0]}", ${fields.toiaID[0]}, ${privacySetting}, 0, 0)`;

		connection.query(query_createStream, async (err, entry) => {
			if (err) {
				throw err;
			} else {
				// save file to local storage during development
				if (process.env.ENVIRONMENT === "development") {
					let dest = `Accounts/${fields.toiaName[0]}_${fields.toiaID[0]}/StreamPic/`;
					let destFileName = `${fields.newStreamName[0]}_${entry.insertId}.jpg`;
					mkdirp(dest).then(() => {
						mv(file.blob[0].path, dest + destFileName, error => {
							if (error) {
								console.log(error);
							}
						});
					});
				} else {
					await videoStore.upload(file.blob[0].path, {
						destination: `Accounts/${fields.toiaName[0]}_${fields.toiaID[0]}/StreamPic/${fields.newStreamName[0]}_${entry.insertId}.jpg`,
					});
				}

				let query_allStreamsUpdated = `SELECT *
                                               FROM stream
                                               WHERE toia_id = "${fields.toiaID[0]}";`;

				connection.query(
					query_allStreamsUpdated,
					async (err, entries, field) => {
						if (err) {
							throw err;
						} else {
							let counter = 0;

							const config = {
								action: "read",
								expires: "07-14-2025",
							};

							function callback() {
								res.send(entries);
							}

							for (const streamEntry of entries) {
								streamEntry.videos_count =
									await getStreamTotalVideosCount(
										fields.toiaID[0],
										streamEntry.id_stream,
									);

								// send local storage image when in development
								if (process.env.ENVIRONMENT === "development") {
									streamEntry.pic = `/${fields.toiaName[0]}_${fields.toiaID[0]}/StreamPic/${streamEntry.name}_${streamEntry.id_stream}.jpg`;
									counter++;

									if (counter === entries.length) {
										callback();
									}
									continue;
								}

								videoStore
									.file(
										`Accounts/${fields.toiaName[0]}_${fields.toiaID[0]}/StreamPic/${streamEntry.name}_${streamEntry.id_stream}.jpg`,
									)
									.getSignedUrl(config, function (err, url) {
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
							}
						}
					},
				);
			}
		});
	});
});

router.post("/getVideoPlayback", cors(), (req, res) => {
	let query_getTOIAInfo = `SELECT *
                             FROM video
                             INNER JOIN toia_user ON video.toia_id = toia_user.id
                             WHERE video.id_video = ?`;

	connection.query(
		query_getTOIAInfo,
		[req.body.params.playbackVideoID],
		(err, entries) => {
			if (err) {
				throw err;
			} else {
				if (entries.length === 0) {
					res.sendStatus(400);
					return;
				}

				const config = {
					action: "read",
					expires: "07-14-2025",
				};

				if (process.env.ENVIRONMENT === "development") {
					let vidPrivacy;
					let url = `/${entries[0].first_name}_${entries[0].id}/Videos/${req.body.params.playbackVideoID}`;

					if (entries[0].private === 0) {
						vidPrivacy = "Public";
					} else {
						vidPrivacy = "Private";
					}

					let dataObj = {
						videoURL: url,
						videoAnswer: entries[0].answer,
						videoPrivacy: vidPrivacy,
					};

					res.send(dataObj);
					return;
				}

				videoStore
					.file(
						`Accounts/${entries[0].first_name}_${entries[0].id}/Videos/${req.body.params.playbackVideoID}`,
					)
					.getSignedUrl(config, function (err, url) {
						if (err) {
							console.error(err);
						} else {
							let vidPrivacy;

							if (entries[0].private === 0) {
								vidPrivacy = "Public";
							} else {
								vidPrivacy = "Private";
							}

							let dataObj = {
								videoURL: url,
								videoAnswer: entries[0].answer,
								videoPrivacy: vidPrivacy,
							};

							res.send(dataObj);
						}
					});
			}
		},
	);
});

router.post("/fillerVideo", cors(), (req, res) => {
	const streamID = req.body.params.streamIdToTalk || null;

	if (!streamID) {
		res.sendStatus(417);
		return;
	}

	let query_getFiller = `SELECT * FROM questions 
                            INNER JOIN videos_questions_streams ON videos_questions_streams.id_question = questions.id
                            INNER JOIN video ON video.id_video = videos_questions_streams.id_video
                            WHERE videos_questions_streams.type = ? AND videos_questions_streams.id_stream = ?`;

	connection.query(
		query_getFiller,
		["filler", streamID],
		async (err, entries) => {
			if (err) {
				throw err;
			} else {
				if (entries.length === 0) {
					res.status(400).send("No Videos");
					return;
				}

				const config = {
					action: "read",
					expires: "07-14-2025",
				};

				const filler_video_id =
					entries[Math.floor(Math.random() * entries.length)]
						.id_video;

				if (
					req.body.params.record_log &&
					req.body.params.record_log === "true"
				) {
					let interactor_id = req.body.params.interactor_id || null;
					await saveConversationLog(
						interactor_id,
						req.body.params.toiaIDToTalk,
						true,
						null,
						filler_video_id,
					);
				}

				if (process.env.ENVIRONMENT === "development") {
					res.send(
						`/${req.body.params.toiaFirstNameToTalk}_${req.body.params.toiaIDToTalk}/Videos/${filler_video_id}`,
					);
					return;
				}

				videoStore
					.file(
						`Accounts/${req.body.params.toiaFirstNameToTalk}_${req.body.params.toiaIDToTalk}/Videos/${filler_video_id}`,
					)
					.getSignedUrl(config, function (err, url) {
						if (err) {
							console.error(err);
						} else {
							res.send(url);
						}
					});
			}
		},
	);
});

router.post("/player", cors(), async (req, res) => {
	const question = req.body.params.question.current;
	const stream_id = req.body.params.streamIdToTalk;
	const avatar_id = req.body.params.toiaIDToTalk;
	const language = req.body.params.language;

	const exactMatch = await getExactMatchVideo(stream_id, question);

	let videoDetails;
	if (exactMatch === null) {
		try {
			console.log(`${process.env.DM_ROUTE}`);
			videoDetails = await axios.post(`${process.env.DM_ROUTE}`, {
				params: {
					query: question,
					avatar_id: avatar_id,
					stream_id: stream_id,
				},
			});
		} catch (err) {
			res.send("error");
			console.log(err);
			return;
		}
	} else {
		videoDetails = {
			data: {
				ada_similarity_score: null,
				id_video: exactMatch["id_video"],
				answer: exactMatch["answer"],
				language: exactMatch["language"],
			},
		};
	}

	const ada_similarity_score = videoDetails.data.ada_similarity_score;

	const config = {
		action: "read",
		expires: "07-14-2025",
	};

	const player_video_id = videoDetails.data.id_video;
	const videoInfo = await getVideoDetails(player_video_id);
	const conversation_mode = req.body.params.mode || null;

	if (
		req.body.params.record_log &&
		req.body.params.record_log === "true" &&
		player_video_id !== "204"
	) {
		let interactor_id = req.body.params.interactor_id || null;
		await saveConversationLog(
			interactor_id,
			req.body.params.toiaIDToTalk,
			false,
			req.body.params.question.current,
			player_video_id,
			ada_similarity_score,
			conversation_mode,
		);
	}

	const videoName = player_video_id.split('.').slice(0,-1).join('');

	if (process.env.ENVIRONMENT === "development") {
		if (videoDetails.data.id_video === "204") {
			res.send("error");
			return;
		}
		console.log(`vtts/${videoName}-${videoDetails.data.language}.vtt`);
		res.send({
			url: `/${req.body.params.toiaFirstNameToTalk}_${req.body.params.toiaIDToTalk}/Videos/${player_video_id}`,
			answer: videoDetails.data.answer,
			duration_seconds: videoInfo.duration_seconds,
			video_id: player_video_id,
			language: videoDetails.data.language,
			vtt_url: `vtts/${videoName}-${language}.vtt`,
			// vtt_url: `/Transcripts/`
		});
		return;
	}

	let videoUrl;
	let subtitleUrl;
	videoStore
		.file(
			`Accounts/${req.body.params.toiaFirstNameToTalk}_${req.body.params.toiaIDToTalk}/Videos/${player_video_id}`,
		)
		.getSignedUrl(config, function (err, url) {
			videoUrl = url;
			if (err) {
				console.error(err);
			}
			subtitleStore
				.file(
					`${videoName}-${language}.vtt`,
				)
				.getSignedUrl(config, function (err, url) {
					subtitleUrl = url;
					if (err) {
						console.error(err);
					}
					res.send({
						videoUrl,
						answer: videoDetails.data.answer,
						duration_seconds: videoInfo.duration_seconds,
						video_id: player_video_id,
						language: videoDetails.data.language,
						vtt_url: subtitleUrl,
					});
				});
		});
});

// All create and update video requests pass through this middleware that performs necessary operation and then falls back to downstream routes
router.use("/recorder", cors(), async (req, res, next) => {
	const form = new multiparty.Form();

	form.parse(req, (err, fields, file) => {
		req.fields = fields;
		req.file = file;

		// TODO: Delete files
		if (isEditing(req)) {
			if (isSaveAsNew(req)) {
				next();
			} else {
				if (
					!fields.hasOwnProperty("old_video_id") ||
					!fields.hasOwnProperty("old_video_type")
				) {
					res.status(400).send("Old Video ID or Type Not Provided!");
				} else {
					const oldVideoID = fields.old_video_id;
					const oldType = fields.old_video_type;
					const userId = fields.id[0];

					let query = `DELETE FROM videos_questions_streams WHERE id_video = ? AND type = ? AND id_video IN (SELECT id_video FROM video WHERE toia_id = ?)`;
					connection.query(
						query,
						[oldVideoID, oldType, userId],
						async (err, result) => {
							if (err) throw err;
							console.log("Deleted old entries!");
							next();
						},
					);
				}
			}
		} else {
			next();
		}
	});
});

router.post("/recorder", cors(), async (req, res) => {
	let isPrivate;
	let vidIndex;
	let videoStreams;

    const fields = req.fields;
    const file = req.file;
    let answer = fields.answer[0].trim();
    let results = req.fields.results;
    let language = req.fields.language;

	// Append the answer with '.' if necessary
	if (
		answer.slice(-1) !== "." &&
		answer.slice(-1) !== "!" &&
		answer.slice(-1) !== "?"
	)
		answer = answer + ".";

	if (fields.private[0] === "false") {
		isPrivate = 0;
	} else if (fields.private[0] === "true") {
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

	if (!fields.hasOwnProperty("video_duration")) {
		console.log("Error: video duration not set!");
		res.sendStatus(400).send("Something went wrong!");
		return;
	}

	const video_duration = parseInt(fields.video_duration[0]);

	console.log(video_duration);

	let query_getNextIndex = `SELECT MAX(idx) AS maxIndex
                              FROM video;`;
	connection.query(query_getNextIndex, async (err, entry) => {
		if (err) {
			throw err;
		} else {
			if (entry[0].maxIndex == null) {
				vidIndex = 0;
			} else {
				vidIndex = entry[0].maxIndex + 1;
			}

			crypto.pseudoRandomBytes(32, async function (err, raw) {
				let videoID =
					fields.name[0] +
					"_" +
					fields.id[0] +
					"_" +
					vidIndex +
					"_" +
					(raw.toString("hex") + Date.now()).slice(0, 8) +
					".mp4";

				let bufferStream = new stream.PassThrough();
				bufferStream.end(
					Buffer.from(
						fields.thumb[0].replace(/^data:image\/\w+;base64,/, ""),
						"base64",
					),
				);
				
				console.log("================");
				console.log(results);
				try{
					results = matchTranscription(results, answer);
				} catch (err) {
					console.error("Problem with matching transcription with text");
					console.log(results);
					console.error(err);
				}

				console.log(results);

				if(answer != "" && results.length > 0){

					console.log("Sending transcript for translation");
					// RabbitMQ setup
					const rabbitconn = await amqp.connect(`amqp://${process.env.RMQ_USERNAME}:${process.env.RMQ_PASSWORD}@rabbitmq:5672`);
					const ch = await rabbitconn.createChannel();
					const q = "translate_transcript"

					await ch.assertQueue(q, {durable: true});

					let languages_supported = ['es-ES', 'ar-AE', 'fr-FR', 'en-US'];
					languages_supported = languages_supported.filter(language_code => language_code != language);

					const payload = {
						"translate_to": languages_supported,
						"results": JSON.parse(results) ,
						"video_name": videoID,
						"input_language": language[0],
					}

					ch.sendToQueue(q, Buffer.from(JSON.stringify(payload)));

				}


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

					bufferStream
						.pipe(
							videoThumbFile.createWriteStream({
								metadata: {
									contentType: "image/jpeg",
								},
							}),
						)
						.on("error", function (err) {
							throw err;
						})
						.on("finish", () => {
							console.log("Thumbnail uploaded!");
						});
				}

				// save file to local storage during development
				if (process.env.ENVIRONMENT === "development") {
					let dest = `Accounts/${fields.name[0]}_${fields.id[0]}/Videos/`;
					let destFileName = videoID;
					mkdirp(dest).then(() => {
						mv(file.blob[0].path, dest + destFileName, error => {
							if (error) {
								console.log(error);
							}
						});
					});
				} else {
					// save file to google cloud when in production
					await videoStore.upload(file.blob[0].path, {
						destination: `Accounts/${fields.name[0]}_${fields.id[0]}/Videos/${videoID}`,
					});
				}

				let query_saveVideo = `INSERT INTO video(id_video, toia_id, idx, private, answer, language, likes, views, duration_seconds)
                                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`;

				connection.query(
					query_saveVideo,
					[
						videoID,
						fields.id[0],
						vidIndex,
						isPrivate,
						answer,
						fields.language[0],
						0,
						0,
						video_duration,
					],
					async err => {
						if (err) {
							throw err;
						} else {
							console.log("Video entry created in database");

							for (const q of questionsObj) {
								let q_id = q.id_question || -1;
								let questionInfo = await getQuestionInfo(q_id);

								if (
									questionInfo &&
									questionInfo.question !== q.question
								) {
									q_id = -1;
								}

								if (
									await isSuggestedQuestion(
										q_id,
										fields.id[0],
									)
								) {
									console.log(
										"Recorded a suggested question!",
									);
									await suggestionSetPending(
										q_id,
										fields.id[0],
										false,
									);
								} else {
									let on_board = await isOnBoardingQuestion(
										q_id,
									);
									if (
										!on_board ||
										(on_board &&
											(await isRecorded(
												q_id,
												fields.id[0],
											)))
									) {
										console.log("Added question manually!");
										q_id = await addQuestion(
											q.question,
											fields.videoType[0],
										);
									} else {
										console.log(
											"Recorded an on-boarding question!",
										);
									}
								}

								for (const streamToLink of videoStreams) {
									await linkStreamVideoQuestion(
										streamToLink.id,
										videoID,
										q_id,
										fields.videoType[0],
									);
								}

								//Generate suggested questions
								if (
									(await shouldTriggerSuggester(q_id)) &&
									!isEditing(req)
								) {
									const options = {
										method: "POST",
										url: process.env.Q_API_ROUTE,
										headers: {
											"Content-Type": "application/json",
										},
										data: {
											new_q: q.question,
											new_a: answer,
											n_suggestions: 3,
											avatar_id: fields.id[0],
											callback_url:
												req.protocol +
												"://" +
												req.get("host") +
												"/api/saveSuggestedQuestion/" +
												fields.id[0],
										},
									};

									axios
										.request(options)
										.catch(function (error) {
											console.log(
												"=============== Error with Q_API ============",
											);
											console.log(error);
										});
								}
							}

							// Track
							if (
								fields.hasOwnProperty("start_time") &&
								fields.hasOwnProperty("end_time")
							) {
								let start_time = fields.start_time;
								let end_time = fields.end_time;
								if (isEditing(req)) {
									if (isSaveAsNew(req)) {
										await TrackRecordVideo(
											fields.id[0],
											start_time,
											end_time,
											videoID,
										);
									} else {
										await TrackEditVideo(
											fields.id[0],
											start_time,
											end_time,
											videoID,
											fields.old_video_id,
										);
									}
								} else {
									await TrackRecordVideo(
										fields.id[0],
										start_time,
										end_time,
										videoID,
									);
								}
							} else {
								console.log("Untracked recording!");
							}

							res.send("Success");
						}
					},
				);
			});
		}
	});
});

router.post('/getLastestQuestionSuggestion', cors(), (req, res) => {
    const query_fetchSuggestions = `SELECT question_suggestions.id_question, questions.question, questions.suggested_type as type
                                  FROM question_suggestions
                                  INNER JOIN questions ON questions.id = question_suggestions.id_question
                                  WHERE question_suggestions.toia_id = ? AND question_suggestions.isPending = 1
                                  ORDER BY question_suggestions.id_question DESC LIMIT 1;`;
	connection.query(
		query_fetchSuggestions,
		[req.body.params.toiaID],
		(err, entries) => {
			if (err) throw err;
			if (entries.length === 0) {
				res.sendStatus(404);
				return;
			}

			let count = 0;

			const config = {
				action: "read",
				expires: "07-14-2025",
			};

			function callback() {
				res.send(entries[0]);
			}

			// TODO: Won't need thumbnails
			entries.forEach(entry => {
				// send local storage image when in development
				if (process.env.ENVIRONMENT === "development") {
					entry.pic = `/Placeholder/questionmark.jpg`;
					count++;

					if (count === entries.length) {
						callback();
					}
					return;
				}

				videoStore
					.file(`Placeholder/questionmark.png`)
					.getSignedUrl(config, function (err, url) {
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
		},
	);
});

router.post("/saveSuggestedQuestion/:user_id", (req, res) => {
	const user_id = req.params.user_id;
	isValidUser(user_id).then(
		success => {
			if (
				req.body.q === undefined ||
				typeof req.body.q !== "string" ||
				req.body.q.trim().length <= 1
			) {
				res.sendStatus(400);
				return;
			}

			searchRecorded(req.body.q, user_id).then(entries => {
				if (entries.length === 0) {
					searchSuggestion(req.body.q, user_id).then(entries => {
						if (entries.length === 0) {
							saveSuggestedQuestion(user_id, req.body.q).then(
								() => {
									res.sendStatus(200);
								},
								() => {
									res.sendStatus(500);
								},
							);
						} else {
							console.log("Suggestion already exists!");
							res.sendStatus(200);
						}
					});
				} else {
					console.log("Question already recorded!");
					res.sendStatus(200);
				}
			});
		},
		reject => {
			if (reject === false) console.log("Provided user id doesn't exist");
			res.sendStatus(404);
		},
	);
});

router.get('/videos/:user_id/', async (req, res) => {
    const user_id = req.params.user_id;
    const video_id = req.query.video_id || null;
    const type = req.query.type || null;

	isValidUser(user_id).then(
		() => {
			let query = `SELECT * FROM videos_questions_streams WHERE id_video = ? AND id_video IN (SELECT id_video FROM video WHERE toia_id = ?) AND type = ?`;
			connection.query(
				query,
				[video_id, user_id, type],
				async (err, entries) => {
					if (err) throw err;
					let unique_questions = entries.filter(
						(entry, index) =>
							entries.findIndex(
								s => entry.id_question === s.id_question,
							) === index,
					);
					let unique_streams = entries.filter(
						(entry, index) =>
							entries.findIndex(
								s => entry.id_stream === s.id_stream,
							) === index,
					);

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
						streams: streams_list,
					};

					res.send(response_obj);
				},
			);
		},
		reject => {
			if (reject === false) console.log("Provided user id doesn't exist");
			res.sendStatus(404);
		},
	);
});

//getting user data to populate settings
router.post("/getUserData", cors(), (req, res) => {
	let query_getUserData = `SELECT *
                                FROM toia_user
                                WHERE id = "${req.body.params.toiaID}";`;
	connection.query(query_getUserData, (err, entries, fields) => {
		if (err) {
			throw err;
		}
		console.log("user data sent!");
		res.send(Object.values(entries));
	});
});

// Get total number of videos that a user has recorded
router.post("/getUserVideosCount", cors(), (req, res) => {
	let user_id = req.body.user_id;

	isValidUser(user_id).then(
		async () => {
			let videos_count = await getUserTotalVideosCount(user_id);
			res.send({ count: videos_count });
		},
		reject => {
			if (reject === false) console.log("Provided user id doesn't exist");
			res.sendStatus(404);
		},
	);
});

// Get total number of videos that a user has recorded for a particular stream
router.post("/getStreamVideosCount", cors(), (req, res) => {
	let user_id = req.body.user_id;
	let stream_id = req.body.stream_id;

	isValidUser(user_id).then(
		async () => {
			let videos_count = await getStreamTotalVideosCount(
				user_id,
				stream_id,
			);
			res.send({ count: videos_count });
		},
		reject => {
			if (reject === false) console.log("Provided user id doesn't exist");
			res.sendStatus(404);
		},
	);
});

// Get total video duration of a user
router.post("/getTotalVideoDuration", cors(), (req, res) => {
	let user_id = req.body.user_id;

	isValidUser(user_id).then(
		async () => {
			let total_duration = await getUserTotalVideoDuration(user_id);
			res.send({
				total_duration: total_duration,
			});
		},
		reject => {
			if (reject === false) console.log("Provided user id doesn't exist");
			res.sendStatus(404);
		},
	);
});

router.post("/save_player_feedback", cors(), async (req, res) => {
	let user_id = req.body.user_id || null;
	let video_id = req.body.video_id || null;
	let question = req.body.question.toString() || null;
	let rating = req.body.rating || null;
	let userValid = false;

	console.log(video_id, question, rating);

	if (video_id != null && question != null && rating != null) {
		try {
			userValid = await isValidUser(user_id);
		} catch (e) {
			userValid = false;
		}

		if (userValid) {
			savePlayerFeedback(video_id, question, rating, user_id).then(() => {
				res.sendStatus(200);
			});
		} else {
			savePlayerFeedback(video_id, question, rating).then(() => {
				res.sendStatus(200);
			});
		}
	} else {
		res.sendStatus(401);
	}
});

// route to check if a user can access certain stream. Replace when a proper authentication system is in place.
router.post("/permission/stream", cors(), async (req, res) => {
	const user_id = req.body.user_id || null;
	const stream_id = req.body.stream_id || null;

	if (user_id === null || stream_id === null) {
		logger.debug(
			"User/Stream id not provided when checking access permission",
		);
		res.sendStatus(401);
	} else {
		let hasAccess = await canAccessStream(user_id, stream_id);

		if (hasAccess) {
			res.sendStatus(200);
		} else {
			res.sendStatus(401);
		}
	}
});

// Returns all the streams that can be accessed by the user
router.get("/permission/streams", async (req, res) => {
	const user_id = req.query.user_id || null;

	if (user_id === null) {
		logger.debug(
			"User id not provided when requested for accessible streams",
		);
		res.sendStatus(401);
	} else {
		try {
			res.send(await getAccessibleStreams(user_id));
		} catch (e) {
			logger.error("Something went wrong: ", e);
			res.send(401);
		}
	}
});

// The following route is deprecated. Mutate the db directly instead.
router.post("/saveAdaSearch", cors(), async (req, res) => {
	const video_id = req.body.video_id;
	const question_id = req.body.question_id;
	const data = req.body.ada_search;

	if ((await saveAdaSearch(data, question_id, video_id)) === true) {
		res.sendStatus(200);
	} else {
		res.sendStatus(403);
	}
});

router.post("/getAdaSearch", cors(), async (req, res) => {
	const video_id = req.body.video_id;
	const question_id = req.body.question_id;

	let data = await getAdaSearch(question_id, video_id);
	if (data === null) {
		res.sendStatus(403);
	} else {
		res.send(data);
	}
});

module.exports = router;
