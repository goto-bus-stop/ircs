/* eslint-env mocha */
import assert from 'assert'
import isValidChannelName from '../src/util/isValidChannelName'

it('isValidChannelName', () => {
  assert(isValidChannelName('#channel'))
  assert(isValidChannelName('##channel'))
  assert(isValidChannelName('#one#two'))
  assert(isValidChannelName('#one^two'))
  assert(!isValidChannelName('#one,#two'))
  assert(!isValidChannelName('#one two'))
  assert(!isValidChannelName('channel'))
})
