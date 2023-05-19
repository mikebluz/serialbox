import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import App from './ui/app';
import theme from './ui/theme';
import { initGapi, initGapiTokenClient } from './ui/api/gapi.js';

new Promise((res, rej) => {
  window.onload = () => {
    initGapi(res);
  };
}).then((googleUser) => {
  const rootElement = document.getElementById('root');

  // Render React App
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <App user={JSON.stringify(googleUser)}/>
    </ThemeProvider>,
  );

});