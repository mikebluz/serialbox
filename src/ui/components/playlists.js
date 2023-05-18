// return user playlists from DB
const Playlists = () => {
    return (<div id="playlists">
        <h1>Playlists</h1>
        {/* map over playlists */}
        <table className="playlistTable">
            <tbody>
                <th>Artist</th>
                <th>Song</th>
                <th>Length</th>
                {/* map over songs in playlist */}
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </tbody>
        </table>
    </div>
    )
}

export default Playlists;