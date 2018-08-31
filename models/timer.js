const now = require('nano-time');

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

  toJson() {
    return {
      time: new Date().toISOString(),
      diff: this.diff,
      hour: this.hour,
      tick: this.tick,
      min: Math.floor(this.tick / 100 / 1000 / 60),
      sec: Math.floor((this.tick / 100 / 1000) % 60),
      ms: Math.floor((this.tick / 100) % 1000),
      us: Math.floor((this.tick * 10) % 1000),
    };
  }

  // 4 bytes unsigned integer: diff time
  // 4 bytes unsigned integer: hour
  // 4 bytes unsigned integer: tick (10us)
  toBuffer() {
    this.current = now();
    this.hour = new Date(this.current / 1e6).getUTCHours();
    this.tick = Math.round((this.current / 1e4) % 3.6e8);

    var timeBuf = [this.diff, this.hour, this.tick];

    timeBuf = timeBuf.map(time => {
      let result = new Buffer(4);
      result.writeUInt32LE(time);
      return result;
    });

    // debug
    console.log(this.toJson());

    return new Buffer.concat(timeBuf);
  }
};
