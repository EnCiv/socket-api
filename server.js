'use strict'

const serverIo = require('socket.io')

function socketAPIServer(apis, initFunction, authenticator = fromKeyList) {
  checkEnvKeys()

  const PORT = process.env.PORT || 8000
  const server = serverIo.listen(PORT)
  console.log(`listening on port: ${PORT}`)

  let initialized = false

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

function fromKeyList(packet) {
  const api_keys = JSON.parse(process.env.SOCKET_API_KEYS || '[]')
  let index = api_keys.indexOf(packet[1])
  logger.info('fromKeyList found:', index)
  return index > -1
}

function checkEnvKeys() {
  if (!process.env.SOCKET_API_KEYS) {
    console.error(
      'SOCKET_API_KEYS needed.  On bash use: export SOCKET_API_KEYS="your-keys-here" or add them to your .bashrc file'
    )
    process.exit()
  }
}

module.exports = socketAPIServer
