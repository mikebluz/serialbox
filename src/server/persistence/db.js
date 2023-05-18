const { Sequelize, Model, DataTypes } = require('sequelize');

// ToDo: Make env variable
const pg = new Sequelize(`postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:5432/${process.env.DB_NAME}`);

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