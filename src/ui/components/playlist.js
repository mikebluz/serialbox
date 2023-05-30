import {useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

import ArrowDropDownOutlinedIcon from '@mui/icons-material/ArrowDropDownOutlined';
import ArrowDropUpOutlinedIcon from '@mui/icons-material/ArrowDropUpOutlined';

import GridItem from './griditem.js';

import {
  buttonStyle, 
  componentDisplayStyle, 
  gridBlockStyle,
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
						<Grid 
							container
							key={(song.gDriveId !== undefined ? song.gDriveId : song.id) + '-item'} 
							sx={{...songStyle, padding: '5px', marginLeft: '0'}} 
							onClick={() => handleSongClick(i)}
						>
					        <Grid item xs={6.5} md={6.5} sx={gridBlockStyle}>
								{song.name.split('.')[0]}
					        </Grid>
					        <Grid item xs={2} md={2} sx={{ ...gridBlockStyle, margin: '0 10px 0 0' }}>
					        	<Button 
					        		sx={{ 
						        		buttonStyle, 
						        		backgroundColor: neonGreen, 
						        		color: 'black', 
						        		border: '2px solid black'
						        	}}
						        	onClick={() => console.log('whatever')}
					        	>
					        		Edit
				        		</Button>
					        </Grid>
					        <Grid item xs={2} md={2} sx={{ ...gridBlockStyle, marginRight: '0px', marginTop: '8px' }}>
								<ArrowDropUpOutlinedIcon onClick={() => props.changeSongOrder(-i)}/>
								<ArrowDropDownOutlinedIcon onClick={() => props.changeSongOrder(i)}/>
					        </Grid>
						</Grid>
					)
				})
			}
		</Box>
	)
	
};

export default Playlist;