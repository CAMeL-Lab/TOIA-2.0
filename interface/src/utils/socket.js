import io from 'socket.io-client';

const socket = new io.connect("http://localhost:3001/", {transports: ['websocket']});

export default socket;