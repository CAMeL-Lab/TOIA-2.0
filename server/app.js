const httpServer = require('./server');
const port = process.env.EXPRESS_PORT || null;
if (!port) throw "EXPRESS_PORT env variable not set!";
const server = httpServer.listen(port, () => console.log('Server is listening on port ' + port));
