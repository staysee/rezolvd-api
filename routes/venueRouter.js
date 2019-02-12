const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const { Venue } = require('../models/venues');

//send JSON representation of all venues on GET request to root
router.get('/', (req, res) => {
	Venue
		.find()
		.then(venues => {
			res.json({
				venues: venues.map((venue) => venue.serialize())
			});
		})
		.catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'});
		});
});

router.get('/:id', (req, res) => {
	Venue
		.findById(req.params.id)
		.then(venue => res.json(venue.serialize()))
		.catch(err => {
			console.error(err);
			res.status(500).json({message: 'Internal server error'});
		});
});

router.post('/', jsonParser, (req, res) => {
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

router.delete('/:id', (req, res) => {
	Venue
		.findByIdAndRemove(req.params.id)
		.then(() => res.status(204).end())
		.catch(err => res.status(500).json({message: 'Internal server error'}));
})

module.exports = router;