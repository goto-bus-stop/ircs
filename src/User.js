'use strict'

import { inherits } from 'util'
import MessageParser from './MessageParser'
import Message from './Message'
import { Duplex } from 'stream'

let debug = require('debug')('ircs:User')

/**
 * Represents a User on the server.
 *
 * @param {stream.Duplex} sock Duplex Stream to read & write commands from & to.
 *
 * @constructor
 */
export default function User (sock) {
  if (!(this instanceof User)) return new User(sock)

  Duplex.call(this)

  this._readableState.objectMode = true
  this._writableState.objectMode = true

  this.sock = sock
  this.nickname = null
  this.hostname = sock.remoteAddress
  this.messages = MessageParser()
  this.channels = []

  // TODO use duplexify or similar
  sock.pipe(this.messages).on('readable', () => {
    let message = this.messages.read()
    if (message) {
      this.onReceive(message)
    }
  })

  sock.on('end', () => {
    this.onReceive(Message(null, 'QUIT', []))
  })
}
inherits(User, Duplex)

User.prototype.onReceive = function (message) {
  debug('receive', message + '')
  message.user = this
  message.prefix = this.mask()
  this.push(message)
}

User.prototype._read = function () {
}

User.prototype._write = function (message, enc, cb) {
  debug('write', message + '')
  this.sock.write(`${message}\r\n`)
  cb()
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
  this.write(message)
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
  var mask = ''
  if (this.nickname) {
    mask += this.nickname
    if (this.username) {
      mask += `!${this.username}`
    }
    if (this.hostname) {
      mask += `@${this.hostname}`
    }
  }
  return mask || false
}
