import {
  RPL_TOPIC,
  RPL_NOTOPIC
} from '../replies'

import names from './names'

export default function (opts) {
  const { user, server, parameters: [ channelName ] } = opts

  let channel = server.getChannel(channelName)
  let mask = server.mask()
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
