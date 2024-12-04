const express = require('express');
const router = express.Router();
const friendModel = require('./friendModel');
const accountModel = require('./accountModel');
const sanitize = require('sanitize-html');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const CryptoJS = require('crypto-js');

dotenv.config({ path: path.resolve(__dirname, '../keys.env') });
router.use(cookieParser(process.env.COOKIE_KEY));
router.post('/', async (req, res)=>{
    const { username } = req.body;

    try{
        const findUser = await friendModel.findOne({ username: username });

        if(findUser){
            res.status(200).json({ message: 'success', list: findUser.list, count: findUser.list.length });
        }
    }
    catch(err){
        console.log(err);
    }
});

//for find friend list
router.post('/displayPlayers', async (req, res)=>{
    const { username } = req.body;
    try{
        const displayAcc = await accountModel.find({ username: { $ne: username }});

        if(displayAcc && displayAcc.length > 0){
            //add the users to the array
            const users = displayAcc.map(user =>({ 
                username: user.username, 
                profile: user.profile 
            }));
            res.status(200).json({ message: 'success', list: users });
        }
    }
    catch(err){
        console.log(err);
    }
});

//for request and friend list request
router.post('/displayFriend', async (req, res)=>{
    const { username } = req.body;
    try{
        const findUser = await friendModel.findOne({ username: username });
        
        if(findUser){
            const displayRequest = await accountModel.find({ username: { $in: findUser.request }});
            const displayFriendList = await accountModel.find({ username: { $in: findUser.list }});

            //get the arrays
            const userReq = displayRequest.map(user =>({ 
                username: user.username, 
                profile: user.profile 
            }));

            const userFriend = displayFriendList.map(user =>({ 
                username: user.username, 
                profile: user.profile 
            }));
            
            res.status(200).json({ message: 'success', requestList: userReq, friendList: userFriend, requestCount: findUser.request.length });
        }
    }
    catch(err){
        console.log(err);
    }
});

//add, remove and checking request list
router.post('/request', async (req, res)=>{
    const username = sanitize(req.body.username);
    const playerName = sanitize(req.body.playerName);
    const status = req.body.status;

    try{
        const findUser = await friendModel.findOne({ username: playerName });
        
        if(findUser){
            switch(status){
                case 'Add Friend':
                    const addRequest = await friendModel.findOneAndUpdate(
                        { username: findUser.username},
                        { $addToSet: { request: username }},
                        { new: true }
                    )

                    if(addRequest){
                        res.status(200).json({ message: 'success', player: username });
                    }
                break;

                case 'Cancel':
                    const removeRequest = await friendModel.findOneAndUpdate(
                        { username: findUser.username},
                        { $pull: { request: username }},
                        { new: true }
                    )

                    if(removeRequest){
                        res.status(200).json({ message: 'success', player: username });
                    }
                break;
            }
        }
    }
    catch(err){
        console.log(err);
    }
});

//for checking request, if a user already add this player
router.post('/checkUserRequest', async (req, res)=>{
    const username = sanitize(req.body.username);
    const playerName = sanitize(req.body.playerName);

    try{
        const displayRequest = await friendModel.findOne(
            {
                username: playerName,
                request: username
            }
        );

        const displayList = await friendModel.findOne(
            {
                username: playerName,
                list: username
            }
        );

        if(displayRequest){
            res.status(200).json({ status: 'pending' });
        }
        else if(displayList){
            res.status(200).json({ status: 'friend' });
        }
        else{
            res.status(200).json({ status: 'not yet' });
        }
    }
    catch(err){
        console.log(err);
    }
});

//for removing player to user's request, if user decline the request
router.post('/declineUserRequest', async (req, res)=>{
    const username = sanitize(req.body.username);
    const targetPlayer = sanitize(req.body.targetPlayer);

    try{
        const removeRequest = await friendModel.findOneAndUpdate(
            { username: username},
            { $pull: { request: targetPlayer }},
            { new: true }
        )

        if(removeRequest){
            res.status(200).json({ message: 'success' });
        }
    }
    catch(err){
        console.log(err);
    }
});

//for adding player to user's list, if user add to the list
router.post('/addUserRequest', async (req, res)=>{
    const username = sanitize(req.body.username);
    const targetPlayer = sanitize(req.body.targetPlayer);

    try{
        const addRequest = await friendModel.findOneAndUpdate(
            { username: username},
            { 
                $addToSet: { list: targetPlayer },
                $pull: { request: targetPlayer }
            },
            { $new: true }
        )
        const addRequest_player = await friendModel.findOneAndUpdate(
            { username: targetPlayer},
            { $addToSet: { list: username } },
            { $new: true }
        )

        if(addRequest && addRequest_player){
            res.status(200).json({ message: 'success' });
        }
    }
    catch(err){
        console.log(err);
    }
});

