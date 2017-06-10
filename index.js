'use strict'

const {randomBytes} = require('crypto')
const {promisify} = require('util')
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
`.trim().replace(/\s+/, ' ').replace(/\.000Z/g, 'Z')

const VALID_ENCODING_ASSERTION = `Valid encoded KSUIDs are ${STRING_ENCODED_LENGTH} characters`

const VALID_BUFFER_ASSERTION = `Valid KSUID buffers are ${BYTE_LENGTH} bytes`

const VALID_PAYLOAD_ASSERTION = `Valid KSUID payloads are ${PAYLOAD_BYTE_LENGTH} bytes`

function fromParts (timeInMs, payload) {
  const timestamp = Math.floor((timeInMs - EPOCH_IN_MS) / 1e3)
  const timestampBuffer = Buffer.allocUnsafe(TIMESTAMP_BYTE_LENGTH)
  timestampBuffer.writeUInt32BE(timestamp, 0)

  return Buffer.concat([timestampBuffer, payload], BYTE_LENGTH)
}

function randomSync () {
  const payload = randomBytes(PAYLOAD_BYTE_LENGTH)
  return fromParts(Date.now(), payload)
}

class KSUID {
  constructor (buffer = randomSync()) {
    if (!KSUID.isValid(buffer)) {
      throw new TypeError(VALID_BUFFER_ASSERTION)
    }

    this.buffer = buffer
  }

  get date () {
    return new Date(1e3 * this.timestamp + EPOCH_IN_MS)
  }

  get timestamp () {
    return this.buffer.readUInt32BE(0)
  }

  get payload () {
    return this.buffer.slice(TIMESTAMP_BYTE_LENGTH, BYTE_LENGTH)
  }

  get string () {
    const encoded = base62.encode(this.buffer, STRING_ENCODED_LENGTH)
    return encoded.padStart(STRING_ENCODED_LENGTH, '0')
  }

  compare (other) {
    if (!other || other[Symbol.toStringTag] !== 'ksuid') {
      return 0
    }

    return this.buffer.compare(other.buffer, 0, BYTE_LENGTH)
  }

  static async random () {
    const payload = await asyncRandomBytes(PAYLOAD_BYTE_LENGTH)
    return new KSUID(fromParts(Date.now(), payload))
  }

  static fromParts (timeInMs, payload) {
    if (!Number.isInteger(timeInMs) || timeInMs < EPOCH_IN_MS || timeInMs > MAX_TIME_IN_MS) {
      throw new TypeError(TIME_IN_MS_ASSERTION)
    }
    if (!Buffer.isBuffer(payload) || payload.byteLength !== PAYLOAD_BYTE_LENGTH) {
      throw new TypeError(VALID_PAYLOAD_ASSERTION)
    }

    return fromParts(timeInMs, payload)
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

    const padded = Buffer.alloc(BYTE_LENGTH)
    decoded.copy(padded, BYTE_LENGTH - decoded.byteLength)
    return new KSUID(padded)
  }
}
Object.defineProperty(KSUID.prototype, Symbol.toStringTag, {value: 'ksuid'})
// A string-encoded maximum value for a KSUID
Object.defineProperty(KSUID, 'MAX_STRING_ENCODED', {value: 'aWgEPTl1tmebfsQzFP4bxwgy80V'})

module.exports = KSUID
