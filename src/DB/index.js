import arangojs from 'arangojs';

const db = new arangojs.Database({url:"https://pitt.lol/"});
db.useDatabase("ols");
db.useBasicAuth("admin", "fucksmegs");

module.exports = db
