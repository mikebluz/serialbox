import { parseJwt } from '../helpers.js';

const CLIENT_ID = `${process.env.REACT_APP_GAPI_CLIENT_ID}.apps.googleusercontent.com`;

export async function initGapi(resolve) {
	console.log("initializing google authentication")
	window.google.accounts.id.initialize({
		client_id: CLIENT_ID,
		callback: (res) => resolve(parseJwt(res.credential))
	});
	window.google.accounts.id.prompt();
}

async function saveToken(response) {
	localStorage.setItem('access_token', response.access_token)
	return;
}

function getToken() {
	return localStorage.getItem('access_token');
}

export function initGapiTokenClient() {
	const client = window.google.accounts.oauth2.initTokenClient({
		client_id: CLIENT_ID,
		scope: 'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.readonly',
		// This callback is for calls on the client, i.e., requestAccessToken below
		callback: saveToken,
	});
	client.requestAccessToken({prompt: 'consent'});
}

async function fetchDriveFolderContents(folder) {
	const q = `name contains '${folder}'`;
	// Fetch folders that have this name
	let folders;
	try {
	  const folderRes = await this.drive.files.list({
	    'pageSize': 1,
	    'fields': 'files(id, name)',
	    'q': q,
	  });
	  folders = folderRes.result.files
	} catch (err) {
	  return this.handleDriveAPIError('Error fetching file', err);
	}
	// Fetch all files in all folders with this name
	let files = [];
	try {
	  for (let i = 0; i < folders.length; i++) {
	    const f = await this.drive.files.list({
	      'pageSize': 100,
	      'fields': 'files(id, name, mimeType)',
	      'q': `'${folders[i].id}' in parents`,
	    });
	    files.push(...f.result.files);
	  }
	  return files;
	} catch (err) {
	  return this.handleDriveAPIError('Error fetching file', err);
	}
}

async function fetchDriveFile(metadata) {
	try {
	  const fileRes = await this.drive.files.get({
	    fileId: metadata.id,
	    alt: 'media'
	  });
	  const dataArr = Uint8Array.from(fileRes.body.split('').map((chr) => chr.charCodeAt(0)));
	  return new File([dataArr], metadata.name, { type: metadata.mimeType });
	} catch (err) {
	  return this.handleDriveAPIError('Error fetching file', err);
	}
}

function handleDriveAPIError(ctx, err) {
	console.error(`${ctx}: ${err.message}`);
}