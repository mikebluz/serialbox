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
import {getRandomInt} from './helpers.js';

// components
import GridItem from './components/griditem.js';
import Playlist from './components/playlist.js';
import Playlists from './components/playlists.js';
import PlayerControls from './components/playercontrols.js';
import Load from './components/load.js';
import Shuffle from './components/shuffle.js';

const CLIENT_ID = `${process.env.REACT_APP_GAPI_CLIENT_ID}.apps.googleusercontent.com`;

const App = (props) => {

  const [songsLoaded, setSongsLoaded] = useState([]);
  const [playlistName, setPlaylistName] = useState('');
  // "setIsPlaying" precipitates the playing
  const [isPlaying, setIsPlaying] = useState(false);
  const [src, setSrc] = useState(undefined);
  const [trackLoaded, setTrackLoaded] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(1);
  const [marqueeMessage, setMarqueeMessage] = useState('Load songs from Google Drive or choose a playlist');

  const trackRef = useRef();

  const handleLoadedSongs = (songs, pName) => {
    console.log('handleLoadedSongs', songs, pName);
    setSongsLoaded(Array.isArray(songs) ? songs : formatSongsLoadedForPlayer(songs));
    if (pName) setPlaylistName(pName);
  }

  async function shuffle() {
    // populateMarquee("Loading ...");
    // pauseTrack();
    let playlist = [...songsLoaded];
    const newPlaylist = [];
    while (newPlaylist.length < songsLoaded.length) {
      let i = getRandomInt(playlist.length - 1);
      const nextTrack = playlist[i];
      newPlaylist.push(playlist[i]);
      playlist = [...playlist.slice(0, i), ...playlist.slice(i + 1, playlist.length)];
    }
    setSongsLoaded(newPlaylist);
    setTrackIndex(0);
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
      <Box>
        <ButtonGroup variant="contained" aria-label="outlined button group">
          <Load 
            user={props.user} 
            handleLoadedSongs={handleLoadedSongs}
            playlistName={playlistName}
            setPlaylistName={setPlaylistName}
          />
          <Playlists 
            user={props.user} 
            handleLoadedSongs={handleLoadedSongs}
            playlistName={playlistName}
            setPlaylistName={setPlaylistName}
          />
          <Button         
            style={buttonStyle(false)}
            onClick={() => console.log('find')}
          >
            Find
          </Button>
        </ButtonGroup>
      </Box>
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

  function getMarqueeMessage() {
    return songsLoaded.length > 0 ? `${songsLoaded[trackIndex].name.split('.')[0]} - ${songsLoaded[trackIndex].artist}` : 'Load songs from Google Drive or choose a playlist';
  }

  const NowPlaying = () => {
    return (
      <Box style={{ backgroundColor: 'black', borderRadius: '10px' }}>
        <marquee 
          behavior='scroll' 
          direction='left'
          scrollamount='10' 
          style={{ 
            color: 'black', 
            fontSize: '2em', 
            color: '#39ff2b', 
            fontFamily: 'courier' 
          }}
        >
          {marqueeMessage}
        </marquee>
      </Box>
    );
  }

  const Player = () => {
    console.log("Playlist playlistName", playlistName)
    if (songsLoaded.length > 0) {
      return (
        <Box sx={{width: '100%'}}>
          <PlayerControls 
            playPause={handlePlayPauseClick}
            nextSong={nextSong}
            previousSong={previousSong}
            trackRef={trackRef}
            isPlaying={isPlaying}
           />
          <Playlist 
            playlist={songsLoaded}
            playlistName={playlistName}
            setTrackLoaded={setTrackLoaded}
            toggleIsPlaying={toggleIsPlaying}
            handleChangeTrack={handleChangeTrack}
            isPlaying={isPlaying}
            shuffle={shuffle}
          />
        </Box>
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
        trackRef.current.play();
      } else {
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
    setMarqueeMessage(getMarqueeMessage());
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
    setMarqueeMessage(getMarqueeMessage());
  }, [songsLoaded])

  useEffect(() => {
    if (src) {
      trackRef.current.volume = 1;
      trackRef.current.load();
      trackRef.current.oncanplay = () => setTrackLoaded(true);
      trackRef.current.onerror = (e) => console.error('Error loading song', e.target.error);
    }
  }, [src])

  const gridBlockStyle = {
    width: '100%',
    margin: '10px 10px 0px 10px'
  };

  return (
    <Box 
      sx={{ backgroundColor: '#dde7f0' }}   
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      maxWidth="100vw"
    >
      <audio src={src} ref={trackRef} onEnded={nextSong}/>
      <Grid container>
        <Grid item xs={12} md={12} sx={gridBlockStyle}>
          <GridItem>
            <Greeting />
          </GridItem>
        </Grid>
        <Grid item xs={12} md={12} sx={gridBlockStyle}>
          <NowPlaying /> 
        </Grid>
        <Grid item xs={12} md={12} sx={gridBlockStyle}>
          <GridItem sx={{ backgroundColor: 'white' }}x>
            <Options />
          </GridItem>
        </Grid>
        {
          songsLoaded.length > 0
          &&
          <Grid item xs={12} md={12} sx={gridBlockStyle}>
            <Player />
          </Grid>
        }
        <Grid item xs={12} md={12} sx={gridBlockStyle}>
          <GridItem>
            <Copyright />
          </GridItem>
        </Grid>
      </Grid>
    </Box>
  )
}

export default App;
