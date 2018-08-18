const Rx = require('rxjs');
const {Observable, Subject, ReplaySubject, from, of, range, fromEvent, create, bindNodeCallback} = require('rxjs');
const {tap, map, filter, mergeMap} = require('rxjs/operators');
var noble = require('noble');
var connect = require('./peripheral');

// noble.on('stateChange', function() {});

fromEvent(noble, 'stateChange')
  .pipe(
    tap(state => console.log('current state:', state)),
    filter(state => state === 'poweredOn'),
    tap(state => noble.stopScanning()),
    mergeMap(state => new Promise((resolve, reject) => noble.startScanning([], false, err => resolve(err)))),
    tap(err => console.log('err', err)),
    filter(err => err),
    tap(err => console.log(err)),
  )
  .subscribe();

// noble.on('stateChange', function(state) {
//   console.log('state change: ', state);
//   if (state === 'poweredOn') {
//     console.log('scanning');
//     noble.stopScanning();
//     noble.startScanning([], false, function(err) {
//       if (err) {
//         console.error('Error');
//         console.error(err);
//       }
//     });
//   } else {
//     console.log('not scanning');
//     noble.stopScanning();
//   }
// });

fromEvent(noble, 'discover')
  .pipe(
    tap(p => console.log('Discovered: ' + p.address, p.advertisement.localName, p.rssi)),
    filter(p => p.advertisement.localName === 'SimpleBLEPeripheral'),
    tap(p => connect(p)),
  )
  .subscribe();

// noble.on('discover', function(peripheral) {
//   console.log('Discovered: ' + peripheral.address, peripheral.advertisement.localName);
//   if (peripheral.advertisement.localName !== 'SimpleBLEPeripheral') {
//     return;
//   }
//   connect(peripheral);
// });

noble.on('warning', function(message) {
  console.log('Warn');
  console.warn(message);
});
