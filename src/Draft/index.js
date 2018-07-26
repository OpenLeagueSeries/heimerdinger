const http2 = require('http2')

/*
 * the draft handler is a player queue that allows bid transactions and then assignment transactions
 * on a redis cache.
 *
 * All transactions must be recorded and served and then reversible by admins.
 * Bid transactions are merged into the assignment transaction after a bid is closed
 *
 * Each player bid has its own central timer that may be held by either admins or captains
*/

/*
 * current bid state - hashmap
 * player to be bid on list - sorted set
 * bidders list - set (for scanning)
*/

const Subscribers = new Set();

const draftHandler = (stream, headers, body) => {

  if (body.length === 0) {
    stream.write(JSON.stringify({number: 34}));
    Subscribers.has(stream) || Subscribers.add(stream);
  } else {
    console.log(Subscribers.size)
    Subscribers.forEach((sub) => {
      sub.write(JSON.stringify({number: (body.number%2 === 1 ? 3 * body.number + 1: body.number/2)}))
    })
  }
  stream.on('error', (e) => {
    console.log(e);
  })
  stream.on('close', () => {
    Subscribers.delete(stream);
  })

}

module.exports = draftHandler
