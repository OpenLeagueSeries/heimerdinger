var redis = require("redis")

const newDraft = (players, captains, admins) => {
  state = {
    players: players,
    teams: captains.map((cap) => {
      return {
        name: `${cap.name}'s Team`,
        captain: cap,
        points: 0
      }
    }),
    admins: admins,
    transactions: []
  }
  return state
}
