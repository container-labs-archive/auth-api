const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');

const app = express();
app.set('superSecret', config.secret);

function getConnectionString() {
  const mongoIp = process.env.MONGO_PORT_27017_TCP_ADDR;
  const mongoPort = process.env.MONGO_PORT_27017_TCP_PORT;
  const database = process.env.DATABASE_NAME;

  let connectionString = `mongodb://${mongoIp}:${mongoPort}/${database}`;
  if (process.env.IS_PRODUCTION) {
    connectionString = process.env.MONGO_CONNECTION_STRING;
  }

  return connectionString;
}

// Connect to db
const connectionString = getConnectionString();
console.log(`connecting to ${connectionString}`);
mongoose.connect(connectionString);


// Routes
app.route('/')
    .get((req, res) => {
      res.json({ message: 'hooray! welcome to our api!' });
    });
app.use('/auth', require('./routes/auth'));


// Start the server
const SERVER_PORT = process.env.SERVER_PORT;
app.listen(SERVER_PORT, () => {
  console.log(`app listening at port: ${SERVER_PORT}`);
});
module.exports.server = app;
