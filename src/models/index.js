'use strict';

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');


//important vars
const env = process.env.NODE_ENV || 'development';
const basename = path.basename(__filename);//index.js
const config = require(__dirname + '/../config/config.js')[env];//load config file 
const db = {};

//connection instance
const sequelize = new Sequelize(
  config.database, 
  config.username, 
  config.password, 
  config
);

//test connection
(async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1); // Exit with error code
  }
})();

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    try{
      const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    }catch(error){
      console.error(`Failed to load model ${file}:` , error)
    }
  });

Object.keys(db).forEach(modelName => { 
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
//Adds the Sequelize instance to the db object (so you can use it for syncing, transactions)
db.sequelize = sequelize;
//Adds the Sequelize class (the library itself) to the db object — useful for accessing data types 
db.Sequelize = Sequelize;

module.exports = db;
