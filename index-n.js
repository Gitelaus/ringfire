// Initalization
var app = require('express')();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var randomstring = require("randomstring");
var md5 = require('md5');
var fs = require('fs');

app.get('*', (req, res) => {
    var t_url = req.url.split("?")[0]
    var f_path = __dirname + '/client/new' + (t_url == "/" ? "/index.html" : t_url);
    if (req.url.toLowerCase().startsWith("/avatar/")){
        var url_vars = req.url.split("?")[1] || "";
        var url_var_list = getJsonFromUrl(url_vars);
        var t_n = url_var_list.name || randomstring.generate();
        var t_g = url_var_list.gender ? url_var_list.gender : (Math.random() >= 0.5 ? "male" : "female");
        avatar(md5(t_n), t_g, 64)
            .stream()
            .pipe(res);
        return;    
    }
    fs.stat(f_path, (err, stat) => {
        if(err == null){
            res.sendFile(f_path);
        }else{
            res.status(404).send('Not found');
            console.log("Request for " + t_url + " failed");
        }
    });
});

function getJsonFromUrl(url) {
  var query = url;
  var result = {};
  query.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

http.listen(process.env.PORT || 3000, () => {
    console.log('== Started == ');
});

var Game        = require('./custom_c/game.js');
var NetworkGame = require('./custom_c/network_game.js');
var User        = require('./custom_c/user.js');
var NetworkUser = require('./custom_c/network_user.js');
var Card        = require('./custom_c/card.js');
var Settings    = require('./custom_c/settings.js');

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
        var t_name = data.facebook.name || data.client.name;
        var t_id = data.facebook.id || "G-" + md5(t_name) 
        var t_user = new User(client, t_id, t_name, data.client.gender);
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
        sendGamePacket(t_game, 'new_client', new NetworkUser(t_user)); 
        t_game.addUser(t_user);
        var d = t_game.users.map(x => new NetworkUser(x));
        client.emit('join_game', {gameid:t_game.id, users:d, deck:t_game.deck, activeUser:new NetworkUser(t_game.getActiveUser())});
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
        data.rule = Settings.default_rules.find(x => x.value == data.value).rule;
        t_game.advanceRound(); 
        data.activeUser = new NetworkUser(t_game.getActiveUser());
        sendGamePacket(t_game,'card_reveal',data);
    });

    client.on('disconnect', () => {
        var t_game = findGameByClient(client);
        var t_user = findUserByValue(t_game, 'client', client);
        if(t_game && t_user){
            var n_user = new NetworkUser(t_user);
            if(t_game.removeUser(t_user)){
                game_master_list = game_master_list.filter(g => g !== t_game);    
            }
            sendGamePacket(t_game, 'disconnect_client', n_user);
        }
    });

    client.on('avatar_request', (data) => {
        var username = data.username;
        getAvatar(username, () => {
        });
    });

    client.on('game_id_search', (data) => {
        var t_game = findGameByValue('id', data.toLowerCase());
        if(t_game){
            var games = new Array();
            games.push(new NetworkGame(t_game));
            client.emit('update_games_list', games)
        }
    });
});


// Avatar Request Handler

var avatar = require('avatar-generator')({
    //Optional settings. Default settings in 'settings.js' 
    order:'background face clothes head hair eye mouth'.split(' '), //order in which sprites should be combined 
    images:require('path').join(__dirname,'./img'), // path to sprites 
    convert:'convert' //Path to imagemagick convert 
});

function getAvatar(name, callback){
        avatar(name, 'male', 128)
            .toBuffer(function (err,buffer){
                callback(buffer.toString('base64'));
            });
}

function sendGamePacket(game, message, data){
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

function findGameByValue(value, matchValue){
    return game_master_list.find(
        i_game => i_game[value] == matchValue
    );
}
