/* eslint-env mocha */
import assert from 'assert'
import MessageParser from '../src/MessageParser'

describe('MessageParser', () => {
  it('splits incoming messages into separate commands', done => {
    let i = 0
    new MessageParser()
      .on('data', d => { i++ })
      .on('finish', () => {
        assert.equal(i, 3)
        done()
      })
      .end('CAP LS\r\nPASS my_password\r\nUSER test_user 0 * :Real Name\r\n')
  })

  it('reads simple incoming commands correctly', () => {
    let message = MessageParser.prototype.parse('NICK myNickName')
    assert.equal(message.command, 'NICK')
    assert.deepEqual(message.parameters, [ 'myNickName' ])
  })

  it('reads incoming commands with trailing data correctly', () => {
    let message = MessageParser.prototype.parse('USER test_user 0 * :This trailing data is a long real name')
    assert.equal(message.command, 'USER')
    assert.deepEqual(message.parameters, [ 'test_user', '0', '*', 'This trailing data is a long real name' ])
  })

  it('reads incoming commands with prefixes', () => {
    let message = MessageParser.prototype.parse(':nick!user@localhost COMMAND parameter :trailing')
    assert.equal(message.command, 'COMMAND')
    assert.equal(message.prefix, 'nick!user@localhost')
    assert.deepEqual(message.parameters, [ 'parameter', 'trailing' ])
  })
})
