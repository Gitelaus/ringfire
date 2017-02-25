// Buttons(
$('#facebook_button').on('click touchstart', (event)=>{
    login((success) => {
        if(success){
            $('#facebook_login').animate({'opacity':'0'}, 1000);
            $('.social_navigation').animate({'opacity':'1'}, 1000);
            $('.facebook_image').attr('src', 'http://graph.facebook.com/'  + success + '/picture?height=128');
        }
    })
});


// Pull in TODO: Generalise

var hammertime = new Hammer(document.getElementById('overlay'));
hammertime.on('swipeleft', function () {
    $('.social_navigation').animate({'right':-$(".social_navigation").width() - 2}, 400);
    $('.pull_menu').animate({'right':'0px'}, 400);
});

hammertime.on('swiperight', function () {
    $('.pull_menu').animate({'right':-$('.pull_menu').width()}, 400);
    $('.social_navigation').animate({'right':'15px'}, 400);
});