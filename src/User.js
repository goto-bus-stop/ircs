var debug = require('debug')('ircs:User')
  , EventEmitter = require('events').EventEmitter
  , util = require('util')
  , MessageParser = require('./MessageParser')
  , Message = require('./Message')

module.exports = User

/**
 * Represents a User on the server.
 *
 * @param {stream.Duplex} sock Duplex Stream to read & write commands from & to.
 */
function User(sock) {
  if (!(this instanceof User)) return new User(sock)

  EventEmitter.call(this)

  this.sock = sock
  this.nickname = null

  sock.pipe(MessageParser()).on('data', this.onReceive.bind(this))
}
util.inherits(User, EventEmitter)

/**
 * Join a channel.
 *
 * @param {Channel} channel Channel object to join.
 */
User.prototype.join = function (channel) {
  channel.users.push(this)

  this.send(this.mask(), 'JOIN', [ channel.name ])
  channel.send(this.mask(), 'JOIN', [ channel.name ])
}

/**
 * Process a message sent by this user.
 *
 * Just fires an event so the Server can handle it.
 *
 * @param {Message} message Received Message.
 */
User.prototype.onReceive = function (message) {
  debug('receive', message + '')
  this.emit('message', message)
}

/**
 * Send a message to this user.
 *
 * @param {Message} message Message to send.
 */
User.prototype.send = function (message) {
  if (!(message instanceof Message)) {
    message = Message.apply(null, arguments)
  }
  debug('send', message + '')
  this.sock.write(message + '\r\n')
}

/**
 * Check if this user is matched by a given mask.
 *
 * @param {string} mask Mask to match.
 *
 * @return {boolean} Whether the user is matched by the mask.
 */
User.prototype.matchesMask = function (mask) {
  // simple & temporary
  return mask === this.mask()
}

/**
 * Gives this user's mask.
 *
 * @return {string|boolean} Mask or false if this user isn't really known yet.
 * @todo Just use a temporary nick or something, so we don't have to deal with `false` everywhere…
 */
User.prototype.mask = function () {
  if (this.nickname) {
    return this.nickname
  }
  return false
}