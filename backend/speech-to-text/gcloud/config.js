const path = require("path");
const fs = require("fs");

const requiredFiles = ["secrets/gcloud-credentials.json"];

requiredFiles.forEach((file) => {
    if (!fs.existsSync(path.join(__dirname, file))) {
        throw new Error(`File ${file} is missing.`);
    }
});

const requiredEnvVariables = ["API_URL", "NODE_ENV"];

requiredEnvVariables.forEach((envVariable) => {
    if (!process.env[envVariable]) {
        throw new Error(`Environment variable ${envVariable} is missing`);
    }
});

process.env["GOOGLE_APPLICATION_CREDENTIALS"] = path.join(
    __dirname,
    "secrets/gcloud-credentials.json"
);

const ENV = {
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    API_URL: process.env.API_URL, // URL of the API where phoenix is running
    NODE_ENV: process.env.NODE_ENV, // Node environment
    PORT: 3002, // Port where the server will run
};

module.exports = ENV;
