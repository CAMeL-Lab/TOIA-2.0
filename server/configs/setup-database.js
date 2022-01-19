const onboardingQuestions = require("./onboarding-questions.json");
const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: process.argv[2],
    user: process.argv[3],
    password: process.argv[4],
    database: process.argv[5]
});

connection.connect();

function loadOnBoardingQuestions(connectionInstance) {
    let query = `INSERT INTO questions(question, suggested_type, onboarding, priority, trigger_suggester) VALUES(?,?,?,?,?)`;

    for (let ques of onboardingQuestions){
        const {question, type, priority, trigger_suggester} = ques;
        connectionInstance.query(query, [question, type, true, priority, trigger_suggester], function (err, result){
            if (err){
                throw err;
            }
        });
    }
}

// setup database
loadOnBoardingQuestions(connection);


// Close connection
connection.end();