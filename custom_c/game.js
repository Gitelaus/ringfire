var User = require('./user.js');
var Card = require('./card.js');

class Game {
    constructor(){
        this.users = new Array();
        this.deck = new Array();
        this.playToken = 0;
    }

    advanceRound(){
        this.playToken += 1;
        if(this.playToken > this.users.length - 1){
            this.playToken = 0;
        }
        return this.playToken;
    }

    getActivePlayer(){
        return this.users[this.playToken];
    }

    addUser(user){
        var t_user = this.users.find(u => u.id === user.id);
        if(t_user){
            t_user.client = user.client;
            console.log('combined');
            return;
        }
        console.log('new user');
        this.users.push(user);
    }
}

module.exports = Game;