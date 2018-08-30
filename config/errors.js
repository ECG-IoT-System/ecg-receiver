const {ErrorReporting} = require('@google-cloud/error-reporting');

const env = require('./env.key.json');

// process.env.NODE_ENV = 'staging';

var errors = new ErrorReporting({
  ignoreEnvironmentCheck: true,
  projectId: env.projectId,
  keyFilename: env.keyFilename,
});

module.exports = function(str) {
  errors.report(str);
  console.log('\x1b[31m' + str + '\x1b[0m');
};
