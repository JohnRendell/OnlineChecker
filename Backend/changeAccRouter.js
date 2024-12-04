const express = require('express');
const router = express.Router();
const accountModel = require('./accountModel');
const bcryptJS = require('bcryptjs');
const path = require('path');
const cookieParser = require('cookie-parser');
const sanitize = require('sanitize-html');

//middle ware for cookies
require('dotenv').config({path: path.resolve(__dirname, '../keys.env')});

//middleware cookie
router.use(cookieParser(process.env.COOKIE_KEY));

router.post('/', async (req, res)=>{
    const username = sanitize(req.body.username);
    const password = sanitize(req.body.password);
    const newPassword = sanitize(req.body.newPassword);

    const hasWhiteSpace = (s)=> {
        return (/\s/).test(s);
    }

    if(!password || !newPassword){
        res.status(200).json({ message: 'field cannot be empty', textColor: 'red' });
    }

    //check if the new password is short
    else if(newPassword.length <= 7){
        res.status(200).json({ message: 'Password is too short, minimum is eight characters', textColor: 'red'});
    }

    //check if password has space
    else if(hasWhiteSpace(newPassword)){
        res.status(200).json({ message: 'White Space not allowed in new Password.', textColor: 'red'});
    }

    //if new pass and old pass is the same
    else if(password === newPassword){
        res.status(200).json({ message: 'Old password cannot be the same with the new password', textColor: 'red'});
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

                //if password match, then replace the password with new one
                if(checkPass){
                    try{
                        function hashPass(password){
                            var salt = bcryptJS.genSaltSync(10);
                            return bcryptJS.hashSync(password, salt);
                        }
                        const updateAcc = await accountModel.findOneAndUpdate
                        (
                            { username: findUser.username }, 
                            { $set: { password: hashPass(newPassword) } },
                            { new: true }
                        );

                        if(updateAcc){
                            res.status(200).json({ message: 'Change Account Successfully', textColor: 'green' });
                        }
                    }
                    catch(err){
                        console.log(err)
                    }
                }
                else{
                    res.status(200).json({ message: 'Type your old password', textColor: 'red' });
                }
            }
        }
        catch(err){
            console.log(err)
        }
    }
});

module.exports = router;