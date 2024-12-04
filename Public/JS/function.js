//for showing password
let showPass = true;
function showInputPass(inputID, inputBtn){
    if(showPass){
        document.getElementById(inputBtn).src = './Images/Password eye close.png';
        document.getElementById(inputID).type = 'text';
        showPass = false;
    }
    else{
        document.getElementById(inputBtn).src = './Images/Password eye.png';
        document.getElementById(inputID).type = 'password';
        showPass = true;
    }
}

//for typing in input
function typeInput(inputID, inputTextCountID){
    var inputText = document.getElementById(inputTextCountID);
    var inputBar = document.getElementById(inputID);

    inputText.innerText = inputBar.value.length + '/10';
}

//going back to index page
function backToIndex(){
    document.getElementById('loadingSpinner').style.display = 'flex';

    setTimeout(() => {
        location.href = '/';
    }, 100);
}

//going to dashboard
async function navigateDashBoard(encryptUser){
    //send the id as parameter for the dashboard route
    function replaceSlash(inputString, replacementChar) {
        return inputString.replace(/\//g, replacementChar);
    }

    // Verify the token with the secret key, and check if the username cookies is existed
    function revertSlash(replacedString, originalChar) {
        return replacedString.replace(new RegExp(originalChar, 'g'), '/');
    }

    //check for decryption
    const decrypt_user = CryptoJS.AES.decrypt(revertSlash(encryptUser, '_'), 'username').toString(CryptoJS.enc.Utf8);

    if(decrypt_user){
        //validate the dashboard if the user is legit logged in
        const cookieRoute = await fetch('/cookie/setCookie', {
            method: "POST",
            headers: {
                "Accept": "Application/json",
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({ username: decrypt_user })
        });

        const cookieRouteData = await cookieRoute.json();

        if(cookieRouteData.message === 'success'){
            addUserList(decrypt_user);
            window.location.href = "/dashboard/" + replaceSlash(encryptUser, '_');
        }
    }
}