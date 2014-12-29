var Transform = require('stream').Transform
  , util = require('util')
  , Message = require('./Message')
  , debug = require('debug')('ircs:MessageParser')

module.exports = MessageParser

/**
 * Turns a stream of plain text IRC commands into a stream of IRC Message objects.
 */
function MessageParser() {
  if (!(this instanceof MessageParser)) return new MessageParser()
  Transform.call(this)
  this._readableState.objectMode = true
  this.buffer = null
}
util.inherits(MessageParser, Transform)

/**
 * Parses stuff.
 *
 * @param {Buffer} buf Buffer containing the latest command text.
 * @param {string} enc "buffer". (It better be.)
 * @param {function()} cb Callback, for when we're done parsing.
 * @private
 */
MessageParser.prototype._transform = function (buf, enc, cb) {
  debug('incoming', buf)
  buf = buf.toString('utf8')
  if (this.buffer) {
    buf = this.buffer + buf
    this.buffer = null
  }

  var last = 0
    , offs = 0
  while ((offs = buf.indexOf('\r\n', offs)) !== -1) {
    this.parse(buf.slice(last, offs))
    offs += 2
    last = offs
  }

  if (last < buf.length) {
    debug('buffering', buf.slice(last))
    this.buffer = buf.slice(last)
  }

  cb()
}

/**
 * Parses individual IRC commands. Result gets pushed into the stream.
 *
 * @param {string} line IRC command string.
 */
MessageParser.prototype.parse = function (line) {
  debug('parsing', line)
  var message = Message()
  if (line[0] === ':') {
    var prefixEnd = line.indexOf(' ')
    message.prefix = line.slice(1, prefixEnd)
    line = line.slice(prefixEnd + 1)
  }

  var colon = line.indexOf(' :')
    , append
    , params
  if (colon !== -1) {
    append = line.slice(colon + 2)
    line = line.slice(0, colon)
    params = line.split(/ +/g).concat([ append ])
  }
  else {
    params = line.split(/ +/g)
  }

  message.command = params.shift()
  message.parameters = params
  this.push(message)
}
