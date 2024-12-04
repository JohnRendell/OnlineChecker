const sanitizeHtml = require('sanitize-html');
const CryptoJS = require('crypto-js');

//Active users
const activeUsers = [];

//lobby list
const lobbyList = [];

//temp array for lobby list
let tempArr_lobbyList = [];

module.exports = (server) =>{
    //for connection on socket IO
    server.on('connect', socket =>{
        console.log('connected client on socket ' + socket.id);

        //-----------Global Stuff functionality----------------------------

        //add user to the list
        socket.on('addUser', (username)=>{
            var data = { username: username, socketID: socket.id, status: 'active', lobby: false }
            const checkUser = activeUsers.findIndex(user => username == user['username']);

             if(username && checkUser == -1){
                activeUsers.push(data);
                server.emit('addUser', username);
            }
            else{
                activeUsers[checkUser]['socketID'] = socket.id;
            }
            console.log('list: ');
            console.table(activeUsers);
        });

        //when user going to another lobby or leaving lobby
        socket.on('lobbyStatus', (username, status)=>{
            const checkUser = activeUsers.findIndex(user => username == user['username']);

             if(username && checkUser > -1){
                activeUsers[checkUser]['socketID'] = socket.id;
                activeUsers[checkUser]['lobby'] = status;
            }
        });

        //count user to the list
        socket.on('countUser', ()=>{
            server.emit('countUser', activeUsers.length);
        });

        //for sending/recieving message on global
        socket.on('globalMessage', (message, user, profile)=>{
            const sanitize_message = sanitizeHtml(message);
            const sanitize_user = sanitizeHtml(user);
            const sanitize_profile = sanitizeHtml(profile);

            socket.broadcast.emit('globalMessage', sanitize_message, sanitize_user, sanitize_profile);
        });

        //for sending/recieving message on private
        socket.on('privateMessage', (message, user, profile, receiver)=>{
            const sanitize_message = sanitizeHtml(message);
            const sanitize_user = sanitizeHtml(user);
            const sanitize_profile = sanitizeHtml(profile);

            const findUser = activeUsers.findIndex(user => receiver == user['username']);

            if(findUser > -1){
                let socketID = activeUsers[findUser]['socketID'];
                socket.to(socketID).emit('privateMessage', sanitize_message, sanitize_user, sanitize_profile);
            }
        });

        //badge for private messaging notification
        socket.on('private_notif_message', (idName, receiver, count)=>{
            const findUser = activeUsers.findIndex(user => receiver == user['username']);

            if(findUser > -1){
                let socketID = activeUsers[findUser]['socketID'];
                socket.to(socketID).emit('private_notif_message', idName, count);
            }
        });
        //-----------End of Global Stuff functionality----------------------------

        //-----------Friend Stuff functionality----------------------------

        //for showing if the player is active or not
        socket.on('friend-status', (receiver)=>{
            const findUser = activeUsers.findIndex(user => receiver == user['username']);
            socket.emit('friend-status', findUser > -1 ? 'Active' : 'Inactive');
        });

        //for showing if the player is on lobby or not
        socket.on('friend-on-lobby', (name)=>{
            const findUser = activeUsers.findIndex(user => name == user['username']);

            if(findUser > -1){
                socket.emit('friend-on-lobby', activeUsers[findUser]['lobby'], name);
            }
        });

        //for notifying users
        socket.on('notify-player-request', (player, status, user)=>{
            const findUser = activeUsers.findIndex(user => player == user['username']);

            if(findUser > -1){
                let socketID = activeUsers[findUser]['socketID'];
                socket.to(socketID).emit('notify-player-request', player, status, user);
            }
        });

        //for a user and a player both on visit page
        socket.on('both_request', (player)=>{
            const findUser = activeUsers.findIndex(user => player == user['username']);

            if(findUser > -1){
                let socketID = activeUsers[findUser]['socketID'];
                socket.to(socketID).emit('both_request');
            }
        });

        //for user that accepted
        socket.on('request_accepted', (targetName)=>{
            const findUser = activeUsers.findIndex(user => targetName == user['username']);

            if(findUser > -1){
                let socketID = activeUsers[findUser]['socketID'];
                socket.to(socketID).emit('request_accepted');
            }
        });

        //for user that decline
        socket.on('request_decline', (targetName)=>{
            const findUser = activeUsers.findIndex(user => targetName == user['username']);

            if(findUser > -1){
                let socketID = activeUsers[findUser]['socketID'];
                socket.to(socketID).emit('request_decline');
            }
        });

        //for user that removed
        socket.on('list_removed', (targetName, id, global_username)=>{
            const findUser = activeUsers.findIndex(user => targetName == user['username']);

            if(findUser > -1){
                let socketID = activeUsers[findUser]['socketID'];
                socket.to(socketID).emit('list_removed', id, global_username);
            }
        });

        //for connected users
        socket.on('connected-users', (user)=>{
            server.emit('connected-users', user);
        });

        //for logged out users
        socket.on('logged-out-users', (user)=>{
            server.emit('logged-out-users', user);
        });

        //remove user to the list
        socket.on('removeUser', (username)=>{
            const userIndex = activeUsers.findIndex(user => username == user['username']);

            if(userIndex > -1){
                activeUsers.splice(userIndex, 1);
                server.emit('removeUser', username);
            }

            console.log('updated list: ');
            console.table(activeUsers);
        });

        //-----------End of Friend Stuff functionality----------------------------

        //-----------Custom functionality----------------------------

        //for checking if the player is active
        socket.on('custom-check-user-active-friend', (player, profile)=>{
            const userIndex = activeUsers.findIndex(user => player == user['username']);

            if(userIndex > -1){
                const isLobby = activeUsers[userIndex]['lobby'];

                if(isLobby == false){
                    socket.emit('custom-check-user-active-friend', player, profile);
                }
            }
        });

        //for removing user div real time on the custom lobby invite
        socket.on('custom-div-status-player-remove', (user)=>{
            server.emit('custom-div-status-player-remove', user);
        });

        //for adding user div real time on the custom lobby invite
        socket.on('refresh-custom-div-invite', ()=>{
            server.emit('refresh-custom-div-invite');
        });

        //for inviting user to the custom lobby
        socket.on('invite-custom', (player, global_username, global_profile, room)=>{
            const userIndex = activeUsers.findIndex(user => player == user['username']);

            //check user index
            if(userIndex > -1){
                const socketID = activeUsers[userIndex]['socketID'];
                socket.to(socketID).emit('invite-custom', global_username, global_profile, room);
            }
        });

        //for notifying user when invited is declined in custom
        socket.on('invite-declined', (player, profile, host)=>{
            const userIndex = activeUsers.findIndex(user => host == user['username']);

            if(userIndex > -1){
                const socketID = activeUsers[userIndex]['socketID'];
                socket.to(socketID).emit('invite-declined', player, profile);
            }
        });

        //for notifying user when accepted in custom
        socket.on('invite-accepted', (global_username, global_profile, global_trophy, host)=>{
            const userIndex = activeUsers.findIndex(user => host == user['username']);

            //check first if there is any slot available for room in custom lobby
            let customHostIndex = lobbyList.findIndex(name => host == name['host']);

            //check host index
            if(customHostIndex > -1){
                if(lobbyList[customHostIndex]['invited'] == null){
                    if(userIndex > -1){
                        const socketID = activeUsers[userIndex]['socketID'];
                        socket.to(socketID).emit('invite-accepted', global_username, global_profile, global_trophy);
                    }
                }
            }
        });

        //for notifying player if that player is kicked, redirect to the dashboard
        socket.on('kicked-invited', (invited)=>{
            const userIndex = activeUsers.findIndex(user => invited == user['username']);

            if(userIndex > -1){
                 //find the user to the room in custom lobby
                lobbyList.forEach(data => {
                    if(data['invited'] === invited){
                        data['invited'] = null;
                    }
                });

                const socketID = activeUsers[userIndex]['socketID'];
                socket.to(socketID).emit('kicked-invited');
            }
        });

        //for notify when player left the lobby in custom
        socket.on('user-leave-custom-lobby', (status, room)=>{
            socket.to(room).emit('user-leave-custom-lobby', status);
            const lobbyIndex = lobbyList.findIndex(lobby => room == lobby['lobbyName']);

            if(lobbyIndex > -1){
                if(status === 'invited'){
                    lobbyList[lobbyIndex]['invited'] = null;
                }
            }
        });

        //notify user when press ready
        socket.on('custom-player-ready', (player, readyStatus, user)=>{
            const userIndex = activeUsers.findIndex(user => player == user['username']);

            if(userIndex > -1){
                const socketID = activeUsers[userIndex]['socketID'];
                socket.to(socketID).emit('custom-player-ready', user, readyStatus);
            }
        });

        //for players that now in a custom lobby
        socket.on('custom-lobby-room-join', (host, player, status)=>{
            let hostName;
            switch(status){
                case 'Host':
                    hostName = CryptoJS.AES.decrypt(host, 'username').toString(CryptoJS.enc.Utf8);

                    if(hostName){
                        let customHostIndex = lobbyList.findIndex(name => hostName == name['host']);
                        
                        //generate room for host
                        function generateRoomID(length) {
                            let result = '';
                            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                            const charactersLength = characters.length;
                            let counter = 0;
                            while (counter < length) {
                            result += characters.charAt(Math.floor(Math.random() * charactersLength));
                            counter += 1;
                            }
                            return result;
                        }
                        let customLobbyName = 'Custom_Room_' + generateRoomID(5);
                        var data = { host: hostName, invited: null, lobbyName: customLobbyName, lobbyType: 'Custom' };

                        //check host index
                        if(customHostIndex == -1){
                            lobbyList.push(data);
                        }

                        socket.emit('custom-lobby-room', data.lobbyName);
                    }
                    break;

                case "Invited":
                    hostName = CryptoJS.AES.decrypt(host, 'host').toString(CryptoJS.enc.Utf8);
                    let playerName = CryptoJS.AES.decrypt(player, 'username').toString(CryptoJS.enc.Utf8);

                    if(hostName && playerName){
                        let customHostIndex = lobbyList.findIndex(name => hostName == name['host']);

                        //check host index
                        if(customHostIndex > -1){
                            if(lobbyList[customHostIndex]['invited'] == null){
                                lobbyList[customHostIndex]['invited'] = playerName;
                            }
                        }
                    }
                    break;
            }
            console.log('lobby:');
            console.table(lobbyList);
        });

        //for joining and leaving users on a room
        socket.on('room-status', (room, status)=>{
            switch(status){
                case "join":
                    socket.join(room);
                    break;

                case "leave":
                    socket.leave(room);
                    break;
            }
        });

        //for checking if the room in custom is full or not
        socket.on('custom-lobby-room-checker', (room, username)=>{
            let customRoomIndex = lobbyList.findIndex(lobby => room == lobby['lobbyName']);

            if(customRoomIndex > -1){
                if(lobbyList[customRoomIndex]['host'] !== username){
                    if(lobbyList[customRoomIndex]['invited'] !== username){
                        socket.emit('custom-lobby-room-checker', room);
                    }
                }
            }
            else{
                console.log('cant find index')
            }
        });

        //this is for custom lobby messaging
        socket.on('custom-lobby-room-message', (message, user, profile, receiver, room)=>{
            const sanitize_message = sanitizeHtml(message);
            const sanitize_user = sanitizeHtml(user);
            const sanitize_profile = sanitizeHtml(profile);

            const findUser = activeUsers.findIndex(user => receiver == user['username']);

            if(findUser > -1){
                socket.to(room).emit('custom-lobby-room-message', sanitize_message, sanitize_user, sanitize_profile);
            }
        });

        //for starting the custom game
        socket.on('game-custom-start', (player)=>{
            const lobbyIndex = lobbyList.findIndex(lobby => player == lobby['host'] || player == lobby['invited']);
            if(lobbyIndex > -1){
                lobbyList.splice(lobbyIndex, 1);
            }

            const findUser = activeUsers.findIndex(user => player == user['username']);
            if(findUser > -1){
                let socketID = activeUsers[findUser]['socketID'];
                socket.to(socketID).emit('game-custom-start');
            }
        });

        //-----------End of Custom functionality----------------------------

        //-----------Player vs Player functionality----------------------------
        socket.on('findMatch_player', async (username)=>{
             //generate room for host
            function generateRoomID(length) {
                let result = '';
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                const charactersLength = characters.length;
                let counter = 0;
                while (counter < length) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
                counter += 1;
                }
                return result;
            }
            let matchLobby = 'Match_Room_' + generateRoomID(5);

            if(tempArr_lobbyList.length == 0){
                tempArr_lobbyList.push(username);
                
                var data = { host: username, invited: null, lobbyName: matchLobby, lobbyType: 'Match' };

                const lobbyIndex = lobbyList.findIndex(lobby => username == lobby['host']);

                if(lobbyIndex > -1){
                    lobbyList[lobbyIndex]['invited'] = null;
                    lobbyList[lobbyIndex]['lobbyName'] = data.lobbyName;
                    lobbyList[lobbyIndex]['lobbyType'] = data.lobbyType;
                }
                else{
                    lobbyList.push(data);
                }
                socket.emit('findMatch_player', data.lobbyName);
            }
            
            if(tempArr_lobbyList.length > 0){
                tempArr_lobbyList.push(username);
                
                lobbyList.forEach((lobby)=>{
                    let host = lobby['host'];
                    let invited = lobby['invited'];

                    //for player
                    if(host !== null && host !== username && !host.startsWith('guest') && !username.startsWith('guest') && invited === null && lobby['lobbyType'] === 'Match'){
                        lobby['invited'] = username;
                        socket.emit('findMatch_player', lobby['lobbyName']);
                            
                        if(lobby['lobbyType'] === 'Match'){
                            socket.emit('match_start_host', host, username, lobby['lobbyName']);
                        }
                    }

                    //for guest
                    if(host !== null && host !== username && host.startsWith('guest') && username.startsWith('guest') && invited === null && lobby['lobbyType'] === 'Match'){
                        lobby['invited'] = username;
                        socket.emit('findMatch_player', lobby['lobbyName']);
                            
                        if(lobby['lobbyType'] === 'Match'){
                            socket.emit('match_start_host_guest', host, username, lobby['lobbyName']);
                        }
                    }
                });
            }
            
            console.log('Match Lobby');
            console.table(lobbyList);
        });

        //for canceling removing any lobby at dashboard
        socket.on('clear_lobby', (username)=>{
            const lobbyIndex = lobbyList.findIndex(lobby => username == lobby['host']);

            if(lobbyIndex > -1){
                lobbyList.splice(lobbyIndex, 1);
            }
            tempArr_lobbyList = [];

            console.log('updated lobby');
            console.table(lobbyList);
        });

        //for canceling match on player vs player
        socket.on('cancel_findMatch_player', (username)=>{
            const lobbyIndex = lobbyList.findIndex(lobby => username == lobby['host']);

            if(lobbyIndex > -1){
                lobbyList.splice(lobbyIndex, 1);
            }
            tempArr_lobbyList = [];

            console.log('updated lobby');
            console.table(lobbyList);
        });

        //for starting game match in player
        socket.on('match_start_host', (host, invited, room)=>{
            const lobbyIndex = lobbyList.findIndex(lobby => room == lobby['lobbyName']);

            if(lobbyIndex > -1){
                lobbyList.splice(lobbyIndex, 1);
            }
            socket.emit('match_start_host', host, invited);
        });

        socket.on('match_start_invited', (host, invited)=>{
            const opponentIndex = activeUsers.findIndex(user => host == user['username']);

            if(opponentIndex > -1){
                let socketID = activeUsers[opponentIndex]['socketID'];
                socket.to(socketID).emit('match_start_invited', invited);
            }
        });

        //for starting game match in host
        socket.on('match_start_host_guest', (host, invited, room)=>{
            const lobbyIndex = lobbyList.findIndex(lobby => room == lobby['lobbyName']);

            if(lobbyIndex > -1){
                lobbyList.splice(lobbyIndex, 1);
            }
            socket.emit('match_start_host_guest', host, invited);
        });

        socket.on('match_start_invited_guest', (host, invited)=>{
            const opponentIndex = activeUsers.findIndex(user => host == user['username']);

            if(opponentIndex > -1){
                let socketID = activeUsers[opponentIndex]['socketID'];
                socket.to(socketID).emit('match_start_invited_guest', invited);
            }
        });
    });
};
