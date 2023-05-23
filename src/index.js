import * as ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import App from './ui/app';
import theme from './ui/theme';
import { initGapi, initGapiTokenClient } from './ui/api/gapi.js';
import axios from 'axios';

new Promise((res, rej) => {
  window.onload = () => {
    initGapi(res);
  };
}).then(async (googleUser) => {
  const rootElement = document.getElementById('root');

  // ToDo: right now `login` just creates the user if it doesn't exist, we need to implement API tokens
  // Possibly utilize Google Auth on backend as well
  const loginRes = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/login`, {
    email: googleUser.email
  });

  // Render React App
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <div>
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <App user={googleUser}/>
    </ThemeProvider>
    </div>,
  );

});