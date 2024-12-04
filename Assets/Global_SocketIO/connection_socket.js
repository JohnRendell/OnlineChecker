const socket = io();

socket.on('connect', async ()=>{
    //play the loading spinner
    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('validateText').innerText = 'Fetching cookies, please wait for a moment...';

    try{
        //get the cookie
        const getCookie = await fetch('/cookie/getCookie');
        const getCookieData = await getCookie.json();

        if(getCookieData){
            //encrypt the value
            const encryptUser = ()=>{
                return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(getCookieData.cookieValue), 'username').toString();
            }
            isLoggedIn = true;
            localStorage.setItem('username', encryptUser());

            addUserList(localStorage.getItem('username'));
            socket.emit('connected-users', localStorage.getItem('username'));
            
            checkFriend();
            imInLobby(false, getCookieData.cookieValue);

            //clear the lobby
            let username = CryptoJS.AES.decrypt(localStorage.getItem('username'), 'username').toString(CryptoJS.enc.Utf8);

            if(username){
                socket.emit('clear_lobby', username);
            }

            //delete the lobby once back in the dashboard
            const deleteLobby = async (username) =>{
                try{
                    const removeLobby = await fetch('/lobby/deleteLobby', {
                        method: "POST",
                        headers: {
                            "Content-Type": "Application/json",
                            "Accept": "Application/json"
                        },
                        body: JSON.stringify({ username: username })
                    });

                    const removeLobby_data = await removeLobby.json();

                    if(removeLobby_data.message !== 'success'){
                        alert('failed to clear lobbies');
                    }
                } catch(err){
                    console.log(err);
                }
            }
            deleteLobby(username);
        }
    }
    catch(err){
        console.log(err);
    }
});

//add user to the connected
socket.on('connected-users', async (user)=>{
    const local_username = CryptoJS.AES.decrypt(user, 'username').toString(CryptoJS.enc.Utf8);

    if(local_username){
        //disable the spinner
        document.getElementById('loadingSpinner').style.display = 'none';

        //main container
        var container = document.getElementById('parentContainerGlobal');

       if(container){
            //status container
            var statusContainer = document.createElement('div');
            statusContainer.setAttribute('class', "flex justify-center items-center w-full h-auto");
            container.appendChild(statusContainer);

            //status message
            var statusMessage = document.createElement('p');
            statusMessage.setAttribute('class', "font-Pixelify text-black text-center text-sm");
            statusMessage.appendChild(document.createTextNode(local_username + ' connected'));
            statusContainer.appendChild(statusMessage);

            container.scrollTo(0, container.scrollHeight);
       }
    }
    else{
        window.location.href = '/Invalid';
    }
});

//remove user to the connected
socket.on('logged-out-users', async (user)=>{
    //main container
    var container = document.getElementById('parentContainerGlobal');

    //status container
    var statusContainer = document.createElement('div');
    statusContainer.setAttribute('class', "flex justify-center items-center w-full h-auto");
    container.appendChild(statusContainer);

    //status message
    var statusMessage = document.createElement('p');
    statusMessage.setAttribute('class', "font-Pixelify text-black text-center text-sm");
    statusMessage.appendChild(document.createTextNode(user + ' left'));
    statusContainer.appendChild(statusMessage);

    container.scrollTo(0, container.scrollHeight);
});

//for counting users that is connected
socket.on('countUser', (count)=>{
    if(document.getElementById('playerConnected')){
        document.getElementById('playerConnected').innerText = 'Connected Players: ' + count;
    }
});

//for pop up the invite panel for the other end, this is in custom mode
socket.on('invite-custom', (player, player_profile, room)=>{
    //set attribute onclick on the button both accept and decline
    document.getElementById('customButtonDecline').setAttribute('onclick', 'declineCustomInvite("' + player + '"); modalStatus("inviteCustomDiv", "inviteCustomContainer", "none", null);');

    document.getElementById('customButtonAccept').setAttribute('onclick', 'acceptCustomInvite("' + player + '", "' + room + '"); modalStatus("inviteCustomDiv", "inviteCustomContainer", "none", null);');

    modalStatus('inviteCustomDiv', 'inviteCustomContainer', 'flex', 'modal_animation');
    
    //set the name of the host for rendering message
    document.getElementById('customHostName').innerText = player + ' inviting you in custom lobby';

    //set the profile of the host for rendering display
    document.getElementById('hostProfile').src = '/Profile/' + player_profile;

    //for loading div
    var loadingDiv = document.getElementById('customLoadingBar');

    if(loadingDiv){
        loadingDiv.style.animation = 'loadingProgress 5s linear forwards';

        loadingDiv.addEventListener('animationend', ()=>{
            declineCustomInvite(player);
            modalStatus('inviteCustomDiv', 'inviteCustomContainer', 'none', null);
        });
    }
});

//for saving room on player vs player
socket.on('findMatch_player', (room)=>{
    socket.emit('room-status', room, 'join');
    const encryptUser = ()=>{
        return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(room), 'lobby-room').toString();
    }
    localStorage.setItem('lobby-room', encryptUser());
});

//for starting match
socket.on('match_start_host', (host, invited)=>{
    socket.emit('match_start_invited', host, invited);
    
    const encryptHost = ()=>{
        return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(host), 'host').toString();
    }
    localStorage.setItem('host', encryptHost());
    
    //redirect to the custom lobby
    let encryptUser = localStorage.getItem('username');

    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('validateText').innerText = 'Starting game, please wait...';

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
        document.getElementById('loadingSpinner').style.display = 'none';
        window.location.href = '/Checker/Match-mode/' + replaceSlash(encryptUser, '_');
    }
    else{
        window.location.href = '/InvalidUser';
    }
});

socket.on('match_start_invited', (invited)=>{
    //encrypt the user invited
    const encryptInvited = ()=>{
        return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(invited), 'invited-player').toString();
    }
    localStorage.setItem('invited-player', encryptInvited());

    //redirect to the custom lobby
    let encryptUser = localStorage.getItem('username');

    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('validateText').innerText = 'Starting game, please wait...';

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
        document.getElementById('loadingSpinner').style.display = 'none';
        window.location.href = '/Checker/Match-mode/' + replaceSlash(encryptUser, '_');
    }
    else{
        window.location.href = '/InvalidUser';
    }
})

//for guest mode
socket.on('match_start_host_guest', (host, invited)=>{
    socket.emit('match_start_invited_guest', host, invited);
    
    const encryptHost = ()=>{
        return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(host), 'host').toString();
    }
    localStorage.setItem('host', encryptHost());
    
    //redirect to the custom lobby
    let encryptUser = localStorage.getItem('username');

    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('validateText').innerText = 'Starting game, please wait...';

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
        document.getElementById('loadingSpinner').style.display = 'none';
        window.location.href = '/Checker/Match-mode-guest/' + replaceSlash(encryptUser, '_');
    }
    else{
        window.location.href = '/InvalidUser';
    }
});

socket.on('match_start_invited_guest', (invited)=>{
    //encrypt the user invited
    const encryptInvited = ()=>{
        return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(invited), 'invited-player').toString();
    }
    localStorage.setItem('invited-player', encryptInvited());

    //redirect to the custom lobby
    let encryptUser = localStorage.getItem('username');

    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('validateText').innerText = 'Starting game, please wait...';

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
        document.getElementById('loadingSpinner').style.display = 'none';
        window.location.href = '/Checker/Match-mode-guest/' + replaceSlash(encryptUser, '_');
    }
    else{
        window.location.href = '/InvalidUser';
    }
});