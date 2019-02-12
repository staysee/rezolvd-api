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
        name: faker.lorem.sentence(),
        categories: faker.lorem.sentence(),
        contact: {
            phone: '1234567',
            address: faker.address.streetAddress(),
            coordinates: {
                lat: 123,
                lng: 123
            }
        },
        created: faker.date.future()
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
						// console.info(venue
						expect(venue).to.be.a('object');
						expect(venue).to.include.keys('name', 'categories', 'contact', 'date');
					})
					resVenue = res.body.venues[0];
					return Venue.findById(resVenue.id);
				})
				.then(function(venue){
					// console.info(resVenue);
					// console.info(venue);
					expect(resVenue.id).to.equal(venue.id);
                    expect(resVenue.name).to.equal(venue.name);
                    expect(resVenue.categories).to.equal(venue.categories);
                    expect(resVenue.contact.phone).to.equal(venue.contact.phone);
                    expect(resVenue.contact.address).to.equal(venue.contact.address);
                    expect(resVenue.contact.coordinates.lat).to.equal(venue.contact.coordinates.lng);
				})
		})
	}) //end GET endpoint test

	describe('POST endpoint', function() {
		it('should add a new venue', function() {

			const newVenue = generateVenueData();

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
                expect(resVenue.name).to.equal(venue.name);
                expect(resVenue.categories).to.equal(venue.categories);
                expect(resVenue.contact.phone).to.equal(venue.contact.phone);
                expect(resVenue.contact.address).to.equal(venue.contact.address);
                expect(resVenue.contact.coordinates.lat).to.equal(venue.contact.coordinates.lng);

				return Venue.findById(res.body.id);
			})
			.then(function(event){
				expect(venue.name).to.equal(newVenue.name);
				expect(venue.description).to.equal(newVenue.description);
				expect(venue.address.building).to.equal(newVenue.address.building);
				expect(venue.address.street).to.equal(newVenue.address.street);
				expect(venue.address.city).to.equal(newVenue.address.city);
				expect(venue.address.state).to.equal(newVenue.address.state);
				expect(venue.address.zipcode).to.equal(newVenue.address.zipcode);
				// expect(venue.date).to.equal(newVenue.date);
				expect(venue.time.startTime).to.equal(newVenue.time.startTime);
				expect(venue.time.endTime).to.equal(newVenue.time.endTime);
				expect(venue.prop).to.equal(newVenue.prop);
			})
		})
	}) //end POST endpoint test

	describe('DELETE endpoint', function() {
	//get an venue
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




























