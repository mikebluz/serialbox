import { useState } from 'react';
import axios from 'axios';
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
			const files = await fetchDriveFolderContents(folders, token);
			const count = Object.values(files).reduce((acc, arr) => acc += arr.length, 0);
			console.log(`${count} files loaded across ${Object.keys(files).length} folders`);
			const playlistCreatedRes = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/playlist`, {
				name: props.playlistName,
				email: props.user.email,
				songs: JSON.stringify(files),
			});
			console.log('Playlist created', playlistCreatedRes);
			props.handleLoadedSongs(files);
		});
	};

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
	);
}

export default Load