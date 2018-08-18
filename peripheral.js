const Rx = require('rxjs');
const {Observable, Subject, ReplaySubject, from, of, range, fromEvent, create, bindNodeCallback} = require('rxjs');
const {tap, map, filter, mergeMap} = require('rxjs/operators');

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

      function notify(chr) {
        // return new Promise(function(resolve, reject) {
        chr.on('data', function(data, isNotification) {
          parseChunk(data);
          console.log('on data', data);
          // buffer.readUIntBE(0, 3)
          // console.log('battery level is now: ', data.readUInt8(0) + '%');
        });

        // to enable notify
        chr.subscribe(function(err) {
          if (err) return console.log(err);
          console.log('fff4: notify!');
          // resolve(obj);
        });
        // });
      }

      function parseChunk(buf) {}

      async function t() {
        var c1 = await discover('fff1');
        var c2 = await discover('fff2');
        var c3 = await discover('fff3');
        var c4 = await discover('fff4');

        await send(c1, new Buffer([0x03]));
        await read(c1);
        await send(c1, new Buffer([0x00]));
        await read(c1);

        await send(c1, new Buffer([0x01, 0x02, 0x00, 0x00, 0x00, 0x09, 0x01, 0x02, 0x00, 0x00, 0x00, 0x09]));
        await read(c1);
        await notify(c4);

        setInterval(function() {
          send(c3, new Buffer([0xff]));
        }, 1000);
      }

      t();

      // const promise = new Promise(function(resolve, reject) {
      //   service.discoverCharacteristics(['fff1'], (err, chars) => resolve(chars[0]));
      // })
      //   .then(function(obj) {
      //     return new Promise(function(resolve, reject) {
      //       service.discoverCharacteristics(['fff2'], (err, chars) => resolve({...obj, c2: chars[0]}));
      //     });
      //   })
      //   .then(function(obj) {
      //     return new Promise(function(resolve, reject) {
      //       service.discoverCharacteristics(['fff3'], (err, chars) => resolve({...obj, c3: chars[0]}));
      //     });
      //   })
      //   .then(function(obj) {
      //     return new Promise(function(resolve, reject) {
      //       service.discoverCharacteristics(['fff4'], (err, chars) => resolve({...obj, c4: chars[0]}));
      //     });
      //   })
      //   .then(function(obj) {
      //     return new Promise(function(resolve, reject) {
      //       obj.c1.write(new Buffer([0x03]), true, function(err) {
      //         console.log('fff1: write 03');
      //         resolve(obj);
      //       });
      //     });
      //   })
      //   .then(function(obj) {
      //     return new Promise(function(resolve, reject) {
      //       obj.c1.write(new Buffer([0x00]), true, function(err) {
      //         console.log('fff1: write 00');
      //         resolve(obj);
      //       });
      //     });
      //   })
      //   .then(function(obj) {
      //     return new Promise(function(resolve, reject) {
      //       obj.c1.write(
      //         new Buffer([0x01, 0x02, 0x00, 0x00, 0x00, 0x09, 0x01, 0x02, 0x00, 0x00, 0x00, 0x09]),
      //         true,
      //         function(err) {
      //           console.log('fff1: write 0x010200000009');
      //           resolve(obj);
      //         },
      //       );
      //     });
      //   })
      //   .then(function(obj) {
      //     return new Promise(function(resolve, reject) {
      //       obj.c2.read(function(err, data) {
      //         console.log('fff2: read ', data);
      //         resolve(obj);
      //       });
      //     });
      //   })
      //   .then(function(obj) {
      //     return new Promise(function(resolve, reject) {
      //       obj.c1.read(function(error, data) {
      //         console.log('fff1: read ', data);
      //         resolve(obj);
      //         // fff4(obj.c1, obj.c2, obj.c3, obj.c4);
      //       });
      //     });
      //   })
      //   .then(function(obj) {
      //     return new Promise(function(resolve, reject) {
      //       obj.c4.on('data', function(data, isNotification) {
      //         console.log('fff4: ');
      //         console.log(data);
      //         // buffer.readUIntBE(0, 3)
      //         // console.log('battery level is now: ', data.readUInt8(0) + '%');
      //       });

      //       // to enable notify
      //       obj.c4.subscribe(function(err) {
      //         if (err) return console.log(err);
      //         console.log('fff4: notify!');
      //         resolve(obj);
      //       });
      //     });
      //   })
      //   .then(function(obj) {
      //     return new Promise(function(resolve, reject) {
      //       setInterval(function() {
      //         obj.c3.write(new Buffer([0xff]), true, function(error) {
      //           console.log('fff3: set ff');
      //         });
      //       }, 1000);
      //     });
      //   });
    });
  // });
};
