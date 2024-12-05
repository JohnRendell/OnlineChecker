const express = require('express');
const router = express.Router();
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const sanitize = require('sanitize-html');
const accountModel = require('./accountModel');

//middle ware for cookies
require('dotenv').config({path: path.resolve(__dirname, '../keys.env')});
let secretKey = process.env.TOKEN_KEY;

//middleware cookie
router.use(cookieParser(process.env.COOKIE_KEY));

const verifyToken = (req, res, next) => {
    const token = req.signedCookies.token; // Get the signed token from cookies
    const username = req.signedCookies.username; // Get the signed username from cookies

    // Check if token and username exists
    if (username) {
        jwt.verify(token, secretKey, (err) => {
            if (err) {
                console.error('Token verification failed:', err);
                return res.status(403).redirect('/verificationFailed');
            }
            next(); // Proceed
        });
    }
    else{
        return res.status(403).redirect('/noCookiesSet');
    }
};

//these two for loading custom lobby
router.get('/Host/:username', verifyToken, async (req, res)=>{
    res.status(200).sendFile(path.join(__dirname,'../Views/customLobby.html'));
});

router.get('/Invited/:username', verifyToken, async (req, res)=>{
    res.status(200).sendFile(path.join(__dirname,'../Views/customLobby.html'));
});

//these are for checking if a user is a host or not
router.post('/status', async (req, res)=>{
    const status = sanitize(req.body.status);
    const username = sanitize(req.body.username);

    if(username){
        try{
            const findUser = await accountModel.findOne({ username: username });

            if(findUser){
                res.status(200).json({ status: status, name: findUser.username, profile: findUser.profile, trophy: findUser.trophy });
            }
        }
        catch(err){
            console.log(err);
        }
    }
});

module.exports = router;