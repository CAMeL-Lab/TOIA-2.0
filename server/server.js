//Set up requirements
const express = require("express");
const path = require("path");
const { Storage } = require("@google-cloud/storage");

const MainRoute = require("./routes/index");

const cors = require("cors");

//google speech to text
const recorder = require("node-record-lpcm16");
const speech = require("@google-cloud/speech");

const speech_to_text = require("./speech_to_text/speech_to_text");
// Creates a client
const client = new speech.SpeechClient({
	clientConfig: speech_to_text.clientConfig,
});
const compression = require("compression");

// storing transcript in session
const session = require("express-session");
const MemoryStore = require("memorystore")(session);

const connection = require("./configs/db-connection");
//const {transcribeAudio, recognizeStream, responseChunks} = require('./speech_to_text/speech_to_text')

const { Buffer } = require("buffer");

// setting up socket
//const server = app.listen(process.env.PORT || 3001, () => console.log('Server is listening!')); // require('http').createServer(app);
const { createServer } = require("http");
const { Server } = require("socket.io");
const { create } = require("lodash");
const { Ping } = require("./tracker/tracker");

const app = express();

const httpServer = createServer(app);

//const io = new Server(httpServer, { /* options */ });

const io = new Server(httpServer, {
	cors: {
		origin: "*",
	},
	transports: ["websocket"],
});
// const io = require('socket.io')(server, {cors: {
//     origin: "*"
//   },transports : ['websocket'] });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(express.static("./public"));
app.use(compression());

// if on development, server static files
const localAccountsDir = path.join(__dirname, "Accounts/");
const localAssetsDir = path.join(__dirname, "assets/");
if (process.env.ENVIRONMENT === "development") {
	app.use(express.static(localAccountsDir));
	app.use(express.static(localAssetsDir));
}

// Load on-boarding questions
let force_load_onboard_questions = false;
for (let i = 0; i < process.argv.length; i++) {
	if (process.argv[i] === "--force-onboard") {
		force_load_onboard_questions = true;
	}
}
require("./configs/setup-database")(connection, force_load_onboard_questions);

//################################################################
// SOCKET.IO implementation
//################################################################
io.on("connect", function (socket) {
	console.log("frontend connected to server!: ", socket.id);
	// Track Session Activity
	socket.on("ping", async function (user_id) {
		await Ping(user_id);
	});

	const onResponse = response => {
		//console.log("response:", response.results[0].alternatives[0]);
		socket.emit("transcript", response);
	};

	let recognizeStream = null;

	socket.on("join", function () {
		socket.emit("message", "socket connected to server");
		console.log("handshake successfull");
	});

	socket.on("message", data => {
		socket.emit("message", data);
	});

	socket.on("transcribeAudio", languageCode => {
		createStream(this, languageCode);
		console.log("stream created!");
		//await recognizeStream.addListener("data", onResponse);
	});

	socket.on("endTranscription", () => {
		endRecognitionStream();
	});

	socket.on("audioData", data => {
		if (recognizeStream !== null) {
			//writing the data to the recognition stream

			recognizeStream.write(data); //, undefined, (err) => {
		}
	});

	socket.on("connect_error", err => {
		console.log(`server: connect_error due to ${err.message}`);
	});

	//   socket.on("disconnect", () => {
	//     socket.connect();
	//   });

	// functions for google speech to text api
	//####################################################
	// Create a recognize stream
	function createStream(socket, languageCode) {
		console.log(languageCode);
		recognizeStream = client
			.streamingRecognize(speech_to_text.constructRequest(languageCode))
			.on("error", console.error)
			.on("data", data => {
				console.log("data recieved: ");
				process.stdout.write(
					data.results[0] && data.results[0].alternatives[0]
						? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
						: "\n\nReached transcription time limit, press Ctrl+C\n",
				);

				//socket.emit('transcript', data.results[0].alternatives[0].transcript);
				// onResponse(data.results[0].alternatives[0].transcript)
				onResponse(data.results[0]);

				// if end of utterance, let's restart stream
				if (data.results[0] && data.results[0].isFinal) {
					endRecognitionStream();
					createStream(socket, languageCode);
					// console.log('restarted stream serverside');
				}
			});
	}

	function endRecognitionStream() {
		if (recognizeStream) {
			recognizeStream.end();
			//recognizeStream.destroy();
			console.log("stream ended");
		}
		recognizeStream = null;
	}
});

//########################################

app.use("/api", MainRoute);

if (process.env.ENVIRONMENT === "production") {
	// Serve react files
	app.use(express.static(path.join(__dirname, "interface/build")));

	app.get("/*", function (req, res) {
		res.sendFile(path.join(__dirname, "interface/build", "index.html"));
	});
}

module.exports = httpServer;
