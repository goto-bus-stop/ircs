import nick from './commands/nick'
import user from './commands/user'
import list from './commands/list'
import join from './commands/join'
import part from './commands/part'
import mode from './commands/mode'
import topic from './commands/topic'
import names from './commands/names'
import who from './commands/who'
import whois from './commands/whois'
import privmsg from './commands/privmsg'
import notice from './commands/notice'
import quit from './commands/quit'

export default function defaultCommands (ircs) {
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
