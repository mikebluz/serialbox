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
	const [newSongsLoaded, setNewSongsLoaded] = useState({});
	const [countSongsLoaded, setCountSongsLoaded] = useState(0);
    const folderName = props.folderName;

	const handleClick = () => {
		getAccessToken(async (token) => {
			const folders = await fetchDriveFolders(folderName, token);
			const files = await fetchDriveFolderContents(folders, token);
			setNewSongsLoaded(files);
			const count = Object.values(files).reduce((acc, arr) => acc += arr.length, 0);
			setCountSongsLoaded(count);
			console.log(`${count} files loaded across ${Object.keys(files).length} folders`);
			const playlistCreatedRes = await axios.post('http://localhost:3005/playlist', {
				name: folderName,
				email: props.user.email,
				songs: JSON.stringify(files),
			});
			console.log('Playlist created', playlistCreatedRes);
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