import { useState } from 'react';
import { initGapiTokenClient } from '../api/gapi.js';
import {buttonStyle} from '../styles/styles.js';

const Playlists = () => {
	const [isHovering, setIsHovering] = useState(false);
	
	const handleClick = () => {
		console.log('Plyalists clicked')
	}

	const handleMouseEnter = () => {
		setIsHovering(true);
	};

	const handleMouseLeave = () => {
		setIsHovering(false);
	};

	return (
		<button 
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
			onClick={handleClick} 
			style={buttonStyle(isHovering)}
		>Playlists</button>
	)
}

export default Playlists