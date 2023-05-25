  const PlayerControls = () => {

    const handleRepeat = () => {
      trackRef.current.loop = !repeat;
      setRepeat(!repeat);
      if (!repeat) {
          clearInterval(loopInterval);
      }
    }

    const handleSetLoopStart = () => {
      const start = trackRef.current.currentTime;
      setLoopStart(start);
    }

    const handleSetLoopEnd = () => {
      const end = trackRef.current.currentTime;
      setLoopEnd(end);
    }

    const handleClearLoopInterval = () => {
      clearInterval(loopInterval);
      setLoopStart(0);
      setLoopEnd(trackRef.current.duration);
      setRepeat(false);
    }

    return (
      <Box sx={{ width: '100%' }}>
        <ButtonGroup variant="contained" aria-label="outlined button group" size="large" sx={buttonGroupStyle}>
            <Button
              className="prev-track" 
              onClick={previousSong} 
              sx={{...playerButtonStyle, width: '100%'}}
            >
              <SkipPreviousOutlinedIcon />
            </Button>
            <Button 
              className="playpause-track" 
              onClick={handlePlayPauseClick} 
              sx={{...playerButtonStyle, width: '100%'}}
            >
                {
                    isPlaying
                    ?
                    <PauseOutlinedIcon />
                    :
                    <PlayArrowOutlinedIcon />
                }
            </Button>
            <Button 
              className="next-track" 
              onClick={nextSong} 
              sx={{...playerButtonStyle, width: '100%'}}
            >
              <SkipNextOutlinedIcon />
            </Button>
            <Button 
              className="repeat-btn" 
              onClick={handleRepeat} 
              sx={{...playerButtonStyle, width: '100%', backgroundColor: repeat ? 'grey' : 'black'}}
            >
              <RepeatOutlinedIcon />
            </Button>
        </ButtonGroup>
        {
          repeat
          &&
          <ButtonGroup variant="contained" aria-label="outlined button group" size="small" sx={buttonGroupStyle}>
            <Button 
              className="loop-start-btn" 
              onClick={handleSetLoopStart} 
              sx={{...playerButtonStyle, width: '100%' }}
            >
              <p>Start</p>
            </Button>
            <Button 
              className="loop-end-btn" 
              onClick={handleSetLoopEnd} 
              sx={{...playerButtonStyle, width: '100%' }}
            >
              <p>End</p>
            </Button>
            <Button 
              className="loop-end-btn" 
              onClick={handleClearLoopInterval} 
              sx={{...playerButtonStyle, width: '100%' }}
            >
              <p>Clear</p>
            </Button>
          </ButtonGroup>
        }
        <ProgressController trackRef={trackRef} />
        <VolumeSlider />
      </Box>
    )
  }