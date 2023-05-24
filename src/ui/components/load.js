import { useState } from 'react';
import axios from 'axios';
import { 
	audioFileMimeTypes,
	getAccessToken, 
	fetchDriveFolders, 
	fetchDriveFolderContents,
} from '../api/gapi.js';
import {buttonStyle} from '../styles/styles.js';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';


const Load = (props) => {
	const [open, setOpen] = useState(false);
	const [isHovering, setIsHovering] = useState(false);
	const [folderName, setFolderName] = useState('demos'); 
	const [playlistName, setPlaylistName] = useState('not provided');
	const [artistName, setArtistName] = useState('not provided');

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
					props.handleLoadedSongs(files);
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
					Enter a string to search your Google Drive folders by name for audio to load.
				  </DialogContentText>
				  <DialogContentText>
					All compatible files in matching folders will be loaded and saved as a playlist. Compatible mime types:
				  </DialogContentText>
				  <DialogContentText>
  					{ JSON.stringify(audioFileMimeTypes) }
  				  </DialogContentText>
				<TextField id="folder-name" label="Enter folder name" variant="outlined" onChange={(evt) => setFolderName(evt.target.value)}/>
  	    <TextField id="playlist-name" label="Enter playlist name" variant="outlined" onChange={(evt) => setPlaylistName(evt.target.value)}/>
      	<TextField id="artist-name" label="Enter artist name" variant="outlined" onChange={(evt) => setArtistName(evt.target.value)}/>
				</DialogContent>
				<DialogActions>
				  <Button onClick={handleClick} style={buttonStyle(false)}>Load</Button>
				  <Button onClick={handleClose} style={buttonStyle(false)}>Cancel</Button>
				</DialogActions>       
			</Dialog>
		</div>
	);
}

export default Load;
