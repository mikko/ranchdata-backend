"use strict";

const knex = require('../db');

const tableName = 'users';

const salt = "";

const User = {
    createUser: function(username, password) {
        return knex(tableName).insert({username, password, salt}).returning('id')
            .then(rows => rows[0]);
    },
    getUserIdByUsernameAndPassword: function(username, password) {
        return knex.select('id')
            .from('users')
            .where({username, password})
            .timeout(1000)
            .then(rows => {
                if (rows.length === 1) {
                    const userId = rows[0]['id'];
                    return Promise.resolve(userId);
                }
                throw new Error("No user found for API key");
            });
    },
    getUserIdByApiKey: function(apiKey) {
        return knex.select('id')
            .from('users')
            .where({api_key: apiKey})
            .timeout(1000)
            .then(rows => {
                if (rows.length === 1) {
                    const userId = rows[0]['id'];
                    return Promise.resolve(userId);
                }
                throw new Error("No user found for API key");
            });
    },
    getUserDetails: function(userId) {
        return knex.select()
            .from('users')
            .where({id: userId})
            .timeout(1000)
            .then(rows => {
                if (rows.length === 1) {
                    return Promise.resolve(rows[0]);
                }
                throw new Error("No user found for API key");
            });
    },
    getApiKey: function(userId) {
        return knex.select('api_key')
            .from('users')
            .where({id: userId})
            .timeout(1000)
            .then(rows => {
                if (rows.length === 1) {
                    const apiKey = rows[0]['api_key'];
                    return Promise.resolve(apiKey);
                }
                throw new Error("No API key found for user");
            });
    }
};

module.exports = User;
