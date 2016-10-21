
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'),
        knex.schema.createTable('users', function(table){
          table.increments('id').notNullable();
          table.string('username').notNullable();
          table.string('password').notNullable();
          table.string('salt').notNullable();
          table.uuid('api_key').defaultsTo(knex.raw('uuid_generate_v4()'));
          table.unique('username');
          table.unique('api_key');
          table.timestamps(true, true);
        }),
        knex.schema.createTable('sensors', function(table){
          table.increments('id').notNullable();
          table.string('serial').notNullable();
          table.string('name').notNullable();
          table.string('unit');
          table.integer('user_id').notNullable();
          table.foreign('user_id').references('users.id');
          table.unique(['serial', 'user_id']);
          //user
        }),
        knex.schema.createTable('measurements', function(table){
          table.increments('id').notNullable();
          table.float('value').notNullable();
          table.timestamps(true, true);
          table.integer('sensor_id');
          table.foreign('sensor_id').references('sensors.id');
          // sensor
        })
    ]);  
};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTable('measurements'),
        knex.schema.dropTable('sensors'),
        knex.schema.dropTable('users')
    ]);
};
