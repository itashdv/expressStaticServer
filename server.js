// requiring dependencies..
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const history = require('connect-history-api-fallback');

// config..
const connStr = 'mongodb://autobookdbUser:jshdf76KHDGsi@localhost:27017/autobook';
const PORT = 3000;

// initializing app instance..
const app = express();

// connecting to database..
mongoose.connect(connStr, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
	if (err) {
		console.log('Problem connecting to database!');
	} else {
		console.log('Connected to database!');
	}
});

// configuring middleware..
app.use(history());
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: '10MB', extended: false }));
app.use(bodyParser.json({ limit: '10MB', extended: true }));
app.use(cors());

const apiRoute = require('./routes/apiRoute');

app.use('/api', apiRoute);

app.get('*', (req, res) => {
  res.send('NOTHING FOUND 404');
});

app.listen(PORT, () => {
  console.log(`Server started at port ${ PORT }`);
});
