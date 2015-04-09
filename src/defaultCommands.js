import r from './replies'
import pkg from '../package.json'

const debug = require('debug')('ircs:default-commands')

export default function (ircs) {

  ircs.use('NICK', function ({ user, parameters: [ nickname ] }) {
    debug('NICK', user.mask(), nickname)
    user.nickname = nickname
  })

  // Specifies username, hostname, servername and real name for a user.
  // Currently also sends a welcome message back to the user (should change)
  ircs.use('USER', function ({ user, server, parameters: [ username, hostname, servername, realname ] }) {
    debug('USER', user.mask(), username, hostname, servername, realname)

    user.username = username
    user.servername = server.hostname
    user.realname = realname

    let serverMask = server.mask()
    user.send(serverMask, '001', [ user.nickname, 'Welcome' ])
    user.send(serverMask, '002', [ user.nickname, 'Your host is ' + server.hostname + ' running version ' + pkg.version ])
    user.send(serverMask, '003', [ user.nickname, 'This server was created ' + server.created ])
    user.send(serverMask, '004', [ user.nickname, pkg.name, pkg.version ])
    user.send(serverMask, 'MODE', [ user.nickname, '+w' ])
  })

  // Joins a channel.
  ircs.use('JOIN', function ({ user, server, parameters: [ channelName ] }) {
    let channel = server.getChannel(channelName)
      , mask = server.mask()
    channel.join(user)

    channel.send(user.mask(), 'JOIN', [ channel.name, user.username, user.realname ])

    // Names
    let names = channel.users.map(u => u.nickname)
    user.send(mask, r.RPL_NAMREPLY, [ user.nickname, '=', channel.name, ...names ])
    user.send(mask, r.RPL_ENDOFNAMES, [ user.nickname, channel.name, 'End of /NAMES list.' ])

    // Topic
    if (channel.topic) {
      user.send(mask, r.RPL_TOPIC, [ user.nickname, channel.name, channel.topic ])
    }
    else {
      user.send(mask, r.RPL_NOTOPIC, [ user.nickname, channel.name, 'No topic is set.' ])
    }
  })

  // Parts a channel.
  ircs.use('PART', function ({ user, server, parameters: [ channelName, message ] }) {
    let channel = server.findChannel(channelName)

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
  })

  // Sets channel topics.
  ircs.use('TOPIC', function ({ user, server, parameters: [ channelName, topic ] }) {
    let channel = server.findChannel(channelName)
    if (channel) {
      let mask = server.mask()
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
  })

  // Replies with the names of all users in a channel.
  ircs.use('NAMES', function ({ user, server, parameters: [ channelName ] }) {
    let channel = server.findChannel(channelName)
    if (channel) {
      let names = channel.users.map(u => u.nickname)
      user.send(server.mask(), r.RPL_NAMREPLY, [ user.nickname, '=', channel.name, ...names ])
      user.send(server.mask(), r.RPL_ENDOFNAMES, [ user.nickname, channel.name, 'End of /NAMES list.' ])
    }
  })

  // Replies with more info about users in a channel.
  ircs.use('WHO', function ({ user, server, parameters: [ channelName ] }) {
    let channel = server.findChannel(channelName)
    if (channel) {
      let mask = server.mask()
      channel.users.forEach(u => {
        user.send(mask, r.RPL_WHOREPLY, [ user.nickname, channel.name, u.username, u.hostname
                                        , u.servername, u.nickname, 'H', ':0', u.realname ])
      })
      user.send(mask, r.RPL_ENDOFWHO, [ user.nickname, channelName, 'End of /WHO list.' ])
    }
  })

  // Sends a message to a user or channel.
  ircs.use('PRIVMSG', function ({ user, server, parameters: [ targetName, content ] }) {
    let target
    if (targetName[0] === '#' || targetName[0] === '&') {
      target = server.findChannel(targetName)
      if (target) {
        target.broadcast(user.mask(), 'PRIVMSG', [ target.name, content ])
      }
    }
    else {
      target = server.findUser(targetName)
      if (target) {
        target.send(user.mask(), 'PRIVMSG', [ target.nickname, content ])
      }
    }

    if (!target) {
      user.send(server.mask(), r.ERR_NOSUCHNICK, [ user.nickname, targetName, 'No such nick/channel' ])
    }
  })

  // IRC /WHOIS command.
  ircs.use('WHOIS', function ({ user, server, parameters: [ nickmask ] }) {
    let target = server.findUser(nickmask)
      , mask = server.mask()
    if (target) {
      user.send(mask, r.RPL_WHOISUSER, [ user.nickname, target.username, target.hostname, '*', user.realname ])
      user.send(mask, r.RPL_WHOISSERVER, [ user.nickname, target.username, target.servername, '' ])
      user.send(mask, r.RPL_ENDOFWHOIS, [ user.nickname, target.username, 'End of /WHOIS list.' ])
    }
    else {
      user.send(mask, r.ERR_NOSUCHNICK, [ user.nickname, nickmask, 'No such nick/channel.' ])
      user.send(mask, r.RPL_ENDOFWHOIS, [ user.nickname, nickmask, 'End of /WHOIS list.' ])
    }
  })

}
