import fs from 'fs'
import http2 from 'http2'

import postRoutes from './postRoutes.js';
import getRoutes from './getRoutes.js';

import tournamentHandler from './Tournament/index.js';
import userHandler from './User/index.js';
import parse from 'querystring';
import cookieparser from 'cookieparser';
import db from './DB/index.js';
import { aql } from 'arangojs';

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

server.on('stream', async (stream, headers) => {
   Sessions.has(stream.session) || Sessions.set(stream.session, await getUserData(headers));
   //not sure if getUserData is returning the right value or what
   const user = Sessions.get(stream.session);
   const path = processPath(headers[':path']);

   // EXCEPTION PATH HANDLING
   if ( path.route === 'auth' ){
     console.log('AUTH', ' : ', 'new user auth requested');
     returnTokenAsCookie(stream, headers, path);
   }

   if (headers[':method'] === 'OPTIONS') { //OPTIONS only needs the CORS response
     stream.end();
   } else if (headers[':method'] === "POST") { //POST needs to receive data chunks
     // make a change to a dataset
     stream.respond({
       'Content-Type': 'application/json',
       ':status' : 200,
       'Access-Control-Allow-Origin': headers.origin,
       'Access-Control-Allow-Headers': 'Authorization, content-type',
       'Access-Control-Allow-Credentials': true
     })
     postRoutes(stream, processPath(headers[':path']), user);
   } else {  //GET REQUESTS for output streams
     // start an event stream
     stream.respond({
       'Content-Type': 'text/event-stream',
       ':status': 200,
       'Access-Control-Allow-Origin': headers.origin,
       'Access-Control-Allow-Headers': 'Authorization, content-type',
       'Access-Control-Allow-Credentials': true
     });
     const keepAlive = setInterval(() => {stream.write(': keep alive \n')}, 30000);
     console.log('STREAMSTART', ' : ', 'new event stream started ', stream.id);
     stream.on('close', () => {
       console.log('STREAMEND', ' : ', 'event stream ended ', stream.id);
       clearInterval(keepAlive);
     })
     getRoutes(stream, processPath(headers[':path']), user);
   }
 })

const authPath = async (stream, headers, path) => {
  stream.respond({
    'Set-Cookie': 'token='+ path.options[0]+'; HttpOnly; path=/ ; Expires=' + (new Date(2050, 11)).toUTCString(),
    'Content-Type': 'application/json',
    ':status': 200,
    'Access-Control-Allow-Origin': headers.origin,
    'Access-Control-Allow-Headers': 'Authorization, content-type',
    'Access-Control-Allow-Credentials': true
  });
  Sessions.set(stream.session, await getUserData(headers));
  stream.end(': stream complete');
}

const getUserData = (headers) => {
  const token = cookieparser.parse(String(headers.cookie)).token;
  if (token) {
    const userIdTemp = db.query(aql`FOR u IN AuthToken
                 FILTER u.gtoken == ${token}
                RETURN u._id`)
                .then(async(arangoResponse) => {
                  const collection = db.edgeCollection('User_AuthToken');
                  const edges = await collection.outEdges(String(arangoResponse._result));
                  console.log('AUTH', ' : ', 'found user auth ', edges[0]._to);
                  return edges[0]._to;
                });
  } else {
    console.log('AUTH', ' : ', 'user auth failed')
    return false;
  }
}

const port = 4200

server.listen(port)
console.log('SERVERSTART', ' : ', 'server started on port ', port);
