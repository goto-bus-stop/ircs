import {
  ERR_NOSUCHNICK
} from '../replies'

export default function ({ user, server, parameters: [ targetName, content ] }) {
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
    user.send(server.mask(), ERR_NOSUCHNICK, [ user.nickname, targetName, 'No such nick/channel' ])
  }
}
