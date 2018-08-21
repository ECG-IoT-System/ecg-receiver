const Service = require('./service');
const Timer = require('./timer');

class Peripheral {
  constructor(peripheral) {
    this.peripheral = peripheral;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.peripheral.connect(err => {
        if (err) return console.error('Error connecting: ' + err);
        console.log('Connected to peripheral: ' + this.peripheral.uuid);
        resolve();
      });
    });
  }

  findService(uuid) {
    return new Promise((resolve, reject) => {
      this.peripheral.discoverServices([uuid], (error, services) => {
        if (services.length === 0) return console.log('error: service is not found');

        var service = services[0];

        if (service.uuid !== uuid) return console.log('error: service uuid is not ' + uuid);

        this[uuid] = new Service(service);

        resolve(this[uuid]);
      });
    });
  }
}

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
    console.log(data);
    var packet = parse(data);
    if (packet.sequence == 1 || packet.sequence == 2) {
      var arr = [];
      for (var i = 0; i < 120; i++) {
        arr.push(packet.body.readInt16BE(2 * i, 2) / 72.2);
      }
      // console.log(arr);
    } else if (packet.sequence == 3) {
      var arr = [];
      var garr = [];
      for (var i = 0; i < 16; i++) {
        arr.push(packet.body.readInt16BE(2 * i, 2) / 72.2);
      }
      for (var i = 0; i < 30; i++) {
        garr.push((packet.body.readInt8(32 + i, 2) * 15.6) / 1000);
      }
      // console.log(arr);
      // console.log(garr);
    }
  });

  setInterval(function() {
    c3.send(new Buffer([0xff]));
  }, 1000);
};

var c = 0;
function parse(data) {
  var packet = {};
  packet.id = data.readUInt8(0, 1);
  packet.sequence = data.readUInt8(1, 1);
  packet.hour = data.readUInt8(2, 1);
  packet.minute = data.readUInt8(3, 1);
  packet.second = data.readUInt8(4, 1);
  packet.millisecond = data.readUInt16BE(5, 2);
  packet.debug = data.readUInt8(7, 1);
  packet.body = data.slice(8);

  // console.log(data.length, data);

  var p = packet;
  if (p.sequence == 1) {
    console.log('\x1b[33mid\tseq\thr\tmin\tsec\tms\tdebug\x1b[0m');
  }

  color = p.sequence <= 3 ? 32 : p.sequence == 255 ? 35 : 31;
  console.log(
    `\x1b[${color}m${p.id}\t${p.sequence}\t${p.hour}\t${p.minute}\t${p.second}\t${p.millisecond}\t${p.debug}\x1b[0m`,
  );
  return packet;
}
