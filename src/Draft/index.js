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

const draftHandler = (stream, headers) => {

  stream.write(JSON.stringify({array:['a']}))
  setTimeout(function () {
    stream.write(JSON.stringify({array:['a', 'b','c']}))
  }, 2000);
}

module.exports = draftHandler
