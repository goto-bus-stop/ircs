module.exports = function isValidChannelName (name) {
  // https://tools.ietf.org/html/rfc1459#section-1.3
  return name.length <= 200 &&
    (name[0] === '#' || name[0] === '&') &&
    name.indexOf(' ') === -1 &&
    name.indexOf(',') === -1 &&
    name.indexOf('\x07') === -1 // ^G
}
