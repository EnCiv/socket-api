const http = require('http')
const socketIo = require('socket.io')

let httpServer
let ioServer

const host = 'localhost'
const port = 8000

httpServer = http.createServer().listen(port, host, () => {
  console.log(`http server listening on port: ${port}`)
})
ioServer = socketIo(httpServer)

ioServer.on('connection', (socket) => {
  console.log(`connected to socket: ${socket.id}`)

  socket.on('disconnect', () => {
    console.log(`disconnected from socket: ${socket.id}`)
  })
})
