require("dotenv/config");

module.exports = 
{
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,//max time Sequelize will wait for a connection
        idle: 10000//how long a connection stays open when idle
    }
  }
}
