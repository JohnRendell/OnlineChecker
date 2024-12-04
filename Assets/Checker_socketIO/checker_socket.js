const socket = io();

socket.on('connect', async ()=>{
    //play the loading spinner
    document.getElementById('loadingSpinner').style.display = 'flex';
    document.getElementById('validateText').innerText = 'Game loading, please wait for a moment...';

    //join the room for game lobby
    let lobby = CryptoJS.AES.decrypt(localStorage.getItem('lobby-room'), 'lobby-room').toString(CryptoJS.enc.Utf8);

    if(lobby){
        socket.emit('room-status', lobby, 'join');

        if(localStorage.getItem('host') || localStorage.getItem('invited-player')){
            document.getElementById('playerSurrBtn').style.display = 'block';
            document.getElementById('spectatorBtn').style.display = 'none';
            
            function startTime() {
                let timeP = document.getElementById('checkerTime');
                
                let minute = 10;
                let sec = 0;

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
                    timeP.innerText = 
                        (minute < 10 ? '0' + minute : minute) + ':' + 
                        (sec < 10 ? '0' + sec : sec);

                    localStorage.setItem('minute', CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(minute), 'minute').toString());
                    localStorage.setItem('sec', CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(sec), 'sec').toString());

                    socket.emit('spectator_time', minute, sec, localStorage.getItem('lobby-room'));
                    socket.emit('game_time', minute, sec, localStorage.getItem('lobby-room'));
                }, 1000);
            }

            if(localStorage.getItem('invited-player') && (!localStorage.getItem('minute') && !localStorage.getItem('sec'))){
                startTime();
            }
        }

        if(localStorage.getItem('spectator')){
            document.getElementById('playerSurrBtn').style.display = 'none';
            document.getElementById('spectatorBtn').style.display = 'block';
        }

        document.getElementById('loadingSpinner').style.display = 'none';
        const username = CryptoJS.AES.decrypt(localStorage.getItem('username'), 'username').toString(CryptoJS.enc.Utf8);

        if(username){
            addUserList(localStorage.getItem('username'));
            socket.emit('connected-users', localStorage.getItem('username'));
        }
    }
});

//for displaying time on player
socket.on('game_time', (minute, sec)=>{
    if(localStorage.getItem('host')){
        let timeP = document.getElementById('checkerTime');

        // Start the timer
        timeP.innerText = (minute < 10 ? '0' + minute : minute) + ':' + (sec < 10 ? '0' + sec : sec);

        localStorage.setItem('minute', CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(minute), 'minute').toString());
        localStorage.setItem('sec', CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(sec), 'sec').toString());
    }
});

