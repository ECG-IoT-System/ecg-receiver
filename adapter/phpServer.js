var request = require('request');

var deviceMapping = {
  cc78abad4072: 0, // 64
  a0e6f8fefadd: 1, // 65
  a0e6f8fefc6c: 2, // 66
};

exports.send = function(time, data, peri) {
  // [[{"count":256},{"deviceid":0,"time":32377166,"data":-0.061694335937500004}, ... ]
  var mac_address = peri.address.replace(/:/g, '');
  var deviceid = deviceMapping[mac_address];

  if (!deviceid) return console.log('[PHPSERVER] Packet Discard');

  var count = data.length;
  var sample_rate = (time[1] - time[0]) / count;

  var body = [{count}];

  data.forEach((d, index) => {
    body.push({
      deviceid,
      time: time[0] + index * sample_rate,
      data: d,
    });
  });

  var options = {
    uri: 'https://3-dot-ecgproject-1069.appspot.com/',
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
