const express = require('express');
const router = express.Router();
const lobbyModel = require('./lobbyModel');
const accountModel = require('./accountModel');

//display lobby
router.post('/', async (req, res)=>{
    const access = req.body.guaranteedAccess;
    if(access){
        try{
            const displayLobby = await lobbyModel.find({ });

            if(displayLobby){
                const lobby = displayLobby.map(room =>({
                    lobbyType: room.lobbyType,
                    lobbyRoom: room.lobbyRoom,
                    host: room.host,
                    invited: room.invited
                }));

                if(lobby.length > 0){
                    res.status(200).json({ message: 'success', lobby: lobby, lobbyCount: lobby.length });
                }
                else{
                    res.status(200).json({ message: 'No lobby available, reload the page or click the watch live button to refresh.' });
                }
            }
        }
        catch(err){
            console.log(err);
        }
    }
});

//get lobby data
router.post('/lobbyData', async (req, res)=>{
    try{
        const lobbyData = await lobbyModel.findOne({ lobbyRoom: req.body.lobbyRoom });

        if(lobbyData){
            let player = lobbyData.turnIndicator[0];

            const findPlayer = await accountModel.findOne({ username: player });
            let blueTeam = lobbyData.blueTeam;
            let redTeam = lobbyData.redTeam;

            const blueTeamMap = blueTeam.map(ally =>({
                pieceID: ally.pieceID,
                tileID: ally.tileID,
                eaten_piece: ally.eaten_piece,
                promotePiece: ally.promotePiece
            }));

            const redTeamMap = redTeam.map(enemy =>({
                pieceID: enemy.pieceID,
                tileID: enemy.tileID,
                eaten_piece: enemy.eaten_piece,
                promotePiece: enemy.promotePiece
            }));

            if(findPlayer){
                res.status(200).json({ message: 'success', turnIndicator: lobbyData.turnIndicator, playerName: findPlayer.username, playerProfile: findPlayer.profile, blueTeamPos: blueTeamMap, redTeamPos: redTeamMap });
            }
        }
    }
    catch(err){
        console.log(err);
    }
});

//delete lobby
router.post('/deleteLobby', async (req, res)=>{
    const username = req.body.username;

    try{
        const deleteLobby = await lobbyModel.findOneAndDelete({
            $or: [
                { host: username },
                { invited: username }
            ]
        });

        if(deleteLobby){
            res.status(200).json({ message: 'success' });
        }
    }
    catch(err){
        console.log(err);
    }
});

module.exports = router;