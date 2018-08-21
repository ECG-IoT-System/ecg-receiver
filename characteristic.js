module.exports = class Characteristic {
  constructor(characteristic) {
    this.chr = characteristic;
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
};
