"use strict";

const knex = require('../db');
const moment = require('moment');

const tableName = 'measurements';
const sensorTable = 'sensors';

const Measurement = {
	createMeasurement: function(userId, sensorId, value) {
		return knex(sensorTable)
			.select('user_id')
			.where({
				id: sensorId
			})
			.then(rows => {
				if (rows[0].user_id === userId) {
					return knex(tableName)
						.insert({value, sensor_id: sensorId})
						.returning('id')
						.then(rows => rows[0]);
				}
				throw new Error('Cannot create measurements for another user');
			});
	},
	getLatestMeasurement: function(userId, sensorId) {
		return knex(tableName)
			.join(sensorTable, `${sensorTable}.id`, '=', `${tableName}.sensor_id`)
			.select()
			.where({
				sensor_id: sensorId,
				user_id: userId
			})
			.orderBy('created_at', 'desc')
			.limit(1)
			.then(rows => {
				if (rows.length === 1) {
					return Promise.resolve(rows[0]);
				}
				return Promise.resolve([]);
			});
	},
	getMeasurementsForRange: function(userId, sensorId, begin, end) {
		if (moment.isMoment(begin)) {
			begin = begin.toISOString();
		}
		if (moment.isMoment(end)) {
			end = end.toISOString();
		}

		return knex(tableName)
			.join(sensorTable, `${sensorTable}.id`, '=', `${tableName}.sensor_id`)
			.select()
			.whereBetween('created_at', [begin, end])
			.where({
				sensor_id: sensorId,
				user_id: userId
			})
			.orderBy('created_at', 'asc')
			.then(rows => {
				if (rows.length > 0) {
					return Promise.resolve(rows);
				}
				throw new Error('No measurements found for user and sensor');
			});
	}
};

module.exports = Measurement;
