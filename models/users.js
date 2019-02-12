const mongoose = require('mongoose');

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

const User = mongoose.model('User', UserSchema);
module.exports = { User };