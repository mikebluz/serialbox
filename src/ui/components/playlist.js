import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

import GridItem from './griditem.js';

import {
  buttonStyle, 
  componentDisplayStyle, 
  headerFooterStyle,
  neonGreen,
  songStyle,
} from '../styles/styles.js';

const Playlist = (props) => {
	const trackRef = props.trackRef;

	const handleSongClick = (i) => {
    	if (props.isPlaying) props.toggleIsPlaying();
		props.handleChangeTrack(i)
	}
	
	return (
		<Box>
			<Container sx={{ width: '100%', border: '3px solid black', padding: '12px', borderRadius: '12px', backgroundColor: 'black' }}>
        	<p 
	          style={{ 
	            color: 'black', 
	            color: '#39ff2b', 
	            fontFamily: 'courier',
	            padding: '0px 0px 10px 0px',
	            margin: '0px',
	            fontSize: '14pt'
	          }}
	        >
				Playlist: {props.playlistName}
			</p>
			<Button         
				style={{...buttonStyle, width: '100%', backgroundColor: 'yellow', color: 'black'}}
				onClick={props.shuffle}
			>
				Shuffle
			</Button>
			</Container>
			{
				props.playlist.map((song, i) => {
					return (
						<Box key={(song.gDriveId !== undefined ? song.gDriveId : song.id) + '-item'} sx={songStyle} onClick={() => handleSongClick(i)}>{song.name.split('.')[0]}</Box>
					)
				})
			}
		</Box>
	)
	
};

export default Playlist;