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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
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
import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';

import GridItem from './components/griditem.js';
import Inbox from './components/inbox.js';
import Playlists from './components/playlists.js';
import ProgressController from './components/progresscontroller.js';
import Load from './components/load.js';
import AudioRecorder from './components/record.js';
import Tape from './components/tape.js';

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
  neonGreen,
  playerButtonStyle, 
  progressButtonStyle,
  sliderColor,
  songStyle
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
  const [playlistChanged, setPlaylistChanged] = useState(false);
  const [playlistEdited, setPlaylistEdited] = useState(false);

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

  const [error, setError] = useState('');

  const tape = [
    // playback
    {
      src,
      ref: trackRef
    },
  ];

  // Display
  const [nowPlayingSongName, setNowPlayingSongName] = useState('Nothing loaded');
  const [nowPlayingArtist, setNowPlayingArtist] = useState('Nothing loaded');

  const Greeting = () => {

    const [showInbox, setShowInbox] = useState(false);
    const [threads, setThreads] = useState([{name: 'Thread with person X'}, {name: 'Thread with person X'}]);

    const handleOnClick = () => {
      setShowInbox(!showInbox)
    }

    useEffect(() => {
      if (showInbox) {
        // setThreads([]);
      }
    }, [showInbox]);

    return (
      <Grid item xs={12} md={12} sx={gridBlockStyle}>
        <GridItem>
          <Typography variant="h4" component="h1" sx={{ color: 'black' }} onClick={handleOnClick}>
            Welcome, {props.user.given_name}!
          </Typography>
          {
            showInbox
            &&
            <Inbox threads={threads}/>
          }
        </GridItem>
      </Grid>
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
          { /* TODO: allow user to select size (number of tracks) */ }
          <AudioRecorder user={props.user} recordRef={recordRef} size={4}/>
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
          <Playlist savePlaylist={savePlaylist} />
        </Box>
      )
    }
  }

  const savePlaylist = (songEditsArray) => {
    setPlaylistEdited(true);
    const edited = [...songsLoaded]
    songEditsArray.forEach((edit, i) => {
      if (edit !== undefined) {
        edited[i].name = edit.name;
      }
    });
    setSongsLoaded(edited);
    setPlaylistEdited(true);
  }

  const Playlist = () => {
    const [songEdits, setSongEdits] = useState([]);
    const [trackIndexBeingEdited, setTrackIndexBeingEdited] = useState(-1);

    const handleSongClick = (i) => {
      if (isPlaying) toggleIsPlaying();
      handleChangeTrack(i)
    }

    const handleTempSongEdit = (songName, i) => {
      const copy = [...songEdits];
      if (!copy[i]) {
        copy[i] = {};
      }
      copy[i].name = songName;
      setSongEdits(copy);
    }

    useEffect(() => {
      // setPlaylistChanged(true);
    }, [songEdits])
    
    return (
      <Box>
        <Box sx={{ width: '100%', border: '3px solid black', padding: '12px', borderRadius: '12px', backgroundColor: 'black' }}>
        <p 
          style={{ 
            color: 'black', 
            color: '#39ff2b', 
            fontFamily: 'courier',
            padding: '0px 0px 10px 0px',
            margin: '0px',
            fontSize: '14pt',
            textAlign: 'center'
          }}
        >
          {playlistName}
        </p>
        <ButtonGroup variant="contained" aria-label="outlined button group" size="small" sx={buttonGroupStyle}>
          <Button         
            style={{...buttonStyle, width: '100%', backgroundColor: 'yellow', color: 'black'}}
            onClick={shuffle}
          >
            Shuffle
          </Button>
        </ButtonGroup>
        </Box>
        {
          songsLoaded.map((song, i) => {
            return (
              <Grid 
                container
                key={(song.gDriveId !== undefined ? song.gDriveId : song.id) + '-item'} 
                sx={{...songStyle, padding: '5px', marginLeft: '0'}} 
              >
                <Grid item xs={2} md={2} sx={{ 
                      ...gridBlockStyle,
                      margin: '0 10px 0 0', 
                      alignContent: 'center', 
                      justifyContent: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                  }}>
                  <Button 
                    sx={{ 
                      buttonStyle, 
                      backgroundColor: neonGreen, 
                      color: 'black', 
                      border: '1px solid black',
                      height: '40px',
                      margin: 'auto'
                    }}
                    onClick={() => {
                      if (trackIndexBeingEdited === i) {
                        setTrackIndexBeingEdited(-1)
                        savePlaylist(songEdits);
                      } else {
                        setTrackIndexBeingEdited(i)
                      }
                    }}
                  >
                  {
                    trackIndexBeingEdited === i
                    ?
                    <DoneOutlinedIcon />
                    :
                    <EditOutlinedIcon />
                  }
                  </Button>
                </Grid>
                <Grid item xs={6.5} md={6.5} sx={{
                      ...gridBlockStyle, 
                      fontSize: '10pt',                           
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      marginTop: '0'
                }} onClick={() => {
                  if (trackIndexBeingEdited !== i) {
                    handleSongClick(i)
                  };
                }}>
                  {
                    trackIndexBeingEdited === i
                    ?
                    <TextField 
                      id="edit-song-name" 
                      label="Song name" 
                      variant="outlined" 
                      value={(songEdits[i] && songEdits[i].name !== undefined) ? songEdits[i].name : song.name.split('.')[0]}
                      onChange={(e) => handleTempSongEdit(e.target.value, i)}
                      sx={{width: '100%', marginBottom: '0px'}}
                    />
                    :
                    ((songEdits[i] && songEdits[i].name !== undefined) ? songEdits[i].name : song.name.split('.')[0])
                  }
                </Grid>
                <Grid item xs={2} md={2} sx={{ 
                      ...gridBlockStyle, 
                      marginRight: '0px',                           
                      alignContent: 'center', 
                      justifyContent: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      marginTop: '0'
                  }}>
                  <ArrowDropUpOutlinedIcon onClick={() => {
                    // const copy = [...songEdits];
                    // copy[i].order = i === 0 ? songsLoaded.length : i - 1;
                    // setSongEdits(copy);
                    changeSongOrder(-i)
                  }}/>
                  <ArrowDropDownOutlinedIcon onClick={() => {
                    // const copy = [...songEdits];
                    // copy[i].order = i < songsLoaded.length - 1 ? i  + 1 : 0;
                    // setSongEdits(copy);
                    changeSongOrder(i)
                  }}/>
                </Grid>
              </Grid>
            )
          })
        }
      </Box>
    )
  };

  const changeSongOrder = (i) => {
    const abs = Math.abs(i);
    const p = [...songsLoaded];
    // negative means move backwards, positive means move forward
    let newIndex;
    if (i < 0) {
      // moving up playlist
      if (abs === 0) {
        newIndex = p.length - 1;
      } else {
        newIndex = abs - 1;
      }
    } else {
      // moving down playlist
      if (i === p.length - 1) {
        newIndex = 0;
      } else {
        newIndex = i + 1;
      }
    }
    const replaceWith = p[Math.abs(i)];
    const toReplace = p[newIndex];
    p[abs] = toReplace;
    p[newIndex] = replaceWith;
    if (trackIndex === abs) {
      setTrackIndex(newIndex);
    }
    setSongsLoaded(p);
    setPlaylistEdited(true);
  }

  const handleLoadedSongs = (songs, pName) => {
    setIsPlaying(false);
    setSongsLoaded(songs);
    setTrackLoaded(false);
    if (pName) setPlaylistName(pName);
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
            setVolume(1);
          });
      });
    }
  }

  const shuffle = () => {
    setIsPlaying(false);
    let playlist = [...songsLoaded];
    const newPlaylist = [];
    while (newPlaylist.length < songsLoaded.length) {
      const i = getRandomInt(playlist.length);
      newPlaylist.push(playlist[i]);
      // remove element we just pushed into newPlaylist
      playlist = [...playlist.slice(0, i), ...playlist.slice(i + 1, playlist.length)];
    }
    handleLoadedSongs(newPlaylist, playlistName);
    // setPlaylistChanged(true);
  }

  useEffect(() => {
    if (playlistEdited) {
      axios.put(`${process.env.REACT_APP_SERVER_HOST}/playlists`, {
        name: playlistName,
        email: props.user.email,
        songs: JSON.stringify(songsLoaded),
      }).then((res) => {
        setPlaylistEdited(false);
        setSongsLoaded(res.data);
      });
    }
  }, [playlistEdited])

  useEffect(() => {
    if (restarting && !isPlaying) {
      setIsPlaying(true);
      setRestarting(false);
    } else {
      playPauseAudio();
      if (songsLoaded.length > 0) {
        let i = trackIndex;
        if (trackIndex > songsLoaded.length - 1) {
          i = 0;
        };
        setTrackIndex(i);
        setNowPlayingSongName(songsLoaded[i].name.split('.')[0]);
        setNowPlayingArtist(songsLoaded[i].artist);
      }
    }
  }, [isPlaying]);

  /**
   * This effect plays the audio immediately after the track is loaded
   * Autoplay IS NOT ALLOWED on mobile
   * */
  useEffect(() => {
    // if (trackLoaded) setIsPlaying(true);
  }, [trackLoaded]);

  useEffect(() => {
    if (songsLoaded.length > 0 && !trackLoaded) {
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

  return (
    <Box 
      sx={{ backgroundColor: '#dde7f0' }}   
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      maxWidth="100vw"
    >
      <Tape sources={tape} />
      <Grid container>
        <Greeting />
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
