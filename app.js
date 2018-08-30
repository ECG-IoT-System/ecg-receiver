var noble = require('noble');
var connect = require('./controllers/connect');
const errors = require('./config/errors');

noble.on('scanStart', function(a) {
  console.log('start scan', a);
});

noble.on('scanStop', function() {
  console.log('stop scan');
});

var allowDuplicates = true;

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
  console.log('Discovered: ' + peripheral.address, peripheral.advertisement.localName);
  if (peripheral.advertisement.localName !== 'SimpleBLEPeripheral') {
    return;
  }
  noble.stopScanning();
  connect(peripheral);
});

noble.on('warning', function(message) {
  console.warn('[Warn]', message);
});

noble.on('unknown', function(message) {
  console.warn('[Unknown]', message);
});
