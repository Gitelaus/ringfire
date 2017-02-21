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
var VALUES = ["K", "Q", "J", "A", "10", "9", "8", "7", "6", "5","4", "3", "2"];
var default_rules = [
    {value:"K", rule:"Pour some of your drink into the king cup, if you get the forth, you down it"},
    {value:"Q", rule:"You're the question master, anyone who answers your questions must drink"},
    {value:"J", rule:"Create your own rule"},
    {value:"A", rule:"Waterfall, drink till the person to the right of you stops drinking, or carry on."},
    {value:"10", rule:"Categories - Pick a subject, name a thing in that subject/context. Person who can't drinks."},
    {value:"9", rule:"Rhyme with words, pick a word and the person who can't think of a rhyme drinks"},
    {value:"8", rule:"You get the ability to pick a mate, and when you drink, they drink"},
    {value:"7", rule:"Heaven Master - When you put up your hand, the last person to follow must drink"},
    {value:"6", rule:"Six is Dicks. Guys drink"},
    {value:"5", rule:"5 is never have I ever. Name something and everyone who's done that must drink"},
    {value:"4", rule:"Four is whores. Girls drink"},
    {value:"3", rule:"Three is me. You must drink"},
    {value:"2", rule:"Two is you. You get to pick a player to drink"},
]
//

app.get('*', (req, res) => {
    var t_url = req.url.split("?")[0]
    var f_path = __dirname + '/client' + (t_url == "/" ? "/index.html" : t_url);
    fs.stat(f_path, (err, stat) => {
        if(err == null){
            res.sendFile(f_path);
        }else{
                .log("Request for " + t_url + " failed");
        }
    });
});

var users = new Array();
var games = new Array();
var reconnects = 0;
io.on('connection', (client) => {
    client.emit('rule_update', default_rules);
    client.on('join_game', (data) => {
        var g;
        if(data.gameid == "-c"){
            g = new Game(randomstring.generate(4).toUpperCase(), client, data.rules);
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
        client.emit('join_game', {name:data.name,token:g.token, deck:g.deck, users:namelist, rules:g.rules});
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
    constructor(token, host, rules){
        this.token = token;
        this.users = [];
        this.host = host;
        this.deck = [];
        this.generateDeck();
        this.goIndex = 0;
        this.rules = rules || default_rules;
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