//for chatting on game lobby
let messageCount = 0;
socket.on('gameMessage', (message, user, userProfile)=>{
    messageCount++;

    //display the notif
    if(document.getElementById('notifMsg_game')){
        document.getElementById('notifMsg_game').style.display = 'inline';
        document.getElementById('notifMsg_game').innerText = messageCount;
    }

    //main container
    var container = document.getElementById('gameMessageConversation');

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

        let receiver;

        let invitedPlayer = localStorage.getItem('invited-player') ? CryptoJS.AES.decrypt(localStorage.getItem('invited-player'), 'invited-player').toString(CryptoJS.enc.Utf8) : false;
        let host = localStorage.getItem('host') ? CryptoJS.AES.decrypt(localStorage.getItem('host'), 'host').toString(CryptoJS.enc.Utf8) : false;

        let player_host = localStorage.getItem('player_host') ? CryptoJS.AES.decrypt(localStorage.getItem('player_host'), 'player_host').toString(CryptoJS.enc.Utf8) : false;
        let player_invited = localStorage.getItem('player_invited') ? CryptoJS.AES.decrypt(localStorage.getItem('player_invited'), 'player_invited').toString(CryptoJS.enc.Utf8) : false;

        if(((invitedPlayer && invitedPlayer === user) || (host && host === user)) || ((player_invited && player_invited === user) || (player_host && player_host === user))){
            receiver = user;
        }

        else{
            receiver = user + ' (Spectator)';
        }
        messageSender.appendChild(document.createTextNode(receiver));
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

//pass the player move to the other side
socket.on('checker-player-move', (pieceID, tileID)=>{
    let piece_opponentID = 'opponent_' + pieceID;
    var child = document.getElementById(piece_opponentID);

    //break the tile ID
    let tileKeys = 'abcdefgh'.toUpperCase().split('');
    let destinationTile_arr = tileID.split(''); //'tile_1A' structure of an tileID
    let destinationTile_char = destinationTile_arr[destinationTile_arr.length - 1]; //char of the tile ID
    let destinationTile_num = destinationTile_arr[destinationTile_arr.length - 2]; //num of the tile ID

    let mirroredColumnIndex = tileKeys.length - 1 - tileKeys.indexOf(destinationTile_char);
    let tileNum = 9 - destinationTile_num;
    var tile = document.getElementById('tile_' + tileNum + tileKeys[mirroredColumnIndex]);

    if(tile && (localStorage.getItem('host') || localStorage.getItem('invited-player'))){
        if(child){
            tile.appendChild(child);

            if(localStorage.getItem('invited-player')){
                socket.emit('spectator_moveRed', piece_opponentID, tile.id, localStorage.getItem('lobby-room'));
            }

            //save the game state
            localStorage.setItem(piece_opponentID + '_pos', CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(tile.id), piece_opponentID + '_pos').toString());

            //to check if the opponent's piece is promoted
            if(document.getElementById('opponent_pieceInput' + pieceID.substring(5).trim()).value === 'pawn'){
                if(tile.id === 'tile_8A' || tile.id === 'tile_8C' || tile.id === 'tile_8E' || tile.id === 'tile_8G'){
                    //save the input
                    let input = document.getElementById('opponent_pieceInput' + pieceID.substring(5).trim());
                    
                    if(input){
                        localStorage.setItem('opponent_pieceInput' + pieceID.substring(5).trim(), CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(input.value), 'opponent_pieceInput' + pieceID.substring(5).trim()).toString());
                    }

                    modalStatus('promotedModal', 'promotedContainer', 'flex', 'modal_animation');

                    document.getElementById('promoteLabel').innerText = global_opponent_username + ' piece\'s promoted';
                    document.getElementById('opponent_pieceInput' + pieceID.substring(5).trim()).value = 'queen';
                    
                    //append the crown icon
                    var img = document.createElement('img');
                    img.setAttribute('class', 'w-full h-full');
                    img.setAttribute('src', '/Images/Crown.png');
                    img.setAttribute('alt', 'Crown icon');

                    child.appendChild(img);

                    document.getElementById('promotedContainer').addEventListener('animationend', ()=>{
                        setTimeout(() => {
                            modalStatus('promotedModal', 'promotedContainer', 'none', null);
                        }, 1000);
                    });

                    localStorage.setItem('opponent_pieceInput' + pieceID.substring(5).trim(), CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(input.value), 'opponent_pieceInput' + pieceID.substring(5).trim()).toString());


                    if(localStorage.getItem('invited-player')){
                        socket.emit('spectator_promoteRed', piece_opponentID, 'opponent_pieceInput' + pieceID.substring(5).trim(), localStorage.getItem('lobby-room'), global_opponent_username);
                    }
                }
            }
        }
    }
});

//for player that eaten the piece
socket.on('checker-player-eat-piece', (pieceID)=>{
    if(localStorage.getItem('host') || localStorage.getItem('invited-player')){
        for(let ID of pieceID){
            let newID = ID.substring(9).trim();
            
            //updating player turn
            const encryptUser = ()=>{
                return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse('no'), 'turnIndicator').toString();
            }
            localStorage.setItem('turnIndicator', encryptUser());

            //save the piece eaten
            localStorage.setItem('eaten_' + newID, CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(newID), 'eaten_' + newID).toString());

            document.getElementById(newID).style.animation = 'shrinkPiece 1s normal forwards';
            document.getElementById(newID).addEventListener('animationend', ()=>{
                document.getElementById(newID).remove();
            });

            if(localStorage.getItem('invited-player')){
                socket.emit('spectator_eatenAlly', newID, localStorage.getItem('lobby-room'));
            }

            //render the user
            var profile = document.getElementById('userTurnProfile');
            var indicator = document.getElementById('userTurnIndicator');

            if(profile && indicator){
                profile.src = '/Profile/' + global_opponent_profile;
                indicator.innerText = global_opponent_username + ' turn';
            }
        }
    }
});

