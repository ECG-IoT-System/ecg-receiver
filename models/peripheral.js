const errors = require('../config/errors');

module.exports = class Peripheral {
  constructor(peripheral) {
    this.peripheral = peripheral;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.peripheral.connect(err => {
        if (err) return errors('ConnectionError: ' + err + ' on peripheral ' + this.peripheral.address);

        resolve();
      });
    });
  }

  find(svcUuids, chrUuids) {
    function reducer(obj, svc) {
      obj[svc.uuid] = svc;
      return obj;
    }

    return new Promise((resolve, reject) => {
      this.peripheral.discoverSomeServicesAndCharacteristics(svcUuids, chrUuids, function(err, svcs, chrs) {
        resolve({
          svcs: svcs ? svcs.reduce(reducer, {}) : {},
          chrs: chrs ? chrs.reduce(reducer, {}) : {},
        });
      });
    });
  }
};
