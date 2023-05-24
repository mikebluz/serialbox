import {useState} from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

import GridItem from './griditem.js';

import {
  buttonStyle, 
  componentDisplayStyle, 
  headerFooterStyle,
  songStyle,
} from '../styles/styles.js';

const Playlist = (props) => {
	const trackRef = props.trackRef;

	const handleSongClick = (i) => {
		props.setTrackLoaded(false);
		console.log('isPlaying', props.isPlaying)
    	if (props.isPlaying) props.toggleIsPlaying();
		props.handleChangeTrack(i)
	}
	
	return (
		<Box>
			<Container sx={{ width: '100%', border: '3px solid black', padding: '12px', borderRadius: '12px', backgroundColor: 'white' }}>
			{
				props.playlist.map((song, i) => {
					return (
						<Box key={song.gDriveId + '-item'} sx={songStyle} onClick={() => handleSongClick(i)}>{song.name.split('.')[0]}</Box>
					)
				})
			}
			</Container>
		</Box>
	)
	
};

export default Playlist;