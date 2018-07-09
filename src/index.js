const http2 = require('http2')
const fs = require('fs')
const path = require('path')

const options = {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.crt')
}

const server = http2.createSecureServer(options)

server.on('error', (err) => {
  console.log('ERROR(1):', err)
})

server.on('stream', (stream, headers) => {
  console.log(headers)
  stream.respond({'status': 200})
})

server.listen(420)
