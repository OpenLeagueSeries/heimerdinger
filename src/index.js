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
    key: fs.readFileSync('/etc/letsencrypt/live/pitt.lol/fullchain.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/pitt.lol/privkey.pem')
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
   if ( path.route === 'auth' ){

      stream.respond({
        'Set-Cookie': 'token='+ path.options[0]+'; HttpOnly; path=/ ; Expires=' + (new Date(2050, 11)).toUTCString(),
        'Content-Type': 'application/json',
        ':status': 200,
        'Access-Control-Allow-Origin': headers.origin,
        'Access-Control-Allow-Headers': 'Authorization, content-type',
        'Access-Control-Allow-Credentials': true
      });
      Sessions.set(stream.session, await getUserData(headers));
      stream.end(JSON.stringify({yeah:"yeah"}));
    } else {
      stream.respond({
        'Content-Type': 'application/json',
        ':status': 200,
        'Access-Control-Allow-Origin': headers.origin,
        'Access-Control-Allow-Headers': 'Authorization, content-type',
        'Access-Control-Allow-Credentials': true
      });
    }
console.log('sessions is '+JSON.stringify(Sessions));
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
  //console.log("your token is " + token);
  if (token) {

    const userIdTemp = db.query(aql`FOR u IN AuthToken
                 FILTER u.gtoken == ${token}
                RETURN u._id`)

                .then(async(arangoResponse) => {
                  //console.log('your _id is '+arangoResponse._result +'which is type of '+ typeof String(arangoResponse._result));
                  const collection = db.edgeCollection('User_AuthToken');
                  const edges = await collection.outEdges(String(arangoResponse._result));
                  //console.log('edge is '+ JSON.stringify(edges));
                  //console.log('edge is '+ edges[0]._to);
                  return edges[0]._to;
                });



  } else {
    return false;
  }
}


server.listen(4200)
