
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.alterTable('users', function(table) {
            table.string('location');
        }),
        knex.schema.alterTable('measurements', function(table) {
            table.timestamp('measurement_time').defaultTo(knex.fn.now());
        }),
        knex.schema.createTable('forecast', function(table) {
            table.increments('id').notNullable();
            table.float('value').notNullable();
            table.integer('distance').notNullable();
            table.string('step').notNullable().defaultsTo('hour');
            table.timestamps(true, true);
            table.integer('sensor_id');
            table.foreign('sensor_id').references('sensors.id');
        })
    ]);

};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.alterTable('users', function(table) {
            table.dropColumn('location');
        }),
        knex.schema.alterTable('measurements', function(table) {
            table.dropColumn('measurement_time');
        }),
        knex.schema.dropTableIfExists('forecast')
    ]);
};
