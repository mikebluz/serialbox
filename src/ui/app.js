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
import CircularProgress from '@mui/material/CircularProgress';

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

  const [isLoading, setIsLoading] = useState(false);
  const [songsLoaded, setSongsLoaded] = useState([]);
  const [playlistName, setPlaylistName] = useState('');
  // "setIsPlaying" precipitates the playing
  const [isPlaying, setIsPlaying] = useState(false);
  const [src, setSrc] = useState(undefined);
  const [trackLoaded, setTrackLoaded] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(1);
  const [marqueeMessage, setMarqueeMessage] = useState('Load songs from Google Drive or choose a playlist');
  const [repeat, setRepeat] = useState(false);
  const [restarting, setRestarting] = useState(false);

  const trackRef = useRef();

  const handleLoadedSongs = (songs, pName) => {
    setSongsLoaded(Array.isArray(songs) ? songs : formatSongsLoadedForPlayer(songs));
    setTrackLoaded(false);
    if (pName) setPlaylistName(pName);
  }

  async function shuffle() {
    console.log('shuffling')
    setIsPlaying(false);
    let playlist = [...songsLoaded];
    const newPlaylist = [];
    while (newPlaylist.length < songsLoaded.length) {
      let i = getRandomInt(playlist.length - 1);
      const nextTrack = playlist[i];
      newPlaylist.push(playlist[i]);
      playlist = [...playlist.slice(0, i), ...playlist.slice(i + 1, playlist.length)];
    }
    console.log('setting new loaded songs')
    handleLoadedSongs(newPlaylist, playlistName);
    console.log('setting track index');
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
          { isLoading ? "Loading ..." : marqueeMessage }
        </marquee> 
      </Box>
    );
  }

  const Player = () => {
    if (songsLoaded.length > 0) {
      return (
        <Box sx={{width: '100%'}}>
          <PlayerControls 
            playPause={handlePlayPauseClick}
            nextSong={nextSong}
            previousSong={previousSong}
            repeatSong={setRepeat}
            repeat={repeat}
            trackRef={trackRef}
            isPlaying={isPlaying}
           />
          <Playlist 
            playlist={songsLoaded}
            playlistName={playlistName}
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
    if (!isLoading) {
      let i = trackIndex;
      i++;
      toggleIsPlaying();
      if (i === songsLoaded.length) {
          i = 0;
      }
      handleChangeTrack(i);
    }
  }

  const previousSong = () => {
    if (!isLoading) {
      let i = trackIndex;
      i--;
      toggleIsPlaying();
      if (i < 0) {
          i = songsLoaded.length - 1;
      }
      handleChangeTrack(i);
    }
  }

  const restart = () => {
    trackRef.current.currentTime = 0;
    console.log("restart, setting isPlaying to false")
    setIsPlaying(false);
    setRestarting(true);
  }

  const handleChangeTrack = (trackIndex) => {
    setTrackLoaded(false);
    trackRef.current.pause();
    loadSong(songsLoaded[trackIndex], () => {
      setTrackIndex(trackIndex)
    });
  }

  const toggleIsPlaying = () => {
    if (!isPlaying) {
      console.log("toggleIsPlaying, setting isPlaying to true")
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
    if (!isLoading) {
      if (trackRef.current && trackRef.current.src.includes('blob')) {
        if (isPlaying) {
          console.log("playing")
          trackRef.current.play();
        } else {
          console.log("pausing")
          trackRef.current.pause();
        }
      } else {
        console.log("oops", trackRef.current)
      }
    }
  }

  const loadSong = (file, callback) => {
    console.log('loadSong called', file, trackRef.current)
    setIsLoading(true);
    if (trackRef.current) {
      getAccessToken((token) => {
        console.log("fetching song")
        const blob = fetchDriveFileBlob(file, token)
          .then((blob) => {
            console.log("song fetched");
            const src = URL.createObjectURL(blob);
            console.log("setting src", src);
            setSrc(src);
            if (callback) callback();
          });
      });
    }
  }

  useEffect(() => {
    console.log("isPlaying effect, setting isPlaying to true", restarting, isPlaying)
    if (restarting && !isPlaying) {
      console.log("isPlaying effect, done restarting, setting isPlaying to true")
      setIsPlaying(true);
      setRestarting(false);
    } else {
      playPauseAudio();
    }
    setMarqueeMessage(getMarqueeMessage());
  }, [isPlaying]);

  useEffect(() => {
    console.log('trackLoaded effect', trackRef.current, trackLoaded)
    if (trackLoaded) {
      console.log("trackLoaded effect, track is loaded, starting isPlaying to true")
      setIsPlaying(true);
    }
  }, [trackLoaded]);

  useEffect(() => {
    console.log('songsLoaded effect', trackRef.current)
    if (songsLoaded.length > 0) {
      loadSong(songsLoaded[0], () => {
        console.log("setting track index")
        setTrackIndex(0);
        console.log("Setting marquee")
        setMarqueeMessage(getMarqueeMessage());
      });
    }
  }, [songsLoaded])

  useEffect(() => {
    if (trackRef.current.src.includes('blob')) {
      console.log("src effect, song is loaded, src has been set, loading audio file", trackRef.current.src, src)
      trackRef.current.volume = 1;
      trackRef.current.load();
      trackRef.current.oncanplay = () => {
        console.log("track is loaded and can play");
        setIsLoading(false);
        setTrackLoaded(true);
      };
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
      <audio preload={false} src={src} ref={trackRef} onEnded={repeat ? restart : nextSong} onError={(e) => console.error('Audio element error', e.target.error)}/>
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
        <Grid item xs={12} md={12} sx={gridBlockStyle}>
          <Player />
        </Grid>
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
