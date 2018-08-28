module.exports = class Packet {
  constructor(data, options) {
    this.id = data.readUInt8(0, 1);
    this.sequence = data.readUInt8(1, 1);
    this.hour = data.readUInt8(2, 1);
    this.minute = data.readUInt8(3, 1);
    this.second = data.readUInt8(4, 1);
    this.millisecond = data.readUInt16BE(5, 2);
    this.debug = data.readUInt8(7, 1);
    this.body = data.slice(8);
    this.data = data;

    this.options = options;
    if (this.options.debug) {
      this.print();
    } else if (!this.options.debug && (this.sequence > 3 || this.sequence == 0)) {
      this.print();
    }
  }

  print() {
    if (this.sequence == 1) {
      console.log('\x1b[33mid\tseq\thr\tmin\tsec\tms\tdebug\x1b[0m');
    }

    var color = this.sequence <= 3 ? 32 : this.sequence == 255 ? 35 : 31;
    console.log(
      `\x1b[${color}m${this.id}\t${this.sequence}\t${this.hour}\t${this.minute}\t${this.second}\t${this.millisecond}\t${
        this.debug
      }\x1b[0m`,
    );

    console.log(this.data);
  }

  parse() {
    this.ecgSignal = {};
    this.gSensor = {};

    if (packet.sequence == 1 || packet.sequence == 2) {
      var arr = [];
      for (var i = 0; i < 120; i++) {
        arr.push(packet.body.readInt16BE(2 * i, 2) / 72.2);
      }
      // console.log(arr);
    } else if (packet.sequence == 3) {
      var arr = [];
      var garr = [];
      for (var i = 0; i < 16; i++) {
        arr.push(packet.body.readInt16BE(2 * i, 2) / 72.2);
      }
      for (var i = 0; i < 30; i++) {
        garr.push((packet.body.readInt8(32 + i, 2) * 15.6) / 1000);
      }
      // console.log(arr);
      // console.log(garr);
    }
  }
};
