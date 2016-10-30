"use strict";
const _ = require('lodash');
const moment = require('moment');
const bcrypt = require('bcrypt');

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
    const testPassword = "somepassword";
    return new Promise((resolve, reject) => {
            bcrypt.genSalt(10, (saltGenErr, salt) => {
                bcrypt.hash(testPassword, salt, (hashErr, hash) => {
                    if (hashErr) {
                        reject();
                    }
                    resolve(hash);
                });
            })
        })
        .then(passwordHash => {
            return Promise.all([
                // Inserts seed entries
                knex('users')
                    .insert({
                        id: 1,
                        username: 'firstUser',
                        password: passwordHash,
                        api_key: '00000000-0000-0000-0000-000000000000'
                    }),
                knex('users')
                    .insert({
                        id: 2,
                        username: 'secondUser',
                        password: passwordHash,
                        api_key: '10000000-0000-0000-0000-000000000000'
                    })
            ]);
        });

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
        let m = moment.utc('2016-10-10 12:00');
        _.range(100).forEach(measurementNumber => {
            ++measurementIndex;
            m.add(1, 'minutes');
            const measurementValue = (sensorNumber + 1) * measurementNumber;
            let newPromise = knex('measurements')
                .insert({
                    id: measurementIndex,
                    value: measurementValue,
                    created_at: m.toISOString(),
                    updated_at: m.toISOString(),
                    sensor_id: sensorNumber + 1
                });
            measurementPromises.push(newPromise);
        })
    })
    return Promise.all(measurementPromises);
};

const refreshSequences = knex => {
    const sequenceNames = [
        'users',
        'sensors',
        'measurements'
    ];

    return Promise.all(sequenceNames.map(seqName => {
        return knex.raw(`select setval('${seqName}_id_seq', (select max(id) from  ${seqName}))`);
    }));

};

exports.seed = function(knex, Promise) {
    return emptyTables(knex)
        .then(() => populateUsers(knex))
        .then(() => populateSensors(knex))
        .then(() => populateMeasurements(knex))
        .then(()=> refreshSequences(knex));
};
