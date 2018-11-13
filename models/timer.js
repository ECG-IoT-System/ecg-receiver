const now = require('nano-time');
const BigNumber = require('big-number');

module.exports = class Timer {
  constructor() {}

  start() {
    this.hrstart = process.hrtime();
    return this;
  }
  end() {
    this.hrend = process.hrtime(this.hrstart);
    this.diff = Math.round(this.hrend[0] + this.hrend[1] / 1e4);
  }

  getTime() {
    var time = BigNumber(now().toString()).toString();
    this.time = [time.slice(0, -9), time.slice(-9)];
  }

  getTick() {
    if (!this.time) this.getTime();
    return this.time[0] + this.time[1].slice(0, 5);
  }

  getDate() {
    if (!this.time) this.getTime();
    return new Date(parseInt(this.time[0] + this.time[1].slice(0, 3)));
  }

  // 4 bytes unsigned integer: diff time
  // 4 bytes unsigned integer: hour
  // 4 bytes unsigned integer: tick (10us)
  toBuffer() {
    // can not fix issue #1 on receiver side, so don't waste time on the function before the bug is fixed.
    // return new Buffer(12);

    this.getTime();

    var hour = (parseInt(this.time[0]) / 3600) % 24;
    var tick = parseInt(this.getTick()) % 36e7;

    var timeBuf = [this.diff, hour, tick];

    timeBuf = timeBuf.map(time => {
      let result = new Buffer(4);
      result.writeUInt32LE(parseInt(time));
      return result;
    });

    console.log('[DEBUG]', 'Date:', this.getDate());
    console.log('[DEBUG]', 'Time Array:', this.diff, hour, tick, '(diff, hour, tick)');
    console.log('[DEBUG]', 'Time Buffer:', new Buffer.concat(timeBuf));

    return new Buffer.concat(timeBuf);
  }
};
