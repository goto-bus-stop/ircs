import Message from './Message'
import split from 'split'

let debug = require('debug')('ircs:MessageParser')

/**
 * Turns a stream of plain text IRC commands into a stream of IRC Message objects.
 */
export default function MessageParser() {
  return split('\r\n', MessageParser.prototype.parse)
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
