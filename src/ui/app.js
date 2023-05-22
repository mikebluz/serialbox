import axios from 'axios';
import { useEffect, useState, useRef } from 'react';

// mui components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// mui icons
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';

// repo
import {
  getAccessToken,
  fetchDriveFileBlob, 
  initGapi, 
  initGapiTokenClient, 
  parseJwt 
} from './api/gapi.js';
import {
  buttonStyle, 
  componentDisplayStyle, 
  headerFooterStyle
} from './styles/styles.js';

// components
import AllSongs from './components/allsongs.js';
import Playlist from './components/playlist.js';
import Playlists from './components/playlists.js';
import PlayerControls from './components/playercontrols.js';
import Load from './components/load.js';
import Shuffle from './components/shuffle.js';

const CLIENT_ID = `${process.env.REACT_APP_GAPI_CLIENT_ID}.apps.googleusercontent.com`;

const App = (props) => {

  const [songsLoaded, setSongsLoaded] = useState([]);
  const [songsAreLoaded, setSongsAreLoaded] = useState(false);
  // "setIsPlaying" precipitates the playing
  const [isPlaying, setIsPlaying] = useState(false);
  const [src, setSrc] = useState('');
  const [trackLoaded, setTrackLoaded] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(100);

  const trackRef = useRef();

  const handleLoadedSongs = (songs) => {
    setSongsLoaded(formatSongsLoadedForPlayer(songs));
  }

  // Flatten folders object into array
  const formatSongsLoadedForPlayer = (songsByFolder) => {
    const allSongs = [];
    for (const [folderName, songs] of Object.entries(songsByFolder)) {
      allSongs.push(...songs.map((song) => {
        song.folderName = folderName
        return song;
      }))
    }
    return allSongs;
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

  const Header = () => {
    return (
      <div style={{ padding: '10px' }}>
        <Options />
      </div>
    )
  }

  const nextSong = async () => {
    let i = trackIndex;
    i++;
    trackRef.current.pause();
    if (i === songsLoaded.length) {
        i = 0;
    }
    handleChangeTrack(i);
  }

  const previousSong = async () => {
    let i = trackIndex;
    i--;
    trackRef.current.pause();
    if (i < 0) {
        i = songsLoaded.length - 1;
    }
    handleChangeTrack(i);
  }

  const handleChangeTrack = (trackIndex) => {
    setTrackIndex(trackIndex);
    setTrackLoaded(false);
    setSrc('');
  }

  const playPause = () => {
    if (!isPlaying) {
        setIsPlaying(true);
    } else {
        setIsPlaying(false);
    }
  }

  const handlePlayPause = async () => {
    if (trackRef.current) {
      const doPlayPause = () => {
          if (isPlaying) {
              trackRef.current.play();
          } else {
              trackRef.current.pause();
          }
      };
      if (!trackRef.current.src.includes('blob') && songsLoaded.length) {
          loadSong(songsLoaded[trackIndex]).then(doPlayPause);
      } else if (trackLoaded) {
          doPlayPause();
      }
    }
  }

  const handleSetVolume = (value) => {
    const newValue = value / 100;
    trackRef.current.volume = newValue;
    setVolume(value);
  }

  const loadSong = (file) => {
    return new Promise((res, rej) => {
        if (trackRef.current) {
            getAccessToken(async (token) => {
                const trackBlob = await fetchDriveFileBlob(file, token);
                setSrc(URL.createObjectURL(trackBlob));
                trackRef.current.onend = nextSong;
                trackRef.current.volume = volume / 100;
                trackRef.current.load();
                trackRef.current.oncanplay = () => {
                    setTrackLoaded(true);
                    res();
                };
            });
        }
    });
  }

  useEffect(() => {
      handlePlayPause();
  }, [isPlaying, trackIndex, trackRef]);

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.src = '';
    }
  }, [songsLoaded])

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 6 }}>
        <Grid container spacing={4}>
          <Grid item xs={16} style={{...componentDisplayStyle, ...headerFooterStyle}}>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome, {props.user.given_name}!
            </Typography>
          </Grid>
          <Grid item xs={16} style={{...componentDisplayStyle, ...headerFooterStyle}}>
            <Header />
          </Grid>
          {
            songsLoaded.length > 0
            &&
            <Grid item xs={16} style={componentDisplayStyle}>
              <audio src={src} ref={trackRef} />
              <PlayerControls 
                playPause={playPause}
                nextSong={nextSong}
                previousSong={previousSong}
                volume={volume}
                handleSetVolume={handleSetVolume}
                isPlaying={isPlaying}
               />
            </Grid>      
          }
          <Grid item xs={16} style={{...componentDisplayStyle, ...headerFooterStyle}}>
            <Copyright />
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}

export default App;
