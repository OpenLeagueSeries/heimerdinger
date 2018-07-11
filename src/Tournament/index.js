const http2 = require('http2')

const tournamentHandler = (stream, headers) => {
  console.log('tournament')
  stream.write(JSON.stringify({this:'tournament'}))
}

module.exports = tournamentHandler
