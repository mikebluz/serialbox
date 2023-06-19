ToDos

Record
- Figure out why recording truncates the record length (playback starts later and stops earlier than it should) on Overdub only
- Add digital time display to recorder
- Add "select audio source" option when recording if possible (internal laptop mic is garbage)
- Prove out Recording functionality with recordings that are minutes long (what happens when phone screen goes to sleep?)
- Add ability to mix track levels during record (raise and lower individual track levels)

Playlist player
- Add ability to delete playlists/songs
- Add ability to play multiple tracks in a playlist at once (mixer mode)
- Current app allows multiple playlists of same name for same user -- append a "-{timestamp}" if duplicate or disallow?
- Add playlist "type", e.g., format, Tape (60min/90min), Vinyl (2 sides, N min each side), cd (45min/79min)

Messaging/Comments/Notifications
- Comments (on songs/playlists) and notifications (e.g., someone has shared a playlist with you, or commented on your song/playlist)
- Direct/Group messaging
    - Make tables
    - Add API calls
    - UI

UX
- Add user settings table
    - Add ability to set color scheme for app

Performance/Tech Debt
- Add pagination where it makes sense (all songs, etc.)
- Change persistence layer to being event-based
- Add React Router
