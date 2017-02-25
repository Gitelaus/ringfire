// Facebook
function login(callback){
    FB.login((response) => {
        if(response.status === "connected"){
            callback(response.authResponse.userID);
        }
    });
    return callback(null);
}

function logout(){

}