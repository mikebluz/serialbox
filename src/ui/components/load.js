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
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AddToDriveOutlinedIcon from '@mui/icons-material/AddToDriveOutlined';


const Load = (props) => {
	const [open, setOpen] = useState(false);
	const [folderName, setFolderName] = useState(''); 
	const [artistName, setArtistName] = useState('');
	const [playlistName, setPlaylistName] = useState('');
	const [msg, setMsg] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		setMsg('');
	};

	const handleClick = () => {
		if (folderName === '' || artistName === '' || isLoading) {
			return;
		}
		setIsLoading(true);
		getAccessToken(async (token) => {
			const folders = await fetchDriveFolders(folderName, token);
			if (folders.length) {
				const files = await fetchDriveFolderContents(folders, token);
				if (Object.keys(files).length) {
					const count = Object.values(files).reduce((acc, arr) => acc += arr.length, 0);
					console.log(`${count} files loaded across ${Object.keys(files).length} folders`);
					const { data:playlist } = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/playlists`, {
						name: playlistName,
						email: props.user.email,
						songs: JSON.stringify(files),
						artist: artistName,
					});
					props.handleLoadedSongs(playlist, playlistName, playlist.id);
				} else {
					setMsg(`No tracks found in folders matching '${folderName}'.`);
				}
			} else {
				setMsg(`No folders found for '${folderName}'.`);
			}
			setIsLoading(false);
		});
	};

	return (
		<div>
			<Button 
				variant="outlined" 
				onClick={handleClickOpen}
				style={buttonStyle}
			>
				<AddToDriveOutlinedIcon />
			</Button>
			<Dialog
			  open={open}
			  onClose={handleClose}
			  aria-labelledby="modal-modal-title"
			  aria-describedby="modal-modal-description"
			>	 
       			<DialogTitle><AddToDriveOutlinedIcon /> Create Playlist</DialogTitle>
				<DialogContent sx={{ paddingBottom: '0px' }}>
					<DialogContentText>
						Search your Google Drive folders by name for audio to load.
						All compatible files in matching folders will be loaded and saved as a playlist.
					</DialogContentText>
					<h3 style={{margin: '10px 0 8px 0'}}>Compatible mime types:</h3>
					<ul style={{margin: '0'}}>
						{ audioFileMimeTypes.map((mt) => <li key={mt}>{mt}</li>) }
					</ul>
					{ msg !== '' && <DialogContentText sx={{ color: 'red', padding: '10px', marginTop: '0' }}>{msg}</DialogContentText> }
					<Box sx={{ marginTop: '10px' }}>
						<TextField id="folder-name" label="Folder name" variant="outlined" onChange={(e) => setFolderName(e.target.value)} sx={{width: '100%', marginBottom: '10px'}}/>
						<TextField id="playlist-name" label="Playlist name" variant="outlined" onChange={(e) => setPlaylistName(e.target.value)} sx={{width: '100%', marginBottom: '10px'}}/>
						<TextField id="artist-name" label="Artist name" variant="outlined" onChange={(e) => setArtistName(e.target.value)} sx={{width: '100%', marginBottom: '10px'}}/>
					</Box>
				</DialogContent>
				{
					isLoading
					?
				    <Box sx={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap'}}>
					    <CircularProgress sx={{ color: 'black', width: '100%', marginBottom: '18px' }}/>
				    </Box>
				    :
    				<DialogActions>
						<ButtonGroup>
						  <Button onClick={handleClick} style={buttonStyle}>Create</Button>
						  <Button onClick={handleClose} style={buttonStyle}>X</Button>
						</ButtonGroup>
					</DialogActions>  
				}     
			</Dialog>
		</div>
	);
}

export default Load;
