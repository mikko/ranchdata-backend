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
    createOrUpdateView: function(user_id, title, viewdata) {
        return knex(tableName)
            .select()
            .where({
                user_id
            })
            .then(existingRows => {
                if (existingRows.length === 0) {
                    return knex(tableName)
                        .insert({user_id, title, viewdata})
                        .returning('id')
                        .then(rows => Promise.resolve(rows[0]));
                }
                else {
                    return knex(tableName)
                        .where({
                            user_id
                        })
                        .update({
                            title,
                            viewdata
                        })
                        .returning('id')
                        .then(rows => Promise.resolve(rows[0]));
                }
            });
    },
    getView: function(user_id) {
        return knex(tableName)
            .select()
            .where({
                user_id: user_id
            })
            .then(rows => {
                return Promise.resolve(rows[0]);
            });
    },
};

module.exports = View;
