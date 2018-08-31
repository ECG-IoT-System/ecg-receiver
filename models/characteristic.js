const Timer = require('../models/timer');

module.exports = class Characteristic {
  constructor(chr) {
    this.chr = chr;
  }

  send(content) {
    return new Promise((resolve, reject) => {
      this.chr.write(content, true, err => {
        console.log(this.chr.uuid, ': write ', content);
        resolve(content);
      });
    }).catch(error => {
      console.log(error);
    });
  }

  read() {
    return new Promise((resolve, reject) => {
      this.chr.read((err, data) => {
        console.log(this.chr.uuid, ': read ', data);
        resolve(data);
      });
    });
  }

  notify(callback) {
    return new Promise((resolve, reject) => {
      this.chr.on('data', (data, isNotification) => {
        callback(data, isNotification);
      });

      // console.log(this.chr);
      // to enable notify
      this.chr.subscribe(err => {
        if (err) return console.log(err);
        console.log('fff4: subscribe!');
        resolve();
      });
    });
  }

  async initialize() {
    await this.send(new Buffer([0x03]));
    await this.read();
    await this.setTime();
  }

  async setTime() {
    var t = new Timer();

    t.start();
    await this.send(new Buffer([0x00]));
    await this.read();
    t.end();

    await this.send(t.toBuffer());
    await this.read();
  }
};
