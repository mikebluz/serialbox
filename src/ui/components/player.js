import {useState} from 'react';
import ArrowRightOutlinedIcon from '@mui/icons-material/ArrowRightOutlined';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';
import SkipPreviousOutlinedIcon from '@mui/icons-material/SkipPreviousOutlined';

const Player = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(50);
    const [track, setTrack] = useState(undefined);
    const [audioNode, setAudioNode] = useState(new Audio());

    const handleSetVolume = (e) => {
        console.log("volume changed", e.target.value);
        setVolume(e.target.value);
    };

    return (
        <div>
            <ButtonGroup variant="contained" aria-label="outlined button group">
                <Button className="prev-track" onClick={() => console.log("PREVIOUS")}>
                  <SkipPreviousOutlinedIcon />
                </Button>
                <Button id="track-art" className="playpause-track" onClick={() => console.log("PLAY")}>
                    <ArrowRightOutlinedIcon />
                </Button>
                <Button className="next-track" onClick={() => console.log("NEXT")}>
                  <SkipNextOutlinedIcon />
                </Button>
            </ButtonGroup>
            <Box sx={{ width: 200 }}>
                <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center">
                    <VolumeDown />
                    <Slider aria-label="Volume" value={volume} onChange={handleSetVolume} />
                    <VolumeUp />
                </Stack>
                <Slider defaultValue={50} aria-label="Default" valueLabelDisplay="auto" />
            </Box>
        </div>
    )
}

export default Player;