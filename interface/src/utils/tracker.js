import socket from "./socket";

const Ping_Interval = 5000;

class Tracker {
	constructor() {
		if (Tracker.singleInstance) {
			return Tracker.singleInstance;
		}
		Tracker.singleInstance = this;

		this.active = true;
		if (Ping_Interval < 5000) {
			console.error(
				"Cannot ping with interval less than 5 seconds!",
			);
			this.active = false;
		}
	}

	startTracking = state => {
		if (this.active) {
			if (state && state.toiaID) {
				if (state.toiaName) {
					if (state.toiaLanguage) {
						setInterval(() => {
							this.setup(state.toiaID);
						}, Ping_Interval);
					} else {
						console.warn(
							"Cannot track. Language missing!",
						);
					}
				} else {
					console.warn(
						"Cannot track. Name missing!",
					);
				}
			} else {
				console.warn("Cannot track. ID missing!");
			}
		}
	};

	setup(user_id) {
		socket.emit("ping", user_id);
	}
}

export default Tracker;
