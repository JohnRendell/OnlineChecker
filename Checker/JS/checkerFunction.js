//set the initial game surrender to false
if(localStorage.getItem('host') || localStorage.getItem('invited-player')){
    localStorage.setItem('gameSurrender', CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse('manual'), 'gameSurrender').toString());
}

//global values
var global_username = null;
var global_profile = null;
var global_trophy = null ?? 'Guest-Mode';
var global_requestCount = null ?? 'Guest-Mode';

//for filling information
async function fillInfo(){
    //set the lobby type
    const queryString = window.location.href;
    const splitQuery = queryString.split('/');
    const status = splitQuery[splitQuery.length - 2];

    const encryptUser = ()=>{
        return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(status), 'lobbyType').toString();
    }

    //check if the lobby type haven't set yet
    if(!localStorage.getItem('lobbyType')){
        localStorage.setItem('lobbyType', encryptUser());
    }

    //check if the lobby type and the current status matched, otherwise send player back to dashboard
    if(localStorage.getItem('lobbyType')){
        let lobby = CryptoJS.AES.decrypt(localStorage.getItem('lobbyType'), 'lobbyType').toString(CryptoJS.enc.Utf8);

        if(lobby && lobby !== status){
            window.location.href = '/';
        }
    }

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
        else{
            global_username = fillUser_data.username;
            global_profile = fillUser_data.profile;
        }
        imInLobby(true, global_username);
        
        if(localStorage.getItem('host') || localStorage.getItem('invited-player')){
            getPlayersData();
        }
        setTimeout(() => {
            getWatchPlayersData();
        }, 100);
    }
    catch(err){
        console.log(err);
    }
}

fillInfo();

//for typing in input
function typeInput(inputID, inputTextCountID, maxCount){
    var inputText = document.getElementById(inputTextCountID);
    var inputBar = document.getElementById(inputID);

    inputText.innerText = inputBar.value.length + '/' + maxCount;
}

//get the data of the players
var global_opponent_username = null;
var global_opponent_profile = null;
var global_opponent_trophy = null;
var global_opponent_requestCount = null;

