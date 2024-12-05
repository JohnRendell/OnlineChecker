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

//going back to dashboard
async function dashboard() {
    //activate the spinner
    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('validateText').innerText = 'Validating, please wait...';

    //validate the dashboard if the user is legit logged in
    const cookieRoute = await fetch('/cookie/getCookie');
    const cookieRouteData = cookieRoute.ok;

    if(cookieRouteData){
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

        if(decrypt_user){
            imInLobby(false, global_username);
            document.getElementById('loadingSpinner').style.display = 'none';
            window.location.href = "/dashboard/" + replaceSlash(localStorage.getItem('username'), '_');
        }
        else{
            window.location.href = "/invalidUser";
        }
    }
    else{
         window.location.href = "/noCookies";
    }
}

//loading player's information
var playerName_target = null; //for player name
async function getParamPlayer(){
    const queryString = window.location.href;
    const splitQuery = queryString.split('/');

    const username = splitQuery[splitQuery.length - 1];

    try{
        const getInfo = await fetch('/player/playerInfo', {
            method: "POST",
            headers: {
                "Accept": "Application/json",
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({ username: username })
        });

        const getInfo_Data = await getInfo.json();

        if(getInfo_Data.message === 'success'){
            //pass all the info
            document.title = 'Profile - ' + getInfo_Data.username;

            document.getElementById('userProfile').src = getInfo_Data.profile;
            document.getElementById('userProfileName').innerText = getInfo_Data.username;
            document.getElementById('userTrophy').innerText = 'Trophies: ' + getInfo_Data.trophy;

            playerName_target = getInfo_Data.username;
        }
    }
    catch(err){
        console.log(err);
    }
}
getParamPlayer();

let click = true;
async function checkReqList() {
    if(localStorage.getItem('username')){
        const user = CryptoJS.AES.decrypt(localStorage.getItem('username'), 'username').toString(CryptoJS.enc.Utf8);

        if(user && playerName_target){
            try{
                const requestFriend = await fetch('/friendList/checkUserRequest', {
                    method: "POST",
                    headers: {
                        "Accept": "Application/json",
                        "Content-Type": "Application/json"
                    },
                    body: JSON.stringify({ username: user, playerName: playerName_target })
                });

                const requestFriend_data = await requestFriend.json();

                if(requestFriend_data.status === 'pending'){
                    click = false;
                    document.getElementById('addFriendBtn').disabled = false;
                    document.getElementById('addFriendBtn').style.pointerEvents = 'auto';
                    document.getElementById('addFriendBtn').style.backgroundColor = '#3b82f6';

                    document.getElementById('addFriendBtn').innerText = 'Cancel';
                }
                else if(requestFriend_data.status === 'not yet'){
                    click = true;
                    document.getElementById('addFriendBtn').disabled = false;
                    document.getElementById('addFriendBtn').style.pointerEvents = 'auto';
                    document.getElementById('addFriendBtn').style.backgroundColor = '#3b82f6';

                    document.getElementById('addFriendBtn').innerText = 'Add Friend';
                }
                else if(requestFriend_data.status === 'friend'){
                    document.getElementById('addFriendBtn').disabled = true;
                    document.getElementById('addFriendBtn').style.pointerEvents = 'not-allowed';
                    document.getElementById('addFriendBtn').style.backgroundColor = 'green';
                    
                    document.getElementById('addFriendBtn').innerText = 'Friend';
                }
            }
            catch(err){
                console.log(err);
            }
        }
    }
}
window.onload = setTimeout(() => {
    checkReqList()
}, 100);

//for adding player
async function clickAddBtn(){
    try{
        let buttonText = document.getElementById('addFriendBtn').innerText;

        const requestFriend = await fetch('/friendList/request', {
            method: "POST",
            headers: {
                "Accept": "Application/json",
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({ username: global_username, playerName: playerName_target, status: buttonText })
        });

        const requestFriend_data = await requestFriend.json();

        if(requestFriend_data.message === 'success'){
            if(click){
                document.getElementById('addFriendBtn').innerText = 'Cancel';
                click = false;
                socket.emit('notify-player-request', playerName_target, 'Add Friend', requestFriend_data.player);
            }
            else{
                document.getElementById('addFriendBtn').innerText = 'Add Friend';
                click = true;

                socket.emit('notify-player-request', playerName_target, 'Cancel', requestFriend_data.player);
            }
        }
    }
    catch(err){
        console.log(err);
    }
}

//for both users, if they are in the visit page
async function add_each_other() {
    try{
        const validateUser = await fetch('/friendList/addOnVisitPage', {
            method: "POST",
            headers: {
                "Accept": "Application/json",
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({ username: global_username, playerTarget: playerName_target })
        });

        const validateUser_Data = await validateUser.json();

        if(validateUser_Data.message === 'success'){
            document.getElementById('addFriendBtn').disabled = true;
            document.getElementById('addFriendBtn').style.pointerEvents = 'not-allowed';
            document.getElementById('addFriendBtn').style.backgroundColor = 'green';
            
            document.getElementById('addFriendBtn').innerText = 'Friend';
            socket.emit('both_request', playerName_target);
        }
    }
    catch(err){
        console.log(err);
    }
}

//for restarting notif status on the global message
function restartStatus(){
    global_messageCount = 0;
    document.getElementById('notifMsg_global').style.display = 'none';
}

function displayProfile(){
    var parent = document.getElementById('userHistoryContainer');

    if(parent){
        while(parent.childElementCount > 0){
            parent.removeChild(parent.firstChild);
        }
    }

    if(document.getElementById('userHistory') && document.getElementById('loginProfile')){
        document.getElementById('userHistory').style.display = 'none';
        document.getElementById('loginProfile').style.display = 'flex';
    }

    if(document.getElementById('profileBtn') && document.getElementById('historyBtn')){
        document.getElementById('profileBtn').style.backgroundColor = '#1d4ed8';
        document.getElementById('historyBtn').style.backgroundColor = '#3b82f6';
    }
}
displayProfile();

//for user's history list
async function displayUserHistory(){
    var parent = document.getElementById('userHistoryContainer');

    if(parent){
        while(parent.childElementCount > 0){
            parent.removeChild(parent.firstChild);
        }
    }

    if(document.getElementById('userHistoryTitle')){
        document.getElementById('userHistoryTitle').innerText = playerName_target + '\'s History';
    }

    if(document.getElementById('userHistory') && document.getElementById('loginProfile')){
        document.getElementById('userHistory').style.display = 'flex';
        document.getElementById('loginProfile').style.display = 'none';
    }

    if(document.getElementById('historyBtn') && document.getElementById('profileBtn')){
        document.getElementById('historyBtn').style.backgroundColor = '#1d4ed8';
        document.getElementById('profileBtn').style.backgroundColor = '#3b82f6';
    }
    
    try{
        if(document.getElementById('searchLoader')){
            document.getElementById('searchLoader').style.display = 'flex';
        }
        const displayHistory = await fetch('/history/displayHistory', {
            method: "POST",
            headers: {
                "Content-Type": "Application/json",
                "Accept": "Application/json"
            },
            body: JSON.stringify({ username: playerName_target })
        });

        const displayHistory_data = await displayHistory.json();

        if(displayHistory_data.message === 'success'){
            if(document.getElementById('searchLoader')){
                document.getElementById('searchLoader').style.display = 'none';
            }
            const appendingHistoryTab = (status, lobby, opponent, time, date, trophy)=>{
                let containerColor = status === 'win' ? 'from-green-500' : 'from-red-500';
                var parent = document.getElementById('userHistoryContainer');

                //for container
                var contentContainer = document.createElement('div');
                contentContainer.setAttribute('class', 'w-full h-fit p-2 grid grid-rows-2 bg-gradient-to-r ' + containerColor + ' to-blue-500 rounded-2xl items-center');
                parent.appendChild(contentContainer);

                //for lobby and date wrapper
                var lobbyDiv = document.createElement('div');
                lobbyDiv.setAttribute('class', 'flex flex-row space-x-2 justify-start');
                contentContainer.appendChild(lobbyDiv);

                //lobby type
                var lobbyType = document.createElement('p');
                lobbyType.setAttribute('class', 'font-Pixelify text-[12px] text-center text-white font-bold xsm:text-[10px] md:text-sm');
                lobbyType.appendChild(document.createTextNode(lobby));
                lobbyDiv.appendChild(lobbyType);

                //history date
                var historyDate = document.createElement('p');
                historyDate.setAttribute('class', 'font-Pixelify text-[12px] text-center text-white font-bold xsm:text-[10px] md:text-sm');
                historyDate.appendChild(document.createTextNode(date));
                lobbyDiv.appendChild(historyDate);

                //opponent and player name display
                var nameDisplay = document.createElement('p');
                nameDisplay.setAttribute('class', 'font-Pixelify text-[12px] text-center text-white font-bold xsm:text-[10px] md:text-sm');
                nameDisplay.appendChild(document.createTextNode(playerName_target + ' vs ' + opponent));
                contentContainer.appendChild(nameDisplay);

                //wrapper for time and trophy
                var wrapperLeft = document.createElement('div');
                wrapperLeft.setAttribute('class', 'flex flex-row space-x-2 justify-end');
                contentContainer.appendChild(wrapperLeft);

                //time remaining
                var timeRemain = document.createElement('p');
                timeRemain.setAttribute('class', 'font-Pixelify text-[12px] text-center text-white font-bold xsm:text-[10px] md:text-sm');
                timeRemain.appendChild(document.createTextNode('Time Remaining: ' + time));
                wrapperLeft.appendChild(timeRemain);

                //trophy got
                var trophyGot = document.createElement('p');
                trophyGot.setAttribute('class', 'font-Pixelify text-[12px] text-center text-white font-bold xsm:text-[10px] md:text-sm');
                trophyGot.appendChild(document.createTextNode('Trophy earn: ' + trophy));
                wrapperLeft.appendChild(trophyGot);
            }
            for(let i = 0; i < displayHistory_data.historyCount; i++){
                let history = displayHistory_data.history[i];

                //history component
                let status = history.win_status;
                let lobby = history.lobbyType;
                let opponent = history.opponent;
                let time = history.time;
                let date = history.date;
                let trophy = history.trophy;

                appendingHistoryTab(status, lobby, opponent, time, date, trophy);
            }            
        }
    }
    catch(err){
        console.log(err);
    }
}