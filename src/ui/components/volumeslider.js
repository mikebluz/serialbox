import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';

const VolumeSlider = (props) => {
  const [value, setValue] = useState(100);

  const handleChange = (event, newValue) => {
    props.trackRef.current.volume = newValue / 100;
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '90vw', color: 'black' }}>
      <Stack spacing={2} direction="row" alignItems="center">
        <VolumeDown />
        <Slider aria-label="Volume" value={value} onChange={handleChange} sx={{ color: '#2c97e8' }} />
        <VolumeUp />
      </Stack>
    </Box>
  );
}

export default VolumeSlider;