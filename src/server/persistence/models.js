const {DataTypes} = require('sequelize');
const {pg} = require('./db.js');

const User = pg.define('User', {
  username: DataTypes.STRING,
  birthday: DataTypes.DATE,
});

module.exports = {
  User,
};