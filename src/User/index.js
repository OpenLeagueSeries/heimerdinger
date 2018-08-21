import http2 from 'http2';
import db from '../DB/index.js';
import SubscriptionWrapper from '../lib.js';

const userSub = new SubscriptionWrapper();
export const userHandler = (stream, user) => {
  userSub.sub(stream, {userList: [
    {id: 1, name: 'Michael Santana', ign: 'imaqtpie', isCurrentPlayer: true, notes:'', roles: 'ADC', cap_in: false},
    {id: 2, name: 'Zacqueri Black', ign: 'Aphromoo', isCurrentPlayer: false, notes:'', roles: 'Support', cap_in: true},
    {id: 3, name: 'Peng Yiliang', ign: 'Doublelift', isCurrentPlayer: false, notes:'', roles: 'ADC', cap_in: false},
    {id: 4, name: 'Søren Bjerg', ign: 'Bjergsen', isCurrentPlayer: false, notes:'', roles: 'Mid', cap_in: true},
    {id: 5, name: 'Trevor Hayes', ign: 'Stixxay', isCurrentPlayer: false, notes:'', roles: 'ADC', cap_in: false}
  ]})
  stream.on('end', () => (
    userSub.unsub(stream);
  ))
}

export const registerHandler = (stream, body, user) => {
  db.query({
      query: "INSERT {'name' : @name,'email' : @email} INTO User",
      bindVars: { name: body.name, email: body.email}
  })
  .then((result) => {
    userSub.update(result)
  })
  .catch((e)=> {
    console.log(e)
  })
  stream.end(JSON.stringify({ok:"ok"}));
}
