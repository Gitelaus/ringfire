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
    ad.volume = 0.1;
    ad.play();
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
        toggleMenu('facebook_login')
        $('.social_navigation').animate({'opacity':'0'}, 1000);
        $('.facebook_image').attr('src', null);
        $('.facebook_name').text('');
    })
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

// Pull in TODO: Generalise

var hammertime = new Hammer(document.getElementById('overlay'));
var blocked = 2;
hammertime.on('swipeleft', function () {
    if(blocked < 2)return;
    blocked = 0;
    $('.social_navigation').animate({'right':-$(".social_navigation").width() - 2}, 400, ()=>{blocked++;});
    $('.pull_menu').animate({'right':'0px'}, 400, ()=>{blocked++});
});

hammertime.on('swiperight', function () {
    if(blocked < 2)return;
    blocked = 0;
    $('.pull_menu').animate({'right':-$('.pull_menu').width()}, 400, ()=>{blocked++});
    $('.social_navigation').animate({'right':'15px'}, 400, ()=>{blocked++});
});