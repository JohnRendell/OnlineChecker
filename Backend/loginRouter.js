const express = require('express');
const router = express.Router();
const bcryptJS = require('bcryptjs');
const accountModel = require('./accountModel');
const CryptoJS = require('crypto-js');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const sanitizeHtml = require('sanitize-html');

require('dotenv').config({path: path.resolve(__dirname, '../keys.env')});
let secretKey = process.env.TOKEN_KEY;

router.use(cookieParser(process.env.COOKIE_KEY));
router.post('/', async (req, res)=>{
    const username = sanitizeHtml(req.body.username);
    const password = sanitizeHtml(req.body.password);

    if(!username || !password){
        res.status(200).json({ message: 'Fields cannot be empty'});
    }
    else{
        try{
            const findUser = await accountModel.findOne({ username: username });

            if(findUser){
                //compare the password
                const comparePass = (rawPass, hash)=>{
                    return bcryptJS.compareSync(rawPass, hash);
                }

                const checkPass = comparePass(password, findUser.password);

                if(checkPass){
                    //set the user status, encrypt the username and the key
                    const encryptUser = ()=>{
                        return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(findUser.username), 'username').toString();
                    }
                    //set the token only for the logged in
                    const token = jwt.sign({ username: findUser.username }, secretKey, { expiresIn: '1h' });

                    //set the cookie
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: true,
                        signed: true,
                        maxAge: 3600000
                    });
                    res.status(200).json({ message: 'success', user: encryptUser(), userID: checkPass.userID })
                }
                else{
                    res.status(200).json({ message: 'Wrong credentials'});
                }
            }
            else{
                res.status(200).json({ message: 'Wrong credentials'});
            }
        }
        catch(err){
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

module.exports = router;