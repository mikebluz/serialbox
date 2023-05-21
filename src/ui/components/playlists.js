import { useState } from 'react';
import Button from '@mui/material/Button';
import { initGapiTokenClient } from '../api/gapi.js';
import {buttonStyle} from '../styles/styles.js';

const Playlists = () => {
	const [isHovering, setIsHovering] = useState(false);
	
	const handleClick = () => {
		console.log('Playlists clicked')
	}

	const handleMouseEnter = () => {
		setIsHovering(true);
	};

	const handleMouseLeave = () => {
		setIsHovering(false);
	};

	return (
		<Button 
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
			onClick={handleClick} 
			style={buttonStyle(isHovering)}
		>
			Playlists
		</Button>
	)
}

export default Playlists
