/**
 * Written by Nathan Dawson.
 * but i'm not proud of it, it's shit
 */

/**
 * We need to talk, we need to talk to the _SERVER_
 */

var socket = io();
var form = $("form");

var username, activeUser;

form.submit(function () {
    socket.emit('message', $('#messaging').val());
});

socket.on('message', function (data) {
    $('#messages').append($('<li>').text(data));
});

socket.on('join_game', function (data) {
    console.log(data);
    //console.log($("#overlay form"));
    if (!username && data.token && data.deck && data.users) {
        username = data.name;
        setDeck(data.deck);
        data.users.forEach(function (u) {
            addPlayer(u, "https://graph.facebook.com/" + u.facebook_id + "/picture?type=normal");
        });
        $('#gameid').parent().attr('href', '?game=' + data.token);
        $('#gameid').text('GameID: ' + data.token);
        current_rules = data.rules;
        $("#pullmenu").css('display', 'flex');
    }
    $("#game_select").hide();
    addPlayer(data.name, data.facebook_id);
});

socket.on('buzz', function () {
    if(!navigator || !navigator.vibrate) {
        return;
    }
    navigator.vibrate([100, 100, 100, 100, 100, 100, 100, 100]);
});

socket.on('rotation_update', function (data) {
    cardContainer.set({
        rotation: data
    });
});

socket.on('card_reveal', function (data) {
    activeUser = data.activeUser;
    $($('span:contains(' + activeUser + ')').parent()).css('border-left','15px solid red')
    cardContainer.children.forEach(function (child) {
        if (child._cHouse == data.house && child._cValue == data.value) {
            var im = new Image();
            im.src = "/images/cards/card" + child._cHouse + child._cValue + ".png";
            child.image = im;
            child.alpha = 0.5;
            cardContainer.setChildIndex(child, 0);
        }
    });
    toggleDisplayCard(data.house, data.value);
});

var default_rules;
var current_rules;

socket.on('rule_update', function (data) {
    default_rules = data;
    current_rules = default_rules;
    $('#select_rule_value').val("K").change();
});

window.addEventListener('deviceproximity', function (event) {
    socket.emit('info', event.value);
});

// THE USER NEEDS TO _SEE_ SHIT

var stage, renderer, cardContainer;

var HOUSES = ["Spades", "Hearts", "Diamonds", "Clubs"];
var VALUES = ["K", "Q", "J", "A", "10", "9", "8", "7", "6", "5", "4", "3", "2"];
VALUES.forEach(function (value) {
    var option = $("<option/>", {
        text: value
    });
    $("#select_rule_value").append(option);
});
var cardBaseTexture;
var gamescreen;

var originX, originY, startRot;
var ui = {};

var facebook_id, facebook_name, facebookProfilePicture;


$("#textGameID").val(getParameterByName('game'));

function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}


var ua = navigator.userAgent,
    bindEvent = ua.match(/iPad/i) ? "touchstart" : "click";

$('#buttonJoin').on('touchstart click', function (e) {
    $('#subformTitle').text('Join Game');
    $('#buttonJoin').css({ 'background': 'green' });
    $('#buttonCreate').css({ 'background': 'white' });
    $('#textName').show();
    $('#textGameID').show();
    $("button:contains(You wanna fuck with the rules?)").hide();
});

$(document).ready(function () {
    var _this = this;

    $('.button').on('click touchstart tap', '.button', function () {
        $(_this).css('background', 'red');
    });
});

var reg = /iP/i;
reg.test(navigator.userAgent) && $('*').css('cursor', 'pointer');

$('#buttonCreate').bind('touchstart click', function (e) {
    e.preventDefault();
    $('#subformTitle').text('Create Game');
    $('#buttonJoin').css({ 'background': 'white' });
    $('#buttonCreate').css({ 'background': 'green' });
    $('#textName').show();
    $('#textGameID').hide();
    $("button:contains(You wanna fuck with the rules?)").show();
});

$('#buttonConfirm').on('touchstart click', function () {
    var dataPacket = {
        name: $("#textName").val() || $('#textName').text(),
        facebook_id:facebook_id,
        gameid: $("#textGameID").is(":visible") ? $("#textGameID").val() : "-c",
        rules: current_rules
    }
    socket.emit('join_game', dataPacket);
});

// var fbLogin = setInterval(() => {
//     if(!FB){
//         return;
//     }
//     FB.getLoginStatus(function (response) {
//         if (response.status == "connected") {
//             console.log("http://graph.facebook.com/" + response.authResponse.userID + "/picture?type=normal");
//             clearInterval(fbLogin);
//         } else {
//             FB.login();
//         }
//     });
// }, 1000);

