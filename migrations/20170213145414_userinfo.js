
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.alterTable('users', function(table) {
            table.string('location');
        }),
        knex.schema.alterTable('measurements', function(table) {
            table.timestamp('measurement_time').defaultTo(knex.fn.now());
        }),
    ]);

};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.alterTable('users', function(table) {
            table.dropColumn('location');
        }),
        knex.schema.alterTable('measurements', function(table) {
            table.dropColumn('measurement_time');
        })
    ]);
};
