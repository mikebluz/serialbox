import axios from 'axios';
import { useState } from 'react';

// mui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
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

const headerFooterStyle = {
  backgroundColor: 'black',
  color: 'white',
};

const componentDisplayStyle = { 
  display: 'flex',
  border: '1px solid black', 
  borderRadius: '6px',
  margin: '2px',
};

const App = (props) => {
  const [newSongsLoaded, setNewSongsLoaded] = useState({});

  const handleLoadedSongs = (songs) => {
    console.log("songs loaded")
    setNewSongsLoaded(songs);
  }

  const Copyright = () => {
    return (
      <Typography variant="body2" align="center">
        {'Copyright © '}
        <Link color="inherit" href="https://mercywizard.com/">
          SerialBox
        </Link>{' '}
        {new Date().getFullYear()}
      </Typography>
    );
  }

  const Options = () => {
    return (
      <div>
        <ButtonGroup variant="contained" aria-label="outlined button group">
          <Load 
            user={props.user} 
            handleLoadedSongs={handleLoadedSongs}
          />
        </ButtonGroup>
      </div>
    )
  }

  const Greeting = () => {
    return (
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome, {props.user.given_name}!
      </Typography>
    )
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={16} style={{...componentDisplayStyle, ...headerFooterStyle}}>
            <Greeting />
          </Grid>
          <Grid item xs={16} style={componentDisplayStyle}>
            <Options />
          </Grid>
          <Grid item xs={16} style={componentDisplayStyle}>
            <Player />
          </Grid>
          <Grid item xs={16} style={{...componentDisplayStyle, ...headerFooterStyle}}>
            <Copyright />
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default App;
