import Message from './Message'
import { Transform } from 'stream'
import { inherits } from 'util'

let debug = require('debug')('ircs:MessageParser')

/**
 * Turns a stream of plain text IRC commands into a stream of IRC Message objects.
 */
export default function MessageParser() {
  if (!(this instanceof MessageParser)) return new MessageParser()
  Transform.call(this, { decodeStrings: false })

  this._readableState.objectMode = true

  this._buffer = ''
}

inherits(MessageParser, Transform)

MessageParser.prototype._transform = function (chunk, enc, cb) {
  chunk = this._buffer + chunk

  let pieces = chunk.split('\r\n')
  this._buffer = pieces.pop()


  pieces.forEach(line => this.push(this.parse(line)))

  cb()
}

/**
 * Parses an individual IRC command.
 *
 * @param {string} line IRC command string.
 * @return {Message}
 */
MessageParser.prototype.parse = function (line) {
  debug('parsing', line)

  let prefix
    , command
    , params

  if (line[0] === ':') {
    let prefixEnd = line.indexOf(' ')
    prefix = line.slice(1, prefixEnd)
    line = line.slice(prefixEnd + 1)
  }

  let colon = line.indexOf(' :')
  if (colon !== -1) {
    let append = line.slice(colon + 2)
    line = line.slice(0, colon)
    params = line.split(/ +/g).concat([ append ])
  }
  else {
    params = line.split(/ +/g)
  }

  command = params.shift()
  return Message(prefix, command, params)
}