//for updating player's turn
socket.on('checker-player-turn', (turn) =>{
    let turnIndicator = turn === 'yes' ? 'no' : 'yes';

    var profile = document.getElementById('userTurnProfile');
    var indicator = document.getElementById('userTurnIndicator');

    if(localStorage.getItem('host') || localStorage.getItem('invited-player')){
        if(turnIndicator == 'no'){
            if(profile){
                profile.src = '/Profile/' + global_opponent_profile;
            }
            if(indicator){
                indicator.innerText = global_opponent_username + ' turn';
            }
        }
        else{
            if(profile){
                profile.src = '/Profile/' + global_profile;
            }
            if(indicator){
                indicator.innerText = global_username + ' turn';
            }
        }
        const encryptUser = ()=>{
            return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(turnIndicator), 'turnIndicator').toString();
        }
        localStorage.setItem('turnIndicator', encryptUser());
    }

    if(localStorage.getItem('invited-player')){
        let room = CryptoJS.AES.decrypt(localStorage.getItem('lobby-room'), 'lobby-room').toString(CryptoJS.enc.Utf8);

        if(room){
            socket.emit('spectator_turnIndicator', localStorage.getItem('turnIndicator'), room, turn === 'yes' ? global_opponent_username : global_username, turn === 'yes' ? global_opponent_profile : global_profile);
        }
    }
});

//for player that surrendered
socket.on('checker-player-surrender', async (user)=>{
    //add the history data
    const getHost = ()=>{
        if(localStorage.getItem('host')){
            let host = CryptoJS.AES.decrypt(localStorage.getItem('host'), 'host').toString(CryptoJS.enc.Utf8);

            if(host){
                return host;
            }
            else{
               return undefined;
            }
        }
    }

    const getInvited = ()=>{
        if(localStorage.getItem('invited-player')){
            let invited = CryptoJS.AES.decrypt(localStorage.getItem('invited-player'), 'invited-player').toString(CryptoJS.enc.Utf8);

            if(invited){
                return invited;
            }
            else{
                window.location.href = '/Modified_saved/GameTerminated';
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
        else{
            window.location.href = '/Modified_saved/GameTerminated';
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

    if(localStorage.getItem('host') || localStorage.getItem('invited-player')){
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
                    win_status: 'win',
                    trophy: global_trophy
                })
            });

            const addHistory_data = await addHistory.json();

            if(addHistory_data.message === 'success'){
                modalStatus('surrenderNotifModal', 'surrenderNotifContainer', 'flex', 'modal_animation');
                document.getElementById('surrenderNotif-text-display').innerText = user + ' surrendered';
                document.getElementById('win-status').innerText = 'You win';
                document.getElementById('win-status').style.color = 'green';
                document.getElementById('win-status-time-display').innerText = 'Time Remaining: ' + getTimer();

                if(addHistory_data.status === 'Match'){
                    document.getElementById('win-status-trophy').innerText = 'Trophy now: ' + addHistory_data.trophy;
                    document.getElementById('win-status-trophy').style.color = 'green';
                }
                else{
                    document.getElementById('win-status-trophy').innerText = 'You cannot earn or decrease trophy in custom mode';
                }
            }

        } catch (err){
            console.log(err);
        }
    }

    if(localStorage.getItem('spectator')){
        modalStatus('surrenderNotifModal', 'surrenderNotifContainer', 'flex', 'modal_animation');
        document.getElementById('surrenderNotif-text-display').innerText = user + ' surrendered';
        document.getElementById('win-status-time-display').innerText = 'Time Remaining: ' + getTimer();
    }
});

