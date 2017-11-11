/*
	Sample to be copied in chrome using remote device to connect to the phone
	This sample is to test the functionality and is to be integrated to the web app
	chrome://bluetooth-internals/ for debugging basics
	Custom serial chat service CSC
	Seems like the FW set and read the characteristic value
	#define CSC_SERVICE_UUID ("\x1b\xc5\xd5\xa5\x02\x00\xa6\x85\xe5\x11\x35\x39\xa0\xbb\x5a\xfd")
	flip with python binascii.hexlify("\x1b\xc5\xd5\xa5\x02\x00\xa6\x85\xe5\x11\x35\x39\xa0\xbb\x5a\xfd"[::-1])
*/

function handleValueChanged(event) {
	let decoder = new TextDecoder('utf-8');
	console.log('handleValueChanged received: ' + decoder.decode(event.target.value));
	writeToCharac(0x02); //ACK
}

function writeToCharac(val) {
	let encoder = new TextEncoder('utf-8');
	let userDescription = encoder.encode('Defines the time.');
	let commandArray = new Uint8Array([val]);
	return characGlobal.writeValue(commandArray.buffer).then(()=>{
		console.log('Done');
	});
}

function readCharac() {
	characGlobal.readValue().then(value => {
		let decoder = new TextDecoder('utf-8');
		console.log('readCharac received: ' + decoder.decode(value));
	});
}