const connection = require("../configs/db-connection");
const { isValidUser } = require("../helper/user_mgmt");
const tableName = "tracker";

const Inactivity_Min_Length_Milliseconds = 120000;

// Use class as ENUM for Activity types
class Activity {
	static RecordVideo = new Activity("record-video");
	static UpdateVideo = new Activity("update-video");
	static Login = new Activity("login");

	constructor(name) {
		this.name = name;
	}

	toString() {
		return this.name;
	}
}

const RecordActivity = (
	user_id,
	activity,
	start_time,
	end_time = null,
	video_id = null,
	old_video_id = null,
) => {
	if (!(activity instanceof Activity))
		throw "Tracker: Activity must be an instance of class Activity";
	let query = `INSERT INTO  ${tableName} (user_id, activity, start_time, end_time, video_id, old_video_id) VALUES(${user_id}, "${activity}", '${start_time}', '${end_time}', '${video_id}', '${old_video_id}');`;

	return new Promise(resolve => {
		connection.query(query, (err, entry) => {
			if (err) throw new Error(err);
			resolve(entry.insertId);
		});
	});
};

const getActivity = track_id => {
	const query = `SELECT * FROM ${tableName} WHERE track_id=${track_id};`;
	return new Promise((resolve, reject) => {
		connection.query(query, (error, entries) => {
			if (error) throw new Error(error);
			if (entries.length === 1) {
				resolve(entries[0]);
			} else {
				reject("Tracker: No such activity");
			}
		});
	});
};

const TrackRecordVideo = (user_id, start_time, end_time, video_id) => {
	let activity = Activity.RecordVideo;
	return new Promise(resolve => {
		resolve(
			RecordActivity(user_id, activity, start_time, end_time, video_id),
		);
	});
};

const TrackEditVideo = (
	user_id,
	start_time,
	end_time,
	video_id,
	old_video_id,
) => {
	let activity = Activity.UpdateVideo;
	return new Promise(resolve => {
		resolve(
			RecordActivity(
				user_id,
				activity,
				start_time,
				end_time,
				video_id,
				old_video_id,
			),
		);
	});
};

const RegisterLogin = (
	user_id,
	start_time = +new Date(),
	end_time = +new Date(),
) => {
	return RecordActivity(user_id, Activity.Login, start_time, end_time);
};

const getLastActivityEndTime = (user_id, activity) => {
	if (!(activity instanceof Activity))
		throw "Tracker: Activity must be an instance of class Activity";
	return new Promise(resolve => {
		let query = `SELECT track_id, end_time FROM tracker WHERE user_id = ? AND activity = ? ORDER BY end_time DESC LIMIT 1`;
		connection.query(
			query,
			[user_id, activity.toString()],
			(err, entry) => {
				if (err) throw err;
				if (entry.length === 0) {
					resolve(-1);
				} else {
					resolve({
						end_time: entry[0].end_time,
						track_id: entry[0].track_id,
					});
				}
			},
		);
	});
};

const Ping = user_id => {
	let currentTimestamp = +new Date();

	return new Promise(resolve => {
		isValidUser(user_id)
			.then(() => {
				getLastActivityEndTime(user_id, Activity.Login).then(result => {
					if (result === -1) {
						// First login
						console.log("Tracker: First Login!");
						RegisterLogin(user_id).then(track_id => {
							resolve(track_id);
						});
					} else {
						// Not first login. Check inactivity duration
						const last_end_time = result.end_time;
						const track_id = result.track_id;
						let diff =
							new Date(currentTimestamp) -
							new Date(last_end_time);
						if (diff <= Inactivity_Min_Length_Milliseconds) {
							// Active
							let query = `UPDATE tracker SET end_time = ? WHERE track_id = ?`;
							connection.query(
								query,
								[currentTimestamp, track_id],
								(err, result) => {
									if (err) throw err;
									resolve(track_id);
								},
							);
						} else {
							// Inactive
							console.log("Tracker: New Login!");
							RegisterLogin(user_id).then(track_id => {
								resolve(track_id);
							});
						}
					}
				});
			})
			.catch(reject => {
				if (reject === false)
					console.log("Activity tracker: user doesn't exist!");
				resolve();
			});
	});
};

module.exports.TrackRecordVideo = TrackRecordVideo;
module.exports.TrackEditVideo = TrackEditVideo;
module.exports.Ping = Ping;
