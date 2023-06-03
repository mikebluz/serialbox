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
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Tape from './tape.js';
import {getCorrectDuration} from '../helpers.js';

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
	const [isSaving, setIsSaving] = useState(false);

	// Buttons
	const [startButtonEnabled, setStartButtonEnabled] = useState(true);
	const [stopButtonEnabled, setStopButtonEnabled] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		handleClear();
	};

	const handleClear = () => {
		setBlobs([]);
		setTrackNumber(0);
		setError('');
		setFolderName('');
		setSongName('');
		setArtistName('');
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
		if (songName === '' || artistName === '' || folderName === '') {
			setError('Must provide a folder name, song name, and artist name to save.');
			return;
		}
		setIsSaving(true);
		Promise.all(blobs.map(async (blob, i) => {
			const trackName = `${songName}-track${i+1}.mp3`;
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
		})).then(() => {
			setError("Saved!");
			setIsSaving(false);
			setTimeout(() => setError(''), 2000);
		});
	}

	const rollPlayback = () => {
		// console.log("rolling playback")
		recordRef.current.play();
		// refs
		// 	.filter((ref) => ref.current !== undefined)
		// 	.map((ref) => {
		// 		ref.current.load();
		// 		ref.current.play();
		// 	});
	}

	const stopPlayback = () => {
		// refs
		// 	.filter((ref) => ref.current !== undefined)
		// 	.map((ref) => {
		// 		ref.current.pause();
		// 	});
		recordRef.current.pause();
	}

	const toggleIsPlaying = () => {
		setIsPlaying(!isPlaying);
	}

	// ToDo: fully convert to Async/Await
	const mixdownTracks = (sources) => {

		// ToDo: show loading spinner

		let start;
		var description = "mixdown";
		var offlineAudioContext;
		var recorder;
		var chunks = [];
		var audioContext = new AudioContext();
		var mixedAudio = audioContext.createMediaStreamDestination();

		const handler = (res, t, canLoadReally) => async () => {
			if (canLoadReally) {
				const response = await fetch(t.src)
				const buf = await response.arrayBuffer();
				res([buf, t.ref.current.duration])
			}
		};

		function get(trackObj) {
			return getCorrectDuration(trackObj.ref.current)
				.then((canLoadReally) => new Promise((res, rej) => trackObj.ref.current.oncanplay = handler(res, trackObj, canLoadReally)));
		}

		function stopMix(durationInMs, ...media) {
			setTimeout((media) => {
				media.forEach((node) => {
					console.log('stopping mixdown', node);
					node.stop()
				});
			}, durationInMs, media)
		}

		Promise.all(sources.map(get)).then((tracksArray) => {
		    let durationOfLongestBufferInSeconds = Math.max.apply(Math, tracksArray.map(([buf, dur]) => dur));
	    	offlineAudioContext = new OfflineAudioContext(2, durationOfLongestBufferInSeconds * 44100, 44100); // length is duration in seconds * sample rate
			return Promise.all(tracksArray.map(([buffer]) => {
				return audioContext.decodeAudioData(buffer).then((sourceBuffer) => {
					var source = offlineAudioContext.createBufferSource();
					source.buffer = sourceBuffer;
					source.connect(offlineAudioContext.destination);
					return source.start()
				})
			})).then(() => offlineAudioContext.startRendering()).then((renderedBuffer) => {
				return new Promise((resolve) => {
					var mix = audioContext.createBufferSource();
					mix.buffer = renderedBuffer;
					// mix.connect(audio.destination);
					mix.connect(mixedAudio);          
					recorder = new MediaRecorder(mixedAudio.stream);
					console.log("Starting mixdown");
					start = new Date();
					recorder.start(0);
					mix.start(0);
					stopMix(durationOfLongestBufferInSeconds * 1000, mix, recorder)
					recorder.ondataavailable = (event) => {
						chunks.push(event.data);
					};
					recorder.onstop = (event) => {
						var blob = new Blob(chunks,  {
						  "type": "audio/mpeg; codecs=opus"
						});
						console.log("mixdown complete ... how long mixdown took", new Date() - start)
						resolve(blob)
					};
				})
			}).then((blob) => {
				var mixdownUrl = URL.createObjectURL(blob);
				recordRef.current.oncanplay = () => {
					console.log("mixdown loaded")
				};
				recordRef.current.onerror = (err) => console.error(err);
				recordRef.current.onended = () => console.log('MIXDOWN DONE PLAYING');
				recordRef.current.src = mixdownUrl;
				recordRef.current.load();
				// recordRef.current.play();
			}).catch((e) => console.error(e))
		}).catch((e) => {
			console.log(e)
		});
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

	useEffect(() => {
		if (tape.length > 0) {
			mixdownTracks(tape);			
		}
	}, [tape])

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
	        <DialogTitle sx={{ paddingBottom: '8px', color: isRecording ? 'red' : 'black' }}>
	        	<RadioButtonCheckedOutlinedIcon /> REC
				<Button onClick={handleClear} style={{...buttonStyle, marginLeft: '100px'}}>Reset</Button>
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
	    		isSaving
	    		?
			    <Box sx={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap'}}>
				    <CircularProgress sx={{ color: 'black', width: '100%', marginBottom: '18px' }}/>
			    </Box>
	    		:
				<DialogActions>
				<ButtonGroup>
					<Button onClick={toggleIsPlaying} style={buttonStyle}>{ isPlaying ? <StopOutlinedIcon /> : <PlayArrowOutlinedIcon /> }</Button>
					<Button onClick={save} style={buttonStyle}>Save</Button>
					{ (startButtonEnabled && trackNumber < props.size) && <Button onClick={handleStartRecording} style={{...buttonStyle, backgroundColor: 'black', color: 'white'}}><RadioButtonUncheckedOutlinedIcon sx={{ color: 'red' }}/></Button> }
					{ stopButtonEnabled && <Button onClick={handleStopRecording} style={{...buttonStyle, backgroundColor: 'black', color: 'white'}}><RadioButtonCheckedOutlinedIcon sx={{ color: 'red' }}/></Button> }
					<Button onClick={handleClose} style={buttonStyle}>X</Button>
				</ButtonGroup>
				</DialogActions>	    		
	    	}    
			</Dialog>
		</div>
	);
}

export default AudioRecorder;
