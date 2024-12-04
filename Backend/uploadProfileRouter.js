const express = require('express');
const router = express.Router();
const accountModel = require('./accountModel');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const sanitizeHtml = require('sanitize-html');
const uuid = require('uuid');

//storage
const storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, path.join(__dirname, '../Storage', 'Profile'));
    },
    filename: function(req, file, callback){
        callback(null, 'Profile_' + uuid.v4() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

router.post('/', upload.single('imageFile'), async (req, res)=>{
    const imageFile = req.file;
    const username = sanitizeHtml(req.body.username);

    //for deleting old image
    const clearUnusedProfile = async () => {
        try {
            // Get all user profiles from the database
            const users = await accountModel.find({}, 'profile');
            
            if (users) {
                // Collect all profile images that are currently in use
                const usedProfiles = users.map(user => user.profile);

                // Read the profile images stored in the folder
                const picContent = fs.readdirSync(path.join(__dirname, '../Storage', 'Profile'));

                picContent.forEach(pic => {
                    if(pic !== 'defaultProfile.png' && usedProfiles.includes(pic) == false){
                        let filePath = path.join(__dirname, '../Storage', 'Profile', pic);
                        fs.unlink(filePath, (err)=>{
                            if(err){
                                console.log(err);
                            }
                        });
                    }
                });
            }
        } catch (err) {
            console.log('Error during profile cleanup:', err);
        }
    };

    if(!imageFile){
        res.status(200).json({ message: 'no image selected' });
    }
    else{
        let folderPath = path.join(__dirname, '../Storage', 'Profile', imageFile.filename);

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


                if(fs.existsSync(folderPath)){
                    if(allowed(findUser)){
                        try{
                            const findUser = await accountModel.findOneAndUpdate(
                                { username: username },
                                { 
                                    $set: { 
                                        profile: imageFile.filename,
                                        allow_change_profile: futureDate()
                                    }
                                },
                                { new: true }
                            )

                            if(findUser){
                                res.status(200).json({ message: 'success', profile: imageFile.filename, date: futureDate() });
                            }
                        }
                        catch(err){
                            console.log(err);
                        }
                    }
                }
                else{
                    res.status(200).json({ message: 'failed' });
                }
            }
        }
        catch(err){
            console.log(err)
        }
    }
    setTimeout(() => {
        clearUnusedProfile();
    }, 1000);
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