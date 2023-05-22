import {useRef, useState, useEffect} from 'react';

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

const PlayerControls = (props) => {

    const [isHovering, setIsHovering] = useState(false)
    const [localVolume, setLocalVolume] = useState(props.volume);

    const handleMouseEnter = () => {
        setIsHovering(true);
    }

    const handleMouseLeave = () => {
        setIsHovering(false);
    }

    const handleSetVolume = (e) => {
        props.setVolume(e.target.value);
    }

    const handleLocalVolume = (e, newValue) => {
        props.handleSetVolume(newValue);
        setLocalVolume(newValue);
    }

    return (
        <div>
            <ButtonGroup variant="contained" aria-label="outlined button group">
                <Button 
                    className="prev-track" 
                    onClick={props.previousSong} 
                    style={playerButtonStyle(isHovering)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                  <SkipPreviousOutlinedIcon />
                </Button>
                <Button 
                    className="playpause-track" 
                    onClick={props.playPause} 
                    style={playerButtonStyle(isHovering)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
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
                    style={playerButtonStyle(isHovering)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                  <SkipNextOutlinedIcon />
                </Button>
            </ButtonGroup>
            { /* ToDo: implement Controlled Slider correctly for volume change */ }
            <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                <VolumeDown />
                    <Slider 
                      aria-label="Volume" 
                      value={localVolume} 
                      onChange={handleLocalVolume} 
                      style={{color: 'black'}} 
                    />
                <VolumeUp />
            </Stack>  
        </div>
    )
}

export default PlayerControls;