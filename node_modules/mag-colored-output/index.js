
var Transform = require('readable-stream/transform');
var chalk = require('chalk');
var util = require('util');

var severityNames = [
  'PANIC',
  'ALERT',
  'CRIT',
  'ERROR',
  'WARN',
  'NOTICE',
  'INFO',
  'DEBUG'
];

var severityColors = [
  'magenta',
  'red',
  'red',
  'red',
  'yellow',
  'blue',
  'green',
  'cyan'
];

var colors = [
  'green',
  'magenta',
  'yellow',
  'red',
  'blue',
  'cyan',
  'white',
  'gray',
  'black'
];

var namespaceColors = {};

var prevColor = 0;

function namespaceColor(namespace) {
  var color = namespaceColors[namespace];
  if (!color){
    color = colors[prevColor++ % colors.length];
    namespaceColors[namespace] = color;
  }
  return color;
}


module.exports = function() {
  var stream = new Transform({objectMode: true});

  stream._transform = function(data, encoding, cb) {
    var severity = severityNames[data.severity] || 'DEBUG';
    var severityColor = severityColors[data.severity] || 'white';
    var timestamp = data.timestamp || new Date();
    var message = data.message || 'message not set ' + util.inspect(data);

    var str = timestamp.toLocaleString();

    if (data.hostname) {
      str += ' ' + data.hostname;
    }

    if (data.namespace) {
      var color = namespaceColor(data.namespace);
      var append = ' ' + data.namespace;
      if (data.pid) {
        append += '[' + data.pid + ']';
      }
      str += chalk[color](append);
    } else if (data.pid) {
      str += ' [' + data.pid + ']';
    }


    str += ' ' + chalk[severityColor].bold(severity) + ' ' + message + '\n';

    cb(null, str);
  };

  return stream;
};
