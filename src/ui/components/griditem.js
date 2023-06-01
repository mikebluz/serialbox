import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

// ToDo: getting `Received 'true' for a non-boolean attribute 'x'` error logged in console after log in, I think it's related to this component
const GridItem = styled(Paper)(({ theme }) => {
	return ({
		backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
		...theme.typography.body2,
		padding: theme.spacing(1),
		textAlign: 'center',
		color: theme.palette.text.secondary,
	})
});

export default GridItem;