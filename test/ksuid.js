const { randomBytes } = require('crypto')
const { inspect } = require('util')
const test = require('ava')
const fakeTimers = require('@sinonjs/fake-timers')

const KSUID = require('..')

const clock = fakeTimers.install({ now: 14e11, toFake: ['Date'] })

test.serial('created with the current time', t => {
  const x = KSUID.randomSync()
  t.is(x.date.valueOf(), 14e11)
})

test.serial('provides the uncorrected timestamp in seconds', t => {
  clock.tick(5e3)
  const x = KSUID.randomSync()
  t.is(x.timestamp * 1e3, Date.now() - 14e11)
})

test('random accepts milliseconds value', async t => {
  const ms = (new Date(2025, 4, 15)).getTime()
  const x = await KSUID.random(ms)
  t.is(x.timestamp * 1e3, ms - 14e11)
})

test('randomSync accepts milliseconds value', t => {
  const ms = (new Date(2025, 4, 15)).getTime()
  const x = KSUID.randomSync(ms)
  t.is(x.timestamp * 1e3, ms - 14e11)
})

test('random accepts date value', async t => {
  const d = new Date(2014, 4, 15)
  const x = await KSUID.random(d)
  t.is(x.timestamp * 1e3, d.getTime() - 14e11)
})

test('randomSync accepts date value', t => {
  const d = new Date(2014, 4, 15)
  const x = KSUID.randomSync(d)
  t.is(x.timestamp * 1e3, d.getTime() - 14e11)
})

test('encodes as a string', t => {
  const x = new KSUID(Buffer.alloc(20))
  const expected = '0'.repeat(27)
  t.is(x.string, expected)
})

test('strings are padded', t => {
  const zero = new KSUID(Buffer.alloc(20, 0))
  const max = new KSUID(Buffer.alloc(20, 0xFF))
  t.is(zero.length, max.length)
})

test('can parse strings', t => {
  t.throws(() => KSUID.parse('123'), { name: 'TypeError' })

  const zero = new KSUID(Buffer.alloc(20, 0))
  const parsedZero = KSUID.parse('0'.repeat(27))
  t.is(zero.compare(parsedZero), 0)

  const max = new KSUID(Buffer.alloc(20, 0xFF))
  const parsedMax = KSUID.parse(KSUID.MAX_STRING_ENCODED)
  t.is(max.compare(parsedMax), 0)
})

test('encode and decode', t => {
  const x = KSUID.randomSync()
  const builtFromEncodedString = KSUID.parse(x.string)
  t.is(x.compare(builtFromEncodedString), 0)
})

test('throws if called without valid buffer', t => {
  t.throws(() => new KSUID(), { name: 'TypeError' })
  t.throws(() => new KSUID('foo'), { name: 'TypeError' })
  t.throws(() => new KSUID(Buffer.from('foo')), { name: 'TypeError' })
})

test('buffer accessor returns new buffers', t => {
  const initial = randomBytes(20)
  const x = new KSUID(initial)
  t.not(x.buffer, initial)
  t.not(x.buffer, x.buffer)
  t.true(x.buffer.equals(initial))
})

test('raw accessor returns raw buffer', t => {
  const expected = Buffer.alloc(20, 0xFF)
  const x = new KSUID(expected)
  t.true(x.raw.equals(expected))
})

test('raw accessor returns new buffers', t => {
  const expected = Buffer.alloc(20, 0xFF)
  const x = new KSUID(expected)
  t.not(x.raw, x.raw)
})

test('payload accessor returns payload buffer', t => {
  const expected = Buffer.alloc(16, 0xFF)
  const x = new KSUID(Buffer.concat([Buffer.alloc(4), expected]))
  t.true(x.payload.equals(expected))
})

test('payload accessor returns new buffers', t => {
  const expected = Buffer.alloc(16, 0xFF)
  const x = new KSUID(Buffer.concat([Buffer.alloc(4), expected]))
  t.not(x.payload, x.payload)
})

test('compare() returns 0 when comparing against a non-KSUID', t => {
  t.is(KSUID.randomSync().compare({}), 0)
})

test('equal()', t => {
  const x = KSUID.randomSync()
  const y = KSUID.randomSync()
  t.true(x.equals(x))
  t.false(x.equals(y))
  t.false(y.equals(x))
  t.true(x.equals(new KSUID(x.buffer)))
  t.true(new KSUID(x.buffer).equals(x))
})

test('toString()', t => {
  const x = KSUID.randomSync()
  const [, string] = /^KSUID \{ (.+?) \}$/.exec(x.toString())
  t.is(KSUID.parse(string).string, string)
})

test('[util.inspect.custom]()', t => {
  const x = KSUID.randomSync()
  t.is(inspect(x), x.toString())
})

test('KSUID.random() returns a promise for a new instance', async t => {
  const p = KSUID.random()
  t.true(typeof p.then === 'function')
  t.true(await p instanceof KSUID)
})

test('KSUID.fromParts() validates timeInMs', t => {
  const { message: notInt } = t.throws(() => KSUID.fromParts('foo', Buffer.alloc(16)), { name: 'TypeError' })
  const { message: tooEarly } = t.throws(() => KSUID.fromParts(0, Buffer.alloc(16)), { name: 'TypeError' })
  const { message: tooLate } = t.throws(() => KSUID.fromParts(1e3 * (2 ** 32 - 1) + 14e11 + 1, Buffer.alloc(16)), { name: 'TypeError' })
  t.true(new Set([notInt, tooEarly, tooLate]).size === 1)
  t.is(notInt, 'Valid KSUID timestamps must be in milliseconds since 1970-01-01T00:00:00Z, no earlier than 2014-05-13T16:53:20Z and no later than 2150-06-19T23:21:35Z') // eslint-disable-line max-len
})

test('KSUID.fromParts() validates payload', t => {
  const { message: notInt } = t.throws(() => KSUID.fromParts(Date.now(), 'foo'), { name: 'TypeError' })
  const { message: tooSmall } = t.throws(() => KSUID.fromParts(Date.now(), Buffer.alloc(15)), { name: 'TypeError' })
  const { message: tooLarge } = t.throws(() => KSUID.fromParts(Date.now(), Buffer.alloc(17)), { name: 'TypeError' })
  t.true(new Set([notInt, tooSmall, tooLarge]).size === 1)
  t.is(notInt, 'Valid KSUID payloads are 16 bytes')
})

test('KSUID.fromParts() creates a new instance', t => {
  const x = KSUID.randomSync()
  const y = KSUID.fromParts(x.timestamp * 1e3 + 14e11, x.payload)
  t.true(x.equals(y))
})

test('snapshots', t => {
  const id = KSUID.fromParts(new Date('2017-06-28').valueOf(), Buffer.from('decafbad'.repeat(4), 'hex'))
  t.snapshot(id, 'Raw KSUID')
  t.snapshot(id.string, 'String KSUID')
})
