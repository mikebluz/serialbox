import { useState } from 'react';
import { initGapiTokenClient } from '../api/gapi.js';
import {buttonStyle} from '../styles/styles.js';

const Shuffle = () => {
	const [isHovering, setIsHovering] = useState(false);
	
	const handleClick = () => {
		console.log('Shuffle clicked');
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
		>Shuffle</button>
	)
}

export default Shuffle