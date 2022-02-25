import socket from "./utils/socket";


import io from 'socket.io-client';




socket.on('connect', function (data) {
    console.log('connected to socket');
    socket.emit('join', 'Server Connected to Client');
});

//   socket.on('messages', function (data) {
//     console.log(data);
//   });

// Stream Audio
let bufferSize = 2048,
    AudioContext,
    context,
    processor,
    input,
    globalStream;

const mediaConstraints = {
    audio: true,
    video: false
};

let AudioStreamer = {
  /**
   * @param {function} onData Callback to run on data each time it's received
   * @param {function} onError Callback to run on an error if one is emitted.
   */
  initRecording: function (onData, onError) {
    socket.emit('transcribeAudio', '');
    AudioContext = window.AudioContext || window.webkitAudioContext;
    context = new AudioContext({
        latencyHint: 'interactive',
  });
    processor = context.createScriptProcessor(bufferSize, 1, 1);
    processor.connect(context.destination);
    context.resume();

    const handleSuccess = function (stream) {
      globalStream = stream;
      input = context.createMediaStreamSource(stream);
      input.connect(processor);

      processor.onaudioprocess = function (e) {
        microphoneProcess(e);
      };
    };

    navigator.mediaDevices.getUserMedia(mediaConstraints)
      .then(handleSuccess);

    // if (onData) {
    //   socket.on('transcript', (response) => {
    //     onData(response.data);
    //     console.log("response data: ", response);
    //   });
    // }

    socket.on('transcript',  (response) => {
        onData(response);
        //console.log("response data: ", response);
      })
    socket.on('message', (res)=>{
        console.log(res)
    })
    socket.on('googleCloudStreamError', (error) => {
      if (onError) {
        onError('error');
      }
      closeAll();
    });

    socket.on('endTranscription', () => {
      closeAll();
    });
  },

  stopRecording: function () {
    socket.emit('endTranscription');
    closeAll();
  }
}

export default AudioStreamer;

// Helper functions
/**
 * Processes microphone data into a data stream
 *
 * @param {object} e Input from the microphone
 */
function microphoneProcess(e) {
    //console.log(e.inputBuffer)
    const left = e.inputBuffer.getChannelData(0);
    //const left16 = convertFloat32ToInt16(left);
    var left16 = downsampleBuffer(left, e.inputBuffer.sampleRate, 16000);
    socket.emit('audioData', left16);
}

/**
 * Converts a buffer from float32 to int16. Necessary for streaming.
 * sampleRateHertz of 1600.
 *
 * @param {object} buffer Buffer being converted
 */
function convertFloat32ToInt16(buffer) {
    let l = buffer.length;
    let buf = new Int16Array(l / 3);

    while (l--) {
        if (l % 3 === 0) {
            buf[l / 3] = buffer[l] * 0xFFFF;
        }
    }
    return buf.buffer
}

/**
 * Stops recording and closes everything down. Runs on error or on stop.
 */
function closeAll() {
  // Clear the listeners (prevents issue if opening and closing repeatedly)
  socket.off('transcript');
  socket.off('googleCloudStreamError');
  let tracks = globalStream ? globalStream.getTracks() : null;
  let track = tracks ? tracks[0] : null;
  if (track) {
    track.stop();
  }

  if (processor) {
      try{

      
    if (input) {
      try {
        input.disconnect(processor);
      } catch (error) {
        console.warn('Attempt to disconnect input failed.')
      }
    }
    processor.disconnect(context.destination);
} catch(err){
    console.log("processor failed!")
}
  }
  try{
      
  
  if (context) {
    context.close().then(function () {
      input = null;
      processor = null;
      context = null;
      AudioContext = null;
    });
  }

}catch(err){
    console.log("context failed!")
}
}


// downsample the biffer to 16000Hz
var downsampleBuffer = function (buffer, sampleRate, outSampleRate) {
    if (outSampleRate === sampleRate) {
        return buffer;
    }
    if (outSampleRate > sampleRate) {
        throw 'downsampling rate show be smaller than original sample rate';
    }
    var sampleRateRatio = sampleRate / outSampleRate;
    var newLength = Math.round(buffer.length / sampleRateRatio);
    var result = new Int16Array(newLength);
    var offsetResult = 0;
    var offsetBuffer = 0;
    while (offsetResult < result.length) {
        var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        var accum = 0,
            count = 0;
        for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
            accum += buffer[i];
            count++;
        }

        result[offsetResult] = Math.min(1, accum / count) * 0x7fff;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
    }
    return result.buffer;
};