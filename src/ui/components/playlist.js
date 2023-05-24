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
	
	return (
		<div style={{ width: '90vw' }}>
		<Container sx={{ width: '100%' }}>
		{
			props.playlist.map((song) => {
				console.log('song', song);
				return (
					<Box key={song.name + '-item'} sx={songStyle}>{song.name.split('.')[0]}</Box>
				)
			})
		}
		</Container>
		</div>
	)
	
};

export default Playlist;