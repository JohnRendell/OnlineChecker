const CryptoJS = require('crypto-js');
const sanitizeHtml = require('sanitize-html');
const lobbyModel = require('./lobbyModel');

module.exports = (server)=>{
    server.on('connect', (socket)=>{
        console.log('connected to the socket checker');

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

        //for sending/recieving message on game lobby
        socket.on('gameMessage', (message, user, profile, room)=>{
            const sanitize_message = sanitizeHtml(message);
            const sanitize_user = sanitizeHtml(user);
            const sanitize_profile = sanitizeHtml(profile);

            let lobby = CryptoJS.AES.decrypt(room, 'lobby-room').toString(CryptoJS.enc.Utf8);
            if(lobby){
                socket.to(lobby).emit('gameMessage', sanitize_message, sanitize_user, sanitize_profile);
            }
        });

        //send the current time to the player
        socket.on('game_time', (minute, sec, room)=>{
            let decrypt_room = CryptoJS.AES.decrypt(room, 'lobby-room').toString(CryptoJS.enc.Utf8);

            if(decrypt_room){
                socket.to(decrypt_room).emit('game_time', minute, sec);
            }
        });

        //for updating the player piece move on other player
        socket.on('checker-player-move', (pieceID, tileID, room)=>{
            socket.to(room).emit('checker-player-move', pieceID, tileID);
        });

        //for updating the player piece got eaten
        socket.on('checker-player-eat-piece', (pieceID, room)=>{
            socket.to(room).emit('checker-player-eat-piece', pieceID);
        });

        //for turning player
        socket.on('checker-player-turn', (turn, room)=>{
            let indicator = CryptoJS.AES.decrypt(turn, 'turnIndicator').toString(CryptoJS.enc.Utf8);

            if(indicator){
                socket.to(room).emit('checker-player-turn', indicator);
            }
        });

        //for player that surrendered
        socket.on('checker-player-surrender', (user, room)=>{
            let lobby = CryptoJS.AES.decrypt(room, 'lobby-room').toString(CryptoJS.enc.Utf8);

            if(lobby){
                socket.to(lobby).emit('checker-player-surrender', user);
            }
        });

        //sending player notification for lose
        socket.on('win-status', (username, room, winStatus)=>{
            let lobby = CryptoJS.AES.decrypt(room, 'lobby-room').toString(CryptoJS.enc.Utf8);

            if(lobby){
                socket.to(lobby).emit('win-status', username, winStatus);
            }
        });

        //for player that surrender via going into dashboard manually
        socket.on('player_surrender', (room, username)=>{
            let lobby = CryptoJS.AES.decrypt(room, 'lobby-room').toString(CryptoJS.enc.Utf8);

            if(lobby){
                socket.to(lobby).emit('player_surrender', username);
            }
        });

        //add current lobby
        socket.on('addLobby', async (lobbyType, lobbyRoom, host, invited)=>{
            try{
                const lobbyIndex = await lobbyModel.findOne({ lobbyRoom: lobbyRoom });

                if(!lobbyIndex){
                    const arrayData = [host, 'yes']
                    const addLobby = await lobbyModel.create({ lobbyType: lobbyType, lobbyRoom: lobbyRoom, host: host, invited: invited, turnIndicator: arrayData, blueTeam: [], redTeam: [] });

                    if(!addLobby){
                        console.log('error adding lobby');
                    }
                }
            }
            catch(err){
                console.log(err);
            }
        });

        //send the current time to the spectators
        socket.on('spectator_time', (minute, sec, room)=>{
            let decrypt_room = CryptoJS.AES.decrypt(room, 'lobby-room').toString(CryptoJS.enc.Utf8);

            if(decrypt_room){
                socket.to(decrypt_room).emit('spectator_time', minute, sec);
            }
        });

        //send the blue move to the spectator
        socket.on('spectator_moveBlue', async (pieceID, tileID, room)=>{
            let decrypt_room = CryptoJS.AES.decrypt(room, 'lobby-room').toString(CryptoJS.enc.Utf8);

            if(decrypt_room){
                try{
                    const updateMoveBlue = await lobbyModel.findOneAndUpdate(
                        { lobbyRoom: decrypt_room },
                        { $addToSet: 
                            { 
                                blueTeam: 
                                { 
                                    pieceID: pieceID, 
                                    tileID: tileID
                                } 
                            } 
                        }
                    );

                    if(updateMoveBlue){
                        socket.to(decrypt_room).emit('spectator_moveBlue', pieceID, tileID);
                    }
                }
                catch(err){
                    console.log(err);
                }
            }
        });

        //send the blue promoted to the spectator
        socket.on('spectator_promoteBlue', async (pieceID, pieceID_Input, room, username)=>{
            let decrypt_room = CryptoJS.AES.decrypt(room, 'lobby-room').toString(CryptoJS.enc.Utf8);

            if(decrypt_room){
                try{
                    const promoteBlue = await lobbyModel.findOneAndUpdate(
                        { lobbyRoom: decrypt_room },
                        { 
                            $addToSet: 
                            {
                                blueTeam:
                                {
                                    promotePiece: pieceID
                                }
                            }
                        }
                    );

                    if(promoteBlue){
                        socket.to(decrypt_room).emit('spectator_promoteBlue', pieceID, pieceID_Input, username);
                    }
                }
                catch(err){
                    console.log(err);
                }
            }
        });

        //send enemy eaten to the spectator
        socket.on('spectator_eatenEnemy', async (pieceID, room)=>{
            let decrypt_room = CryptoJS.AES.decrypt(room, 'lobby-room').toString(CryptoJS.enc.Utf8);

            if(decrypt_room){
                try{
                    const updateEatenEnemy = await lobbyModel.findOneAndUpdate(
                        { lobbyRoom: decrypt_room },
                        { $addToSet: 
                            { 
                                blueTeam: 
                                { 
                                    eaten_piece: pieceID
                                } 
                            } 
                        }
                    )

                    if(updateEatenEnemy){
                        socket.to(decrypt_room).emit('spectator_eatenEnemy', pieceID);
                    }
                }
                catch(err){
                    console.log(err);
                }
            }
        });

        //send the red move to the spectator
        socket.on('spectator_moveRed', async (pieceID, tileID, room)=>{
            let decrypt_room = CryptoJS.AES.decrypt(room, 'lobby-room').toString(CryptoJS.enc.Utf8);

            if(decrypt_room){
                try{
                    const updateMoveRed = await lobbyModel.findOneAndUpdate(
                        { lobbyRoom: decrypt_room },
                        { $addToSet: 
                            { 
                                redTeam: 
                                { 
                                    pieceID: pieceID, 
                                    tileID: tileID
                                } 
                            } 
                        }
                    )

                    if(updateMoveRed){
                        socket.to(decrypt_room).emit('spectator_moveRed', pieceID, tileID);
                    }
                }
                catch(err){
                    console.log(err);
                }
            }
        });

        //send the red promoted to the spectator
        socket.on('spectator_promoteRed', async (pieceID, pieceID_Input, room, username)=>{
            let decrypt_room = CryptoJS.AES.decrypt(room, 'lobby-room').toString(CryptoJS.enc.Utf8);

            if(decrypt_room){
                try{
                    const promoteRed = await lobbyModel.findOneAndUpdate(
                        { lobbyRoom: decrypt_room },
                        { 
                            $addToSet: 
                            {
                                redTeam:
                                {
                                    promotePiece: pieceID
                                }
                            }
                        }
                    );

                    if(promoteRed){
                        socket.to(decrypt_room).emit('spectator_promoteRed', pieceID, pieceID_Input, username);
                    }
                }
                catch(err){
                    console.log(err);
                }
            }
        });

        //send ally eaten to the spectator
        socket.on('spectator_eatenAlly', async (pieceID, room)=>{
            let decrypt_room = CryptoJS.AES.decrypt(room, 'lobby-room').toString(CryptoJS.enc.Utf8);

            if(decrypt_room){
                try{
                    const updateEatenAlly = await lobbyModel.findOneAndUpdate(
                        { lobbyRoom: decrypt_room },
                        { $addToSet: 
                            { 
                                redTeam: 
                                { 
                                    eaten_piece: pieceID
                                } 
                            } 
                        }
                    )
                    
                    if(updateEatenAlly){
                        socket.to(decrypt_room).emit('spectator_eatenAlly', pieceID);
                    }
                } 
                
                catch(err){
                    console.log(err);
                }
            }
        });

        //send the turn indicator to spectator
        socket.on('spectator_turnIndicator', async (turn, room, username, profile)=>{
            let decrypt_turn = CryptoJS.AES.decrypt(turn, 'turnIndicator').toString(CryptoJS.enc.Utf8);

            if(decrypt_turn){
                const arrayData = [username, decrypt_turn];
                try{
                    const updateTurnIndicator = await lobbyModel.findOneAndUpdate(
                        { 
                            $or: [{ host: username }, { invited: username }] 
                        }, 
                        { 
                            $set: { turnIndicator: arrayData } 
                        }
                    );

                    if(updateTurnIndicator){
                        socket.to(room).emit('spectator_turnIndicator', decrypt_turn, username, profile);
                    }
                }
                catch(err){
                    console.log(err);
                }
            }
        });
    });
};