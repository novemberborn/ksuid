# ksuid

A Node.js implementation of [Segment's KSUID
library](https://github.com/segmentio/ksuid). Requires Node.js 6.

## Getting Started


require the module:

```
const ksuid = require( 'ksuid' );
```

create a KSUID instance in three different ways:

```
// synchronous
let ksuidFromSync = ksuid.randomSync();

// asynchronous
let ksuidFromAsync = await ksuid.random();

// from user-provided input (in case you don't want timestamp to be *now* for example.)
const {randomBytes} = require('crypto')
let yesterdayInMS = Date.now() - 86400 * 1000;
let randomBytes = randomBytes(16);
let yesterdayKSUID = ksuid.fromParts(yesterdayInMS,randomBytes)
```

Once the KSUID is generated, use it:
```
let todayKSUID = ksuid.randomSync();


todayKSUID.string // the string representation of the ksuid

todayKSUID.date // the javascript Date representation of the ksuid date

todayKSUID.timestamp // the ksuid timestamp 

todayKSUID.payload // the random bytes portion of the id
```

Comparison:
```
todayKSUID.compare(yesterdayKSUID) // 1
todayKSUID.compare(todayKSUID) // 0
yesterdayKSUID.compare(todayKSUID) // -1
```

Equality Check
```
todayKSUID.equals(todayKSUID) // true
todayKSUID.equals(yesterdayKSUID) // false
```