function getPlayersData(){
    //your data, display on desktop
    document.getElementById('yourUserData').innerText = global_username;
    document.getElementById('yourProfileData').src = global_profile;
    document.getElementById('yourTrophyData').innerText = 'Trophy: ' + global_trophy;

    //on mobile
    document.getElementById('myourUserData').innerText = global_username;
    document.getElementById('myourProfileData').src = global_profile;
    document.getElementById('myourTrophyData').innerText = 'Trophy: ' + global_trophy;

    //opponent
    const getData = async (username)=>{
        const opponentData = await fetch('/checker/getOpponentData', {
            method: "POST",
            headers: {
                "Accept": "Application/json",
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({ username: username })
        });

        const opponentData_data = await opponentData.json();

        if(opponentData_data.message === 'success'){
            global_opponent_username =  opponentData_data.username;
            global_opponent_profile = opponentData_data.profile;
            global_opponent_trophy = opponentData_data.trophy;

            //desktop
            document.getElementById('opponentUserData').innerText = opponentData_data.username;
            document.getElementById('opponentProfileData').src = opponentData_data.profile;
            document.getElementById('opponentTrophyData').innerText = 'Trophy: ' + opponentData_data.trophy;

            //mobile
            document.getElementById('mopponentUserData').innerText = opponentData_data.username;
            document.getElementById('mopponentProfileData').src = opponentData_data.profile;
            document.getElementById('mopponentTrophyData').innerText = 'Trophy: ' + opponentData_data.trophy;

            playerTurn();
        }
    }
    if(localStorage.getItem('invited-player')){
        let username = CryptoJS.AES.decrypt(localStorage.getItem('invited-player'), 'invited-player').toString(CryptoJS.enc.Utf8);

        if(username){
            getData(username);
        }
    }
    if(localStorage.getItem('host')){
        let username = CryptoJS.AES.decrypt(localStorage.getItem('host'), 'host').toString(CryptoJS.enc.Utf8);

        if(username){
            getData(username);
        }
    }

    //if page localstorage not set
    if(!localStorage.getItem('host') && !localStorage.getItem('invited-player') && !localStorage.getItem('spectator')){
        window.location.href = '/';
    }
}

//this is for spectator only
async function getWatchPlayersData(){
    if(localStorage.getItem('spectator') && localStorage.getItem('player_invited') && localStorage.getItem('player_host')){
        let spectator = CryptoJS.AES.decrypt(localStorage.getItem('spectator'), 'spectator').toString(CryptoJS.enc.Utf8);
        let player_host = CryptoJS.AES.decrypt(localStorage.getItem('player_host'), 'player_host').toString(CryptoJS.enc.Utf8);
        let player_invited = CryptoJS.AES.decrypt(localStorage.getItem('player_invited'), 'player_invited').toString(CryptoJS.enc.Utf8);

        if(spectator && player_host && player_invited){
            const findPlayers = await fetch('/checker/getPlayerData', {
                method: "POST",
                headers: {
                    "Content-Type": "Application/json",
                    "Accept": "Application/json"
                },
                body: JSON.stringify({ playerHost: player_host, playerInvited: player_invited })
            });

            const findPlayers_data = await findPlayers.json();

            if(findPlayers_data.message === 'success'){
                //your data, display on desktop
                document.getElementById('yourUserData').innerText = findPlayers_data.hostName;
                document.getElementById('yourProfileData').src = findPlayers_data.hostProfile;
                document.getElementById('yourTrophyData').innerText = 'Trophy: ' + findPlayers_data.hostTrophy;

                //on mobile
                document.getElementById('myourUserData').innerText = findPlayers_data.hostName;
                document.getElementById('myourProfileData').src = findPlayers_data.hostProfile;
                document.getElementById('myourTrophyData').innerText = 'Trophy: ' + findPlayers_data.hostTrophy;

                //desktop
                document.getElementById('opponentUserData').innerText = findPlayers_data.invitedName;
                document.getElementById('opponentProfileData').src = findPlayers_data.invitedProfile;
                document.getElementById('opponentTrophyData').innerText = 'Trophy: ' + findPlayers_data.invitedTrophy;

                //mobile
                document.getElementById('mopponentUserData').innerText = findPlayers_data.invitedName;
                document.getElementById('mopponentProfileData').src = findPlayers_data.invitedProfile;
                document.getElementById('mopponentTrophyData').innerText = 'Trophy: ' + findPlayers_data.invitedTrophy;

                //for turn
                if(!localStorage.getItem('turnIndicator')){
                    var profile_div = document.getElementById('userTurnProfile');
                    var indicator_div = document.getElementById('userTurnIndicator');

                    if(profile_div){
                        profile_div.src = findPlayers_data.hostProfile;
                    }
                    if(indicator_div){
                        indicator_div.innerText = findPlayers_data.hostName + ' turn';
                    }
                    const encryptUser = ()=>{
                        return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse('yes'), 'turnIndicator').toString();
                    }
                    localStorage.setItem('turnIndicator', encryptUser());
                }
                spectatorPlayerTurn();
            }
        }
    }
}

//this is for adding the current lobby to the list
function addLobbyToWatchLive(){
    //add the lobby to the list
    if(localStorage.getItem('lobbyType') && localStorage.getItem('lobby-room') && localStorage.getItem('invited-player')){
        let lobbyType = CryptoJS.AES.decrypt(localStorage.getItem('lobbyType'), 'lobbyType').toString(CryptoJS.enc.Utf8);

        let lobbyRoom = CryptoJS.AES.decrypt(localStorage.getItem('lobby-room'), 'lobby-room').toString(CryptoJS.enc.Utf8);

        if(lobbyType && lobbyRoom){
            let invited = CryptoJS.AES.decrypt(localStorage.getItem('invited-player'), 'invited-player').toString(CryptoJS.enc.Utf8);
            
            if(invited && !invited.startsWith('guest')){
                socket.emit('addLobby', lobbyType, lobbyRoom, global_username, invited);
            }
        }
    }
}
setTimeout(() => {
    addLobbyToWatchLive();
}, 100);

