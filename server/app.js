const app = require('./server');

const server = app.listen(process.env.PORT || 3001, () => console.log('Server is listening!'));