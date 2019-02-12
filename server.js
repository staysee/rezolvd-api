const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const {DATABASE_URL, PORT} = require('./config');
const { Venue } = require('./models/venues');

const jsonParser = bodyParser.json();
const app = express();

app.use(morgan('common'));
app.use(express.static('public'));

//CORS
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    if (req.method === 'OPTIONS') {
      return res.send(204);
    }
    next();
});

// VENUE
app.get('/venues', (req, res) => {
	Venue
		.find()
		.then(venues => {
			res.json({
				venues: venues.map(
					(venue) => venue.serialize()
				)
			});
		})
		.catch(
			err => {
				console.error(err);
				res.status(500).json({message: 'Internal server error'});
			}
		);
});

app.get('/venues/:id', (req, res) => {
	Venue
		.findById(req.params.id)
		.then(venue => res.json(venue.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		});
});

app.post('/venues', jsonParser, (req, res) => {
	const requiredFields = ['name'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}

	Venue
		.create({
			name: req.body.name
		})
		.then(venue => res.status(201).json(venue.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		});
})

app.delete('/venues/:id', (req, res) => {
	Venue
		.findByIdAndRemove(req.params.id)
		.then(() => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal server error'}));
})






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
