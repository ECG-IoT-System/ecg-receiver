var request = require('request');

var deviceMapping = {
  cc78abad4072: [0, 'https://3-dot-ecgproject-1069.appspot.com/'], // 64
  a0e6f8fefadd: [1, 'https://3-dot-ecgproject-1069.appspot.com/'], // 65
  a0e6f8fefc6c: [2, 'https://3-dot-ecgproject-1069.appspot.com/'], // 66
  cc78abad40b2: [0, 'https://phpserver-dot-ecgproject-1069.appspot.com/'], // 84
  a0e6f8fefb21: [1, 'https://phpserver-dot-ecgproject-1069.appspot.com/'], // 41
  cc78abad40a6: [2, 'https://phpserver-dot-ecgproject-1069.appspot.com/'], // 86
  // a0e6f8fefc42: [1, 'https://phpserver-dot-ecgproject-1069.appspot.com/'], // 85, dead
};

exports.send = function(time, data, peri) {
  // [[{"count":256},{"deviceid":0,"time":32377166,"data":-0.061694335937500004}, ... ]
  var mac_address = peri.address.replace(/:/g, '');
  var device = deviceMapping[mac_address];

  // if (typeof device !== 'number') return console.log('[PHPSERVER] Packet Discard');
  if (!device) return console.log('[PHPSERVER] Packet Discard');

  var count = data.length;
  var sample_rate = (time[1] - time[0]) / count;

  var body = [{count}];

  data.forEach((d, index) => {
    body.push({
      deviceid: device[0],
      time: time[0] + index * sample_rate,
      data: d,
    });
  });

  var options = {
    uri: device[1],
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
