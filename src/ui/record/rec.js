import { 
	getAccessToken,
	uploadFile,
} from '../api/gapi.js';

export default class Recorder {

	constructor() {
		this.rec = undefined;
		this.audioChunks = [];
		this.record = document.getElementById('record');
		this.stopRecord = document.getElementById('stopRecord');
		this.recordedAudio = document.getElementById('recordedAudio');

		this.record.onclick = e => {
		    this.record.disabled = true;
		    this.record.style.backgroundColor = "blue"
		    this.stopRecord.disabled = false;
		    this.audioChunks = [];
		    this.rec.start();
		}

		this.stopRecord.onclick = e => {
			this.record.disabled = false;
			this.stopRecord.disabled = true;
			this.record.style.backgroundColor = "red"
			this.rec.stop();
		}

		navigator.mediaDevices.getUserMedia({ audio:true })
			.then(stream => { this.handlerFunction(stream) })

		this.sendData = this.sendData.bind(this);
		this.handlerFunction = this.handlerFunction.bind(this);
	}

	handlerFunction(stream) {
		this.rec = new MediaRecorder(stream);
		this.rec.ondataavailable = e => {
			this.audioChunks.push(e.data);
			if (this.rec.state == "inactive"){
				let blob = new Blob(this.audioChunks,{type:'audio/mp3'});
				this.recordedAudio.src = URL.createObjectURL(blob);
				this.recordedAudio.controls = true;
				this.recordedAudio.autoplay = true;
				this.sendData(blob)
		  	}
		}
	}

	async sendData(data) {
		console.log('data', data);
		getAccessToken(async (token) => {

			const upload = await uploadFile(data, token);

			console.log("upload result", upload)

		})
	}
}