import axios from 'axios';

const CLIENT_ID = `${process.env.REACT_APP_GAPI_CLIENT_ID}.apps.googleusercontent.com`;
const GAPI_HOST = 'https://www.googleapis.com'
const GAPI_CONTENT_HOST = 'https://content.googleapis.com'

export async function initGapi(resolve) {
	window.google.accounts.id.initialize({
		client_id: CLIENT_ID,
		callback: (res) => resolve(parseJwt(res.credential)) // We get the googleUser from the JWT
	});
	window.google.accounts.id.prompt();
}

/**
 * 
 * TOKEN MANAGEMENT
 * 
 * */
// ToDo: use Refresh Tokens instead of Access Tokens
async function saveToken(token) {
	localStorage.setItem('access_token', token);
	return;
}

function getToken() {
	return localStorage.getItem('access_token');
}

async function tokenIsValid() {
	if (getToken()) {
		// ToDo: switch to axios
		const res = await fetch(`${GAPI_HOST}/oauth2/v1/tokeninfo?access_token=${getToken()}`);
		const json = await res.json();
		if (json.error) {
			console.error('error validating token:', json.error)
			return false;
		} else {
			return json['expires_in'] > 0;
		}
	} else {
		return false;
	}
}

export async function getAccessToken(callback) {
	const valid = await tokenIsValid();
	if (!getToken() || !valid) {
		const client = window.google.accounts.oauth2.initTokenClient({
			client_id: CLIENT_ID,
			scope: 'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.readonly',
			// This callback is for calls on the client, i.e., requestAccessToken below
			callback: (res) => {
				if (!res.error) {
					const token = res.access_token;
					saveToken(token);
					callback(token);
				} else {
					console.error(`Error encountered attempting to fetch access token: ${res.error}`);
				}
			},
		});
		client.requestAccessToken({prompt: 'consent'});
	} else {
		callback(getToken());
	}
}

/**
 * 
 * DRIVE API CALLS
 * 
 * */
// ToDo: determine what mimeTypes we want to allow (are lossless files too big?)
export const audioFileMimeTypes = [
	'audio/mpeg', 
	'audio/mp4', 
	'audio/x-m4a', 
	'audio/m4a'
];
export async function fetchDriveFolders(name, accessToken) {
	const q = `name contains '${name}'`;
	const folderRes = await axios.get(`${GAPI_HOST}/drive/v3/files?pageSize=10&fields=files(id,name,mimeType)&q=${q}`, {
		headers: {
			"Authorization": `Bearer ${accessToken}`
		}
	});
	return folderRes.data.files.filter((folder) => folder.mimeType === 'application/vnd.google-apps.folder');
}

export async function fetchDriveFolderContents(folders, accessToken) {
	const files = {};
  	for (let i = 0; i < folders.length; i++) {
  		let dir = folders[i];
  		const q = `'${dir.id}' in parents`;
		const f = await axios.get(`${GAPI_HOST}/drive/v3/files?pageSize=100&fields=files(id,name,mimeType)&q=${q}`, {
			headers: {
				"Authorization": `Bearer ${accessToken}`
			}
		});
		if (!files[dir.name]) {
			files[dir.name] = [];
		};
		files[dir.name].push(...f.data.files.filter((file) => audioFileMimeTypes.includes(file.mimeType)));
  	}
  	return files;
}

export async function fetchDriveFileBlob(metadata, accessToken) {
	// ToDo: switch to axios
	const fileRes = await fetch(`${GAPI_HOST}/drive/v3/files/${metadata.id}?alt=media`, {
		headers: {
			"Authorization": `Bearer ${accessToken}`,
		}
	})
	return await fileRes.blob();
}

export function parseJwt (token) {
	var base64Url = token.split('.')[1];
	var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
	    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
	}).join(''));

	return JSON.parse(jsonPayload);
}