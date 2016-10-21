'use strict';

const assert = require('assert');


const config = require('../knexfile.js');
const env = 'test';

const knex = require('knex')(config[env]);

describe('Test database', function() {
    it('should initialize with seed', function(done) {
        knex.seed.run(config[env]).then(() => {
            done();
        });
    });
});

describe('User model', function() {
    const User = require('../lib/models/user.js');
    const newUserName = 'testUser';
    const newPassword = 'password';
    const existingApiKey = '00000000-0000-0000-0000-000000000000';
    let newUserId = -1;

    it('should create new user for username and password', function(done) {
        User.createUser(newUserName, newPassword)
            .then(userId => {
                assert.equal(Number.isFinite(userId), true);
                newUserId = userId;
                done();
            });
    });
    it('should get user id for username and password', function(done) {
        User.getUserIdByUsernameAndPassword(newUserName, newPassword)
            .then(userId => {
                assert.equal(userId, newUserId);
                done();
            });
    });
    it('should get user id for api key', function(done) {
        User.getUserIdByApiKey(existingApiKey)
            .then(userId => {
                assert.equal(userId, 1);
                done();
            });
    });
    it('should get api key for user id', function(done) {
        User.getApiKey(1)
            .then(apiKey => {
                assert.equal(existingApiKey, apiKey);
                done();
            });
    });
    it('should get full user details for user id', function(done) {
        User.getUserDetails(1)
            .then(user => {
                assert.equal(user.id, 1);
                assert.equal(user.username, 'firstUser');
                assert.equal(user.password, 'password');
                assert.equal(user.api_key, '00000000-0000-0000-0000-000000000000');
                done();
            });
    });

});

describe.skip('Sensor model', function() {
    const Sensor = require('../lib/models/sensor.js');

    it('should create new sensor', function() {
        assert.equal(true, false);
    });
    it('should get sensor data for id', function() {
        assert.equal(true, false);
    });
    it('should get sensor for serial', function() {
        assert.equal(true, false);
    });
    it('should get sensors for user', function() {
        assert.equal(true, false);
    });
    it('should update sensor data', function() {
        assert.equal(true, false);
    });

});

describe.skip('Measurement model', function() {
    const Measurement = require('../lib/models/measurement.js');

    it('should create new measurement', function() {
        assert.equal(true, false);
    });
    it('should get latest measurement for sensor id', function() {
        assert.equal(true, false);
    });
    it('should get measurements for range', function() {
        assert.equal(true, false);
    });
});
