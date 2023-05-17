/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = '327113425825-1bks3c0enr2eko3m0lmaibtj24kheu77.apps.googleusercontent.com';
const API_KEY = 'AIzaSyAnkmNv3jHjtSnkLi499bOOf2BW1u8ii9w';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById('reset-btn').style.visibility = 'hidden';
document.getElementById('signout_button').style.visibility = 'hidden';

let loginButton = document.getElementById('login-btn');
// let loadButton = document.getElementById('load-btn');

// Select all the elements in the HTML page
// and assign them to a variable 
let playpause_btn = document.querySelector(".playpause-track");
let next_btn = document.querySelector(".next-track");
let prev_btn = document.querySelector(".prev-track");
 
let seek_slider = document.querySelector(".seek_slider");
let volume_slider = document.querySelector(".volume_slider");
let curr_time = document.querySelector(".current-time");
let total_duration = document.querySelector(".total-duration");
 
// Specify globally used values
let track_index = 0;
let isPlaying = false;
let updateTimer;

let originalPlaylist;
let playlist;
let currentTrackFile;
let curr_track;
let folder;
let artist;
let albumArt;

function initAudio(url) {
  if (!url) {
    curr_track = undefined;
  }
  if (curr_track) {
    curr_track.src = url;
  } else {
    curr_track = new Audio(url);    
  }
  curr_track.load();
  curr_track.onended = async function () {
    track_index++;
    pauseTrack();
    if (track_index < playlist.length) {
      await loadTrack();
      playTrack();
    } else {
      track_index = 0;
      await loadTrack();
      populateMarquee('Click on the image to start listening!');
    }
  };
}

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById('login-btn').style.visibility = 'visible';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw (resp);
    }
    showLoader('load');
  };

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({prompt: 'consent'});
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({prompt: ''});
  }
}

async function handleLoad() {
  folder = document.getElementById('input-folder').value;
  artist = document.getElementById('input-artist').value;
  if (!folder || !artist) {
    return;
  };
  clearLoader();
  populateMarquee('Loading ...');
  await loadPlaylist(folder);
  await loadTrack(track_index);
  document.getElementById('track-details').style.visibility = 'visible';
  document.getElementById('reset-btn').style.visibility = 'visible';
  document.getElementById('signout_button').style.visibility = 'visible';
  populateMarquee('Click on the image to start listening!');
}

function showLoader(loginOrLoad) {
  const parent = clearLoader(); 

  if (loginOrLoad === 'load') {
    const inputs = document.createElement('div');
    inputs.id = 'inputs';

    const folderInput = document.createElement('input');
    folderInput.id = 'input-folder';
    folderInput.className = 'input';
    folderInput.placeholder = 'Folder';

    const artistInput = document.createElement('input');
    artistInput.id = 'input-artist';
    artistInput.className = 'input';
    artistInput.placeholder = 'Artist';
    
    inputs.append(folderInput, artistInput);

    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'button-div';

    const button = document.createElement('button');
    button.className = 'button-op';
    button.id = 'load-btn';
    button.onclick = handleLoad;
    button.textContent = 'Load';
    
    buttonDiv.append(button);

    parent.append(inputs, buttonDiv);
  }
  if (loginOrLoad === 'login') {
    const buttonDiv = document.createElement('div');
    buttonDiv.className = 'button-div';

    const button = document.createElement('button');
    button.className = 'button-op';
    button.id = 'login-btn';
    button.onclick = handleAuthClick;
    button.textContent = 'Log In';
    
    buttonDiv.append(button);

    parent.append(buttonDiv);
  }
}

