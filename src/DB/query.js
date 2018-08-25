const registerUser = String("function (params) {
  const rdb = require('@arangodb').db;

  rdb._query(aql`INSERT {
    'uuid' : ${params.heck}
    INTO AuthToken`);
  return rdb._query(aql`INSERT {
    'name' : ${params.body.name},
    'email' : ${params.body.email},
    'ign' : ${params.body.ign}}
    INTO User`);
}")

module.exports = {
  registerUser
}