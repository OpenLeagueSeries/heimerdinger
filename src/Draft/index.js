import http2 from 'http2';
import SubscriptionWrapper from '../lib.js';

const draftSub = new SubscriptionWrapper();
const draftHandler = (stream, body, user) => {
  if (!body) {
    draftSub.sub(stream, {number: 34});
  } else {
    draftSub.update({number: (body.number%2 === 1 ? 3 * body.number + 1: body.number/2)});
    stream.end(JSON.stringify({ok:"ok"}));
  }
  stream.on('error', (e) => {
    console.log(e)
  })
  stream.on('close', () => {
    Subscribers.delete(stream)
  })
}

export default draftHandler
