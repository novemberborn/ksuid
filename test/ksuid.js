import test from 'ava'
import lolex from 'lolex'

import KSUID from '../'

lolex.install(14e11)

test('created with the current time', t => {
  const x = new KSUID()
  t.is(x.date.valueOf(), 14e11)
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
  t.throws(() => KSUID.parse('123'), TypeError)

  const zero = new KSUID(Buffer.alloc(20, 0))
  const parsedZero = KSUID.parse('0'.repeat(27))
  t.is(zero.compare(parsedZero), 0)

  const max = new KSUID(Buffer.alloc(20, 0xFF))
  const parsedMax = KSUID.parse(KSUID.MAX_STRING_ENCODED)
  t.is(max.compare(parsedMax), 0)
})

test('encode and decode', t => {
  const x = new KSUID()
  const builtFromEncodedString = KSUID.parse(x.string)
  t.is(x.compare(builtFromEncodedString), 0)
})
