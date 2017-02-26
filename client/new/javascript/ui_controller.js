// Audio

var ad = new Audio("resources/if_playing_the_piano_makes_me_a_pianist_does_playing_an_electric_one_make_me_a_vibrator.mp3");

document.getElementById('facebook_button').addEventListener('click', ()=>{
    ad.play();
});

// Buttons(
$('#facebook_button').on('click touchstart', (event)=>{
    login((success) => {
        if(success){
            $('#facebook_login').animate({'opacity':'0'}, 1000, () => {$("#facebook_login").hide(); $("#game_select").show();});
            $('.social_navigation').animate({'opacity':'1'}, 1000);
            $('.facebook_image').attr('src', 'http://graph.facebook.com/'  + success + '/picture?height=128');
            FB.api('/me', (response) => {
                $('.facebook_name').text(response.name);
            });
        }
    })
});

$('#facebook_logout').on('click touchstart', (event)=>{
    logout((success) => {
        $('#facebook_login').show().animate({'opacity':'1'}, 1000);
        $('.social_navigation').animate({'opacity':'0'}, 1000);
        $('.facebook_image').attr('src', null);
        FB.api('/me', (response) => {
            $('.facebook_name').text('');
        });
    })
});


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