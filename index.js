// Initalization
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var randomstring = require("randomstring");

var fs = require('fs');

//
var games = [];
//

// Card Information
var HOUSES = ["Spades", "Hearts", "Diamonds", "Clubs"];
var VALUES = ["Q", "K", "J", "A", "10", "9", "8", "7", "6", "5","4", "3", "2"];
//

app.get('*', (req, res) => {
    var t_url = req.url.split("?")[0]
    var f_path = __dirname + '/client' + (t_url == "/" ? "/index.html" : t_url);
    fs.stat(f_path, (err, stat) => {
        if(err == null){
            res.sendFile(f_path);
        }else{
            console.log("Request for " + t_url + " failed");
        }
    });
});

var users = new Array();
var games = new Array();
var reconnects = 0;
io.on('connection', (client) => {
    client.on('join_game', (data) => {
        var g;
        if(data.gameid == "-c"){
            g = new Game(randomstring.generate(4).toUpperCase(), client);
            games.push(g);
        }else{
            g = games.find(x => x.token == data.gameid.toUpperCase());
        }
        if(!g)return;
        var namelist = [];
        g.users.forEach((user) => {
            user.client.emit('join_game', {name:data.name});
            namelist.push(user.name);
        });
        g.addUser(new User(data.name, client));
        client.emit('join_game', {name:data.name,token:g.token, deck:g.deck, users:namelist});
    });

    client.on('rotation_update', (data) => {
       var g = games.find(g => (g.users.find(u => u.client == client)) != null);
       if(!g){
           return;
       }
       if(g.getActiveUser().client != client)return;
       g.users.forEach((user)=>{
           user.client.emit('rotation_update', data);
       });
    });

    client.on('card_reveal', (data) => {
        var g = games.find(g => (g.users.find(u => u.client == client)) != null);
       if(!g){
           return;
       }
        var card = g.deck.find(c => (c.house == data.house && c.value == data.value));
        if(card.revealed || g.getActiveUser().client != client){
            return;
        }
        card.revealed = true;
        g.users.forEach((user) => {
            user.client.emit('card_reveal', data);
        });
        g.progressRound();
        g.getActiveUser().client.emit('buzz');
    });
    client.on('info', (data)=>{
        console.log(data);
    })
});

http.listen(process.env.PORT || 3000, () => {
    console.log('== Started == ');
});

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

class User{
    constructor(name, client){
        this.name = name;
        this.client = client;
    }
}

class Game {
    constructor(token, host){
        this.token = token;
        this.users = [];
        this.host = host;
        this.deck = [];
        this.generateDeck();
        this.goIndex = 0;
    }

    addUser(user){
        this.users.push(user);
    }

    removeUser(user){
        this.users.remove(user);
    }

    getActiveUser(){
        return this.users[this.goIndex];
    }

    progressRound(){
        this.goIndex += 1;
        if(this.goIndex > this.users.length - 1){
            console.log("tick over");
            this.goIndex = 0;
        }
    }

    generateDeck(){
      var t_HOUSES = shuffle(HOUSES);
    
      t_HOUSES.forEach((house) => {
        var t_VALUES = shuffle(VALUES);
    
        t_VALUES.forEach((value) => {
          this.deck.push(new Card(house, value, false));
        });
      });
      this.deck = shuffle(this.deck);
    }
}

class Card{
  constructor(house, value, revealed){
    this.house = house;
    this.value = value;
    this.revealed = revealed;
  }

}
