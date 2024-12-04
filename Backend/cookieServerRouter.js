const express = require('express');
const router = express.Router();
const cookieParser = require('cookie-parser');

//middle ware for cookies
require('dotenv').config({path: require('path').resolve(__dirname, '../keys.env')});
router.use(cookieParser(process.env.COOKIE_KEY));

router.post('/setCookie', (req, res)=>{
    const { username } = req.body;

    if(!username || username !== null){
        res.cookie('username', username, {
            httpOnly: true,
            secure: true,
            signed: true,
            maxAge: 3600000,
            sameSite: 'strict'
        });

        res.status(200).json({ message: 'success' });
    }
});

router.get('/getCookie', async (req, res)=>{
    let getCookie = req.signedCookies.username;

    if(getCookie){
        res.status(200).json({ status: 'success', cookieValue: getCookie });
    }
});

router.get('/deleteCookie', (req, res)=>{
    // Clear the 'username' cookie
    res.clearCookie('username', {
        httpOnly: true, 
        secure: true, 
        signed: true
    });

    // Clear the 'token' cookie
    res.clearCookie('token', {
        httpOnly: true, 
        secure: true, 
        signed: true
    });

    // Send a response indicating the cookies have been cleared
    res.status(200).send('Cookies have been cleared.');
})

module.exports = router;