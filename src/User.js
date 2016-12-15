'use strict'

import MessageParser from './MessageParser'
import Message from './Message'
import { Duplex } from 'readable-stream'

let debug = require('debug')('ircs:User')

/**
 * Represents a User on the server.
 */
export default class User extends Duplex {
  /**
   * @param {stream.Duplex} sock Duplex Stream to read & write commands from & to.
   */
  constructor (sock) {
    super()

    this._readableState.objectMode = true
    this._writableState.objectMode = true

    this.sock = sock
    this.nickname = null
    this.hostname = sock.remoteAddress
    this.messages = new MessageParser()
    this.channels = []

    // TODO use duplexify or similar
    sock.pipe(this.messages).on('readable', () => {
      let message = this.messages.read()
      if (message) {
        this.onReceive(message)
      }
    })

    sock.on('end', () => {
      this.onReceive(new Message(null, 'QUIT', []))
    })
  }

  onReceive (message) {
    debug('receive', message + '')
    message.user = this
    message.prefix = this.mask()
    this.push(message)
  }

  _read () {
  }

  _write (message, enc, cb) {
    debug('write', message + '')
    this.sock.write(`${message}\r\n`)
    cb()
  }

  /**
   * Send a message to this user.
   *
   * @param {Message} message Message to send.
   */
  send (message) {
    if (!(message instanceof Message)) {
      message = new Message(...arguments)
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
  matchesMask (mask) {
    // simple & temporary
    return mask === this.mask()
  }

  /**
   * Gives this user's mask.
   *
   * @return {string|boolean} Mask or false if this user isn't really known yet.
   * @todo Just use a temporary nick or something, so we don't have to deal with `false` everywhere…
   */
  mask () {
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
}
