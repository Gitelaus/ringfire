
// Audio

var ad = new Audio("resources/if_playing_the_piano_makes_me_a_pianist_does_playing_an_electric_one_make_me_a_vibrator.mp3");
ad.loop = true;

function toggleMenu(id) {
    var menuCount = $('.menu:not(#' + id + ')').length;
    $('.menu:not(#' + id + ')').animate({ 'opacity': '0' }, 1000, function () {
        $(this).hide();
        $('#' + id).show().animate({ 'opacity': '1' }, 1000);
    });
}

// Buttons(
$('#facebook_button').on('click', function (event) {
    // ad.volume = 0.1;
    // ad.play();
    login(function (facebook_info) {
        if (facebook_info) {
            toggleMenu('join_game');
            $('.social_navigation').animate({ 'opacity': '1' }, 1000);
            $('.facebook_image').attr('src', 'http://graph.facebook.com/' + facebook_info.id + '/picture?height=64&width=64');
            $('.facebook_name').text(facebook_info.name);
            refreshGamesList();
        }
    });
});

$('#facebook_logout').on('click', function (event) {
    logout(function (success) {
        toggleMenu('facebook_login');
        $('.social_navigation').animate({ 'opacity': '0' }, 1000);
        $('.facebook_image').attr('src', null);
        $('.facebook_name').text('');
    });
});


$('#guest_button').on('click', function(){
        var name = $('#guest_name').val();
        if(name === ""){
            return;
        }
        client_info.name = name;
        $('#refresh_game_button').hide();
        toggleMenu('join_game');
        $('.social_navigation').animate({ 'opacity': '1' }, 1000);
        $('.facebook_image').attr('src', 'http://localhost:3000/avatar/?name=' + name + '&gender=male');
        $('.facebook_name').text(name);
})

$('#guest_name').on('input', function(){
    typewatch(function(){
        var name = $('#guest_name').val();
        $('#guest_button').text('Login as "' + name + '" [Guest]');
        $('#guest_image').attr('src', 'http://localhost:3000/avatar/?name=' + name + '&gender=male');
    }, 200);
});

$('#game_id_search').on('input', function(){
    typewatch(function(){
        socket.emit('game_id_search', $('#game_id_search').val());
    }, 200);
})


var typewatch = function(){
    var timer = 0;
    return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
    }  
}();    


$(window).on('resize', function () {
    $('#overlay').css({ width: window.width, height: window.height });
});

$('#create_game_button').on('click', function (event) {
    createGame();
});

$('#join_game_button').on('click', function () {});

$('#refresh_game_button').on('click', function () {
    $('#game_list').html('');
    refreshGamesList();
});


function addGameListing(game) {
    if (game == null) {
        var game_listing = $('<a/>', {
            class: 'game_listing',
            text: 'No games found!',
            style: 'height:100%'
        });
        $('#game_list').append(game_listing);
        return;
    }
    var game_listing = $('<a/>', {
        class: 'game_listing',
        href: '#',
        hostID: game.users[0].id
    });
    game_listing.on('click', function () {
        joinGame(game.users[0].id);
    });
    game.users.forEach(function (user) {
         var f_img = !user.id.startsWith("G-") ? 
            'http://graph.facebook.com/' + user.id + '/picture?height=64&width=64' : 'http://localhost:3000/avatar/?name=' + user.name + '&gender=male';
        game_listing.append($("<img>", {
            src: f_img
        }));
    });
    $('#game_list').append(game_listing);
}

function addPlayer(f_user) {
    var f_img = !f_user.id.startsWith("G-") ? 
        'http://graph.facebook.com/' + f_user.id + '/picture?height=64&width=64' : 'http://localhost:3000/avatar/?name=' + f_user.name + '&gender=male';
    var t_container = $("<div/>", {
        class: 'player_container'
    });
    var t_img = $('<img/>', {
        class: 'facebook_image',
        src: f_img
    });
    var t_span = $("<span/>", {
        text: f_user.name
    });

    t_container.append(t_img).append(t_span);
    $('.pull_menu').append(t_container);
    if (f_user.id === facebook_info.id || f_user.name === client_info.name) return;
    $('#social_round_bar').append($('<img/>', {
        src: f_img
    }));
}

function removePlayer(f_user) {
    $('span:contains(' + f_user.name + ')').parent().remove();
    $('img[src*=' + f_user.id + ']').remove();
}

function setActivePlayer(f_user) {
    $('span:not(:contains(' + f_user.name + '))').parent().css('background', 'rgba(0,0,0,0.5)');
    $('span:contains(' + f_user.name + ')').parent().css('background', 'rgba(0,200,0,0.5)');
    if (f_user.id == facebook_info.id) {
        $('.social_navigation').css('border', '2px solid green');
        $('.social_navigation').addClass("img_pulse");
        $('.social_navigation').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function (e) {
            $('.social_navigation').removeClass('img_pulse');
        });
        if (navigator && navigator.vibrate) {
            navigator.vibrate([100, 100, 100, 100, 100, 100]);
        }
        return;
    } else {
        $('.social_navigation').css('border', '2px solid black');
    }
    $('#social_round_bar>img').css('border', '2px solid black');
    var t_img = $('#social_round_bar>img[src*=' + f_user.id + ']');
    t_img.css('border', '2px solid green');
    t_img.addClass("img_pulse");
    t_img.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function (e) {
        t_img.removeClass('img_pulse');
    });
}

function showMessageAnnoucement(picture, message, finishedCallback) {
    $('#announcement').css('pointer-events', 'all');
    $('#announcement>span').text(message);
    $('#announcement>img').attr('src', picture);
    $('#announcement').fadeTo(250, 1, function () {
        setTimeout(function () {
            $('#announcement').fadeTo(1250, 0, function () {
                $('#announcement').css('pointer-events', 'none');
                if (finishedCallback) finishedCallback();
            });
        }, 3000);
    });
}

$(document).on('dragstart', 'img', function (event) {
    event.preventDefault();
});

// Pull in TODO: Generalise

$('.social_navigation').on('click', function() {
    $('.social_navigation').animate({ 'right': -$(".social_navigation").width() - 4 }, 400);
    $('.pull_menu').animate({ 'right': '0px' }, 400);
    $('#social_round_bar').animate({ 'right': -$('#social_round_bar').width() });
});

var hammertime = new Hammer(document.getElementById('overlay'));
hammertime.on('swipeleft', function () {
    $('.social_navigation').animate({ 'right': -$(".social_navigation").width() - 4 }, 400);
    $('.pull_menu').animate({ 'right': '0px' }, 400);
    $('#social_round_bar').animate({ 'right': -$('#social_round_bar').width() });
});

hammertime.on('swiperight', function () {
    $('.pull_menu').animate({ 'right': -$('.pull_menu').width() }, 400);
    $('.social_navigation').animate({ 'right': '0px' }, 400);
    $('#social_round_bar').animate({ 'right': '0px' });
});