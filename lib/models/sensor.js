"use strict";

const knex = require('../db');

const tableName = 'sensors';

const Sensor = {
	createSensor: function(userId, serial, name, unit) {
		return knex(tableName)
			.insert({ serial, name, unit, user_id: userId }).returning('id')
			.then(rows => rows[0]);
	},
	getSensorById: function(userId, sensorId) {
		return knex.select()
			.from(tableName)
			.where({ user_id: userId, id: sensorId })
			.then(rows => {
				if (rows.length === 1) {
					return Promise.resolve(rows[0]);
				}
				throw new Error("No sensor found for id");
			});
	},
	getSensorBySerial: function(userId, serial) {
		return knex.select()
			.from(tableName)
			.where({ user_id: userId, serial })
			.then(rows => {
				if (rows.length === 1) {
					return Promise.resolve(rows[0]);
				}
				throw new Error("No sensor found for serial");
			});
	},
	getSensorsByUser: function(userId) {
		return knex.select()
			.from(tableName)
			.where({ user_id: userId })
			.then(rows => {
                return Promise.resolve(rows);
			});
	},
	updateSensor: function(userId, sensorId, name, unit) {
        return knex(tableName)
            .where({ id: sensorId })
            .update({ name, unit })
            .returning('id')
            .then(rows => {
                return Promise.resolve(rows[0]);
            });
	}
};

module.exports = Sensor;
