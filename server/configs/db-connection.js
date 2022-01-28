const mysql = require("mysql2");
let connection;
let config;

//Connect to CloudSQL database for Production
if (process.env.ENVIRONMENT === 'production') {

    config = {
        user: process.env.DB_USERNAME,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
    }

    config.socketPath = `/cloudsql/${process.env.DB_INSTANCE_CONNECTION_NAME}`;

    connection = mysql.createConnection(config);

} else if (process.env.ENVIRONMENT === 'development') {
    connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });

    connection.connect();
}

function CloseDB(){
    connection.end();
}

process.on('SIGINT', CloseDB);
process.on('SIGTERM', CloseDB);

module.exports = connection;