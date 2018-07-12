var redis = require("redis")

const newDraft = (players, captains, admins) => {
  const client = redis.createClient();

  client.on("error", function (err) {
    console.log("Error " + err);
  });

  state = {
    players: players,
    teams: captains.map((cap) => {
      return {
        name: `${cap.name}'s Team`,
        captain: cap,
        players: [],
        points: 0
      }
    }),
    admins: admins,
    transactions: []
  }

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
  adminArray.sadd(adminArray)
  return client
}

const getCurrentState = (client) => {

}
