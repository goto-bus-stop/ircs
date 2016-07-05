import {
  RPL_TOPIC,
  RPL_NOTOPIC,
  ERR_NEEDMOREPARAMS
} from '../replies'

import names from './names'

export default function join (opts) {
  const { user, server, parameters: [ channelNames ] } = opts
  const mask = server.mask()

  if (!channelNames) {
    user.send(mask, ERR_NEEDMOREPARAMS, [ 'JOIN', 'Not enough parameters' ])
    return
  }

  for (const channelName of channelNames.split(',')) {
    const channel = server.getChannel(channelName)
    channel.join(user)

    channel.send(user.mask(), 'JOIN', [ channel.name, user.username, user.realname ])

    names(Object.assign({}, opts, {
      parameters: [ channelName ]
    }))

    // Topic
    if (channel.topic) {
      user.send(mask, RPL_TOPIC, [ user.nickname, channel.name, channel.topic ])
    } else {
      user.send(mask, RPL_NOTOPIC, [ user.nickname, channel.name, 'No topic is set.' ])
    }
  }
}
