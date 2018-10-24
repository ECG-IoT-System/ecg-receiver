const Peripheral = require('../models/peripheral');
const Characteristic = require('../models/characteristic');
const Timer = require('../models/timer');
const Packet = require('../models/packet');
const wisepaas = require('../adapter/wisepaas');

module.exports = async function(peripheral) {
  var timerA = null;
  var timerB = null;

  peripheral.once('disconnect', function(a) {
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
  Characteristic.setTime(f1, f2);

  var signals = [];
  var timediff = [];
  f4.notify((data, isNotification) => {
    var packet = new Packet(data);

    if (packet.sequence == 1) {
      timediff.push(new Date().getTime());

      if (timediff.length > 2) {
        timediff.shift();
      }

      if (timediff.length == 2) {
        // send(topic, msg)
        wisepaas.send(
          'wisepaas/device/' + peripheral.uuid,
          JSON.stringify({
            start_at: timediff[0],
            end_at: timediff[1],
            signals: signals,
          }),
        );
      }

      signals = [];
    }

    signals = signals.concat(packet.get());

    var debug = true;

    if (debug) {
      packet.print();
    }
    if (!debug && (packet.sequence > 3 || packet.sequence == 0)) {
      packet.print();
    }
  });

  timerA = setInterval(function() {
    f3.send(new Buffer([0xff]));
  }, 1000);

  timerB = setInterval(function() {
    // f1.setTime();
    Characteristic.setTime(f1, f2);
  }, 8000);
};
