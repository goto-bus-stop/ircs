var debug = require('debug')('ircs:User')
  , EventEmitter = require('events').EventEmitter
  , util = require('util')
  , MessageParser = require('./MessageParser')
  , Message = require('./Message')

module.exports = User

function User(sock) {
  if (!(this instanceof User)) return new User(sock)

  EventEmitter.call(this)

  this.sock = sock
  this.nickname = null

  sock.pipe(MessageParser()).on('data', this.onReceive.bind(this))
}
util.inherits(User, EventEmitter)

User.prototype.join = function (channel) {
  channel.users.push(this)

  this.send(this.mask(), 'JOIN', [ channel.name ])
  channel.send(this.mask(), 'JOIN', [ channel.name ])
}

User.prototype.onReceive = function (message) {
  debug('receive', message + '')
  this.emit('message', message)
}

User.prototype.send = function (message) {
  if (!(message instanceof Message)) {
    message = Message.apply(null, arguments)
  }
  debug('send', message + '')
  this.sock.write(message + '\r\n')
}

User.prototype.matchesMask = function (mask) {
  // simple & temporary
  return mask === this.mask()
}

User.prototype.mask = function () {
  if (this.nickname) {
    return this.nickname
  }
  return false
}