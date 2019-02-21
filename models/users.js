'use strict'

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {type: String, default: ''},
    lastName: {type: String, default: ''},
    venues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Venue' }],
    created: {
        type: Date,
        default: Date.now
    }
})

//return user item but not password
UserSchema.methods.serialize = function() {
    return {
        userId: this._id,
        username: this.username || '',
        firstName: this.firstName || '',
        lastName: this.lastName || ''
    }
}

//use bcrypt to compare plain text value passed to function (password)
//with hashed value stored on the user object (this.password)
UserSchema.methods.validatePassword = function(password){
    return bcrypt.compare(password, this.password);
}

UserSchema.statics.hashPassword = function(password){
    return bcrypt.hash(password, 10);
}

const User = mongoose.model('User', UserSchema);
module.exports = { User };