//for removing player to user's list, if user remove to the list
router.post('/removeUserToList', async (req, res)=>{
    const username = sanitize(req.body.username);
    const targetPlayer = sanitize(req.body.targetPlayer);

    try{
        const removeListUser = await friendModel.findOneAndUpdate(
            { username: username},
            { $pull: { list: targetPlayer } },
            { $new: true }
        )
        const removeListUser_player = await friendModel.findOneAndUpdate(
            { username: targetPlayer},
            { $pull: { list: username } },
            { $new: true }
        )

        if(removeListUser && removeListUser_player){
            res.status(200).json({ message: 'success' });
        }
    }
    catch(err){
        console.log(err);
    }
});

//for updating user, counting the request
router.post('/countUserRequest', async (req, res)=>{
    const playerName = sanitize(req.body.playerName);

    try{
        const findUser = await friendModel.findOne({ username: playerName });

        if(findUser){
            res.status(200).json({ message: 'success', count: findUser.request.length });
        }
    }
    catch(err){
        console.log(err);
    }
});

//for searching player on friend list
router.post('/searchFriendList', async (req, res)=>{
    const playerName = sanitize(req.body.username);
    const searchQuery = sanitize(req.body.searchQuery);

    if(playerName === searchQuery){
        res.status(200).json({ message: searchQuery + ' is you.' });
    }
    else{
        try{
            const findUser = await friendModel.findOne({ username: playerName });

            if(findUser){
                const displayFriendList = findUser.list;

                if(displayFriendList.includes(searchQuery)){
                    try{
                        const getData = await accountModel.findOne({ username: searchQuery });

                        if(getData){
                            res.status(200).json({ message: 'success', username: getData.username, profile: getData.profile });
                        }
                        else{
                            res.status(200).json({ message: searchQuery + ' not found' });
                        }
                    }
                    catch(err){
                        console.log(err);
                    }
                }
                else{
                    res.status(200).json({ message: searchQuery + ' not found' });
                }
            }
        }
        catch(err){
            console.log(err);
        }
    }
});

//for searching player on find friend
router.post('/searchFindFriend', async (req, res)=>{
    const searchQuery = sanitize(req.body.searchQuery);
    const cookieUser =  req.signedCookies.username;

    if(cookieUser){
        if(cookieUser === searchQuery){
            res.status(200).json({ message: searchQuery + ' is you' });
        }
        else{
            try{
                const findUser = await accountModel.findOne({ username: searchQuery });

                if(findUser){
                    res.status(200).json({ message: 'success', username: findUser.username, profile: findUser.profile });
                }
                else{
                    res.status(200).json({ message: searchQuery + ' not found' });
                }
            }
            catch(err){
                console.log(err);
            }
        }
    }
});

//if both user is on the visit page and both add at the same time
router.post('/addOnVisitPage', async (req, res)=>{
    const username = sanitize(req.body.username);
    const playerTarget = sanitize(req.body.playerTarget);

    try{
        const userReq = await friendModel.findOne(
            { 
                username: username,
                request: playerTarget 
            }
        );
        const playerReq = await friendModel.findOne(
            { 
                username: playerTarget,
                request: username 
            }
        );

        if(userReq && playerReq){
            const userlist = await friendModel.findOneAndUpdate(
                { username: username },
                { 
                    $pull: { request: playerTarget },
                    $addToSet: { list: playerTarget }
                },
                { new: true }
            );
            const playerlist = await friendModel.findOneAndUpdate(
                { username: playerTarget },
                { 
                    $pull: { request: username },
                    $addToSet: { list: username }
                },
                { new: true }
            );

            if(userlist && playerlist){
                res.status(200).json({ message: 'success' });
            }
        }
    }
    catch(err){
        console.log(err);
    }
});

//this is for inviting players on a custom lobby
router.post('/availableInvite', async (req, res)=>{
    const username = sanitize(req.body.username);

    try{
        const findUser = await friendModel.findOne({ username: username });

        if(findUser){
            const friendAcc = await accountModel.find({ username: { $in: findUser.list }});
            const friendArr = friendAcc.map(player =>({
                username: player.username,
                profile: player.profile
            }));

            if(friendArr.length > 0){
                res.status(200).json({ message: 'success', list: friendArr });
            }
            else{
                res.status(200).json({ message: 'You have no friends yet.' });
            }
        }
    }
    catch(err){
        console.log(err);
    }
})

module.exports = router;