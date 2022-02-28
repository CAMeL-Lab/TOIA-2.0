const onboardingQuestions = require("./onboarding-questions.json");

const loadOnBoardingQuestions = async (connectionInstance, force_load = false) => {
    let questions_already_loaded = false;

    await (async () => {
        if (!force_load){
            await new Promise((resolve => {
                let get_query = `SELECT * FROM questions WHERE onboarding = 1`;
                connectionInstance.query(get_query, (err, result) => {
                    if (err) throw err;
                    if (result.length > 0) {
                        questions_already_loaded = true;
                    }
                    resolve();
                })
            }))
        }
    })();

    if (!questions_already_loaded) {
        console.log("Loading on-boarding questions");
        // DELETE existing
        let del_query = `DELETE FROM questions WHERE onboarding = 1`;
        connectionInstance.query(del_query, (err) => {
            if (err) throw err;

            // Load
            let query = `INSERT INTO questions(question, suggested_type, onboarding, priority, trigger_suggester) VALUES(?,?,?,?,?)`;

            for (let ques of onboardingQuestions) {
                const {question, type, priority, trigger_suggester} = ques;
                connectionInstance.query(query, [question, type, true, priority, trigger_suggester], function (err, result) {
                    if (err) {
                        throw err;
                    }
                });
            }
        });
    } else {
        console.log("========== on-boarding questions already loaded! ===========");
    }
}

module.exports = loadOnBoardingQuestions;