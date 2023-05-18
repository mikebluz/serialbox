const { Sequelize, Model, DataTypes } = require('sequelize');

// ToDo: Make env variable
const pg = new Sequelize('postgres://postgres:Ax0T$ke@localhost:5432/mikeluz');

const testDbConnection = async () => {
  try {
    await pg.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = {
	pg,
	testDbConnection
}