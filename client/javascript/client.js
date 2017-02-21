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
        current_rules = data.rules;
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
    toggleDisplayCard(data.house, data.value);
});

var default_rules;
var current_rules;

socket.on('rule_update', (data) => {
    default_rules = data;
    current_rules = default_rules;
    $('#select_rule_value').val("K").change();
});

window.addEventListener('deviceproximity', (event) => {
    socket.emit('info', event.value);
});
console.log(chrome);

// THE USER NEEDS TO _SEE_ SHIT

var stage, renderer, cardContainer

var HOUSES = ["Spades", "Hearts", "Diamonds", "Clubs"];
var VALUES = ["K", "Q", "J", "A", "10", "9", "8", "7", "6", "5","4", "3", "2"];
VALUES.forEach((value) => {
    var option = $("<option/>", {
        text:value
    });
    $("#select_rule_value").append(option);
});
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
    $("button:contains(You wanna fuck with the rules?)").hide();
});

$('#buttonCreate').on('click', (e) => {
    $('#subformTitle').text('Create Game');
    $('#buttonJoin').css({'background':'white'});
    $('#buttonCreate').css({'background':'green'});
    $('#textName').show();
    $('#textGameID').hide();
    $("button:contains(You wanna fuck with the rules?)").show();
});

$('#buttonConfirm').on('click', () => {
    socket.emit('join_game', {
        name:$("#textName").val(),
        gameid:$("#textGameID").is(":visible") ? $("#textGameID").val() : "-c",
        rules:current_rules
    });
});

$('#select_rule_value').change(() => {
    var i = 0;
    $('#rule_editor div img').each(function(){
        $(this).attr('src', "/images/cards/card" + HOUSES[i] + $('#select_rule_value').val() + ".png");
        i++;
    });

    var defaultRuleText = default_rules.find(x => x.value == $('#select_rule_value').val()).rule
    var currentRuleText = current_rules.find(x => x.value == $('#select_rule_value').val()).rule

    $('#rule_editor p').text(defaultRuleText == current_rules ? defaultRuleText : currentRuleText);
});


$("button:contains(Edit)").on('click', () => {
    $("#rule_editor p").attr('contenteditable', 'true');
    $('#rule_editor p').css({'background':'white', 'color':'black'});
    $('#rule_editor p').focus();
});

$("button:contains(Exit)").on('click', () => {
    $('#rule_editor').hide();
    $('#game_select').show();
});

$("button:contains(You wanna fuck with the rules?)").on('click', () => {
    $('#rule_editor').show();
    $('#game_select').hide();
});

$('#rule_editor p').on('keypress', (event)=>{
    if(event.key == "Enter"){
        $("#rule_editor p").attr('contenteditable', 'false');
        $('#rule_editor p').css({'background':'rgba(100, 100, 100, 0.2)', 'color':'white'});
        default_rules.find(x => x.value == $('#select_rule_value').val()).rule = $("#rule_editor p").text();
    }
});

$('#rule_editor p').on('focusout', ()=>{
    $("#rule_editor p").attr('contenteditable', 'false');
    $('#rule_editor p').css({'background':'rgba(100, 100, 100, 0.2)', 'color':'white'});
    default_rules.find(x => x.value == $('#select_rule_value').val()).rule = $("#rule_editor p").text();
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
            if(displayCard){
                return;
            }
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
    var rule_text = new createjs.Text(current_rules.find(x => x.value == value).rule, "18px 'Unica One", 'white');
    if(rule_text.getMeasuredWidth() > gamescreen.width){
        
    }
    
    rule_text.lineWidth = gamescreen.width * 0.7;
    rule_text.textAlign = 'center';
    rule_text.set({
        x:gamescreen.width / 2,
        y:gamescreen.height / 4
    })
    stage.addChild(rule_text);
    var rule_text_background = new createjs.Shape();
    rule_text_background.set({
        x:rule_text.x - rule_text.getMeasuredWidth() / 2,
        y:rule_text.y,
    })
    stage.addChildAt(rule_text_background, 0);
    rule_text_background.graphics.beginFill("black").drawRect(-10, -10, rule_text.getMeasuredWidth() + 20, rule_text.getMeasuredHeight() + 20);
    console.log("Began timer");
    setTimeout(() => {
      stage.removeChild(displayCard);
      stage.removeChild(rule_text);
      stage.removeChild(rule_text_background);
      displayCard = null;
      cardContainer.alpha = 1;
    }, 5000);
}