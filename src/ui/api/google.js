export default class GoogleAPI {
  constructor() {
    this.CLIENT_ID = process.env.REACT_APP_GAPI_CLIENT_ID + ".apps.googleusercontent.com";
    this.API_KEY = process.env.REACT_APP_GAPI_API_KEY;
    this.SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.readonly';

    this.tokenClient = undefined;
    this.token = undefined;
    this.Drive = undefined;

    this.loadTokenClient = this.loadTokenClient.bind(this);
    this.loadGapiClient = this.loadGapiClient.bind(this);
    this.loadClients = this.loadClients.bind(this);
    this.handleAuthClick = this.handleAuthClick.bind(this);
  }

  loadTokenClient() {
    this.tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: this.CLIENT_ID,
      scope: this.SCOPES,
      callback: async (tokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
          this.token = tokenResponse;
          localStorage.setItem('access_token', tokenResponse.access_token);

          // ToDo: advance page to "Logged In" view

          // Debug example using the Drive fetch -- should not actually happen here
          const files = await this.Drive.fetchDriveFolderContents('some-folder');
          console.log(files);

        }
      },
    });
  }

  loadClients(resolve) {
    return () => {
      console.log('loading clients')
      window.gapi.client.setApiKey(this.API_KEY);
      if (localStorage.getItem('access_token')) {
        // ToDo: switch to use Refresh Tokens for longer sessions
        console.log("using local access token");
        window.gapi.client.setToken(localStorage.getItem('access_token'));
      }
      window.gapi.client.load('drive', 'v3', () => {
        this.Drive = new Drive(window.gapi.client.drive);
        console.log('Drive loaded')
        // ToDo: have separate Promises for each client API
        // Since we're only using Drive for now can just resolve here
        resolve();
      });
    }
  }

  async loadGapiClient() {
    console.log('loading gapi')
    return new Promise((resolve, reject) => {
      window.gapi.load('client', this.loadClients(resolve));
    });
  }

  handleAuthClick() {
    if (window.gapi.client.getToken() === null) {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      this.tokenClient.requestAccessToken({prompt: 'consent'});
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      this.tokenClient.requestAccessToken({prompt: ''});
    }
  }

  async handleSignoutClick() {
    this.token = window.gapi.client.getToken();
    if (this.token !== null) {
      window.google.accounts.oauth2.revoke(token.access_token);
      window.gapi.client.setToken('');
    }
  }
}

// ToDo: add base class this extends that handles pagination and other general query sanitation/retry
class Drive {
  constructor(drive) {
    this.drive = drive;
  }

  async fetchDriveFolderContents(folder) {
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

  async fetchDriveFile(metadata) {
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

  handleDriveAPIError(ctx, err) {
    console.error(`${ctx}: ${err.message}`);
  }
}