import {useState, useEffect} from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';
import SkipPreviousOutlinedIcon from '@mui/icons-material/SkipPreviousOutlined';
import {playerButtonStyle} from '../styles/styles.js';
import { fetchDriveFileBlob, getAccessToken } from '../api/gapi.js';

// ToDo: this component may be a good candidate for a React.Component class

// Player receives playlist songs as an array, with a folderName on each entry
const Player = (props) => {
    const trackRef = props.trackRef;

    const [isHovering, setIsHovering] = useState(false);
    const [volume, setVolume] = useState(.5);
    const [trackIndex, setTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [track, setTrack] = useState(undefined);
    const [playlist, setPlaylist] = useState([]);
    const [trackRefData, setTrackRefData] = useState(undefined);
    const [src, setSrc] = useState('');

    useEffect(() => {
        if (isPlaying) {
          trackRef.current.play();
        } else {
          trackRef.current.pause();
        }
    }, [isPlaying, trackRef]);

    if (props.songs.length && !playlist.length) {
        setPlaylist(props.songs);
        loadSong(props.songs[trackIndex]);
    } else {
        // Songs already loaded or no songs to load
        console.log('already loaded or no songs loaded')
    }

    const onSongEnd = async () => {
        console.log("Song is over")
        trackIndex++;
        playPause(trackRef);
        if (trackIndex < playlist.length) {
          await loadSong(playlist[trackIndex]);
          trackRef.current.play();
        } else {
          trackIndex = 0;
          await loadSong(playlist[trackIndex]);
        }
        setTrackIndex(index);
    };

    const handlePlayPause = () => {
        if (!isPlaying) {
            setIsPlaying(true);
        } else {
            setIsPlaying(false);
        }
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

    async function loadSong(file) {
        if (trackRef.current) {
            getAccessToken(async (token) => {
                console.log('loading song', file);
                const trackBlob = await fetchDriveFileBlob(file, token);
                setTrackRefData(trackBlob);
                setSrc(URL.createObjectURL(trackBlob));
                trackRef.current.onend = onSongEnd;
                trackRef.current.load();
                console.log('song loaded');
            });
        }
    }

    return (
        <div>
            <audio src={src} ref={trackRef} />
            <ButtonGroup variant="contained" aria-label="outlined button group">
                <Button 
                    className="prev-track" 
                    onClick={() => console.log("PREVIOUS")} 
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
                    onClick={() => console.log("NEXT")} 
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
                <Slider defaultValue={50} aria-label="Default" valueLabelDisplay="auto" />
            </Box>
        </div>
    )
}

export default Player;