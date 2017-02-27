var gamescreen;

var stage, cardContainer;

var mouseX, mouseY;

function setupCanvas(){
    gamescreen = document.getElementById('gamescreen');
    gamescreen.setAttribute('width', parseInt(window.innerWidth));
    gamescreen.setAttribute('height', parseInt(window.innerHeight));

    stage = new createjs.Stage(gamescreen);
    stage.enableMouseOver(10);
    stage.mouseMoveOutside = true;
    createjs.Touch.enable(stage);

    stage.on('stagemousedown',  (e) => {
        mouseX = e.stageX;
        mouseY = e.stageY;
    });     

    stage.on('stagemouseup',    (e) => {
        mouseX = 0;
        mouseY = 0;
    });

    stage.on('stagemousemove',  (e) => {
        if(mouseX && mouseY){
            cardContainer.set({
                rotation: cardContainer.rotation + (e.stageY - mouseY) / 5
            });
            mouseY = e.stageY;
            mouseX = e.stageX;
        }
        return false;
    })

    cardContainer = new createjs.Container();
    cardContainer.set({
        y:gamescreen.height / 2
    })
    stage.addChild(cardContainer);



    createjs.Ticker.addEventListener("tick", update);
    createjs.Ticker.setFPS(40);

    $(window).on('resize',()=>{
        gamescreen.setAttribute('width', parseInt(window.innerWidth));
        gamescreen.setAttribute('height', parseInt(window.innerHeight));
        cardContainer.set({
            y:gamescreen.height / 2
        });
        var i = 0;
        var centerX = 0;
        var centerY = 0;
        var radius = (gamescreen.width > gamescreen.height ? gamescreen.width : gamescreen.height * 1.25) * 0.3;
        var scale = Math.min(((gamescreen.width > gamescreen.height ? gamescreen.width : gamescreen.height * 1.5) * 0.001), 0.9);
        var desiredRadianAngleOnCircle = Math.PI * 2 / 52;
        cardContainer.children.forEach((child) => {
            var x = centerX + radius * Math.cos(desiredRadianAngleOnCircle * i);
            var y = centerY + radius * Math.sin(desiredRadianAngleOnCircle * i);
            child.set({
                x: x,
                y: y,
                rotation: (i + 26) / 52 * 360,
                scaleX:scale,
                scaleY:scale
            });
            i++;
        });
    })
}



function update(){
    stage.update();
}

function createCard(house, value, revealed){
    var t_bitmap = new createjs.Bitmap(!revealed ? "/images/cards/cardBack_green1.png" : "/images/cards/card" + house + value + ".png");
    var scale = Math.min(((gamescreen.width > gamescreen.height ? gamescreen.width : gamescreen.height * 1.5) * 0.001), 0.9);
    t_bitmap.set({
        hidden_value: "images/cards/card" + house + value + ".png",
        regX: 140 / 2,
        regY: 190 / 2,
        scaleX:scale,
        scaleY:scale
    });
    return t_bitmap;
}

function createDeck(deck){
    var i = 0;
    var centerX = 0;
    var centerY = 0;
    var radius = (gamescreen.width > gamescreen.height ? gamescreen.width : gamescreen.height * 1.25) * 0.3;
    var desiredRadianAngleOnCircle = Math.PI * 2 / 52;
    deck.forEach((i_card) => {
        var card = createCard(i_card.house, i_card.value, i_card.revealed);
        var x = centerX + radius * Math.cos(desiredRadianAngleOnCircle * i);
        var y = centerY + radius * Math.sin(desiredRadianAngleOnCircle * i);
        card.set({
            x: x,
            y: y,
            rotation: (i + 26) / 52 * 360,
            c_house: i_card.house,
            c_value: i_card.value,
        });

        card.on('click', (event) => {
            sendPacket('card_reveal', {house:i_card.house, value:i_card.value});
        });

        cardContainer.addChild(card);
        i++;
    });
}

function revealCard(house, value){
    cardContainer.children.forEach((card) => {
        if(card.c_house == house && card.c_value == value){
            var im = new Image();
            im.src = card.hidden_value;
            card.image = im;
            cardContainer.setChildIndex(card, 0);
        }
    });
}