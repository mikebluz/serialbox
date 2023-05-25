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
import Load from './components/load.js';
import Shuffle from './components/shuffle.js';

import {
  getAccessToken,
  fetchDriveFileBlob, 
  initGapi, 
  initGapiTokenClient, 
  parseJwt 
} from './api/gapi.js';

import {
  buttonStyle, 
  buttonGroupStyle,
  componentDisplayStyle, 
  gridBlockStyle,
  headerFooterStyle,
  playerButtonStyle, 
  progressButtonStyle,
} from './styles/styles.js';

import {getRandomInt} from './helpers.js';

const CLIENT_ID = `${process.env.REACT_APP_GAPI_CLIENT_ID}.apps.googleusercontent.com`;

const sliderColor = "#ff7c0a";

// ToDo: break out into separate components, being careful not to break any state change flows

const App = (props) => {

  const trackRef = useRef();

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
  const [repeat, setRepeat] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [loopStart, setLoopStart] = useState(-1);
  const [loopEnd, setLoopEnd] = useState(100_000);
  const [loopInterval, setLoopInterval] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [currentMinutes, setCurrentMinutes] = useState(0);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [updateTimer, setUpdateTimer] = useState(0);

  // Display
  // const [marqueeMessage, setMarqueeMessage] = useState('Load songs from Google Drive or choose a playlist');
  const [nowPlayingSongName, setNowPlayingSongName] = useState('Nothing loaded');
  const [nowPlayingArtist, setNowPlayingArtist] = useState('Nothing loaded');

  const [isHovering, setIsHovering] = useState(false)

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

  const NowPlaying = () => {
    return (
      <Box style={{ backgroundColor: 'black', borderRadius: '10px' }}>
        <p 
          style={{ 
            color: 'black', 
            color: '#39ff2b', 
            fontFamily: 'courier',
            padding: '10px',
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
            padding: '10px',
            margin: '0px'
          }}
        >
          { isLoading ? "Loading ..." : `Artist: ${nowPlayingArtist}` }
        </p> 
      </Box>
    );
  }

  const PlayerControls = (props) => {

    const handleMouseEnter = () => {
        setIsHovering(true);
    }

    const handleMouseLeave = () => {
        setIsHovering(false);
    }

    const handleRepeat = () => {
        props.trackRef.current.loop = !repeat;
        setRepeat(!repeat);
        if (!repeat) {
            clearInterval(loopInterval);
        }
    }

    const handleSetLoopStart = () => {
      if (isPlaying) trackRef.current.pause();
      const start = trackRef.current.currentTime;
      setLoopStart(start);
    }

    const handleSetLoopEnd = () => {
      if (props.isPlaying) props.trackRef.current.pause();
      const end = props.trackRef.current.currentTime;
      setLoopEnd(end);
    }

    const handleClearLoopInterval = () => {
      clearInterval(loopInterval);
      setLoopStart(0);
      setLoopEnd(props.trackRef.current.duration);
      setRepeat(false);
    }

    return (
        <Box sx={{ width: '100%' }}>
            <ButtonGroup variant="contained" aria-label="outlined button group" size="large" sx={buttonGroupStyle}>
                <Button 
                    className="prev-track" 
                    onClick={props.previousSong} 
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    sx={{...playerButtonStyle(isHovering), width: '100%'}}
                >
                  <SkipPreviousOutlinedIcon />
                </Button>
                <Button 
                    className="playpause-track" 
                    onClick={props.playPause} 
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    sx={{...playerButtonStyle(isHovering), width: '100%'}}
                >
                    {
                        props.isPlaying
                        ?
                        <PauseOutlinedIcon />
                        :
                        <PlayArrowOutlinedIcon />
                    }
                </Button>
                <Button 
                    className="next-track" 
                    onClick={props.nextSong} 
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    sx={{...playerButtonStyle(isHovering), width: '100%'}}
                >
                  <SkipNextOutlinedIcon />
                </Button>
                <Button 
                    className="repeat-btn" 
                    onClick={handleRepeat} 
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    sx={{...playerButtonStyle(isHovering), width: '100%', backgroundColor: repeat ? 'grey' : 'black'}}
                >
                  <RepeatOutlinedIcon />
                </Button>
            </ButtonGroup>
            {
                repeat
                &&
                <ButtonGroup variant="contained" aria-label="outlined button group" size="small" sx={buttonGroupStyle}>
                    <Button 
                        className="loop-start-btn" 
                        onClick={handleSetLoopStart} 
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        sx={{...playerButtonStyle(isHovering), width: '100%' }}
                    >
                      <p>Start</p>
                    </Button>
                    <Button 
                        className="loop-end-btn" 
                        onClick={handleSetLoopEnd} 
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        sx={{...playerButtonStyle(isHovering), width: '100%' }}
                    >
                      <p>End</p>
                    </Button>
                    <Button 
                        className="loop-end-btn" 
                        onClick={handleClearLoopInterval} 
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        sx={{...playerButtonStyle(isHovering), width: '100%' }}
                    >
                      <p>Clear</p>
                    </Button>
                </ButtonGroup>
            }
            <ProgressController 
                trackRef={props.trackRef} 
                isPlaying={props.isPlaying}
            />
            <VolumeSlider trackRef={props.trackRef}/>
        </Box>
    )
  }

  const VolumeSlider = (props) => {
    const handleChange = (event, newValue) => {
      setVolume(newValue / 100);
    };
    return (
      <Box sx={{ color: 'black' }}>
        <Stack spacing={2} direction="row" alignItems="center">
          <VolumeDown />
          <Slider aria-label="Volume" value={volume*100} onChange={handleChange} sx={{ color: sliderColor }} />
          <VolumeUp />
        </Stack>
      </Box>
    );
  }

  const ProgressController = (props) => {

    const [isHovering, setIsHovering] = useState(false)

    const handleMouseEnter = () => {
      setIsHovering(true);
    }

    const handleMouseLeave = () => {
      setIsHovering(false);
    }

    const trackRef = props.trackRef;

    const handleSeek = (event, newValue) => {
      seek(newValue > 0 ? newValue : 0);
    };

    function seek(newValue) {
      if (trackRef.current.duration) {
        trackRef.current.currentTime = trackRef.current.duration * (newValue / 100);
        setCurrentPosition(newValue);
        calculateCurrentTime();
      }
    }

    function scan(seconds) {
      if (trackRef.current.duration) {
        if (seconds === 0) {
          trackRef.current.currentTime = 0;
        } else {
          trackRef.current.currentTime = (trackRef.current.currentTime + seconds) > 0 ? trackRef.current.currentTime + seconds : 0;
        }
        setCurrentPosition(trackRef.current.currentTime * (100 / trackRef.current.duration));
        calculateCurrentTime();
      }
    }

    function padSingleDigits(n) {
      return n < 10 ? `0${n}` : n;
    }

    return (
      <Box sx={{ color: 'black', width: '100%' }}>
      <Stack spacing={2} direction="row" alignItems="center">
        <p>{padSingleDigits(currentMinutes) + ":" + padSingleDigits(currentSeconds)}</p>
        <Slider 
          aria-label="ProgressBar" 
          value={currentPosition ? currentPosition : 0} 
          onChange={handleSeek} 
          sx={{ color: sliderColor }} 
        />
        <p>{padSingleDigits(durationMinutes) + ":" + padSingleDigits(durationSeconds)}</p>
      </Stack>
      <ButtonGroup 
        variant="contained" 
        aria-label="outlined button group" 
        size="large" 
        sx={{ width: '100%' }}
      >
          <Button 
              className="restart" 
              onClick={() => scan(0)} 
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              sx={{...progressButtonStyle(isHovering)}}
          >
              <ReplayOutlinedIcon />
          </Button>
      </ButtonGroup>
      <Stack spacing={2} direction="row" alignItems="center">
        <ButtonGroup 
          variant="contained" 
          aria-label="outlined button group" 
          size="large"
          sx={{ width: '100%' }}
        >
            <Button 
                className="rewind-5" 
                onClick={() => scan(-5)} 
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
          sx={{...progressButtonStyle(isHovering)}}
            >
                <Replay5OutlinedIcon />
            </Button>
            <Button 
                className="rewind-10" 
                onClick={() => scan(-10)} 
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
          sx={{...progressButtonStyle(isHovering)}}
            >
                <Replay10OutlinedIcon />
            </Button>
            <Button 
                className="rewind-30" 
                onClick={() => scan(-30)} 
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
          sx={{...progressButtonStyle(isHovering)}}
            >
                <Replay30OutlinedIcon />
            </Button>
        </ButtonGroup>
      </Stack>
      <Stack spacing={2} direction="row" alignItems="center">
        <ButtonGroup 
          variant="contained" 
          aria-label="outlined button group" 
          size="large"
          sx={{ width: '100%' }}
        >
          <Button 
              className="rewind-5" 
              onClick={() => scan(5)} 
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              sx={{...progressButtonStyle(isHovering)}}
          >
              <Forward5OutlinedIcon />
          </Button>
          <Button 
              className="rewind-10" 
              onClick={() => scan(10)} 
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              sx={{...progressButtonStyle(isHovering)}}
          >
              <Forward10OutlinedIcon />
          </Button>
          <Button 
              className="rewind-30" 
              onClick={() => scan(30)} 
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              sx={{...progressButtonStyle(isHovering)}}
          >
              <Forward30OutlinedIcon />
          </Button>
        </ButtonGroup>
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

  const resetDisplayValues = () => {
    setLoopStart(-1);
    setLoopEnd(100_000);
    clearInterval(loopInterval);
    setLoopInterval(0);
    setCurrentPosition(0);
    setCurrentMinutes(0);
    setCurrentSeconds(0);
    setDurationMinutes(0);
    setDurationSeconds(0);
  }

  const handleLoadedSongs = (songs, pName) => {
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

  const getMarqueeMessage = () => {
    return songsLoaded.length > 0 ? `${songsLoaded[trackIndex].name.split('.')[0]} - ${songsLoaded[trackIndex].artist}` : 'Load songs from Google Drive or choose a playlist';
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

  const calcPosition = () => {
    return trackRef.current.currentTime * (100 / trackRef.current.duration);
  }

  const progressUpdate = () => {
    // Check if the current track duration is a legible number
    if (!isNaN(trackRef.current.duration)) {
      setCurrentPosition(calcPosition());
      calculateCurrentTime();
    }
  }

  const calculateCurrentTime = () => {
    let currMinutes = Math.floor(trackRef.current.currentTime / 60);
    let currSeconds = Math.floor(trackRef.current.currentTime - currMinutes * 60);
    let durMinutes = Math.floor(trackRef.current.duration / 60);
    let durSeconds = Math.floor(trackRef.current.duration - durMinutes * 60);
    setCurrentMinutes(currMinutes);
    setCurrentSeconds(currSeconds);
    setDurationMinutes(durMinutes);
    setDurationSeconds(durSeconds);
  }

  useEffect(() => {
    if (restarting && !isPlaying) {
      setIsPlaying(true);
      setRestarting(false);
    } else {
      playPauseAudio();
      if (songsLoaded.length > 0) {
        // setMarqueeMessage(getMarqueeMessage());
        setNowPlayingArtist(songsLoaded[trackIndex].name.split('.')[0]);
        setNowPlayingSongName(songsLoaded[trackIndex].artist);
      }
    }
    progressUpdate();
  }, [isPlaying]);

  useEffect(() => {
    if (trackLoaded) setIsPlaying(true);
  }, [trackLoaded]);

  useEffect(() => {
    if (songsLoaded.length > 0) {
      loadSong(songsLoaded[0], () => {
        setTrackIndex(0);
        // setMarqueeMessage(getMarqueeMessage());
        setNowPlayingArtist(songsLoaded[trackIndex].name.split('.')[0]);
        setNowPlayingSongName(songsLoaded[trackIndex].artist);
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
    }
  }, [src])

  useEffect(() => {
      trackRef.current.volume = volume;
  }, [volume])

  useEffect(() => {
    setTimeout(() => progressUpdate(), 1000);
  }, [currentMinutes, currentSeconds, durationMinutes, durationSeconds, currentPosition]);

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

  return (
    <Box 
      sx={{ backgroundColor: '#dde7f0' }}   
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      maxWidth="100vw"
    >
      <audio preload={'false'} src={src} ref={trackRef} onEnded={repeat ? restart : nextSong} onError={(e) => console.error('Audio element error', e.target.error)}/>
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
