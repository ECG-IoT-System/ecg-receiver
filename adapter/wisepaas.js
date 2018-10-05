var mqtt = require('mqtt'),
  url = require('url');

// Parse
var mqtt_url = url.parse(process.env.MQTT_HOST || 'mqtt://localhost:1883');
console.log(mqtt_url);
var url = 'mqtt://' + mqtt_url.host;

var options = {
  port: mqtt_url.port,
  clientId:
    'mqttjs_' +
    Math.random()
      .toString(16)
      .substr(2, 8),
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
};

console.log(url, options);

// Create a client connection
var client = mqtt.connect(
  url,
  options,
);

client.on('connect', function() {
  console.log('mqtt connected');
});

client.on('error', function(err) {
  console.log('err', err);
});

// setInterval(function() {
//   var msg = '{"content":"hi"}';
//   client.publish('wisepaas/test', msg);
//   console.log('pub', msg);
// }, 1000);

exports.send = function(msg) {
  client.publish('wisepaas/test', msg);
  console.log('pub', msg);
};
