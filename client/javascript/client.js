/**
 * Written by Nathan Dawson.
 * but i'm not proud of it, it's shit
 */

/**
 * We need to talk, we need to talk to the _SERVER_
 */

var socket = io();
var form = $("form");

var username;

form.submit(() => {
    socket.emit('message', $('#messaging').val());
});

socket.on('message', (data) => {
    $('#messages').append($('<li>').text(data));
});

socket.on('join_game', (data) => {
    //console.log($("#overlay form"));
    if(!username && data.token && data.deck && data.users){
        username = data.name;
        setDeck(data.deck);
        data.users.forEach((u) => {
            addPlayer(u);
        });
        $('#gameid').parent().attr('href', '?game=' + data.token)
        $('#gameid').text('GameID: ' + data.token);
    }
    $("#game_select").hide();
    addPlayer(data.name);
});

socket.on('buzz', () => {
    navigator.vibrate([100, 100, 100, 100, 100, 100, 100, 100]);
});

socket.on('rotation_update', (data) => {
    cardContainer.set({
        rotation:data
    });
});

socket.on('card_reveal', (data) => {
    if(data.active){
        navigator.vibrate([100, 100, 100, 100, 100, 100, 100, 100]);
    }
    cardContainer.children.forEach((child) => {
        if(child._cHouse == data.house && child._cValue == data.value){
            var im = new Image();
            im.src = "/images/cards/card" + child._cHouse + child._cValue + ".png";
            child.image = im;
            child.alpha = 0.5;
            cardContainer.setChildIndex(child, 0);
        }
    });
});

window.addEventListener('deviceproximity', (event) => {
    socket.emit('info', event.value);
});
console.log(chrome);

// THE USER NEEDS TO _SEE_ SHIT

var stage, renderer, cardContainer

var HOUSES = ["Spades", "Hearts", "Diamonds", "Clubs"];
var VALUES = ["Q", "K", "J", "A", "10", "9", "8", "7", "6", "5","4", "3", "2"];
var cardBaseTexture;
var gamescreen;

var originX, originY;
var ui = {};

navigator.vibrate([100, 100, 100, 100, 100, 100, 100, 100]);

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

$('#buttonJoin').on('click', (e) => {
    $('#subformTitle').text('Join Game');
    $('#buttonJoin').css({'background':'green'});
    $('#buttonCreate').css({'background':'white'});
    $('#textName').show();
    $('#textGameID').show();
});

$('#buttonCreate').on('click', (e) => {
    $('#subformTitle').text('Create Game');
    $('#buttonJoin').css({'background':'white'});
    $('#buttonCreate').css({'background':'green'});
    $('#textName').show();
    $('#textGameID').hide();
});

$('#buttonConfirm').on('click', () => {
    socket.emit('join_game', {
        name:$("#textName").val(),
        gameid:$("#textGameID").is(":visible") ? $("#textGameID").val() : "-c"
    });
});

$(document).on('swiperight', () => {
    $('#pullmenu').animate({left:"95%"}, 1000);
});

$(document).on('swipeleft', () => {
    $('#pullmenu').animate({left:"50%"}, 1000);
});

var hammertime = new Hammer(document);
hammertime.on('swipeleft', () => {
  $('#pullmenu').animate({left:"50%"}, 1000);
});

hammertime.on('swiperight', ()=>{
  $('#pullmenu').animate({left:"95%"}, 1000);
})

setup();


