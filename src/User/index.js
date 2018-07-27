const http2 = require('http2')
const db = require('../DB/index.js')

const userHandler = (stream, headers) => {
  stream.write(JSON.stringify({this: 'user'}))
}

const registerHandler = (stream, headers, body) => {
  db.query({
      query: "INSERT {'name' : @name,'email' : @email,} INTO Users",
      bindVars: { name: body.name, ign: body.ign, email: body.email}
  })
  console.log(body.name);
  console.log(body.ign);
  console.log(body.email);
  stream.end(JSON.stringify({ok:"ok"}));
}
module.exports = { userHandler, registerHandler }
