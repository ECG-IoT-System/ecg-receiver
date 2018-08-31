const Peripheral = require('../models/peripheral');
const Timer = require('../models/timer');
const Packet = require('../models/packet');

module.exports = async function(peripheral) {
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

  subscribeChr.notify(function(data, isNotification) {
    var packet = new Packet(data, {debug: true});
    // packet.parse()
  });

  setInterval(function() {
    notifyChr.send(new Buffer([0xff]));
  }, 1000);

  setInterval(function() {
    controlChr.setTime();
  }, 8000);
};