//for initial turn
async function spectatorPlayerTurn(){
    var profile = document.getElementById('userTurnProfile');
    var indicator = document.getElementById('userTurnIndicator');
    let room = CryptoJS.AES.decrypt(localStorage.getItem('lobby-room'), 'lobby-room').toString(CryptoJS.enc.Utf8);
    
    if(room && profile && indicator){
        try{
            const turnIndi = await fetch('/lobby/lobbyData', {
                method: "POST",
                headers: {
                    "Content-Type": "Application/json",
                    "Accept": "Application/json"
                },
                body: JSON.stringify({ lobbyRoom: room })
            });

            const turnIndi_data = await turnIndi.json();

            if(turnIndi_data.message === 'success'){
                profile.src = turnIndi_data.playerProfile;
                indicator.innerText = turnIndi_data.playerName + ' turn';
            }
        }
        catch(err){
            console.log(err);
        }
    }
}

function playerTurn(){
    //for host and invited
    var profile = document.getElementById('userTurnProfile');
    var indicator = document.getElementById('userTurnIndicator');

    //for only host and invited
    if(localStorage.getItem('host') || localStorage.getItem('invited-player')){
        if(localStorage.getItem('turnIndicator')){
            let turn = CryptoJS.AES.decrypt(localStorage.getItem('turnIndicator'), 'turnIndicator').toString(CryptoJS.enc.Utf8);

            if(turn){
                if(turn === 'yes'){
                    if(profile){
                        profile.src = global_profile;
                    }
                    if(indicator){
                        indicator.innerText = global_username + ' turn';
                    }
                }

                if(turn === 'no'){
                    if(profile){
                        profile.src = global_opponent_profile;
                    }
                    if(indicator){
                        indicator.innerText = global_opponent_username + ' turn';
                    }
                }

                const encryptUser = ()=>{
                    return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(turn), 'turnIndicator').toString();
                }
                localStorage.setItem('turnIndicator', encryptUser());
            }
        }
        else{
            let turn = localStorage.getItem('invited-player') ? 'yes' : 'no';

            if(turn === 'yes'){
                if(profile){
                    profile.src = global_profile;
                }
                if(indicator){
                    indicator.innerText = global_username + ' turn';
                }
            }

            if(turn === 'no'){
                if(profile){
                    profile.src = global_opponent_profile;
                }
                if(indicator){
                    indicator.innerText = global_opponent_username + ' turn';
                }
            }

            const encryptUser = ()=>{
                return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(turn), 'turnIndicator').toString();
            }
            localStorage.setItem('turnIndicator', encryptUser());
        }
    }
}

//assemble the board
function boardAssemble(){
    var board = document.getElementById('checkerBoard');
    var key = 'ABCDEFGH';
    let color;

    for(let i = 0; i < 8; i++){ //8 row
        for(let j = 0; j < 8; j++){ //8 column
            var div = document.createElement('div');

            color = (i + j) % 2 === 0 ? 'bg-white' : 'bg-black'; //check if the tile is even or odd, then assign a color base on even or odd.

            div.setAttribute('class', 'flex justify-center items-center w-full h-full ' + color);
            div.setAttribute('id', 'tile_' + (i + 1) + key.charAt(j));
            div.setAttribute('onclick', 'moveToTiles("tile_' + (i + 1) + key.charAt(j) + '")');
            board.appendChild(div); //append the div to the board
        }
    }
}
boardAssemble();

