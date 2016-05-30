import {
  RPL_TOPIC,
  RPL_NOTOPIC,
  ERR_NEEDMOREPARAMS
} from '../replies'

import names from './names'

export default function join (opts) {
  const { user, server, parameters: [ channelName ] } = opts
  const mask = server.mask()

  if (!channelName) {
    user.send(mask, ERR_NEEDMOREPARAMS, [ 'JOIN', 'Not enough parameters' ])
    return
  }

  const channel = server.getChannel(channelName)
  channel.join(user)

  channel.send(user.mask(), 'JOIN', [ channel.name, user.username, user.realname ])

  names(opts)

  // Topic
  if (channel.topic) {
    user.send(mask, RPL_TOPIC, [ user.nickname, channel.name, channel.topic ])
  } else {
    user.send(mask, RPL_NOTOPIC, [ user.nickname, channel.name, 'No topic is set.' ])
  }
}
