import http2 from 'http2';
import db from '../DB/index.js';
import { aql } from 'arangojs';
import SubscriptionWrapper from '../lib.js';

const userDetailsSub = new Map();
const UserCollection = db.collection('User');


export const detailsHandler = (stream, user, id) => {
  userDetailsSub.has(id[0]) || userDetailsSub.set(id[0], new SubscriptionWrapper());
  userDetailsSub.get(id[0]).sub(stream,
    db.query(aql`FOR u IN User
                 FILTER u._key == ${id[0]}
                RETURN u`)
    .then((arangoResponse) => {
      return JSON.stringify(arangoResponse._result);
    }));
}

export const meHandler = (stream, user) => {
  console.log('ME', ' : ', 'Me handler started', user);
  if (!user) {
    stream.write(': you\'re not logged in');
    return false;
  }
  userDetailsSub.has(user) || userDetailsSub.set(user, new SubscriptionWrapper());
  userDetailsSub.get(user).sub(stream,
    db.query(aql`FOR u IN User
FILTER u._id == ${user}
FOR ou IN Organization_User
FILTER ou._to == ${user}
RETURN {"name": u.name, "email": u.email, "ign": u.ign, "role" : ou.role }`)
    .then((arangoResponse) => {
      console.log(arangoResponse)
      return JSON.stringify(arangoResponse._result);
    }));
}

export const detailsChanger = (stream, user, id, body) => {
  if (user.id = id[0]) {
    userDetailsSub.has(id[0]) || userDetailsSub.set(id[0], new SubscriptionWrapper());
    userDetailsSub.get(id[0]).update(UserCollection.update({_key:id[0]}, body).then((update) => JSON.stringify(update)));
  } else {
    return false;
  }
}
