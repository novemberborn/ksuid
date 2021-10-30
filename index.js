'use strict'
const { randomBytes } = require('crypto')
const { inspect: { custom: customInspectSymbol }, promisify } = require('util')
const base62 = require('./base62')

const asyncRandomBytes = promisify(randomBytes)

// KSUID's epoch starts more recently so that the 32-bit number space gives a
// significantly higher useful lifetime of around 136 years from March 2014.
// This number (14e11) was picked to be easy to remember.
const EPOCH_IN_MS = 14e11

const MAX_TIME_IN_MS = 1e3 * (2 ** 32 - 1) + EPOCH_IN_MS

// Timestamp is a uint32
const TIMESTAMP_BYTE_LENGTH = 4

// Payload is 16-bytes
const PAYLOAD_BYTE_LENGTH = 16

// KSUIDs are 20 bytes when binary encoded
const BYTE_LENGTH = TIMESTAMP_BYTE_LENGTH + PAYLOAD_BYTE_LENGTH

// The length of a KSUID when string (base62) encoded
const STRING_ENCODED_LENGTH = 27

const TIME_IN_MS_ASSERTION = `Valid KSUID timestamps must be in milliseconds since ${new Date(0).toISOString()},
  no earlier than ${new Date(EPOCH_IN_MS).toISOString()} and no later than ${new Date(MAX_TIME_IN_MS).toISOString()}
`.trim().replace(/(\n|\s)+/g, ' ').replace(/\.000Z/g, 'Z')

const VALID_ENCODING_ASSERTION = `Valid encoded KSUIDs are ${STRING_ENCODED_LENGTH} characters`

const VALID_BUFFER_ASSERTION = `Valid KSUID buffers are ${BYTE_LENGTH} bytes`

const VALID_PAYLOAD_ASSERTION = `Valid KSUID payloads are ${PAYLOAD_BYTE_LENGTH} bytes`

function fromParts (timeInMs, payload) {
  const timestamp = Math.floor((timeInMs - EPOCH_IN_MS) / 1e3)
  const timestampBuffer = Buffer.allocUnsafe(TIMESTAMP_BYTE_LENGTH)
  timestampBuffer.writeUInt32BE(timestamp, 0)

  return Buffer.concat([timestampBuffer, payload], BYTE_LENGTH)
}

const bufferLookup = new WeakMap()

class KSUID {
  constructor (buffer) {
    if (!KSUID.isValid(buffer)) {
      throw new TypeError(VALID_BUFFER_ASSERTION)
    }

    bufferLookup.set(this, buffer)
    Object.defineProperty(this, 'buffer', {
      enumerable: true,
      get () { return Buffer.from(buffer) }
    })
  }

  get raw () {
    return Buffer.from(bufferLookup.get(this).slice(0))
  }

  get date () {
    return new Date(1e3 * this.timestamp + EPOCH_IN_MS)
  }

  get timestamp () {
    return bufferLookup.get(this).readUInt32BE(0)
  }

  get payload () {
    const payload = bufferLookup.get(this).slice(TIMESTAMP_BYTE_LENGTH, BYTE_LENGTH)
    return Buffer.from(payload)
  }

  get string () {
    const encoded = base62.encode(bufferLookup.get(this), STRING_ENCODED_LENGTH)
    return encoded.padStart(STRING_ENCODED_LENGTH, '0')
  }

  compare (other) {
    if (!bufferLookup.has(other)) {
      return 0
    }

    return bufferLookup.get(this).compare(bufferLookup.get(other), 0, BYTE_LENGTH)
  }

  equals (other) {
    return this === other || (bufferLookup.has(other) && this.compare(other) === 0)
  }

  toString () {
    return `${this[Symbol.toStringTag]} { ${this.string} }`
  }

  toJSON () {
    return this.string
  }

  [customInspectSymbol] () {
    return this.toString()
  }

  static async random (time = Date.now()) {
    const payload = await asyncRandomBytes(PAYLOAD_BYTE_LENGTH)
    return new KSUID(fromParts(Number(time), payload))
  }

  static randomSync (time = Date.now()) {
    const payload = randomBytes(PAYLOAD_BYTE_LENGTH)
    return new KSUID(fromParts(Number(time), payload))
  }

  static fromParts (timeInMs, payload) {
    if (!Number.isInteger(timeInMs) || timeInMs < EPOCH_IN_MS || timeInMs > MAX_TIME_IN_MS) {
      throw new TypeError(TIME_IN_MS_ASSERTION)
    }
    if (!Buffer.isBuffer(payload) || payload.byteLength !== PAYLOAD_BYTE_LENGTH) {
      throw new TypeError(VALID_PAYLOAD_ASSERTION)
    }

    return new KSUID(fromParts(timeInMs, payload))
  }

  static isValid (buffer) {
    return Buffer.isBuffer(buffer) && buffer.byteLength === BYTE_LENGTH
  }

  static parse (string) {
    if (string.length !== STRING_ENCODED_LENGTH) {
      throw new TypeError(VALID_ENCODING_ASSERTION)
    }

    const decoded = base62.decode(string, BYTE_LENGTH)
    if (decoded.byteLength === BYTE_LENGTH) {
      return new KSUID(decoded)
    }

    const buffer = Buffer.allocUnsafe(BYTE_LENGTH)
    const padEnd = BYTE_LENGTH - decoded.byteLength
    buffer.fill(0, 0, padEnd)
    decoded.copy(buffer, padEnd)
    return new KSUID(buffer)
  }
}
Object.defineProperty(KSUID.prototype, Symbol.toStringTag, { value: 'KSUID' })
// A string-encoded maximum value for a KSUID
Object.defineProperty(KSUID, 'MAX_STRING_ENCODED', { value: 'aWgEPTl1tmebfsQzFP4bxwgy80V' })
// A string-encoded minimum value for a KSUID
Object.defineProperty(KSUID, 'MIN_STRING_ENCODED', { value: '000000000000000000000000000' })

module.exports = KSUID
