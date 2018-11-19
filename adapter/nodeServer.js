var request = require('request');

exports.send = function(time, data, mac, rssi) {
  var body = {
    mac,
    time,
    data,
    rssi,
  };

  var options = {
    uri: 'https://phpserver-dot-ecgproject-1069.appspot.com/',
    method: 'POST',
    json: body,
  };

  request(options, function(error, response, body) {
    if (!error && response.statusCode == 200) return console.log(error);
  });

  console.log('\x1b[32m', '[NODESERVER] Packet Sent. mac:', mac, '\x1b[0m');
};