function clearLoader() {
  const parent = document.getElementById('loader'); 
  while(parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
  return parent;
}

function showShuffleButton() {
  const parent = document.getElementById("shuffle");
  const shuffleButton = document.createElement("shuffle-btn");
  shuffleButton.className = 'button-op';
  shuffleButton.id = 'shuffle-btn';
  shuffleButton.onclick = shuffle;
  shuffleButton.textContent = 'Shuffle';
  parent.append(shuffleButton);
}

function clearShuffleButton() {
  const parent = document.getElementById("shuffle");
  while(parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
  return parent;
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
  }
  reset();
  showLoader('login');
}

/**
 * Print metadata for first 10 files.
 */
async function loadPlaylist(folder) {
  const q = `name contains '${folder}'`;

  let folderRes;
  try {
    folderRes = await gapi.client.drive.files.list({
      'pageSize': 1,
      'fields': 'files(id, name)',
      'q': q,
    });
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }

  let response;
  try {
    response = await gapi.client.drive.files.list({
      'pageSize': 100,
      'fields': 'files(id, name, mimeType)',
      'q': `'${folderRes.result.files[0].id}' in parents`,
    });
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }

  let albumArtFileMetadata = response.result.files.filter((file) => file.mimeType.includes('image'))[0];
  albumArt = await fetchFile(albumArtFileMetadata);

  playlist = response.result.files.filter((file) => {
    return file.mimeType === 'audio/mpeg' 
      || file.mimeType === 'audio/mp4' 
      || file.mimeType === 'audio/x-m4a' 
      || file.mimeType === 'audio/m4a';
  });
  originalPlaylist = playlist;
  if (!playlist || playlist.length == 0) {
    document.getElementById('content').innerText = 'No files found.';
    return;
  }

  displayPlaylist();
}

function displayPlaylist() {
  const playlistElement = document.createElement('div');
  playlistElement.className = 'playlist';
  document.getElementById('content').innerHTML = '';
  document.getElementById('content').append(playlistElement);
  playlist.forEach(async (file, i) => {
    const track = document.createElement("p");
    track.innerText = `${i+1}. ${formatTrackName(file.name)}`;
    track.className = 'playlist-track';
    track.onclick = () => jumpToTrack(i);
    playlistElement.append(track);
  });
  showShuffleButton();
}

function populateMarquee(text) {
  const detail = document.getElementById('track-details');
  const display = document.getElementById('track-info');
  display.remove();
  const trackInfo = document.createElement('div');
  trackInfo.id = 'track-info';
  trackInfo.textContent = text;
  detail.append(trackInfo);
}

async function jumpToTrack(index) {
  populateMarquee("Loading ...");
  pauseTrack();
  track_index = index;
  await loadTrack();
  playOrPauseTrack();
}

async function loadTrack() {
  clearInterval(updateTimer);
  resetSliderValues();

  if (track_index === playlist.length) {
    track_index = 0;
  }

  currentTrackFile = playlist[track_index];

  console.log("Loading track", currentTrackFile, track_index, playlist);
 
  let track;
  try {
    track = await fetchFile(currentTrackFile);
  } catch (err) {
    console.error(err);
    document.getElementById('content').innerText = err.message;
    return;
  }

  console.log(`Track loaded: ${currentTrackFile.name}`, track);

  initAudio(URL.createObjectURL(track));

  if (albumArt) {
    playpause_btn.style.backgroundImage = "url(" + URL.createObjectURL(albumArt) + ")";
  }
 
  updateTimer = setInterval(seekUpdate, 1000);
}

function formatTrackName(trackName) {
  return trackName.split('.')[0].split(' ').map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1); 
  }).join(' ')
}

function reset() {
  pauseTrack();
  clearInterval(updateTimer);
  initAudio();
  resetSliderValues();
  document.getElementById('content').innerText = '';
  document.getElementById('reset-btn').style.visibility = 'hidden';
  document.getElementById('signout_button').style.visibility = 'visible';
  originalPlaylist = undefined;
  playlist = undefined;
  const details = document.getElementById('track-details');
  const trackInfo = document.getElementById('track-info');
  trackInfo.remove();
  const display = document.createElement('marquee');
  display.id = 'track-info';
  display.behavior = 'scroll';
  display.direction = 'left';
  display.scrollamount = '12';
  display.textContent = 'Enter a Google Drive folder name to load some tracks ... Enter an Artist name to apply to all tracks ... Listen to demos and try out some project names!';
  details.append(display);
  playpause_btn.style.backgroundImage = "url('http://mercywizard.com/sugarchex.webp')";
  clearShuffleButton();
  showLoader('load');
}
 
