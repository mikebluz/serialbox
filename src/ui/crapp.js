/* global gapi */
import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import axios from 'axios';
import GoogleAPI from './api/google.js';
import Login from './auth/login.js';

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
    this.login = this.login.bind(this);
    this.handleAuthClick = this.handleAuthClick.bind(this);
  }

  async loadGAPI() {
    this.GAPI = new GoogleAPI();
    this.GAPI.loadTokenClient();
    await this.GAPI.loadGapiClient();
  }

  componentDidMount() {
    // On hard reload with cache refresh, component mounts before window.google is populated
    // In those cases, defer load to auth click (see below)
    if (window.google !== undefined) {
      this.loadGAPI();
    }
  }

  async handleAuthClick() {
    if (!this.GAPI) {
      await this.loadGAPI();
    }
    this.GAPI.handleAuthClick();
  }

  async login() {
    // ToDo: inject env var for domain URI
    const result = await axios.post('http://localhost:3005/login', {
      user: 'test',
    });
  }

  loginButton() {
    return (
      <div>
        { /* <h1 onClick={this.login}>SERVER LOG IN</h1> */ }
        <button onClick={this.handleAuthClick}>V3 BROWSER LOG IN</button>
      </div>
    )
  }
  
  render() {
    return (
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <Login />
          {this.loginButton()}
          <Typography variant="h4" component="h1" gutterBottom>
            SerialBox is a music player for unpublished work.
          </Typography>
          <Copyright />
        </Box>
      </Container>
    )
  };
}
