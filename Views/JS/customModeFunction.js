//global values
var global_username = null;
var global_profile = null;
var global_trophy = null;

//for filling information
async function fillInfo(){
    try{
        const fillUser = await fetch('/fillInfo', {
            method: "POST",
            headers: {
                "Content-Type": "Application/json",
                "Accept": "Application/json"
            },
            body: JSON.stringify({ guaranteedAccess: true })
        });
        const fillUser_data = await fillUser.json();

        if(fillUser_data.message === 'success'){
            global_username = fillUser_data.username;
            global_profile = fillUser_data.profile;
            global_trophy = fillUser_data.trophy;
        }
        onGuestMode();
    }
    catch(err){
        console.log(err);
    }
}

//for checking if the page is not altered
function pageAltered(){
    const queryString = window.location.href;
    const splitQuery = queryString.split('/');
    const status = splitQuery[splitQuery.length - 1];

    // Verify the token with the secret key, and check if the username cookies is existed
    function revertSlash(replacedString, originalChar) {
        return replacedString.replace(new RegExp(originalChar, 'g'), '/');
    }

    //check for decryption
    const decrypt_user = CryptoJS.AES.decrypt(revertSlash(status, '_'), 'username').toString(CryptoJS.enc.Utf8);

    if(!decrypt_user){
        window.location.href = '/InvalidUser/';
    }
}
pageAltered();

//for typing in input
function typeInput(inputID, inputTextCountID, maxCount){
    var inputText = document.getElementById(inputTextCountID);
    var inputBar = document.getElementById(inputID);

    inputText.innerText = inputBar.value.length + '/' + maxCount;
}

