import * as ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import App from './ui/app';
import theme from './ui/theme';
import { getAccessToken, initGapi, initGapiTokenClient } from './ui/api/gapi.js';
import axios from 'axios';

let errorMessage;

new Promise((res, rej) => {
  window.onload = () => initGapi(res);
}).then(async (googleUser) => {
  const rootElement = document.getElementById('root');
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
    // Render React App
    const root = ReactDOM.createRoot(rootElement);
    if (authorized) {
      root.render(
        <div>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <CssBaseline />
          <App user={googleUser}/>
        </ThemeProvider>
        </div>,
      );
    } else {
      root.render(
        <div>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
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
  const rootElement = document.getElementById('root');
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <div>
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <p>{err}</p>
    </ThemeProvider>
    </div>,
  );
});