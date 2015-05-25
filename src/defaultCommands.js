import nick from './commands/nick'
import user from './commands/user'
import join from './commands/join'
import part from './commands/part'
import topic from './commands/topic'
import names from './commands/names'
import who from './commands/who'
import whois from './commands/whois'
import privmsg from './commands/privmsg'
import quit from './commands/quit'

const debug = require('debug')('ircs:default-commands')

export default function (ircs) {

  ircs.use('NICK', nick)

  // Specifies username, hostname, servername and real name for a user.
  // Currently also sends a welcome message back to the user (should change)
  ircs.use('USER', user)

  // Joins a channel.
  ircs.use('JOIN', join)

  // Parts a channel.
  ircs.use('PART', part)

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

  // Disconnects.
  ircs.use('QUIT', quit)

}