function checkerAssemble(){
    var board = document.getElementById('checkerBoard');
    let enemyCountID = 13;
    let teamCountID = 0;

    //initial position of pieces
    if(localStorage.getItem('host') || localStorage.getItem('invited-player') || localStorage.getItem('spectator')){
        for(let i = 0; i < board.childElementCount; i++){
            var child = board.children[i];
            var piece1 = document.createElement('div');
            var piece2 = document.createElement('div');

            //player piece
            piece1.setAttribute('class', 'w-[80%] h-[80%] rounded-full border-2 border-black bg-blue-500 cursor-pointer flex items-center justify-center');

            //enemy piece
            piece2.setAttribute('class', 'w-[80%] h-[80%] rounded-full border-2 border-black bg-red-500 flex items-center justify-center');

            //blue team
            if(child.id.startsWith('tile_6A') || child.id.startsWith('tile_6C') || child.id.startsWith('tile_6E') || child.id.startsWith('tile_6G') || 
            child.id.startsWith('tile_7B') || child.id.startsWith('tile_7D') || child.id.startsWith('tile_7F') || child.id.startsWith('tile_7H') || 
            child.id.startsWith('tile_8A') || child.id.startsWith('tile_8C') || child.id.startsWith('tile_8E') || child.id.startsWith('tile_8G')){
                teamCountID++;
                
                //this is for the piece type
                var inputP = document.createElement('input');
                inputP.setAttribute('id', 'pieceInput' + teamCountID);
                inputP.setAttribute('class', 'hidden');
                inputP.setAttribute('value', 'pawn');

                //set the attribute for the ally piece
                piece1.setAttribute('id', 'piece' + teamCountID);
                piece1.setAttribute('onclick', 'showAvailableMove("' + 'pieceInput' + teamCountID + '", "piece' + teamCountID + '")');
                piece1.appendChild(inputP);

                //check if the piece is moved into different tile
                if(localStorage.getItem('piece' + teamCountID + '_pos')){
                    let piecePos = CryptoJS.AES.decrypt(localStorage.getItem('piece' + teamCountID + '_pos'), 'piece' + teamCountID + '_pos').toString(CryptoJS.enc.Utf8);
                    
                    if(piecePos){
                        let tileSaved = document.getElementById(piecePos);

                        if(tileSaved){
                            tileSaved.appendChild(piece1);
                        }
                        else{
                            window.location.href = '/Invalid/GameTerminated';
                        }
                    }
                    else{
                        window.location.href = '/Invalid/GameTerminated';
                    }
                }

                //check if piece is eaten
                if(localStorage.getItem('eaten_piece' + teamCountID)){
                    let eatPieceID = CryptoJS.AES.decrypt(localStorage.getItem('eaten_piece' + teamCountID), 'eaten_piece' + teamCountID).toString(CryptoJS.enc.Utf8);

                    if(eatPieceID){
                        if(document.getElementById(eatPieceID)){
                            document.getElementById(eatPieceID).remove();
                        }
                    }
                    else{
                        window.location.href = '/ModifiedPiece/GameTerminated';
                    }
                }

                //for checking if the piece is promoted
                if(localStorage.getItem('pieceInput' + teamCountID)){
                    let input =  CryptoJS.AES.decrypt(localStorage.getItem('pieceInput' + teamCountID), 'pieceInput' + teamCountID).toString(CryptoJS.enc.Utf8);

                    if(input){
                        if(input === 'queen'){
                            //append the crown icon
                            var img = document.createElement('img');
                            img.setAttribute('class', 'w-full h-full');
                            img.setAttribute('src', '/Images/Crown.png');
                            img.setAttribute('alt', 'Crown icon');
                            
                            inputP.setAttribute('value', 'queen');
                            piece1.appendChild(img);
                        }
                        else{
                            inputP.setAttribute('value', 'pawn');
                        }
                    }
                    else{
                        window.location.href = '/ModifiedPiece/GameTerminated';
                    }
                }

                //if none of the above
                if(!localStorage.getItem('pieceInput' + teamCountID) && !localStorage.getItem('piece' + teamCountID) && !localStorage.getItem('eaten_piece' + teamCountID) && !localStorage.getItem('piece' + teamCountID + '_pos')){
                    child.appendChild(piece1);
                }
            }

            //red team
            if(child.id.startsWith('tile_1B') || child.id.startsWith('tile_1D') || child.id.startsWith('tile_1F') || child.id.startsWith('tile_1H') || 
            child.id.startsWith('tile_2A') || child.id.startsWith('tile_2C') || child.id.startsWith('tile_2E') || child.id.startsWith('tile_2G') || 
            child.id.startsWith('tile_3B') || child.id.startsWith('tile_3D') || child.id.startsWith('tile_3F') || child.id.startsWith('tile_3H')){
                enemyCountID--;

                //this is for the piece type
                var inputP = document.createElement('input');
                inputP.setAttribute('id', 'opponent_pieceInput' + enemyCountID);
                inputP.setAttribute('class', 'hidden');
                inputP.setAttribute('value', 'pawn');

                //set the attribute for the enemy piece
                piece2.setAttribute('id', 'opponent_piece' + enemyCountID);
                piece2.appendChild(inputP);

                //if there is saved spot
                if(localStorage.getItem('opponent_piece' + enemyCountID + '_pos')){
                    let piecePos = CryptoJS.AES.decrypt(localStorage.getItem('opponent_piece' + enemyCountID + '_pos'), 'opponent_piece' + enemyCountID + '_pos').toString(CryptoJS.enc.Utf8);

                    if(piecePos){
                        let tileSaved = document.getElementById(piecePos);

                        if(tileSaved){
                            tileSaved.appendChild(piece2);
                        }
                        else{
                            window.location.href = '/Invalid/GameTerminated';
                        }
                    }
                    else{
                        window.location.href = '/Invalid/GameTerminated';
                    }
                }

                //for checking if the piece is eaten
                if(localStorage.getItem('eaten_opponent_piece' + enemyCountID)){
                    let eatPieceID = CryptoJS.AES.decrypt(localStorage.getItem('eaten_opponent_piece' + enemyCountID), 'eaten_opponent_piece' + enemyCountID).toString(CryptoJS.enc.Utf8);

                    if(eatPieceID){
                        if(document.getElementById(eatPieceID)){
                            document.getElementById(eatPieceID).remove();
                        }
                    }
                    else{
                        window.location.href = '/ModifiedPiece/GameTerminated';
                    }
                }

                //for checking if the piece is promoted
                if(localStorage.getItem('opponent_pieceInput' + enemyCountID)){
                    let input =  CryptoJS.AES.decrypt(localStorage.getItem('opponent_pieceInput' + enemyCountID), 'opponent_pieceInput' + enemyCountID).toString(CryptoJS.enc.Utf8);

                    if(input){
                        if(input === 'queen'){
                            //append the crown icon
                            var img = document.createElement('img');
                            img.setAttribute('class', 'w-full h-full');
                            img.setAttribute('src', '/Images/Crown.png');
                            img.setAttribute('alt', 'Crown icon');
                            
                            piece2.appendChild(img);
                            inputP.setAttribute('value', 'queen');
                        }
                        else{
                            inputP.setAttribute('value', 'pawn');
                        }
                    }
                    else{
                        window.location.href = '/ModifiedPiece/GameTerminated';
                    }
                }

                //if none of the above
                if(!localStorage.getItem('opponent_pieceInput' + enemyCountID) && !localStorage.getItem('eaten_opponent_piece' + enemyCountID) && !localStorage.getItem('opponent_piece' + enemyCountID) && !localStorage.getItem('opponent_piece' + enemyCountID + '_pos')){
                    child.appendChild(piece2);
                }
            }

            //clear the tile child that its not piece or enemy piece
            for(let pieces of child.childNodes){
                if(!pieces.id.startsWith('piece') && !pieces.id.startsWith('opponent')){
                    pieces.remove();
                } 
            }
        }
    }
}

