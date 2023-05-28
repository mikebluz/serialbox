import axios from 'axios';
import { useEffect, useState, useRef } from 'react';

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

import CircularProgress from '@mui/material/CircularProgress';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import Replay5OutlinedIcon from '@mui/icons-material/Replay5Outlined';
import Replay10OutlinedIcon from '@mui/icons-material/Replay10Outlined';
import Replay30OutlinedIcon from '@mui/icons-material/Replay30Outlined';
import Forward5OutlinedIcon from '@mui/icons-material/Forward5Outlined';
import Forward10OutlinedIcon from '@mui/icons-material/Forward10Outlined';
import Forward30OutlinedIcon from '@mui/icons-material/Forward30Outlined';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import RepeatOutlinedIcon from '@mui/icons-material/RepeatOutlined';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';
import SkipPreviousOutlinedIcon from '@mui/icons-material/SkipPreviousOutlined';

import GridItem from './components/griditem.js';
import Playlist from './components/playlist.js';
import Playlists from './components/playlists.js';
import ProgressController from './components/progresscontroller.js';
import Load from './components/load.js';
import AudioRecorder from './components/record.js';
import TapeMachine from './components/tapemachine.js';

import {
  getAccessToken,
  fetchDriveFileBlob, 
  initGapi, 
  initGapiTokenClient, 
  parseJwt,
  validExtensions
} from './api/gapi.js';

import {
  buttonStyle, 
  buttonGroupStyle,
  componentDisplayStyle, 
  gridBlockStyle,
  headerFooterStyle,
  playerButtonStyle, 
  progressButtonStyle,
  sliderColor
} from './styles/styles.js';

import {getRandomInt} from './helpers.js';

const CLIENT_ID = `${process.env.REACT_APP_GAPI_CLIENT_ID}.apps.googleusercontent.com`;

// ToDo: break out into separate components, being careful not to break any state change flows

