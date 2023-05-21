// return all songs loaded from Drive as a table (from DB or directly from Drive load?)
// ToDo: Use material-ui table component
const AllSongs = () => {
    return (
        <div id="allSongs">
            <h1>All Songs</h1>
            <table className="allSongsTable">
                <tbody>
                    <th>Artist</th>
                    <th>Song</th>
                    <th>Length</th>
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

export default AllSongs;