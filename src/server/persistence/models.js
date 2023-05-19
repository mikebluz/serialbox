const { DataTypes } = require('sequelize');
const { pg } = require('./db.js');

const User = pg.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUID,
    allowNull: false,
    primaryKey: true
  },
  username: DataTypes.STRING,
  password: DataTypes.STRING,
  birthday: DataTypes.DATE,
});

const Song = pg.define('Song', {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUID,
    allowNull: false,
    primaryKey: true
  },
  artist: DataTypes.STRING,
  title: DataTypes.STRING,
  size: DataTypes.STRING
});

const LoadedSongs = pg.define('LoadedSongs', {
  songs: { 
    type: DataTypes.ARRAY,
    references: {
    model: {tableName: Song},
    key: 'id'
  }}
});

const Playlist = pg.define('Playlist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: Sequelize.UUID,
    allowNull: false,
    primaryKey: true
  },
  name: DataTypes.STRING,
  songs: { 
    type: DataTypes.ARRAY,
    references: {
    model: {tableName: Song},
    key: 'id'
  }},
});

module.exports = {
  User,
  Song,
  LoadedSongs,
  Playlist

};