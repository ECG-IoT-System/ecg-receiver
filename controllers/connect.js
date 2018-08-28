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

  await peripheral.connect();

  var service = await peripheral.findService('fff0');

  var c1 = await service.findChar('fff1');
  var c2 = await service.findChar('fff2');
  var c3 = await service.findChar('fff3');
  var c4 = await service.findChar('fff4');

  await c1.send(new Buffer([0x03]));
  await c1.read();

  var t = new Timer();

  t.start();
  await c1.send(new Buffer([0x00]));
  await c1.read();
  t.end();

  await c1.send(t.toBuffer());
  await c1.read();
  await c4.notify(function(data, isNotification) {
    var packet = new Packet(data, {debug: true});
    // packet.parse()
  });

  setInterval(function() {
    c3.send(new Buffer([0xff]));
  }, 1000);

  setInterval(async function() {
    var t = new Timer();

    t.start();
    await c1.send(new Buffer([0x00]));
    await c1.read();
    t.end();

    await c1.send(t.toBuffer());
    await c1.read();
  }, 8000);
};