async function spectatorCheckerAssemble(){
    try{
        let room =  CryptoJS.AES.decrypt(localStorage.getItem('lobby-room'), 'lobby-room').toString(CryptoJS.enc.Utf8);

        if(room){
            const getPiecePos = await fetch('/lobby/lobbyData', {
                method: "POST",
                headers: {
                    "Content-Type": "Application/json",
                    "Accept": "Application/json"
                },
                body: JSON.stringify({ lobbyRoom: room })
            });

            const getPiecePos_data = await getPiecePos.json();

            if(getPiecePos_data.message === 'success'){
                let blueTeam = getPiecePos_data.blueTeamPos;
                let redTeam = getPiecePos_data.redTeamPos;

                for(let i = 0; i < blueTeam.length; i++){
                    if(blueTeam[i]){
                        let piece = document.getElementById(blueTeam[i]['pieceID']);
                        let tile = document.getElementById(blueTeam[i]['tileID']);

                        //for position
                        if(piece && tile){
                            tile.appendChild(piece);
                        }

                        //for checking if the piece is eaten
                        if(blueTeam[i]['eaten_piece']){
                            let eatPieceID = blueTeam[i]['eaten_piece'];

                            if(document.getElementById(eatPieceID)){
                                document.getElementById(eatPieceID).remove();
                            }
                        }

                        //for checking if piece is promoted
                        if(blueTeam[i]['promotePiece']){
                            //append the crown icon
                            var img = document.createElement('img');
                            img.setAttribute('class', 'w-full h-full');
                            img.setAttribute('src', '/Images/Crown.png');
                            img.setAttribute('alt', 'Crown icon');
                            
                            document.getElementById(blueTeam[i]['promotePiece']).appendChild(img);
                        }
                    }
                }

                for(let i = 0; i < redTeam.length; i++){
                    if(redTeam[i]){
                        let piece = document.getElementById(redTeam[i]['pieceID']);
                        let tile = document.getElementById(redTeam[i]['tileID']);

                        //for position
                        if(piece && tile){
                            tile.appendChild(piece);
                        }

                         //for checking if the piece is eaten
                        if(redTeam[i]['eaten_piece']){
                            let eatPieceID = redTeam[i]['eaten_piece'];

                            if(document.getElementById(eatPieceID)){
                                document.getElementById(eatPieceID).remove();
                            }
                        }

                        //for checking if piece is promoted
                        if(redTeam[i]['promotePiece']){
                            //append the crown icon
                            var img = document.createElement('img');
                            img.setAttribute('class', 'w-full h-full');
                            img.setAttribute('src', '/Images/Crown.png');
                            img.setAttribute('alt', 'Crown icon');
                            
                            document.getElementById(redTeam[i]['promotePiece']).appendChild(img);
                        }
                    }
                }
            }
        }
    }
    catch(err){
        console.log(err);
    }
}

