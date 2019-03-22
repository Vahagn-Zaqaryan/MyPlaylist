/*----- DATABASE CONNECTING AND SEQUELIZE -----*/

// Modules
const Sequelize = require('sequelize');
const config = require('../config/config');

// Registering sequelizer 
const sequelize = new Sequelize(
  config.database.name, // Database name
  config.database.username, // Database username
  config.database.password, // Database password
  {
    host: config.database.host, // Database host
    dialect: config.database.dialect, // Database dialect
    port: config.database.port, // Database port
    define: {
      timestamps: false
    }
  }
);

// Sequelizer authentication
sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Expoting module sequelize on line 9
module.exports = sequelize;
