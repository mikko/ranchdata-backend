'use strict';

const assert = require('assert');
const moment = require('moment');
const configFile = require('../knexfile.js');
const env = 'test';
const config = configFile[env];

const knex = require('knex')(config);

describe('Data models', function() {
    before(function(done) {
        knex.migrate.rollback(config)
            .then(() => {
                return knex.migrate.latest(config);
            })
            .then(() => {
                return knex.seed.run(config);
            })
            .then(() => {
                done();
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

    describe('Sensor model', function() {
        const Sensor = require('../lib/models/sensor.js');

        const userId = 1;
        const existingSensorId = 1;
        const existingSensorSerial = 'sensor-1';
        const existingSensorName = 'First sensor';
        const existingSensorUnit = 'mk';

        const newSensorName = 'Test sensor';
        const newSensorSerial = 'test-sensor-1';
        const newSensorUnit = 'm';

        it('should create new sensor', function(done) {
            Sensor.createSensor(userId, newSensorSerial, newSensorName, newSensorUnit)
                .then(sensorId => {
                    assert.equal(Number.isFinite(sensorId), true);
                    done();
                });
        });
        it('should get sensor data for id', function(done) {
            Sensor.getSensorById(userId, existingSensorId)
                .then(sensor => {
                    assert.equal(sensor.id, existingSensorId);
                    assert.equal(sensor.serial, existingSensorSerial);
                    assert.equal(sensor.name, existingSensorName);
                    assert.equal(sensor.unit, existingSensorUnit);
                    done();
                });

        });
        it('should get sensor for serial', function(done) {
            Sensor.getSensorBySerial(userId, existingSensorSerial)
                .then(sensor => {
                    assert.equal(sensor.id, existingSensorId);
                    assert.equal(sensor.serial, existingSensorSerial);
                    assert.equal(sensor.name, existingSensorName);
                    assert.equal(sensor.unit, existingSensorUnit);
                    done();
                });
        });
        it('should get sensors for user', function(done) {
            Sensor.getSensorsByUser(userId)
                .then(sensors => {
                    assert.equal(sensors.length, 3);
                    done();
                })

        });
        it('should update sensor data', function(done) {
            Sensor.updateSensor(userId, existingSensorId, existingSensorName, existingSensorUnit)
                .then(updatedId => {
                    assert.equal(updatedId, existingSensorId);
                    done();
                });
        });

    });

    describe('Measurement model', function() {
        const Measurement = require('../lib/models/measurement.js');

        const userId = 1;
        const sensorId = 1;
        const existingLatestValue = 99;

        const newValue = 9999;
        const rangeBegin = moment.utc('2016-10-10 12:01');
        const rangeEnd = moment.utc('2016-10-10 12:50');

        it('should create new measurement', function(done) {
            Measurement.createMeasurement(sensorId, newValue)
                .then(measurementId => {
                    assert.equal(Number.isFinite(measurementId), true);
                    done();
                });
        });
        it('should get latest measurement for sensor id', function(done) {
            Measurement.getLatestMeasurement(sensorId)
                .then(measurement => {
                    assert.equal(measurement.value, newValue);
                    done();
                });
        });
        it('should get measurements for range', function(done) {
            Measurement.getMeasurementsForRange(sensorId, rangeBegin, rangeEnd)
                .then(measurements => {
                    assert.equal(measurements.length, 50);
                    done();
                });
        });
    });
});
