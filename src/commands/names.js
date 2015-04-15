import r from '../replies'

export default function ({ user, server, parameters: [ channelName ] }) {
  let channel = server.findChannel(channelName)
  if (channel) {
    let names = channel.users.map(u => u.nickname)
    user.send(server.mask(), r.RPL_NAMREPLY, [ user.nickname, '=', channel.name, ...names ])
    user.send(server.mask(), r.RPL_ENDOFNAMES, [ user.nickname, channel.name, 'End of /NAMES list.' ])
  }
}