'use strict'

const http = require('http')
const socketIO = require('socket.io')
const socketIOClient = require('socket.io-client')

let httpServer
let httpServerAddr
let ioServer
let socket

/**
 * Setup WS & HTTP servers
 */
beforeAll((done) => {
  httpServer = http.createServer().listen()
  httpServerAddr = httpServer.address()
  ioServer = socketIO(httpServer)
  done()
})

/**
 *  Cleanup WS & HTTP servers
 */
afterAll((done) => {
  ioServer.close()
  httpServer.close()
  done()
})

/**
 * Run before each test
 */
beforeEach((done) => {
  // Setup
  // Do not hardcode server port and address, square brackets are used for IPv6
  socket = socketIOClient.connect(
    `http://[${httpServerAddr.address}]:${httpServerAddr.port}`,
    {
      'reconnection delay': 0,
      'reopen delay': 0,
      'force new connection': true,
      transports: ['websocket'],
    }
  )

  socket.on('connect', () => {
    done()
  })
})

/**
 * Run after each test
 */
afterEach((done) => {
  // Cleanup
  if (socket.connected) {
    socket.disconnect()
  }
  done()
})

describe('basic socket.io example', () => {
  test('should communicate', (done) => {
    // once connected, emit Hello World
    ioServer.emit('echo', 'Hello World')

    socket.once('echo', (message) => {
      // Check that the message matches
      expect(message).toBe('Hello World')
      done()
    })

    ioServer.on('connection', (mySocket) => {
      expect(mySocket).toBeDefined()
    })
  })
})
