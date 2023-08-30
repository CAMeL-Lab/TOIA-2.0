// main recording parameters
const encoding = "LINEAR16";
const sampleRateHertz = 16000;


function constructRequest(inputLanguageCode) {
    return {
        config: {
            encoding: encoding,
            sampleRateHertz: sampleRateHertz,
            languageCode: inputLanguageCode,
            enableAutomaticPunctuation: true,
            profanityFilter: true,
            enableWordTimeOffsets: true,
        },
        interimResults: true, // If you want interim results, set this to true
    };
}

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

module.exports.clientConfig = clientConfig;
module.exports.constructRequest = constructRequest;
