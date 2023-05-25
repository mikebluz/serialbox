import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Link from '@mui/material/Link';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';

import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import Replay5OutlinedIcon from '@mui/icons-material/Replay5Outlined';
import Replay10OutlinedIcon from '@mui/icons-material/Replay10Outlined';
import Replay30OutlinedIcon from '@mui/icons-material/Replay30Outlined';
import Forward5OutlinedIcon from '@mui/icons-material/Forward5Outlined';
import Forward10OutlinedIcon from '@mui/icons-material/Forward10Outlined';
import Forward30OutlinedIcon from '@mui/icons-material/Forward30Outlined';

import {
  buttonStyle, 
  progressButtonStyle,
  sliderColor
} from '../styles/styles.js';

const ProgressController = (props) => {

	const trackRef = props.trackRef;

	function calcPosition () {
	  return trackRef.current ? trackRef.current.currentTime * (100 / trackRef.current.duration) : 0;
	}

	function calculateCurrentMinutes() {
	  return trackRef.current ? Math.floor(trackRef.current.currentTime / 60) : 0;
	}

	function calculateCurrentSeconds(currMinutes) {
	  return trackRef.current ? Math.floor(trackRef.current.currentTime - currMinutes * 60) : 0;
	}

	function calculateDurationMinutes() {
	  return trackRef.current ? Math.floor(trackRef.current.duration / 60) : 0;
	}

	function calculateDurationSeconds(durMinutes) {
	  return trackRef.current ? Math.floor(trackRef.current.duration - durMinutes * 60) : 0;
	}

	const [currentPosition, setCurrentPosition] = useState(calcPosition());
	const currMinutesInit = calculateCurrentMinutes();
	const [currentMinutes, setCurrentMinutes] = useState(currMinutesInit);
	const [currentSeconds, setCurrentSeconds] = useState(calculateCurrentSeconds(currMinutesInit));
	const durMinutesInit = calculateDurationMinutes(); 
	const [durationMinutes, setDurationMinutes] = useState(durMinutesInit);
	const [durationSeconds, setDurationSeconds] = useState(calculateDurationSeconds(durMinutesInit));

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

	const progressUpdate = () => {
	  // Check if the current track duration is a legible number
	  if (!isNaN(trackRef.current.duration)) {
	    setCurrentPosition(calcPosition());
	    calculateCurrentTime();
	  }
	}

	const calculateCurrentTime = () => {
	  let currMinutes = calculateCurrentMinutes();
	  let currSeconds = calculateCurrentSeconds(currMinutes);
	  let durMinutes = calculateDurationMinutes();
	  let durSeconds = calculateDurationSeconds(durMinutes);
	  setCurrentMinutes(currMinutes);
	  setCurrentSeconds(currSeconds);
	  setDurationMinutes(durMinutes);
	  setDurationSeconds(durSeconds);
	}

	useEffect(() => {
	  setTimeout(() => progressUpdate(), 1000);
	}, [currentMinutes, currentSeconds, durationMinutes, durationSeconds, currentPosition]);

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
	          sx={{...progressButtonStyle}}
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
	      sx={{...progressButtonStyle}}
	        >
	            <Replay5OutlinedIcon />
	        </Button>
	        <Button 
	            className="rewind-10" 
	            onClick={() => scan(-10)}
	      sx={{...progressButtonStyle}}
	        >
	            <Replay10OutlinedIcon />
	        </Button>
	        <Button 
	            className="rewind-30" 
	            onClick={() => scan(-30)}
	      sx={{...progressButtonStyle}}
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
	          sx={{...progressButtonStyle}}
	      >
	          <Forward5OutlinedIcon />
	      </Button>
	      <Button 
	          className="rewind-10" 
	          onClick={() => scan(10)} 
	          sx={{...progressButtonStyle}}
	      >
	          <Forward10OutlinedIcon />
	      </Button>
	      <Button 
	          className="rewind-30" 
	          onClick={() => scan(30)} 
	          sx={{...progressButtonStyle}}
	      >
	          <Forward30OutlinedIcon />
	      </Button>
	    </ButtonGroup>
	  </Stack>
	  </Box>
	);
}

export default ProgressController;