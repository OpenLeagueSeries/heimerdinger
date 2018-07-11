const http2 = require('http2')

const userHandler = (stream, headers) => {
  stream.write(JSON.stringify({this: 'user'}))
}

module.exports = userHandler
