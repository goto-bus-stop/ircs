import {
  ERR_NONICKNAMEGIVEN,
  ERR_NICKNAMEINUSE
} from '../replies'

const debug = require('debug')('ircs:commands:nick')

const MAX_NICK_LENGTH = 9

export default function ({ user, server, parameters: [ nickname ] }) {
  let mask = user.mask()
  nickname = nickname.trim()

  debug('NICK', mask, nickname)

  if (nickname === user.nickname) {
    // ignore
    return
  }
  if (!nickname || nickname.length === 0) {
    return user.send(server.mask(), ERR_NONICKNAMEGIVEN
                    , [ 'No nickname given' ])
  }

  let lnick = nickname.toLowerCase()
  if (server.users.some(us => us.nickname
                           && us.nickname.toLowerCase() === lnick
                           && us !== user)) {
    return user.send(server.mask(), ERR_NICKNAMEINUSE
                    , [ user.nickname, nickname, 'Nickname is already in use' ])
  }

  user.send(mask, 'NICK', [ nickname ])
  user.channels.forEach(chan => {
    chan.broadcast(mask, 'NICK', [ nickname ])
  })
  user.nickname = nickname
}
