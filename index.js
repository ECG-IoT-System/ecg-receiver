var noble = require('noble');

noble.on('stateChange', function(state) {
  console.log('state change: ', state);
  if (state === 'poweredOn') {
    console.log('scanning');
    noble.stopScanning();
    noble.startScanning([], false, function(err) {
      if (err) {
        console.error('Error');
        console.error(err);
      }
    });
  } else {
    console.log('not scanning');
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
  console.log('Discovered: ' + peripheral.address, peripheral.advertisement.localName);
  if (peripheral.advertisement.localName !== 'SimpleBLEPeripheral') {
    return;
  }

  // noble.stopScanning()
  console.log(peripheral);

  peripheral.connect(function(err) {
    if (err) {
      console.error('Error connecting: ' + err);
      return;
    }
    console.log('connected to peripheral: ' + peripheral.uuid);

    // peripheral.discoverServices(null, function(error, services) {
    //   console.log('discovered the following services:');
    //   for (var i in services) {
    //     console.log('  ' + i + ' uuid: ' + services[i].uuid);
    //   }
    // });

    peripheral.discoverServices(['fff0'], function(error, services) {
      console.log(services);
      for (var i in services) {
        console.log('  ' + i + ' uuid: ' + services[i].uuid);
      }

      var service = services[0];

      // fff1.write 03
      // fff2.read
      // fff1.read
      //
      // fff1.write 00
      // fff2.read
      // fff1.read
      //
      // fff1.write time
      // fff1.read

      console.log('discovered device information service');

      const promise = new Promise(function(resolve, reject) {
        service.discoverCharacteristics(['fff1'], (err, chars) => resolve({c1: chars[0]}));
      })
        .then(function(obj) {
          return new Promise(function(resolve, reject) {
            service.discoverCharacteristics(['fff2'], (err, chars) => resolve({...obj, c2: chars[0]}));
          });
        })
        .then(function(obj) {
          return new Promise(function(resolve, reject) {
            service.discoverCharacteristics(['fff3'], (err, chars) => resolve({...obj, c3: chars[0]}));
          });
        })
        .then(function(obj) {
          return new Promise(function(resolve, reject) {
            service.discoverCharacteristics(['fff4'], (err, chars) => resolve({...obj, c4: chars[0]}));
          });
        })
        .then(function(obj) {
          return new Promise(function(resolve, reject) {
            obj.c1.write(new Buffer([0x03]), true, function(err) {
              console.log('fff1: write 03');
              resolve(obj);
            });
          });
        })
        .then(function(obj) {
          return new Promise(function(resolve, reject) {
            obj.c1.write(new Buffer([0x00]), true, function(err) {
              console.log('fff1: write 00');
              resolve(obj);
            });
          });
        })
        .then(function(obj) {
          return new Promise(function(resolve, reject) {
            obj.c1.write(
              new Buffer([0x01, 0x02, 0x00, 0x00, 0x00, 0x09, 0x01, 0x02, 0x00, 0x00, 0x00, 0x09]),
              true,
              function(err) {
                console.log('fff1: write 0x010200000009');
                resolve(obj);
              },
            );
          });
        })
        .then(function(obj) {
          return new Promise(function(resolve, reject) {
            obj.c2.read(function(err, data) {
              console.log('fff2: read ', data);
              resolve(obj);
            });
          });
        })
        .then(function(obj) {
          return new Promise(function(resolve, reject) {
            obj.c1.read(function(error, data) {
              console.log('fff1: read ', data);
              // resolve(obj);
              fff4(obj.c1, obj.c2, obj.c3, obj.c4);
            });
          });
        });
    });
  });
});

function fff1(c1, c2, c3, c4) {
  c1.write(new Buffer([0x03]), true, function(error) {
    console.log('fff1: write 03');
    fff2(c1, c2, c3, c4);
    c1.read(function(error, data) {
      console.log('fff1: read ', data);
      c1.write(new Buffer([0x00]), true, function(error) {
        console.log('fff1: write 00');
        fff2(c1, c2, c3, c4);
        c1.read(function(error, data) {
          console.log('fff1: read ', data);
          c1.write(new Buffer([0x01, 0x02, 0x00, 0x00, 0x00, 0x09, 0x01, 0x02, 0x00, 0x00, 0x00, 0x09]), true, function(
            error,
          ) {
            console.log('fff1: write 0x010200000009');
            c1.read(function(error, data) {
              console.log('fff1: read ', data);
              fff4(c1, c2, c3, c4);
            });
          });
        });
      });
    });
  });
}

function fff2(c1, c2, c3, c4) {
  c2.read(function(error, data) {
    console.log('fff2: read ', data);
  });
}

function fff3(c1, c2, c3, c4) {
  setInterval(function() {
    c3.write(new Buffer([0xff]), true, function(error) {
      console.log('fff3: set ff');
    });
  }, 1000);
}

function fff4(c1, c2, c3, c4) {
  c4.on('data', function(data, isNotification) {
    console.log('fff4: ');
    console.log(data);
    // buffer.readUIntBE(0, 3)
    // console.log('battery level is now: ', data.readUInt8(0) + '%');
  });

  // to enable notify
  c4.subscribe(function(err) {
    if (err) return console.log(err);
    console.log('fff4: notify!');
    fff3(c1, c2, c3, c4);
  });
}

noble.on('warning', function(message) {
  console.log('Warn');
  console.warn(message);
});