if(localStorage.getItem('spectator')){
    spectatorCheckerAssemble();
}

checkerAssemble();

//start the timer
function startTime() {
    let timeP = document.getElementById('checkerTime');
    
    let minute;
    let sec;

    let minute_dec = CryptoJS.AES.decrypt(localStorage.getItem('minute'), 'minute').toString(CryptoJS.enc.Utf8);
    let sec_dec = CryptoJS.AES.decrypt(localStorage.getItem('sec'), 'sec').toString(CryptoJS.enc.Utf8);

    if(minute_dec && sec_dec){
        minute = parseInt(minute_dec);
        sec = parseInt(sec_dec);
    }

    // Display initial time format
    timeP.innerText = '10:00';

    // Start the timer
    let timer = setInterval(() => {
        // Check if time is up
        if (minute === 0 && sec === 0) {
            clearInterval(timer);
            timeP.innerText = '00:00';
            checkBoardStatus();
            return;
        }

        // Decrease the time
        if (sec === 0) {
            sec = 59;
            minute--;
        } else {
            sec--;
        }

        // Format the time display with leading zeros
        timeP.innerText =  (minute < 10 ? '0' + minute : minute) + ':' + 
            (sec < 10 ? '0' + sec : sec);

        localStorage.setItem('minute', CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(minute), 'minute').toString());
        localStorage.setItem('sec', CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(sec), 'sec').toString());

        socket.emit('spectator_time', minute, sec, localStorage.getItem('lobby-room'));
        socket.emit('game_time', minute, sec, localStorage.getItem('lobby-room'));
    }, 1000);
}

setTimeout(() => {
    if(localStorage.getItem('minute') && localStorage.getItem('sec') && localStorage.getItem('invited-player')){
        startTime();
    }
}, 1000);

//sending message to the game lobby
function gameMessage(){
    var message = document.getElementById('messageInputGame');

    if(message.value){
        //main container
        var container = document.getElementById('gameMessageConversation');

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

        let isSpectator = localStorage.getItem('spectator') ? '(Spectator)' : '';
        messageSender.appendChild(document.createTextNode(global_username + isSpectator));
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
        let room = localStorage.getItem('lobby-room');
        socket.emit('gameMessage', message.value, global_username, global_profile, room);

        //reset the input and counter
        document.getElementById('messageInputGame').value = '';
        document.getElementById('messageInputGameCount').innerText = '0/80';

        container.scrollTo(0, container.scrollHeight);
    }
}

