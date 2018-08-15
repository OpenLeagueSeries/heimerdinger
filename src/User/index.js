import http2 from 'http2';
import db from '../DB/index.js';

export const userHandler = (stream, user) => {
  stream.write(JSON.stringify({this: 'user'}))
}

export const registerHandler = (stream, body, user) => {
  db.query({
      query: "INSERT {'name' : @name,'email' : @email} INTO User",
      bindVars: { name: body.name, email: body.email}
  })
  .then((result) => {

  })
  .catch((e)=> {
    console.log(e)
  })
  stream.end(JSON.stringify({ok:"ok"}));
}
