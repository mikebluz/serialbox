const { DataTypes } = require('sequelize');
const { pg } = require('./db.js');

// Admin
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

// Player
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
  order: DataTypes.INTEGER,
});

// Messaging
const Messages = pg.define('message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  name: DataTypes.STRING,
});

// Relationships
User.hasMany(Playlist);
Playlist.belongsToMany(Song, { through: PlaylistSong });
Song.belongsToMany(Playlist, { through: PlaylistSong });

// Execute pg code
pg.sync();

module.exports = {
  User,
  Song,
  Playlist,
  PlaylistSong
};