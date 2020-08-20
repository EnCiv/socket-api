'use strict'

const socketIoClient = require('socket.io-client')

const validateEnvKey = require('./util')

function socketApiClient(...args) {
  validateEnvKey('SOCKET_API_URL')
  validateEnvKey('SOCKET_API_KEY')

  let authenticated = false
  let queued = []

  const socket = socketIoClient.connect(process.env.SOCKET_API_URL, {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
    transports: ['websocket'],
  })

  socket.on('connect', () => {
    console.info('connected to socket:', socket.id)
    socket.emit('authenticate', process.env.SOCKET_API_KEY)
    socket.on('authenticated', () => {
      authenticated = true
      while (queued.length) queued.shift()()
    })
  })

  function callSocketApi(...args) {
    socket.emit(...args)
    console.info('socket api called with args:', ...args)
  }

  if (!authenticated) queued.push(() => callSocketApi(...args))
  else callSocketApi(...args)

  function disconnect() {
    socket.emit('disconnect')
    console.info('disconnected from socket:', socket.id)
    return socket.close()
  }

  if (!authenticated) queued.push(disconnect)
  else disconnect()
}

module.exports = socketApiClient
