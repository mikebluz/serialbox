import {useState, useEffect} from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';
import SkipPreviousOutlinedIcon from '@mui/icons-material/SkipPreviousOutlined';

import {playerButtonStyle} from '../styles/styles.js';
import { fetchDriveFileBlob, getAccessToken } from '../api/gapi.js';

// Player receives playlist songs as an array, with a folderName on each entry
const Player = (props) => {
    const trackRef = props.trackRef;
    const playlist = props.songs;

    const [isHovering, setIsHovering] = useState(false);
    const [volume, setVolume] = useState(.5);
    const [trackIndex, setTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [trackLoaded, setTrackLoaded] = useState(false);
    const [src, setSrc] = useState('');

    const nextSong = async () => {
        let i = trackIndex;
        i++;
        trackRef.current.pause();
        if (trackIndex === playlist.length) {
            trackIndex = 0;
        }
        await loadSong(playlist[trackIndex]);
        trackRef.current.play();
        setTrackIndex(i);
    };

    const previousSong = async () => {
        let i = trackIndex;
        i--;
        console.log("pausing")
        trackRef.current.pause();
        if (trackIndex < 0) {
            trackIndex = playlist.length - 1;
        }
        console.log("loading song at index " + i);
        await loadSong(playlist[trackIndex]);
        console.log("Playing now..........")
        trackRef.current.play();
        setTrackIndex(i);
    };

    const playPause = () => {
        if (!isPlaying) {
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
        }
    }

    const handlePlayPause = async () => {
        if (!trackLoaded) {
            await loadSong(playlist[trackIndex]);
        }
        playPause();
    }

    const handleMouseEnter = () => {
        setIsHovering(true);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
    };

    const handleSetVolume = (e) => {
        trackRef.current.volume = e.target.value / 100;
        setVolume(e.target.value);
    };

    const loadSong = (file) => {
        return new Promise((res, rej) => {
            if (trackRef.current) {
                getAccessToken(async (token) => {
                    console.log('loading song', file);
                    const trackBlob = await fetchDriveFileBlob(file, token);
                    setSrc(URL.createObjectURL(trackBlob));
                    trackRef.current.onend = nextSong;
                    await trackRef.current.load();
                    console.log('song loaded');
                    setTrackLoaded(true);
                    res();
                });
            }
        });
    }

    useEffect(() => {
        if (isPlaying) {
            console.log("Starting to play", trackRef.current)
            trackRef.current.play();
        } else {
            console.log("pausing")
            trackRef.current.pause();
        }
        // if (playlist.length) {
        //     loadSong(playlist[trackIndex]).then(() => {
        //     });
        // }
    }, [isPlaying, trackRef]);

    return (
        <div>
            <audio src={src} ref={trackRef} />
            <ButtonGroup variant="contained" aria-label="outlined button group">
                <Button 
                    className="prev-track" 
                    onClick={previousSong} 
                    style={playerButtonStyle(isHovering)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                  <SkipPreviousOutlinedIcon />
                </Button>
                <Button 
                    className="playpause-track" 
                    onClick={handlePlayPause} 
                    style={playerButtonStyle(isHovering)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
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
                    style={playerButtonStyle(isHovering)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                  <SkipNextOutlinedIcon />
                </Button>
            </ButtonGroup>
            <Box sx={{ width: 200 }}>
                <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                    <VolumeDown />
                    <Slider aria-label="Volume" value={volume} onChange={handleSetVolume} />
                    <VolumeUp />
                </Stack>
                { /* TODO: Implement track progress slider with skip functionality */ }
                <Slider defaultValue={50} aria-label="Default" valueLabelDisplay="auto" />
            </Box>
        </div>
    )
}

export default Player;