//get param for player invited, this is to check if that player is a host or not
async function getParamInvitedPlayer(){
    const queryString = window.location.href;
    const splitQuery = queryString.split('/');
    const status = splitQuery[splitQuery.length - 2];

    const checkLobbyInvited = async (player)=>{
        try{
            const getInfo = await fetch('/customLobby/status', {
                method: "POST",
                headers: {
                    "Accept": "Application/json",
                    "Content-Type": "Application/json"
                },
                body: JSON.stringify({ username: player , status: status })
            });

            const getInfo_Data = await getInfo.json();

            if(getInfo_Data){
                if(getInfo_Data.status === 'Invited'){                    
                   //get the host information
                    const host = getInfo_Data.name;
                    const hostProfile = getInfo_Data.profile;
                    const hostTrophy = getInfo_Data.trophy;

                    //set the interface for the custom lobby on player side
                    document.getElementById('hostTitle').style.display = 'none';
                    document.getElementById('customButtonHost').style.display = 'none';
                    document.getElementById('inviteContainer').style.display = 'flex';

                    //append the container for displaying host
                    var containerParent = document.getElementById('inviteContainer');

                    if(containerParent){
                        //activate button
                        document.getElementById('custom-ready-button').style.display = 'flex';

                        //title of the panel of the host
                        var titleStatus = document.createElement('h1');
                        titleStatus.setAttribute('class', 'font-Pixelify text-lg text-center text-black');
                        titleStatus.appendChild(document.createTextNode('Host'));
                        containerParent.appendChild(titleStatus);

                        //host profile
                        var img = document.createElement('img');
                        img.setAttribute('alt', 'User Profile');
                        img.setAttribute('src', hostProfile);
                        img.setAttribute('class', 'w-[8rem] h-[8rem] border-2 rounded-full border-blue-500 xsm:w-[5rem] xsm:h-[5rem]');
                        containerParent.appendChild(img);

                        //host name
                        var usernameP = document.createElement('p');
                        usernameP.setAttribute('class', 'font-Pixelify text-center text-blue-700 text-sm');
                        usernameP.appendChild(document.createTextNode(host));
                        containerParent.appendChild(usernameP);
                        
                        //host trophy
                        var trophyP = document.createElement('p');
                        trophyP.setAttribute('class', 'font-Pixelify text-center text-blue-700 text-sm');
                        trophyP.appendChild(document.createTextNode('Trophies: ' + hostTrophy));
                        containerParent.appendChild(trophyP);
                    }
                }
                if(getInfo_Data.status === 'Host'){
                    //get the player information
                    const player_name = getInfo_Data.name;
                    const player_profile = getInfo_Data.profile;
                    const player_trophy = getInfo_Data.trophy;

                    //set the interface for the custom lobby on host side
                    document.getElementById('hostTitle').style.display = 'flex';
                    document.getElementById('customButtonHost').style.display = 'flex';
                    document.getElementById('inviteContainer').style.display = 'flex';

                    var containerParent = document.getElementById('inviteContainer');

                    if(containerParent){
                        //profile
                        var img = document.createElement('img');
                        img.setAttribute('alt', 'User Profile');
                        img.setAttribute('src', player_profile);
                        img.setAttribute('class', 'w-[8rem] h-[8rem] border-2 rounded-full border-blue-500 xsm:w-[5rem] xsm:h-[5rem]');
                        containerParent.appendChild(img);

                        //name
                        var usernameP = document.createElement('p');
                        usernameP.setAttribute('class', 'font-Pixelify text-center text-blue-700 text-sm');
                        usernameP.appendChild(document.createTextNode(player_name));
                        containerParent.appendChild(usernameP);
                        
                        //trophy
                        var trophyP = document.createElement('p');
                        trophyP.setAttribute('class', 'font-Pixelify text-center text-blue-700 text-sm');
                        trophyP.appendChild(document.createTextNode('Trophies: ' + player_trophy));
                        containerParent.appendChild(trophyP);
                                        
                        //wrapper for ready display and kick button
                        var wrapper = document.createElement('div');
                        wrapper.setAttribute('class', 'flex flex-row space-x-2');
                        containerParent.appendChild(wrapper);

                        //display for ready
                        var readyDisplay = document.createElement('div');
                        readyDisplay.setAttribute('class', 'font-Pixelify text-sm text-center text-white bg-blue-500 p-2 rounded-2xl');
                        readyDisplay.setAttribute('id', 'custom-button-ready-' + player_name);
                        readyDisplay.appendChild(document.createTextNode('Ready'));
                        wrapper.appendChild(readyDisplay);

                        //button for kicking player
                        var kickPlayer = document.createElement('button');
                        kickPlayer.setAttribute('class', 'font-Pixelify text-sm text-center text-white bg-red-500 p-2 rounded-2xl hover:bg-red-700');
                        kickPlayer.setAttribute('onclick', 'kickPlayer("' + player_name + '")');
                        kickPlayer.appendChild(document.createTextNode('Kick'));
                        wrapper.appendChild(kickPlayer);
                    }
                }
            }
        }
        catch(err){
            console.log(err);
        }
    }

    //if there is a host, when a player reload a page but there is already a host there
    if(localStorage.getItem('host')){
        socket.emit('custom-lobby-room-join', localStorage.getItem('host'), localStorage.getItem('username'), status);
        let username = CryptoJS.AES.decrypt(localStorage.getItem('host'), 'host').toString(CryptoJS.enc.Utf8);

        if(username){
            checkLobbyInvited(username);
        }
    }

    //if there is already player, when a user reload the page and already invited a player on a lobby
    if(localStorage.getItem('invited-player')){
        let username = CryptoJS.AES.decrypt(localStorage.getItem('invited-player'), 'invited-player').toString(CryptoJS.enc.Utf8);

        if(username){
            checkLobbyInvited(username);
        }
    }

    //if there is none, this only applies when a player click the custom room button
    if(!localStorage.getItem('invited-player') && !localStorage.getItem('host')){
        socket.emit('custom-lobby-room-join', localStorage.getItem('username'), null, 'Host');
    }

    //check if all rooms are occupied, this lobby is max of two. When a host attempt to invite two players, who ever accept the invite first will put at invited slot while the second one is automatically kicked out.
    if(localStorage.getItem('lobby-room')){
        let room =  CryptoJS.AES.decrypt(localStorage.getItem('lobby-room'), 'lobby-room').toString(CryptoJS.enc.Utf8);

        let username = CryptoJS.AES.decrypt(localStorage.getItem('username'), 'username').toString(CryptoJS.enc.Utf8);


        if(room && username){
            socket.emit('custom-lobby-room-checker', room, username);
        }
    }
}
getParamInvitedPlayer();

//for checking if the user is on guest mode
function onGuestMode(){
    let username = CryptoJS.AES.decrypt(localStorage.getItem('username'), 'username').toString(CryptoJS.enc.Utf8);

    //for checking if the user is on guest mode
    if(username){
        if(username.startsWith('guest')){
            document.getElementById('loginCustom').style.display = 'none';
            document.getElementById('guestCustom').style.display = 'flex';
        }
        else{
            document.getElementById('loginCustom').style.display = 'flex';
            document.getElementById('guestCustom').style.display = 'none';

            //add data for the host
            document.getElementById('hostCustomName').innerText = global_username;
            document.getElementById('hostCustomProfile').src = global_profile;
            document.getElementById('hostCustomTrophy').innerText = 'Trophies: ' + global_trophy;
        }
    }
}
fillInfo();

