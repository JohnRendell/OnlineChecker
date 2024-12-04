const express = require('express');
const router = express.Router();
const accountModel = require('./accountModel');
const sanitize = require('sanitize-html');

router.post('/', async (req, res)=>{
    const access = req.body.guaranteedAccess;

    if(access){
        try{
            const displayUsers = await accountModel.find({});

            if(displayUsers){
                const sortTrophy = displayUsers.sort((a, b) => parseInt(b.trophy) - parseInt(a.trophy));

                const users = sortTrophy.map((player, index) => ({
                    username: player.username,
                    trophy: player.trophy,
                    rank: index + 1
                }));

                res.status(200).json({ message: 'success', player: users, count: users.length });
            }
        }
        catch(err){
            console.log(err);
        }
    }
    else{
        res.redirect('/invalidPage');
    }
});

//for searching players on leaderboard
router.post('/searchPlayer', async (req, res)=>{
    try{
        const displayUsers = await accountModel.find({});

        if(displayUsers){
            const sortTrophy = displayUsers.sort((a, b) => parseInt(b.trophy) - parseInt(a.trophy));

            const users = sortTrophy.map((player, index) => ({
                username: player.username,
                trophy: player.trophy,
                rank: index + 1
            }));

            const player = users.find(player => sanitize(req.body.username) === player['username']);

            if(player){
                res.status(200).json({ message: 'success', username: player.username, trophy: player.trophy, rank: player.rank });
            }
            else{
                res.status(200).json({ message: sanitize(req.body.username) + ' not found '});
            }
        }
    }
    catch(err){
            console.log(err);
    } 
});

module.exports = router;