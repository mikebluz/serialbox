export function getCorrectDuration(audio)  {
	return new Promise((res) => {
	   	audio.addEventListener('loadedmetadata', (e) => {
			if (audio.duration === Infinity) {
				audio.currentTime = 1e101
				audio.addEventListener('timeupdate', getDuration)
			}
		})
		function getDuration() {
			audio.currentTime = 0
			audio.removeEventListener('timeupdate', getDuration)
			res(true);
		}
		audio.load();
	});
}

export function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}

export const defaultPlaylistNames = [
	'Old Self',
	'Pay To Feel',
	'Paid Feeling',
	'Constant',
	'Sketch Me In Stardust',
	'Home Is Where You Are Not Where You Were',
	'Nothing Enough',
	'If I Can Do It No One Should',
	'What Doing Nothing Does',
	'Blame Reason',
	'The Oldest Kid',
	'How You Feel',
	'Traumapology',
	'How Old You Feel You Are',
]