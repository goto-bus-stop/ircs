const net = require('net')
const to = require('to2')
const find = require('array-find')
const each = require('each-async')
const Map = require('es6-map')
const User = require('./User')
const Channel = require('./Channel')
const Message = require('./Message')
const defaultCommands = require('./defaultCommands')
const isValidChannelName = require('./util/isValidChannelName')

const debug = require('debug')('ircs:Server')

/**
 * Represents a single IRC server.
 */
module.exports = class Server extends net.Server {
  /**
   * Creates a server instance.
   *
   * @see Server
   * @return {Server}
   */
  static createServer (options, connectionListener) {
    return new Server(options, connectionListener)
  }

  static defaultOptions () {
    return {
      useDefaultCommands: true
    }
  }

  /**
   * Create an IRC server.
   *
   * @param {Object} options `net.Server` options.
   * @param {function()} connectionListener `net.Server` connection listener.
   */
  constructor (options, connectionListener) {
    options = Object.assign(Server.defaultOptions(), options)

    super(options, connectionListener)

    this.created = new Date()
    this._middleware = []
    this.users = []
    this.channels = new Map()
    this.hostname = options.hostname || 'localhost'

    this.on('connection', sock => {
      debug('incoming connection', sock.remoteAddress)
      const user = new User(sock)
      this.users.push(user)
      user.pipe(to.obj((message, enc, cb) => {
        debug('message', message + '')
        this.execute(message)
        cb()
      }))
    })

    if (options.useDefaultCommands) {
      defaultCommands(this)
    }

    debug('server started')
  }

  /**
   * Finds a user by their nickname.
   *
   * @param {string} nickname Nickname to look for.
   *
   * @return {User|undefined} Relevant User object if found, `undefined` if not found.
   */
  findUser (nickname) {
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
  findChannel (channelName) {
    return this.channels.get(normalize(channelName))
  }

  /**
   * Creates a new channel with the given name.
   *
   * @param {string} channelName Channel name.
   *
   * @return {Channel} The new Channel.
   */
  createChannel (channelName) {
    channelName = normalize(channelName)
    if (!isValidChannelName(channelName)) {
      throw new Error('Invalid channel name')
    }

    if (!this.channels.has(channelName)) {
      this.channels.set(channelName, new Channel(channelName))
    }

    return this.channels.get(channelName)
  }

  /**
   * Gets a channel by name, creating a new one if it does not yet exist.
   *
   * @param {string} channelName Channel name.
   *
   * @return {Channel} The Channel.
   */
  getChannel (channelName) {
    if (!isValidChannelName(channelName)) {
      return
    }
    return this.findChannel(channelName) || this.createChannel(channelName)
  }

  /**
   * Checks if there is a channel of a given name.
   *
   * @param {string} channelName Channel name.
   *
   * @return {boolean} True if the channel exists, false if not.
   */
  hasChannel (channelName) {
    return this.channels.has(normalize(channelName))
  }

  use (command, fn) {
    if (!fn) {
      [ command, fn ] = [ '', command ]
    }
    debug('register middleware', command)
    this._middleware.push({ command, fn })
  }

  execute (message, cb) {
    debug('exec', message + '')
    message.server = this
    each(this._middleware, (mw, idx, next) => {
      if (mw.command === '' || mw.command === message.command) {
        debug('executing', mw.command, message.parameters)
        if (mw.fn.length < 2) {
          mw.fn(message)
          next(null)
        } else {
          mw.fn(message, next)
        }
      }
    }, cb)
  }

  /**
   * Send a message to every user on the server, including the sender.
   *
   * That sounds dangerous.
   *
   * @param {Message} message Message to send.
   */
  send (message) {
    if (!(message instanceof Message)) {
      message = new Message(...arguments)
    }
    this.users.forEach(u => { u.send(message) })
  }

  /**
   * Gives the server mask.
   *
   * @return {string} Mask.
   */
  mask () {
    return this.hostname
  }
}

function normalize (str) {
  return str.toLowerCase().trim()
    // {, } and | are uppercase variants of [, ] and \ respectively
    .replace(/{/g, '[')
    .replace(/}/g, ']')
    .replace(/\|/g, '\\')
}
