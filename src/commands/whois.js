import {
  RPL_WHOISUSER,
  RPL_WHOISSERVER,
  RPL_ENDOFWHOIS,
  ERR_NOSUCHNICK
} from '../replies'

export default function ({ user, server, parameters: [ nickmask ] }) {
  let target = server.findUser(nickmask)
    , mask = server.mask()
  if (target) {
    user.send(mask, RPL_WHOISUSER, [ user.nickname, target.username, target.hostname, '*', user.realname ])
    user.send(mask, RPL_WHOISSERVER, [ user.nickname, target.username, target.servername, '' ])
    user.send(mask, RPL_ENDOFWHOIS, [ user.nickname, target.username, 'End of /WHOIS list.' ])
  }
  else {
    user.send(mask, ERR_NOSUCHNICK, [ user.nickname, nickmask, 'No such nick/channel.' ])
    user.send(mask, RPL_ENDOFWHOIS, [ user.nickname, nickmask, 'End of /WHOIS list.' ])
  }
}
