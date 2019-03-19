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
  userDetailsSub.has(user.id) || userDetailsSub.set(user.id, new SubscriptionWrapper());
  userDetailsSub.get(user.id).sub(stream,
    db.query(aql`FOR u IN User
FILTER u._id == ${user['id']}
FOR ou IN Organization_User
FILTER ou._to == ${user['id']}
RETURN {"name": u.name, "email": u.email, "ign": u.ign, "role" : ou.role }`)
    .then((arangoResponse) => {
      console.log(arangoResponse)
      return JSON.stringify(arangoResponse._result);
    }));
}

export const detailsChanger = (stream, user, id, body) => {
  console.log(id)
  console.log('user : ', user)
  console.log(body)
  if (user.id === id[0] || user.role === 'admin') {
    userDetailsSub.has(id[0]) || userDetailsSub.set(id[0], new SubscriptionWrapper());
    userDetailsSub.get(id[0]).update(UserCollection.update(id[0], body, {returnNew: true}).then((update) => JSON.stringify([update.new])));
  } else {
    return false;
  }
}
