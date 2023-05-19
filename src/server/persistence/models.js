const { DataTypes } = require('sequelize');
const { pg } = require('./db.js');

const User = pg.define('User', {
  id: DataTypes.INTEGER,
  username: DataTypes.STRING,
  password: DataTypes.STRING,
  birthday: DataTypes.DATE,
});

const Song = pg.define('Song', {
  id: DataTypes.INTEGER,
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