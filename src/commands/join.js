import assign from 'object-assign'
import {
  RPL_TOPIC,
  RPL_NOTOPIC,
  ERR_NEEDMOREPARAMS
} from '../replies'

import names from './names'

export default function join (opts) {
  const { user, server, parameters: [ channelNames ] } = opts

  if (!channelNames) {
    user.send(server, ERR_NEEDMOREPARAMS, [ 'JOIN', ':Not enough parameters' ])
    return
  }

  for (const channelName of channelNames.split(',')) {
    const channel = server.getChannel(channelName)
    channel.join(user)

    channel.send(user, 'JOIN', [ channel.name, user.username, `:${user.realname}` ])

    names(assign({}, opts, {
      parameters: [ channelName ]
    }))

    // Topic
    if (channel.topic) {
      user.send(server, RPL_TOPIC, [ user.nickname, channel.name, `:${channel.topic}` ])
    } else {
      user.send(server, RPL_NOTOPIC, [ user.nickname, channel.name, ':No topic is set.' ])
    }
  }
}
