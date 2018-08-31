const Peripheral = require('../models/peripheral');
const Timer = require('../models/timer');
const Packet = require('../models/packet');

module.exports = async function(peripheral) {
  var address = peripheral.address;

  peripheral.on('connect', function(a) {
    console.log('\x1b[32mperipheral connected\x1b[0m', address);
  });

  peripheral.on('disconnect', function(a) {
    console.log('\x1b[31mperipheral disconnect\x1b[0m', address);
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

  await peripheral.connect();

  var p = await peripheral.find(['fff0'], ['fff1', 'fff3', 'fff4']);

  var controlChr = p.chrs['fff1'];
  var notifyChr = p.chrs['fff3'];
  var subscribeChr = p.chrs['fff4'];

  controlChr.initialize();

  await subscribeChr.notify(function(data, isNotification) {
    var packet = new Packet(data, {debug: false});
    // packet.parse()
  });

  setInterval(function() {
    notifyChr.send(new Buffer([0xff]));
  }, 1000);

  setInterval(function() {
    controlChr.setTime();
  }, 8000);
};
