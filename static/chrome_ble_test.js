
var serviceUUID = 'battery_service';// var serviceUUID = 'fd5abba0-3935-11e5-85a6-0002a5d5c51b'; // one charac with descriptor. CSC service
var characteristicUUID = 'battery_level'; //var characteristicUUID = 'fd5abba1-3935-11e5-85a6-0002a5d5c51b';

var options = {
	filters: [{name: 'ATMEL-BAS'}],
	optionalServices: [serviceUUID]
};

var serverGlobal;
var serviceGlobal;
var characGlobal;
function bluetoothSetupCharac(callback) {
	navigator.bluetooth.requestDevice(options)
	.then(device => {
		console.log(device.name);
		return device.gatt.connect();
	})
	.then(server => {
		console.log(server);
		serverGlobal = server;
		return server.getPrimaryService(serviceUUID);
	})
	.then(service => {
		console.log(service);
		serviceGlobal = service;
		return service.getCharacteristic(characteristicUUID);
	})
	.then(characteristic => {
		console.log(characteristic);
		characGlobal = characteristic;
		callback(characteristic);
	})
	.catch(error => {
		console.log(error)
	});
}

class DivesDownloader {
	constructor() {
		this.writeArraysReceived = [];
		this.complete = false;
		this.onDownloadProgressCallback;
		this.downloadLength;
		this.downloadedUint8Array;
		this.writeBytesReceived = 0;
		
		this.commands = {
			start: 0x01,
			header: 0x02,
			write: 0x03,
			acknowledge: 0x04
		};
		
		this.divesDownloadCharacteristic = null;
	}
	
	setDownloadHeader(downloadHeaderDataView) {
		console.log('Received download header: ' + downloadHeaderDataView);
		this.downloadHeader = downloadHeaderDataView;
		this.downloadLength = downloadHeaderDataView.getUint32(1, true); //true for little endian
		console.log('Download length: ' + this.downloadLength);
		this.downloadedUint8Array = new Uint8Array(this.downloadLength);
	}
	
	getProgress() {
		
	}
	
	startDivesDownload(charac) {
		console.log('startDivesDownload');
		this.divesDownloadCharacteristic = charac;
		
		var scope = this;
		this.divesDownloadCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
			scope.handleCharacteristicValueChanged(event) //This is required to avoid this to be bound to the DOM
		});
		
		this.divesDownloadCharacteristic.startNotifications().then(characteristic => {
			return characteristic.writeValue(this.getCommandBuffer(this.commands.start))
		})
		.then(() => {
			console.log('Finished writing start command');
		}).catch(error => {
			console.log('DivesDownloader error:' + error);
		});
	}
	
	getCommandBuffer(command) {
		let commandBuffer = (new Uint8Array([command])).buffer;
		return commandBuffer;
	}
	
	isDownloadComplete() {
		if(this.downloadLength != null) {
			return this.writeBytesReceived >= this.downloadLength;
		} else {
			return false;
		}
	}
	
	handleCharacteristicValueChanged(event) {
		let value = event.target.value;
		console.log('handleCharacteristicValueChanged: ' + new Uint8Array(value.buffer));
		
		let command = value.getUint8(0);
		if(command == this.commands.header) {
			console.log('Received download header');
			this.setDownloadHeader(value);
			this.sendAcknowledgement();
		} else if(command == this.commands.write) {
			this.addWriteArray(value);

			if(this.isDownloadComplete()) {
				console.log('Download complete');
			} else {
				this.sendAcknowledgement();
			}
		} else {
			console.log('Command not recognized');
		}
	}

	onDownloadProgress(callback) {
		this.onDownloadProgressCallback = callback;
	}

	notifyDownloadProgress(value) {
		if(this.onDownloadProgressCallback != null) {
			this.onDownloadProgressCallback(value);
		}
	}
	
	sendAcknowledgement() {
		this.divesDownloadCharacteristic.writeValue(this.getCommandBuffer(this.commands.acknowledge))
		.then(()=> {
			console.log('Acknowledgement sent');
		})
		.catch((error)=> {
			console.log(error);
		});
	}
	
	addWriteArray(writeDataView) {
		var writePayloadArrayBuffer = writeDataView.buffer.slice(1, writeDataView.byteLength);
		this.writeArraysReceived.push(writePayloadArrayBuffer);

		this.writeBytesReceived += (writePayloadArrayBuffer.byteLength);
		this.notifyDownloadProgress(Math.floor(100 * this.writeBytesReceived / this.downloadLength));
	}
	
	getDownloadedUint8Array() {
		let byteSize = this.getDownloadSize();
		var downloadedUint8Array = new Uint8Array(byteSize);
		var offset = 0;
		for(let i=0;i<this.writeArraysReceived.length;i++) {
			console.log(i);
			downloadedUint8Array.set(new Uint8Array(this.writeArraysReceived[i]), offset)
			offset+= this.writeArraysReceived[i].byteLength;
		}
		
		return downloadedUint8Array;
	}
}

var divesDownloader = new DivesDownloader();
function main() {
	bluetoothSetupCharac(characteristic => {
		divesDownloader.startDivesDownload(characteristic);
	});
	console.log('End of main');
}

function Uint8ArrayToBase64String(uint8Array) {
	var decoder = new TextDecoder('utf8');
	var b64encoded = btoa(decoder.decode(uint8Array));
	return b64encoded;
}