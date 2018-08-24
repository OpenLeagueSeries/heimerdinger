import http2 from 'http2';
import db from '../DB/index.js';
import { aql } from 'arangojs';
import SubscriptionWrapper from '../lib.js';

const userDetailsSub = new SubscriptionWrapper();

export const detailsHandler = (stream, user, path) => {
  console.log(path);
  userDetailsSub.sub(stream,
    db.query(aql`FOR u IN User
                 FILTER u.ign == ${decodeURI(path[2])}
                RETURN u`)
    .then((arangoResponse) => {
      return arangoResponse._result;
    }));
}
