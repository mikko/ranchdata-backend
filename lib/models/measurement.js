const knex = require('../db');
const moment = require('moment');

const tableName = 'measurements';
const sensorTable = 'sensors';

const Measurement = {
	createMeasurement: function(userId, sensorId, value, timestamp) {
        return knex(sensorTable)
            .select('user_id')
            .where({
                id: sensorId
            })
            .then(rows => {
                if (rows[0].user_id === userId) {
                    const newValues = {value, sensor_id: sensorId};
                    if (timestamp !== undefined) {
                        newValues.measurement_time = timestamp;
                    }
                    return knex(tableName)
                        .insert(newValues)
                        .returning('id')
                        .then(rows => rows[0]);
                }
                throw new Error('Cannot create measurements for another user');
            });
	},
	getLatestMeasurement: function(userId, serial) {
		return knex(tableName)
			.join(sensorTable, `${sensorTable}.id`, '=', `${tableName}.sensor_id`)
			.select()
			.where({
				serial,
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
	getMeasurementsForRange: function(userId, serial, begin, end) {
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
                serial: serial,
                user_id: userId
            })
            .orderBy('created_at', 'asc')
            .then(rows => {
                if (rows.length > 0) {
                    return Promise.resolve(rows);
                }
                return Promise.resolve([])
            });
	}
};

module.exports = Measurement;
