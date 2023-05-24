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

import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


const Playlists = (props) => {
	const [open, setOpen] = useState(false);
	const [isHovering, setIsHovering] = useState(false);
	const [folderName, setFolderName] = useState(''); 
	const [playlists, setPlaylists] = useState([]);
	const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
	const [artistName, setArtistName] = useState('');

	const handleMouseEnter = () => {
		setIsHovering(true);
	};

	const handleMouseLeave = () => {
		setIsHovering(false);
	};

	const handleClickOpen = () => {
		setOpen(true);
		getAccessToken(async (token) => {
			const { data: playlists } = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/playlists/all/users/${props.user.email}`);
			setPlaylists(playlists);
		});
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleSelect = () => {
		getAccessToken(async (token) => {
			const { data: songs } = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/playlists/${selectedPlaylistId}/songs`);
			console.log(songs);
			props.handleLoadedSongs(songs);
		});
	};

	const handlePlaylistChange = (e) => {
		setSelectedPlaylistId(e.target.value);
	}

	return (
		<div>
			<Button 
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				variant="outlined" 
				onClick={handleClickOpen}
				style={buttonStyle(isHovering)}
			>
				Playlists
			</Button>
			<Dialog
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>	 
		        <DialogTitle>Select Playlist</DialogTitle>
				{
					playlists.length > 0
					&&
					<DialogContent>
					    <Box sx={{ minWidth: 120 }}>
							<FormControl fullWidth>
								<InputLabel id="demo-simple-select-label">Playlist</InputLabel>
								<Select
									labelId="demo-simple-select-label"
									id="demo-simple-select"
									value={selectedPlaylistId}
									label="Playlist"
									onChange={handlePlaylistChange}
								>
								{
									playlists.map((playlist) => <MenuItem key={playlist.id} value={playlist.id}>{playlist.name}</MenuItem>)
								}
								</Select>
							</FormControl>
					    </Box>
					</DialogContent>
				}
				<DialogActions>
					<Button onClick={handleSelect} style={buttonStyle(false)}>Select</Button>
					<Button onClick={handleClose} style={buttonStyle(false)}>Cancel</Button>
				</DialogActions>       
			</Dialog>
		</div>
	);
}

export default Playlists;
