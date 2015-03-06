import net from 'net'
import { inherits } from 'util'
import find from 'array-find'
import assign from 'object-assign'
import User from './User'
import Channel from './Channel'
import Message from './Message'
import defaultCommands from './defaultCommands'
import r from './replies'

let debug = require('debug')('ircs:Server')

/**
 * Creates a server instance.
 *
 * @see Server
 * @return {Server}
 */
Server.createServer = function createServer(options, connectionListener) {
  return Server(options, connectionListener)
}

Server.defaultOptions = function () {
  return {
    useDefaultCommands: true
  }
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

  options = assign(Server.defaultOptions(), options)

  net.Server.call(this, options, connectionListener)

  this.created = new Date()
  this._middleware = []
  this.users = []
  this.channels = {}
  this.hostname = options.hostname || 'localhost'

  this.on('connection', sock => {
    const user = User(sock)
    this.users.push(user)
    user.on('message', message => {
      // woo.
      debug('message', message)
      this.execute(message)
    })
  })

  if (options.useDefaults) {
    defaultCommands(this)
  }
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

Server.prototype.use = function (command, fn) {
  if (!fn) {
    [ command, fn ] = [ '', command ]
  }
  this._middleware.push({ command, fn })
}

Server.prototype.execute = function (message) {
  debug('exec', message)
  this._middleware.forEach(mw => {
    if (mw.command === '' || mw.command === message.command) {
      debug('  exec', mw)
      mw.fn(message)
    }
  })
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
