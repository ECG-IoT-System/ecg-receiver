const Peripheral = require('../models/peripheral');
const Characteristic = require('../models/characteristic');
const Timer = require('../models/timer');
const Packet = require('../models/packet');
// const wisepaas = require('../adapter/wisepaas');
const phpserver = require('../adapter/phpServer');
const phpRssiserver = require('../adapter/phpRssiServer');
const nodeserver = require('../adapter/nodeServer');

var list = [];

module.exports = async function(peripheral) {
  if (list.indexOf(peripheral.address) > -1)
    return console.log('[Peripheral] Duplication connection', peripheral.address);

  var timerA = null;
  var timerB = null;

  peripheral.once('connect', function(a) {
    list.push(peripheral.address);
    console.log('\x1b[36m', list, '\x1b[0m');
  });

  peripheral.once('disconnect', function(a) {
    var index = list.indexOf(peripheral.address);
    if (index > -1) {
      list.splice(index, 1);
    }
    console.log('\x1b[36m', list, '\x1b[0m');

    if (timerA) {
      console.log('\x1b[36m[Peripheral]\x1b[0m Timer timerA stop');
      clearInterval(timerA);
    }
    if (timerB) {
      console.log('\x1b[36m[Peripheral]\x1b[0m Timer timerB stop');
      clearInterval(timerB);
    }
  });

  peripheral = new Peripheral(peripheral);

  // connect peripheral
  //
  // peripheral discover service fff0
  //
  // service fff0 discover chars fff1, fff2 , fff3, fff4
  //
  // fff1.write 03
  // fff1.read
  //
  // fff1.write 00
  // fff1.read
  //
  // fff1.write time
  // fff1.read
  //
  // fff4.notify
  // fff3.set ff
  //

  // svc stands for service
  // chr stands for characteristic
  //
  // ---
  // fff2.notify
  //
  // timer.start
  // fff1.write 00
  // fff2.read.notify
  // timer.end
  //
  // fff1.write time(tick-diff, hour, tick-start)
  // fff2.read notify (< ms)
  //
  // fff4.notify
  // fff3.set ff

  await peripheral.connect();

  var svcUuids = ['fff0'];
  var chrUuids = ['fff1', 'fff2', 'fff3', 'fff4'];

  var p = await peripheral.find(svcUuids, chrUuids);

  var f1 = p.chrs['fff1'];
  var f2 = p.chrs['fff2'];
  var f3 = p.chrs['fff3'];
  var f4 = p.chrs['fff4'];

  f1.initialize();
  Characteristic.setTime(f1, f2, () => {});

  var signals = [];
  var timediff = [];
  let mac = peripheral.address.replace(/:/g, '');
  f4.notify((data, isNotification) => {
    let packet = new Packet(data);

    signals = signals.concat(packet.get());

    if (packet.sequence == 1) {
      timediff.push(packet.getTime());
    }

    if (timediff.length > 2) {
      timediff.shift();
    }

    if (packet.sequence == 3 && timediff.length == 2) {
      function clone(a) {
        return JSON.parse(JSON.stringify(a));
      }

      console.log('\x1b[36m [Recieve] ', mac, '\x1b[0m');

      // clone current data
      let _signals = JSON.parse(JSON.stringify(signals));
      let _timediff = JSON.parse(JSON.stringify(timediff));
      let _gsensor = JSON.parse(JSON.stringify(packet.getGsensor()));

      peripheral.peripheral.updateRssi(function(err, rssi) {
        if (err) return console.error('RSSI:', err);
        // console.log(2, { mac, timediff, length: _signals.length, getTime: packet.getTime() })

        if (_timediff[1] - _timediff[0] > 1500) {
          _timediff[0] = _timediff[1] - 1000;
        }

        if (_signals.length !== 256) return console.log('data.length is', _signals.length, '. not equal 256');

        phpserver.send(_timediff, _signals, _gsensor, mac, rssi);
        phpRssiserver.sendRssi(_timediff, _signals, mac, rssi);
        nodeserver.send(_timediff, _signals, _gsensor, mac, rssi);
      });

      signals = [];
    }
  });

  var counter = 0;
  timerA = setInterval(async function() {
    new Promise((resolve, reject) => {
      if (counter++ % 10 !== 0) {
        resolve();
      } else {
        Characteristic.setTime(f1, f2, resolve);
      }
    }).then(() => {
      f3.send(new Buffer([0xff]));
    });
  }, 800);

  timerB = setInterval(function() {
    // f1.setTime();
  }, 8000);
};
