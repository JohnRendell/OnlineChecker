//global values
var global_username = null;
var global_profile = null;
var global_trophy = null;
var global_requestCount = null;

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

            global_requestCount = fillUser_data.requestCount;

            //add the friend request if there is any
            if(global_requestCount > 0){
                //desktop on the friend list tab
                if(document.getElementById('notifMsg_friendRequest')){
                    document.getElementById('notifMsg_friendRequest').style.display = 'inline';
                    document.getElementById('notifMsg_friendRequest').innerText = global_requestCount;
                }

                //mobile/tablet on the friend list tab
                if(document.getElementById('m_notifMsg_friendRequest')){
                    document.getElementById('m_notifMsg_friendRequest').style.display = 'inline';
                    document.getElementById('m_notifMsg_friendRequest').innerText = global_requestCount;
                }
            }
        }
        else{
            global_username = fillUser_data.username;
            global_profile = fillUser_data.profile;
        }
    }
    catch(err){
        console.log(err);
    }
}
fillInfo();

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

//for navigation ajax
async function navigatePage(pageName) {
    //for buttons
    const panelButton = (mainBtn, id1, id2, id3, id4, id5, id6, id7)=>{
        try{
             //for highlighting button
            document.getElementById(mainBtn).style.backgroundColor = '#1d4ed8';

            //this is to bring back to normal
            document.getElementById(id1).style.backgroundColor = '#3b82f6';
            document.getElementById(id2).style.backgroundColor = '#3b82f6';
            document.getElementById(id3).style.backgroundColor = '#3b82f6';
            document.getElementById(id4).style.backgroundColor = '#3b82f6';
            document.getElementById(id5).style.backgroundColor = '#3b82f6';
            document.getElementById(id6).style.backgroundColor = '#3b82f6';
            document.getElementById(id7).style.backgroundColor = '#3b82f6';
        }
        catch(err){
            console.log('Site viewport is mobile/tablet')
        }
    }

    //ajax request
    var newHttp = new XMLHttpRequest();
    let url = pageName; //for url

    newHttp.onreadystatechange = ()=>{
        if(newHttp.status === 200 && newHttp.readyState === 4){
            if(document.getElementById('contentDiv')){
                document.getElementById('contentDiv').innerHTML = newHttp.responseText;
            }

            const username = global_username;
            
            switch (pageName) {
                case '/profile.html':
                    panelButton('profileBtn', 'homeBtn', 'settingBtn', 'findFriendBtn', 'friendListBtn', 'historyBtn', 'leaderboardBtn', 'watchLiveBtn');

                    if(username.startsWith('guest')){
                        document.getElementById('guestProfile').style.display = 'flex';
                        document.getElementById('loginProfile').style.display = 'none';
                    }
                    else{
                        setTimeout(() => {
                            checkProfile_allowChange();
                            document.getElementById('userProfileName').innerText = global_username;
                            document.getElementById('userProfile').src = global_profile;
                            document.getElementById('userTrophy').innerText = 'Trophies: ' + global_trophy;
                        }, 10);
                    }
                    break;

                case '/findFriend.html':
                    if(username.startsWith('guest')){
                        document.getElementById('guestFriend').style.display = 'flex';
                        document.getElementById('loginFriend').style.display = 'none';
                    }
                    panelButton('findFriendBtn', 'settingBtn', 'homeBtn', 'profileBtn', 'friendListBtn', 'historyBtn', 'leaderboardBtn', 'watchLiveBtn');
                    break;

                case '/setting.html':
                    if(username.startsWith('guest')){
                        document.getElementById('guestSetting').style.display = 'flex';
                        document.getElementById('loginSetting').style.display = 'none';
                    }
                    panelButton('settingBtn', 'homeBtn', 'profileBtn', 'findFriendBtn', 'friendListBtn', 'historyBtn', 'leaderboardBtn', 'watchLiveBtn');
                    break;

                case '/friendList.html':
                    if(username.startsWith('guest')){
                        document.getElementById('guestFriendlist').style.display = 'flex';
                        document.getElementById('loginFriendlist').style.display = 'none';
                    }
                    panelButton('friendListBtn', 'settingBtn', 'homeBtn', 'profileBtn', 'findFriendBtn', 'historyBtn', 'leaderboardBtn', 'watchLiveBtn');
                    break;

                case '/history.html':
                    if(username.startsWith('guest')){
                        document.getElementById('guestHistory').style.display = 'flex';
                        document.getElementById('loginHistory').style.display = 'none';
                    }
                    else{
                        setTimeout(() => {
                            checkHistory();
                        }, 10);
                    }
                    panelButton('historyBtn', 'friendListBtn', 'settingBtn', 'homeBtn', 'profileBtn', 'findFriendBtn', 'leaderboardBtn', 'watchLiveBtn');
                    break;

                case '/leaderboard.html':
                    setTimeout(() => {
                        displayPlayers_trophies();
                    }, 10);
                    panelButton('leaderboardBtn', 'historyBtn', 'friendListBtn', 'settingBtn', 'homeBtn', 'profileBtn', 'findFriendBtn', 'watchLiveBtn');
                    break;

                case '/watchLive.html':
                    setTimeout(() => {
                        displayLobby();
                    }, 10);
                    panelButton('watchLiveBtn', 'leaderboardBtn', 'historyBtn', 'friendListBtn', 'settingBtn', 'homeBtn', 'profileBtn', 'findFriendBtn');
                    break;

                default:
                    localStorage.removeItem('invited-player');
                    localStorage.removeItem('host');
                    localStorage.removeItem('receiver_private');
                    localStorage.removeItem('lobby-room');

                    //for removing checker component
                    localStorage.removeItem('turnIndicator');
                    localStorage.removeItem('destinationTileID');
                    localStorage.removeItem('originTileID');
                    localStorage.removeItem('pieceID');
                    localStorage.removeItem('minute');
                    localStorage.removeItem('sec');
                    localStorage.removeItem('win-status');
                    localStorage.removeItem('lobbyType');
                    localStorage.removeItem('gameSurrender');
                    localStorage.removeItem('spectator');
                    localStorage.removeItem('player_host');
                    localStorage.removeItem('player_invited');
                    
                    for(let i = 0; i < 13; i++){
                        localStorage.removeItem('piece' + i);
                        localStorage.removeItem('piece' + i + '_pos');
                        localStorage.removeItem('eaten_piece' + i);
                        localStorage.removeItem('pieceInput' + i);

                        localStorage.removeItem('opponent_piece' + i);
                        localStorage.removeItem('opponent_piece' + i + '_pos');
                        localStorage.removeItem('eaten_opponent_piece' + i);
                        localStorage.removeItem('opponent_pieceInput' + i);
                    }
                    panelButton('homeBtn', 'profileBtn', 'settingBtn', 'findFriendBtn', 'friendListBtn', 'historyBtn', 'leaderboardBtn', 'watchLiveBtn');
                break;
            }
        }
    }
    newHttp.open('GET', url, true);
    newHttp.send();
}
navigatePage('/home.html');

