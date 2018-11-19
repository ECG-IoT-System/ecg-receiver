var request = require('request');

var urls = {
  version3: 'https://3-dot-ecgproject-1069.appspot.com/', // ECG3LTIME
  phpserver: 'https://phpserver-dot-ecgproject-1069.appspot.com/', // ECG3LTIME_Advantech
};

// key can't be 0
var devices = {
  // 8 dead
  10: 'a0e6f8ffbeb5',
  14: 'a0e6f8fefc6b',
  15: 'cc78abad400b',
  16: 'cc78abad2356',
  27: 'cc78abad24b8',
  41: 'a0e6f8fefb21',
  64: 'cc78abad4072',
  65: 'a0e6f8fefadd',
  66: 'a0e6f8fefc6c', // unstabled
  84: 'cc78abad40b2',
  85: 'a0e6f8fefc42', // dead
  86: 'cc78abad40a6', // unstabled
};

var deviceMapping = {
  [devices[10]]: {id: 0, url: urls.phpserver},
  [devices[41]]: {id: 1, url: urls.phpserver},
  [devices[86]]: {id: 2, url: urls.phpserver},

  [devices[64]]: {id: 0, url: urls.phpserver},
  [devices[65]]: {id: 1, url: urls.phpserver},
  [devices[84]]: {id: 2, url: urls.phpserver},

  [devices[14]]: {id: 0, url: urls.phpserver},
  [devices[15]]: {id: 1, url: urls.phpserver},
  [devices[16]]: {id: 2, url: urls.phpserver},
};

function getKeyByValue(object, value) {
  return Object.keys(object).find(key => object[key] === value);
}

// Data Format
// [[{"count":256},{"deviceid":0,"time":32377166,"data":-0.061694335937500004}, ... ]
exports.sendRssi = function(time, data, mac, rssi) {
  var device = deviceMapping[mac];
  var pad_id = getKeyByValue(devices, mac);

  if (!device) return console.log('\x1b[31m', '[PHPSERVER] Packet Discard. pad:', pad_id, '\x1b[0m');

  var body = {
    Pad_id: pad_id,
    Mac: mac,
    Rssi: rssi,
    TimeStamp: time[0],
  };

  var options = {
    uri: device.url,
    method: 'POST',
    json: body,
  };

  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      // do some thing
    }
  });

  console.log('\x1b[32m', '[PHPSERVER] Packet Sent. pad:', pad_id, 'device id:', device.id, '\x1b[0m');
};
