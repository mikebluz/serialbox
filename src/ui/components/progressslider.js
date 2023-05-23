import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';

let updateTimer;

const ProgressSlider = (props) => {
	const [currentPosition, setCurrentPosition] = useState(0);
	const [currentMinutes, setCurrentMinutes] = useState(0);
	const [currentSeconds, setCurrentSeconds] = useState(0);
	const [durationMinutes, setDurationMinutes] = useState(0);
	const [durationSeconds, setDurationSeconds] = useState(0);

	const trackRef = props.trackRef;

	const handleSeek = (event, newValue) => {
		trackRef.current.currentTime = trackRef.current.duration * (newValue / 100);;
		setCurrentPosition(newValue);
	};

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
		<Box sx={{ width: '90vw', color: 'black' }}>
		  <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
		  	<p>{padSingleDigits(currentMinutes) + ":" + padSingleDigits(currentSeconds)}</p>
		    <Slider aria-label="Volume" value={currentPosition} onChange={handleSeek} sx={{ color: 'black' }} />
		  	<p>{padSingleDigits(durationMinutes) + ":" + padSingleDigits(durationSeconds)}</p>
		  </Stack>
		</Box>
	);
}

export default ProgressSlider;