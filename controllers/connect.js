const Peripheral = require('../models/peripheral');
const Timer = require('../models/timer');
const Packet = require('../models/packet');
const Characteristic = require('../models/characteristic');

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

  var p = await peripheral.find(['fff0'], ['fff1', 'fff2', 'fff3', 'fff4']);
  // console.log(p);
  // process.exit();

  var c1 = new Characteristic(p.chrs['fff1']);
  var c2 = new Characteristic(p.chrs['fff2']);
  var c3 = new Characteristic(p.chrs['fff3']);
  var c4 = new Characteristic(p.chrs['fff4']);

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
    var packet = new Packet(data, {debug: false});
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
