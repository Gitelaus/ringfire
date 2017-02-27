var Settings = require('./settings.js');
var User = require('./user.js');
var Card = require('./card.js');

class Game {
    constructor(){
        this.users = new Array();
        this.deck = new Array();
        this.generateDeck();
        this.playToken = 0;
    }

    advanceRound(){
        this.playToken += 1;
        if(this.playToken > this.users.length - 1){
            this.playToken = 0;
        }
        return this.playToken;
    }

    getActiveUser(){
        return this.users[this.playToken];
    }

    addUser(user){
        var t_user = this.users.find(u => u.id === user.id);
        if(t_user){
            t_user.disconnect();
            t_user.client = user.client;
            return;
        }
        console.log('new user');
        this.users.push(user);
    }

    removeUser(user){
        this.users = this.users.filter(u => u !== user);
        console.log(this.users);
        if(this.users.length < 1){
            return true;
        }
        return false;
    }

    generateDeck(){    
      Settings.HOUSES.forEach((house) => {    
        Settings.VALUES.forEach((value) => {
          this.deck.push(new Card(house, value, false));
        });
      });
      this.deck = shuffle(this.deck);
    }
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

module.exports = Game;