import http2 from 'http2';
import db from '../DB/index.js';
import SubscriptionWrapper from '../lib.js';

const userSub = new SubscriptionWrapper();

export const userHandler = (stream, user) => {
  userSub.sub(stream, db.query({
    query: "FOR u IN User RETURN u"
  }));
}

export const registerHandler = (stream, body, user) => {

  userSub.update(db.query({
        query: "INSERT {'name' : @name,'email' : @email} INTO User",
        bindVars: { name: body.name, email: body.email}
  }).catch((err)=> {
    console.log(err)
  }))

  stream.end(JSON.stringify({ok:"ok"}));
}
