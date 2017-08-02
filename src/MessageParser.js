const Message = require('./Message')
const { Transform } = require('readable-stream')

const debug = require('debug')('ircs:MessageParser')

module.exports = class MessageParser extends Transform {
  constructor () {
    super({
      decodeStrings: false,
      readableObjectMode: true
    })

    this._buffer = ''
  }

  _transform (chunk, enc, cb) {
    chunk = this._buffer + chunk

    let pieces = chunk.split('\r\n')
    this._buffer = pieces.pop()

    pieces.forEach((line) => {
      this.push(this.parse(line))
    })

    cb()
  }

  /**
   * Parses an individual IRC command.
   *
   * @param {string} line IRC command string.
   * @return {Message}
   */
  parse (line) {
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
    return new Message(prefix, command, params)
  }
}
