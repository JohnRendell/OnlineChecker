const express = require('express');
const router = express.Router();
const historyModel = require('./historyModel');
const sanitize = require('sanitize-html');
const accountModel = require('./accountModel');

router.post('/addHistory', async (req, res)=>{
    const username = sanitize(req.body.username);
    const opponent = sanitize(req.body.opponent);
    const time = sanitize(req.body.time);
    const lobbyType = sanitize(req.body.lobbyType);
    const win_status = sanitize(req.body.win_status);
    const trophy = sanitize(req.body.trophy);

    if(username){
        try{
            //format date as MM/DD/YYYY
            const formatDate = (date) => {
                return date.toLocaleDateString('en-US', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    year: 'numeric' 
                });
            };

            //date today
            const todayDate = ()=>{
                var date = new Date();

                return formatDate(date);
            }

            //validating match, win condition for trophy
            const validateTrophy = ()=>{
                let newTrophy = parseInt(trophy);

                if(lobbyType !== 'Custom-mode'){
                    if(win_status === 'win'){
                        newTrophy += 10;
                    }
                    else{
                        newTrophy -= 10;

                        if(newTrophy < 0){
                            newTrophy = 0;
                        }
                    }
                }
                return newTrophy;
            }

            var data = { opponent: opponent, lobbyType: lobbyType, time: time, win_status: win_status, date: todayDate(), trophy: validateTrophy() };

            if(username.startsWith('guest')){
                res.status(200).json({ message: 'success', status: lobbyType === 'Custom-mode' ? 'Custom' : 'Match', trophy: 'No Trophy in Guest Mode' });
            }
            else{
                const updateTrophy = await accountModel.findOneAndUpdate(
                    { username: username },
                    { $set: { trophy: validateTrophy() } },
                    { new: true }
                )
                const findUser = await historyModel.findOneAndUpdate(
                    { username: username },
                    { $push: { history: data } },
                    { new: true }
                );

                if(findUser && updateTrophy){
                    res.status(200).json({ message: 'success', status: lobbyType === 'Custom-mode' ? 'Custom' : 'Match', trophy: updateTrophy.trophy, win_status: win_status });
                }
                else{
                    console.log('failed to add history')
                }
            }
        }
        catch(err){
            console.log(err);
        }
    }
});

router.post('/displayHistory', async (req, res)=>{
    const username = sanitize(req.body.username);

    if(username){
        try{
            const displayHistory = await historyModel.findOne({ username: username });

            if(displayHistory){
                let history = displayHistory.history;

                res.status(200).json({ message: 'success', history: history, historyCount: history.length });
            }
        }
        catch(err){
            console.log(err);
        }
    }
});

module.exports = router;