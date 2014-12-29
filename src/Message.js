module.exports = Message

function Message(prefix, command, parameters) {
  if (!(this instanceof Message)) return new Message(prefix, command, parameters)
  this.prefix = prefix
  this.command = command
  this.parameters = parameters

  if (parameters) {
    var last = parameters[parameters.length - 1]
    if (last.indexOf(' ') !== -1) {
      parameters[parameters.length - 1] = ':' + parameters[parameters.length - 1]
    }
  }
}

Message.prototype.toString = function () {
  return (this.prefix ? ':' + this.prefix + ' ' : '') +
         this.command +
         (this.parameters ? ' ' + this.parameters.join(' ') : '')
}