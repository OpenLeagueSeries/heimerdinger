import http2 from 'http2';

const tournamentHandler = (stream, user) => {
  console.log('tournament')
  stream.write(JSON.stringify({this:'tournament'}))
}

export default tournamentHandler
