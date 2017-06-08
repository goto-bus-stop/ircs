/* eslint-env mocha */
const assert = require('assert')
const isValidChannelName = require('../src/util/isValidChannelName')

it('isValidChannelName', () => {
  assert(isValidChannelName('#channel'))
  assert(isValidChannelName('##channel'))
  assert(isValidChannelName('#one#two'))
  assert(isValidChannelName('#one^two'))
  assert(!isValidChannelName('#one,#two'))
  assert(!isValidChannelName('#one two'))
  assert(!isValidChannelName('channel'))
})
