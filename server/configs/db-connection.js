const mysql = require("mysql2");
const dotenv = require("dotenv").config({path: "../.env"});
let connection;
let config;

connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

connection.connect();

if(process.env["ROLLBACK"]) {
    connection.query("begin;");
}

function CloseDB(){
    connection.end();
}

process.on('SIGINT', CloseDB);
process.on('SIGTERM', CloseDB);

module.exports = connection;