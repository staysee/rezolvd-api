'use strict'

const mongoose = require('mongoose');

const venueSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    categories: [String],
    contact: {
        phone: String,
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    created: {
        type: Date,
        default: Date.now
    }
})

venueSchema.methods.serialize = function() {
    return {
        id: this._id,
        name: this.name,
        categories: this.categories,
        contact: this.contact,
        created: this.created
    }

}

const Venue = mongoose.model('Venue', venueSchema);
module.exports = { Venue };