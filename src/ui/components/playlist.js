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
  songStyle,
} from '../styles/styles.js';

const Playlist = (props) => {
	const trackRef = props.trackRef;

	const handleSongClick = (i) => {
		props.setTrackLoaded(false);
    	if (props.isPlaying) props.toggleIsPlaying();
		props.handleChangeTrack(i)
	}
	
	return (
		<Box>
			<Container sx={{ width: '100%', border: '3px solid black', padding: '12px', borderRadius: '12px', backgroundColor: 'black' }}>
        	<marquee 
	          behavior='scroll' 
	          direction='left'
	          scrollamount='6' 
	          style={{ 
	            color: 'black', 
	            fontSize: '2em', 
	            color: '#39ff2b', 
	            fontFamily: 'courier' 
	          }}
	        >
				Playlist: {props.playlistName}
			</marquee>
			<Button         
				style={{...buttonStyle(false), width: '100%', backgroundColor: 'yellow'}}
				onClick={props.shuffle}
			>
				Shuffle
			</Button>
			</Container>
			{
				props.playlist.map((song, i) => {
					return (
						<Box key={song.gDriveId + '-item'} sx={songStyle} onClick={() => handleSongClick(i)}>{song.name.split('.')[0]}</Box>
					)
				})
			}
		</Box>
	)
	
};

export default Playlist;