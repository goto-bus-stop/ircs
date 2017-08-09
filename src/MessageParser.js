const combine = require('stream-combiner')
const through = require('through2')
const split = require('split2')
const Message = require('./Message')

const debug = require('debug')('ircs:MessageParser')

module.exports = function MessageParser () {
  return combine(
    split('\r\n'),
    through.obj(parse)
  )

  /**
   * Parses an individual IRC command.
   *
   * @param {string} line IRC command string.
   * @return {Message}
   */
  function parse (line, enc, cb) {
    debug('parsing', line)

    let prefix
    let command
    let params

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
    } else {
      params = line.split(/ +/g)
    }

    command = params.shift()
    cb(null, new Message(prefix, command, params))
  }
}
