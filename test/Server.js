import { Client } from 'irc'
import ircs from '../src/Server'
import Message from '../src/Message'
import assert from 'assert'

const PORT = 30667

describe('ircs', () => {

  let server
  let client
  beforeEach(done => {
    server = ircs().listen(PORT, done)
      .on('error', assert.fail)
  })
  afterEach(done => {
    client.disconnect()
    server.close(done)
  })

  const connect = (nick = 'test', opts = { port: PORT }) => {
    return client = new Client('localhost', nick, { port: PORT })
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
    server.execute(Message(null, 'TEST', []))
  })

  it('executes middleware in order', done => {
    let stage = 0
    server.use(() => { assert.strictEqual(stage++, 0) })
    server.use(() => { assert.strictEqual(stage++, 1) })
    server.use(() => { assert.strictEqual(stage++, 2) })
    server.use(() => { assert.strictEqual(stage++, 3) })
    server.use(() => { done() })
    server.execute(Message(null, 'TEST', []))
  })

})