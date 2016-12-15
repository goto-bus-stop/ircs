import Server from './Server'

export {
  Server
}

export default function ircs (opts, listener) {
  return new Server(opts, listener)
}