$('#select_rule_value').change(function () {
    var i = 0;
    $('#rule_editor div img').each(function () {
        $(this).attr('src', "/images/cards/card" + HOUSES[i] + $('#select_rule_value').val() + ".png");
        i++;
    });

    var defaultRuleText = default_rules.find(function (x) {
        return x.value == $('#select_rule_value').val();
    }).rule;
    var currentRuleText = current_rules.find(function (x) {
        return x.value == $('#select_rule_value').val();
    }).rule;

    $('#rule_editor p').text(defaultRuleText == current_rules ? defaultRuleText : currentRuleText);
});

$("button:contains(Edit)").on('click touchstart', function () {
    $("#rule_editor p").attr('contenteditable', 'true');
    $('#rule_editor p').css({ 'background': 'white', 'color': 'black' });
    $('#rule_editor p').focus();
});

$("button:contains(Exit)").on('click touchstart', function () {
    var fadeTime = 500;
    $('#rule_editor').fadeToggle(fadeTime / 2, function () {
        $('#game_select').fadeToggle(fadeTime / 2);
    });
});

$("button:contains(You wanna fuck with the rules?)").on('click touchstart', function () {
    var fadeTime = 500;
    $('#game_select').fadeToggle(fadeTime / 2, function () {
        $('#rule_editor').fadeToggle(fadeTime / 2);
    });
});

$('#guest_button').on('click touchstart', (event) => {
    FB.getLoginStatus(function(response){
        if(response.status === "connected"){
            FB.logout();
        }
    })
});

$("#facebook_button").on('click touchstart', (event) => {
    FB.login((response) => {
        if (response.status === "connected") {
            facebook_id = response.authResponse.userID;
            facebookProfilePicture = "https://graph.facebook.com/" + response.authResponse.userID + "/picture?type=normal";
            FB.api('/me', {fields: 'first_name,last_name'}, function(response) {
                facebook_name = response.first_name + " " + response.last_name;
                $('#login_form').hide();
                $('#game_select').show();
                $('<img>', {src:facebookProfilePicture, class:'facebook_image'}).insertBefore($('#textName'));
                $('#textName').replaceWith(() => {
                    return $('<h3/>', {id:'textName',text:facebook_name,name:facebook_name});
                })
            });
        }
    });
});

$('#rule_editor p').on('keypress', function (event) {
    if (event.key == "Enter") {
        $("#rule_editor p").attr('contenteditable', 'false');
        $('#rule_editor p').css({ 'background': 'rgba(100, 100, 100, 0.2)', 'color': 'white' });
        default_rules.find(function (x) {
            return x.value == $('#select_rule_value').val();
        }).rule = $("#rule_editor p").text();
    }
});

$('#rule_editor p').on('focusout', function () {
    $("#rule_editor p").attr('contenteditable', 'false');
    $('#rule_editor p').css({ 'background': 'rgba(100, 100, 100, 0.2)', 'color': 'white' });
    default_rules.find(function (x) {
        return x.value == $('#select_rule_value').val();
    }).rule = $("#rule_editor p").text();
});

$(document).on('swiperight', function () {
    $('#pullmenu').animate({ left: "95%" }, 1000);
});

$(document).on('swipeleft', function () {
    $('#pullmenu').animate({ left: gamescreen.width - $("#pullmenu").width() }, 1000);
});

var hammertime = new Hammer(document);
hammertime.on('swipeleft', function () {
    $('#pullmenu').animate({ left: gamescreen.width - $("#pullmenu").width() }, 1000);
});

hammertime.on('swiperight', function () {
    $('#pullmenu').animate({ left: "95%" }, 1000);
});

setup();

function setup() {

    gamescreen = document.getElementById('gamescreen');

    gamescreen.setAttribute('width', parseInt(window.innerWidth));
    gamescreen.setAttribute('height', parseInt(window.innerHeight));
    stage = new createjs.Stage(gamescreen);
    stage.enableMouseOver(10);
    stage.mouseMoveOutside = true;
    createjs.Touch.enable(stage);

    cardBaseTexture = new createjs.SpriteSheet({
        images: ["/images/cards/playingCards.png"],
        frames: { width: 140, height: 190, count: 60 }
    });
    stage.set({
        regX: 0,
        regY: -gamescreen.height / 2
    });
    cardContainer = new createjs.Container();

    stage.addChild(cardContainer);

    ui.cardCount = new createjs.Text('', "60px 'Unica One'", 'black');
    ui.cardCount.outline = 2.5;
    ui.cardCount.set({
        x: gamescreen.width - ui.cardCount.getMeasuredWidth(),
        y: -gamescreen.height / 2 });

    stage.addChild(ui.cardCount);

    stage.on("stagemousedown", function (event) {
        if (displayCard) return;
        originX = event.stageX;
        originY = event.stageY;
        startRot = cardContainer.rotation;
    });

    stage.on("stagemouseup", function (event) {
        if(startRot != cardContainer.rotation){
             event.preventDefault();
        }
        originX = null;
        originY = null;
    });

    stage.on("stagemousemove", function (event) {
        if (originY) {
            if (Math.abs(event.stageX - originX) > Math.abs(event.stageY - originY)) {
                return;
            }
            cardContainer.set({
                rotation: cardContainer.rotation + (event.stageY - originY) / 5
            });
            if(activeUser == username){
                socket.emit('rotation_update', cardContainer.rotation + (event.stageY - originY) / 4);
            }
            originY = event.stageY;
            originX = event.stageX;
        }
    });

    createjs.Ticker.addEventListener("tick", render);
    createjs.Ticker.setFPS(40);
}

