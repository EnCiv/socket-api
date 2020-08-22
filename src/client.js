'use strict'

const socketIoClient = require('socket.io-client')

const validateEnvKey = require('./util')

const TIMEOUT = 60000

function callSocketApi(...args) {
  validateEnvKey('SOCKET_API_URL')
  validateEnvKey('SOCKET_API_KEY')

  const socket = socketIoClient.connect(process.env.SOCKET_API_URL, {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
    transports: ['websocket'],
  })

  function disconnect() {
    socket.emit('disconnect')
    console.info('disconnected from socket:', socket.id)
    return socket.close()
  }

  socket.on('connect', () => {
    console.info('connected to socket:', socket.id)
    socket.emit('authenticate', process.env.SOCKET_API_KEY)
    socket.on('authenticated', () => {
      socket.emit(...args)
      console.info('socket api called with args:', ...args)
      disconnect()
    })
  })

  setTimeout(disconnect, TIMEOUT)
}

module.exports = callSocketApi
