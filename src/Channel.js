import Message from './Message'

const debug = require('debug')('ircs:Channel')

/**
 * Represents an IRC Channel on the server.
 *
 * @param {string} name Channel name. (Starting with # or &, preferably.)
 *
 * @constructor
 */
export default function Channel (name) {
  if (!(this instanceof Channel)) return new Channel(name)

  this.name = name
  this.users = []
  this.topic = null

  this.flagModes = []
  this.ops = []
  this.voices = []
}

/**
 * Joins a user into this channel.
 *
 * @param {User} user Joining user.
 */
Channel.prototype.join = function (user) {
  this.users.push(user)
  user.channels.push(this)

  if (this.users.length === 1) {
    this.addOp(user)
  }
}

/**
 * Parts a user from this channel.
 *
 * @param {User} user Parting user.
 */
Channel.prototype.part = function (user) {
  let i = this.users.indexOf(user)
  if (i !== -1) {
    this.users.splice(i, 1)
  }
  i = user.channels.indexOf(this)
  if (i !== -1) {
    user.channels.splice(i, 1)
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
  debug(this.name, 'send', message.toString())
  this.users.forEach(u => { u.send(message) })
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
  this.users.forEach(u => {
    if (!u.matchesMask(message.prefix)) u.send(message)
  })
}

Channel.prototype.addOp = function (user) {
  if (!this.hasOp(user)) {
    this.ops.push(user)
  }
}

Channel.prototype.removeOp = function (user) {
  this.ops = this.ops.filter((op) => op !== user)
}

Channel.prototype.hasOp = function (user) {
  return this.ops.indexOf(user) !== -1
}

Channel.prototype.addVoice = function (user) {
  if (!this.hasVoice(user)) {
    this.voices.push(user)
  }
}

Channel.prototype.removeVoice = function (user) {
  this.voices = this.voices.filter((voice) => voice !== user)
}

Channel.prototype.hasVoice = function (user) {
  return this.voices.indexOf(user) !== -1
}

Channel.prototype.addFlag = function (flag) {
  this.flagModes.push(flag)
}

Channel.prototype.removeFlag = function (flag) {
  this.flagModes = this.flagModes.filter((mode) => mode !== flag)
}

Channel.prototype.isPrivate = function () {
  return this.flagModes.indexOf('p') !== -1
}

Channel.prototype.isSecret = function () {
  return this.flagModes.indexOf('s') !== -1
}

Channel.prototype.isInviteOnly = function () {
  return this.flagModes.indexOf('i') !== -1
}

Channel.prototype.isModerated = function () {
  return this.flagModes.indexOf('m') !== -1
}
