import Server from './Server'

module.exports = ircs
ircs.Server = Server

function ircs (opts, listener) {
  return new Server(opts, listener)
}
