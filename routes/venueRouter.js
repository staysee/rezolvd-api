const express = require('express');
const router = express.Router();
const ObjectId = require('mongodb').ObjectID;
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const { Venue } = require('../models/venues');

//send JSON representation of all venues on GET request to root
router.get('/', (req, res) => {
	Venue
		.find()
		.then(venues => {
			res.json({
				venues: venues.map(venue => venue.serialize())
			})
		})
		.catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
		});
});

//get one venue
router.get('/:id', (req, res) => {
	Venue
		.findById(req.params.id)
		.then(venue => res.json(venue.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		});
});

// create new venue
router.post('/', jsonParser, (req, res) => {
	const requiredFields = ['name', 'categories', 'contact'];
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`;
			console.error(message);
			return res.status(400).send(message);
		}
	}
	console.log('***************');
	console.log(req.body);

	Venue
		.create({
			name: req.body.name,
        	categories: [req.body.categories],
        	contact: {
				phone: req.body.phone,
				address: req.body.address,
				coordinates: {
					lat: req.body.lat,
					lng: req.body.lng
				}
        	}
		})
		.then(venue => res.status(201).json(venue.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		});
})

// delete venue
router.delete('/:id', (req, res) => {
	Venue
		.findByIdAndRemove(req.params.id)
		.then(venue => res.status(204).end())
		.catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
        });
})

module.exports = router;