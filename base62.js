'use strict'
const baseConvertIntArray = require('base-convert-int-array')

const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

function encode (buffer, fixedLength) {
  return baseConvertIntArray(buffer, { from: 256, to: 62, fixedLength })
    .map(value => CHARS[value])
    .join('')
}
exports.encode = encode

function decode (string, fixedLength) {
  // Optimization from https://github.com/andrew/base62.js/pull/31.
  const input = Array.from(string, char => {
    const charCode = char.charCodeAt(0)
    if (charCode < 58) return charCode - 48
    if (charCode < 91) return charCode - 55
    return charCode - 61
  })
  return Buffer.from(baseConvertIntArray(input, { from: 62, to: 256, fixedLength }))
}
exports.decode = decode
