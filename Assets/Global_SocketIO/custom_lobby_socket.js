const socket = io();

socket.on('connect', ()=>{
    //for checking user status on lobby
    addUserList(localStorage.getItem('username'));
    notifyAllUsers();

    //join room if there is any
    if(localStorage.getItem('lobby-room')){
        let room = CryptoJS.AES.decrypt(localStorage.getItem('lobby-room'), 'lobby-room').toString(CryptoJS.enc.Utf8);
        
        if(room){
            socket.emit('room-status', room, 'join');
        }
    }
    
    //check for decryption
    try{
        const decrypt_user = CryptoJS.AES.decrypt(localStorage.getItem('username'), 'username').toString(CryptoJS.enc.Utf8);

        if(decrypt_user){
            //true because user is on custom lobby
            imInLobby(true, global_username)
        }
    }
    catch(err){
        console.log(err);
    }
});

//for checking friend player status if they are online or not
socket.on('custom-check-user-active-friend', (player, profile)=>{
    var parent_container = document.getElementById('availableList-custom-container');

    if(parent_container && parent_container.contains(document.getElementById('custom-invite-div' + player)) == false && localStorage.getItem('invited-user-custom') == undefined){
        var container_div = document.createElement('div');
        container_div.setAttribute('class', 'flex flex-row space-x-2 items-center');
        container_div.setAttribute('id', 'custom-invite-div-' + player);
        parent_container.appendChild(container_div);

        var profileImg = document.createElement('img');
        profileImg.setAttribute('class', 'w-[2rem] h-[2rem] rounded-full border-2 border-blue-500');
        profileImg.setAttribute('alt', 'user profile');
        profileImg.setAttribute('src', '/Profile/' + profile);
        container_div.appendChild(profileImg);

        var username = document.createElement('p');
        username.setAttribute('class', 'font-Pixelify text-sm text-black text-center');
        username.appendChild(document.createTextNode(player));
        container_div.appendChild(username);

        var button = document.createElement('button');
        button.setAttribute('class', 'font-Pixelify text-sm text-center text-white bg-blue-500 p-2 rounded-2xl cursor-pointer hover:bg-blue-700');
        button.setAttribute('onclick', 'invitePlayer("' + player + '", "' + profile + '", "' + localStorage.getItem('lobby-room') + '")');
        button.appendChild(document.createTextNode('Invite'));
        container_div.appendChild(button);
    }
});

//removing the custom invite div real time for a user
socket.on('custom-div-status-player-remove', (user)=>{
    var parent_container = document.getElementById('availableList-custom-container');

    if(parent_container && parent_container.contains(document.getElementById('custom-invite-div' + user))){
        document.getElementById('custom-invite-div' + user).remove();
    }
});

//refreshing invites on the player side
socket.on('refresh-custom-div-invite', ()=>{
    inviteFriendChecker();
});

//notify host when invited is declined
socket.on('invite-declined', (player, profile)=>{
    if(document.getElementById('custom-invite-div-' + player)){
        document.getElementById('custom-invite-div-' + player).remove();
    }

    //reappend
    var parent_container = document.getElementById('availableList-custom-container');

    if(parent_container && parent_container.contains(document.getElementById('custom-invite-div' + player)) == false){
        var container_div = document.createElement('div');
        container_div.setAttribute('class', 'flex flex-row space-x-2 items-center');
        container_div.setAttribute('id', 'custom-invite-div-' + player);
        parent_container.appendChild(container_div);

        var profileImg = document.createElement('img');
        profileImg.setAttribute('class', 'w-[2rem] h-[2rem] rounded-full border-2 border-blue-500');
        profileImg.setAttribute('alt', 'user profile');
        profileImg.setAttribute('src', '/Profile/' + profile);
        container_div.appendChild(profileImg);

        var username = document.createElement('p');
        username.setAttribute('class', 'font-Pixelify text-sm text-black text-center');
        username.appendChild(document.createTextNode(player));
        container_div.appendChild(username);

        var button = document.createElement('button');
        button.setAttribute('class', 'font-Pixelify text-sm text-center text-white bg-blue-500 p-2 rounded-2xl cursor-pointer hover:bg-blue-700');
        button.setAttribute('onclick', 'invitePlayer("' + player + '", "' + profile + '")');
        button.appendChild(document.createTextNode('Invite'));
        container_div.appendChild(button);
    }
});

//when user accept invite
socket.on('invite-accepted', (player_name, player_profile, player_trophy)=>{
    //append the container for displaying host
    document.getElementById('inviteContainer').style.display = 'flex';
    var containerParent = document.getElementById('inviteContainer');

    if(containerParent){
        //profile
        var img = document.createElement('img');
        img.setAttribute('alt', 'User Profile');
        img.setAttribute('src', '/Profile/' + player_profile);
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

        //encrypt the user invited
        const encryptUser = ()=>{
            return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(player_name), 'invited-player').toString();
        }
        localStorage.setItem('invited-player', encryptUser());
    }
});

//for notifying user that he/she get kicked out
socket.on('kicked-invited', ()=>{
    //redirect to dashboard
    dashboard();
});

