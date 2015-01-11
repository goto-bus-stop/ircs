'use strict'

var Message = require('./Message')
var Map = require('es6-map')

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
  this.topic = null

  this.modes = Map()
}

/**
 * Joins a user into this channel.
 *
 * @param {User} user Joining user.
 */
Channel.prototype.join = function (user) {
  this.users.push(user)
}

/**
 * Parts a user from this channel.
 *
 * @param {User} user Parting user.
 */
Channel.prototype.part = function (user) {
  var i = this.users.indexOf(user)
  if (i !== -1) {
    this.users.splice(i, 1)
  }
}

/**
 * Checks if a user is in this channel.
 *
 * @param {User} user User to look for.
 *
 * @return boolean Whether the user is here.
 */
Channel.prototype.hasUser = function (user) {
  return this.users.indexOf(user) !== -1
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

Channel.prototype.setMode = function (user, mode) {
  if (mode == null) this.modes.delete(user)
  else this.modes.set(user, mode)
}

Channel.prototype.getMode = function (user) {
  return this.modes.get(user)
}

/**
 * Returns the nicknames of all users in this channel.
 *
 * @return {Array.<string>} Names.
 */
Channel.prototype.names = function () {
  return this.users.map(function (user) { return user.nickname })
}
