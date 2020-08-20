const { socketApiServer } = require('../index')

const APIs = [
  {
    name: 'foo',
    func: () => console.log('hello, world'),
  },
]

const initFunction = () => {
  console.log('init function')
}

const server = socketApiServer(APIs, initFunction)
