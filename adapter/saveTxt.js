const fs = require('fs');

let count = 0;

exports.send = function(time, data, gsensor, mac, rssi) {
  console.log(time);

  let str = '';
  data.forEach(d => {
    str += count + '\t' + d + '\n';
    count++;
  });

  fs.appendFile('out.txt', str, function(err) {
    if (err) {
      return console.log(err);
    }
  });

  console.log('\x1b[32m', '[SAVETXT] ', mac, '\x1b[0m');
};
