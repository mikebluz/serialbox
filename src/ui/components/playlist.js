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
		console.log('song selected', i);
		props.setTrackLoaded(false);
    	props.toggleIsPlaying();
		props.handleChangeTrack(i)
	}
	
	return (
		<div style={{ width: '90vw' }}>
			<Container sx={{ width: '100%', border: '5px solid black', padding: '12px', borderRadius: '12px', backgroundColor: 'white' }}>
			{
				props.playlist.map((song, i) => {
					return (
						<Box key={song.name + '-item'} sx={songStyle} onClick={() => handleSongClick(i)}>{song.name.split('.')[0]}</Box>
					)
				})
			}
			</Container>
		</div>
	)
	
};

export default Playlist;