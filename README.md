# ksuid

A Node.js implementation of [Segment's KSUID library](https://github.com/segmentio/ksuid). Requires Node.js 8.

# Usage

Generate a ksuid

```javascript
var KSUID = require('./index');
console.log(KSUID.randomSync().string)
```

Parse a ksuid

```javascript
var KSUID = require('./index');
var ksuid = KSUID.parse("0pdbEZZEWoCXaegkF1IjoAmTOqf");
console.log(ksuid.date);
console.log(ksuid.timestamp);
```

