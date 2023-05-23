import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

import {
  buttonStyle, 
  componentDisplayStyle, 
  headerFooterStyle
} from './styles/styles.js';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const AppGrid = (props) => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <Item>{ props.greeting() }</Item>
        </Grid>
        <Grid item xs={12} md={12}>
          <Item>{ props.options() }</Item>
        </Grid>
        <Grid item xs={12} md={12}>
          <Item>{ props.copyright() }</Item>
        </Grid>
        <Grid item xs={12} md={12}>
          <Item>{ props.player() }</Item>
        </Grid>
      </Grid>
    </Box>
  );
}

export default AppGrid;