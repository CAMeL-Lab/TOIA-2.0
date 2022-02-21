const connection = require('../configs/db-connection');
const tableName = 'tracker';

// Use class as ENUM for Activity types
class Activity {
    static RecordVideo = new Activity("record-video")
    static UpdateVideo = new Activity("update-video")

    constructor(name) {
        this.name = name
    }

    toString(){
        return this.name;
    }
}

const RecordActivity = (user_id, activity, start_time, end_time = null, video_id = null, old_video_id = null) => {
    if (!(activity instanceof Activity)) throw "Activity must be an instance of class Activity";
    let query = `INSERT INTO  ${tableName} (user_id, activity, start_time, end_time, video_id, old_video_id) VALUES(${user_id}, "${activity}", '${start_time}', '${end_time}', '${video_id}', '${old_video_id}');`;

    return new Promise(((resolve) => {
        connection.query(query, (err, entry) => {
            if (err) throw new Error(err);
            resolve(entry.insertId);
        });
    }))
}

const getActivity = (track_id) => {
    const query = `SELECT * FROM ${tableName} WHERE track_id=${track_id};`;
    return new Promise(((resolve, reject) => {
        connection.query(query, (error, entries) => {
            if (error) throw new Error(error);
            if (entries.length === 1) {
                resolve(entries[0]);
            } else {
                reject("No such activity");
            }
        });
    }))
}

const TrackRecordVideo = (user_id, start_time, end_time, video_id) => {
    let activity = Activity.RecordVideo;
    return new Promise((resolve => {
        resolve(RecordActivity(user_id, activity, start_time, end_time, video_id));
    }))
}

const TrackEditVideo = (user_id, start_time, end_time, video_id, old_video_id) => {
    let activity = Activity.UpdateVideo;
    return new Promise(resolve => {
        resolve(RecordActivity(user_id, activity, start_time, end_time, video_id, old_video_id));
    })
}


module.exports.TrackRecordVideo = TrackRecordVideo;
module.exports.TrackEditVideo = TrackEditVideo;