import { useEffect, useState } from 'react';
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

import RadioButtonCheckedOutlinedIcon from '@mui/icons-material/RadioButtonCheckedOutlined';
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined';

const AudioRecorder = (props) => {
	const recordRef = props.recordRef;

	const [open, setOpen] = useState(false);
	const [folderName, setFolderName] = useState('');
	const [songName, setSongName] = useState('');
	const [artistName, setArtistName] = useState('');
	const [isRecording, setIsRecording] = useState(false);
	const [audioChunks, setAudioChunks] = useState([]);
	const [rec, setRec] = useState(undefined);

	// Buttons
	const [startButtonEnabled, setStartButtonEnabled] = useState(true);
	const [stopButtonEnabled, setStopButtonEnabled] = useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
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

	const saveToDrive = async (data, callback) => {
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
			audioChunks.push(e.data);
			if (rec.state == "inactive"){
				let blob = new Blob(audioChunks,{ type:'audio/mpeg' });
				recordRef.src = URL.createObjectURL(blob);
				// recordRef.controls = true;
				// recordRef.autoplay = true;
				saveToDrive(blob, async (data) => {
					await axios.post(`${process.env.REACT_APP_SERVER_HOST}/playlists`, {
						name: folderName,
						email: props.user.email,
						songs: JSON.stringify({
							[folderName]: [{
								name: songName,
								artist: artistName,
								id: data.id,
								mimeType: data.mimeType
							}]
						}),
						artist: artistName,
					});
					handleClose();
				})
		  	}
		}
	    rec.start();
	}

	useEffect(() => {
		if (isRecording) {
			navigator.mediaDevices
				.getUserMedia({ audio:true })
				.then(stream => { record(stream) });
		} else if (rec) {
			rec.stop();
		}
	}, [isRecording])

	return (
		<div>
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
        <DialogTitle><RadioButtonCheckedOutlinedIcon sx={{ color: isRecording ? 'red' : 'black' }}/></DialogTitle>
				<DialogContent>
				  <DialogContentText>
						Record something and save to your Google Drive.
				  </DialogContentText>
				  <Box sx={{ marginTop: '10px' }}>
						<TextField id="folder-name" label="Enter folder name" variant="outlined" onChange={(e) => setFolderName(e.target.value)} sx={{width: '100%'}}/>
						<TextField id="playlist-name" label="Enter song name" variant="outlined" onChange={(e) => setSongName(`${e.target.value}.mp3`)} sx={{width: '100%'}}/>
						<TextField id="artist-name" label="Enter artist name" variant="outlined" onChange={(e) => setArtistName(e.target.value)} sx={{width: '100%'}}/>
				  </Box>
				</DialogContent>
				<DialogActions>
				<ButtonGroup>
					{ startButtonEnabled && <Button onClick={handleStartRecording} style={{...buttonStyle, backgroundColor: 'black', color: 'white'}}><RadioButtonUncheckedOutlinedIcon sx={{ color: 'red' }}/></Button> }
					{ stopButtonEnabled && <Button onClick={handleStopRecording} style={{...buttonStyle, backgroundColor: 'black', color: 'white'}}><RadioButtonCheckedOutlinedIcon sx={{ color: 'red' }}/></Button> }
					<Button onClick={handleClose} style={buttonStyle}>X</Button>
				</ButtonGroup>
				</DialogActions>     
			</Dialog>
		</div>
	);
}

export default AudioRecorder;
