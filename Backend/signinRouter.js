const express = require('express');
const router = express.Router();
const path = require('path');
const bcryptJS = require('bcryptjs');
const accountModel = require('./accountModel');
const friendModel = require('./friendModel');
const historyModel = require('./historyModel');
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const sanitizeHtml = require('sanitize-html');

require('dotenv').config({path: path.resolve(__dirname, '../keys.env')});
let secretKey = process.env.TOKEN_KEY;

router.use(cookieParser(process.env.COOKIE_KEY));
router.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, '../Public/signin.html'))
});

//for making account
function hashPass(password){
    var salt = bcryptJS.genSaltSync(10);
    return bcryptJS.hashSync(password, salt);
}

router.post('/validateNewAcc', async (req, res)=>{
    const username = sanitizeHtml(req.body.username);
    const password = sanitizeHtml(req.body.password);
    const confirmPass = sanitizeHtml(req.body.confirmPass);

    const startGuest = (s)=>{
        const regex = /^guest/i;
        return regex.test(s);
    }

    const hasWhiteSpace = (s)=> {
        return (/\s/).test(s);
    }

    const hasSpecialChar = (s)=>{
        return (/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/).test(s);
    }

    //check if any fields is empty
    if(!username || !password || !confirmPass){
        res.status(200).json({ message: 'Fields cannot be empty.'});
    }

    //check if the username is too short
    else if(username.length <= 4){
        res.status(200).json({ message: 'Username is too short, minimum is five characters.'});
    }

    //check if username started with guest
    else if(startGuest(username)){
        res.status(200).json({ message: 'Only guest players can have the username started with Guest, please change it to other.'});
    }

    //check if username has space
    else if(hasWhiteSpace(username)){
        res.status(200).json({ message: 'White Space not allowed in Username.'});
    }

    //check if username has special characters
    else if(hasSpecialChar(username)){
        res.status(200).json({ message: 'Username should not have special Characters, only letters and numbers allowed.' });
    }

    //check if the password is too short
    else if(password.length <= 7){
        res.status(200).json({ message: 'Password is too short, minimum is eight characters'});
    }

     //check if password has space
    else if(hasWhiteSpace(password)){
        res.status(200).json({ message: 'White Space not allowed in Password.'});
    }

    //check if confirm password and password is not the same
    else if(password !== confirmPass){
        res.status(200).json({ message: 'Password and confirm password do not match'});
    }

    //if everything is good on inputs, time to validate it on database
    else{
        try{
            const usernameDB = await accountModel.findOne({ username: username });

            if(usernameDB){
                res.status(200).json({ message: username + ' already taken' });
            }
            else{
                //date today
                const currentDate = ()=>{
                    var today = new Date();
                    var dd = String(today.getDate()).padStart(2, '0');
                    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
                    var yyyy = today.getFullYear();

                    today = mm + '/' + dd + '/' + yyyy;
                   
                    return today;
                }

                const createNewAccount = await accountModel.create({ username: username, password: hashPass(password), profile: 'defaultProfile.png', trophy: 0, allow_change_profile: currentDate() });

                const setFriendList = await friendModel.create({ username: username, list: [], request: [] });

                const userHistory = await historyModel.create({ username: username, history: [] });

                if(createNewAccount && setFriendList && userHistory){
                    //set the user status, encrypt the username and the key
                    const encryptUser = ()=>{
                        return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(username), 'username').toString();
                    }

                    //set the token only for the logged in
                    const token = jwt.sign({ username: createNewAccount.username }, secretKey, { expiresIn: '1h' });

                    //set the cookie
                    res.cookie('token', token, {
                        httpOnly: true,
                        secure: true,
                        signed: true,
                        maxAge: 3600000,
                        sameSite: 'strict'
                    });

                    res.status(200).json({ message: 'success', user: encryptUser() });
                }
            }
        }
        catch(err){
            console.log(err);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
});

module.exports = router;