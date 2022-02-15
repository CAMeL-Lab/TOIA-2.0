const app = require('./server');
const port = process.env.EXPRESS_PORT || 3001;

const server = app.listen(port, () => console.log('Server is listening on port ' + port));