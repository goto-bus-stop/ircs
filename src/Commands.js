var debug = require('debug')('ircs:commands')
  , package = require('../package.json')

module.exports = Commands

function Commands(server) {
  if (!(this instanceof Commands)) return new Commands(server)

  this.server = server
}

Commands.prototype.NICK = function (user, nickname) {
  debug('NICK', user.mask(), nickname)
  user.nickname = nickname
}

Commands.prototype.USER = function (user, username, hostname, servername, realname) {
  debug('USER', user.mask(), username, hostname, servername, realname)

  var mask = user.mask()
    , serverMask = this.server.mask()
  user.username = username
  user.hostname = hostname
  user.servername = servername
  user.realname = realname

  user.send(serverMask, '001', [ user.nickname, 'Welcome' ])
  user.send(serverMask, '002', [ user.nickname, 'Your host is ' + serverMask + ' running version ' + package.version ])
  user.send(serverMask, '003', [ user.nickname, 'This server was created ' + this.server.created ])
  user.send(serverMask, '004', [ user.nickname, package.name, package.version ])
  user.send(serverMask, 'MODE', [ user.nickname, '+w' ])
}

Commands.prototype.JOIN = function (user, channelName) {
  var channel = this.server.findChannel(channelName)
  user.join(channel)
}

Commands.prototype.PRIVMSG = function (user, targetName, content) {
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
    user.send(this.server.mask(), '401'/* ERR_NOSUCHNICK */, [ user.nickname, targetName, 'No such nick/channel' ])
  }
}