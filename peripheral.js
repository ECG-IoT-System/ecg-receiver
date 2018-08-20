const Rx = require('rxjs');
const {Observable, Subject, ReplaySubject, from, of, range, fromEvent, create, combineLatest} = require('rxjs');
const {tap, map, filter, mergeMap, combineAll, switchMap, concatMap} = require('rxjs/operators');
const now = require('nano-time');

module.exports = async function(peripheral) {
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
  await connect(peripheral);

  var service = await discoverService(peripheral, 'fff0');

  var c1 = await discoverChar(service, 'fff1');
  var c2 = await discoverChar(service, 'fff2');
  var c3 = await discoverChar(service, 'fff3');
  var c4 = await discoverChar(service, 'fff4');

  await send(c1, new Buffer([0x03]));
  await read(c1);

  var hrstart = process.hrtime();
  await send(c1, new Buffer([0x00]));
  await read(c1);
  var hrend = process.hrtime(hrstart);

  var diff = Math.round(hrend[1] / 1e4);
  var current = now();
  var hour = new Date(current / 1e6).getUTCHours();
  var tick = Math.round((current / 1e4) % 3.6e8);

  console.log(new Date().toUTCString());
  console.log('diff:', diff, '(10us)');
  console.log('hour:', hour, '(hr)');
  console.log('tick:', tick, '(10us)');
  console.log('  min:', Math.floor(tick / 100 / 1000 / 60), '(min)');
  console.log('  sec:', Math.floor((tick / 100 / 1000) % 60), '(sec)');
  console.log('  ms :', Math.floor((tick / 100) % 1000), '(ms)');
  console.log('  10u:', Math.floor(tick % 100), '(10us)');

  var timeBuf = [diff, hour, tick];

  timeBuf = timeBuf.map(time => {
    let result = new Buffer(4);
    result.writeUInt32LE(time);
    return result;
  });

  timeBuf = new Buffer.concat(timeBuf);
  console.log('time buf', timeBuf);

  await send(c1, timeBuf);
  await read(c1);
  await notify(c4, function(data, isNotification) {
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
    send(c3, new Buffer([0xff]));
  }, 1000);
};

function connect(peripheral) {
  return new Promise(function(resolve, reject) {
    peripheral.connect(function(err) {
      if (err) return console.error('Error connecting: ' + err);
      console.log('Connected to peripheral: ' + peripheral.uuid);
      resolve();
    });
  });
}

function discoverService(peripheral, uuid) {
  return new Promise(function(resolve, reject) {
    peripheral.discoverServices(['fff0'], function(error, services) {
      if (services.length !== 1) return console.log('error: services is not equal 1');

      var service = services[0];

      if (service.uuid !== 'fff0') return console.log('error: service uuid is not fff0');

      resolve(service);
    });
  });
}

function discoverChar(service, uuid) {
  return new Promise(function(resolve, reject) {
    service.discoverCharacteristics([uuid], (err, chars) => resolve(chars[0]));
  });
}

function send(chr, content) {
  return new Promise(function(resolve, reject) {
    chr.write(content, true, function(err) {
      console.log(chr.uuid, ': write ', content);
      resolve(content);
    });
  });
}

function read(chr) {
  return new Promise(function(resolve, reject) {
    chr.read(function(err, data) {
      console.log(chr.uuid, ': read ', data);
      resolve(data);
    });
  });
}

function notify(chr, callback) {
  // return new Promise(function(resolve, reject) {
  chr.on('data', function(data, isNotification) {
    callback(data, isNotification);
  });

  // to enable notify
  chr.subscribe(function(err) {
    if (err) return console.log(err);
    console.log('fff4: subscribe!');
  });
}

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
