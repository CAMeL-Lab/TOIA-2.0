require('dotenv').config({path: '../.env'})
const path = require('path');

process.env['GOOGLE_APPLICATION_CREDENTIALS'] = path.join(__dirname, process.env.GOOGLE_SPEECH_API_CREDENTIALS_FILE);
process.env['GOOGLE_CLOUD_STORE_CREDENTIALS'] = path.join(__dirname, process.env.GOOGLE_CLOUD_STORE_CREDENTIALS_FILE);


const httpServer = require('./server');
const port = process.env.EXPRESS_PORT || null;
if (!port) throw "EXPRESS_PORT env variable not set!";
const server = httpServer.listen(port, () => console.log('Server is listening on port ' + port + " || Environment = " + process.env.ENVIRONMENT));
