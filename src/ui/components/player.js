import {useState} from 'react';
import ArrowRightOutlinedIcon from '@mui/icons-material/ArrowRightOutlined';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';
import SkipPreviousOutlinedIcon from '@mui/icons-material/SkipPreviousOutlined';
import {playerButtonStyle} from '../styles/styles.js';

const Player = (props) => {
    const [isHovering, setIsHovering] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(50);
    const [track, setTrack] = useState(undefined);
    const [audio, setAudio] = useState(new Audio());
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

    if (Object.keys(props.songs).length) {
        console.log(props.songs);
        loadSong(props.playlist[currentTrackIndex]);
    }

    const handleMouseEnter = () => {
        setIsHovering(true);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
    };

    const handleSetVolume = (e) => {
        audio.volume = e.target.value / 100;
        setVolume(e.target.value);
    };

    const playPause = (e) => {
        if (isPlaying) {
            // ToDo: change to pause icon
        } else {
            // ToDo: change to play icon
        }
        setIsPlaying(!isPlaying);
    }

    async function loadSong(file) {
        console.log('file', file);
    }

    return (
        <div>
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
                    onClick={playPause} 
                    style={playerButtonStyle(isHovering)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <ArrowRightOutlinedIcon />
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