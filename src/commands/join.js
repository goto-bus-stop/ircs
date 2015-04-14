import r from '../replies'

export default function ({ user, server, parameters: [ channelName ] }) {
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
}
