import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom';

import history from './services/history';
import Routes from './routes/';

function App() {
  return (
    <Router history={history}>
      <Routes />
    </Router>
  );
}

export default App;
