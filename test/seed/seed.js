'use strict';
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
    const testPassword = 'somepassword';
    return new Promise((resolve, reject) => {
            bcrypt.genSalt(10, (saltGenErr, salt) => {
                bcrypt.hash(testPassword, salt, (hashErr, hash) => {
                    if (hashErr) {
                        reject();
                    }
                    resolve(hash);
                });
            });
        })
        .then(passwordHash => {
            return Promise.all([
                // Inserts seed entries
                knex('users')
                    .insert({
                        id: 1,
                        username: 'firstUser',
                        password: passwordHash,
                        api_key: '00000000-0000-0000-0000-000000000000',
                        location: 'Tampere'
                    }),
                knex('users')
                    .insert({
                        id: 2,
                        username: 'secondUser',
                        password: passwordHash,
                        api_key: '10000000-0000-0000-0000-000000000000',
                        location: 'Pori'
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
                    measurement_time: m.toISOString(),
                    sensor_id: sensorNumber + 1
                });
            measurementPromises.push(newPromise);
        });
    });
    return Promise.all(measurementPromises);
};

const populateJournalEntries = knex => {
    let journalPromises = [];
    let m = moment.utc('2016-10-10 11:00');
    _.range(30).forEach(messageIndex => {
        m.add(1, 'hours');
        let newPromise = knex('journalentries')
            .insert({
                id: messageIndex,
                type: 'note',
                entry: `Journal entry ${messageIndex}`,
                sensor_id: messageIndex % 2 === 0 ? 1 : null,
                time: m.toISOString(),
                user_id: '1'
            });
        journalPromises.push(newPromise);
    });
    return Promise.all(journalPromises);
};

const populateChores = knex => {
    return Promise.all([
        knex('chores')
            .insert({
                id: 1,
                message: 'note',
                recurrence: 'on the first day of the month',
                sensor_id: null,
                user_id: 1,
            }),
        knex('chores')
            .insert({
                id: 2,
                message: 'note 2',
                recurrence: 'on the last day of the month',
                sensor_id: null,
                user_id: 1,
            }),
        ])
        .then(() => {
            return Promise.all([
                knex('journalentries')
                    .insert({
                        id: 31,
                        type: 'note',
                        entry: 'chore',
                        sensor_id: null,
                        time: moment.utc('2016-10-01 00:00').toISOString(),
                        user_id: 1,
                        chore_id: 1,
                    }),
                knex('journalentries')
                    .insert({
                        id: 32,
                        type: 'note',
                        entry: 'chore',
                        sensor_id: null,
                        time: moment.utc('2016-10-30 11:00').toISOString(),
                        user_id: 1,
                        chore_id: 2,
                    }),
            ]);
        });
};

const refreshSequences = knex => {
    const sequenceNames = [
        'users',
        'sensors',
        'measurements',
        'journalentries',
        'views',
        'chores',
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
        .then(() => populateJournalEntries(knex))
        .then(() => populateChores(knex))
        .then(()=> refreshSequences(knex));
};
