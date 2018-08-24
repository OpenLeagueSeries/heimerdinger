import http2 from 'http2';
import db from '../DB/index.js';
import { aql } from 'arangojs';
import SubscriptionWrapper from '../lib.js';
import createMailgun from 'mailgun-js';

const userSub = new SubscriptionWrapper();
const mg = createMailgun({apiKey: 'fornicatebrentius', domain: 'mg.pitt.lol'});

export const userHandler = (stream, user) => {
  userSub.sub(stream,
    db.query(aql`FOR u IN User RETURN u`)
    .then((arangoResponse) => {
      return arangoResponse._result;
    }));
}

export const registerHandler = (stream, body, user) => {

  userSub.update(db.query({
        query: "INSERT {'name' : @name,'email' : @email, 'ign' : @ign} INTO User",
        bindVars: { name: body.name, email: body.email, ign: body.ign}
  }).then((result)=>{
		const data = {
			from: 'LoL @ Pitt <lolatpitt@mg.pitt.lol>',
			to: body.email,
			subject: 'LoL@Pitt Registration',
			text: `Hello, ${body.name}. Thank you for registering to play in LoL@Pitt's OLS Tournament this fall. Please go to this link in order to complete your signup: www.fish4hoes.com`
		};
 console.log(mg);
		mg.messages().send(data, function (error, response) {
      console.log(error);
      console.log(response);
  	});
  })
	  .catch((err)=> {
    console.log(err)
  }))

  stream.end(JSON.stringify({ok:"ok"}));
}
