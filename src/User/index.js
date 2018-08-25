import http2 from 'http2';
import db from '../DB/index.js';
import { aql } from 'arangojs';
import SubscriptionWrapper from '../lib.js';
import createMailgun from 'mailgun-js';
import uuid from 'uuid/v5'

const userSub = new SubscriptionWrapper();
const mg = createMailgun({apiKey: 'fornicatebrentius', domain: 'mg.pitt.lol'});

export const userHandler = (stream, user) => {

  console.log('user/index.js: userHandler');

  userSub.sub(stream,
    db.query(aql`FOR u IN User RETURN u._key`)
    .then((arangoResponse) => {
      return arangoResponse._result;
    }));
}

export const registerHandler = (stream, body, user) => {

  /**
  create uuid, store in db (AuthToken), then send link to register createMailgun
  **/

  //console.log('user/index.js: registerHandler');
  const heck = uuid("https://pitt.lol/getAuthToken", uuid.URL);
  //console.log(heck)

  userSub.update(db.transaction({
    collections: {
      write: [ "User", "AuthToken" ]
    },
    action: function () {

      db.query(aql`INSERT {
        'name' : ${body.name},
        'email' : ${body.email},
        'ign' : ${body.ign}}
        INTO User`);
      db.query(aql`INSERT {
        'uuid' : ${heck}
        INTO AuthToken`);
    }
  }).then((result)=>{
    const data = {
      from: 'LoL @ Pitt <lolatpitt@mg.pitt.lol>',
      to: body.email,
      subject: 'LoL@Pitt Registration',
      text: `Hello, ${body.name}. Thank you for registering to play in LoL@Pitt's OLS Tournament this fall. Please go to this link in order to complete your signup: www.fish4hoes.com`
    };


    // console.log(mg);
		// mg.messages().send(data, function (error, response) {
    //   console.log(error);
    //   console.log(response);
  	// });
  })
	  .catch((err)=> {
    console.log(err)
  }))

  stream.end(JSON.stringify({ok:"ok"}));
}
