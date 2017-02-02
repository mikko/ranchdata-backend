'use strict';

const knex = require('../db');
const moment = require('moment');

const tableName = 'journalentries';

const entryTypes = [
    'note', // User created
    'warning', // System created warning
    'info', // System created info message
];

const Journal = {

    createEntry: function(user_id, type, entry, time, sensor_id) {
        return new Promise((resolve, reject) => {
            if (entryTypes.indexOf(type) === -1) {
                throw new Error(`Unknown type for journal entry: ${type}`);
            }
            knex(tableName).insert({user_id, type, entry, time, sensor_id}).returning('id')
                .then(rows => resolve(rows[0]));
        });
    },
    getLatestEntries: function(user_id, entryCount) {
        return knex(tableName)
            .select()
            .where({
                user_id: user_id
            })
            .orderBy('created_at', 'desc')
            .limit(entryCount)
            .then(rows => {
                return Promise.resolve(rows);
            });
    },
    getEntriesForRange: function(user_id, rangeBegin, rangeEnd) {
        if (moment.isMoment(rangeBegin)) {
            rangeBegin = rangeBegin.toISOString();
        }
        if (moment.isMoment(rangeEnd)) {
            rangeEnd = rangeEnd.toISOString();
        }

        return knex(tableName)
            .select()
            .whereBetween('time', [rangeBegin, rangeEnd])
            .where({
                user_id: user_id,
            })
            .orderBy('created_at', 'desc')
            .then(rows => {
                if (rows.length > 0) {
                    return Promise.resolve(rows);
                }
                return Promise.resolve([]);
            });
    },

    getEntriesForSensorAndRange: function(user_id, sensor_id, rangeBegin, rangeEnd) {
        if (moment.isMoment(rangeBegin)) {
            rangeBegin = rangeBegin.toISOString();
        }
        if (moment.isMoment(rangeEnd)) {
            rangeEnd = rangeEnd.toISOString();
        }

        return knex(tableName)
            .select()
            .whereBetween('time', [rangeBegin, rangeEnd])
            .where({
                user_id,
                sensor_id
            })
            .orderBy('created_at', 'desc')
            .then(rows => {
                if (rows.length > 0) {
                    return Promise.resolve(rows);
                }
                return Promise.resolve([]);
            });
    },
    removeEntry: function(user_id, entry_id) {
        return knex(tableName)
            .where({
                user_id,
                id: entry_id,
            })
            .del();
    },
    setEntryDone: function(user_id, entry_id) {
        return knex(tableName)
            .where({
                user_id,
                id: entry_id,
            })
            .update({
                done: true,
            })
            .then(updatedEntries => Promise.resolve(updatedEntries.length)); // Return the amount of updated entries
    },
};

module.exports = Journal;
