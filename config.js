'use strict';

exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/rezolvd';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/test-rezolvd';
exports.PORT = process.env.PORT || 8080;