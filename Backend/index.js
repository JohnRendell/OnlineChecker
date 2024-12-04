//express server
const express = require('express');
const app = express();

//socket IO http server
const { Server } = require('socket.io');
const expressServer = require('http').createServer(app);
const server = new Server(expressServer);

//path and dotenv for accessing keys
const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../keys.env')});

//mongoDB database
const mongoose = require('mongoose');
const uri = process.env.URI;
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } 
  catch(err) {
    console.log(err);
  }
}
run().catch(console.dir);

//for connection on socket IO
require('./socketIORouter')(server);

//serve the needed folder
app.use(express.static(path.join(__dirname, '../Assets')));
app.use(express.static(path.join(__dirname, '../Public')));
app.use(express.static(path.join(__dirname, '../Views')));
app.use(express.static(path.join(__dirname, '../Page404')));
app.use(express.static(path.join(__dirname, '../Storage')));
app.use(express.static(path.join(__dirname, '../Checker')));

app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, '../Public/index.html'));
});

//json express to parse the json data, middleware
app.use(express.json());

//routers
app.use('/login', require('./loginRouter'));
app.use('/signin', require('./signinRouter'));
app.use('/guest', require('./guestLoginRouter'));
app.use('/friendList', require('./friendListRouter'));
app.use('/changeAcc', require('./changeAccRouter'));
app.use('/uploadImage', require('./uploadProfileRouter'));
app.use('/dashboard', require('./dashboardRouter'));
app.use('/customLobby', require('./customModeRouter'));
app.use('/player', require('./userProfileRouter'));
app.use('/cookie', require('./cookieServerRouter'));
app.use('/fillInfo', require('./fillInfoRouter'));
app.use('/history', require('./historyRouter'));
app.use('/leaderboard', require('./leaderboardRouter'));
app.use('/lobby', require('./lobbyRouter'));

//checker router
app.use('/checker', require('./checkerRouter'));
require('./socketCheckerIO')(server);

//for redirecting users to page 404
app.get('*', function(req, res){
  res.status(200).sendFile(path.join(__dirname, '../Page404/invalid.html'));
});

//listen to port
const PORT = process.env.PORT;
expressServer.listen(PORT, ()=>{
    console.log('listen to PORT: ' + PORT);
})