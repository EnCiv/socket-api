'use strict'

const serverIo = require('socket.io')

const api_keys = JSON.parse(process.env.SOCKET_API_KEYS || '[]')

function fromKeyList(packet) {
  let index = api_keys.indexOf(packet[1])
  logger.info('fromKeyList found:', index)
  return index > -1
}

var initialized = false

function socketAPIServer(apis, initFunction, authenticator = fromKeyList) {
  const PORT = process.env.PORT || 8000
  const server = serverIo.listen(PORT)
  console.log(`listening on port: ${PORT}`)

  server.on('connection', (socket) => {
    if (!initialized) {
      initialized = true
      initFunction && process.nextTick(initFunction)
    }

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
      delete socket.auth
    })

    socket.on('force-disconnect', (...args) => {
      console.info('socketAPIServer received force-disconnect', ...args)
      delete socket.auth
      if (args[0] === 'exit') {
        console.error(
          'not an error but disconnect exit received. exiting process'
        )
        process.nextTick(() => process.exit())
      }
    })

    apis.forEach((api) => {
      socket.on(api.name, (...args) => {
        if (!socket.auth) return // silently ignore unauthorized packets
        try {
          api.func(...args)
        } catch (error) {
          console.error(
            'socketAPIServer caught error from api',
            api.name,
            error
          )
        }
      })
    })
  })

  return server
}

module.exports = socketAPIServer
