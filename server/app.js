const httpServer = require('./server');
const port = process.env.EXPRESS_PORT || 3001;
const server = httpServer.listen(port, () => console.log('Server is listening on port ' + port));
