import { useState } from 'react';
import { initGapiTokenClient } from '../api/gapi.js';
import {buttonStyle} from '../styles/styles.js';

const Load = () => {
	const [isHovering, setIsHovering] = useState(false);
	
	const handleClick = () => {
		initGapiTokenClient();
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
		>Load</button>
	)
}

export default Load