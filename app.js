var noble = require('noble');
var connect = require('./controllers/connect');
const errors = require('./config/errors');

noble.on('stateChange', function(state) {
  console.log('state change: ', state);
  if (state === 'poweredOn') {
    setInterval(function() {
      noble.stopScanning();
      noble.startScanning([], false, function(err) {
        if (err) errors('ScanningError: ' + err);
      });
    }, 1000);
  } else {
    console.log('not scanning');
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  if (peripheral.advertisement.localName !== 'SimpleBLEPeripheral') return;
  console.log('Discovered: ' + peripheral.address, peripheral.advertisement.localName);

  noble.stopScanning();

  connect(peripheral);
});

noble.on('warning', function(message) {
  console.warn('\x1b[33m[Warn]\x1b[0m', message);
});

noble.on('unknown', function(message) {
  console.warn('\x1b[33m[Unknown]\x1b[0m', message);
});

noble.on('scanStart', function() {
  console.log('start scanning');
});

noble.on('scanStop', function() {
  console.log('stop scanning');
});
