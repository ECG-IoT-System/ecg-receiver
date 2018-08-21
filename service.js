const Characteristic = require('./characteristic');
module.exports = class Service {
  constructor(service) {
    this.service = service;
  }

  findChar(uuid) {
    return new Promise((resolve, reject) => {
      this.service.discoverCharacteristics([uuid], (err, chars) => {
        this[uuid] = new Characteristic(chars[0]);
        resolve(this[uuid]);
      });
    });
  }
};
