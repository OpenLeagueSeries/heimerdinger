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
   await Promise.resolve(Sessions.has(stream.session))
   .then((sesh)=> {
     if (sesh) {
       return sesh;
     } else {
       return getUserData(headers)
       .then(( user ) =>
       { Sessions.set(stream.session, user) }
     );
     }
   })
   //not sure if getUserData is returning the right value or what
   const user = Sessions.get(stream.session);
   console.log('user is ' + JSON.stringify(user));
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
      console.log('origin is:' + headers.origin);
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
  //console.log("your token is " + token);
  if (token) {

    return db.query(aql`FOR u IN AuthToken
                 FILTER u.gtoken == ${token}
                RETURN u._id`)
                .then((arangoResponse) => {
                  // console.log(arangoResponse)
                  // console.log('your _id is '+arangoResponse._result +'which is type of '+ typeof String(arangoResponse._result));
                  const collection = db.edgeCollection('User_AuthToken');
                  return collection.outEdges(String(arangoResponse._result))
                  .then((edges) => {
                    return db.query(aql`FOR u IN User
                      FILTER u._id == ${edges[0]._to}
                      RETURN u`).then((res)=> {
                        return res._result[0];
                      })
                  })
                  .catch((err) => {
                    console.log(err);
                  });
                  //console.log('edge is '+ JSON.stringify(edges));
                  //console.log('edge is '+ edges[0]._to);
                })
                .catch((err) => {
                  console.log(err);
                });
  } else {
    return Promise.resolve(false);
  }
}


server.listen(4200)
