# mag-format-message [![Build Status](https://travis-ci.org/mahnunchik/mag-format-message.svg)](https://travis-ci.org/mahnunchik/mag-format-message)

[Mag](https://github.com/mahnunchik/mag) is the streaming logger for NodeJS

`mag-format-message` is transform stream that makes formatted message from arguments by [util.format](http://nodejs.org/api/util.html#util_util_format_format) function.

## Installation

It makes sense to use `mag-format-message` with `mag-hub`. 

```
$ npm install mag-format-message mag-hub --save
```

## Usage

```
var hub = require('mag-hub');
var fromat = require('mag-format-message');
hub.pipe(format())
  .pipe(/* anything else */)
  .pipe(process.stdout);
```

## License

MIT
