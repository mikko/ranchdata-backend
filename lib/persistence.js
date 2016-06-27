var _ = require('lodash');
var pg = require('pg');
var Promise = require('bluebird');

var connectionString = require('../dbConfig');

var sqlConst = {
    existsTest: 'SELECT 1 FROM information_schema.tables WHERE table_name = "account"',
    initialize: [`
        CREATE TABLE IF NOT EXISTS account(
            id SERIAL PRIMARY KEY, 
            username TEXT NOT NULL UNIQUE, 
            password TEXT NOT NULL,
            salt TEXT NOT NULL)`,
        `CREATE TABLE IF NOT EXISTS sensor(
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            unit TEXT NOT NULL,
            account INTEGER NOT NULL,
            FOREIGN KEY(account) REFERENCES account(id))`,
        `CREATE TABLE IF NOT EXISTS measurement(
            id SERIAL PRIMARY KEY,
            sensor INTEGER NOT NULL,
            created TIMESTAMP NOT NULL,
            value TEXT NOT NULL UNIQUE,
            account INTEGER NOT NULL,
            FOREIGN KEY(sensor) REFERENCES sensor(id)
        )`],
    get: {
        // All
        accounts: 'SELECT * FROM account'
    },
    testTable: 'record',
    insert: {
        player: 'INSERT INTO account(username, password, salt) VALUES ($1, $2, $3) RETURNING id'
    }
};

var Persistence = function() {
};

Persistence.prototype.connect = function() {
    return new Promise(function(resolve, reject) {
        Persistence.db.connect(function(err, client) {
            if (err) {
                console.log(err);
                reject();
            }
            resolve(client);
        });
    });
};

Persistence.prototype.init = function() {
    console.log('Creating database handle ', connectionString);
    Persistence.db = new pg.Client(connectionString);
    Persistence.db.connect();
    new Promise(function(resolve) {
        Persistence.db.query(sqlConst.existsTest,
            function(err, result) {
                resolve(result);
            });
        })
        .then(function(result) {
            var databaseInitialized = result.rows.length > 0;
            console.log('Database initialized', databaseInitialized);
            if (databaseInitialized) {
                return;
            } else {
                var initialData = {
                    users: ['Ralli-Pekka', 'Matti Anttila']
                };
                console.log('Initializing database');
                sqlConst.initialize.forEach(function(clause) {
                    Persistence.db.query(clause);
                });
                initialData.users.forEach(user => {
                    console.log(`TODO: Add initial user ${user}`);
                });
            }
        });
};

Persistence.prototype.rawGet = function(query, values) {
    return new Promise(function(resolve) {
        values = _.isArray(values) ? values : [values];
        var resolveWithValue = function(err, values) {
            if (err) {
                console.log(query, values, err);
            }
            resolve(values.rows);
        };
        Persistence.db.query(query, values, resolveWithValue);
    });
};

Persistence.prototype.insert = function(table, values) {
    return new Promise(function(resolve, reject) {
        var query = sqlConst.insert[table];
        values = _.isArray(values) ? values : [values];
        console.log('Should now insert', query, values);
        Persistence.db.query(query, values,
            function(err, result) {
                if (err) {
                    console.log('ERROR', err);
                    reject(err);
                }
                var newId = result && result.rows ? result.rows[0] : -1;
                resolve(newId);
            });
    });
};

Persistence.prototype.fetchAll = function(table) {
    return new Promise(function(resolve, reject) {
        var query = sqlConst.get[table + 's'];
        if (query !== undefined) {
            Persistence.db.query(query, function(err, result) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                var response = {};
                response[table + 's'] = result.rows;
                resolve(response);
            });
        } else {
            reject('Query not found ' + table);
        }
    });
};

Persistence.prototype.fetch = function(table, values) {
    return new Promise(function(resolve,reject) {
        values = _.isArray(values) ? values : [values];
        var query = sqlConst.get[table];
        if (query !== undefined) {
            Persistence.db.query(query, values, function(err, result) {
                var response = result.rows.length === 1 ? result.rows[0] : result.rows;
                resolve(response);
            });
        } else {
            reject('Query not found ' + table);
        }
    });
};

Persistence.prototype.fetchIn = function(table, values) {
    return new Promise(function(resolve,reject) {
        values = _.isArray(values) ? values : [values];
        var query = sqlConst.get[table + 'sIn'];
        query += '(' + values.map((x, i) => '$' + (i + 1)) + ')';
        if (query !== undefined) {
            Persistence.db.query(query, values, function(err, result) {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                resolve(result.rows);
            });
        } else {
            reject('Query not found ' + table);
        }
    });
};
/*
Persistence.prototype.close = function() {
	Persistence.db.close();
};
*/

const instance = new Persistence();
instance.init();

module.exports = instance;
