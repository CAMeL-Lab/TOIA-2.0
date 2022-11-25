import React, {  useEffect } from 'react';
import { BrowserRouter as Router} from 'react-router-dom';

import history from "./services/history";
import Routes from "./routes/";

function App() {
	useEffect(() => {
		document.title = `TOIA`;
	});
	return (
		<Router history={history}>
			<Routes />
		</Router>
	);
}

export default App;
