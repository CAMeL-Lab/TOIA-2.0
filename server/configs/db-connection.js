const mysql = require("mysql2");
let connection;
let config;

connection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
	database: process.env.DB_DATABASE,
});

connection.connect();

function CloseDB() {
	connection.end();
}

process.on("SIGINT", CloseDB);
process.on("SIGTERM", CloseDB);

module.exports = connection;
