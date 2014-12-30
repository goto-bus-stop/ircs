module.exports = Message

/**
 * Represents an IRC message.
 *
 * @param {string|null} prefix Message prefix. (Optional.)
 * @param {string} command Command name.
 * @param {Array.<string>} parameters IRC Command parameters.
 */
function Message(prefix, command, parameters) {
  if (!(this instanceof Message)) return new Message(prefix, command, parameters)
  this.prefix = prefix
  this.command = command
  this.parameters = parameters

  if (parameters) {
    var last = parameters[parameters.length - 1]
    if (last && last.indexOf(' ') !== -1) {
      parameters[parameters.length - 1] = ':' + parameters[parameters.length - 1]
    }
  }
}

/**
 * Compiles the message back down into an IRC command string.
 *
 * @return {string} IRC command.
 */
Message.prototype.toString = function () {
  return (this.prefix ? ':' + this.prefix + ' ' : '') +
         this.command +
         (this.parameters ? ' ' + this.parameters.join(' ') : '')
}