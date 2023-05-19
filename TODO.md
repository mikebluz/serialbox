    /** 
     * ToDos
     * 

     Backend API needs auth

     * Load (Data Query bootstrap) Component: 
     * 3. Save playlist and songs in db
     *    - We many have to start small here and start with one user per playlist,
     *      but it would be cool eventually to have many users, so have the ability to share a playlist with another user, form
     *      that would accept a gmail (the person you want to share with) and then automatically give that gmail access to the files
     *      and add the new User to Playlist relation in the db.
     * 4. Render Playlist component and display Songs for this playlist.
     * 5. Allow user to play, etc.
     * 
     * Playlist component:
     * 1. Need an audio player with play, pause, stop, track change, track jump, repeat, loop (loop sections of song you can set via the progress bar), shuffle (but 
     *    that should be integrated with the same Shuffle button), volume control, progress slider/skipper.
     * 2. Play component needs to load the track from google (drive API call to get file with alt: 'media' option)
     *    and should use Web Audio component to play.
     * 
     * Shuffle component:
     * 1. Button that modifies state property "playlist", which has all the currently loaded songs.
     * 2. On press: stop playing if playing, do quick random sort on the playlist, queue up first track.
     * 
     * Messaging subsystem:
     * 1. Notifications (someone has shared a playlist with you)
     * 2. Direct/Group messaging
     **/