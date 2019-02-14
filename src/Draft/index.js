import http2 from 'http2';
import SubscriptionWrapper from '../lib.js';
import draftState from './state.js';

const draftSub = new SubscriptionWrapper(); // the draft subscriptions
let currentDraft = {started: false, isCaptain: () => {return false}, isAdmin: () => {return false}}; //the current draft
const draftHandler = (stream, body, user) => {
  if (!body) {
    draftSub.sub(stream, JSON.stringify(currentDraft.started ? currentDraft.current() : currentDraft));
  } else {
    // Handle the POST request post event
    switch (body.event) {
      case 'create': //create a new draft
        if (currentDraft.started) {
          stream.write('already drafting');
          return false;
        }
        console.log('DRAFTADMIN', ' : ', 'creating a new draft');
        if (!body.players || !body.captains || !body.admins || !body.players.length > 0 || !body.captains.length > 0 || !body.admins.length > 0) {
          console.log('DRAFT' , ' : ', 'missing core info |', body)
          return false;
        }
        currentDraft = draftState.newDraft(body.players, body.captains, body.admins);
        draftSub.fire('new', JSON.stringify(currentDraft.current()));
        // create event listeners

        // PLayer has been won event
        currentDraft.events.on('playerWon', (event) => {
          console.log('DRAFT', ' : ', 'player has been won');
          draftSub.fire('playerWon', JSON.stringify({team: event.team, player: event.player}));
          if (event.nextPlayer) {
            draftSub.fire('nextBid', JSON.stringify(event.nextPlayer));
          }
        });

        // draft is over event
        currentDraft.events.on('drafttOver', (event) => {
          console.log('DRAFT', ' : ', 'draft is over');
          draftSub.fire('end', JSON.stringify(event));
          currentDraft = {started: false};
        });

        // waiting on a confirmation event
        currentDraft.events.on('waitingConfirmation', (event) => {
          console.log('DRAFT', ' : ', 'waiting on a confirmation');
          draftSub.fire('waitingConfirmation', JSON.stringify(event));
        });
        break;
      case 'start':
        currentDraft.isAdmin(user)
          .then((isAdmin) => {
            if (isAdmin) {
              console.log('DRAFTADMIN', ' : ', 'starting the draft');
              currentDraft.start()
              .then((firstPlayer) => {
                draftSub.fire('nextBid', JSON.stringify(firstPlayer))
              })
            }
          })
      case 'bid': // bid on a player
        currentDraft.isCaptain(user)
          .then((isCaptain) => {
            if (isCaptain) {
              console.log('DRAFT', ' : ', 'attempting a bid of ', body.bid);
              currentDraft.bid(user, body.bid)
                .then((newBidState) => {
                  if (newBidState) {
                    draftSub.fire('bid', newBidState);
                  }
                });
            }
          });

        break;
      case 'confirm': // confirm bid as received
        currentDraft.isCaptain(user)
          .then((isCaptain) => {
            if (isCaptain) {
              currentDraft.confirmBid(user, body.bidID);
            }
          })
          break;
      case 'revert': // revert a past bid
        currentDraft.isAdmin(user)
        .then((isAdmin) => {
          if (isAdmin) {
            console.log('DRAFTADMIN', ' : ', 'reverting a bid ', body.player);
            currenttDraft.revert(body.player);
          }
        })
        break;
      case 'reset': // reset the current bid
        currentDraft.isAdmin(user)
          .then((isAdmin) => {
            if (isAdmin) {
              console.log('DRAFTADMIN', ' : ', user, 'resetting the bid');
              currentDraft.resetBid()
            }
          })
          break;
      case 'modify': // modify a player/captain/admin
        currentDraft.isAdmin(user)
        .then((isAdmin) => {
          if (isAdmin) {
            console.log('DRAFTADMIN', ' : ', user, 'modifying a draft entry ', body.data);
            currentDraft.modify(body.data);
          }
        })
        break;
      case 'remove': // remove an entry
        currentDraft.isAdmin(user)
        .then((isAdmin) => {
          if (isAdmin) {
            console.log('DRAFTADMIN', ' : ', user, 'modifying a draft entry', body.data);
            currentDraft.delete(body.data);
          }
        })
        break;
      case 'add': // add an entry
        currentDraft.isAdmin(user)
          .then((isAdmin) => {
            if (isAdmin) {
              currentDraft.add(body.data);
            }
          })
          break;
      case 'overrideConfirm':
        currentDraft.isAdmin(user)
          .then((isAdmin) => {
            if (isAdmin) {
              currentDraft.override(body.bidID);
            }
          })
          break;
      case 'pause':
        currentDraft.isAdmin(user)
          .then((isAdmin) => {
            if (isAdmin) {
              currentDraft.pause();
              draftSub.fire('pause');
            }
          });
          break;
      case 'resume':
        currentDraft.isAdmin(user)
          .then((isAdmin) => {
            if (isAdmin) {
              currentDraft.resume();
              draftSub.fire('resume');
            }
          });
          break;
      default:
        stream.write('go away');
        break;
    }
  }
  stream.on('error', (e) => {
    console.log(e)
  })
  stream.on('close', () => {
    draftSub.unsub(stream)
  })
}

export default draftHandler
