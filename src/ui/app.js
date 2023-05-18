/* global gapi */
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import axios from 'axios';
import GoogleAPI from './api/google.js';

const GAPI = new GoogleAPI();

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

async function login() {
  // ToDo: inject env var for domain URI
  const result = await axios.post('http://localhost:3005/login', {
    user: 'test',
  });
}

function loginButton() {
  return (
    <div>
      <h1 onClick={login}>SERVER LOG IN</h1>
      <h1 onClick={GAPI.handleAuthClick}>V3 BROWSER LOG IN</h1>
    </div>
  )
}

export default class App extends React.Component {
  render() {
    return (
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          {loginButton()}
          <Typography variant="h4" component="h1" gutterBottom>
            SerialBox is a music player for unpublished work.
          </Typography>
          <Copyright />
        </Box>
      </Container>
    )
  };
}
