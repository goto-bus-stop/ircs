import pkg from '../../package.json'
const debug = require('debug')('ircs:commands:user')

export default function ({ user, server, parameters: [ username, hostname, servername, realname ] }) {
  debug('USER', user.mask(), username, hostname, servername, realname)

  user.username = username
  user.servername = server.hostname
  user.realname = realname

  let serverMask = server.mask()
  user.send(serverMask, '001', [ user.nickname, 'Welcome' ])
  user.send(serverMask, '002', [ user.nickname
                               , `Your host is ${server.hostname} running version ${pkg.version}` ])
  user.send(serverMask, '003', [ user.nickname, `This server was created ${server.created}` ])
  user.send(serverMask, '004', [ user.nickname, pkg.name, pkg.version ])
  user.send(serverMask, 'MODE', [ user.nickname, '+w' ])
}
