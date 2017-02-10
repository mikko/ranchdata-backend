'use strict';

const knex = require('../db');
const moment = require('moment');

const tableName = 'chores';

const Chore = {
    createChore: function(user_id, message, recurrence, sensor_id) {
        return knex(tableName)
                .insert({user_id, message, recurrence, sensor_id})
                .returning('id')
                .then(rows => Promise.resolve(rows[0]));
    },
    getAllChores: function(user_id) {
        return knex(tableName)
            .select()
            .where({
                user_id: user_id
            })
            .orderBy('created_at', 'desc')
            .then(rows => {
                return Promise.resolve(rows);
            });
    },
    updateChore: function(user_id, id, message, recurrence) {
        return knex(tableName)
            .where({
                user_id,
                id,
            })
            .update({
                message,
                recurrence,
            })
            .then(updatedChores => Promise.resolve(updatedChores)); // Return the amount of updated entries
    },
    removeChore: function(user_id, id) {
        return knex(tableName)
            .where({
                user_id,
                id,
            })
            .del()
            .then(removeCount => Promise.resolve(removeCount));
    },
};

module.exports = Chore;
