var Message = require('./Message')
  , split = require('split')
  , debug = require('debug')('ircs:MessageParser')

module.exports = MessageParser

/**
 * Turns a stream of plain text IRC commands into a stream of IRC Message objects.
 */
function MessageParser() {
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

  var prefix
    , command
    , params

  if (line[0] === ':') {
    var prefixEnd = line.indexOf(' ')
    prefix = line.slice(1, prefixEnd)
    line = line.slice(prefixEnd + 1)
  }

  var colon = line.indexOf(' :')
    , append
  if (colon !== -1) {
    append = line.slice(colon + 2)
    line = line.slice(0, colon)
    params = line.split(/ +/g).concat([ append ])
  }
  else {
    params = line.split(/ +/g)
  }

  command = params.shift()
  return Message(prefix, command, params)
}
