
var hub = require('mag-hub');
var through2 = require('through2');
var format = require('../');

hub.pipe(format())
  .pipe(through2.obj(function(data, enc, cb){
    cb(null, data.message + '\n');
  }))
  .pipe(process.stdout);

var logger = require('mag')();

logger.info('examle of %s', 'mag-format-message');
logger.debug('mag methids:\n ', logger);
