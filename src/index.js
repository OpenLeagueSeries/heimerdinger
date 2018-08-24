const http2 = require('http2');
const fs = require('fs');

import postRoutes from './postRoutes.js';
import getRoutes from './getRoutes.js';

import tournamentHandler from './Tournament/index.js';
import userHandler from './User/index.js';
import parse from 'querystring';

const options = {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.crt')
};

const server = http2.createSecureServer(options);
export const Sessions = new Map();

const processPath = (pathString) => {
  const pathSplit = pathString.split('/');
  return {route: pathSplit[1], options: pathSplit.splice(0,3)};
}

server.on('error', (err) => {
  console.log('ERROR(1):', err);
})

server.on('session', (session, headers) => {
  Sessions.has(session) || Sessions.set(session, headers); //this is for once we receive the session token authorization
})

 server.on('stream', (stream, headers) => {

  const user = Sessions.get(stream.session);
  stream.respond({
    'Content-Type': 'application/json',
    ':status': 200,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, content-type'
  });

  if (headers[':method'] === 'OPTIONS') { //OPTIONS only needs the CORS response
      stream.end();
  } else if (headers[':method'] === "POST") { //POST needs to receive data chunks
    postRoutes(stream, processPath(headers[':path']), user);
  } else {  //GET REQUESTS for output streams
    getRoutes(stream, processPath(headers[':path']), user);
   }
 })


server.listen(4200)
