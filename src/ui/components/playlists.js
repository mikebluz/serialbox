import { useState } from 'react';
import axios from 'axios';
import { 
	audioFileMimeTypes,
	getAccessToken, 
	fetchDriveFolders, 
	fetchDriveFolderContents,
} from '../api/gapi.js';
import {defaultPlaylistNames, getRandomInt} from '../helpers.js';

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

import QueueMusicOutlinedIcon from '@mui/icons-material/QueueMusicOutlined';

const Playlists = (props) => {
	const [open, setOpen] = useState(false);
	const [folderName, setFolderName] = useState(''); 
	const [playlists, setPlaylists] = useState([]);
	const [playlistLookup, setPlaylistLookup] = useState({});
	const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
	const [selectedPlaylistName, setSelectedPlaylistName] = useState(defaultPlaylistName());
	const [artistName, setArtistName] = useState('');
	const [randomPlaylistSize, setRandomPlaylistSize] = useState(10);

	function defaultPlaylistName() {
		const i = getRandomInt(defaultPlaylistNames.length - 1);
		return `${defaultPlaylistNames[i]}-${(new Date()).toISOString()}`;
	}

	const handleClickOpen = () => {
		setOpen(true);
		getAccessToken(async (token) => {
			const { data: playlists } = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/playlists/all/users/${props.user.email}`);
			setPlaylists(playlists);
			const map = {};
			playlists.forEach((playlist) => map[playlist.id] = playlist.name);
			setPlaylistLookup(map);
		});
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleSelect = () => {
		if (selectedPlaylistId !== '') {
			getAccessToken(async (token) => {
				const { data: songs } = await axios.get(`${process.env.REACT_APP_SERVER_HOST}/playlists/${selectedPlaylistId}/songs`);
				props.handleLoadedSongs(songs, playlistLookup[selectedPlaylistId]);
			});
		}
	};

	const handlePlaylistChange = (playlistId, playlistName) => {
		setSelectedPlaylistId(playlistId);
		setSelectedPlaylistName(playlistName);
	}

	const handleRandom = () => {
		const name = selectedPlaylistName !== '' ? selectedPlaylistName : defaultPlaylistName();
		getAccessToken(async (token) => {
			const { data: songs } = await axios.post(`${process.env.REACT_APP_SERVER_HOST}/playlists/random`, {
				playlistName: name,
				email: props.user.email,
				count: randomPlaylistSize,
			});
			props.handleLoadedSongs(songs, name);
		});
	}

	return (
		<Box>
			<Button 
				variant="outlined" 
				onClick={handleClickOpen}
				style={buttonStyle}
			>
				<QueueMusicOutlinedIcon />
			</Button>
			<Dialog
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description"
			>	 
		        <DialogTitle>Load Playlist</DialogTitle>
				<DialogContent>
				{
					playlists.length > 0
					&&
				    <Box sx={{ minWidth: 120 }}>
						<DialogContentText>
							Choose existing
						</DialogContentText>
						<FormControl fullWidth sx={{ marginTop: '5px' }}>
							<InputLabel id="demo-simple-select-label">Playlist</InputLabel>
							<Select
								labelId="demo-simple-select-label"
								id="demo-simple-select"
								value={selectedPlaylistId}
								label="Playlist"
								onChange={(e) => handlePlaylistChange(e.target.value, 'test')}
							>
							{
								playlists.map((playlist) => <MenuItem key={playlist.id} value={playlist.id}>{playlist.name}</MenuItem>)
							}
							</Select>
						</FormControl>
				    </Box>
				}
				<DialogContentText>
					Or generate a new playlist consisting of random songs from your song bank
				</DialogContentText>
				<TextField id="rndm-playlist-size" label="Enter integer < 100 (# of songs)" variant="outlined" onChange={(e) => setRandomPlaylistSize(e.target.value)} sx={{width: '100%', marginTop: '10px'}}/>
		  	    <TextField id="playlist-name" label="Enter playlist name" variant="outlined" onChange={(e) => setSelectedPlaylistName(e.target.value)} sx={{width: '100%', marginTop: '10px'}}/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleSelect} style={buttonStyle}>Select</Button>
					<Button onClick={handleRandom} style={buttonStyle}>Random</Button>
					<Button onClick={handleClose} style={buttonStyle}>Cancel</Button>
				</DialogActions>        
			</Dialog>
		</Box>
	);
}

export default Playlists;
