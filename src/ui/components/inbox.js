import Grid from '@mui/material/Grid';

import {threadStyle} from '../styles/styles.js';

const Inbox = (props) => {
	return (
		<Grid container sx={{ padding: '4px', border: '2px solid black', height: '40vh', overflow: 'auto', borderRadius: '10px' }}>
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