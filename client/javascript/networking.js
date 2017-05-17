var facebook_info = {
    id: '',
    name: ''
};

var client_info = {
    name:'',
    gender:'male'
}

// Facebook
function login(callback) {
    FB.login(function (response) {
        if (response.status === "connected") {
            facebook_info.id = response.authResponse.userID;
            FB.api('/me', function (apiResponse) {
                facebook_info.name = apiResponse.name;
                callback(facebook_info);
            });
        }
    }, { scope: 'user_friends' });
}

function logout(callback) {
    FB.logout(function (response) {
        if (response.status != "connected") {
            callback(true);
        }
    });
}

function getFacebookAppFriends(callback) {
    FB.api('/me/friends/', function (response) {
        callback(response.data);
    });
}


// SocketIO
var hostname = window.location.hostname;
var socket = io(hostname === "localhost" ? null : 'ringfire.herokuapp.com');
console.log(hostname === "localhost" ? null : 'ringfire.herokuapp.com')

function createGame() {
    var data = {
        type: 'create_game',
        facebook: facebook_info,
        client: client_info
    };
    socket.emit('join_game', data);
}

function joinGame(targetUserID, targetGameID) {
    var data = {
        type: 'join_game',
        facebook: facebook_info,
        client: client_info,
        target_facebook_user: targetUserID,
        target_game:targetGameID
    };
    socket.emit('join_game', data);
}

function refreshGamesList() {
    getFacebookAppFriends(function (friends) {
        socket.emit('facebook_check_games', friends);
    });
}

function sendPacket(name, packet) {
    socket.emit(name, packet);
}

function getUserImage(userID, callback) {
    FB.api('/' + userID + '/picture?height=80', function (response) {
        callback(response.data);
    });
}

// Incoming Message Handling

// Game
//  Users
//  Deck
socket.on('join_game', function (data) {
    facebook_info.id = data.id;
    toggleMenu();
    setupCanvas();
    createDeck(data.deck);
    $('#game_id').html('GameID: <br />' + data.gameid);
    data.users.forEach(function (user) {
        addPlayer(user);
    });
    setActivePlayer(data.activeUser);
});

socket.on('new_client', function (data) {
    addPlayer(data);
});

socket.on('disconnect_client', function (data) {
    removePlayer(data);
});

socket.on('update_games_list', function (games) {
    console.log(games);
    games.forEach(function (i_game) {
        addGameListing(i_game);
    });
    if (games.length < 1) {
        addGameListing(null);
    }
});

socket.on('card_reveal', function (data) {
    revealCard(data.house, data.value);
    var str = "images/cards/card" + (data.house + data.value) + ".png";
    showMessageAnnoucement(str, data.rule, function () {
        setActivePlayer(data.activeUser);
    });
});
