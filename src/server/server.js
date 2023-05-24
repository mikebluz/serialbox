// DEVELOPMENT ONLY: loads env vars from .env file into process.env
// since this is the entry point, they will be available to everything in /server
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const Sequelize = require('sequelize');
const app = express()
const port = 3005
const {User, Playlist, PlaylistSong, Song} = require('./persistence/models.js');
const cors = require('cors');  

// ToDo: Remove in production
app.use(cors({credentials: true, origin: 'http://localhost:3001'}));

app.use(express.json());

app.use(express.static('public'));

app.post('/login', async (req, res) => {
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
  res.status(200).send(JSON.stringify(songs.map((raw) => raw.dataValues)));
});

app.post('/playlists/random', async (req, res) => {
  const user = await User.findOne({ where: { email: req.body.email } });
  const songs = await Song.findAll({ order: Sequelize.literal('random()'), limit: req.body.count })
  const playlist = await Playlist.create({
    name: req.body.playlistName,
    userId: user.id,
  });
  await Playlist.sync();
  songs.forEach(async (song) => {
    try {
      await PlaylistSong.create({
        playlistId: playlist.dataValues.id,
        songId: song.id,
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
  const playlist = await Playlist.create({
    name: req.body.name,
    userId: user.id,
  });
  await Playlist.sync();
  for (const [folderName, songs] of Object.entries(songsRaw)) {
    songs.forEach(async (song) => {
      try {
        const createdSong = await Song.create({
          name: song.name,
          artist: req.body.artist ?? 'unknown',
          folderName,
          gDriveId: song.id,
          mimeType: song.mimeType,
        });
        await PlaylistSong.create({
          playlistId: playlist.dataValues.id,
          songId: createdSong.dataValues.id,
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
  }
  await Song.sync()
  await PlaylistSong.sync();
  res.status(200).send(JSON.stringify(playlist));
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})