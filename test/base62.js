import test from 'ava'
import base62 from '../base62'

test('values can be encoded and decoded', t => {
  const input = Buffer.from([255, 254, 253, 251])
  const actual = base62.decode(base62.encode(input))
  t.true(input.equals(actual))
})

test('lexographic ordering of encoded values is that of decoded values', t => {
  const strings = []
  for (let i = 0; i < 256; i++) {
    const s = base62.encode([0, i])
    strings[i] = '0'.repeat(2 - s.length) + s
  }

  const sorted = strings.slice().sort()
  t.deepEqual(strings, sorted)
})
