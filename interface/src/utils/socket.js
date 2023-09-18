import io from "socket.io-client";
import { SPEECH_TO_TEXT } from "../configs/backend-urls";

const socket = new io.connect(SPEECH_TO_TEXT(), {
	transports: ["websocket"],
});

export default socket;
