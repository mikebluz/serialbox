import axios from 'axios';
import { useState } from 'react';

// mui
import Box from '@mui/material/Box';
import ButtonGroup from '@mui/material/ButtonGroup';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// repo
import { initGapi, initGapiTokenClient, parseJwt } from './api/gapi.js';
import {buttonStyle} from './styles/styles.js';

// components
import AllSongs from './components/allsongs.js';
import Playlists from './components/playlists.js';
import Player from './components/player.js';
import Load from './components/load.js';
import Shuffle from './components/shuffle.js';

const CLIENT_ID = `${process.env.REACT_APP_GAPI_CLIENT_ID}.apps.googleusercontent.com`;

const App = (props) => {
  const [newSongsLoaded, setNewSongsLoaded] = useState({});

  const handleLoadedSongs = (songs) => {
    console.log("songs loaded")
    setNewSongsLoaded(songs);
  }

  const Copyright = () => {
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

  const Options = () => {
    const [folderName, setFolderName] = useState(''); 
    const [playlistName, setPlaylistName] = useState('');

    return (
      <div>
        <TextField id="folder-name" label="Enter folder name" variant="outlined" onChange={(evt) => setFolderName(evt.target.value)} />
        <TextField id="playlist-name" label="Enter playlist name" variant="outlined" onChange={(evt) => setPlaylistName(evt.target.value)} />
        <ButtonGroup variant="outlined" aria-label="outlined button group">
          <Load 
            folderName={folderName} 
            playlistName={playlistName}
            user={props.user} 
            handleLoadedSongs={handleLoadedSongs}
          />
          <Playlists />
          <Shuffle />
        </ButtonGroup>
      </div>
    )
  }

  const Greeting = () => {
    return (
      <h1>Welcome, {props.user.given_name}!</h1>
    )
  }

  const Login = async () => {
    const result = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/login`, {
      user: 'test',
    });
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={16}>
            <Greeting />
          </Grid>
          <Grid item xs={16}>
            <Options />
          </Grid>
          <Grid item xs={16}>
            <Typography variant="h4" component="h1" gutterBottom>
              SerialBox is a music player for unpublished work.
            </Typography>
          </Grid>
          <Grid item xs={16}>
            <Player />
          </Grid>
          <Grid item xs={16}>
            <Copyright />
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default App;
