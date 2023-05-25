import { useState } from 'react';
import axios from 'axios';
import { 
	audioFileMimeTypes,
	getAccessToken, 
	fetchDriveFolders, 
	fetchDriveFolderContents,
} from '../api/gapi.js';
import {buttonStyle} from '../styles/styles.js';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


const Load = (props) => {
	const [open, setOpen] = useState(false);
	const [isHovering, setIsHovering] = useState(false);
	const [folderName, setFolderName] = useState(''); 
	const [artistName, setArtistName] = useState('');
	const [playlistName, setPlaylistName] = useState('');

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleClick = () => {
		if (folderName === '' || artistName === '') {
			return;
		}
		getAccessToken(async (token) => {

			// ToDo: Add "loading" display to dialog modal (in place of inputs)

			const folders = await fetchDriveFolders(folderName, token);
			if (folders.length) {
				const files = await fetchDriveFolderContents(folders, token);
				if (Object.keys(files).length) {
					const count = Object.values(files).reduce((acc, arr) => acc += arr.length, 0);
					console.log(`${count} files loaded across ${Object.keys(files).length} folders`);
					await axios.post(`${process.env.REACT_APP_SERVER_HOST}/playlists`, {
						name: playlistName,
						email: props.user.email,
						songs: JSON.stringify(files),
						artist: artistName,
					});
					props.handleLoadedSongs(files, playlistName);
					handleClose();
				} else {
					// ToDo: Display in dialog modal
					console.log("No tracks found.")
					handleClose();
				}
			} else {
				// ToDo: Display in dialog modal
				console.log("No folders found.");
				handleClose();
			}
		});
	};

	return (
		<div>
			<Button 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
				variant="outlined" 
				onClick={handleClickOpen}
				style={buttonStyle(isHovering)}
			>
				Load
			</Button>
			<Dialog
			  open={open}
			  onClose={handleClose}
			  aria-labelledby="modal-modal-title"
			  aria-describedby="modal-modal-description"
			>	 
        <DialogTitle>Create Playlist</DialogTitle>
				<DialogContent>
				  <DialogContentText>
						Search your Google Drive folders by name for audio to load.
						All compatible files in matching folders will be loaded and saved as a playlist.
				  </DialogContentText>
			  	<h3>Compatible mime types:</h3>
				  <ul>
  					{ audioFileMimeTypes.map((mt) => <li key={mt}>{mt}</li>) }
				  </ul>
				  <Box sx={{ marginTop: '10px' }}>
						<TextField id="folder-name" label="Enter folder name" variant="outlined" onChange={(e) => setFolderName(e.target.value)} sx={{width: '100%'}}/>
						<TextField id="playlist-name" label="Enter playlist name" variant="outlined" onChange={(e) => setPlaylistName(e.target.value)} sx={{width: '100%'}}/>
						<TextField id="artist-name" label="Enter artist name" variant="outlined" onChange={(e) => setArtistName(e.target.value)} sx={{width: '100%'}}/>
				  </Box>
				</DialogContent>
				<DialogActions>
				<ButtonGroup>
				  <Button onClick={handleClick} style={buttonStyle(false)}>Load</Button>
				  <Button onClick={handleClose} style={buttonStyle(false)}>Cancel</Button>
				</ButtonGroup>
				</DialogActions>       
			</Dialog>
		</div>
	);
}

export default Load;
