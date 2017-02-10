'use strict';

const knex = require('../db');
const moment = require('moment');

const tableName = 'journalentries';

const entryTypes = [
    'note', // User created
    'warning', // System created warning
    'chore', // System created info message
];

const Journal = {

    createEntry: function(user_id, type, entry, time, sensor_id, chore_id) {
        return new Promise((resolve, reject) => {
            if (entryTypes.indexOf(type) === -1) {
                throw new Error(`Unknown type for journal entry: ${type}`);
            }
            knex(tableName).insert({user_id, type, entry, time, sensor_id, chore_id}).returning('id')
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
    getRelevantEntries: function(user_id, entryCount) {
        // Get all unfinished chores in the past
        // and in the next 30 days
        return knex(tableName)
            .select()
            .where({
                user_id,
                done: false,
            })
            .andWhereNot('chore_id', null)
            .limit(entryCount)
            .then(chores => {
                const choreCount = chores.length;
                const fillCount = entryCount - choreCount;
                return knex(tableName)
                    .select()
                    .where({
                        user_id,
                    })
                    .limit(fillCount)
                    .then(fillEntries => {
                        return Promise.resolve(chores.concat(fillEntries));
                    });
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
    getEntriesForChores: function(user_id) {
        return knex(tableName)
            .select()
            .where({
                user_id,
            })
            .andWhereNot('chore_id', null)
            .then(rows => Promise.resolve(rows));
    },
    getPendingEntriesForChoreList: function(user_id, chores) {
        return knex(tableName)
            .select()
            .whereIn('chore_id', chores)
            .andWhere({
                user_id,
                done: false,
            })
            .then(rows => Promise.resolve(rows));
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
            .then(updatedEntries => Promise.resolve(updatedEntries)); // Return the amount of updated entries
    },
};

module.exports = Journal;
