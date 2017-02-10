
exports.up = function(knex, Promise) {
    return Promise.all([
        knex.schema.createTable('journalentries', function(table){
            table.increments('id').notNullable();
            table.string('type').notNullable();
            table.string('entry').notNullable();
            table.dateTime('time');
            table.boolean('done').defaultTo(false);
            table.integer('user_id').notNullable();
            table.foreign('user_id').references('users.id');
            table.integer('sensor_id');
            table.foreign('sensor_id').references('sensors.id');
            table.integer('chore_id');
            table.foreign('chore_id').references('chores.id').onDelete('set null');

            table.timestamps(true, true);
        }),
        knex.schema.createTable('views', function(table){
            table.increments('id').notNullable();
            table.string('title').notNullable();
            table.jsonb('viewdata').notNullable();
            table.integer('user_id').notNullable();
            table.foreign('user_id').references('users.id');
            table.unique(['user_id']);
            table.timestamps(true, true);
        }),
        // chores
        knex.schema.createTable('chores', function(table){
            table.increments('id').notNullable();
            table.string('message').notNullable();
            table.string('recurrence');
            table.integer('user_id').notNullable();
            table.foreign('user_id').references('users.id');
            table.integer('sensor_id');
            table.foreign('sensor_id').references('sensors.id');
            table.timestamps(true, true);
        }),
        // alarms
    ]);

};

exports.down = function(knex, Promise) {
    return Promise.all([
        knex.schema.dropTableIfExists('journalentries'),
        knex.schema.dropTableIfExists('views'),
        knex.schema.dropTableIfExists('chores'),
    ]);
};
