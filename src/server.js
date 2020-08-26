'use strict'

const socketIo = require('socket.io')

const validateEnvKey = require('./util')

function fromKeyList(packet) {
  const api_keys = process.env.SOCKET_API_KEYS || '[]'
  let index = api_keys.indexOf(packet[1])
  console.info('fromKeyList found:', index)
  return index > -1
}

function socketApiServer(apis, initFunction, authenticator = fromKeyList) {
  validateEnvKey('SOCKET_API_KEYS')

  const ioServer = socketIo().listen(process.env.PORT || 8000)
  initFunction && process.nextTick(initFunction)

  ioServer.on('connection', (socket) => {
    console.info('connected to socket:', socket.id)

    // this must be first - to block unauthenticated access to the APIs
    socket.use((packet, next) => {
      if (socket.auth) return next()
      else if (packet[0] === 'authenticate' && authenticator(packet)) {
        socket.auth = true
        socket.emit('authenticated')
        return next()
      } else return next() // silently ignore unauthorized packets
    })

    socket.on('disconnect', () => {
      console.info('disconnected from socket:', socket.id)
      delete socket.auth
    })

    apis.forEach((api) => {
      socket.on(api.name, (...args) => {
        if (!socket.auth) return // silently ignore unauthorized packets
        try {
          console.info('calling %s with args:', api.name, ...args)
          api.func(...args)
        } catch (error) {
          console.error(
            'socketApiServer caught error from API',
            api.name,
            error
          )
        }
      })
    })
  })

  function disconnect() {
    ioServer.close()
  }

  return disconnect
}

module.exports = socketApiServer
