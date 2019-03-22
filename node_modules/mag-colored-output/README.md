# mag-colored-output [![Build Status](https://travis-ci.org/mahnunchik/mag-colored-output.svg)](https://travis-ci.org/mahnunchik/mag-colored-output) [![Dependency Status](https://gemnasium.com/mahnunchik/mag-colored-output.svg)](https://gemnasium.com/mahnunchik/mag-colored-output)

[Mag](https://github.com/mahnunchik/mag) is the streaming logger for NodeJS

`mag-colored-output` is transform stream that makes collored message from log object.

## Installation

It makes sense to use `mag-colored-output` with `mag-hub` and for example `mag-format-message`. 

```
$ npm install mag-colored-output mag-format-message mag-hub --save
```

## Usage

```
var hub = require('mag-hub');
var format = require('mag-format-message');
var colored = require('mag-colored-output');

hub.pipe(format())
  .pipe(colored())
  .pipe(process.stdout);
```

## Note

`mag-colored-output` version 1.0.0 and greater compatible with [mag](https://github.com/mahnunchik/mag) version greater than 0.9.0

## License

[MIT](https://github.com/mahnunchik/mag-colored-output/blob/master/LICENSE)
