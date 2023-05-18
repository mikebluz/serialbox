// DEVELOPMENT ONLY: loads env vars from .env file into process.env
// since this is the entry point, they will be available to everything in /server
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express()
const port = 3005
const {User} = require('./persistence/models.js');
const {authorize, fetchFiles} = require('./api/gapi.js');
const cors = require('cors');  

// ToDo: Remove in production
app.use(cors({credentials: true, origin: 'http://localhost:3001'}));

app.use(express.json());

app.use(express.static('public'));

app.post('/login', async (req, res) => {
  await authorize();
  console.log("Authorized!", req.body);
  await fetchFiles();
  res.send(200);
})

app.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.send(JSON.stringify(users));
})

app.post('/users', async (req, res) => {
  const jane = await User.create({
    username: 'janedoe',
    birthday: new Date(1980, 6, 20),
  });
  await User.sync();
});

app.post('/save', (req, res) => {
  const body = req.body;
  console.log(body.substring(0, 200));
  fs.writeFileSync('./public/downloaded.m4a', atob(body), options)
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})