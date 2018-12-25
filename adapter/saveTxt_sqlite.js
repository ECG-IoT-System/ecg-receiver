const Sequelize = require('sequelize');
const sequelize = new Sequelize('ecgData', null, null, {
  dialect: 'sqlite',
  storage: './test.db',
});

sequelize.authenticate().then(
  function(err) {
    console.log('Connection has been established successfully.');
  },
  function(err) {
    console.log('Unable to connect to the database:', err);
  },
);

//  MODELS
var EcgData = sequelize.define('ecgData', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
  },
  time: Sequelize.DATE,
  value: Sequelize.DOUBLE,
});

EcgData.sync();

//  SYNC SCHEMA
sequelize.sync({force: true}).then(
  function(err) {
    console.log('It worked!');
    exports.send = send;
  },
  function(err) {
    console.log('An error occurred while creating the table:', err);
  },
);

function send(time, data, gsensor, mac, rssi) {
  console.log(time);

  var count = data.length;
  var sample_rate = (time[1] - time[0]) / count;

  var body = [];

  data.forEach((d, index) => {
    body.push({
      time: time[0] + index * sample_rate,
      value: d,
    });
  });

  EcgData.bulkCreate(body)
    .then(() => {
      return EcgData.findAll();
    })
    .then(ecgdata => {
      console.log(ecgdata);
    });
}
