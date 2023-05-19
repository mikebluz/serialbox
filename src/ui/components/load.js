import { useState } from 'react';
import Button from '@mui/material/Button';
import { 
	getAccessToken, 
	fetchDriveFolders, 
	fetchDriveFolderContents 
} from '../api/gapi.js';
import {buttonStyle} from '../styles/styles.js';

const Load = (props) => {
	const [isHovering, setIsHovering] = useState(false);

	const handleClick = () => {
		getAccessToken(async (token) => {
			const folders = await fetchDriveFolders(props.folderName, token);
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
		<Button 
	        onMouseEnter={handleMouseEnter}
	        onMouseLeave={handleMouseLeave}
			onClick={handleClick} 
			style={buttonStyle(isHovering)}
		>Load</Button>
	)
}

export default Load