# Socket.io API Server for Undebate

A general purpose socket.io API server for use with
EnCiv/undebate to communicate with external services.

## Usage

To add this to `package.json`, edit the file and add this to the dependencies.

```json
  "dependencies": {
    ...
    "socket-api": "git+https://github.com/EnCiv/socket-api.git"
    ...
  }
```

This must be done on both client and server.

### Socket API Server

To setup the socket-api server on an external service (such as smpreview),
first import the `socketApiServer` function:

```javascript
const { socketApiServer } = require('socket-api')
```

Next, define the functions your API will support. In this example,
we will define an API function called `foo`:

```javascript
const APIs = [
  {
    name: 'foo',
    func: () => console.log('hello, world'),
  },
]
```

Optionally, you can define a function that will run
while the server is initializing:

```javascript
const initFunction = () => {
  console.log('initialized')
}
```

Last, start the server:

```javascript
socketApiServer(APIs, initFunction)

// >>> initialized
```

The `socketApiServer` function returns a `disconnect` function
that can be used to close the socket.io server.

```javascript
const disconnect = socketApiServer(APIs, initFunction)
// ... do some things
disconnect()
```

There is one required and one optional environment variable for
setting up the socket-api server.

```bash
SOCKET_API_KEYS=["a list of long, private API keys"] # required
PORT=8000 # optional with default
```

### Socket API Client

To set up the socket-api client on Undebate or some other application,
first import the `callSocketApi` function:

```javascript
const { callSocketApi } = require('socket-api')
```

Then, just call the `callSocketApi` function with the name of the API
function you want to call as the first argument. For example, we can
call the `foo` function we defined earlier:

```javascript
callSocketApi('foo')

// >>> hello, world
```

You can pass additional arguments to the `callSocketApi` function if you
handle them when defining the APIs:

```javascript
// server
const APIs = [
  {
    name: 'greet',
    func: (name) => {
      console.log('hello, ' + name)
    },
  },
]
socketApiServer(APIs)

// client
callSocketApi('greet', 'john')

// >>> hello, john
```

Two environment variables are required for setting up the socket-api client:

```bash
SOCKET_API_KEY="a long private api key that matches a key on the server"
SOCKET_API_URL="https://socket-api-server-name.com"
```

## Demo

There are some initial tests using Jest, but they are currently incomplete. This
document will need to be updated as the tests are completed.

To demo the client and server, a `demo` folder was included with some simple scripts to get started.

To start the socket-api server, run:

```bash
node demo/socket-api-server.js
```

Then to run the client, in a separate terminal window or from another machine, run:

```bash
node demo/socket-api-client.js
```
