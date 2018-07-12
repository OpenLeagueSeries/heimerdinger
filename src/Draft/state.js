var redis = require("redis")
const { promisify } = require('util')

const smembersAsync = promisify(client.smembers).bind(client)
const zrangeAsync = promisify(client.zrange).bind(client)
/*
    REDIS client has 3 sorted sets and 2 insertion sort sets:
    'players' - sorted by elo/expected bid value
    'teams' - sorted by remaining points
    'currentBidding' = sorted by expected value
    'admins' - user accounts with admin privileges
    'events' = event log

*/

const newDraft = (players, captains, admins) => {
  const client = redis.createClient();

  client.on("error", function (err) {
    console.log("Error " + err);
  });
  const playerArray = ['players']
  players.forEach((p)=> {
    playerArray.push(p.ELO)
    playerArray.push(JSON.stringify(p))
  })
  client.zadd(playerArray)

  const teamArray = ['teams']
  captains.forEach((cap) => {
    teamArray.push(cap.points)
    teamArray.push(JSON.stringify({
      name: `${cap.name}'s Team`,
      captain: cap,
      players: [],
      points: 0
    }))
  })
  client.zadd(teamArray)

  const adminArray = []
  admins.forEach((admin) => {
    adminArray.push(JSON.stringify(admin))
  })
<<<<<<< HEAD
  client.sadd('admins', adminArray)
  client.sadd('events', {action: 'CREATE DRAFT', players: playerArray, teams: teamArray, admins: adminArray})
=======
  adminArray.sadd(adminArray)
>>>>>>> state edit
  return client
}

const getCurrentState = (client) => {
  smembersAsync()
}


module.exports = {
  newDraft: newDraft,
  get: getCurrentState
}
