module.exports = function quit ({ user, server, parameters: [ message ] }) {
  message = message || user.nickname

  server.users.splice(server.users.indexOf(user), 1)
  user.channels.forEach((chan) => {
    chan.part(user)
    chan.send(user, 'PART', [ chan.name, `:${message}` ])
  })
  user.sock.end()
}
