import { useState } from 'react';
import { 
	getAccessToken, 
	fetchDriveFolders, 
	fetchDriveFolderContents 
} from '../api/gapi.js';
import {buttonStyle} from '../styles/styles.js';

const Load = () => {
	const [isHovering, setIsHovering] = useState(false);
	
	const handleClick = () => {
		getAccessToken(async (token) => {
			const folders = await fetchDriveFolders('demos', token);
			console.log('folders', folders);
			const files = await fetchDriveFolderContents(folders, token);
			console.log(files);
		});
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