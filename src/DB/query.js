const registerUser = String(function (params) {
  const db = require('@arangodb').db;

  db._query(aql`INSERT {
    'uuid' : ${params.heck}}
    INTO AuthToken`);
  return db._query(aql`INSERT {
    'name' : ${params.body.name},
    'email' : ${params.body.email},
    'ign' : ${params.body.ign}}
    INTO User`);
})

module.exports = {
  registerUser
}