//go back to dashboard
async function dashboard() {
    //send the id as parameter for the dashboard route
    function replaceSlash(inputString, replacementChar) {
        return inputString.replace(/\//g, replacementChar);
    }

    // Verify the token with the secret key, and check if the username cookies is existed
    function revertSlash(replacedString, originalChar) {
        return replacedString.replace(new RegExp(originalChar, 'g'), '/');
    }

    //check for decryption
    const decrypt_user = CryptoJS.AES.decrypt(revertSlash(localStorage.getItem('username'), '_'), 'username').toString(CryptoJS.enc.Utf8);

    const decrypt_room = CryptoJS.AES.decrypt(localStorage.getItem('lobby-room'), 'lobby-room').toString(CryptoJS.enc.Utf8);

    if(decrypt_user && decrypt_room){
        //check if there is any save invite to notify
        if(localStorage.getItem('invited-player')){
            socket.emit('user-leave-custom-lobby', 'host', decrypt_room);
        }

        if(localStorage.getItem('host')){
           socket.emit('user-leave-custom-lobby', 'invited', decrypt_room);
        }

        imInLobby(false, global_username);
        socket.emit('room-status', decrypt_room, 'leave');

        localStorage.removeItem('host');
        localStorage.removeItem('invited-player');
        localStorage.removeItem('lobby-room');
        document.getElementById('loadingSpinner').style.display = 'none';
        window.location.href = "/dashboard/" + replaceSlash(localStorage.getItem('username'), '_');
    }
    else{
        window.location.href = '/InvalidURL';
    }   
}

//for inviting player, check if user has friends and active friends
async function inviteFriendChecker() {
    //clear the child
    const parent_container = document.getElementById('availableList-custom-container');
    
    while(parent_container.firstElementChild){
        parent_container.removeChild(parent_container.firstElementChild);
    }

    if(parent_container.childElementCount == 0){
        try{
            const friendListAvailable = await fetch('/friendList/availableInvite', {
                method: "POST",
                headers: {
                    "Accept": "Application/json",
                    "Content-Type": "Application/json"
                },
                body: JSON.stringify({ username: global_username })
            });

            const friendListAvailable_data = await friendListAvailable.json();

            if(friendListAvailable_data.message === 'success'){
                const friendList = friendListAvailable_data.list;

                //check if any of them are active
                friendList.forEach(player => {
                    socket.emit('custom-check-user-active-friend', player.username, player.profile);
                });

                //show the container for invite
                parent_container.style.display = 'flex';

                //hide the not available panel
                document.getElementById('no-available-invite-customLobby').style.display = 'none';
            }
            else{
                //hide the container for invite
                parent_container.style.display = 'none';

                //render the not available panel
                document.getElementById('no-available-invite-customLobby').style.display = 'flex';
                document.getElementById('custom-data-text').innerText = friendListAvailable_data.message;
            }
        }
        catch(err){
            console.log(err);
        }
    }
}

//invite player to custom
function invitePlayer(player, profile, room){
    if(document.getElementById('custom-invite-div-' + player)){
        document.getElementById('custom-invite-div-' + player).remove();
    }

    //reappend with loading display
    var parent_container = document.getElementById('availableList-custom-container');

    if(parent_container && parent_container.contains(document.getElementById('custom-invite-div' + player)) == false){
        var container_div = document.createElement('div');
        container_div.setAttribute('class', 'flex flex-row space-x-2 items-center');
        container_div.setAttribute('id', 'custom-invite-div-' + player);
        parent_container.appendChild(container_div);

        var profileImg = document.createElement('img');
        profileImg.setAttribute('class', 'w-[2rem] h-[2rem] rounded-full border-2 border-blue-500');
        profileImg.setAttribute('alt', 'user profile');
        profileImg.setAttribute('src', profile);
        container_div.appendChild(profileImg);

        var username = document.createElement('p');
        username.setAttribute('class', 'font-Pixelify text-sm text-black text-center');
        username.appendChild(document.createTextNode(player));
        container_div.appendChild(username);

        var loadingDiv = document.createElement('div');
        loadingDiv.setAttribute('class', 'loader');
        container_div.appendChild(loadingDiv);
    }

    //send the socket to the other end
    let decrypt_room = CryptoJS.AES.decrypt(room, 'lobby-room').toString(CryptoJS.enc.Utf8);
    if(decrypt_room){
        socket.emit('invite-custom', player, global_username, global_profile, decrypt_room);
    }
}

//for removing player, kick player on custom
function kickPlayer(invited){
    document.getElementById('inviteContainer').style.display = 'none';
    var containerParent = document.getElementById('inviteContainer');

    while(containerParent.lastElementChild){
        containerParent.removeChild(containerParent.lastElementChild);
    }

    //notify other player
    socket.emit('kicked-invited', invited);
    localStorage.removeItem('invited-player');

    //deactivate the start button
    document.getElementById('custom-start-button').style.backgroundColor = '#60a5fa';
    document.getElementById('custom-start-button').style.cursor = 'not-allowed';
    document.getElementById('custom-start-button').style.pointerEvents = 'none';
}

//notify user when one of them is ready
function readyButton(){
    var readyBtn = document.getElementById('custom-ready-button');
    let status = null;

    if(readyBtn.innerText === 'Ready'){
        readyBtn.innerText = 'Cancel';
        status = "Ready";
    }
    else{
        readyBtn.innerText = 'Ready';
        status = "Not-ready";
    }

    //notify user when ready
    if(localStorage.getItem('host')){
        const host = CryptoJS.AES.decrypt(localStorage.getItem('host'), 'host').toString(CryptoJS.enc.Utf8);

        if(host){
            socket.emit('custom-player-ready', host, status, global_username);
        }
    }
}

//for sending message on custom lobby
function sendMessageCustom(){
    let message = document.getElementById('messageInputCustom');

    if(message.value){
        //main container
        var container = document.getElementById('customMessageParent');

        //holder of the message container
        var messageHolder = document.createElement('div');
        messageHolder.setAttribute('class', "flex justify-start w-full h-auto");
        container.appendChild(messageHolder);

        //holder for the message formatting
        var messageFormatting = document.createElement('div');
        messageFormatting.setAttribute('class', 'flex flex-col space-y-2 w-fit h-fit');
        messageHolder.appendChild(messageFormatting);

        //message holder for profile
        var profileSenderHolder = document.createElement('div');
        profileSenderHolder.setAttribute('class', 'flex flex-row space-x-2 items-center justify-start');
        messageFormatting.appendChild(profileSenderHolder);

        //profile display
        var profile = document.createElement('img');
        profile.setAttribute('alt', 'user profile');
        profile.setAttribute('class', 'w-[2rem] h-[2rem] text-sm border-2 border-blue-500 rounded-full');
        profile.setAttribute('src', global_profile);
        profileSenderHolder.appendChild(profile);

        //sender name
        var messageSender = document.createElement('p');
        messageSender.setAttribute('class', "font-Pixelify text-black font-bold text-sm");
        messageSender.appendChild(document.createTextNode(global_username));
        profileSenderHolder.appendChild(messageSender);

        //message container
        var messageContainer = document.createElement('div');
        messageContainer.setAttribute('class', "w-[10rem] h-auto text-left bg-blue-500 rounded-2xl p-2 md:w-[15rem]");
        messageFormatting.appendChild(messageContainer);

        //message content
        var messageContent = document.createElement('p');
        messageContent.setAttribute('class', "font-Pixelify text-white text-sm");
        messageContent.appendChild(document.createTextNode(message.value));
        messageContainer.appendChild(messageContent);

        //send message to the socket
        if(localStorage.getItem('invited-player')){
            const receiver = CryptoJS.AES.decrypt(localStorage.getItem('invited-player'), 'invited-player').toString(CryptoJS.enc.Utf8);
        
            let room = CryptoJS.AES.decrypt(localStorage.getItem('lobby-room'), 'lobby-room').toString(CryptoJS.enc.Utf8);

            if(receiver && room){
                socket.emit('custom-lobby-room-message', message.value, global_username, global_profile, receiver, room);
            }
        }
        if(localStorage.getItem('host')){
            const receiver = CryptoJS.AES.decrypt(localStorage.getItem('host'), 'host').toString(CryptoJS.enc.Utf8);

            let room = CryptoJS.AES.decrypt(localStorage.getItem('lobby-room'), 'lobby-room').toString(CryptoJS.enc.Utf8);
        
            if(receiver && room){
                socket.emit('custom-lobby-room-message', message.value, global_username, global_profile, receiver, room);
            }
        }

        //reset the input and counter
        document.getElementById('messageInputCustom').value = '';
        document.getElementById('messageInputCustomCount').innerText = '0/80';

        container.scrollTo(0, container.scrollHeight);
    }
}

function resetCustomNotifCount(){
    customLobby_messageCount = 0;
    document.getElementById('notifMsg_custom').style.display = 'none';
}

//for starting the game
function gameStart(){
    if(localStorage.getItem('invited-player')){
        let player = CryptoJS.AES.decrypt(localStorage.getItem('invited-player'), 'invited-player').toString(CryptoJS.enc.Utf8);

        if(player){
            socket.emit('game-custom-start', player);
        }

        //redirect to the custom lobby
        let encryptUser = localStorage.getItem('username');

        document.getElementById('loadingSpinner').style.display = 'flex';
        document.getElementById('validateText').innerText = 'Navigating, please wait...';

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
            window.location.replace("/Checker/Custom-mode/" + replaceSlash(encryptUser, '_'));
        }
        else{
            window.location.href = '/InvalidUser';
        }
    }
}