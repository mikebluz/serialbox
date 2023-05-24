import {useRef, useState, useEffect} from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import RepeatOutlinedIcon from '@mui/icons-material/RepeatOutlined';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';
import SkipPreviousOutlinedIcon from '@mui/icons-material/SkipPreviousOutlined';

import GridItem from './griditem.js';
import VolumeSlider from './volumeslider.js';
import ProgressController from './progresscontroller.js';

import {playerButtonStyle, buttonGroupStyle} from '../styles/styles.js';

const PlayerControls = (props) => {

    const [isHovering, setIsHovering] = useState(false)
    const [repeat, setRepeat] = useState(false);

    const handleMouseEnter = () => {
        setIsHovering(true);
    }

    const handleMouseLeave = () => {
        setIsHovering(false);
    }

    const handleRepeat = () => {
        props.trackRef.current.loop = !repeat;
        setRepeat(!repeat);
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
            <ProgressController trackRef={props.trackRef} isPlaying={props.isPlaying}/>
            <VolumeSlider trackRef={props.trackRef}/>
        </Box>
    )
}

export default PlayerControls;