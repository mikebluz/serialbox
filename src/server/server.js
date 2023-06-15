// DEVELOPMENT ONLY: loads env vars from .env file into process.env
// since this is the entry point, they will be available to everything in /server
require('dotenv').config();

const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const Sequelize = require('sequelize');
const app = express()
const port = 3005
const {User, Playlist, PlaylistSong, Song} = require('./persistence/models.js');
const cors = require('cors');  
let httpOpts;

if (process.env.PROD) {
  httpsOpts = {
    ca: fs.readFileSync("/etc/pki/tls/certs/ca_bundle.crt"),
    key: fs.readFileSync("/etc/pki/tls/certs/serialboxmusic-server.com.key"),
    cert: fs.readFileSync("/etc/pki/tls/certs/serialboxmusic-server.com.crt")
  };
}

const GAPI_HOST = 'https://www.googleapis.com'

if (!process.env.PROD) {
  // ToDo: Remove in production
  app.use(cors({credentials: true, origin: 'http://localhost:3001'}));
}

app.use(express.json());

app.use(express.static('public'));

app.get('/ping', async (req, res) => {
  console.log("PING RECEIVED!");
  res.send(200);
});

app.post('/login', async (req, res) => {
  const { status } = await fetch(`${GAPI_HOST}/oauth2/v1/tokeninfo?access_token=${req.body.token}`);   
  if (status !== 200) {
    res.send(403);
    return;
  }
  const user = await User.findOne({ where: { email: req.body.email } });
  if (!user) {
    const user = await User.create({
      email: req.body.email,
    });
    await User.sync();
  };
  res.send(200);
});

app.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.send(JSON.stringify(users));
});

app.get('/playlists/all/users/:email', async (req, res) => {
  const user = await User.findOne({ where: { email: req.params.email } });
  const playlists = await Playlist.findAll({
    where: {
      userId: user.id
    }
  });
  res.send(JSON.stringify(playlists));
});

app.get('/playlists/:playlistId/songs', async (req, res) => {
  const {songs} = await Playlist.findOne({ where: { id: req.params.playlistId }, include: Song });
  const sorted = songs.sort((a, b) => a.playlist_song.order - b.playlist_song.order);
  res.status(200).send(JSON.stringify(sorted.map((raw) => raw.dataValues)));
});

app.post('/playlists/random', async (req, res) => {
  const user = await User.findOne({ where: { email: req.body.email } });
  const songs = await Song.findAll({ order: Sequelize.literal('random()'), limit: req.body.count })
  const playlist = await Playlist.create({
    name: req.body.playlistName,
    userId: user.id,
  });
  await Playlist.sync();
  songs.forEach(async (song, i) => {
    try {
      await PlaylistSong.create({
        playlistId: playlist.dataValues.id,
        songId: song.id,
        order: i
      });
    } catch(err) {
      err.errors.forEach((e) => {
        // if there is a non-"must be unique" errors, log it
        if (!e.message.includes('must be unique')) {
          console.error("There has been some kind of mistake", e);
        }
      })
    }
  });
  await Song.sync()
  await PlaylistSong.sync();
  res.status(200).send(JSON.stringify(songs.map((raw) => raw.dataValues)));
})

// ToDo: Separate the REST calls into separate endpoints and orchestrate on the front end ?
// ToDo: Handle "already exists" errors
app.post('/playlists', async (req, res) => {
  const user = await User.findOne({ where: { email: req.body.email } });
  const songsRaw = JSON.parse(req.body.songs);
  let playlist = await Playlist.create({
    name: req.body.name,
    userId: user.id,
  });
  if (!playlist) {
    playlist = await Playlist.create({
      name: req.body.name,
      userId: user.id,
    });
  }
  await Playlist.sync();
  // new playlist, create playlist and update songs
  for (const [folderName, songs] of Object.entries(songsRaw)) {
    songs.forEach(async (song, i) => {
      let songEntity;
      try {
        songEntity = await Song.create({
          name: song.name,
          artist: req.body.artist ?? 'unknown',
          folderName,
          gDriveId: song.id,
          mimeType: song.mimeType,
        });
      } catch(err) {
        // if there is a non-"SequelizeUniqueConstraintError" error, log it
        if (!err.name === "SequelizeUniqueConstraintError") {
          console.error("There has been some kind of mistake", err);
        }
        // song already exists, fetch it
        songEntity = await Song.findOne({ where: { gDriveId: song.id } });
      }
      await PlaylistSong.create({
        playlistId: playlist.dataValues.id,
        songId: songEntity.dataValues.id,
        order: i
      });
    });
  };
  await Song.sync()
  await PlaylistSong.sync();
  const {songs} = await Playlist.findOne({ where: { id: playlist.id }, include: Song });
  res.status(200).send(JSON.stringify(songs.map((raw) => raw.dataValues)));
})

app.put('/playlists', async (req, res) => {
  const user = await User.findOne({ where: { email: req.body.email } });
  const songsRaw = JSON.parse(req.body.songs);
  const playlist = await Playlist.findOne({ where: { name: req.body.name, userId: user.id }, include: Song });
  if (!playlist) {
    console.error("Playlist not found", req.body);
    res.send(400);
    return;
  }
  songsRaw.forEach(async (song, i) => {
    await Song.update({
      name: song.name,
      artist: song.artist
    }, { where: { id: song.id } });
    await PlaylistSong.update({
      order: i
    }, { 
      where: {
        [Sequelize.Op.and]: [{playlistId: playlist.dataValues.id}, {songId: song.id}]
      } 
    });
  });
  await Song.sync()
  await PlaylistSong.sync();
  const updated = await Playlist.findOne({ where: { name: req.body.name, userId: user.id }, include: Song });
  const sorted = updated.songs.sort((a, b) => a.playlist_song.order - b.playlist_song.order);
  res.status(200).send(JSON.stringify(sorted.map((s) => s.dataValues)));
})

app.delete('/playlists/:playlistId/songs/:songId', async (req, res) => {
  const destroyed = await PlaylistSong.destroy({
    where: {
      playlistId: req.params.playlistId,
      songId: req.params.songId
    }
  });
  console.log("Removed?", destroyed);
  const updated = await Playlist.findOne({ where: { id: req.params.playlistId }, include: Song });
  const sorted = updated.songs.sort((a, b) => a.playlist_song.order - b.playlist_song.order);
  res.status(200).send(JSON.stringify(sorted.map((s) => s.dataValues)));
})

app.get('/songs/:email', async (req, res) => {
  const user = await User.findOne({ where: { email: req.params.email } });
  const allPlaylists = await Playlist.findAll({
    where: {
      userId: user.id
    },
    include: Song
  });
  const allSongs = allPlaylists.flatMap((p) => p.songs);
  res.status(200).send(JSON.stringify(allSongs.map((raw) => raw.dataValues)));
})

app.post('/songs', async (req, res) => {
  const createdSong = await Song.create({
    name: req.body.name,
    artist: req.body.artist ?? 'unknown',
    folderName: req.body.folderName,
    gDriveId: req.body.id,
    mimeType: req.body.mimeType,
  });
  res.status(200).send(createdSong);
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

if (process.env.PROD) {
  https.createServer(httpsOpts, app).listen(8080);
}
