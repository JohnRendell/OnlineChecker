const express = require('express');
const router = express.Router();
const path = require('path');
const CryptoJS = require('crypto-js');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const sanitize = require('sanitize-html');
const accountModel = require('./accountModel');
const { hostname } = require('os');

//middle ware for cookies
require('dotenv').config({path: path.resolve(__dirname, '../keys.env')});
let secretKey = process.env.TOKEN_KEY;

//middleware cookie
router.use(cookieParser(process.env.COOKIE_KEY));
const verifyToken = (req, res, next) => {
    const token = req.signedCookies.token; // Get the signed token from cookies
    const username = req.signedCookies.username; // Get the signed username from cookies

    // Check if token and username exists
    if (!token && !username) {
        return res.status(403).redirect('/noCookiesSet');
    }

    // Verify the token with the secret key, and check if the username cookies is existed
    function revertSlash(replacedString, originalChar) {
        return replacedString.replace(new RegExp(originalChar, 'g'), '/');
    }

    //check for decryption
    const decrypt_user = CryptoJS.AES.decrypt(revertSlash(req.params.username, '_'), 'username').toString(CryptoJS.enc.Utf8);

    if(decrypt_user && username){
        jwt.verify(token, secretKey, (err) => {
            if (err) {
                console.error('Token verification failed:', err);
                return res.status(403).redirect('/verificationFailed');
            }
            next(); // Proceed
        });
    }
};

//for custom game
router.get('/Custom-mode/:username', verifyToken, async (req, res)=>{
    res.status(200).sendFile(path.join(__dirname,'../Checker/checker.html'));
});

//for match game
router.get('/Match-mode/:username', verifyToken, async (req, res)=>{
    res.status(200).sendFile(path.join(__dirname,'../Checker/checker.html'));
});

router.get('/Match-mode-guest/:username', verifyToken, async (req, res)=>{
    res.status(200).sendFile(path.join(__dirname,'../Checker/checker.html'));
});

//for getting opponent data
router.post('/getOpponentData', async (req, res)=>{
    let username = sanitize(req.body.username);

    if(username.startsWith('guest')){
        res.status(200).json({ message: 'success', username: username, profile: 'defaultProfile.png', trophy: 'Guest-Mode' });
    }
    else{
        try{
            const findUser = await accountModel.findOne({ username: username });

            if(findUser){
                res.status(200).json({ message: 'success', username: findUser.username, profile: findUser.profile, trophy: findUser.trophy });
            }
            else{
                res.redirect('/InvalidLobby');
            }
        }
        catch(err){
            console.log(err);
        }
    }
});

router.post('/getPlayerData', async (req, res)=>{
    const playerHost = req.body.playerHost;
    const playerInvited = req.body.playerInvited;

    try{
        const findHost = await accountModel.findOne({ username: playerHost });
        const findInvited = await accountModel.findOne({ username: playerInvited });

        if(findHost && findInvited){
            res.status(200).json({ message: 'success', hostName: findHost.username, hostTrophy: findHost.trophy, hostProfile: findHost.profile, invitedName: findInvited.username, invitedTrophy: findInvited.trophy, invitedProfile: findInvited.profile });
        }
    }
    catch(err){
        console.log(err);
    }
});

module.exports = router;