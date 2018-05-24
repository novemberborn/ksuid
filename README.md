# ksuid

A Node.js implementation of [Segment's KSUID
library](https://github.com/segmentio/ksuid). Supports Node.js 6, 8 and 10

## Installation

```console
$ npm install ksuid
```

## Usage

Require the module:

```js
const KSUID = require('ksuid')
```

### Creation

You can create a new instance synchronously:

```js
const ksuidFromSync = KSUID.randomSync()
```

Or asynchronously:

```js
const ksuidFromAsync = await KSUID.random()
```

Or you can compose it using a timestamp and a 16-byte payload:

```js
const crypto = require('crypto')
const yesterdayInMs = Date.now() - 86400 * 1000
const payload = crypto.randomBytes(16)
const yesterdayKSUID = KSUID.fromParts(yesterdayInMs, payload)
```

You can parse a valid string-encoded KSUID:

```js
const maxKsuid = KSUID.parse('aWgEPTl1tmebfsQzFP4bxwgy80V')
```

Finally, you can create a KSUID from a 20-byte buffer:

```js
const fromBuffer = new KSUID(buffer)
```

### Properties

Once the KSUID has been created, use it:

```js
ksuidFromSync.string // The KSUID encoded as a fixed-length string
ksuidFromSync.date // The timestamp portion of the KSUID, as a `Date` object
ksuidFromSync.timestamp // The raw timestamp portion of the KSUID, as a number
ksuidFromSync.payload // A Buffer containing the 16-byte payload of the KSUID (typically a random value)
```

### Comparisons

You can compare KSUIDs:

```js
todayKSUID.compare(yesterdayKSUID) // 1
todayKSUID.compare(todayKSUID) // 0
yesterdayKSUID.compare(todayKSUID) // -1
```

And check for equality:

```js
todayKSUID.equals(todayKSUID) // true
todayKSUID.equals(yesterdayKSUID) // false
```

### Validation

You can check whether a particular buffer is a valid KSUID:

```js
KSUID.isValid(buffer) // Boolean
```

# Command Line Tool

This package comes with a simple command-line tool `ksuid`. This tool can
generate KSUIDs as well as inspect the internal components for debugging
purposes.

## Usage examples

### Generate 4 KSUID

```sh
> ksuid -n 4
151zKb0yBE31siVu9GYmpi1vlfe
151zKUmtgUA8kRSgg5Q6tG6vqPx
151zKTalsFp5ddmaiEaXu7l3YTD
151zKUVLrYKQ1p6XNDRPIFbrN1w
```

### Inspect the components of a KSUID

Using the inspect formatting on just 1 ksuid:

```sh
> ksuid -f inspect

REPRESENTATION:

  String: 151zOCJ2I9szGtX4VwDJjnmvrpZ
     Raw: 0793CB58A38B910C80235B72A6F6B5DF5CA3C929

COMPONENTS:

       Time: 2018-05-24T01:46:00.000Z
  Timestamp: 127126360
    Payload: A38B910C80235B72A6F6B5DF5CA3C929
```

Using the template formatting on 4 ksuid:

```sh
> ksuid -f template -t '{{ .Time }}: {{ .Payload }}' -n 4
2018-05-24T01:46:31.000Z: B34547537772BBC0E2F29CACFC0BB5C2
2018-05-24T01:46:31.000Z: 79A4B61465263502F6F6B3D686F3B48E
2018-05-24T01:46:31.000Z: DBBF7F076962352AD8D60D45A34F5499
2018-05-24T01:46:31.000Z: B00E173900EBB05D768CADF13C3583D0
```

### Generate detailed versions of new KSUID

Generate a new KSUID with the corresponding time using the time formatting:

```sh
> ksuid -f time -v
151zVo4Jr8dajx0fqHWAPxDbHRs: 2018-05-24T01:47:01.000Z
```

Generate 4 new KSUID with details using template formatting:

```sh
> ksuid -f template -t '{ "timestamp": "{{ .Timestamp }}", "payload": "{{ .Payload }}", "ksuid": "{{.String}}"}' -n 4
{ "timestamp": "127126441", "payload": "AF7BF3D0DB709B7933AF1AE83FBF4FBA", "ksuid": "151zYNlpxMf7nbb8CikaE4SUPQw"}
{ "timestamp": "127126441", "payload": "6E92616BDA6CC1B983D238E496080BAC", "ksuid": "151zYLnLhlehuIEeodZLMQ41c4a"}
{ "timestamp": "127126441", "payload": "8D55A9221F760433347F2B08C597AF3F", "ksuid": "151zYMjOiZv7K8q4dEYYySDpyu7"}
{ "timestamp": "127126441", "payload": "22FB4CB82107AC16628F77F60A5BFFE0", "ksuid": "151zYJUiEi4iniicXeu9xShcm3c"}
```

Display the detailed version of a new KSUID:

```sh
> ksuid -f inspect

REPRESENTATION:

  String: 151zbEzzY29y1EMfAycgv4kZTod
     Raw: 0793CBC06EA61F24424C8C6ED6DD3C7540AB013F

COMPONENTS:

       Time: 2018-05-24T01:47:44.000Z
  Timestamp: 127126464
    Payload: 6EA61F24424C8C6ED6DD3C7540AB013F

```