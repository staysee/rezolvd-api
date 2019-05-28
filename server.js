'use strict'

const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');

const venueRouter = require('./routes/venueRouter');
const userRouter = require('./routes/userRouter');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

mongoose.Promise = global.Promise;

const { Venue } = require('./models/venues');
const { User } = require('./models/users');
const { DATABASE_URL, PORT, CLIENT_ORIGIN } = require('./config');


const jsonParser = bodyParser.json();
// create express app
const app = express();

//logging
app.use(morgan('common'));
app.use(express.static('public'));

//CORS
app.use(
    cors({
        origin: CLIENT_ORIGIN
    })
);

passport.use(localStrategy);
passport.use(jwtStrategy);

//Routes
app.use('/api/venues', venueRouter);
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);

const jwtAuth = passport.authenticate('jwt', {session: false});

// A protected endpoint which needs a valid JWT to access it
app.get('/api/protected', jwtAuth, (req, res) => {
	return res.json({
	  data: 'rosebud'
	});
  });

  
// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', (req, res) => {
	res.status(404).json({message: 'Endpoint Not Found'});
});



// OPEN/CLOSE SERVER
let server;

function runServer(databaseUrl, port=PORT) {
	return new Promise((resolve, reject) => {
		mongoose.connect(databaseUrl, err => {
			if (err) {
				return reject(err);
			}

			server = app.listen(port, () => {
				console.log(`Your app is listening on port ${port}`);
				resolve();
			})
			.on('error', err => {
				mongoose.disconnect();
				reject(err);
			});
		});
	});
}

function closeServer() {
	return mongoose.disconnect().then(() => {
		return new Promise((resolve, reject) => {
			console.log('Closing server');
			server.close(err => {
				if (err) {
					return reject(err);
				}
				resolve();
			});
		});
	});
}

if (require.main === module) {
	runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer }; 