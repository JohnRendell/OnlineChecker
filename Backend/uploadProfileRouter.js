const express = require('express');
const router = express.Router();
const accountModel = require('./accountModel');
const path = require('path');
const multer = require('multer');
const sanitizeHtml = require('sanitize-html');
const FormData = require('form-data');
const Fetch = require('node-fetch');

//get the env key
require('dotenv').config({path: path.resolve(__dirname, '../keys.env')});

const upload = multer();

router.post('/', upload.single('imageFile'), async (req, res)=>{
    const imageFile = req.file;
    const username = sanitizeHtml(req.body.username);
    let imgur_profileLink;

    const formData = new FormData();
    formData.append('image', imageFile.buffer.toString('base64'));

    try{
        const upload_imgur = await Fetch('https://api.imgur.com/3/image', {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.IMGUR_TOKEN}`
            },
            body: formData
        });

        const upload_imgur_data = await upload_imgur.json();

        if(upload_imgur_data.success){
            imgur_profileLink = upload_imgur_data.data.link;
        }
    }
    catch(err){
        console.log(err);
    }

    //for deleting old image
    const clearUnusedProfile = async () => {
        try {
            // Get all user profile from the database
            const user = await accountModel.findOne({ username: username });
            
            if (user) {
                const userProfile = user.profile;
                const userProfileHash = userProfile.substring(20, 27);

                if(userProfile !== 'https://i.imgur.com/ajVzRmV.jpg'){
                    try{
                        const deleteProfile = await Fetch('https://api.imgur.com/3/image/' + userProfileHash, {
                            method: "DELETE",
                            headers: {
                                Authorization: `Bearer ${process.env.IMGUR_TOKEN}`
                            }
                        });

                        const deleteProfile_data = await deleteProfile.json();

                        if(deleteProfile_data.success){
                            console.log('Old Profile Deleted');
                        }
                    }
                    catch(err){
                        console.log(err);
                    }
                }
            }
        } catch (err) {
            console.log(err);
        }
    };
    clearUnusedProfile();

    if(!imageFile){
        res.status(200).json({ message: 'no image selected' });
    }
    else{
        //find the user first
        try{
            const findUser = await accountModel.findOne({ username: username });

            if(findUser){
                //format date as MM/DD/YYYY
                const formatDate = (date) => {
                    return date.toLocaleDateString('en-US', { 
                        month: '2-digit', 
                        day: '2-digit', 
                        year: 'numeric' 
                    });
                };

                //date 30 days from now
                const futureDate = ()=>{
                    var todayDate = new Date();
                    todayDate.setDate(todayDate.getDate() + 30);
                   
                    return formatDate(todayDate);
                }

                //comparing date in db and today
                const allowed = (findUser) => {
                    const todayDate = new Date(); // Current date
                    const dateInDB = new Date(findUser.allow_change_profile);

                    return todayDate > dateInDB;
                };


                if(allowed(findUser)){
                    try{
                        const findUser = await accountModel.findOneAndUpdate(
                            { username: username },
                            { 
                                $set: { 
                                    profile: imgur_profileLink,
                                    allow_change_profile: futureDate()
                                }
                            },
                            { new: true }
                        )

                        if(findUser){
                            res.status(200).json({ message: 'success', profile: imgur_profileLink, date: futureDate() });
                        }
                    }
                    catch(err){
                        console.log(err);
                    }
                }
            }
        }
        catch(err){
            console.log(err)
        }
    }
});

router.post('/checkProfile', async (req, res)=>{
    try{
        const findUser = await accountModel.findOne({ username: sanitizeHtml(req.body.username) });

        if(findUser){
            const allowDate = new Date(findUser.allow_change_profile);
            const todayDate = new Date();

            //format date as MM/DD/YYYY
            const formatDate = (date) => {
                return date.toLocaleDateString('en-US', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    year: 'numeric' 
                });
            };

            if(todayDate > allowDate){
                res.status(200).json({ message: 'allowed' });
            }
            else{
                res.status(200).json({ message: 'not allowed', date: formatDate(allowDate) });
            }
        }
    }
    catch(err){
        console.log(err);
    }
});

module.exports = router;