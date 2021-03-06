import http2 from 'http2';
import { aql } from 'arangojs';
import createMailgun from 'mailgun-js';
import uuid from 'uuid/v5'

import SubscriptionWrapper from '../lib.js';
import db from '../DB/index.js';
import { registerUser } from '../DB/query.js';

const userSub = new SubscriptionWrapper();
const mg = createMailgun({apiKey: 'fornicatebrentius', domain: 'mg.pitt.lol'});

export const userHandler = (stream, user) => {

  console.log('USERLIST: ', ' : ',  'returning the user list');
  userSub.sub(stream,
    db.query(aql`FOR u IN User RETURN u._key`)
    .then((arangoResponse) => {
      return JSON.stringify(arangoResponse._result);
    }));
}

export const registerHandler = (stream, body, user) => {
  /**
  create uuid, store in db (AuthToken), then send link to register createMailgun
  **/

  console.log('REGISTRATION', ' : ', 'registration received');
  const gtoken = uuid(String(Math.random()*94839498288828888384721), uuid.URL);
//console.log(gtoken);
  const action = registerUser
  userSub.update(db.transaction(
    {write: [ "User", "AuthToken", "User_AuthToken" ]},
    action,
    {body, gtoken}).then((result)=>{
      console.log(result);
    const data = {
      from: 'LoL @ Pitt <lolatpitt@mg.pitt.lol>',
      to: body.email,
      subject: 'LoL@Pitt Registration',
      text: `Hello, ${body.name}. Thank you for registering to play in LoL@Pitt's OLS Tournament this fall. Please go to this link in order to complete your signup: https://pitt.lol/auth/${gtoken}`
    };
    mg.messages().send(data, function (error, response) {
      stream.end(JSON.stringify({success:true, data: response}));
  	});
  })
	  .catch((err)=> {
      if (err.errorNum === 1210) {
        stream.end(JSON.stringify({success:false, data: "Email already exists"}));
        const data = {
          from: 'LoL @ Pitt <lolatpitt@mg.pitt.lol>',
          to: body.email,
          subject: 'LoL@Pitt Registration',
          text: `Hello, ${body.name}. Thank you for registering to play in LoL@Pitt's OLS Tournament this fall. Please go to this link in order to complete your signup: https://pitt.lol/auth/${gtoken}`
        };
        mg.messages().send(data, function (error, response) {
      	});
      } else {
        stream.end(JSON.stringify({success:false, data: "Server error"}));
      }
  }))
}

export const userRemover = (stream, user, id) => {
  console.log('USER REMOVE', ' : ', 'removing user ', id)
  if (user.id === id[0] || user.role === 'admin') {
    db.query(aql`FOR u in User
        FILTER u._id == ${id}
        REMOVE u in User
        `).then((arangoResponse) => {
          userSub.update(db.query(aql`FOR u IN User RETURN u._key`)
          .then((arangoResponse) => {
            return JSON.stringify(arangoResponse._result);
          }))
        })
  } else {
    return false;
  }
}
