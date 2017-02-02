'use strict';

const knex = require('../db');

const tableName = 'views';

const View = {
/*

 table.increments('id').notNullable();
 table.string('title').notNullable();
 table.jsonb('viewdata').notNullable();
 table.integer('user_id').notNullable();

 */
    createView: function(user_id, title, viewdata) {
        return new Promise((resolve, reject) => {
            knex(tableName).insert({user_id, title, viewdata}).returning('id')
                .then(rows => resolve(rows[0]));
        });
    },
    getViews: function(user_id) {
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
};

module.exports = View;
