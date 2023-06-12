import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { 
	createFolder,
	fetchDriveFileBlob, 
	fetchDriveFolders,
	getAccessToken, 
	uploadFile,
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

import Tape from './tape.js';
import {getCorrectDuration} from '../helpers.js';

import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import RadioButtonCheckedOutlinedIcon from '@mui/icons-material/RadioButtonCheckedOutlined';
import RadioButtonUncheckedOutlinedIcon from '@mui/icons-material/RadioButtonUncheckedOutlined';
import StopOutlinedIcon from '@mui/icons-material/StopOutlined';

const AudioRecorder = (props) => {

	const mixdownRef = useRef();
	const backingTrackRef = useRef();

	const [open, setOpen] = useState(false);

	const refs = [];

	for (let i = 0; i < props.size; i++) {
		refs.push(useRef());	
	}

	const [isActive, setIsActive] = useState(false);
	const [folderName, setFolderName] = useState('');
	const [songName, setSongName] = useState('');
	const [artistName, setArtistName] = useState('');
	const [isRecording, setIsRecording] = useState(false);
	const [rec, setRec] = useState(undefined);
	const [blobs, setBlobs] = useState([]);
	const [mixdownBlob, setMixdownBlob] = useState(undefined);
	const [individualTracks, setIndividualTracks] = useState([]);
	const [trackNumber, setTrackNumber] = useState(0);
	const [error, setError] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [recordingMedia, setRecordingMedia] = useState([]);
	const [mixdownLoaded, setMixdownLoaded] = useState(false);

	// Buttons
	const [startButtonEnabled, setStartButtonEnabled] = useState(true);
	const [stopButtonEnabled, setStopButtonEnabled] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);

	const handleOpen = () => {
		setIsActive(true);
		setOpen(true);
	}

	const handleClose = () => {
		if (isRecording) {
			handleStopRecording();
		};
		setIsActive(false);
		setOpen(false);
		handleClear();
	};

	const handleClear = () => {
		setBlobs([]);
		setMixdownLoaded(false);
		setRecordingMedia([]);
		setTrackNumber(0);
		setError('');
		setFolderName('');
		setSongName('');
		setArtistName('');
		if (props.song) {
			getAccessToken((token) => {
				fetchDriveFileBlob(props.song, token).then((blob) => {
					setIndividualTracks([{ref: backingTrackRef, src: URL.createObjectURL(blob)}]);
				});
			});
		}
	}

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

	const record = (stream) => {
		const rec = new MediaRecorder(stream, {
			audioBitsPerSecond: '128000',
		});
		setRec(rec);
		rec.ondataavailable = (e) => {
			if (rec.state == "inactive") {
				let blob = new Blob([e.data],{ type:'audio/mpeg' });
				setBlobs([...blobs, blob]);
				setIndividualTracks([...individualTracks, { src: URL.createObjectURL(blob), ref: refs[trackNumber] }]);
				setTrackNumber(trackNumber + 1);
		  	}
		}
		rec.start();
	}

	const saveToDrive = async (data, trackName, folder, token) => {
		const upload = await uploadFile(data, trackName, folder, token);
		return await axios.post(`${process.env.REACT_APP_SERVER_HOST}/playlists`, {
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
	}

	const save = () => {
		if (songName === '' || artistName === '' || folderName === '') {
			setError('Must provide a folder name, song name, and artist name to save.');
			return;
		}

		setIsSaving(true);

		getAccessToken(async (token) => {
			fetchDriveFolders(folderName, token)
				.then(async ([folder]) => {
					if (!folder) {
						folder = await createFolder(folderName, token);
					}
					return folder;
				})
				.then((folder) => {
					Promise
						.all(blobs.map((blob, i) => saveToDrive(blob, `${songName}-track${i+1}.mp3`, folder, token)))
						.then(() => saveToDrive(mixdownBlob, songName, folder, token))
						.then(() => {
							setError("Saved!");
							setIsSaving(false);
							setTimeout(() => setError(''), 2000);
						});
				})
		})

	}

	const rollPlayback = () => {
		mixdownRef.current.onended = () => setIsPlaying(false);
		mixdownRef.current.play();
	}

	const stopPlayback = (resumePosition) => {
		mixdownRef.current.pause();
		mixdownRef.current.currentTime = resumePosition ?? 0;
	}

	const toggleIsPlaying = () => {
		setIsPlaying(!isPlaying);
	}

	// ToDo: fully convert to Async/Await
	const rollTape = (stream, recordedTracks) => {
		setMixdownLoaded(false);

		let start;
		var description = "mixdown";
		var offlineAudioContext;
		var recorder;
		var chunks = [];
		var mainAudioCtx = new AudioContext();
		var outputMixDestination = mainAudioCtx.createMediaStreamDestination();

		const trackLoadHandler = (res, t, canLoadReally) => async () => {
			if (canLoadReally) {
				const response = await fetch(t.src)
				const buf = await response.arrayBuffer();
				res([buf, t.ref.current.duration])
			}
		};

		function get(trackObj) {
			if (!trackObj.ref) return;
			return getCorrectDuration(trackObj.ref.current)
				.then((canLoadReally) => new Promise((res, rej) => {
					if (trackObj.ref.current.src) {
						trackObj.ref.current.oncanplay = trackLoadHandler(res, trackObj, canLoadReally)
					} else {
						res();
					}
				}));
		}

		function setMixdownSrc(blob) {
			setMixdownBlob(blob);
			var mixdownUrl = URL.createObjectURL(blob);
			mixdownRef.current.oncanplay = () => setMixdownLoaded(true);
			mixdownRef.current.onerror = (err) => console.error(err);
			mixdownRef.current.src = mixdownUrl;
			mixdownRef.current.load();
		}

		function prepRec(raw) {

			// filter out initial undefined default value
			const tracksArray = raw.filter((a) => a !== undefined);

		    let durationOfLongestBufferInSeconds = Math.max.apply(Math, tracksArray.map(([buf, dur]) => dur));
		    if (durationOfLongestBufferInSeconds <= 0) durationOfLongestBufferInSeconds = 300; // default to 5 min
	    	offlineAudioContext = new OfflineAudioContext(2, durationOfLongestBufferInSeconds * 44100, 44100); // length is duration in seconds * sample rate

	    	function wireTrackToOfflineCtx([buffer]) {
	    		function addAsSourceToOfflineCtx(sourceBuffer) {
					var source = offlineAudioContext.createBufferSource();
					source.buffer = sourceBuffer;
					source.connect(offlineAudioContext.destination);
					return source.start()
				};
				return mainAudioCtx.decodeAudioData(buffer).then(addAsSourceToOfflineCtx)
	    	}

	    	function startRecording(backingTrackBuf) {
				return new Promise((resolve) => {
					var mix = mainAudioCtx.createBufferSource();
					mix.buffer = backingTrackBuf;
					mix.connect(mainAudioCtx.destination);
					mix.connect(outputMixDestination);
					// Add in recording stream with mixdown
					const inputSource = mainAudioCtx.createMediaStreamSource(stream);
					inputSource.connect(outputMixDestination);
					recorder = new MediaRecorder(outputMixDestination.stream);
					recorder.start(0);
					mix.start(0);
					// also record track individually
					record(stream);
					setRecordingMedia([mix, recorder]);
					recorder.ondataavailable = (event) => chunks.push(event.data);
					recorder.onstop = (event) => resolve(new Blob(chunks,  { "type": "audio/mpeg; codecs=opus" }));
				})
	    	}

			return Promise.all(tracksArray.map(wireTrackToOfflineCtx))
					.then(() => offlineAudioContext.startRendering())
					.then(startRecording)
					.then(setMixdownSrc)
					.catch((e) => console.error(e))
		}

		Promise.all(recordedTracks.map(get)).then(prepRec).catch((e) => console.log(e));
	}

	useEffect(() => {
		if (isRecording) {
			navigator.mediaDevices
				.getUserMedia({ audio:true })
				.then((stream) => rollTape(stream, individualTracks))
		} else if (rec) {
			rec.stop();
			recordingMedia.forEach((node) => node.stop());
			setRecordingMedia([]);
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
		if (isActive && props.song && individualTracks.length === 0) {
			getAccessToken((token) => {
				fetchDriveFileBlob(props.song, token).then((blob) => {
					setIndividualTracks([{ref: backingTrackRef, src: URL.createObjectURL(blob)}]);
				});
			});
		}
	}, [isActive]);

	return (
		<Box>
			<Tape id={'recorder'} sources={[{ref: mixdownRef}, ...individualTracks]} />
			<Button 
				variant="outlined" 
				onClick={handleOpen}
				style={{...buttonStyle, backgroundColor: 'black', ...props.buttonStyleOverride}}
			>
				<KeyboardVoiceIcon sx={{ color: 'red' }}/>
			</Button>
			<Dialog
			  open={open}
			  onClose={handleClose}
			  aria-labelledby="modal-modal-title"
			  aria-describedby="modal-modal-description"
			>	 
	        <DialogTitle sx={{ 
	        	paddingBottom: '8px', 
	        	color: isRecording ? 'red' : 'black', 
	        	alignItems: 'center', 
	        	display: 'flex' 
	        }}>
	        	<RadioButtonCheckedOutlinedIcon /><p style={{ paddingLeft: '10px' }}>REC</p>
	        	{ (!isSaving && !isRecording) && <Button onClick={handleClear} style={{...buttonStyle, marginLeft: '100px'}}>Reset</Button> }
	    	</DialogTitle>
			<DialogContent sx={{ paddingBottom: '0px' }}>
				{
					error
					?
					<DialogContentText sx={{ color: 'red' }}>
						{ error !== '' && error }
					</DialogContentText>
					:
					<DialogContentText>
						{ props.size - blobs.length } tracks left
					</DialogContentText>
				}
				<Box sx={{ marginTop: '10px' }}>
					<TextField required id="folder-name" label="Folder name" variant="outlined" value={folderName} onChange={(e) => setFolderName(e.target.value)} sx={{width: '100%', marginBottom: '10px'}}/>
					<TextField required id="playlist-name" label="Song name" variant="outlined" value={songName} onChange={(e) => setSongName(e.target.value)} sx={{width: '100%', marginBottom: '10px'}}/>
					<TextField required id="artist-name" label="Artist name" variant="outlined" value={artistName} onChange={(e) => setArtistName(e.target.value)} sx={{width: '100%', marginBottom: '10px'}}/>
				</Box>
			</DialogContent>
	    	{
	    		isSaving || (props.song && individualTracks.length === 0)
	    		?
			    <Box sx={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap'}}>
				    <CircularProgress sx={{ color: 'black', width: '100%', marginBottom: '18px' }}/>
			    </Box>
	    		:
				<DialogActions>
				<ButtonGroup>
					{
						!isRecording
						&&
						<div>
						<Button onClick={toggleIsPlaying} style={buttonStyle}>{ isPlaying ? <StopOutlinedIcon /> : <PlayArrowOutlinedIcon /> }</Button>
						<Button onClick={save} style={buttonStyle}>Save</Button>
						</div>
					}
					{ (startButtonEnabled && trackNumber < props.size) && <Button onClick={handleStartRecording} style={{...buttonStyle, backgroundColor: 'black', color: 'white'}}><RadioButtonUncheckedOutlinedIcon sx={{ color: 'red' }}/></Button> }
					{ stopButtonEnabled && <Button onClick={handleStopRecording} style={{...buttonStyle, backgroundColor: 'black', color: 'white'}}><RadioButtonCheckedOutlinedIcon sx={{ color: 'red' }}/></Button> }
					<Button onClick={handleClose} style={buttonStyle}>X</Button>
				</ButtonGroup>
				</DialogActions>	    		
	    	}    
			</Dialog>
		</Box>
	);
}

export default AudioRecorder;
