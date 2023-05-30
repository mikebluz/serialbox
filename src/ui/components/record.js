import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { 
	getAccessToken, 
	uploadFile,
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

import Tape from './tape.js';

import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import RadioButtonCheckedOutlinedIcon from '@mui/icons-material/RadioButtonCheckedOutlined';
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined';
import StopOutlinedIcon from '@mui/icons-material/StopOutlined';

const AudioRecorder = (props) => {
	const recordRef = props.recordRef;

	const refs = [];

	for (let i = 0; i < props.size; i++) {
		refs.push(useRef());	
	}

	const [open, setOpen] = useState(false);
	const [folderName, setFolderName] = useState('');
	const [songName, setSongName] = useState('');
	const [artistName, setArtistName] = useState('');
	const [isRecording, setIsRecording] = useState(false);
	const [rec, setRec] = useState(undefined);
	const [blobs, setBlobs] = useState([]);
	const [tape, setTape] = useState([]);
	const [trackNumber, setTrackNumber] = useState(0);
	const [error, setError] = useState('');

	// Buttons
	const [startButtonEnabled, setStartButtonEnabled] = useState(true);
	const [stopButtonEnabled, setStopButtonEnabled] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		setBlobs([]);
		setTrackNumber(0);
		setError('');
	};

	const handleStartRecording = () => {
		setIsRecording(true);
	    setStartButtonEnabled(false);
	    setStopButtonEnabled(true);
	}

	const handleStopRecording = () => {
		setIsRecording(false);
	    setStartButtonEnabled(true);
	    setStopButtonEnabled(false);
	}

	const saveToDrive = async (data, songName, callback) => {
		getAccessToken(async (token) => {
			const upload = await uploadFile(data, songName, folderName, token);
			callback(upload);
		})
	}

	const record = (stream) => {
		const rec = new MediaRecorder(stream, {
			audioBitsPerSecond: '128000',
		});
		setRec(rec);
		rec.ondataavailable = (e) => {
			if (rec.state == "inactive") {
				let blob = new Blob([e.data],{ type:'audio/mpeg' });
				setBlobs([...blobs, blob]);
				setTape([...tape, { src: URL.createObjectURL(blob), ref: refs[trackNumber] }]);
				setTrackNumber(trackNumber + 1);
		  	}
		}
		rollPlayback();
		rec.start();
	}

	const save = () => {
		console.log(songName, artistName, folderName)
		if (songName === '' || artistName === '' || folderName === '') {
			setError('Must provide a folder name, song name, and artist name to save.');
			return;
		}
		Promise.all(blobs.map(async (blob, i) => {
			const trackName = `${songName}-track${i+1}`;
			return new Promise((res, rej) => {
				saveToDrive(blob, trackName, async (data) => {
					await axios.post(`${process.env.REACT_APP_SERVER_HOST}/playlists`, {
						name: folderName,
						email: props.user.email,
						songs: JSON.stringify({
							[folderName]: [{
								name: trackName,
								artist: artistName,
								id: data.id,
								mimeType: data.mimeType
							}]
						}),
						artist: artistName,
					});
					res();
				})
			});
		})).then(() => handleClose());
	}

	const rollPlayback = () => {
		refs
			.filter((ref) => ref.current !== undefined)
			.map((ref) => {
				ref.current.load();
				ref.current.play();
			});
	}

	const stopPlayback = () => {
		refs
			.filter((ref) => ref.current !== undefined)
			.map((ref) => {
				ref.current.pause();
			});
	}

	const toggleIsPlaying = () => {
		setIsPlaying(!isPlaying);
	}

	useEffect(() => {
		if (isRecording) {
			navigator.mediaDevices
				.getUserMedia({ audio:true })
				.then(stream => { record(stream) });
		} else if (rec) {
			rec.stop();
			stopPlayback();
		}
	}, [isRecording])

	useEffect(() => {
		if (isPlaying) {
			rollPlayback();
		} else {
			stopPlayback();
		}
	}, [isPlaying])

	useEffect(() => {
		setError('');
	}, [folderName, songName, artistName])

	return (
		<div>
			<Tape sources={tape} />
			<Button 
				variant="outlined" 
				onClick={handleClickOpen}
				style={{...buttonStyle, backgroundColor: 'black'}}
			>
				<RadioButtonCheckedOutlinedIcon sx={{ color: 'red' }}/>
			</Button>
			<Dialog
			  open={open}
			  onClose={handleClose}
			  aria-labelledby="modal-modal-title"
			  aria-describedby="modal-modal-description"
			>	 
	        <DialogTitle sx={{ paddingBottom: '8px' }}>
	        	<RadioButtonCheckedOutlinedIcon sx={{ color: isRecording ? 'red' : 'black' }}/>{isRecording && ' REC'}
	    	</DialogTitle>
			<DialogContent sx={{ paddingBottom: '0px' }}>
				<DialogContentText>
					{ props.size - blobs.length } tracks left
				</DialogContentText>
				<DialogContentText sx={{ color: 'red' }}>
					{ error !== '' && error }
				</DialogContentText>
				<Box sx={{ marginTop: '10px' }}>
					<TextField required id="folder-name" label="Folder name" variant="outlined" onChange={(e) => setFolderName(e.target.value)} sx={{width: '100%', marginBottom: '10px'}}/>
					<TextField required id="playlist-name" label="Song name" variant="outlined" onChange={(e) => setSongName(`${e.target.value}.mp3`)} sx={{width: '100%', marginBottom: '10px'}}/>
					<TextField required id="artist-name" label="Artist name" variant="outlined" onChange={(e) => setArtistName(e.target.value)} sx={{width: '100%', marginBottom: '10px'}}/>
				</Box>
			</DialogContent>
			<DialogActions>
			<ButtonGroup>
				<Button onClick={toggleIsPlaying} style={buttonStyle}>{ isPlaying ? <StopOutlinedIcon /> : <PlayArrowOutlinedIcon /> }</Button>
				<Button onClick={save} style={buttonStyle}>Save</Button>
				{ (startButtonEnabled && trackNumber < props.size) && <Button onClick={handleStartRecording} style={{...buttonStyle, backgroundColor: 'black', color: 'white'}}><RadioButtonUncheckedOutlinedIcon sx={{ color: 'red' }}/></Button> }
				{ stopButtonEnabled && <Button onClick={handleStopRecording} style={{...buttonStyle, backgroundColor: 'black', color: 'white'}}><RadioButtonCheckedOutlinedIcon sx={{ color: 'red' }}/></Button> }
				<Button onClick={handleClose} style={buttonStyle}>X</Button>
			</ButtonGroup>
			</DialogActions>     
			</Dialog>
		</div>
	);
}

export default AudioRecorder;
