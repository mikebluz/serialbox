import ArrowRightOutlinedIcon from '@mui/icons-material/ArrowRightOutlined';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import SkipNextOutlinedIcon from '@mui/icons-material/SkipNextOutlined';
import SkipPreviousOutlinedIcon from '@mui/icons-material/SkipPreviousOutlined';

const Player = () => {
    return (
        <div>
            <div id='track-details' className="details">
                <marquee id='track-info' behavior='scroll' direction='left' scrollamount='12'>Enter a Google Drive folder name to load some tracks ... Enter an Artist name to apply to all tracks ... Listen to demos and try out some project names!</marquee>
            </div>

            <div className="ctrl-buttons">
                <div className="prev-track" onClick={() => console.log("PREVIOUS")}>
                  <SkipPreviousOutlinedIcon />
                </div>
                <div id="track-art" className="playpause-track" onClick={() => console.log("PLAY")}>
                    <ArrowRightOutlinedIcon />
                </div>
                <div className="next-track" onClick={() => console.log("NEXT")}>
                  <SkipNextOutlinedIcon />
                </div>
            </div>

            <div className="slider_container">
                <div className="current-time">00:00</div>
                <input type="range" min="1" max="100"
                  value="0" className="seek_slider" onChange={() => console.log('Time slider')}/>
                <div className="total-duration">00:00</div>
            </div>

            <div className="slider_container">
                <i className="fa fa-volume-down"></i>
                <input type="range" min="1" max="100"
                  value="99" className="volume_slider" onChange={() => console.log('Volume slider')}/>
                <i className="fa fa-volume-up"></i>
            </div>
        </div>
    )
}

export default Player;