//notify the user when any of them leave custom lobby
socket.on('user-leave-custom-lobby', async (status)=>{
    switch(status){
        case "host":
            //deactivate the start button
            document.getElementById('custom-start-button').style.backgroundColor = '#60a5fa';
            document.getElementById('custom-start-button').style.pointerEvents = 'none';


            //get the localstorage username
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
                imInLobby(true, global_username);
                localStorage.removeItem('host');
                window.location.href = "/customLobby/Host/" + replaceSlash(encryptUser, '_');
            }
            else{
                window.location.href = '/InvalidUser';
            }
        break;

        case "invited":
            document.getElementById('inviteContainer').style.display = 'none';
            var containerParent = document.getElementById('inviteContainer');

            while(containerParent.lastElementChild){
                containerParent.removeChild(containerParent.lastElementChild);
            }
            localStorage.removeItem('invited-player');
        break;
    }
});

//notify user when ready or not
socket.on('custom-player-ready', (player, readyStatus)=>{
    switch(readyStatus){
        case 'Ready':
            document.getElementById('custom-button-ready-' + player).style.backgroundColor = 'green';
            document.getElementById('custom-button-ready-' + player).style.fontWeight = 'bold';

            //activate the start button
            document.getElementById('custom-start-button').style.pointerEvents = 'auto';
            document.getElementById('custom-start-button').style.backgroundColor = '#3b82f6';
            document.getElementById('custom-start-button').style.cursor = 'pointer';
            break;

        case 'Not-ready':
            document.getElementById('custom-button-ready-' + player).style.backgroundColor = '#3b82f6';
            document.getElementById('custom-button-ready-' + player).style.fontWeight = 'normal';

            //deactivate the start button
            document.getElementById('custom-start-button').style.backgroundColor = '#60a5fa';
            document.getElementById('custom-start-button').style.cursor = 'not-allowed';
            document.getElementById('custom-start-button').style.pointerEvents = 'none';
            break;
    }
});

//kicking player self when room is full
socket.on('custom-lobby-room-checker', (room)=>{
    imInLobby(false, global_username);
    socket.emit('room-status', room, 'leave');

    localStorage.removeItem('host');
    localStorage.removeItem('invited-player');
    localStorage.removeItem('lobby-room');

    document.getElementById('loadingSpinner').style.display = 'none';
    window.location.href = "/";
});

//for messaging in custom lobby
let customLobby_messageCount = 0;
socket.on('custom-lobby-room-message', (message, user, userProfile)=>{
    customLobby_messageCount++;

    //display the notif
    if(document.getElementById('notifMsg_custom')){
        document.getElementById('notifMsg_custom').style.display = 'inline';
        document.getElementById('notifMsg_custom').innerText = customLobby_messageCount;
    }

    //main container
    var container = document.getElementById('customMessageParent');

    if(container){
         //holder of the message container
        var messageHolder = document.createElement('div');
        messageHolder.setAttribute('class', "flex justify-end w-full h-auto");
        container.appendChild(messageHolder);

        //holder for the message formatting
        var messageFormatting = document.createElement('div');
        messageFormatting.setAttribute('class', 'flex flex-col space-y-2 w-fit h-fit');
        messageHolder.appendChild(messageFormatting);

        //message holder for profile
        var profileSenderHolder = document.createElement('div');
        profileSenderHolder.setAttribute('class', 'flex flex-row space-x-2 items-center justify-end');
        messageFormatting.appendChild(profileSenderHolder);

        //sender name
        var messageSender = document.createElement('p');
        messageSender.setAttribute('class', "font-Pixelify text-black font-bold text-sm");
        messageSender.appendChild(document.createTextNode(user));
        profileSenderHolder.appendChild(messageSender);

        //profile display
        var profile = document.createElement('img');
        profile.setAttribute('alt', 'user profile');
        profile.setAttribute('class', 'w-[2rem] h-[2rem] border-2 border-blue-500 rounded-full');
        profile.setAttribute('src', '/Profile/' + userProfile);
        profileSenderHolder.appendChild(profile);

        //message container
        var messageContainer = document.createElement('div');
        messageContainer.setAttribute('class', "w-[10rem] h-auto text-left bg-blue-700 rounded-2xl p-2 md:w-[15rem]");
        messageFormatting.appendChild(messageContainer);

        //message content
        var messageContent = document.createElement('p');
        messageContent.setAttribute('class', "font-Pixelify text-white text-sm");
        messageContent.appendChild(document.createTextNode(message));
        messageContainer.appendChild(messageContent);

        container.scrollTo(0, container.scrollHeight);
    }
});

//for saving the room data
socket.on('custom-lobby-room', (room)=>{
    socket.emit('room-status', room, 'join');
    const encryptUser = ()=>{
        return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(room), 'lobby-room').toString();
    }
    localStorage.setItem('lobby-room', encryptUser());
});

//notify player when the custom lobby game start
socket.on('game-custom-start', async ()=>{
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
        window.location.replace("/Checker/Custom-mode/" + replaceSlash(encryptUser, '_'));
    }
    else{
        window.location.href = '/InvalidUser';
    }
});