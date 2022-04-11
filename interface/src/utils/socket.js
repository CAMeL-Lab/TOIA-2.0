import io from 'socket.io-client';

const socket = new io.connect("/", {transports: ['websocket']});

export default socket;