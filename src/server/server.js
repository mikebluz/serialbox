// DEVELOPMENT ONLY: loads env vars from .env file into process.env
// since this is the entry point, they will be available to everything in /server
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express()
const port = 3005
const {User, Playlist, PlaylistSong, Song} = require('./persistence/models.js');
const {authorize, fetchFiles} = require('./api/gapi.js');
const cors = require('cors');  

// ToDo: Remove in production
app.use(cors({credentials: true, origin: 'http://localhost:3001'}));

app.use(express.json());

app.use(express.static('public'));

// This login endpoint uses the *old* Google API auth flow for CLI Node apps
// app.post('/login', async (req, res) => {
//   await authorize();
//   console.log("Authorized!", req.body);
//   await fetchFiles();
//   res.send(200);
// });

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

// ToDo: Separate the REST calls into separate endpoints and orchestrate on the front end ?
// ToDo: Handle "already exists" errors
app.post('/playlist', async (req, res) => {
  const user = await User.findOne({ where: { email: req.body.email } });
  const songsRaw = JSON.parse(req.body.songs);
  const playlist = await Playlist.create({
    name: req.body.name,
    userId: user.id,
  });
  await Playlist.sync();
  for(const [folderName, songs] of Object.entries(songsRaw)) {
    songs.forEach(async (song) => {
      try {
        const createdSong = await Song.create({
          title: song.name,
          artist: req.body.artist ?? 'whatever',
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
  res.send(200);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})