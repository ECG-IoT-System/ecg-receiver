const Timer = require('../models/timer');

module.exports = class Characteristic {
  constructor(chr) {
    this.chr = chr;
    this.address = chr._peripheralId;
    this.uuid = chr.uuid;
  }

  send(content) {
    return new Promise((resolve, reject) => {
      this.chr.write(content, true, err => {
        console.log('[Write]', this.address, this.uuid, content);
        resolve(content);
      });
    });
  }

  read() {
    return new Promise((resolve, reject) => {
      this.chr.read((err, data) => {
        console.log('[Read]', this.address, this.uuid, data);
        resolve(data);
      });
    });
  }

  async notify(callback) {
    this.chr.on('data', (data, isNotification) => {
      // console.log('[Notify]', this.address, this.uuid, data);
      callback(data, isNotification);
    });

    this.chr.subscribe(err => {
      if (err) return console.log(err);
      console.log('[Subscribe]', this.address, this.uuid);
    });
  }

  async initialize() {
    await this.send(new Buffer([0x03]));
    await this.read();
    // await this.setTime();
  }

  static async setTime(f1, f2) {
    f2.chr.subscribe(err => {
      if (err) return console.log(err);
      console.log('[Subscribe]', f2.address, f2.uuid);
    });

    var t = new Timer();
    var isSendTime = false;

    t.start();

    await f1.send(new Buffer([0x00]));

    f2.chr.on('data', async (data, isNotification) => {
      // console.log('[Notify]', this.address, this.uuid, data);
      console.log(data);

      if (!isSendTime) {
        t.end();
        console.log(t);
        console.log(t.toBuffer());
        await f1.send(t.toBuffer());
        isSendTime = true;
      }
    });
  }
};
