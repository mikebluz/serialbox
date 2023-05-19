import { parseJwt } from '../helpers.js';
import axios from 'axios';

const CLIENT_ID = `${process.env.REACT_APP_GAPI_CLIENT_ID}.apps.googleusercontent.com`;
const GAPI_HOST = 'https://www.googleapis.com'

export async function initGapi(resolve) {
	console.log("initializing google authentication")
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
async function saveToken(response) {
	console.log("saving access token", token);
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
		console.log("no token or token is expired, getting new token")
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
		console.log("requesting access token")
		client.requestAccessToken({prompt: 'consent'});
	} else {
		console.log("using existing token")
		callback(getToken());
	}
}

/**
 * 
 * DRIVE API CALLS
 * 
 * */
export async function fetchDriveFolders(name, accessToken) {
	const q = `name contains '${name}'`;
	const folderRes = await axios.get(`${GAPI_HOST}/drive/v3/files?pageSize=10&fields=files(id,name)&q=${q}`, {
		headers: {
			"Authorization": `Bearer ${accessToken}`
		}
	});
	return folderRes.data.files;
}

export async function fetchDriveFolderContents(folders, accessToken) {
	const files = [];
  	for (let i = 0; i < folders.length; i++) {
  		const q = `'${folders[i].id}' in parents`;
		const f = await axios.get(`${GAPI_HOST}/drive/v3/files?pageSize=100&fields=files(id,name,mimeType)&q=${q}`, {
			headers: {
				"Authorization": `Bearer ${accessToken}`
			}
		});
		files.push(...f.data.files);
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