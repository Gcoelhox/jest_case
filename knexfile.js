module.exports = {
  test: {
    client: 'pg',
    connection: {
      user: 'postgres',
      password: 'postgres',
      database: 'barriga',
    },
    migrations: {
      directory: 'src/migrations',
    },
    seeds: {
      directory: 'src/seeds',
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};