//for player surrender via manually going into dashboard
socket.on('player_surrender', async (username)=>{
    async function opponent_data_history(){
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
            else{
                window.location.href = '/Modified_saved/GameTerminated';
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
                    username: global_opponent_username,
                    opponent: global_username, 
                    lobbyType: getLobbyType(), 
                    time: getTimer(), 
                    win_status: 'lose',
                    trophy: global_opponent_trophy
                })
            });

            const addHistory_data = await addHistory.json();

            if(addHistory_data.message !== 'success'){
                console.log('failed to add');
            }

        } catch (err){
            console.log(err);
        }
    }

    //add the history data
    const getHost = ()=>{
        if(localStorage.getItem('host')){
            let host = CryptoJS.AES.decrypt(localStorage.getItem('host'), 'host').toString(CryptoJS.enc.Utf8);

            if(host){
                return host;
            }
            else{
               return undefined;
            }
        }
    }

    const getInvited = ()=>{
        if(localStorage.getItem('invited-player')){
            let invited = CryptoJS.AES.decrypt(localStorage.getItem('invited-player'), 'invited-player').toString(CryptoJS.enc.Utf8);

            if(invited){
                return invited;
            }
            else{
                window.location.href = '/Modified_saved/GameTerminated';
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
        else{
            window.location.href = '/Modified_saved/GameTerminated';
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

    if(localStorage.getItem('host') || localStorage.getItem('invited-player')){
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
                    win_status: 'win',
                    trophy: global_trophy
                })
            });

            const addHistory_data = await addHistory.json();

            if(addHistory_data.message === 'success'){
                opponent_data_history();
                modalStatus('surrenderNotifModal', 'surrenderNotifContainer', 'flex', 'modal_animation');
                document.getElementById('surrenderNotif-text-display').innerText = username + ' surrendered';
                document.getElementById('win-status').innerText = 'You win';
                document.getElementById('win-status').style.color = 'green';
                document.getElementById('win-status-time-display').innerText = 'Time Remaining: ' + getTimer();

                if(addHistory_data.status === 'Match'){
                    document.getElementById('win-status-trophy').innerText = 'Trophy now: ' + addHistory_data.trophy;
                    document.getElementById('win-status-trophy').style.color = 'green';
                }
                else{
                    document.getElementById('win-status-trophy').innerText = 'You cannot earn or decrease trophy in custom mode';
                }
            }

        } catch (err){
            console.log(err);
        }
    }

    if(localStorage.getItem('spectator')){
        modalStatus('surrenderNotifModal', 'surrenderNotifContainer', 'flex', 'modal_animation');
        document.getElementById('surrenderNotif-text-display').innerText = username + ' surrendered';
        document.getElementById('win-status-time-display').innerText = 'Time Remaining: ' + getTimer();
    }
});

//for player that lose
socket.on('win-status', async (username, winStatus)=>{
    //add the history data
    const getHost = ()=>{
        if(localStorage.getItem('host')){
            let host = CryptoJS.AES.decrypt(localStorage.getItem('host'), 'host').toString(CryptoJS.enc.Utf8);

            if(host){
                return host;
            }
            else{
                return undefined;
            }
        }
    }

    const getInvited = ()=>{
        if(localStorage.getItem('invited-player')){
            let invited = CryptoJS.AES.decrypt(localStorage.getItem('invited-player'), 'invited-player').toString(CryptoJS.enc.Utf8);

            if(invited){
                return invited;
            }
            else{
                window.location.href = '/Modified_saved/GameTerminated';
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
        else{
            window.location.href = '/Modified_saved/GameTerminated';
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

    if(localStorage.getItem('host') || localStorage.getItem('invited-player')){
        try{
            const addHistory = await fetch('/history/addHistory', {
                method: "POST",
                headers: {
                    "Accept": "Application/json",
                    "Content-Type": "Application/json"
                },
                body: JSON.stringify({
                    username: username,
                    opponent: getHost() !== undefined ? getHost() : getInvited(), 
                    lobbyType: getLobbyType(), 
                    time: getTimer(), 
                    win_status: winStatus === 'win' ? 'lose' : 'win',
                    trophy: global_trophy
                })
            });

            const addHistory_data = await addHistory.json();

            if(addHistory_data.message === 'success'){
                document.getElementById('win_lose-text-display').innerText = winStatus === 'win' ? username + ' lose' : username + ' win';
                document.getElementById('win_lose-text-display').style.color = winStatus === 'win' ? 'red' : 'green';
                document.getElementById('win_lose-time-display').innerText = 'Time Remaining: ' + getTimer();

                if(addHistory_data.status === 'Match'){
                    document.getElementById('win_lose-time-trophy').innerText = 'Trophy now: ' + addHistory_data.trophy;
                    document.getElementById('win_lose-time-trophy').style.color = winStatus === 'win' ? 'red' : 'green';
                }
                else{
                    document.getElementById('win_lose-time-trophy').innerText = 'You cannot earn or decrease trophy in custom mode';
                }
                modalStatus('win_loseNotifModal', 'win_loseNotifContainer', 'flex', 'modal_animation');
            }

        } catch (err){
            console.log(err);
        }
    }

    if(localStorage.getItem('spectator')){
        document.getElementById('win_lose-text-display').innerText = username + ' ' + winStatus;
        document.getElementById('win_lose-text-display').style.color = 'black';
        document.getElementById('win_lose-time-display').innerText = 'Time Remaining: ' + getTimer();

        modalStatus('win_loseNotifModal', 'win_loseNotifContainer', 'flex', 'modal_animation');
    }
});