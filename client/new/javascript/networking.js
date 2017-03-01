var facebook_info = {
    id: '',
    name: ''
};

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

var socket = io('ringfire.herokuapp.com');

function createGame() {
    var data = {
        type: 'create_game',
        facebook: facebook_info
    };
    socket.emit('join_game', data);
}

function joinGame(targetUserID) {
    var data = {
        type: 'join_game',
        facebook: facebook_info,
        target_facebook_user: targetUserID
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
    toggleMenu();
    setupCanvas();
    console.log(data.deck[0].revealed);
    createDeck(data.deck);
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