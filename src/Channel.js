var Message = require('./Message')

module.exports = Channel

/**
 * Represents an IRC Channel on the server.
 *
 * @param {string} name Channel name. (Starting with # or &, preferably.)
 */
function Channel(name) {
  if (!(this instanceof Channel)) return new Channel(name)

  this.name = name
  this.users = []
}

/**
 * Sends a message to all users in a channel, including the sender.
 *
 * @param {Message} message Message to send.
 */
Channel.prototype.send = function (message) {
  if (!(message instanceof Message)) {
    message = Message.apply(null, arguments)
  }
  this.users.forEach(function (u) { u.send(message) })
}

/**
 * Broadcasts a message to all users in a channel, except the sender.
 *
 * @param {Message} message Message to send.
 */
Channel.prototype.broadcast = function (message) {
  if (!(message instanceof Message)) {
    message = Message.apply(null, arguments)
  }
  this.users.forEach(function (u) {
    if (!u.matchesMask(message.prefix)) u.send(message)
  })
}