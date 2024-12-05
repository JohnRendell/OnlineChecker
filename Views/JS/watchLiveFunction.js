async function displayLobby(){
    var container = document.getElementById('lobbyContainer');

    if(container){
        let child = container.lastElementChild;
        while (child) {
            container.removeChild(child);
            child = container.lastElementChild;
        }
    }
    
    try{
        const findLobby = await fetch('/lobby', {
            method: "POST",
            headers: {
                "Content-Type": "Application/json",
                "Accept": "Application/json"
            },
            body: JSON.stringify({ guaranteedAccess: true })
        });

        const findLobby_data = await findLobby.json();


        if(findLobby_data.message === 'success'){
            const lobby = findLobby_data.lobby;

            document.getElementById('lobbyCount').innerText = 'Total Lobbies: ' + findLobby_data.lobbyCount;

            lobby.forEach(lobby => {
                var wrapper = document.createElement('div');
                wrapper.setAttribute('class', 'grid grid-cols-2 grid-rows-1 w-full rounded-2xl text-black cursor-pointer hover:bg-blue-500 hover:text-white xsm:rounded-lg');
                wrapper.setAttribute('onclick', 'modalStatus("modalOpenLobbyPanel", "modalOpenLobbyContainer", "flex", "modal_animation"); openLobbyPanel("' + lobby.lobbyRoom + '", "' + lobby.host + '", "' + lobby.invited + '", "' + lobby.lobbyRoom + '")');

                var lobbyType = document.createElement('p');
                lobbyType.setAttribute('class', 'font-Pixelify font-bold text-center text-sm');
                lobbyType.appendChild(document.createTextNode(lobby.lobbyType));

                var lobbyRoom = document.createElement('p');
                lobbyRoom.setAttribute('class', 'font-Pixelify font-bold text-center text-sm');
                lobbyRoom.appendChild(document.createTextNode(lobby.lobbyRoom));

                var host = document.createElement('p');
                host.setAttribute('class', 'font-Pixelify font-bold text-center text-sm');
                host.appendChild(document.createTextNode(lobby.host));

                var invited = document.createElement('p');
                invited.setAttribute('class', 'font-Pixelify font-bold text-center text-sm');
                invited.appendChild(document.createTextNode(lobby.invited));

                wrapper.appendChild(lobbyType);
                wrapper.appendChild(lobbyRoom);

                container.appendChild(wrapper);
            });
        }
        else{
            var displayText = document.createElement('p');
            displayText.setAttribute('class', 'font-Pixelify font-bold text-center text-sm');
            displayText.appendChild(document.createTextNode(findLobby_data.message));

            container.appendChild(displayText);
        }
    } catch(err){
        console.log(err);
    }
}

//this is for opening the lobby live panel
async function openLobbyPanel(room, host, invited, lobbyName){
    alert(room + ' ' + host + ' ' + invited + ' ' + lobbyName)
   var buttonWrapper = document.getElementById('buttonWrapperLobby');

   //append the buttons
   var watchButton = document.createElement('button');
   watchButton.setAttribute('class', 'w-auto h-auto font-Pixelify text-center text-sm rounded-2xl bg-blue-500 p-2 text-white hover:bg-blue-700');
   watchButton.setAttribute('onclick', 'watchLive("' + room + '", "' + host + '", "' + invited + '")');
   watchButton.appendChild(document.createTextNode('Enter Room'));

   var closeButton = document.createElement('button');
   closeButton.setAttribute('class', 'w-auto h-auto font-Pixelify text-center text-sm rounded-2xl bg-blue-500 p-2 text-white hover:bg-blue-700');
   closeButton.setAttribute('onclick', 'modalStatus("modalOpenLobbyPanel", "modalOpenLobbyContainer", "none", null); clearLobbyPanel()');
   closeButton.appendChild(document.createTextNode('Close Panel'));

   buttonWrapper.appendChild(watchButton);
   buttonWrapper.appendChild(closeButton);

   //lobby name
   document.getElementById('lobbyOpenName').innerText = lobbyName;

   //add info of the players
   const findPlayers = await fetch('/checker/getPlayerData', {
        method: "POST",
        headers: {
            "Content-Type": "Application/json",
            "Accept": "Application/json"
        },
        body: JSON.stringify({ playerHost: host, playerInvited: invited })
    });

    const findPlayers_data = await findPlayers.json();

    if(findPlayers_data.message === 'success'){
        document.getElementById('hostUsername').innerText = findPlayers_data.hostName;
        document.getElementById('hostProfileData').src = findPlayers_data.hostProfile;
        document.getElementById('hostTrophyData').innerText = 'Trophy: ' + findPlayers_data.hostTrophy;

        document.getElementById('invitedUsername').innerText = findPlayers_data.invitedName;
        document.getElementById('invitedProfileData').src = findPlayers_data.invitedProfile;
        document.getElementById('invitedTrophyData').innerText = 'Trophy: ' + findPlayers_data.invitedTrophy;
    }
}

function clearLobbyPanel(){
    var dataContainer = document.getElementById('buttonWrapperLobby');

    while(dataContainer.lastElementChild){
        dataContainer.removeChild(dataContainer.lastElementChild);
    }
}

//this one is for clicking lobby to watch
function watchLive(room, host, invited){
    const encryptUser = ()=>{
        return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(room), 'lobby-room').toString();
    }
    localStorage.setItem('lobby-room', encryptUser());
    localStorage.setItem('player_host', CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(host), 'player_host').toString());
    localStorage.setItem('player_invited', CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(invited), 'player_invited').toString());

    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('validateText').innerText = 'Starting game, please wait...';

    //send the id as parameter for the dashboard route
    function replaceSlash(inputString, replacementChar) {
        return inputString.replace(/\//g, replacementChar);
    }

    //check for decryption
    const username = CryptoJS.AES.decrypt(localStorage.getItem('username'), 'username').toString(CryptoJS.enc.Utf8);

    if(username){
        document.getElementById('loadingSpinner').style.display = 'none';
        localStorage.setItem('spectator', CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(username), 'spectator'));
        window.location.href = '/Checker/Match-mode/' + replaceSlash(localStorage.getItem('username'), '_');
    }
    else{
        window.location.href = '/InvalidUser';
    }
}