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

import { styled } from '@mui/material/styles';

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
import GridItem from './components/griditem.js';
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
  const [src, setSrc] = useState(undefined);
  const [trackLoaded, setTrackLoaded] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(1);

  const trackRef = useRef();

  const handleLoadedSongs = (songs) => {
    setSongsLoaded(Array.isArray(songs) ? songs : formatSongsLoadedForPlayer(songs));
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

  const Greeting = () => {
    return (
      <Typography variant="h4" component="h1" sx={{ color: 'black' }}>
        Welcome, {props.user.given_name}!
      </Typography>
    )
  }

  const Options = () => {
    return (
      <div>
        <ButtonGroup variant="contained" aria-label="outlined button group">
          <Load 
            user={props.user} 
            handleLoadedSongs={handleLoadedSongs}
          />
          <Playlists 
            user={props.user} 
            handleLoadedSongs={handleLoadedSongs}
          />
        </ButtonGroup>
      </div>
    )
  }

  const Copyright = () => {
    return (
      <Typography variant="body2" align="center">
        {'© '}
        <Link color="inherit" href="https://mercywizard.com/">
          SerialBox
        </Link>{' '}
        {new Date().getFullYear()}
      </Typography>
    );
  }

  const Player = () => {
    if (songsLoaded.length > 0) {
      return (
        <div sx={{width: '100%'}}>
          <Grid item xs={4} sx={{width: '100%'}}>
            <PlayerControls 
              playPause={handlePlayPauseClick}
              nextSong={nextSong}
              previousSong={previousSong}
              trackRef={trackRef}
              isPlaying={isPlaying}
             />
          </Grid>     
          <Grid item xs={4}>
             <Playlist playlist={songsLoaded}/>
          </Grid> 
        </div>
      )
    }
  }

  const nextSong = () => {
    let i = trackIndex;
    i++;
    setTrackLoaded(false);
    toggleIsPlaying();
    if (i === songsLoaded.length) {
        i = 0;
    }
    handleChangeTrack(i);
  }

  const previousSong = () => {
    let i = trackIndex;
    i--;
    setTrackLoaded(false);
    toggleIsPlaying();
    if (i < 0) {
        i = songsLoaded.length - 1;
    }
    handleChangeTrack(i);
  }

  const handleChangeTrack = (trackIndex) => {
    loadSong(songsLoaded[trackIndex], () => {
      setTrackIndex(trackIndex)
    });
  }

  const toggleIsPlaying = () => {
    if (!isPlaying) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }

  const handlePlayPauseClick = () => {
    if (!trackRef.current.src.includes('blob') && songsLoaded.length) {
      loadSong(songsLoaded[trackIndex]);
    } else if (trackLoaded) {
      toggleIsPlaying();
    }
  }

  const playPauseAudio = async () => {
    if (trackRef.current && trackRef.current.src.includes('blob')) {
      if (isPlaying) {
        console.log('playing')
        trackRef.current.play();
      } else {
        console.log('pausing')
        trackRef.current.pause();
      }
    }
  }

  const loadSong = (file, callback) => {
    if (trackRef.current) {
      getAccessToken(async (token) => {
        const blob = await fetchDriveFileBlob(file, token);
        const src = URL.createObjectURL(blob);
        setSrc(src);
        if (callback) callback();
      });
    }
  }

  useEffect(() => {
    playPauseAudio();
  }, [isPlaying]);

  useEffect(() => {
    if (trackLoaded) {
      setIsPlaying(true);
    }
  }, [trackLoaded]);

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.src = '';
    }
  }, [songsLoaded])

  useEffect(() => {
    if (src) {
      trackRef.current.volume = 1;
      trackRef.current.load();
      trackRef.current.oncanplay = () => setTrackLoaded(true);
      trackRef.current.onerror = (e) => console.error('Error loading song', e.target.error);
    }
  }, [src])

  return (
    <Container sx={{ width: '100vw', backgroundColor: '#dde7f0' }}>
      <audio src={src} ref={trackRef} onEnded={nextSong}/>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} sx={{ marginTop: '10px' }}>
          <GridItem><Greeting /></GridItem>
        </Grid>
        <Grid item xs={12} md={12}>
          <GridItem sx={{ backgroundColor: 'white' }}x><Options /></GridItem>
        </Grid>
        <Grid item xs={12} md={12} sx={{width: '100%'}}>
          <Player />
        </Grid>
        <Grid item xs={12} md={12} sx={{ marginBottom: '10px' }}>
          <GridItem><Copyright /></GridItem>
        </Grid>
      </Grid>
    </Container>
  )
}

export default App;
