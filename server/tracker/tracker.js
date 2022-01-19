const router = require('express').Router();
const assert = require('assert');
var moment = require('moment');

const connection = require('../configs/db-connection');

const tableName = 'tracker';

const start = (req, res) => {
    if (req.method !== "POST") {
        console.log("Error: Tracker Can't Run Without POST Request");
        res.status(500).send("Error: Tracker Can't Run Without POST Request");
    } else {
        let currentTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

        insertActivity(req.body.user_id, req.body.activity, currentTime).then(track_id => {
            res.json({
                "track_id":track_id
            });
        });
    }
}

const end = (req, res) => {
    if (req.method !== "POST") {
        console.log("Error: Tracker Can't Run Without POST Request");
        res.status(500).send("Error: Tracker Can't Run Without POST Request");
    } else {
        getActivity(req.body.track_id).then(activity => {
            if (activity.end_time == null){
                let currentTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
                const query = `UPDATE ${tableName} SET end_time='${currentTime}' WHERE track_id=${req.body.track_id};`;

                connection.query(query, (err,entry)=>{
                    if (err) throw new Error(err);
                    assert(entry.affectedRows === 1);
                    res.status(200).send("Updated!");
                });
            } else {
                res.status(403).send("Activity Already Ended!")
            }
        }).catch(error => {
            res.status(403).send("Activity Not Found!");
        });
    }
}

const notify = (req, res) => {
    if (req.method !== "POST") {
        console.log("Error: Tracker Can't Run Without POST Request");
        res.status(500).send("Error: Tracker Can't Run Without POST Request");
    } else {
        let currentTime = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');

        insertActivity(req.body.user_id, req.body.activity, currentTime, currentTime).then(track_id => {
            res.json({
                "track_id":track_id
            });
        });
    }
}

const insertActivity = (user_id, activity, start_time, end_time=null) => {
    var query = `INSERT INTO  ${tableName} (user_id, activity, start_time) VALUES(${user_id}, "${activity}", '${start_time}');`;
    if (end_time != null)  query = `INSERT INTO  ${tableName} (user_id, activity, start_time, end_time) VALUES(${user_id}, "${activity}", '${start_time}', '${end_time}');`;

    return new Promise(((resolve, reject) => {
        connection.query(query, (err,entry)=>{
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

router.use('/start', start);
router.use('/end', end);
router.use('/notify', notify);

module.exports = router;