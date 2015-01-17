'use strict'

var debug = require('debug')('ircs:commands')
  , r = require('./replies')
  , pkg = require('../package.json')

module.exports = Commands

/**
 * Default bare IRC server commands.
 *
 * @param {Server} server Which IRC Server instance these commands run on.
 *
 * @constructor
 */
function Commands(server) {
  if (!(this instanceof Commands)) return new Commands(server)

  /**
   * The IRC server instance that these commands apply to.
   * @member {Server}
   */
  this.server = server
}

/**
 * IRC /NICK command.
 *
 * Changes a user's nickname.
 *
 * @param {User} user User that sent the message.
 * @param {string} nickname New nick for the user.
 */
Commands.prototype.NICK = function (user, nickname) {
  debug('NICK', user.mask(), nickname)
  user.nickname = nickname
}

/**
 * IRC /USER command.
 *
 * Specifies username, hostname, servername and real name for a user.
 * Currently also sends a welcome message back to the user (should change)
 *
 * @param {User} user User that sent the message.
 * @param {string} username Username to use.
 * @param {string} hostname User's hostname. Gets ignored, we just grab it from the user IP instead.
 * @param {string} servername Servername which the user connected to. Gets ignored, since we already know.
 * @param {string} realname User's real name.
 */
Commands.prototype.USER = function (user, username, hostname, servername, realname) {
  debug('USER', user.mask(), username, hostname, servername, realname)

  user.username = username
  user.servername = this.server.hostname
  user.realname = realname

  var serverMask = this.server.mask()
  user.send(serverMask, '001', [ user.nickname, 'Welcome' ])
  user.send(serverMask, '002', [ user.nickname, 'Your host is ' + this.server.hostname + ' running version ' + pkg.version ])
  user.send(serverMask, '003', [ user.nickname, 'This server was created ' + this.server.created ])
  user.send(serverMask, '004', [ user.nickname, pkg.name, pkg.version ])
  user.send(serverMask, 'MODE', [ user.nickname, '+w' ])
}

/**
 * Joins a channel.
 *
 * @param {User} user User who wants to join a channel.
 * @param {string} channelName Name of the channel to join.
 */
Commands.prototype.JOIN = function (user, channelName) {
  var channel = this.server.getChannel(channelName)
    , mask = this.server.mask()
  channel.join(user)

  channel.send(user.mask(), 'JOIN', [ channel.name, user.username, user.realname ])

  // Names
  user.send(mask, r.RPL_NAMREPLY, [ user.nickname, '=', channel.name ].concat(channel.names()))
  user.send(mask, r.RPL_ENDOFNAMES, [ user.nickname, channel.name, 'End of /NAMES list.' ])

  // Topic
  if (channel.topic) {
    user.send(mask, r.RPL_TOPIC, [ user.nickname, channel.name, channel.topic ])
  }
  else {
    user.send(mask, r.RPL_NOTOPIC, [ user.nickname, channel.name, 'No topic is set.' ])
  }
}

/**
 * Parts a channel.
 *
 * @param {User} user User who wants to leave a channel.
 * @param {string} channelName Channel to leave.
 * @param {string} message Good-bye message.
 */
Commands.prototype.PART = function (user, channelName, message) {
  var channel = this.server.findChannel(channelName)

  if (!channel) {
    user.send(user.mask(), r.ERR_NOSUCHCHANNEL, [ channelName, 'No such channel.' ])
    return
  }
  if (!channel.hasUser(user)) {
    user.send(user.mask(), r.ERR_NOTONCHANNEL, [ channelName, 'You\'re not on that channel.' ])
    return
  }

  channel.part(user)

  channel.send(user.mask(), 'PART', [ channel.name ])
  user.send(user.mask(), 'PART', [ channel.name ])
}

/**
 * IRC /TOPIC command.
 *
 * Sets channel topics.
 *
 * @param {User} user Message sender.
 * @param {string} channelName Channel name.
 * @param {string} topic New topic.
 */
