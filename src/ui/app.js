/* global gapi */
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import axios from 'axios';
import GoogleAPI from './api/google.js';
import { parseJwt } from './helpers.js';
import { initGapi, initGapiTokenClient } from './api/gapi.js';

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

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.user = props.user;
    this.login = this.login.bind(this);
  }

  componentDidMount() {
    /** 
     * ToDos
     * 
     * 1. Move below call to initGapiTokenClient to onClick of Load component, which should be an input accepting folder names (array) as data
     * 2. Pass those names to the Load component
     * 
     * Load Component: 
     * 3. Use the folder names to etch the files for each folder
     *    - concat into array or keep separate like Map<folderName, files[]>
     * 4. Save playlist (many songs, many users), folders (many songs, many users), and songs (many folders, many playlists) in db
     *    - We many have to start small here and start with one user per playlist,
     *      but it would be cool to have many users, so have the ability to share a playlist with another user
     *      that would accept a gmail (the person you want to share with) and then automatically given that gmail access to the files
     *      and add the newUser to Playlist relation in the db.
     * 5. Render Playlist component and display songs for this playlist
     * 6. Allow user to play, etc.
     * 
     * 
     * App (this) component:
     * 1. After Login, present options list: Load, View (Playlists or Songs), Shuffle (create randomized playlist of all songs the app knows about for this user)
     * 
     * Playlist component:
     * 1. Need an audio player with play, pause, stop, track change, track jump, repeat, loop (loop sections of song you can set via the progress bar), shuffle but 
     *    that should be integrated with the same Shuffle button), volume control, progress slider/skipper.
     * 2. Play component needs to load the track from google (drive API call to get file with alt: 'media' option)
     *    and should use Web Audio component to play.
     * 
     * Shuffle component:
     * 1. Button that modifies state property "playlist", which has all the currently loaded songs.
     * 2. On press: stop playing if playing, do quick random sort on the playlist, queue up first track.
     * **/
    initGapiTokenClient();
  }

  greeting(user) {
    const parsedUser = JSON.parse(user);
    return (
      <h1>Welome, {parsedUser.given_name}!</h1>
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
          {this.greeting(this.user)}
          <Typography variant="h4" component="h1" gutterBottom>
            SerialBox is a music player for unpublished work.
          </Typography>
          <Copyright />
        </Box>
      </Container>
    )
  };
}
