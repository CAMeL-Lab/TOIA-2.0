const httpServer = require('./server');

const server = httpServer.listen(process.env.PORT || 3001, () => console.log('Server is listening!'));
