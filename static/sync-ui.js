let bluetoothDownloadDivesCharacteristic;

function find() {
	bluetoothSetupCharac(characteristic => {
		bluetoothDownloadDivesCharacteristic = characteristic;
	});
}

function sync() {
	if(bluetoothDownloadDivesCharacteristic == null) {
		console.log('Not connected to device');
	} else {
		divesDownloader.onDownloadProgress(updateProgress);
		divesDownloader.startDivesDownload(bluetoothDownloadDivesCharacteristic);
	}
}

function updateProgress(value) {
	let status = value.toString() + ' %' + (value >= 100 ? ' Completed' : '');

	syncProgressStatus.textContent = status;
	syncProgressBar.value = value;

	if(value >= 100) {
		sendRawDives(divesDownloader.getDownloadedUint8Array());
	}
}

function sendRawDives(divesUint8Array) {
	console.log('divesDownloadCompleted');

	let payload = {
		divesB64encoded: Uint8ArrayToBase64String(divesUint8Array)
	};

	let config = {
		method: 'POST',
		headers: {  
			'Content-type': 'application/json'
		},  
		body: JSON.stringify(payload)
	};

	fetch('raw_dives', config).then(response => {
		console.log(response);
	});
}

function testsendRawDives() {
	sendRawDives(new Uint8Array(1000));
}

var connectButton;
var syncButton;
var syncProgressStatus;
var syncProgressBar;
function setup() {
	connectButton = document.querySelector('#connect');
	syncButton = document.querySelector('#sync');
	syncProgressStatus = document.querySelector('#sync-progress-status');
	syncProgressBar = document.querySelector('#sync-progress-bar');
	
	connectButton.addEventListener('click', find);
	syncButton.addEventListener('click', sync);
}

document.addEventListener('DOMContentLoaded', setup);