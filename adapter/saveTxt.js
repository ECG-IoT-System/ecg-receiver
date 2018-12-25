const fs = require('fs');

let count = 0;
let g_count = 0;

exports.send = function(time, data, gsensor,mac, rssi) {
  console.log(time);
  
  //ecg data
  let str = '';
  data.forEach(d => {
    str += count + "\t" + d + "\n";
    count++
  })

  //G sensor data
  let str_gsensor = '';
  gsensor.forEach(g => {
    str_gsensor += g_count + "\t" + g + "\n";
    g_count++
  })

  fs.appendFile('out.txt', str, function(err) {
    if (err) {
      return console.log(err)
    }
  })

  fs.appendFile('gsensor_out.txt', str_gsensor, function(err){
    if (err){
      return console.log(err)
    }
  })

  console.log('\x1b[32m', '[SAVETXT] ', mac, '\x1b[0m');
};
