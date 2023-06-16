import * as ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import App from './ui/app';
import theme from './ui/theme';
import { getAccessToken, initGapi, initGapiTokenClient } from './ui/api/gapi.js';
import axios from 'axios';

let errorMessage;

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

new Promise((res, rej) => {
  window.onload = () => {
    try {
      initGapi(res)
    } catch (err) {
      rej(err);
    }
  };
}).then(async (googleUser) => {
  getAccessToken(async (token) => {
    let authorized = false;
    try {
      await axios.post(`${process.env.REACT_APP_SERVER_HOST}/login`, {
        email: googleUser.email,
        token
      });
      authorized = true;
    } catch (err) {
      console.error("Error logging in", err);
      errorMessage = err.message;
    }
    if (authorized) {
      root.render(
        <div>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App user={googleUser}/>
        </ThemeProvider>
        </div>,
      );
    } else {
      root.render(
        <div>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h1>{errorMessage}</h1>
          </Box>
        </ThemeProvider>
        </div>,
      );
    }
  })
}).catch(err => {
  root.render(
    <div>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <p>{err}</p>
    </ThemeProvider>
    </div>,
  );
});