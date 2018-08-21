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

  print() {
    console.log(new Date().toUTCString());
    console.log('diff:', this.diff, '(10us)');
    console.log('hour:', this.hour, '(hr)');
    console.log('tick:', this.tick, '(10us)');
    console.log('  min:', Math.floor(this.tick / 100 / 1000 / 60), '(min)');
    console.log('  sec:', Math.floor((this.tick / 100 / 1000) % 60), '(sec)');
    console.log('  ms :', Math.floor((this.tick / 100) % 1000), '(ms)');
    console.log('  10u:', Math.floor(this.tick % 100), '(10us)');
  }

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
    this.print();

    return new Buffer.concat(timeBuf);
  }
};