//for logging out
async function logout(){
    //activate the spinner
    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('validateText').innerText = 'Validating...';

    const user = CryptoJS.AES.decrypt(localStorage.getItem('username'), 'username').toString(CryptoJS.enc.Utf8);

    //remove user
    if(user){
        removeUserList(user);
    }
    else{
        window.location.href = '/invalidUser';
    }
}

//for typing in input
function typeInput(inputID, inputTextCountID, maxCount){
    var inputText = document.getElementById(inputTextCountID);
    var inputBar = document.getElementById(inputID);

    inputText.innerText = inputBar.value.length + '/' + maxCount;
}

//for showing password
let showPass = true;
function showInputPass(inputID, inputBtn){
    if(showPass){
        document.getElementById(inputBtn).src = '/Images/Password eye close.png';
        document.getElementById(inputID).type = 'text';
        showPass = false;
    }
    else{
        document.getElementById(inputBtn).src = '/Images/Password eye.png';
        document.getElementById(inputID).type = 'password';
        showPass = true;
    }
}

//for changing account
async function proceed(){
    let password = document.getElementById('settingInputPass');
    let newPassword = document.getElementById('settingInputRePass');

    try{
        const changeAcc = await fetch('/changeAcc', {
            method: "POST",
            headers: {
                "Accept": "Application/json",
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({ username: global_username, password: password.value, newPassword: newPassword.value })
        });

        const changeAccData = await changeAcc.json();

        if(changeAccData.message === 'Change Account Successfully'){
            document.getElementById('settingInputPass').value = '';
            document.getElementById('settingInputRePass').value = '';
        }
        document.getElementById('error-text-p').innerText = changeAccData.message;
        document.getElementById('error-text-p').style.color = changeAccData.textColor;
    }
    catch(err){
        console.log(err)
    }
}

//for changing profile
function uploadProfile(){
    var targetImage = document.getElementById('changeProfile');

    targetImage.addEventListener('change', async (event)=>{
        const file = event.target.files[0];
        const fileExtension = file.name.split('.').pop();

        //check if the file extension is valid
        if(fileExtension !== 'webp' && fileExtension !== 'gif'){
            
            //pass the files to form data
            const formData = new FormData;
            formData.append('imageFile', file);
            formData.append('username', global_username);

            // Check if a file was selected
            if (file) {
                document.getElementById('loadingSpinner').style.display = 'flex';
                document.getElementById('validateText').innerText = 'Validating Profile, please wait...';

                //if does, then upload it to the server
                try{
                    const uploadImage = await fetch('/uploadImage', {
                        method: "POST",
                        body: formData
                    });

                    const uploadImage_Data = await uploadImage.json();

                    if(uploadImage_Data.message === 'success'){
                        document.getElementById('loadingSpinner').style.display = 'none';

                        global_profile = uploadImage_Data.profile;
                        document.getElementById('userProfile').src = uploadImage_Data.profile;

                        document.getElementById('profile_allowChangeBtn').style.backgroundColor = 'red';
                        document.getElementById('profile_allowChangeBtn').style.pointerEvents = 'none';
                        document.getElementById('profile_allowChangeBtn').innerText = 'Wait until ' + uploadImage_Data.date;
                    }
                }
                catch(err){
                    console.log(err);
                }
            }
        }
        else{
            modalStatus('modalProfileWarningPanel', 'modalProfileWarningContainer', 'flex', 'modal_animation')
        }
    });
}

//for checking if it is allowed to change profile
async function checkProfile_allowChange() {
    try{
        const checkProfile = await fetch('/uploadImage/checkProfile', {
            method: "POST",
            headers: {
                "Accept": "Application/json",
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({ username: global_username })
        });
        const checkProfile_data = await checkProfile.json();

        if(checkProfile_data.message === 'allowed'){
            document.getElementById('profile_allowChangeBtn').style.backgroundColor = '#3b82f6';
            document.getElementById('profile_allowChangeBtn').style.pointerEvents = 'allowed';
            document.getElementById('profile_allowChangeBtn').innerText = 'Change Profile';
        }
        else{
            document.getElementById('profile_allowChangeBtn').style.backgroundColor = 'red';
            document.getElementById('profile_allowChangeBtn').style.pointerEvents = 'none';
            document.getElementById('profile_allowChangeBtn').innerText = 'Wait until ' + checkProfile_data.date;
        }
    }
    catch(err){
        console.log(err);
    }
}

//for restarting notif status on the global message and private message
function restartStatus(){
    global_messageCount = 0;
    document.getElementById('notifMsg_global').style.display = 'none';
}

//for closing the notification on the tab
function closeRequestNotif(){
    //desktop on the friend list tab
    const notif_f_r = document.getElementById('notifMsg_friendRequest');

    //mobile/tablet on the friend list tab
    const m_notif_f_r = document.getElementById('m_notifMsg_friendRequest');

    if(notif_f_r && m_notif_f_r){
        document.getElementById('notifMsg_friendRequest').style.display = 'none';
        document.getElementById('m_notifMsg_friendRequest').style.display = 'none';
    }
}

//for going to custom lobby
async function goToCustomLobbyHost(){
    //get the localstorage username
    let encryptUser = localStorage.getItem('username');

    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('validateText').innerText = 'Navigating, please wait...';

    if(encryptUser){
        document.getElementById('loadingSpinner').style.display = 'none';

        //send the id as parameter for the dashboard route
        function replaceSlash(inputString, replacementChar) {
            return inputString.replace(/\//g, replacementChar);
        }

        imInLobby(true, global_username);
        window.location.href = "/customLobby/Host/" + replaceSlash(encryptUser, '_');
    }
}

async function goToCustomLobbyInvited(){
    //get the localstorage username
    let encryptUser = localStorage.getItem('username');

    if(encryptUser){
        document.getElementById('loadingSpinner').style.display = 'none';

        //send the id as parameter for the dashboard route
        function replaceSlash(inputString, replacementChar) {
            return inputString.replace(/\//g, replacementChar);
        }

        imInLobby(true, global_username);
        window.location.href = "/customLobby/Invited/" + replaceSlash(encryptUser, '_');
    }
}

//accept the custom invite
function acceptCustomInvite(host, room){
    socket.emit('room-status', room, 'join');
    localStorage.setItem('lobby-room', CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(room), 'lobby-room').toString());

    const encryptUser = ()=>{
        return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(host), 'host').toString();
    }
    localStorage.setItem('host', encryptUser());
    socket.emit('invite-accepted', global_username, global_profile, global_trophy, host);
    goToCustomLobbyInvited();
}

//decline invite in custom
function declineCustomInvite(host){
    socket.emit('invite-declined', global_username, global_profile, host);
}

//for checking lobby in the custom or match
function checkLobby(){
    const username = CryptoJS.AES.decrypt(localStorage.getItem('username'), 'username').toString(CryptoJS.enc.Utf8);

    if(localStorage.getItem('gameSurrender')){
        const gameSurrender = CryptoJS.AES.decrypt(localStorage.getItem('gameSurrender'), 'gameSurrender').toString(CryptoJS.enc.Utf8);

        if(localStorage.getItem('lobby-room') && gameSurrender && username){
            if(gameSurrender === 'manual'){
                socket.emit('player_surrender', localStorage.getItem('lobby-room'), username);
                localStorage.removeItem('gameSurrender');
            }
        }
    }
}
checkLobby();

//for looking for player match
function findPlayerMatch(){
    imInLobby(true, global_username);
    socket.emit('findMatch_player', global_username);
}

//for cancelling player match
function cancel_findPlayerMatch(){
    imInLobby(false, global_username);
    socket.emit('cancel_findMatch_player', global_username);

    if(localStorage.getItem('lobby-room')){
        let room =  CryptoJS.AES.decrypt(localStorage.getItem('lobby-room'), 'lobby-room').toString(CryptoJS.enc.Utf8);
        
        if(room){
            socket.on('room-status', room, 'leave');
            localStorage.removeItem('lobby-room');
        }
    }
}
