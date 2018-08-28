const Service = require('./service');

module.exports = class Peripheral {
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
};
