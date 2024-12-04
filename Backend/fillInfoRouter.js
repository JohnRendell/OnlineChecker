const express = require('express');
const accountModel = require('./accountModel');
const router = express.Router();
const cookieParser = require('cookie-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const friendModel = require('./friendModel');

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

router.post('/', verifyToken, async (req, res)=>{
    try{
        const { guaranteedAccess } = req.body;
        const cookie_username = req.signedCookies.username;
        const findUser = await accountModel.findOne({ username: cookie_username });

        if(guaranteedAccess){
            if(cookie_username.startsWith('guest')){
                res.status(200).json({ message: 'guest_mode', username: cookie_username, profile: 'defaultProfile.png' });
            }

            //if the user is logged in
            if(findUser){
                let username = findUser.username;
                let profile = findUser.profile;
                let trophy = findUser.trophy;

                try{
                    const checkRequestList = await friendModel.findOne({ username: username });

                    if(checkRequestList){
                        res.status(200).json({ message: 'success', username: username, profile: profile, trophy: trophy, requestCount: checkRequestList.request.length });
                    }
                }
                catch(err){
                    console.log(err)
                }
            }
        }
        else{
            res.status.redirect('/InvalidUser');
        }
    }
    catch(err){
        console.log(err);
    }
});

module.exports = router;