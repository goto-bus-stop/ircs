var net = require('net')
  , util = require('util')
  , User = require('./User')
  , Message = require('./Message')
  , DefaultCommands = require('./Commands')
  , debug = require('debug')('ircs:Server')

module.exports = Server
Server.createServer = function (options, connectionListener) {
  return Server(options, connectionListener)
}

function Server(options, connectionListener) {
  if (!(this instanceof Server)) return new Server(options, connectionListener)

  net.Server.call(this, options, connectionListener)

  this.created = new Date()

  this.commands = DefaultCommands(this)
  this.users = []
  this.channels = []

  this.hostname = 'localhost'

  this.on('connection', function (sock) {
    var user = User(sock)
    this.users.push(user)
    user.on('message', function (message) {
      // woo.
      debug('message', message)
      this.execute(user, message)
    }.bind(this))
  }.bind(this))
}

util.inherits(Server, net.Server)

Server.prototype.execute = function (user, message) {
  var command = message.command.toUpperCase()
    , handle = this.commands[command]

  if (handle) {
    handle.apply(this.commands, [ user ].concat(message.parameters))
  }
  else {
    user.send(this.mask(), 'NOTICE', [ user.nickname, 'No such command.' ])
  }
}

Server.prototype.send = function (message) {
  if (!(message instanceof Message)) {
    message = Message.apply(null, arguments)
  }
  this.users.forEach(function (u) { u.send(message) })
}

Server.prototype.mask = function () {
  return 'localhost'
}