const express = require('express');
const router = express.Router();
const {isValidUser} = require('../helper/user_mgmt')
const connection = require("../configs/db-connection");

router.post('/suggestions/:user_id/edit', async (req, res) => {
    const user_id = req.params.user_id || null;
    const question_id = req.body.question_id || null;
    const question_new_value = req.body.new_value || null;

    if (!user_id || !question_id || !question_new_value || typeof question_new_value !== "string" || question_new_value.length <= 0) {
        res.sendStatus(400);
        return;
    }

    isValidUser(user_id).then(async () => {
        try {
            const response = await updateSuggestedQuestion(user_id, question_id, question_new_value);
            res.send(response);
        } catch (e) {
            console.log(e);
            res.sendStatus(400);
        }
    }, (reject) => {
        if (reject === false) console.log("Provided user id doesn't exist");
        res.sendStatus(404);
    });
})

router.post('/suggestions/:user_id/discard', async (req, res) => {
    const user_id = req.params.user_id || null;
    const question_id = req.body.question_id || null;

    if (!user_id || !question_id) {
        res.sendStatus(400);
        return;
    }

    isValidUser(user_id).then(async () => {
        await suggestionSetPending(question_id, user_id, false);
        res.send("OK");
    }, (reject) => {
        if (reject === false) console.log("Provided user id doesn't exist");
        res.sendStatus(404);
    })
});

router.get('/onboarding/:user_id/pending', (req, res) => {
    const user_id = req.params.user_id;
    isValidUser(user_id).then(() => {
        let query = `SELECT id, question, suggested_type as type, onboarding, priority, trigger_suggester FROM questions WHERE onboarding = 1 AND id NOT IN (SELECT videos_questions_streams.id_question as id FROM videos_questions_streams INNER JOIN video ON videos_questions_streams.id_video = video.id_video WHERE video.toia_id = ?)`;
        connection.query(query, [user_id], (err, entries) => {
            if (err) throw err;
            res.send(entries);
        })
    }, (reject) => {
        if (reject === false) console.log("Provided user id doesn't exist");
        res.sendStatus(404);
    })
})

router.get('/onboarding/:user_id/completed', (req, res) => {
    const user_id = req.params.user_id;
    isValidUser(user_id).then(() => {
        let query = `SELECT id, question, suggested_type as type, onboarding, priority, trigger_suggester FROM questions 
                    WHERE onboarding = 1 AND id IN (SELECT videos_questions_streams.id_question as id FROM videos_questions_streams
                                                                                                    INNER JOIN video ON videos_questions_streams.id_video = video.id_video WHERE video.toia_id = ?)`;
        connection.query(query, [user_id], (err, entries) => {
            if (err) throw err;
            res.send(entries);
        })
    }, (reject) => {
        if (reject === false) console.log("Provided user id doesn't exist");
        res.sendStatus(404);
    })
})

router.get('/suggestions/:user_id/pending', (req, res) => {
    const user_id = req.params.user_id;
    isValidUser(user_id).then(() => {
        let query = `SELECT id, question, suggested_type as type, onboarding, priority, trigger_suggester FROM questions 
                    INNER JOIN question_suggestions ON questions.id = question_suggestions.id_question 
                    WHERE question_suggestions.toia_id = ? AND isPending = 1`;
        connection.query(query, [user_id], (err, entries) => {
            if (err) throw err;
            res.send(entries);
        })
    }, (reject) => {
        if (reject === false) console.log("Provided user id doesn't exist");
        res.sendStatus(404);
    })
})

router.post('/answered/delete', (req, res) => {
    const user_id = req.body.user_id || null;
    const ques_id = req.body.question_id || null;
    const video_id = req.body.video_id || null;

    if (!user_id || !ques_id || !video_id) {
        res.sendStatus(400);
        return;
    }

    isValidUser(user_id).then(() => {
        let query = `DELETE FROM videos_questions_streams WHERE id_video = ? AND id_question = ? AND id_video IN (SELECT id_video FROM video WHERE toia_id = ?)`;
        connection.query(query, [video_id, ques_id, user_id], (err, result) => {
            if (err) throw err;
            console.log("Deleted video_id: " + video_id + " question_id: " + ques_id + " of user_id: " + user_id);
            res.sendStatus(200);
        })
    }, (reject) => {
        if (reject === false) console.log("Provided user id doesn't exist");
        res.sendStatus(404);
    })
})

router.get('/answered/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    isValidUser(user_id).then(() => {
        let query = `SELECT questions.*, videos_questions_streams.type, videos_questions_streams.id_video FROM questions 
                    INNER JOIN videos_questions_streams ON videos_questions_streams.id_question = questions.id 
                    WHERE videos_questions_streams.id_video IN (SELECT id_video FROM video WHERE toia_id = ?)`;
        connection.query(query, [user_id], (err, entries) => {
            if (err) throw err;
            res.send(entries);
        })
    }, (reject) => {
        if (reject === false) console.log("Provided user id doesn't exist");
        res.sendStatus(404);
    })
})

router.get('/answered/:user_id/:stream_id', (req, res) => {
    const user_id = req.params.user_id;
    const stream_id = req.params.stream_id;
    isValidUser(user_id).then(() => {
        let query = `SELECT questions.*, videos_questions_streams.id_video, videos_questions_streams.type FROM questions INNER JOIN videos_questions_streams ON videos_questions_streams.id_question = questions.id WHERE videos_questions_streams.id_stream = ?`;
        connection.query(query, [stream_id], (err, entries) => {
            if (err) throw err;
            res.send(entries);
        })
    }, (reject) => {
        if (reject === false) console.log("Provided user id doesn't exist");
        res.sendStatus(404);
    })
})

router.post('/getSmartQuestions', (req,res)=>{

    const avatar_id = req.body.params.avatar_id;
    const stream_id = req.body.params.stream_id;

    // If it is the beginning of the conversation, then return 'dumb' question suggestions
    if (req.body.params.latest_question=="") // This indicates that we are at the beginning of the conversation
    {
        let query = `SELECT questions.question FROM questions 
                    INNER JOIN videos_questions_streams ON videos_questions_streams.id_question = questions.id 
                    WHERE videos_questions_streams.id_stream = ?
                    AND questions.suggested_type IN ("answer", "y/n-answer")
                    AND questions.id NOT IN (19, 20)
                    ORDER BY questions.id ASC
                    LIMIT 5`;

        connection.query(query, [stream_id], (err, entries) => {
            if (err) throw err;
            result = entries.map(entry => entry.question);
            res.send(result);
        });
        return;
    }

    // Actual smart question generation
    // Using GPT-3 in the q_api
    const options = {
        method: 'POST',
        url: `${process.env.SMARTQ_ROUTE}`,
        headers: {'Content-Type': 'application/json'},
        data: {
            new_q: req.body.params.latest_question,
            new_a: req.body.params.latest_answer,
            n_suggestions: 5,
            avatar_id: avatar_id,
            stream_id: req.body.params.stream_id,
        }
    };


    axios.request(options)
    .then((response)=>{
        console.log("==========Question Suggested=========");
        // console.log(response2);
        console.log(response.data.suggestions);
        console.log("=====================================");
        res.send(response.data.suggestions);
    })
    .catch(function (error) {
        console.log("=============== Error with Q_API ============")
        console.log(error);
    });

});

module.exports = router;