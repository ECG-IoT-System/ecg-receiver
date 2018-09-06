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

  time() {
    return BigNumber('1514862245006007008');
  }

  snap() {
    // var time = BigNumber(now().toString());
    var date = new Date(
      parseInt(
        this.time()
          .div(1e6)
          .toString(),
      ),
    );
    this.current = {
      time: this.time().toString(),
      format: [this.time().div(1e9), this.time().mod(1e9)],
      string: {
        iso: date.toISOString(),
        utc: date.toUTCString(),
        gmt: date.toGMTString(),
      },
      resolution: {
        zone: date.getTimezoneOffset(),
        year: date.getUTCFullYear(),
        month: date.getUTCMonth(),
        date: date.getUTCDate(),
        day: date.getUTCDay(),
        hour: date.getUTCHours(),
        min: date.getUTCMinutes(),
        sec: date.getUTCSeconds(),
        ms: date.getUTCMilliseconds(),
        us: this.time()
          .mod(1e6)
          .div(1e3),
        ns: this.time().mod(1e3),
      },
      diff: this.diff,
    };
  }

  // 4 bytes unsigned integer: diff time
  // 4 bytes unsigned integer: hour
  // 4 bytes unsigned integer: tick (10us)
  toBuffer() {
    // can not fix issue #1 on receiver side, so don't waste time on the function before the bug is fixed.
    return new Buffer(12);

    this.snap();

    var tick = BigNumber(this.current.resolution.minute)
      .mult(60)
      .add(this.current.resolution.sec)
      .mult(1000)
      .add(this.current.resolution.ms)
      .mult(1000)
      .add(this.current.resolution.us)
      .div(10)
      .toString();

    var hour = this.current.resolution.hour;

    var timeBuf = [this.diff, hour, tick];

    timeBuf = timeBuf.map(time => {
      let result = new Buffer(4);
      result.writeUInt32LE(parseInt(time));
      return result;
    });

    // console.log(this.current);

    // return new Buffer.concat(timeBuf);
  }
};
