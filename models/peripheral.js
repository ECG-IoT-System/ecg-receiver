const errors = require('../config/errors');
const Characteristic = require('./characteristic');

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
      switch (svc.constructor.name) {
        case 'Characteristic':
          obj[svc.uuid] = new Characteristic(svc);
          break;
        default:
          obj[svc.uuid] = svc;
      }
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
