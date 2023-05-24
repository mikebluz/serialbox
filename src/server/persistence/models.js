const { DataTypes } = require('sequelize');
const { pg } = require('./db.js');

const User = pg.define('user', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  indexes: [
    {
      unique: true,
      fields: ['email'],
    }
  ]
});

const Song = pg.define('song', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  artist: DataTypes.STRING,
  name: DataTypes.STRING,
  size: DataTypes.STRING,
  folderName: DataTypes.STRING,
  gDriveId: DataTypes.STRING,
  mimeType: DataTypes.STRING
}, {
  indexes: [
    {
      unique: true,
      fields: ['gDriveId'],
    }
  ]
});

const Playlist = pg.define('playlist', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  name: DataTypes.STRING,
});

const PlaylistSong = pg.define('playlist_song', {
  playlistId: {
    type: DataTypes.UUID,
    references: {
      model: Playlist,
      key: 'id'
    }
  },
  songId: {
    type: DataTypes.UUID,
    references: {
      model: Song,
      key: 'id'
    }
  },
});

User.hasMany(Playlist);
Playlist.belongsToMany(Song, { through: PlaylistSong });
Song.belongsToMany(Playlist, { through: PlaylistSong });

pg.sync();

module.exports = {
  User,
  Song,
  Playlist,
  PlaylistSong
};