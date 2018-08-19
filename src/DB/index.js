import arangojs from 'arangojs';

const db = new arangojs.Database();
db.useDatabase("ols");
db.useBasicAuth("admin", "fucksmegs");

module.exports = db
