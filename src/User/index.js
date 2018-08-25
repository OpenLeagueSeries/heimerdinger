import http2 from 'http2';
import db from '../DB/index.js';
import { aql } from 'arangojs';
import SubscriptionWrapper from '../lib.js';
import createMailgun from 'mailgun-js';
import CircularJSON from 'circular-json-es6';

const userSub = new SubscriptionWrapper();
const mg = createMailgun({apiKey: 'fornicatebrentius', domain: 'mg.pitt.lol'});

export const userHandler = (stream, user) => {
  userSub.sub(stream,
    db.query(aql`FOR u IN User RETURN u._key`)
    .then((arangoResponse) => {
      return arangoResponse._result;
    }));
}

export const registerHandler = (stream, body, user) => {

  userSub.update(db.query(aql`INSERT {
    'name' : ${body.name},
    'email' : ${body.email},
    'ign' : ${body.ign}}
    INTO User`
).then((result)=>{
		const data = {
			from: 'LoL @ Pitt <lolatpitt@mg.pitt.lol>',
			to: body.email,
			subject: 'LoL@Pitt Registration',
			text: `Hello, ${body.name}. Thank you for registering to play in LoL@Pitt's OLS Tournament this fall. Please go to this link in order to complete your signup: www.fish4hoes.com`
		};
		mg.messages().send(data, function (error, response) {
      stream.end(JSON.stringify({success:true, data: response}));
  	});
  })
	  .catch((err)=> {
      if (err.errorNum === 1210) {
        stream.end(JSON.stringify({success:false, data: "Email already exists"}));
      } else {
        stream.end(JSON.stringify({success:false, data: "Server error"}));
      }

  }))


}
