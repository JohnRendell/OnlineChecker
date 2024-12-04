const express = require('express');
const router = express.Router();
const path = require('path');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const accountModel = require('./accountModel');
const sanitizeHtml = require('sanitize-html');

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

    if(req.params.username && username){
        jwt.verify(token, secretKey, (err) => {
            if (err) {
                console.error('Token verification failed:', err);
                return res.status(403).redirect('/verificationFailed');
            }
            next(); // Proceed
        });
    }
};

let isLegit = false;
router.get('/:username', verifyToken, async (req, res)=>{
    try{
        const findUser = await accountModel.findOne({ username: req.params.username });

        if(findUser && isLegit){
            res.status(200).sendFile(path.join(__dirname,'../Views/user-visit-profile.html'));
        }
        else{
            res.status(200).redirect('/invalidLink');
        }
    }
    catch(err){
        console.log(err);
        res.status(200).redirect('/invalidLink');
    }
});

router.post('/', async (req, res)=>{
    const username  = sanitizeHtml(req.body.username);

    if(username){
        isLegit = true;
        res.status(200).json({ message: 'success' });
    }
});

router.post('/playerInfo', async (req, res)=>{
    try{
        const findUser = await accountModel.findOne({ username: sanitizeHtml(req.body.username) });

        if(findUser){
            res.status(200).json({ message: 'success', username: findUser.username, profile: findUser.profile, trophy: findUser.trophy });
        }
    }
    catch(err){
        console.log(err);
    }
})

module.exports = router;