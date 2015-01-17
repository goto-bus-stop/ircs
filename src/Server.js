import net from 'net'
import { inherits } from 'util'
import find from 'array-find'
import User from './User'
import Channel from './Channel'
import Message from './Message'
import DefaultCommands from './Commands'
import r from './replies'

let debug = require('debug')('ircs:Server')

/**
 * Creates a server instance.
 *
 * @see Server
 * @return {Server}
 */
export function createServer(options, connectionListener) {
  return Server(options, connectionListener)
}

/**
 * Represents a single IRC server.
 *
 * @param {Object} options `net.Server` options.
 * @param {function()} connectionListener `net.Server` connection listener.
 *
 * @constructor
 */
export default function Server(options, connectionListener) {
  if (!(this instanceof Server)) return new Server(options, connectionListener)

  options = options || {}

  net.Server.call(this, options, connectionListener)

  /**
   * Time when the server booted.
   * @member {Date}
   */
  this.created = new Date()

  /**
   * Known Commands.
   * @member {Object.<string, function()>}
   */
  this.commands = DefaultCommands(this)

  /**
   * Users online on the server.
   * @member {Array.<User>}
   */
  this.users = []

  /**
   * Channels on the server.
   * @member {Object.<string, Channel>}
   */
  this.channels = {}

  /**
   * Server hostname.
   * @member {string}
   */
  this.hostname = options.hostname || 'localhost'

  this.on('connection', sock => {
    var user = User(sock)
    this.users.push(user)
    user.on('message', message => {
      // woo.
      debug('message', message)
      this.execute(user, message)
    })
  })
}

inherits(Server, net.Server)

/**
 * Finds a user by their nickname.
 *
 * @param {string} nickname Nickname to look for.
 *
 * @return {User|undefined} Relevant User object if found, `undefined` if not found.
 */
Server.prototype.findUser = function (nickname) {
  nickname = normalize(nickname)
  return find(this.users, user => normalize(user.nickname) === nickname)
}

/**
 * Finds a channel on the server.
 *
 * @param {string} channelName Channel name.
 *
 * @return {Channel|undefined} Relevant Channel object if found, `undefined` if not found.
 */
Server.prototype.findChannel = function (channelName) {
  return this.channels[normalize(channelName)]
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
  return channelName in this.channels ? this.channels[channelName]
                                      : (this.channels[channelName] = Channel(channelName))
}

/**
 * Gets a channel by name, creating a new one if it does not yet exist.
 *
 * @param {string} channelName Channel name.
 *
 * @return {Channel} The Channel.
 */
Server.prototype.getChannel = function (channelName) {
  return this.findChannel(channelName) || this.createChannel(channelName)
}

/**
 * Checks if there is a channel of a given name.
 *
 * @param {string} channelName Channel name.
 *
 * @return {boolean} True if the channel exists, false if not.
 */
Server.prototype.hasChannel = function (channelName) {
  return normalize(channelName) in this.channels
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
  this.users.forEach(u => { u.send(message) })
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