//reset count message on game lobby
function resetCount(){
    messageCount = 0;
    document.getElementById('notifMsg_game').style.display = 'none';
}

//clicking yes in surrender
async function surrenderPanel(){
    //add the history data
    const getHost = ()=>{
        if(localStorage.getItem('host')){
            let host = CryptoJS.AES.decrypt(localStorage.getItem('host'), 'host').toString(CryptoJS.enc.Utf8);

            if(host){
                return host;
            }
        }
        else{
            return undefined;
        }
    }

    const getInvited = ()=>{
        if(localStorage.getItem('invited-player')){
            let invited = CryptoJS.AES.decrypt(localStorage.getItem('invited-player'), 'invited-player').toString(CryptoJS.enc.Utf8);

            if(invited){
                return invited;
            }
        }
    }

    const getLobbyType = ()=>{
        if(localStorage.getItem('lobbyType')){
            let lobby = CryptoJS.AES.decrypt(localStorage.getItem('lobbyType'), 'lobbyType').toString(CryptoJS.enc.Utf8);

            if(lobby){
                return lobby;
            }
            else{
                window.location.href = '/Modified_saved/GameTerminated';
            }
        }
    }

    const getTimer = ()=>{
        if(localStorage.getItem('minute') && localStorage.getItem('sec')){
           let minute = CryptoJS.AES.decrypt(localStorage.getItem('minute'), 'minute').toString(CryptoJS.enc.Utf8);

           let sec = CryptoJS.AES.decrypt(localStorage.getItem('sec'), 'sec').toString(CryptoJS.enc.Utf8);

           if(minute && sec){
                return (minute < 10 ? '0' + minute : minute) + ':' + (sec < 10 ? '0' + sec : sec);
           }
           else{
                window.location.href = '/Modified_saved/GameTerminated';
           }
        }
        else{
            window.location.href = '/Modified_saved/GameTerminated';
        }
    }

    try{
        const addHistory = await fetch('/history/addHistory', {
            method: "POST",
            headers: {
                "Accept": "Application/json",
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({
                username: global_username,
                opponent: getHost() !== undefined ? getHost() : getInvited(), 
                lobbyType: getLobbyType(), 
                time: getTimer(), 
                win_status: 'lose',
                trophy: global_trophy
            })
        });

        const addHistory_data = await addHistory.json();

        if(addHistory_data.message === 'success'){
            modalStatus('surrenderNotifModal', 'surrenderNotifContainer', 'flex', 'modal_animation');
            document.getElementById('surrenderNotif-text-display').innerText = global_username + ' surrendered';
            document.getElementById('win-status').innerText = 'You lose';
            document.getElementById('win-status').style.color = 'red';
            document.getElementById('win-status-time-display').innerText = 'Time Remaining: ' + getTimer();

            if(addHistory_data.status === 'Match'){
                document.getElementById('win-status-trophy').innerText = 'Trophy now: ' + addHistory_data.trophy;
                document.getElementById('win-status-trophy').style.color = 'red';
            }
            else{
                document.getElementById('win-status-trophy').innerText = 'You cannot earn or decrease trophy in custom mode';
            }

            let room = localStorage.getItem('lobby-room');
            socket.emit('checker-player-surrender', global_username, room);
        }

    } catch (err){
        console.log(err);
    }
}

//for going back to dashboard
async function dashboard() {
    //set the gameSurrender to true
    localStorage.setItem('gameSurrender', CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse('default'), 'gameSurrender').toString());

    //activate the spinner
    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('validateText').innerText = 'Validating, please wait...';

    //validate the dashboard if the user is legit logged in
    const cookieRoute = await fetch('/cookie/getCookie');
    const cookieRouteData = await cookieRoute.json();

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

        const decrypt_room = CryptoJS.AES.decrypt(localStorage.getItem('lobby-room'), 'lobby-room').toString(CryptoJS.enc.Utf8);

        if(decrypt_user && decrypt_room){
            imInLobby(false, global_username);
            socket.emit('room-status', decrypt_room, 'leave');
            
            document.getElementById('loadingSpinner').style.display = 'none';
            window.location.href = "/dashboard/" + replaceSlash(localStorage.getItem('username'), '_');
        }
    }
}