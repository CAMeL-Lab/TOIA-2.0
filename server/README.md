# Server for the TOIA 2.0 System
1. Place .env file in the root directory of server
2. Update the env file with database username and password
3. Run `npm install --save` to install all dependencies

# setup database
    node ./server/configs/setup-database.js DB_HOST DB_USER DB_PASSWORD toia

Finally, run `nodemon app.js` to fire up the server!