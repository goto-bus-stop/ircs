var net = require('net')
  , util = require('util')
  , User = require('./User')
  , Channel = require('./Channel')
  , Message = require('./Message')
  , DefaultCommands = require('./Commands')
  , r = require('./replies')
  , debug = require('debug')('ircs:Server')

module.exports = Server
Server.createServer = function (options, connectionListener) {
  return Server(options, connectionListener)
}

/**
 * Represents a single IRC server.
 *
 * @param {Object} options `net.Server` options.
 * @param {function()} connectionListener `net.Server` connection listener.
 */
function Server(options, connectionListener) {
  if (!(this instanceof Server)) return new Server(options, connectionListener)

  options = options || {}

  net.Server.call(this, options, connectionListener)

  this.created = new Date()

  this.commands = DefaultCommands(this)
  this.users = []
  this.channels = {}

  this.hostname = options.hostname || 'localhost'

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

/**
 * Finds a user by their nickname.
 *
 * @param {string} nickname Nickname to look for.
 *
 * @return {User|undefined} Relevant User object if found, `undefined` if not found.
 */
Server.prototype.findUser = function (nickname) {
  nickname = normalize(nickname)
  for (var i = 0, l = this.users.length; i < l; i++) {
    if (normalize(this.users[i].nickname) === nickname) {
      return this.users[i]
    }
  }
}

/**
 * Finds a channel on the server.
 *
 * @param {string} channelName Channel name.
 *
 * @return {Channel|undefined} Relevant Channel object if found, `undefined` if not found.
 */
Server.prototype.findChannel = function (channelName) {
  channelName = normalize(channelName)
  return this.channels[channelName]
}

/**
 * Creates a new channel with the given name.
 *
 * @param {string} channelName Channel name.
 *
 * @return {Channel} The new Channel.
 */
Server.prototype.createChannel = function (channelName) {
  channelName = normalize(channelName)
  if (!(channelName in this.channels)) {
    this.channels[channelName] = Channel(channelName)
  }
  return this.channels[channelName]
}

/**
 * Gets a channel by name, creating a new one if it does not yet exist.
 *
 * @param {string} channelName Channel name.
 *
 * @return {Channel} The Channel.
 */
Server.prototype.getChannel = function (channelName) {
  channelName = normalize(channelName)
  var channel = this.findChannel(channelName)
  if (!channel) {
    channel = this.createChannel(channelName)
  }
  return channel
}

/**
 * Checks if there is a channel of a given name.
 *
 * @param {string} channelName Channel name.
 *
 * @return {boolean} True if the channel exists, false if not.
 */
Server.prototype.hasChannel = function (channelName) {
  channelName = normalize(channelName)
  return channelName in this.channels
}

/**
 * Execute an IRC command.
 *
 * Sends an ERR_UNKNOWNCOMMAND back to the user, if the command was not found.
 *
 * @param {User} user User to execute as.
 * @param {Message} message Message containing the command to execute.
 */
Server.prototype.execute = function (user, message) {
  var command = message.command.toUpperCase()
    , handle = this.commands[command]

  if (handle) {
    handle.apply(this.commands, [ user ].concat(message.parameters))
  }
  else {
    user.send(this.mask(), r.ERR_UNKNOWNCOMMAND, [ user.nickname, command, 'Unknown command.' ])
  }
}

/**
 * Send a message to every user on the server, including the sender.
 *
 * That sounds dangerous.
 *
 * @param {Message} message Message to send.
 */
Server.prototype.send = function (message) {
  if (!(message instanceof Message)) {
    message = Message.apply(null, arguments)
  }
  this.users.forEach(function (u) { u.send(message) })
}

/**
 * Gives the server mask.
 *
 * @return {string} Mask.
 */
Server.prototype.mask = function () {
  return this.hostname
}

function normalize(str) {
  return str.toLowerCase().trim()
    // {, } and | are uppercase variants of [, ] and \ respectively
    .replace(/{/g, '[')
    .replace(/}/g, ']')
    .replace(/\|/g, '\\')
}
