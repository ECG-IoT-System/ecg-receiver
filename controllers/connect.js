const Peripheral = require('../models/peripheral');
const Timer = require('../models/timer');
const Packet = require('../models/packet');

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

  await peripheral.connect();

  var svcUuids = ['fff0'];
  var chrUuids = ['fff1', 'fff3', 'fff4'];

  var p = await peripheral.find(svcUuids, chrUuids);

  var controlChr = p.chrs['fff1'];
  var notifyChr = p.chrs['fff3'];
  var subscribeChr = p.chrs['fff4'];

  controlChr.initialize();

  var buffer = [];
  var timediff = [];
  subscribeChr.notify((data, isNotification) => {
    var packet = new Packet(data);

    if (packet.sequence == 1) {
      timediff.push(new Date());
      buffer = [];
    }

    buffer = buffer.concat(packet.get());

    if (timediff.length > 2) {
      timediff.shift();
    }

    if (packet.sequence == 3 && timediff.length == 2) {
      console.log(buffer);
    }

    var debug = true;

    if (debug) {
      packet.print();
    }
    if (!debug && (packet.sequence > 3 || packet.sequence == 0)) {
      packet.print();
    }
  });

  timerA = setInterval(function() {
    notifyChr.send(new Buffer([0xff]));
  }, 1000);

  timerB = setInterval(function() {
    controlChr.setTime();
  }, 8000);
};
