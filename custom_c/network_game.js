var NetworkUser = require('./network_user.js');

class NetworkGame {
    constructor(game){
        this.users = game.users.map(x => new NetworkUser(x));
        this.deck = game.deck;
        this.playToken = game.playToken;
    }
}

module.exports = NetworkGame;