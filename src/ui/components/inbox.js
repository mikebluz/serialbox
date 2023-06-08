import { useEffect, useState, useRef } from 'react';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';

import {buttonStyle, neonGreen, threadStyle} from '../styles/styles.js';

const Inbox = (props) => {

	const [message, setMessage] = useState('');

	const handleSendMessage = () => {
		console.log(message, props.user)
	}

	return (
		<Grid container sx={{ padding: '4px', border: '2px solid black', height: '40vh', overflow: 'auto', borderRadius: '10px' }}>
		<Grid item xs={12} md={12}>
			<TextField label={'Send a message'} multiline rows={4} onChange={(e) => setMessage(e.target.value)} />
			<Button onClick={handleSendMessage}>Send</Button>
		</Grid>
		{
			props.threads.map((thread) => (
				<Grid item xs={12} md={12} sx={threadStyle}>
					{thread.name}
				</Grid>
			))
		}
		</Grid>
	)
}

export default Inbox;