function addPlayer(playername, playerImage) {
    var playerContainer = $('<div/>',{
        class:'playerContainer'
    });
    var playerspan = $("<span>", {
        class: 'player',
        name: playername,
        text: playername
    });
    var player_img = $('<img/>', {
        src:playerImage,
        style:'width:50px;height:50px;padding:4px'
    });
    playerContainer.append(player_img);
    playerContainer.append(playerspan)
    $("#playerlist").append(playerContainer);
}

function removePlayer(playername) {
    ui.userList.text = ui.userList.text.replace("\n" + playername, "");
    ui.userList.set({
        x: gamescreen.width - ui.userList.getMeasuredWidth()
    });
}

function setDeck(deck) {
    var i = 0;
    var centerX = 0;
    var centerY = 0;
    var radius = (gamescreen.width > gamescreen.height ? gamescreen.width : gamescreen.height) * 0.33;
    var desiredRadianAngleOnCircle = Math.PI * 2 / 52;
    deck.forEach(function (card) {
        var character = createCard(card.house, card.value, !card.revealed);
        var x = centerX + radius * Math.cos(desiredRadianAngleOnCircle * i);
        var y = centerY + radius * Math.sin(desiredRadianAngleOnCircle * i);
        character.set({
            x: x,
            y: y,
            rotation: (i + 26) / 52 * 360,
            _cHouse: card.house,
            _cValue: card.value
        });
        character.on('click', function (event) {
            if (displayCard) {
                return;
            }
            socket.emit('card_reveal', { house: card.house, value: card.value });
            // if (character.image.src.indexOf("cardBack_green1") != -1 && !displayCard) {
            //     toggleDisplayCard(character._cHouse, character._cValue);
            //     var im = new Image();
            //     im.src = "/images/cards/card" + character._cHouse + character._cValue + ".png";
            //     character.image = im;
            //     character.alpha = 0.15;
            //     cardContainer.setChildIndex(character, 0);
            // }
        });
        character.on('mouseover', (event) => {
            character.shadow = new createjs.Shadow("red", 0,0,5);
            character.t_rotation = character.rotation;
            character.rotation = 0;
        });
        character.on('mouseout', () => {
            character.shadow = null;
            character.rotation = character.t_rotation;
        });
        cardContainer.addChild(character);
        i++;
    });
}

function render() {
    stage.update();
}

// STRING STRING BOOL
function createCard(house, value, hidden) {
    var character = new createjs.Bitmap(hidden ? "/images/cards/cardBack_green1.png" : "/images/cards/card" + house + value + ".png");
    character.set({
        truevalue: "/images/cards/card" + house + value + ".png",
        regX: 140 / 2,
        regY: 190 / 2,
        scaleX: 0.9,
        scaleY: 0.9
    });
    //character.shadow = new createjs.Shadow('#000000',1, 1, 5);
    return character;
}

var displayCard;
function toggleDisplayCard(house, value) {
    cardContainer.alpha = 0.3;
    stage.setChildIndex(cardContainer, 0);
    displayCard = createCard(house, value, false);
    displayCard.set({
        scaleX: 1,
        scaleY: 1,
        x: gamescreen.width / 2
    });
    stage.addChild(displayCard);
    var rule_text = new createjs.Text(current_rules.find(function (x) {
        return x.value == value;
    }).rule, "18px 'Unica One", 'white');
    if (rule_text.getMeasuredWidth() > gamescreen.width) {}
    rule_text.lineWidth = gamescreen.width * 0.7;
    rule_text.textAlign = 'center';
    rule_text.set({
        x: gamescreen.width / 2,
        y: gamescreen.height / 4
    });
    stage.addChild(rule_text);
    var rule_text_background = new createjs.Shape();
    rule_text_background.set({
        x: rule_text.x - rule_text.getMeasuredWidth() / 2,
        y: rule_text.y
    });
    stage.addChildAt(rule_text_background, 1);
    rule_text_background.graphics.beginFill("black").drawRect(-10, -10, rule_text.getMeasuredWidth() + 20, rule_text.getMeasuredHeight() + 20);
    console.log("Began timer");
    setTimeout(function () {
        stage.removeChild(displayCard);
        stage.removeChild(rule_text);
        stage.removeChild(rule_text_background);
        displayCard = null;
        cardContainer.alpha = 1;
        if (activeUser == username) {
            if(!navigator || !navigator.vibrate)return;
            navigator.vibrate([200,100,200,100,200]);
        }
    }, 5000);
}