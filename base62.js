'use strict'

const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

// Compact base conversion.
function convert (input, from, to, maxLength = Math.ceil(input.length * Math.log2(from) / Math.log2(to))) {
  const result = new Array(maxLength)

  // Each iteration prepends the resulting value, so start the offset at the
  // end.
  let offset = maxLength
  while (input.length > 0) {
    const quotients = []
    let remainder = 0

    for (const digit of input) {
      const acc = digit + remainder * from
      const q = Math.floor(acc / to)
      remainder = acc % to

      if (quotients.length > 0 || q > 0) {
        quotients.push(q)
      }
    }

    result[--offset] = remainder
    input = quotients
  }

  // Trim leading padding.
  return offset > 0
    ? result.slice(offset)
    : result
}

function encode (buffer, maxLength) {
  return convert(buffer, 256, 62, maxLength)
    .map(value => CHARS[value])
    .join('')
}
exports.encode = encode

function decode (string, maxLength) {
  // Optimization from https://github.com/andrew/base62.js/pull/31.
  const input = Array.from(string, char => {
    const charCode = char.charCodeAt(0)
    if (charCode < 58) return charCode - 48
    if (charCode < 91) return charCode - 55
    return charCode - 61
  })
  return Buffer.from(convert(input, 62, 256, maxLength))
}
exports.decode = decode
