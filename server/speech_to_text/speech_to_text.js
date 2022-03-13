// const recorder = require('node-record-lpcm16');

// // Imports the Google Cloud client library
// const speech = require('@google-cloud/speech');

// const axios = require('axios');

// // Creates a client
// const client = new speech.SpeechClient();

// initializing the recognizeStream
//let recognizeStream = null;

// main recording parameters
const encoding = 'LINEAR16';
const sampleRateHertz = 16000;
const languageCode = 'en-US';

// array to store responses
//let responseChunks = [];

// the request object 
const request = {
    config: {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
      enableAutomaticPunctuation: true,
      profanityFilter: true,
      //"enable_separate_recognition_per_channel": false,
  
    },
    interimResults: true, // If you want interim results, set this to true
};

// config of the client object
const clientConfig = {
  interfaces: {
    'google.cloud.speech.v1p1beta1.Speech': { // google.cloud.speech.rpc
      retry_codes: {
        idempotent: ["DEADLINE_EXCEEDED", "UNAVAILABLE"] 
      },
      "methods": {
        "Recognize": {},
        "LongRunningRecognize": {},
        "StreamingRecognize": {}
      }
    }
  }
}


// // Create a recognize stream
// function createStream(){
//     recognizeStream = client
//     .streamingRecognize(request)
//     .on('error', console.error)
//     .on('data', data =>{
//     process.stdout.write(
//         data.results[0] && data.results[0].alternatives[0]
//         ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
//         : '\n\nReached transcription time limit, press Ctrl+C\n'
//     ) 
//         //res.send(`Transcription: ${data.results[0].alternatives[0].transcript}\n`);
//         responseChunks.push(`${data.results[0].alternatives[0].transcript}`);
//         // sending data when recieved
//         axios.post(`${process.env.SERVER_URL}/getTranscribedAudio`, {
//             params: {
//                 transcript: `${data.results[0].alternatives[0].transcript}`
//             }
//         }).catch((err)=>{
//             console.log(err)
//         })
//         console.log("responses in recStream: ", responseChunks)  
//         }
//     );
//     }
// function to record mic stream and send to server
// async function transcribeAudio(){
//     responseChunks = []

//     const recording = recorder
//     .record({
//     sampleRateHertz: sampleRateHertz,
//     threshold: 0,
//     verbose: false,
//     recordProgram: 'rec', // Try also "arecord" or "sox"
//     silence: '10.0',
//     })
//     .stream()
//     .on('error', console.error)
//     .pipe(recognizeStream);
//     return;
    
// }

// function returnResponses(){
//     console.log("return response in file", responseChunks)
//     return responseChunks;
// }

//module.exports.transcribeAudio = transcribeAudio;
// module.exports.recognizeStream = recognizeStream;
// //exports.responseChunks = responseChunks;
// module.exports.createStream = createStream;
// module.exports.returnResponses = returnResponses;
module.exports.request = request;
module.exports.clientConfig = clientConfig;


