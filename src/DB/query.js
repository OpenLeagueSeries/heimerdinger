const registerUser = String(function (params) {
  const db = require('@arangodb').db;

  const auth = db['AuthToken'].insert({gtoken:params.gtoken})._id;
  const user = db['User'].insert({
    'name' : params.body.name,
    'email' : params.body.email,
    'ign' : params.body.ign
  })._id;
  const edge = db['User_AuthToken'].insert({
    '_from': auth,
    '_to': user
  })
  return {user,auth,edge}
})

module.exports = {
  registerUser
}