function setup(){

    gamescreen = document.getElementById('gamescreen');

    gamescreen.setAttribute('width', parseInt(window.innerWidth));
    gamescreen.setAttribute('height', parseInt(window.innerHeight));
    stage = new createjs.Stage(gamescreen);
    stage.enableMouseOver(10);
    stage.mouseMoveOutside = true;
    createjs.Touch.enable(stage);

    cardBaseTexture = new createjs.SpriteSheet({
        images:["/images/cards/playingCards.png"],
        frames:{width:140, height:190, count:60}
    });
    stage.set({
        regX: 0,
        regY: -gamescreen.height / 2
    })
    cardContainer = new createjs.Container();

    stage.addChild(cardContainer);

    ui.cardCount = new createjs.Text('', "60px 'Unica One'", 'black');
    ui.cardCount.outline = 2.5;
    ui.cardCount.set({
        x:gamescreen.width - (ui.cardCount.getMeasuredWidth()),
        y:-gamescreen.height / 2});

    stage.addChild(ui.cardCount);

    stage.on("stagemousedown", (event) => {
        if(displayCard)return;
        originX = event.stageX;
        originY = event.stageY;
    });

    stage.on("stagemouseup", (event) => {
        originX = null;
        originY = null;
    });

    stage.on("stagemousemove", (event) => {

      if(originY){
          if(Math.abs(event.stageX - originX) > Math.abs(event.stageY - originY)){
            return;
          }
          cardContainer.set({
                  rotation:cardContainer.rotation + (event.stageY - originY) / 5
          });
          socket.emit('rotation_update', cardContainer.rotation + (event.stageY - originY) / 4);
          originY = event.stageY;
          originX = event.stageX;
      }
    });

    createjs.Ticker.addEventListener("tick", render);
    createjs.Ticker.setFPS(40);
} 

function addPlayer(playername){
    var playerspan = $("<span>", {
        class:'player',
        name:playername,
        text:playername
    });
    $("#playerlist").append(playerspan);
}

function removePlayer(playername){
    ui.userList.text = ui.userList.text.replace("\n" + playername, "");
    ui.userList.set({
        x:gamescreen.width - ui.userList.getMeasuredWidth()
    });
}

function setDeck(deck){
    var i = 0;
    var centerX = 0;
    var centerY = 0;
    var radius = ((gamescreen.width > gamescreen.height ? gamescreen.width : gamescreen.height) * 0.33);
    var desiredRadianAngleOnCircle = (Math.PI*2)/52;
    deck.forEach((card) => {
        var character = createCard(card.house, card.value, !card.revealed);
        var x=centerX+radius*Math.cos(desiredRadianAngleOnCircle * (i));
        var y=centerY+radius*Math.sin(desiredRadianAngleOnCircle * (i));
        character.set({
            x:x,
            y:y,
            rotation:(((i + 26) / 52) * 360),
            _cHouse:card.house,
            _cValue:card.value
        });
        character.on('click', (event) => {
            var xO = originX ? (originX - event.stageX) : 0;
            var yO = originY ? (originY - event.stageY) : 0;
            console.log(Math.sqrt(xO*xO + yO*yO));
            socket.emit('card_reveal', {house:card.house,value:card.value})
            // if (character.image.src.indexOf("cardBack_green1") != -1 && !displayCard) {
            //     toggleDisplayCard(character._cHouse, character._cValue);
            //     var im = new Image();
            //     im.src = "/images/cards/card" + character._cHouse + character._cValue + ".png";
            //     character.image = im;
            //     character.alpha = 0.15;
            //     cardContainer.setChildIndex(character, 0);
            // }
        });
        cardContainer.addChild(character);
        i++;
    });
}

function render(){
    stage.update();
}

// STRING STRING BOOL
function createCard(house, value, hidden){
    var character = new createjs.Bitmap(hidden ? "/images/cards/cardBack_green1.png" : "/images/cards/card" + house + value + ".png");
    character.set({
        truevalue:"/images/cards/card" + house + value + ".png",
        regX:140 / 2,
        regY:190 / 2,
        scaleX:0.9,
        scaleY:0.9
    });
    //character.shadow = new createjs.Shadow('#000000',1, 1, 5);
    return character;
}


var displayCard;
function toggleDisplayCard(house, value){
    cardContainer.alpha = 0.1;
    displayCard = createCard(house, value, false);
    displayCard.set({
        scaleX:1,
        scaleY:1,
        x:gamescreen.width / 2
    });
    stage.addChild(displayCard);
    console.log("Began timer");
    setTimeout(() => {
      stage.removeChild(displayCard);
      displayCard = null;
      cardContainer.alpha = 1;
    }, 1000);
}