const registerUser = String(function (params) {
  const db = require('@arangodb').db;
  const aql = require('@arangodb').aql;

  const auth = db._query(aql`INSERT {
    'uuid' : ${params.heck}}
    INTO AuthToken RETURN NEW`);
  const user = db._query(aql`INSERT {
    'name' : ${params.body.name},
    'email' : ${params.body.email},
    'ign' : ${params.body.ign}}
    INTO User RETURN NEW`);
    return {user, auth}
})

module.exports = {
  registerUser
}
