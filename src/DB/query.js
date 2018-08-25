const registerUser = String(function (params) {
  const db = require('@arangodb').db;
  const aql = require('@arangodb').aql;

  const auth = db['AuthToken'].insert({heck:params.heck})._id;
  const user = db['User'].insert({
    'name' : params.body.name,
    'email' : params.body.email,
    'ign' : params.body.ign})._id;
    return {user,auth}
})

module.exports = {
  registerUser
}
