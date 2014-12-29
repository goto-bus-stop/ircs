var Transform = require('stream').Transform
  , util = require('util')
  , Message = require('./Message')

module.exports = MessageParser

function MessageParser() {
  if (!(this instanceof MessageParser)) return new MessageParser()
  Transform.call(this)
  this._readableState.objectMode = true
  this.buffer = null
}
util.inherits(MessageParser, Transform)

MessageParser.prototype._transform = function (buf, enc, cb) {
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

  if (offs < buf.length) {
    this.buffer = buf.slice(offs)
  }
}

MessageParser.prototype.parse = function (line) {
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
