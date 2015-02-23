/**
 * Represents an IRC message.
 *
 * @param {string|null} prefix Message prefix. (Optional.)
 * @param {string} command Command name.
 * @param {Array.<string>} parameters IRC Command parameters.
 *
 * @constructor
 */
export default function Message(prefix, command, parameters) {
  if (!(this instanceof Message)) return new Message(prefix, command, parameters)
  /**
   * Message Prefix. Basically just the sender nickmask.
   * @member {string}
   */
  this.prefix = prefix
  /**
   * Command, i.e. what this message actually means to us!
   * @member {string}
   */
  this.command = command
  /**
   * Parameters given to this command.
   * @member {Array.<string>}
   */
  this.parameters = parameters
}

/**
 * Compiles the message back down into an IRC command string.
 *
 * @return {string} IRC command.
 */
Message.prototype.toString = function () {
  let parameters = this.parameters.slice(0)
  // prefix last parameter by : so it becomes trailing data
  if (parameters.length) {
    let last = parameters[parameters.length - 1]
    if (last && last.indexOf(' ') !== -1) {
      parameters[parameters.length - 1] = ':' + parameters[parameters.length - 1]
    }
  }

  return (this.prefix ? ':' + this.prefix + ' ' : '') +
         this.command +
         (parameters.length ? ' ' + parameters.join(' ') : '')
}
