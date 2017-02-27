// Initalization
var app = require('express')();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var randomstring = require("randomstring");

var fs = require('fs');

app.get('*', (req, res) => {
    var t_url = req.url.split("?")[0]
    var f_path = __dirname + '/client' + (t_url == "/" ? "/index.html" : t_url);
    fs.stat(f_path, (err, stat) => {
        if(err == null){
            res.sendFile(f_path);
        }else{
            res.status(404).send('Not found');
            console.log("Request for " + t_url + " failed");
        }
    });
});

http.listen(process.env.PORT || 3000, () => {
    console.log('== Started == ');
});

var Game        = require('./custom_c/game.js');
var NetworkGame = require('./custom_c/network_game.js');
var User        = require('./custom_c/user.js');
var NetworkUser = require('./custom_c/network_user.js');
var Card        = require('./custom_c/card.js');


var game_master_list = new Array();

io.on('connection', (client) => {
    // Join Game
    //  Type: "join game" / "create_game"
    //  facebook
    //      id
    //      name
    //  [OPTIONAL]
    //      target_facebook_user    //  ONLY EXISTS WITHIN join game TYPE
    client.on('join_game', (data) => {
        var t_user = new User(client, data.facebook.id, data.facebook.name);
        var t_game;
        switch(data.type){
            case "join_game":
                t_game = findGameByUser(data.target_facebook_user);
                break;
            case "create_game":
                t_game = new Game();
                game_master_list.push(t_game);
                break;
        }
        updateGameClients(t_game, 'new_client', {name:t_user.name,id:t_user.id}); 
        t_game.addUser(t_user);
        var d = t_game.users.map(x => new NetworkUser(x));
        client.emit('join_game', {users:d, deck:t_game.deck});
    });

    // Facebook Check Games
    // Array
    //  friend{
    //      id,
    //      name
    //  }        
    client.on('facebook_check_games', (data)=>{
        var friendGames = new Array();
        data.forEach((friend) => {
            var t_game = findGameByUser(friend.id);
            if(t_game){
                friendGames.push(new NetworkGame(t_game));
            }
        });
        client.emit('update_games_list', friendGames);
    });


    client.on('card_reveal', (data) => {
        var t_game = findGameByClient(client);
        var t_user = findUserByValue(t_game, 'client', client)
        if(t_game.getActiveUser() !== t_user){
            return;    
        }
        t_game.deck.find(x => x.house == data.house && x.value == data.value).revealed = true;
        updateGameClients(t_game,'card_reveal',data);
        t_game.advanceRound(); 
    });

    client.on('disconnect', () => {
        var t_game = findGameByClient(client);
        var t_user = findUserByValue(t_game, 'client', client);
        if(t_game && t_user && t_game.removeUser(t_user)){
            game_master_list = game_master_list.filter(g => g !== t_game);
        }
    });
});

function updateGameClients(game, message, data){
    game.users.forEach((user) => {
        user.client.emit(message, data);
    });
}

function findGameByUser(userID){
    return game_master_list.find(
                            i_game => i_game.users.find(
                                i_user => i_user.id == userID));
}

function findUserByValue(game, value, matchValue){
    if(!game)return null;
    return game.users.find(i_user => i_user[value] == matchValue);
}

function findGameByClient(client){
    return game_master_list.find(
                            i_game => i_game.users.find(
                                i_user => i_user.client == client));
}
