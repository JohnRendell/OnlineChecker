const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');

require('dotenv').config({path: path.resolve(__dirname, '../keys.env')});
let secretKey = process.env.TOKEN_KEY;

router.use(cookieParser(process.env.COOKIE_KEY));
router.post('/', (req, res)=>{
    const { username } = req.body;

    //set the token only for the logged in
    const token = jwt.sign({ username: username }, secretKey, { expiresIn: '1h' });

    //set the cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        signed: true,
        maxAge: 3600000
    });

    res.status(200).json({ message: 'success' });
});

module.exports = router;