// Audio

var ad = new Audio("resources/if_playing_the_piano_makes_me_a_pianist_does_playing_an_electric_one_make_me_a_vibrator.mp3");
ad.loop = true;


function toggleMenu(id){
    var menuCount = $('.menu:not(#' + id + ')').length;
    $('.menu:not(#' + id + ')').animate({'opacity':'0'}, 1000, function(){
        $(this).hide();
        $('#' + id).show().animate({'opacity':'1'}, 1000);
    });
}

// Buttons(
$('#facebook_button').on('click', (event)=>{
    // ad.volume = 0.1;
    // ad.play();
    login((facebook_info) => {
        if(facebook_info){
            toggleMenu('join_game');
            $('.social_navigation').animate({'opacity':'1'}, 1000);
            $('.facebook_image').attr('src', 'http://graph.facebook.com/'  + facebook_info.id + '/picture?height=128&width=128');
            $('.facebook_name').text(facebook_info.name);
        }
    })
});

$('#facebook_logout').on('click', (event)=>{
    logout((success) => {
        toggleMenu('facebook_login');
        $('.social_navigation').animate({'opacity':'0'}, 1000);
        $('.facebook_image').attr('src', null);
        $('.facebook_name').text('');
    })
});

$(window).on('resize', () =>{
    $('#overlay').css({width:window.width,height:window.height});
});

$('#create_game_button').on('click', (event)=>{
    createGame();
});

$('#join_game_button').on('click', () => {
});

$('#refresh_game_button').on('click', () => {
    $('#game_list').html('');
    refreshGamesList();
});

function addGameListing(game){
    var game_listing = $('<a/>', {
        class:'game_listing',
        href:'#',
        hostID:game.users[0].id
    });
    game_listing.on('click', ()=>{
        joinGame(game.users[0].id); 
    });
    game.users.forEach((user) => {
        game_listing.append($("<img>", {
            src:'http://graph.facebook.com/'  + user.id + '/picture?height=128&width=128'
        }));        
    });
    $('#game_list').append(game_listing);
}

function addPlayer(f_user){
    var t_container = $("<div/>", {
        class:'player_container'
    });
    var t_img = $('<img/>', {
        class:'facebook_image',
        src:'http://graph.facebook.com/'  + f_user.id + '/picture?height=128&width=128'
    });
    var t_span = $("<span/>", {
        text:f_user.name
    });

    t_container.append(t_img).append(t_span);
    $('.pull_menu').append(t_container);
}

function showMessageAnnoucement(picture, message, finishedCallback){
    $('#announcement').css('pointer-events','all');
    $('#announcement>span').text(message);
    $('#announcement>img').attr('src',picture);
    $('#announcement').fadeTo(250, 1, () => {
        setTimeout(() => {
            $('#announcement').fadeTo(1250, 0, () => {
                $('#announcement').css('pointer-events','none');
                if(finishedCallback)finishedCallback();
            });
        }, 3000);
    });
}

$(document).on('dragstart','img', function(event) { event.preventDefault(); });

// Pull in TODO: Generalise

var hammertime = new Hammer(document.getElementById('overlay'));
hammertime.on('swipeleft', function () {
    $('.social_navigation').animate({'right':-$(".social_navigation").width() - 2}, 400);
    $('.pull_menu').animate({'right':'0px'}, 400);
    $('#social_round_bar').animate({'right':-$('#social_round_bar').width()});
});

hammertime.on('swiperight', function () {
    $('.pull_menu').animate({'right':-$('.pull_menu').width()}, 400);
    $('.social_navigation').animate({'right':'0px'}, 400);
    $('#social_round_bar').animate({'right':'0px'});
});