const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const speech = require("@google-cloud/speech");
const speech_to_text = require("./speech_to_text");
const ENV = require("./config");

const app = express();
const httpServer = createServer(app);

const client = new speech.SpeechClient({
    clientConfig: speech_to_text.clientConfig,
});

let origin = "*";
if (ENV.NODE_ENV === "production") {
    if (!ENV.API_URL)
        throw "API_URL env variable not set when running in production!";
    origin = ENV.API_URL;
}

const io = new Server(httpServer, {
    cors: {
        origin: origin,
    },
    transports: ["websocket"],
});

io.on("connect", function (socket) {
    let recognizeStream = null;

    socket.on("join", function () {
        socket.emit("message", "socket connected to server");
        console.log("handshake successfull");
    });

    socket.on("transcribeAudio", (languageCode) => {
        createStream(socket, languageCode);
        console.log("stream created!");
    });

    socket.on("endTranscription", () => {
        endRecognitionStream();
    });

    socket.on("audioData", (data) => {
        if (recognizeStream !== null) {
            recognizeStream.write(data);
        }
    });

    socket.on("connect_error", (err) => {
        console.log(`server: connect_error due to ${err.message}`);
    });

    function createStream(socket, languageCode) {
        recognizeStream = client
            .streamingRecognize(speech_to_text.constructRequest(languageCode))
            .on("error", console.error)
            .on("data", (data) => {
                process.stdout.write(
                    data.results[0] && data.results[0].alternatives[0]
                        ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
                        : "\n\nReached transcription time limit, press Ctrl+C\n"
                );

                socket.emit("transcript", data.results[0]);

                // if end of utterance, let's restart stream
                if (data.results[0] && data.results[0].isFinal) {
                    endRecognitionStream();
                    createStream(socket, languageCode);
                }
            });
    }

    function endRecognitionStream() {
        if (recognizeStream) {
            recognizeStream.end();
            console.log("stream ended");
        }
        recognizeStream = null;
    }
});

const PORT = ENV.PORT;

httpServer.listen(PORT, () => {
    console.log(`====================================`);
    console.log(`Speech To Text: GCloud`);
    console.log(`PORT: ${PORT}`);
    console.log(`====================================`);
});
