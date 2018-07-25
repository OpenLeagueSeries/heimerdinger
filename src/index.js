const http2 = require('http2');
const fs = require('fs');

const draftHandler = require('./Draft/index.js');
const tournamentHandler = require('./Tournament/index.js');
const userHandler = require('./User/index.js');
const { parse } = require('querystring');

const options = {
    key: fs.readFileSync('./certs/server.key'),
    cert: fs.readFileSync('./certs/server.crt')
}

const server = http2.createSecureServer(options)

server.on('error', (err) => {
  console.log('ERROR(1):', err);
})

server.on('session', (session, headers) => {

 })

 server.on('stream', (stream, headers) => {
  let body = '';
   stream.respond({
     'Content-Type': 'application/json',
     ':status': 200,
     'Access-Control-Allow-Origin': '*',
     'Access-Control-Allow-Headers': 'content-type'
   });
   if (headers[':method'] === "POST") {
    stream.on('data', chunk => {
      body += chunk.toString();
    });
    stream.on('end', () => {
      draftHandler(stream, headers, JSON.parse(body))
      stream.end('ok');
    });

   } else {
   switch(headers[':path']) {
    case '/tournament':
      tournamentHandler(stream, headers)
      break;
    case '/user':
      userHandler(stream, headers)
      break;
    case '/draft':
      draftHandler(stream, headers, body)
      break;
     }
   }
 })


server.listen(4200)
