import fs from 'fs'
import http2 from 'http2'

import postRoutes from './postRoutes.js';
import getRoutes from './getRoutes.js';

import tournamentHandler from './Tournament/index.js';
import userHandler from './User/index.js';
import parse from 'querystring';
import cookieparser from 'cookieparser';

const options = {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.crt')
};

const server = http2.createSecureServer(options);
export const Sessions = new Map();

const processPath = (pathString) => {
  const pathSplit = pathString.split('/');
  return {route: pathSplit.splice(0,2)[1], options: pathSplit};
}

server.on('error', (err) => {
  console.log('ERROR(1):', err);
})

server.on('session', (session, headers) => {

})

 server.on('stream', (stream, headers) => {
   Sessions.has(stream.session) || Sessions.set(stream.session, getUserData(headers));
   const user = Sessions.get(stream.session);
  const path = processPath(headers[':path']);
   if ( path.route === 'auth' ){
      stream.respond({
        'Set-Cookie': 'token='+ path.options[0]+'; HttpOnly; path=/ ; Expires=' + (new Date(2050, 11)).toUTCString(),
        'Content-Type': 'application/json',
        ':status': 200,
        'Access-Control-Allow-Origin': headers.origin,
        'Access-Control-Allow-Headers': 'Authorization, content-type',
        'Access-Control-Allow-Credentials': true
      });
      stream.end({yeah:"yeah"});
    } else {
      stream.respond({
        'Content-Type': 'application/json',
        ':status': 200,
        'Access-Control-Allow-Origin': headers.origin,
        'Access-Control-Allow-Headers': 'Authorization, content-type',
        'Access-Control-Allow-Credentials': true
      });
    }

  if (headers[':method'] === 'OPTIONS') { //OPTIONS only needs the CORS response
      stream.end();
  } else if (headers[':method'] === "POST") { //POST needs to receive data chunks
    postRoutes(stream, processPath(headers[':path']), user);
  } else {  //GET REQUESTS for output streams
    getRoutes(stream, processPath(headers[':path']), user);
   }
 })

const getUserData = (headers) => {
  const token = cookieparser.parse(String(headers.cookie)).token;
  if (token) {

  } else {
    return false;
  }
}


server.listen(4200)
