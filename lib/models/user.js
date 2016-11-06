"use strict";

const knex = require('../db');
const bcrypt = require('bcrypt');

const tableName = 'users';

const User = {
    createUser: function(username, password) {
        return new Promise((resolve, reject) => {
            bcrypt.genSalt(10, (saltGenErr, salt) => {
                bcrypt.hash(password, salt, (hashErr, hash) => {
                    if (hashErr) {
                        reject();
                    }
                    resolve(hash);
                });
            })
        })
        .then(passwordHash => {
            return new Promise((resolve, reject) => {
                knex(tableName).insert({username, password: passwordHash}).returning('id')
                    .then(rows => resolve(rows[0]));
            });
        });
    },
    getUserIdByUsernameAndPassword: function(username, password) {
        return knex.select()
            .from(tableName)
            .where({username})
            .timeout(1000)
            .then(rows => {
                if (rows.length === 1) {
                    const userId = rows[0]['id'];
                    const passwordHash = rows[0]['password'];
                    return new Promise((resolve, reject) => {
                        bcrypt.compare(password, passwordHash, (err, isValid) => {
                            if (err === undefined && isValid === true) {
                                return resolve(userId);
                            }
                            return reject();
                        });
                    });
                }
                else {
                    throw new Error("No user found for username and password");
                }
            });
    },
    getUserIdByApiKey: function(apiKey) {
        return knex.select('id')
            .from(tableName)
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
            .from(tableName)
            .where({id: userId})
            .timeout(1000)
            .then(rows => {
                if (rows.length === 1) {
                    let userDetails = rows[0];
                    userDetails.password = "";
                    return Promise.resolve(rows[0]);
                }
                throw new Error("No user found");
            });
    },
    getApiKey: function(userId) {
        return knex.select('api_key')
            .from(tableName)
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
