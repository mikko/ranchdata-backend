'use strict';

const assert = require('assert');
const moment = require('moment');
const knexConstructor = require('knex');
const configFile = require('../knexfile.js');
const initEnv = 'test_init';
const initConfig = configFile[initEnv];
const env = 'test';
const config = configFile[env];

// connect without database selected
const knexInit = knexConstructor(initConfig);

let knex;

describe('Database', function() {
    before(function(done) {
        knexInit.raw('CREATE DATABASE ranch')
            .then(function () {
                knexInit.destroy();
                knex = knexConstructor(config);
                done();
            })
            .catch(() => {
                knexInit.destroy();
                // Assuming database exists
                knex = knexConstructor(config);
                done();
            });
    });

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
                        assert.equal(user.password, ''); // Password removed
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
            it('should get undefined for non-existing serial', function(done) {
                Sensor.getSensorBySerial(userId, 'doesnotexist')
                    .then(sensor => {
                        assert.equal(sensor, undefined);
                        done();
                    });
            });
            it('should get sensors for user', function(done) {
                Sensor.getSensorsByUser(userId)
                    .then(sensors => {
                        assert.equal(sensors.length, 3);
                        done();
                    });
            });
            it('should update sensor data', function(done) {
                Sensor.updateSensor(userId, existingSensorId, existingSensorName, existingSensorUnit)
                    .then(updatedId => {
                        assert.equal(updatedId, existingSensorId);
                        done();
                    });
            });

            it('should get sensor data only for correct user', function(done) {
                Sensor.getSensorById(999, existingSensorId)
                    .catch(err => {
                        assert.notEqual(err, undefined);
                        done();
                    });
            });

        });

        describe('Measurement model', function() {
            const Measurement = require('../lib/models/measurement.js');

            const userId = 1;
            const sensorId = 1;

            const newValue = 9999;
            const rangeBegin = moment.utc('2016-10-10 12:01');
            const rangeEnd = moment.utc('2016-10-10 12:50');

            it('should create new measurement', function(done) {
                Measurement.createMeasurement(userId, sensorId, newValue)
                    .then(measurementId => {
                        assert.equal(Number.isFinite(measurementId), true);
                        done();
                    });
            });
            it('should get latest measurement for sensor id', function(done) {
                Measurement.getLatestMeasurement(userId, sensorId)
                    .then(measurement => {
                        assert.equal(measurement.value, newValue);
                        done();
                    });
            });
            it('should get measurements for range', function(done) {
                Measurement.getMeasurementsForRange(userId, sensorId, rangeBegin, rangeEnd)
                    .then(measurements => {
                        assert.equal(measurements.length, 50);
                        done();
                    });
            });
            it('should get measurements for only correct user', function(done) {
                Measurement.getMeasurementsForRange(999, sensorId, rangeBegin, rangeEnd)
                    .catch(err => {
                        assert.notEqual(err, undefined);
                        done();
                    });
            });
            it('should create new measurement for only correct user', function(done) {
                Measurement.createMeasurement(999, sensorId, newValue)
                    .catch(err => {
                        assert.notEqual(err, undefined);
                        done();
                    });
            });

        });
        describe('Journal model', function() {
            const Journal = require('../lib/models/journal.js');

            const userId = 1;
            const sensorId = 1;

            const newEntryType = 'note';
            const newEntry = 'Test message for new journal entry';
            const newEntryTime = moment.utc('2016-10-11 12:01');

            const rangeBegin = moment.utc('2016-10-10 11:59');
            const rangeEnd = moment.utc('2016-10-10 16:50');

            it('should create new note as journal entry', function(done) {
                Journal.createEntry(userId, newEntryType, newEntry, newEntryTime, null)
                    .then(entryId => {
                        assert.equal(Number.isFinite(entryId), true);
                        done();
                    });
            });
            it('should throw when creating a journal entry for unknown type', function(done) {
                Journal.createEntry(userId, 'badType', newEntry, newEntryTime, null)
                    .catch(err => {
                        assert.notEqual(err, undefined);
                        done();
                    });
            });
            it('should get N pcs of latest journal entries', function(done) {
                Journal.getLatestEntries(userId, 5)
                    .then(entries => {
                        assert.equal(entries.length, 5);
                        done();
                    });
            });
            it('should get journal entries for a time range', function(done) {
                Journal.getEntriesForRange(userId, rangeBegin, rangeEnd)
                    .then(entries => {
                        assert.equal(entries.length, 5);
                        done();
                    });
            });
            it('should get journal entries for a sensor in time range', function(done) {
                Journal.getEntriesForSensorAndRange(userId, sensorId, rangeBegin, rangeEnd)
                    .then(entries => {
                        assert.equal(entries.length, 3);
                        done();
                    });
            });
            it('should remove journal entry', function(done) {
                Journal.getLatestEntries(userId, 1)
                    .then(entries => {
                        assert.equal(entries.length, 1);
                        const latestEntry = entries[0];
                        Journal.removeEntry(userId, latestEntry.id)
                            .then(rowsRemoved => {
                                assert.equal(rowsRemoved, 1);
                                done();
                            });
                    });
            });
            it('should mark journal entry done', function(done) {
                Journal.getLatestEntries(userId, 1)
                    .then(originalEntries => {
                        const entryId = originalEntries[0].id;
                        Journal.setEntryDone(userId, entryId)
                            .then(() => {
                                Journal.getLatestEntries(userId, 1)
                                    .then(updatedEntries => {
                                        const updatedEntry = updatedEntries[0];
                                        assert.equal(updatedEntry.id, entryId);
                                        done();
                                    });
                            });
                    });
            });
        });

        describe('View model', function() {
            const View = require('../lib/models/view.js');
            const newViewTitle = 'New view';
            const newViewData = {
                key: 'value',
                someArray: [
                    1,
                    2,
                    3,
                ],
            };
            const updatedViewTitle = 'Updated view';
            const updatedViewData = {
                key: 'updated value',
                someArray: [
                    1,
                    2,
                    3,
                    4,
                ],
            };
            const userId = 1;

            it('should create new view with JSON data and title', function(done) {
                View.createOrUpdateView(userId, newViewTitle, newViewData)
                    .then(entryId => {
                        assert.equal(Number.isFinite(entryId), true);
                        done();
                    });
            });
            it('should get a view for a user', function(done) {
                View.getView(userId)
                    .then(view => {
                        assert.equal(JSON.stringify(view.viewdata), JSON.stringify(newViewData));
                        assert.equal(view.title, newViewTitle);
                        done();
                    });
            });
            it('should update a view with JSON data and title', function(done) {
                View.createOrUpdateView(userId, updatedViewTitle, updatedViewData)
                    .then(entryId => {
                        assert.equal(Number.isFinite(entryId), true);
                        View.getView(userId)
                            .then(view => {
                                assert.equal(JSON.stringify(view.viewdata), JSON.stringify(updatedViewData));
                                assert.equal(view.title, updatedViewTitle);
                                done();
                            });
                    });
            });
        });
    });
});
