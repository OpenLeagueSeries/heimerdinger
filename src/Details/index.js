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
      return arangoResponse._result[0];
    }));
}

export const detailsChanger = (stream, user, id, body) => {
  if (user.id = id[0] || user.admin) {
    console.log(body);
    userDetailsSub.has(id[0]) || userDetailsSub.set(id[0], new SubscriptionWrapper());
    userDetailsSub.get(id[0]).update(UserCollection.update({_key:id[0]}, body, {returnNew: true}).then(update => update.new));
  } else {
    return false;
  }


}
