import {
  RPL_LISTSTART,
  RPL_LIST,
  RPL_LISTEND
} from '../replies'

export default function list ({ user, server, parameters: [ channels ] }) {
  const mask = server.mask()

  channels = channels ? channels.split(',') : Object.keys(server.channels)

  user.send(mask, RPL_LISTSTART, [ user.nickname, 'Channel', 'Users  Name' ])

  channels
    .map(server.findChannel, server)
    .forEach((chan) => {
      user.send(mask, RPL_LIST,
                [ user.nickname, chan.name, chan.users.length, chan.topic || '' ])
    })

  user.send(mask, RPL_LISTEND, [ user.nickname, 'End of /LIST' ])
}
