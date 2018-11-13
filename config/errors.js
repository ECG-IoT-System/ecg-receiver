const {ErrorReporting} = require('@google-cloud/error-reporting');

// process.env.NODE_ENV = 'staging';
var options = {
  ignoreEnvironmentCheck: true,
};

try {
  options = {
    ...options,
    ...require('./env.key.json'),
  };
} catch (e) {
  console.log('[Warn] ./config/env.key.json is not found');
}

if (options.projectId && options.keyFilename) {
  var errors = new ErrorReporting(options);
}

module.exports = function(str) {
  if (errors) {
    errors.report(str);
  }
  console.log('\x1b[31m' + str + '\x1b[0m');
};
