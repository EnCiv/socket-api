'use strict'

const clientIo = require('socket.io-client')

function socketAPIClient(...args) {
  checkEnvKeys()

  const url = process.env.SOCKET_API_URL
  const ioClient = clientIo.connect(url)
  console.info(`socketIO client connected to server at: ${url}`)

  let authenticated = false
  let queued = []

  ioClient.on('connect', () => {
    console.info('client connected', ioClient.id)
    ioClient.emit('authenticate', process.env.SOCKET_API_KEY)
    ioClient.on('authenticated', () => {
      authenticated = true
      while (queued.length) queued.shift()()
    })
  })

  function disconnect(...args) {
    ioClient.emit('force-disconnect', 'exit', ...args)
    return ioClient.close()
  }

  if (args[0] === 'disconnect') {
    if (!authenticated) queued.push(disconnect)
    else disconnect(...args)
  } else if (!authenticated) queued.push(() => ioClient.emit(...args))
  else ioClient.emit(...args)

  return ioClient
}

function checkEnvKeys() {
  if (!process.env.SOCKET_API_KEY) {
    console.error(
      'SOCKET_API_KEY needed.  On bash use: export SOCKET_API_KEY="your-key-here" or add it to your .bashrc file'
    )
    process.exit()
  }

  if (!process.env.SOCKET_API_URL) {
    console.error(
      'SOCKET_API_URL needed.  On bash use: export SOCKET_API_URL="your-key-here" or add it to your .bashrc file'
    )
    process.exit()
  }
}

module.exports = socketAPIClient
