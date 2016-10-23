"use strict";

const knex = require('../db');
const moment = require('moment');

const tableName = 'measurements';

const Measurement = {
	createMeasurement: function(sensorId, value) {
		return knex(tableName)
			.insert({ value, sensor_id: sensorId}).returning('id')
			.then(rows => rows[0]);
	},
	getLatestMeasurement: function(sensorId) {
		return knex.select()
			.from(tableName)
			.where({ sensor_id: sensorId })
			.orderBy('created_at', 'desc')
			.limit(1)
			.then(rows => {
				if (rows.length === 1) {
					return Promise.resolve(rows[0]);
				}
				throw new Error("No sensor found for id");
			});
	},
	getMeasurementsForRange: function(sensorId, begin, end) {
		if (moment.isMoment(begin)) {
			begin = begin.toISOString();
		}
		if (moment.isMoment(end)) {
			end = end.toISOString();
		}

		return knex.select()
			.from(tableName)
			.whereBetween('created_at', [begin, end])
			.where({ sensor_id: sensorId })
			.orderBy('created_at', 'asc')
			.then(rows => {
				return Promise.resolve(rows);
			});
	}
};

module.exports = Measurement;
