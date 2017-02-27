
var facebook_info = {
    id:'',
    name:''
}

// Facebook
function login(callback){
    FB.login((response) => {
        if(response.status === "connected"){
            facebook_info.id = response.authResponse.userID;
            FB.api('/me', (apiResponse) => {
                facebook_info.name = apiResponse.name;
                callback(facebook_info);
            });
        }
    }, {scope: 'user_friends'});
}

function logout(callback){
    FB.logout((response) => {
        if(response.status != "connected"){
            callback(true);
        }
    });
}

function getFacebookAppFriends(callback){
    FB.api('/me/friends/', function(response){
        callback(response.data);
    });
}

// SocketIO

var socket = io();

function createGame(){
    var data = {
        type:'create_game',
        facebook:facebook_info
    }
    socket.emit('join_game', data);
}

function joinGame(targetUserID){
    var data = {
        type:'join_game',
        facebook:facebook_info,
        target_facebook_user:targetUserID
    };
    socket.emit('join_game', data);
}

function refreshGamesList(){
    getFacebookAppFriends((friends) => {
        socket.emit('facebook_check_games', friends);
    });
}

function sendPacket(name, packet){
    socket.emit(name, packet);
}

function getUserImage(userID, callback){
    FB.api('/' + userID + '/picture?height=80', (response) => {
        callback(response.data);
    });
}


// Incoming Message Handling

// Game
//  Users
//  Deck
socket.on('join_game', (data) => {
    toggleMenu();
    setupCanvas();
    createDeck(data.deck);
    data.users.forEach((user) => {
        addPlayer(user);
    });
});

socket.on('new_client', (data)=>{
    addPlayer(data);
})

socket.on('update_games_list', (games) => {
    console.log("got game update");
    games.forEach((i_game) => {
        addGameListing(i_game);
    });
});

socket.on('card_reveal', (data) => {
    revealCard(data.house, data.value);
});