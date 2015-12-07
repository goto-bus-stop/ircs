import {
  RPL_WHOREPLY,
  RPL_ENDOFWHO
} from '../replies'

export default function ({ user, server, parameters: [ channelName ] }) {
  let channel = server.findChannel(channelName)
  if (channel) {
    let mask = server.mask()
    channel.users.forEach(u => {
      user.send(mask, RPL_WHOREPLY, [ user.nickname, channel.name, u.username, u.hostname
                                      , u.servername, u.nickname, 'H', ':0', u.realname ])
    })
    user.send(mask, RPL_ENDOFWHO, [ user.nickname, channelName, 'End of /WHO list.' ])
  }
}
