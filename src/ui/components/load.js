import { useState } from 'react';
import TextField from '@mui/material/TextField';
import { 
	getAccessToken, 
	fetchDriveFolders, 
	fetchDriveFolderContents 
} from '../api/gapi.js';
import {buttonStyle} from '../styles/styles.js';

const Load = () => {
	const [isHovering, setIsHovering] = useState(false);
	const [folderName, setFolderName] = useState('');

	const handleClick = () => {
		getAccessToken(async (token) => {
			const folders = await fetchDriveFolders(folderName, token);
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
		<div>
			<TextField id="folder-name" label="Enter folder name" variant="outlined" onChange={(evt) => setFolderName(evt.target.value)} />
			<button 
		        onMouseEnter={handleMouseEnter}
		        onMouseLeave={handleMouseLeave}
				onClick={handleClick} 
				style={buttonStyle(isHovering)}
			>Load</button>
		</div>
	)
}

export default Load