const express = require('express');
const router = express.Router();
const path = require('path');
const CryptoJS = require('crypto-js');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

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

router.get('/:username', verifyToken, async (req, res)=>{
    res.status(200).sendFile(path.join(__dirname,'../Views/dashboard.html'));
});

router.post('/', (req, res)=>{
    function revertSlash(replacedString, originalChar) {
        return replacedString.replace(new RegExp(originalChar, 'g'), '/');
    }
    const { encryptedUser } = req.body;
    const decryptUser = CryptoJS.AES.decrypt(revertSlash(encryptedUser, '_'), 'username').toString(CryptoJS.enc.Utf8);

    if(decryptUser){
        res.status(200).json({ message: 'success' });
    }
});

module.exports = router;