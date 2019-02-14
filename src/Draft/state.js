import redis from 'redis'
import { promisify } from 'util'
import events, { EventEmitter } from 'events';

const client = redis.createClient();
const smembersAsync = promisify(client.smembers).bind(client);
const zrangeAsync = promisify(client.zrange).bind(client);
const zrangeByScoreAsync = promisify(client.zrangebyscore).bind(client);
/*
    REDIS client has 3 sorted sets and 2 insertion sort sets:
    'players' - sorted by elo/expected bid value
    'teams' - sorted by remaining points
    'currentBidding' = sorted by expected value
    'admins' - user accounts with admin privileges
    'events' = event log

*/
client.on('error', function (err) {
  console.log('REDISERROR', ' : ', err);
});

const newDraft = (players, captains, admins) => {
  const playerArray = ['players']
  players.forEach((p)=> {
    playerArray.push(p.ELO)
    playerArray.push(JSON.stringify(p))
  })
  client.zadd(playerArray);

  const teamArray = ['teams']
  captains.forEach((cap) => {
    teamArray.push(cap.points)
    teamArray.push(JSON.stringify({
      name: `${cap.name}'s Team`,
      captain: JSON.stringify(cap),
      players: [],
      points: cap.points
    }))
  })
  client.zadd(teamArray);

  const adminArray = []
  admins.forEach((admin) => {
    adminArray.push(JSON.stringify(admin))
  })
  client.sadd('admins', adminArray)
  client.sadd('events', JSON.stringify({action: 'CREATE DRAFT', players: playerArray, teams: teamArray, admins: adminArray}));

  // the draft Object
  const draft =  {
    started: true,
    events: new EventEmitter(),
    current: () => {
      const values = [zrangeAsync('players', 0, -1), zrangeAsync('teams', 0, -1)]
      return Promise.all(values).then((res) => {
        return { players: res[0], teams: res[1], bid: this.currentBid};
      });
    },
    currentBid: {
      player: {},
      team: null,
      value: null,
      timestamp: 0,
      runoff: false,
      id: 0,
      confirmations: new Set()
    },
    countdown: null,
    isCaptain: (user) => {
      return zrangeAsync('teams', 0, -1).then((teams) => {
        for (let team of teams) {
          team = JSON.parse(team);
          if (team.captain._key === user._key) {
            return true;
          }
        }
        return false;
      })
    },
    isAdmin: (user) => {
      return smembersAsync('admins').then((admin) => {
        for (let admin of admins) {
          admin = JSON.parse(admin);
          if (admin._key === user._key) {
            return true;
          }
        }
        return false;
      })
    },
    start: () => {
      return zrangeAsync('players', 0, 1).then((player) => {
        this.currentBid = {player:player[0], tetam: null, value: null, timestamp: 0, runoff: false, id: 1, confirmation: new Set()}
        return this.currentBid;
      })
    },
    bid: (user, bid) => {
      if (bid < this.currentBid.value) {
        return Promise.resolve(false);
      }
      return zrangeAsync('teams', 0, -1)
      .then((teams) => {
        for (let team of teams) {
          team = JSON.parse(team);
          if (team.captain._key === user._key) {
            return (team.points > bid.value && team.players.length < 4) ? {team: team} : false;
          }
        }
      })
      .then((enoughPoints) => {
        if (enoughPoints) {
          if (this.countdown && this.countdown != 'waiting') {
            clearTimeout(this.countdown);
          }
          const team = enoughPoints.team
          this.currentBid = {...this.currentBid, value: bid, team: team, timestamp: Date.now(), id: ++this.currentBid.id, confirmation: new Set()};
          this.countdown = !this.currentBid.runoff ?
          setTimeout((id) => this.startRunoff(id), 5000) :
          setTimeout((id) => this.finalizeBid(id), 5000);
          return this.currentBid;
        }
      })
    },
    finalizeBid: (id) => {
      //attempt to finalize bid
      zrangeByScoreAsync('teams', this.currentBid.value)
        .then((eligibleTeams) => {
          let confirmed = true;
          for (let eligibleTeam in eleigibleTeams) {
            if (!this.currentBid.confirmation.has(JSON.parse(eligibleTeam.captain)._key)) {
              this.events.emit('waitingConfirmation', {eligibleTeam});
              confirmed = false;
            }
          }
          if (confirmed) {
            this.nextBid(id);
          } else {
            this.countdown = 'waiting';
          }
        });
    },
    startRunoff: (id) => {
      if (this.currentBid.id === id) { // has not been outbid in the last few milliseconds
        this.currentBid.runoff = true;
        this.currentBid.timestamp = Date.now(); // update time timestamp to ensure new clients accurately render countdown
        this.countdown = setTimeout((id) => this.finalizeBid(id), 5000);
      }
    },
    nextBid: (id) => {
      zrangeAsync('players', 1, 2).then((nextPlayer) => {
        if (this.currentBid.id === id) { // has not been outbid in the last few milliseconds
            client.zrem('players', this.currentBid.player);
            client.zrem('teams', this.currentBid.team);
            this.currentBid.team.players.push(this.currentBid.player);
            this.currentBid.team.points -= this.currentBid.value;
            client.zadd(['teams', this.currentBid.team.points, this.currentBid.team]);
            this.events.emit('playerWon', {player: this.currentBid.player, team: team, nextPlayer: nextPlayer.length > 0 ? nextPlayer[0] : false});
            this.currentBid = {player: nextPlayer[0], team: null, value: null, timestamp: 0, runoff: false, id: ++this.currentBid.id, confirmation: new Set()};
            this.countdown= null;
        }
      })
    },
    confirmBid: (user, id) => {
      if (this.currentBid.id === id) {
        this.currentBid.confirmation.add(user._key);
        if (this.countdown === 'waiting') {
          this.finalizeBid(id);
        }
      }
    },
    revert: (player) => {
      // Search teams for the player
      // remove player from team and give points back
      // put player back in list
      // reset bidding and start new bid with player
    },
    resetBid: () => {
      this.currentBid = {...this.currentBid, team: null, value: null, timestamp: 0, runoff: false, id: ++this.currentBid.id, confirmation: new Set()};
      clearTimeout(this.countdown);
      this.countdown = null;
    },
    modify: ({}) => {
      // remove the target
      // modify the target
      // readd the target
    },
    remove: ({}) => {
      // remove the target from the redis
    },
    add: ({}) => {
      // add a param to the redis
    },
    pause: () => {
       clearTimeout(this.countdown);
       this.countdown = 'paused';
       this.currentBid.runoff = false;
    },
    resume: () => {
      this.countdown = setTimeout((id) => this.startRunoff(id), 5000);
    },
    override: (id) => {
      this.nextBid(id);
    }
  };
  return draft
}

module.exports = {
  newDraft: newDraft
}
