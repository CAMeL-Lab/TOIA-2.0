// main recording parameters
const encoding = "LINEAR16";
const sampleRateHertz = 16000;
// const languageCode = "en-US";
const languageCode = "ar-AE";

// array to store responses
//let responseChunks = [];

function constructRequest(inputLanguageCode){
	return {
		config: {
			encoding: encoding,
			sampleRateHertz: sampleRateHertz,
			languageCode: inputLanguageCode,
			enableAutomaticPunctuation: true,
			profanityFilter: true,
		},
		interimResults: true, // If you want interim results, set this to true
	};
}

// the request object
const request = {
    config: {
      encoding: encoding,
      sampleRateHertz: sampleRateHertz,
      languageCode: languageCode,
      enableAutomaticPunctuation: true,
      profanityFilter: true,
      enableWordTimeOffsets: true,
      //"enable_separate_recognition_per_channel": false,
    },
    interimResults: true, // If you want interim results, set this to true
};

// config of the client object
const clientConfig = {
	interfaces: {
		"google.cloud.speech.v1p1beta1.Speech": {
			// google.cloud.speech.rpc
			retry_codes: {
				idempotent: ["DEADLINE_EXCEEDED", "UNAVAILABLE"],
			},
			methods: {
				Recognize: {},
				LongRunningRecognize: {},
				StreamingRecognize: {},
			},
		},
	},
};

module.exports.request = request;
module.exports.clientConfig = clientConfig;
module.exports.constructRequest = constructRequest;