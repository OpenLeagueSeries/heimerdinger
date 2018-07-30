import http2 from 'http2';

const tournamentHandler = (stream, headers) => {
  console.log('tournament')
  stream.write(JSON.stringify({this:'tournament'}))
}

module.exports = tournamentHandler
