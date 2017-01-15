var config      = require('../knexfile.js');
var env         = process.env.DATABASE_URL ? 'production' : 'development';
var knex        = require('knex')(config[env]);

module.exports = knex;
