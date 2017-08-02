/* eslint-env mocha */
const assert = require('assert')
const MessageParser = require('../src/MessageParser')

describe('MessageParser', function () {
  this.timeout(200)
  it('splits incoming messages into separate commands', (done) => {
    let i = 0
    MessageParser()
      .on('data', (d) => {
        i++
      })
      .on('end', () => {
        assert.equal(i, 3)
        done()
      })
      .end('CAP LS\r\nPASS my_password\r\nUSER test_user 0 * :Real Name\r\n')
  })

  it('reads simple incoming commands correctly', (done) => {
    MessageParser()
      .on('data', (message) => {
        assert.equal(message.command, 'NICK')
        assert.deepEqual(message.parameters, [ 'myNickName' ])
      })
      .on('end', done)
      .end('NICK myNickName\r\n')
  })

  it('reads incoming commands with trailing data correctly', (done) => {
    MessageParser()
      .on('data', (message) => {
        assert.equal(message.command, 'USER')
        assert.deepEqual(message.parameters, [ 'test_user', '0', '*', 'This trailing data is a long real name' ])
      })
      .on('end', done)
      .end('USER test_user 0 * :This trailing data is a long real name\r\n')
  })

  it('reads incoming commands with prefixes', (done) => {
    MessageParser()
      .on('data', (message) => {
        assert.equal(message.command, 'COMMAND')
        assert.equal(message.prefix, 'nick!user@localhost')
        assert.deepEqual(message.parameters, [ 'parameter', 'trailing' ])
      })
      .on('end', done)
      .end(':nick!user@localhost COMMAND parameter :trailing\r\n')
  })
})
