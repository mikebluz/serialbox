import {useRef, useState, useEffect} from 'react';

import Grid from '@mui/material/Grid';
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

import GridItem from './griditem.js';
import VolumeSlider from './volumeslider.js';
import ProgressSlider from './progressslider.js';

import {playerButtonStyle} from '../styles/styles.js';

const PlayerControls = (props) => {

    const [isHovering, setIsHovering] = useState(false)

    const handleMouseEnter = () => {
        setIsHovering(true);
    }

    const handleMouseLeave = () => {
        setIsHovering(false);
    }

    return (
        <div>
            <ProgressSlider trackRef={props.trackRef} isPlaying={props.isPlaying}/>
            <ButtonGroup variant="contained" aria-label="outlined button group" size="large" sx={{width: '90vw'}}>
                <Button 
                    className="prev-track" 
                    onClick={props.previousSong} 
                    style={playerButtonStyle(isHovering)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    sx={{width: '100%'}}
                >
                  <SkipPreviousOutlinedIcon />
                </Button>
                <Button 
                    className="playpause-track" 
                    onClick={props.playPause} 
                    style={playerButtonStyle(isHovering)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    sx={{width: '100%'}}
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
                    sx={{width: '100%'}}
                >
                  <SkipNextOutlinedIcon />
                </Button>
            </ButtonGroup>
            <VolumeSlider trackRef={props.trackRef}/>
        </div>
    )
}

export default PlayerControls;