// Update with your config settings.

module.exports = {
  // Uses actually the development database
  test_init: {
    client: 'postgresql',
    connection: {
      database: 'postgres',
      user:     'postgres'
    }
  },
  test: {
    client: 'postgresql',
    connection: {
      database: 'ranch',
      user:     'postgres'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: './test/seed'
    }
  },
  development: {
    client: 'postgresql',
    connection: {
      database: 'ranch',
      user:     'ranch',
      password: 'ranch'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
