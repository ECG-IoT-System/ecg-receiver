const {ErrorReporting} = require('@google-cloud/error-reporting');

class Error {
  constructor(key) {
    // process.env.NODE_ENV = 'staging';
    key.ignoreEnvironmentCheck = true;

    this.key = key;
    this.errors = new ErrorReporting(key);
  }

  isKeyExist() {
    return key.projectId && key.keyFilename;
  }

  report(str) {
    if (this.isKeyExist()) {
      this.errors.report(str);
    }
    console.log('\x1b[31m' + str + '\x1b[0m');
  }
}

try {
  var key = require('./env.key.json');
} catch (e) {
  var key = {};
  console.log('[Warn] ./config/env.key.json is not found');
} finally {
  var error = new Error(key);
}

module.exports = error.report;
