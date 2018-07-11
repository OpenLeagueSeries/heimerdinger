const http2 = require('http2')

/*
 * the draft handler is a player queue that allows bid transactions and then assignment transactions
 * on an in memory state.
 *
 * All transactions must be recorded and served and then reversible by admins.
 * Bid transactions are merged into the assignment transaction after a bid is closed
 *
 * The central timer and the ability to pause is also important.
*/

const draftHandler = (stream, headers) => {
  stream.write(JSON.stringify({this:'draft'}))
}

module.exports = draftHandler