const App = (props) => {

  const trackRef = useRef();
  const recordRef = useRef();

  // Loading
  const [isLoading, setIsLoading] = useState(false);
  const [songsLoaded, setSongsLoaded] = useState([]);

  // Playlist/Song data
  const [playlistName, setPlaylistName] = useState('');

  // Player and <audio> component state
  const [isPlaying, setIsPlaying] = useState(false);
  const [src, setSrc] = useState(undefined);
  const [trackLoaded, setTrackLoaded] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(1);
  const [restarting, setRestarting] = useState(false);
  const [loopStart, setLoopStart] = useState(-1);
  const [loopEnd, setLoopEnd] = useState(100_000);
  const [loopInterval, setLoopInterval] = useState(0);
  const [updateTimer, setUpdateTimer] = useState(0);
  const [isRepeating, setIsRepeating] = useState(false);
  const [recorder, setRecorder] = useState(undefined);

  // Display
  const [nowPlayingSongName, setNowPlayingSongName] = useState('Nothing loaded');
  const [nowPlayingArtist, setNowPlayingArtist] = useState('Nothing loaded');

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
          <AudioRecorder user={props.user} recordRef={recordRef}/>
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

  const NowPlaying = () => {
    return (
      <Box style={{ backgroundColor: 'black', borderRadius: '10px' }}>
        <p 
          style={{ 
            color: 'black', 
            color: '#39ff2b', 
            fontFamily: 'courier',
            padding: '10px 10px 5px 15px',
            margin: '0px'
          }}
        >
          { isLoading ? "Loading ..." : `Song: ${nowPlayingSongName}` }
        </p> 
        <p 
          style={{ 
            color: 'black', 
            color: '#39ff2b', 
            fontFamily: 'courier',
            padding: '5px 10px 10px 15px',
            margin: '0px'
          }}
        >
          { isLoading ? "Loading ..." : `Artist: ${nowPlayingArtist}` }
        </p> 
      </Box>
    );
  }

  const PlayerControls = () => {

    const toggleIsRepeating = () => {
      setIsRepeating(!isRepeating);
    }

    const handleSetLoopStart = () => {
      const start = trackRef.current.currentTime;
      setLoopStart(start);
    }

    const handleSetLoopEnd = () => {
      const end = trackRef.current.currentTime;
      setLoopEnd(end);
    }

    const handleClearLoopInterval = () => {
      clearInterval(loopInterval);
      setLoopStart(-1);
      setLoopEnd(100_000);
      setIsRepeating(false);
    }

    useEffect(() => {
      trackRef.current.loop = isRepeating;
      if (!isRepeating) {
        handleClearLoopInterval();
        trackRef.current.onended = nextSong;
      } else {
        trackRef.current.onended = restart;
      }
    }, [isRepeating])

    return (
      <Box sx={{ width: '100%' }}>
        <ButtonGroup variant="contained" aria-label="outlined button group" size="large" sx={buttonGroupStyle}>
            <Button
              className="prev-track" 
              onClick={previousSong} 
              sx={{...playerButtonStyle, width: '100%'}}
            >
              <SkipPreviousOutlinedIcon />
            </Button>
            <Button 
              className="playpause-track" 
              onClick={handlePlayPauseClick} 
              sx={{...playerButtonStyle, width: '100%'}}
            >
                {
                    isPlaying
                    ?
                    <PauseOutlinedIcon />
                    :
                    <PlayArrowOutlinedIcon />
                }
            </Button>
            <Button 
              className="next-track" 
              onClick={nextSong} 
              sx={{...playerButtonStyle, width: '100%'}}
            >
              <SkipNextOutlinedIcon />
            </Button>
            <Button 
              className="repeat-btn" 
              onClick={toggleIsRepeating} 
              sx={{...playerButtonStyle, width: '100%', backgroundColor: isRepeating ? 'grey' : 'black'}}
            >
              <RepeatOutlinedIcon />
            </Button>
        </ButtonGroup>
        {
          isRepeating
          &&
          <ButtonGroup variant="contained" aria-label="outlined button group" size="small" sx={buttonGroupStyle}>
            <Button 
              className="loop-start-btn" 
              onClick={handleSetLoopStart} 
              sx={{...playerButtonStyle, width: '100%', backgroundColor: loopStart > 0 ? 'grey' : 'black' }}
            >
              <p>Start</p>
            </Button>
            <Button 
              className="loop-end-btn" 
              onClick={handleSetLoopEnd} 
              sx={{...playerButtonStyle, width: '100%', backgroundColor: loopEnd <= trackRef.current.duration ? 'grey' : 'black' }}
            >
              <p>End</p>
            </Button>
          </ButtonGroup>
        }
        <ProgressController trackRef={trackRef} />
        <VolumeSlider />
      </Box>
    )
  }

  const VolumeSlider = () => {
    const handleChange = (event, newValue) => {
      setVolume(newValue / 100);
    };
    return (
      <Box sx={{ color: 'black' }}>
        <Stack spacing={2} direction="row" alignItems="center">
          <VolumeDown onClick={(e) => handleChange(e, 0)}/>
          <Slider aria-label="Volume" value={volume*100} onChange={handleChange} sx={{ color: sliderColor }} />
          <VolumeUp onClick={(e) => handleChange(e, 100)}/>
        </Stack>
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

  const handleLoadedSongs = (songs, pName) => {
    setIsPlaying(false);
    setSongsLoaded(Array.isArray(songs) ? songs : formatSongsLoadedForPlayer(songs));
    setTrackLoaded(false);
    if (pName) setPlaylistName(pName);
  }

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
          trackRef.current.play();
        } else {
          trackRef.current.pause();
        }
      }
    }
  }

  const loadSong = (file, callback) => {
    setIsLoading(true);
    if (trackRef.current) {
      getAccessToken((token) => {
        const blob = fetchDriveFileBlob(file, token)
          .then((blob) => {
            const src = URL.createObjectURL(blob);
            setSrc(src);
            if (callback) callback();
          });
      });
    }
  }

  const shuffle = () => {
    setIsPlaying(false);
    let playlist = [...songsLoaded];
    const newPlaylist = [];
    while (newPlaylist.length < songsLoaded.length) {
      let i = getRandomInt(playlist.length - 1);
      const nextTrack = playlist[i];
      newPlaylist.push(playlist[i]);
      playlist = [...playlist.slice(0, i), ...playlist.slice(i + 1, playlist.length)];
    }
    handleLoadedSongs(newPlaylist, playlistName);
  }

  useEffect(() => {
    if (restarting && !isPlaying) {
      setIsPlaying(true);
      setRestarting(false);
    } else {
      playPauseAudio();
      if (songsLoaded.length > 0) {
        setNowPlayingSongName(songsLoaded[trackIndex].name.split('.')[0]);
        setNowPlayingArtist(songsLoaded[trackIndex].artist);
      }
    }
  }, [isPlaying]);

  /**
   * This effect plays the audio immediately after the track is loaded
   * Autoplay IS NOT ALLOWED on mobile
   * */
  useEffect(() => {
    if (trackLoaded) setIsPlaying(true);
  }, [trackLoaded]);

  useEffect(() => {
    if (songsLoaded.length > 0) {
      loadSong(songsLoaded[0], () => {
        setTrackIndex(0);
        setNowPlayingSongName(songsLoaded[0].name.split('.')[0]);
        setNowPlayingArtist(songsLoaded[0].artist);
      });
    }
  }, [songsLoaded])

  useEffect(() => {
    if (trackRef.current.src.includes('blob')) {
      trackRef.current.volume = 1;
      trackRef.current.load();
      trackRef.current.oncanplay = () => {
        setIsLoading(false);
        setTrackLoaded(true);
      };
      // Below is a dirty hack to get duration to display correctly on the first play for some very short files
      // First play the bar jumps forward then jumps back, but once they've been played once it displays correctly
      // Without this, the progress bar does not move and the current time and duration values are "Infi:NaN"
      trackRef.current.addEventListener('loadedmetadata', () => {
        if (trackRef.current.duration === Infinity) {
          trackRef.current.currentTime = 1e101
          trackRef.current.addEventListener('timeupdate', getDuration)
        }
      })
      function getDuration() {
        trackRef.current.currentTime = 0
        trackRef.current.removeEventListener('timeupdate', getDuration)
      }
    }
  }, [src])

  useEffect(() => {
      trackRef.current.volume = volume;
  }, [volume])

  useEffect(() => {
    if (loopStart >= 0 && loopEnd <= trackRef.current.duration) {
        trackRef.current.currentTime = loopStart;
        trackRef.current.play();
        let interval = setInterval(() => {
            if (trackRef.current.currentTime > loopEnd) {
                trackRef.current.currentTime = loopStart;
            }
        }, 100)
        setLoopInterval(interval);
    }
  }, [loopStart, loopEnd])

  const sources = [
    // playback
    {
      src,
      ref: trackRef
    },
    // record
    {
      ref: recordRef
    }
  ]

  return (
    <Box 
      sx={{ backgroundColor: '#dde7f0' }}   
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      maxWidth="100vw"
    >
      <TapeMachine sources={sources} />
      <Grid container>
        <Grid item xs={12} md={12} sx={gridBlockStyle}>
          <GridItem>
            <Greeting />
          </GridItem>
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
            <NowPlaying />
          </Grid>
        }
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