Commands.prototype.TOPIC = function (user, channelName, topic) {
  var channel = this.server.findChannel(channelName)
  if (channel) {
    var mask = this.server.mask()
    // no new topic given, → check
    if (topic === undefined) {
      if (channel.topic) {
        user.send(mask, r.RPL_TOPIC, [ user.nickname, channel.name, channel.topic ])
      }
      else {
        user.send(mask, r.RPL_NOTOPIC, [ user.nickname, channel.name, 'No topic is set.' ])
      }
      return
    }

    if (!channel.hasUser(user)) {
      user.send(mask, r.ERR_NOTONCHANNEL, [ user.nickname, channel.name, 'You\'re not on that channel.' ])
      return
    }
    if (false/** @todo (user is not op) */) {
      user.send(mask, r.ERR_CHANOPRIVSNEEDED, [ user.nickname, channel.name, 'You\'re not channel operator' ])
      return
    }
    // empty string for topic, → clear
    channel.topic = topic === '' ? null : topic
    channel.send(user.mask(), 'TOPIC', [ channel.name, topic === '' ? ':' : topic  ])
  }
}

/**
 * Replies with the names of all users in a channel.
 *
 * @param {User} user Message sender.
 * @param {string} channelName Name of the channel to look at.
 */
Commands.prototype.NAMES = function (user, channelName) {
  var channel = this.server.findChannel(channelName)
  if (channel) {
    user.send(this.server.mask(), r.RPL_NAMREPLY, [ user.nickname, '=', channel.name ].concat(channel.names()))
    user.send(this.server.mask(), r.RPL_ENDOFNAMES, [ user.nickname, channel.name, 'End of /NAMES list.' ])
  }
}

/**
 * Replies with more info about users in a channel.
 *
 * @param {User} user Message sender.
 * @param {string} channelName Name of the channel to look at.
 */
Commands.prototype.WHO = function (user, channelName) {
  var channel = this.server.findChannel(channelName)
  if (channel) {
    var mask = this.server.mask()
    channel.users.forEach(function (u) {
      user.send(mask, r.RPL_WHOREPLY, [ user.nickname, channel.name, u.username, u.hostname,
                                        u.servername, u.nickname, 'H', ':0', u.realname ])
    })
    user.send(mask, r.RPL_ENDOFWHO, [ user.nickname, channelName, 'End of /WHO list.' ])
  }
}

/**
 * Sends a message to a user or channel.
 *
 * @param {User} user Message sender.
 * @param {string} targetName Recipient nickname or channel name.
 * @param {string} content Message content.
 */
Commands.prototype.PRIVMSG = function (user, targetName, content) {
  var target
  if (targetName[0] === '#' || targetName[0] === '&') {
    target = this.server.findChannel(targetName)
    if (target) {
      target.broadcast(user.mask(), 'PRIVMSG', [ target.name, content ])
    }
  }
  else {
    target = this.server.findUser(targetName)
    if (target) {
      target.send(user.mask(), 'PRIVMSG', [ target.nickname, content ])
    }
  }

  if (!target) {
    user.send(this.server.mask(), r.ERR_NOSUCHNICK, [ user.nickname, targetName, 'No such nick/channel' ])
  }
}

/**
 * IRC /WHOIS command.
 *
 * @param {User} user Message sender.
 * @param {string} nickmask Nick mask of the user to find.
 */
Commands.prototype.WHOIS = function (user, nickmask) {
  var target = this.server.findUser(nickmask)
  var mask = this.server.mask()
  if (target) {
    user.send(mask, r.RPL_WHOISUSER, [ user.nickname, target.username, target.hostname, '*', user.realname ])
    user.send(mask, r.RPL_WHOISSERVER, [ user.nickname, target.username, target.servername, '' ])
    user.send(mask, r.RPL_ENDOFWHOIS, [ user.nickname, target.username, 'End of /WHOIS list.' ])
  }
  else {
    user.send(mask, r.ERR_NOSUCHNICK, [ user.nickname, nickmask, 'No such nick/channel.' ])
    user.send(mask, r.RPL_ENDOFWHOIS, [ user.nickname, nickmask, 'End of /WHOIS list.' ])
  }
}