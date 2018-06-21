/* eslint-env mocha */
const { Client } = require('irc')
const ircs = require('../src')
const Message = require('../src/Message')
const assert = require('assert')

const PORT = 30667

describe('ircs', () => {
  let server
  let client
  beforeEach(done => {
    client = null
    server = ircs().listen(PORT, done)
      .on('error', assert.fail)
  })
  afterEach(done => {
    if (client) client.disconnect()
    server.close(done)
  })

  const connect = (nick = 'test', opts = { port: PORT }) => {
    client = new Client('localhost', nick, { port: PORT })
    return client
  }

  it('receives connections on a port', done => {
    connect()
      .on('error', assert.fail)
      .on('connect', done)
  })

  it('passes messages through the appropriate middleware', done => {
    let called = false
    server.use(() => { called = true })
    server.use('OTHER', () => {
      assert.fail('Middleware for other commands should not be called')
    })
    server.use('TEST', () => {
      assert.ok(called, 'Middleware without a command should always be called')
      done()
    })
    server.execute(new Message(null, 'TEST', []))
  })

  it('executes middleware in order', done => {
    let stage = 0
    server.use(() => { assert.strictEqual(stage++, 0) })
    server.use(() => { assert.strictEqual(stage++, 1) })
    server.use(() => { assert.strictEqual(stage++, 2) })
    server.use(() => { assert.strictEqual(stage++, 3) })
    server.use(() => { done() })
    server.execute(new Message(null, 'TEST', []))
  })
})
