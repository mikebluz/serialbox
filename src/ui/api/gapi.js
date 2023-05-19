import { parseJwt } from '../helpers.js';
import axios from 'axios';

const CLIENT_ID = `${process.env.REACT_APP_GAPI_CLIENT_ID}.apps.googleusercontent.com`;
const GAPI_HOST = 'https://www.googleapis.com'

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
	const res = await fetch(`${GAPI_HOST}/oauth2/v1/tokeninfo?access_token=${getToken()}`)
	const json = await res.json();
	return json['expires_in'] > 0;
}

export async function getAccessToken(callback) {
	// ToDo: tokenIsValid throws if invalid, add better exception handling
	const valid = await tokenIsValid();
	if (!getToken() || !valid) {
		const client = window.google.accounts.oauth2.initTokenClient({
			client_id: CLIENT_ID,
			scope: 'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.readonly',
			// This callback is for calls on the client, i.e., requestAccessToken below
			callback: (res) => {
				const token = res.access_token;
				saveToken(token);
				callback(token);
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
const audioFileMimeTypes = [
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
	// ToDo: change to Map<folderName, files[]>() ?
	const files = [];
  	for (let i = 0; i < folders.length; i++) {
  		const q = `'${folders[i].id}' in parents`;
		const f = await axios.get(`${GAPI_HOST}/drive/v3/files?pageSize=100&fields=files(id,name,mimeType)&q=${q}`, {
			headers: {
				"Authorization": `Bearer ${accessToken}`
			}
		});
		files.push(...f.data.files.filter((file) => audioFileMimeTypes.includes(file.mimeType)));
  	}
  	return files;
}

export async function fetchDriveFile(metadata) {
	const fileRes = await axios.get(`${GAPI_HOST}/drive/v3/files?fileId=${metadata.id}&alt=media`, {
		headers: {
			"Authorization": `Bearer ${accessToken}`
		}
	});
	const dataArr = Uint8Array.from(fileRes.body.split('').map((chr) => chr.charCodeAt(0)));
	return new File([dataArr], metadata.name, { type: metadata.mimeType });
}