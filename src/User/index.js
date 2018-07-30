import http2 from 'http2';
import db from '../DB/index.js';

const userHandler = (stream, headers) => {
  stream.write(JSON.stringify({this: 'user'}))
}

const registerHandler = (stream, headers, body) => {
  db.query({
      query: "INSERT {'name' : @name,'email' : @email} INTO User",
      bindVars: { name: body.name, email: body.email}
  })
  .then((result) => {
    console.log(result)
  })
  .catch((e)=> {
    console.log(e)
  })
  stream.end(JSON.stringify({ok:"ok"}));
}
module.exports = { userHandler, registerHandler }
