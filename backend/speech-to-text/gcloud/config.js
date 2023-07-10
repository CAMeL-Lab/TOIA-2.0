const path = require("path");

if (!process.env.GOOGLE_SPEECH_API_CREDENTIALS_FILE)
    throw "GOOGLE_SPEECH_API_CREDENTIALS_FILE env variable not set!";

process.env["GOOGLE_APPLICATION_CREDENTIALS"] = path.join(
    __dirname,
    process.env.GOOGLE_SPEECH_API_CREDENTIALS_FILE
);

const ENV = {
    GOOGLE_SPEECH_API_CREDENTIALS_FILE: process.env.GOOGLE_SPEECH_API_CREDENTIALS_FILE, // Relative location of the credentials file
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    API_URL: process.env.API_URL, // URL of the API where phoenix is running
    NODE_ENV: process.env.NODE_ENV, // Node environment
    PORT: 3002, // Port where the server will run
}

module.exports = ENV;
