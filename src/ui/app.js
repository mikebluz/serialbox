import * as React from 'react';
import { useState } from 'react';
import ButtonGroup from '@mui/material/ButtonGroup';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import axios from 'axios';
import { parseJwt } from './helpers.js';
import { initGapi, initGapiTokenClient } from './api/gapi.js';
import {buttonStyle} from './styles/styles.js';

// components
import AllSongs from './components/allsongs.js';
import Playlists from './components/playlists.js';
import Player from './components/player.js';
import Load from './components/load.js';
import Shuffle from './components/shuffle.js';


const CLIENT_ID = `${process.env.REACT_APP_GAPI_CLIENT_ID}.apps.googleusercontent.com`;


function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://mercywizard.com/">
        SerialBox
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

function Options(props) {
  const [folderName, setFolderName] = useState(''); 
  return (
    <div>
      <TextField id="folder-name" label="Enter folder name" variant="outlined" onChange={(evt) => setFolderName(evt.target.value)} />
      <ButtonGroup variant="outlined" aria-label="outlined button group">
        <Load folderName={folderName} user={props.user}/>
        <Playlists />
        <Shuffle />
      </ButtonGroup>
    </div>
  )
}

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.user = props.user;
    this.login = this.login.bind(this);
  }

  greeting() {
    // const parsedUser = JSON.parse(user);
    return (
      <h1>Welcome, {this.user.given_name}!</h1>
    )
  }

  async login() {
    // ToDo: inject env var for domain URI
    const result = await axios.post('http://localhost:3005/login', {
      user: 'test',
    });
  }
  
  render() {
    return (
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={8}>
              {this.greeting}
            </Grid>
            <Grid item xs={8}>
              <Options user={this.user}/>
            </Grid>
            <Grid item xs={8}>
              <Typography variant="h4" component="h1" gutterBottom>
                SerialBox is a music player for unpublished work.
              </Typography>
            </Grid>
            <Grid item xs={8}>
              <Player />
            </Grid>
            <Grid item xs={8}>
              <Copyright />
            </Grid>
          </Grid>
        </Box>
      </Container>
    )
  };
}
