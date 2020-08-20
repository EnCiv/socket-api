'use strict'

const { socketApiServer, socketApiClient } = require('../index')

const APIs = [
  {
    name: 'foo',
    func: () => console.log('hello, world'),
  },
]

let ioServer
let disconnect

/**
 * Setup SocketAPI Server
 */
beforeAll((done) => {
  ;[ioServer, disconnect] = socketApiServer(APIs)
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
    socketApiClient('foo')
    // TODO: not sure what to assert here to make sure foo was called
    done()
  })
})