// Function to reset all values to their default
function resetSliderValues() {
  curr_time.textContent = "00:00";
  total_duration.textContent = "00:00";
  seek_slider.value = 0;
}

async function fetchFile(metadata) {
  let fileRes;
  try {
    fileRes = await gapi.client.drive.files.get({
      fileId: metadata.id,
      alt: 'media'
    });
    const dataArr = Uint8Array.from(fileRes.body.split('').map((chr) => chr.charCodeAt(0)));
    return new File([dataArr], metadata.name, { type: metadata.mimeType });
  } catch (err) {
    document.getElementById('content').innerText = err.message;
    return;
  }
}

function playOrPauseTrack() {
  if (!isPlaying) playTrack();
  else pauseTrack();
}
 
function playTrack() {
  curr_track.play();
  populateMarquee(`${formatTrackName(currentTrackFile.name)} - ${artist}`);
  isPlaying = true;
}
 
function pauseTrack() {
  // Pause the loaded track
  curr_track.pause();
  isPlaying = false;
}

async function navTrack(direction) {
  if (!curr_track || !playlist) return;
  populateMarquee("Loading ...");
  pauseTrack();
  if (direction) {
    // forward
    if (track_index === playlist.length - 1) {
      track_index = 0
    } else {
      track_index += 1 
    }
  } else {
    // backward
    if (track_index === 0) {
      track_index = playlist.length - 1
    } else {
      track_index -= 1 
    }
  }
  // Load and play the new track
  await loadTrack();
  playOrPauseTrack();
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

async function shuffle() {
  populateMarquee("Loading ...");
  pauseTrack();
  const newPlaylist = [];
  while (newPlaylist.length < originalPlaylist.length) {
    let i = getRandomInt(playlist.length - 1);
    const nextTrack = playlist[i];
    newPlaylist.push(playlist[i]);
    playlist = [...playlist.slice(0, i), ...playlist.slice(i + 1, playlist.length)];
  }
  playlist = newPlaylist;
  displayPlaylist();
  track_index = 0;
  await loadTrack();
  playOrPauseTrack();
}

function seekTo() {
  // Calculate the seek position by the
  // percentage of the seek slider
  // and get the relative duration to the track
  seekto = curr_track.duration * (seek_slider.value / 100);
 
  // Set the current track position to the calculated seek position
  curr_track.currentTime = seekto;
}
 
function setVolume() {
  // Set the volume according to the
  // percentage of the volume slider set
  curr_track.volume = volume_slider.value / 100;
}
 
function seekUpdate() {
  let seekPosition = 0;
 
  // Check if the current track duration is a legible number
  if (!isNaN(curr_track.duration)) {
    seekPosition = curr_track.currentTime * (100 / curr_track.duration);
    seek_slider.value = seekPosition;
 
    // Calculate the time left and the total duration
    let currentMinutes = Math.floor(curr_track.currentTime / 60);
    let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
    let durationMinutes = Math.floor(curr_track.duration / 60);
    let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);
 
    // Add a zero to the single digit time values
    if (currentSeconds < 10) { currentSeconds = "0" + currentSeconds; }
    if (durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
    if (currentMinutes < 10) { currentMinutes = "0" + currentMinutes; }
    if (durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }
 
    // Display the updated duration
    curr_time.textContent = currentMinutes + ":" + currentSeconds;
    total_duration.textContent = durationMinutes + ":" + durationSeconds;
  }
}