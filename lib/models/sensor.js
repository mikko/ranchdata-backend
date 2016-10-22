"use strict";

const knex = require('../db');

const tableName = 'sensors';

const Sensor = {
	createSensor: function(userId, serial, name, unit) {
		return knex(tableName).insert({serial, name, unit, user_id: userId}).returning('id')
			.then(rows => rows[0]);
	},
	getSensorById: function(userId, sensorId) {

	},
	getSensorBySerial: function(userId, serial) {

	},
	getSensorsByUser: function(userId) {

	},
	updateSensor: function(userId, sensorId, name, unit) {

	}
};

module.exports = Sensor;
