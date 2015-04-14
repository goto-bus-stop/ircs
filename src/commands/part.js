import r from '../replies'

export default function ({ user, server, parameters: [ channelName, message ] }) {
  let channel = server.findChannel(channelName)

  if (!channel) {
    user.send(user.mask(), r.ERR_NOSUCHCHANNEL, [ channelName, 'No such channel.' ])
    return
  }
  if (!channel.hasUser(user)) {
    user.send(user.mask(), r.ERR_NOTONCHANNEL, [ channelName, 'You\'re not on that channel.' ])
    return
  }

  channel.part(user)

  channel.send(user.mask(), 'PART', [ channel.name ])
  user.send(user.mask(), 'PART', [ channel.name ])
}
