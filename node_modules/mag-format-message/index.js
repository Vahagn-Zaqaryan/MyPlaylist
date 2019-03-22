
var Transform = require('readable-stream/transform');
var util = require('util');

module.exports = function() {
  var stream = new Transform({objectMode: true});

  stream._transform = function(data, encoding, cb) {
    if (!data.message) {
      if (data.arguments) {
        data.message = util.format.apply(this, data.arguments);
      } else {
        data.message = util.inspect(data);
      }
    }
    cb(null, data);
  };
  return stream;
};
