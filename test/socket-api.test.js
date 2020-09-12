'use strict'

const { socketApiServer, callSocketApi } = require('../index')

const APIs = [
  {
    name: 'foo',
    func: () => console.log('hello, world'),
  },
]

let disconnect

/**
 * Setup SocketAPI Server
 */
beforeAll((done) => {
  disconnect = socketApiServer(APIs)
  done()
})

/**
 *  Cleanup SocketAPI Server
 */
afterAll((done) => {
  disconnect()
  done()
})

describe('socket-api', () => {
  test('client calls api function', (done) => {
    callSocketApi('foo')
    // TODO: not sure what to assert here to make sure foo was called
    done()
  })
})
