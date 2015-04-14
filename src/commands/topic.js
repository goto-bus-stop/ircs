import r from '../replies'

export default function ({ user, server, parameters: [ channelName, topic ] }) {
  let channel = server.findChannel(channelName)
  if (channel) {
    let mask = server.mask()
    // no new topic given, → check
    if (topic === undefined) {
      if (channel.topic) {
        user.send(mask, r.RPL_TOPIC, [ user.nickname, channel.name, channel.topic ])
      }
      else {
        user.send(mask, r.RPL_NOTOPIC, [ user.nickname, channel.name, 'No topic is set.' ])
      }
      return
    }

    if (!channel.hasUser(user)) {
      user.send(mask, r.ERR_NOTONCHANNEL, [ user.nickname, channel.name, 'You\'re not on that channel.' ])
      return
    }
    if (false/** @todo (user is not op) */) {
      user.send(mask, r.ERR_CHANOPRIVSNEEDED, [ user.nickname, channel.name, 'You\'re not channel operator' ])
      return
    }
    // empty string for topic, → clear
    channel.topic = topic === '' ? null : topic
    channel.send(user.mask(), 'TOPIC', [ channel.name, topic === '' ? ':' : topic  ])
  }
}
