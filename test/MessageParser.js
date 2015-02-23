var assert = require('assert')

describe('MessageParser', function () {
  var MessageParser = require('../lib/MessageParser')

  it('splits incoming messages into separate commands', function (done) {
    var i = 0
    MessageParser()
      .on('data', function (d) { i++ })
      .on('close', function () { assert.equal(i, 3), done() })
      .end('CAP LS\r\nPASS my_password\r\nUSER test_user 0 * :Real Name')
  })

  it('reads simple incoming commands correctly', function () {
    var message = MessageParser.prototype.parse('NICK myNickName')
    assert.equal(message.command, 'NICK')
    assert.deepEqual(message.parameters, [ 'myNickName' ])
  })

  it('reads incoming commands with trailing data correctly', function () {
    var message = MessageParser.prototype.parse('USER test_user 0 * :This trailing data is a long real name')
    assert.equal(message.command, 'USER')
    assert.deepEqual(message.parameters, [ 'test_user', '0', '*', 'This trailing data is a long real name' ])
  })

  it('reads incoming commands with prefixes', function () {
    var message = MessageParser.prototype.parse(':nick!user@localhost COMMAND parameter :trailing')
    assert.equal(message.command, 'COMMAND')
    assert.equal(message.prefix, 'nick!user@localhost')
    assert.deepEqual(message.parameters, [ 'parameter', 'trailing' ])
  })

})