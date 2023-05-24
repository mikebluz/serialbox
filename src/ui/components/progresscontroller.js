import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';

import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import Replay5OutlinedIcon from '@mui/icons-material/Replay5Outlined';
import Replay10OutlinedIcon from '@mui/icons-material/Replay10Outlined';
import Replay30OutlinedIcon from '@mui/icons-material/Replay30Outlined';

import Forward5OutlinedIcon from '@mui/icons-material/Forward5Outlined';
import Forward10OutlinedIcon from '@mui/icons-material/Forward10Outlined';
import Forward30OutlinedIcon from '@mui/icons-material/Forward30Outlined';

import {playerButtonStyle, progressButtonStyle, buttonGroupStyle} from '../styles/styles.js';

let updateTimer;

const ProgressController = (props) => {
	console.log("OK")
    const [isHovering, setIsHovering] = useState(false)

    const handleMouseEnter = () => {
        setIsHovering(true);
    }

    const handleMouseLeave = () => {
        setIsHovering(false);
    }

	const [currentPosition, setCurrentPosition] = useState(0);
	const [currentMinutes, setCurrentMinutes] = useState(0);
	const [currentSeconds, setCurrentSeconds] = useState(0);
	const [durationMinutes, setDurationMinutes] = useState(0);
	const [durationSeconds, setDurationSeconds] = useState(0);

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

	function calcPosition() {
		return trackRef.current.currentTime * (100 / trackRef.current.duration);
	}

	const seekUpdate = () => {
		let seekPosition = 0;

		// Check if the current track duration is a legible number
		if (!isNaN(trackRef.current.duration)) {
			seekPosition = calcPosition();
			setCurrentPosition(seekPosition);
			calculateCurrentTime();
		}
	}

	if (props.isPlaying && !updateTimer) {
		// If is playing and no update timer, start updateTimer
		updateTimer = setInterval(seekUpdate, 1000);
		setCurrentPosition(calcPosition());
		calculateCurrentTime();
	} else if (!props.isPlaying && updateTimer) {
		// If no longer playing and there's and update timer, clear it
		clearInterval(updateTimer);
		updateTimer = undefined;
		// For some reason the state variables get reinitialized to default without these sets
		setCurrentPosition(calcPosition());
		calculateCurrentTime();
	}

	function padSingleDigits(n) {
		return n < 10 ? `0${n}` : n;
	}

	function calculateCurrentTime() {
		let currMinutes = Math.floor(trackRef.current.currentTime / 60);
		let currSeconds = Math.floor(trackRef.current.currentTime - currMinutes * 60);
		let durMinutes = Math.floor(trackRef.current.duration / 60);
		let durSeconds = Math.floor(trackRef.current.duration - durMinutes * 60);
		setCurrentMinutes(currMinutes);
		setCurrentSeconds(currSeconds);
		setDurationMinutes(durMinutes);
		setDurationSeconds(durSeconds);
	}

	return (
		<Box sx={{ color: 'black', width: '100%' }}>
			<Stack spacing={2} direction="row" alignItems="center">
				<p>{padSingleDigits(currentMinutes) + ":" + padSingleDigits(currentSeconds)}</p>
				<Slider 
					aria-label="ProgressBar" 
					value={currentPosition ? currentPosition : 0} 
					onChange={handleSeek} 
					sx={{ color: '#2c97e8' }} 
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

export default ProgressController;