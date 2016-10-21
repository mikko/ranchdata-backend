"use strict";
const _ = require('lodash');
const moment = require('moment');

const emptyTables = (knex) => {
    return knex('measurements').del()
        .then(() => {
            return knex('sensors').del();
        })
        .then(() => {
            return knex('users').del();
        })
        .then(() => knex);
};

const populateUsers = knex => {
    return Promise.all([
        // Inserts seed entries
        knex('users')
            .insert({
                id: 1, 
                username: 'firstUser',
                password: 'password',
                salt: 'salt',
                api_key: '00000000-0000-0000-0000-000000000000'
            }),
        knex('users')
            .insert({
                id: 2, 
                username: 'secondUser',
                password: 'otherPassword',
                salt: 'salt',
                api_key: '10000000-0000-0000-0000-000000000000'
            })
    ]);
};

const populateSensors = knex => {
    return Promise.all([
        // Inserts seed entries
        knex('sensors')
            .insert({
                id: 1, 
                serial: 'sensor-1',
                name: 'First sensor',
                unit: 'mk',
                user_id: '1'
            }),
        knex('sensors')
            .insert({
                id: 2, 
                serial: 'sensor-2',
                name: 'Second sensor',
                unit: 'C',
                user_id: '1'
            }),
        knex('sensors')
            .insert({
                id: 3, 
                serial: 'differentKindOfSerial1',
                name: 'My sensor',
                unit: 'kg',
                user_id: '2'
            })
    ]);
};

const populateMeasurements = knex => {
    // Generate deterministic measurement data for three sensors
    let measurementPromises = [];
    let measurementIndex = 0;
    _.range(3).forEach(sensorNumber => {
        let m = moment('2016-10-10 12:00');
        _.range(100).forEach(measurementNumber => {
            ++measurementIndex;
            m.add(1, 'minutes');
            const measurementValue = (sensorNumber + 1) * measurementNumber;
            let newPromise = knex('measurements')
                .insert({
                    id: measurementIndex, 
                    value: measurementValue,
                    created_at: m.toDate(),
                    updated_at: m.toDate(),
                    sensor_id: sensorNumber + 1
                });
            measurementPromises.push(newPromise);
        })
    })
    return Promise.all(measurementPromises);
};

exports.seed = function(knex, Promise) {
    return emptyTables(knex)
        .then(() => populateUsers(knex))
        .then(() => populateSensors(knex))
        .then(() => populateMeasurements(knex));
};
