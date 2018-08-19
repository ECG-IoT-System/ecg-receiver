const Rx = require('rxjs');
const {Observable, Subject, ReplaySubject, from, of, range, fromEvent, create, combineLatest} = require('rxjs');
const {tap, map, filter, mergeMap, combineAll, switchMap, concatMap} = require('rxjs/operators');
const now = require('nano-time');

module.exports = function(peripheral) {
  // noble.stopScanning()
  // console.log(peripheral);

  const promise = new Promise(function(resolve, reject) {
    peripheral.connect(function(err) {
      if (err) {
        console.error('Error connecting: ' + err);
        return;
      }
      console.log('connected to peripheral: ' + peripheral.uuid);
      resolve();
    });
  })
    .then(function() {
      return new Promise(function(resolve, reject) {
        peripheral.discoverServices(['fff0'], function(error, services) {
          // console.log(services);
          from(services)
            .pipe(
              tap(service => console.log('uuid: ' + service.uuid)),
              filter(service => service.uuid === 'fff0'),
              tap(service => resolve(service)),
              tap(service => console.log('discovered device information service')),
            )
            .subscribe();
        });
      });
    })
    .then(function(service) {
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

      function discover(uuid) {
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

      async function t() {
        var c1 = await discover('fff1');
        var c2 = await discover('fff2');
        var c3 = await discover('fff3');
        var c4 = await discover('fff4');

        var hrstart = process.hrtime();
        await send(c1, new Buffer([0x03]));
        await read(c1);
        await send(c1, new Buffer([0x00]));
        await read(c1);
        var hrend = process.hrtime(hrstart);

        console.log('diff: ', hrend);

        // [Math.round(hrend / 1e4), new Date(current / 1e6).getUTCHours()];

        var diff = Math.round(hrend[1] / 1e4);
        var current = now();
        var hour = new Date(current / 1e6).getUTCHours();
        var tick = Math.round((current / 1e4) % 1e5);

        console.log('diff:', diff, '(10us)');
        console.log('hour:', hour, '(hr)');
        console.log('tick:', tick, '(10us)');

        var timeBuf = [diff, hour, tick];

        timeBuf = timeBuf.map(time => {
          let result = new Buffer(4);
          result.writeInt32BE(time);
          return result;
        });

        timeBuf = new Buffer.concat(timeBuf);
        console.log('time buf', timeBuf);

        await send(c1, timeBuf);
        await read(c1);
        await notify(c4, function(data, isNotification) {
          parse(data);
        });

        setInterval(function() {
          send(c3, new Buffer([0xff]));
        }, 1000);
      }

      t();

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

        console.log(packet);
      }
    });
};
