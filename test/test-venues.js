'use strict'

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const { Venue } = require('../models/venues');
const { app, runServer, closeServer } = require('../server.js');
const { TEST_DATABASE_URL } = require('../config');

chai.use(chaiHttp);


function seedVenueData() {
	console.info('seeding venue data');
	const seedData = [];

	for(let i=1; i<=5; i++){
		seedData.push(generateVenueData());
	}
	return Venue.insertMany(seedData);
}

function generateVenueData(){
	return {
        name: faker.lorem.words(),
        categories: [faker.commerce.color()],
        contact: {
            phone: faker.phone.phoneNumber(),
            address: faker.address.streetAddress(),
            coordinates: {
                lat: faker.address.latitude(),
                lng: faker.address.longitude()
            }
        },
        created: faker.date.past()
    }
}

//clear database for each test
function tearDownDb() {
	console.warn('deleting database');
	return mongoose.connection.db.dropDatabase();
}

describe('hit up root url for client', function () {
	it('should show html and give 200 status code', () => {
		return chai.request(app)
				.get('/')
				.then(res => {
					expect(res).to.have.status(200);
					expect(res).to.be.html;
				})
	})
})

describe('Venues API Resource', function() {

	before(function() {
		return runServer(TEST_DATABASE_URL);
	})

	before(function() {
		return seedVenueData();
	})

	after(function() {
		return tearDownDb();
	})

	after(function() {
		return closeServer();
	})

	
	describe('GET endpoint', function() {
		it('should return all existing venues', function() {
			
			let res;
			return chai.request(app)
				.get('/api/venues')
				.then(function(_res){
					res = _res;

					expect(res).to.have.status(200);
					// console.info(res.body);
					expect(res.body.venues).to.have.lengthOf.at.least(1);
					return Venue.count();
				})
				.then(function(count){
					expect(res.body.venues).to.have.lengthOf(count);
				})
		})

		it('should return venues with the right fields', function(){
			
			let resVenue;
			return chai.request(app)
				.get('/api/venues')
				.then(function(res){
					// console.info(res)
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body.venues).to.be.a('array');
					expect(res.body.venues).to.have.lengthOf.at.least(1);

					res.body.venues.forEach(function(venue){
						console.info(venue)
						expect(venue).to.be.a('object');
						expect(venue).to.include.keys('id', 'name', 'categories', 'contact');
					})
					resVenue = res.body.venues[0];
					return Venue.findById(resVenue.id);
				})
				.then(function(venue){
					// console.info(resVenue);
					// console.info(venue);
					expect(resVenue.id).to.equal(venue.id);
                    expect(resVenue.name).to.equal(venue.name);
                    expect(resVenue.categories).to.deep.equal(venue.categories); // use deep equal
                    console.info(typeof resVenue.categories);
                    console.info(typeof venue.categories);
                    expect(resVenue.contact.phone).to.equal(venue.contact.phone);
                    expect(resVenue.contact.address).to.equal(venue.contact.address);
                    expect(resVenue.contact.coordinates.lat).to.equal(venue.contact.coordinates.lat);
                    expect(resVenue.contact.coordinates.lng).to.equal(venue.contact.coordinates.lng);
                    expect(resVenue.created).to.not.be.null;
				})
		})
	}) //end GET endpoint test

	describe('POST endpoint', function() {
		it('should add a new venue', function() {

			const newVenue = generateVenueData();
			console.log(newVenue);

			return chai.request(app)
			.post('/api/venues')
			.send(newVenue)
			.then(function(res) {
				// console.info(res);
				expect(res).to.have.status(201);
				expect(res).to.be.json;
				expect(res.body).to.be.a('object');
				expect(res.body).to.include.keys('id', 'name', 'categories', 'contact');
				expect(res.body.id).to.not.be.null;
                expect(res.body.name).to.equal(newVenue.name);
				expect(res.body.categories).to.deep.equal(newVenue.categories);
				// expect(res.body).to.deep.equal(newVenue);
				// expect(res.body.contact.phone).to.equal(newVenue.contact.phone);	//undefined
                // expect(res.body.contact.address).to.equal(newVenue.contact.address); //undefined
                // expect(res.body.contact.coordinates.lat).to.equal(newVenue.contact.coordinates.lat); //undefined
                // expect(res.body.contact.coordinates.lng).to.equal(newVenue.contact.coordinates.lng); //undefined
				expect(res.body.created).to.not.be.null;
				console.log(res.body);

				return Venue.findById(res.body.id);
			})
			.then(function(venue){
				expect(venue.name).to.equal(newVenue.name);
				expect(venue.categories).to.deep.equal(newVenue.categories);
				// expect(venue.contact.phone).to.equal(newVenue.contact.phone); //undefined
				// expect(venue.contact.address).to.equal(newVenue.contact.address); //undefined
				// expect(venue.contact.coordinates.lat).to.equal(newVenue.contact.coordinates.lat); //undefined
                // expect(venue.contact.coordinates.lng).to.equal(newVenue.contact.coordinates.lng); //undefined
                expect(venue.created).to.not.be.null;
			})
		})
	}) //end POST endpoint test

	describe('DELETE endpoint', function() {
	//get a venue
	//make a delete request for venue's id
	//assert that response has right status code
	//prove the venue with id doesn't exist in db anymore
		it('should delete a venue by id', function() {
			let venue;
			return Venue
				.findOne()
				.then(_venue => {
					venue = _venue;
					return chai.request(app).delete(`/api/venues/${venue.id}`);
				})
				.then(res => {
					expect(res).to.have.status(204);
					return Venue.findById(venue.id);
				})
				.then(_venue => {
					expect(_venue).to.be.null;
				})
			
		})
	}) //end DELETE endpoint test

}) // end Venues API Resource test