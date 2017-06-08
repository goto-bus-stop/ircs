const nick = require('./commands/nick')
const user = require('./commands/user')
const list = require('./commands/list')
const join = require('./commands/join')
const part = require('./commands/part')
const mode = require('./commands/mode')
const topic = require('./commands/topic')
const names = require('./commands/names')
const who = require('./commands/who')
const whois = require('./commands/whois')
const privmsg = require('./commands/privmsg')
const notice = require('./commands/notice')
const quit = require('./commands/quit')

module.exports = function defaultCommands (ircs) {
  ircs.use('NICK', nick)

  // Specifies username, hostname, servername and real name for a user.
  // Currently also sends a welcome message back to the user (should change)
  ircs.use('USER', user)

  // Shows a list of known channels.
  ircs.use('LIST', list)

  // Joins a channel.
  ircs.use('JOIN', join)

  // Parts a channel.
  ircs.use('PART', part)

  // Sets channel modes.
  ircs.use('MODE', mode)

  // Sets channel topics.
  ircs.use('TOPIC', topic)

  // Replies with the names of all users in a channel.
  ircs.use('NAMES', names)

  // Replies with more info about users in a channel.
  ircs.use('WHO', who)

  // IRC /WHOIS command.
  ircs.use('WHOIS', whois)

  // Sends a message to a user or channel.
  ircs.use('PRIVMSG', privmsg)

  // Sends a message to a user or channel.
  ircs.use('NOTICE', notice)

  // Disconnects.
  ircs.use('QUIT', quit)
}
