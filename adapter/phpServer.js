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
  [devices[10]]: {id: 0, url: urls.version3},
  [devices[41]]: {id: 1, url: urls.version3},
  [devices[86]]: {id: 2, url: urls.version3},

  [devices[64]]: {id: 0, url: urls.version3},
  [devices[65]]: {id: 1, url: urls.version3},
  [devices[84]]: {id: 2, url: urls.version3},

  [devices[14]]: {id: 0, url: urls.version3},
  [devices[15]]: {id: 1, url: urls.version3},
  [devices[16]]: {id: 2, url: urls.version3},
};

// Data Format
// [[{"count":256},{"deviceid":0,"time":32377166,"data":-0.061694335937500004}, ... ]
exports.send = function(time, data, peri) {
  var mac_address = peri.address.replace(/:/g, '');
  var device = deviceMapping[mac_address];

  if (!device) return console.log('[PHPSERVER] Packet Discard');

  var count = data.length;
  var sample_rate = (time[1] - time[0]) / count;

  var body = [{count}];

  data.forEach((d, index) => {
    body.push({
      deviceid: device.id,
      time: time[0] + index * sample_rate,
      data: d,
    });
  });

  var options = {
    uri: device.url,
    method: 'POST',
    json: body,
  };

  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body); // Print the shortened url.
    }
  });

  console.log('[PHPSERVER] Packet Sent');
};
