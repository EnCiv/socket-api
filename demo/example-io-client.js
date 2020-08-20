const socketIoClient = require('socket.io-client')

let socket

const host = 'localhost'
const port = 8000

socket = socketIoClient.connect(`http://${host}:${port}`, {
  'reconnection delay': 0,
  'reopen delay': 0,
  'force new connection': true,
  transports: ['websocket'],
})

socket.on('connect', () => {
  console.log('socket connected', socket.id)
})
