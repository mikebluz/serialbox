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
    const [loopStart, setLoopStart] = useState(0);
    const [loopEnd, setLoopEnd] = useState(props.trackRef.current.duration);
    const [loopInterval, setLoopInterval] = useState(0);

    console.log("loopStart loopEnd START", loopStart, loopEnd)

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
        if (props.isPlaying) props.trackRef.current.pause();
        const start = props.trackRef.current.currentTime;
        // console.log('start', start)
        setLoopStart(Math.floor(start));
    }

    const handleSetLoopEnd = () => {
        if (props.isPlaying) props.trackRef.current.pause();
        const end = props.trackRef.current.currentTime;
        // console.log('end', Math.floor(end))
        setLoopEnd(Math.floor(end));
    }

    const handleClearLoopInterval = () => {
        clearInterval(loopInterval);
        setLoopStart(0);
        setLoopEnd(trackRef.current.duration);
    }

    useEffect(() => {
        console.log('loopStart and loopEnd effect', loopStart, loopEnd);
        if (loopStart > 0 || loopEnd < props.trackRef.current.duration) {
            console.log('rewinding to loopStart', loopStart)
            props.trackRef.current.currentTime = loopStart;
            props.trackRef.current.play();
            let interval = setInterval(() => {
                if (props.trackRef.current.currentTime > loopEnd) {
                    console.log("Current time is past loopEnd", props.trackRef.current.currentTime, loopEnd, loopStart)
                    props.trackRef.current.currentTime = loopStart;
                }
            }, 100)
            setLoopInterval(interval);
        }
    }, [loopStart, loopEnd])

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
            <ButtonGroup variant="contained" aria-label="outlined button group" size="small" sx={buttonGroupStyle}>
                <Button 
                    className="loop-start-btn" 
                    onClick={handleSetLoopStart} 
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    sx={{...playerButtonStyle(isHovering), width: '100%', backgroundColor: repeat ? 'grey' : 'black'}}
                >
                  <p>Start</p>
                </Button>
                <Button 
                    className="loop-end-btn" 
                    onClick={handleSetLoopEnd} 
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    sx={{...playerButtonStyle(isHovering), width: '100%', backgroundColor: repeat ? 'grey' : 'black'}}
                >
                  <p>End</p>
                </Button>
                <Button 
                    className="loop-end-btn" 
                    onClick={handleClearLoopInterval} 
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    sx={{...playerButtonStyle(isHovering), width: '100%', backgroundColor: repeat ? 'grey' : 'black'}}
                >
                  <p>Clear</p>
                </Button>
            </ButtonGroup>
            <ProgressController 
                trackRef={props.trackRef} 
                isPlaying={props.isPlaying}
            />
            <VolumeSlider trackRef={props.trackRef}/>
        </Box>
    )
}

export default PlayerControls;