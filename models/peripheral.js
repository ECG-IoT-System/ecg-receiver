const Service = require('./service');
const errors = require('../config/errors');

module.exports = class Peripheral {
  constructor(peripheral) {
    this.peripheral = peripheral;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.peripheral.connect(err => {
        if (err) return errors('ConnectionError: ' + err + ' on peripheral ' + this.peripheral.id);

        resolve();
      });
    });
  }

  findService(uuid) {
    return new Promise((resolve, reject) => {
      this.peripheral.discoverServices([uuid], (err, services) => {
        if (err)
          return errors(
            'DiscoverServiceError: ' + 'service ' + uuid + ' has ' + err + ' on peripheral ' + this.peripheral.id,
          );

        var service = services[0];

        if (service.uuid !== uuid)
          return errors(
            'ServiceNotFound: ' + 'can not find the service ' + uuid + ' on peripheral ' + this.peripheral.id,
          );

        this[uuid] = new Service(service);

        resolve(this[uuid]);
      });
    });
  }
};
