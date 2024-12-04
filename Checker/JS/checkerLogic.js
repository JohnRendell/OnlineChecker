//for resetting the color
function resetTileColor(pieceID){
    let key = 'ABCDEFGH'; //char keys

    for(let i = 0; i < 8; i++){ //8 row
        for(let j = 0; j < 8; j++){ //8 column
            let color = (i + j) % 2 === 0 ? 'white' : 'black'; //check if the tile is even or odd, then assign a color base on even or odd.

            let tileID = document.getElementById(pieceID).parentNode.id
            if(document.getElementById('tile_' + (i + 1) + key.charAt(j)) != tileID){
                document.getElementById('tile_' + (i + 1) + key.charAt(j)).style.backgroundColor = color;
            }
        }
    }
}

//for moving to tiles
function moveToTiles(tileID){
    if(localStorage.getItem('turnIndicator') && (localStorage.getItem('host') || localStorage.getItem('invited-player'))){
        let turnIndicator  = CryptoJS.AES.decrypt(localStorage.getItem('turnIndicator'), 'turnIndicator').toString(CryptoJS.enc.Utf8);

        let pieceToEat = [];
        var tile = document.getElementById(tileID);

        if(turnIndicator && turnIndicator === 'yes'){
            if(tile && tile.style.backgroundColor === 'green'){
                let pieceID = CryptoJS.AES.decrypt(localStorage.getItem('pieceID'), 'pieceID').toString(CryptoJS.enc.Utf8);

                if(pieceID){
                    var piece = document.getElementById(pieceID);
                    tile.appendChild(piece);

                    //get the destination tile ID
                    localStorage.setItem('destinationTileID', CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(tileID), 'destinationTileID').toString());

                    const eatPiece = (destinationID, originID)=>{
                        let tileKeys = 'abcdefgh'.toUpperCase().split('');

                        //broken down of the origin tile
                        let originTile_arr = originID.split(''); //'tile_1A' structure of an tileID
                        let originTile_char = originTile_arr[originTile_arr.length - 1]; //char of the tile ID
                        let originTile_num = originTile_arr[originTile_arr.length - 2]; //num of the tile ID
                        let originTile_char_index = tileKeys.findIndex(key => originTile_char == key); //char of the tile

                        //broken down of the destination tile
                        let destinationTile_arr = destinationID.split(''); //'tile_1A' structure of an tileID
                        let destinationTile_char = destinationTile_arr[destinationTile_arr.length - 1]; //char of the tile ID
                        let destinationTile_num = destinationTile_arr[destinationTile_arr.length - 2]; //num of the tile ID
                        let destinationTile_char_index = tileKeys.findIndex(key => destinationTile_char == key); //char of the tile

                        //eating front left
                        if(originTile_char_index > destinationTile_char_index && originTile_num > destinationTile_num){
                            for(let i = (originTile_num - 1); i > destinationTile_num; i--){
                                originTile_char_index--;

                                //check if there is any children
                                var tile = document.getElementById('tile_' + i + tileKeys[originTile_char_index]);

                                if(tile){
                                    for(let child of tile.children){
                                        if(child && child.id.startsWith('opponent')){
                                            pieceToEat.push(child.id);
                                        }
                                    }
                                }
                            }
                        }

                        //eating front right
                        if(destinationTile_char_index > originTile_char_index && originTile_num > destinationTile_num){
                            for(let i = (originTile_num - 1); i > destinationTile_num; i--){
                                originTile_char_index++;

                                //check if there is any children
                                var tile = document.getElementById('tile_' + i + tileKeys[originTile_char_index]);

                                if(tile){
                                    for(let child of tile.children){
                                        if(child && child.id.startsWith('opponent')){
                                            pieceToEat.push(child.id);
                                        }
                                    }
                                }
                            }
                        }

                        //eating back left
                        if(originTile_char_index > destinationTile_char_index && originTile_num < destinationTile_num){
                            for(let i = (destinationTile_num - 1); i > originTile_num; i--){
                                destinationTile_char_index++;

                                //check if there is any children
                                var tile = document.getElementById('tile_' + i + tileKeys[destinationTile_char_index]);

                                if(tile){
                                    for(let child of tile.children){
                                        if(child && child.id.startsWith('opponent')){
                                            pieceToEat.push(child.id);
                                        }
                                    }
                                }
                            }
                        }

                        //eating back right
                        if(destinationTile_char_index > originTile_char_index && originTile_num < destinationTile_num){
                            for(let i = (destinationTile_num - 1); i > originTile_num; i--){
                                destinationTile_char_index--;

                                //check if there is any children
                                var tile = document.getElementById('tile_' + i + tileKeys[destinationTile_char_index]);

                                if(tile){
                                    for(let child of tile.children){
                                        if(child && child.id.startsWith('opponent')){
                                            pieceToEat.push(child.id);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    //pawn promoted
                    const pawnPromoted = (pieceID_Input)=>{
                        var pieceInput = document.getElementById(pieceID_Input);
                        if(pieceInput && pieceInput.value === 'pawn'){
                            if(tileID === 'tile_1B' || tileID === 'tile_1D' || tileID === 'tile_1F' || tileID === 'tile_1H'){
                                modalStatus('promotedModal', 'promotedContainer', 'flex', 'modal_animation');

                                document.getElementById('promoteLabel').innerText = global_username + ' piece\'s promoted';
                                pieceInput.value = 'queen';
                                
                                //append the crown icon
                                var img = document.createElement('img');
                                img.setAttribute('class', 'w-full h-full');
                                img.setAttribute('src', '/Images/Crown.png');
                                img.setAttribute('alt', 'Crown icon');

                                piece.appendChild(img);

                                document.getElementById('promotedContainer').addEventListener('animationend', ()=>{
                                    setTimeout(() => {
                                        modalStatus('promotedModal', 'promotedContainer', 'none', null);
                                    }, 1000);
                                });

                                localStorage.setItem(pieceID_Input, CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(pieceInput.value), pieceID_Input).toString());

                                if(localStorage.getItem('invited-player')){
                                    socket.emit('spectator_promoteBlue', pieceID, pieceID_Input, localStorage.getItem('lobby-room'), global_username);
                                }
                            }
                        }
                    }
                    pawnPromoted('pieceInput' + pieceID.substring(5).trim());

                    //for logic in eating piece
                    let originTile = CryptoJS.AES.decrypt(localStorage.getItem('originTileID'), 'originTileID').toString(CryptoJS.enc.Utf8);
                    let destinationTile = CryptoJS.AES.decrypt(localStorage.getItem('destinationTileID'), 'destinationTileID').toString(CryptoJS.enc.Utf8);

                    if(originTile && destinationTile){
                        eatPiece(destinationTile, originTile);
                    }
                    else{
                        window.location.href = '/ModifiedTileID/GameTerminated'
                    }

                    //reset the tile color
                    resetTileColor(pieceID);

                    //pass the piece ID and the tile ID to the socket
                    let room = CryptoJS.AES.decrypt(localStorage.getItem('lobby-room'), 'lobby-room').toString(CryptoJS.enc.Utf8);

                    if(room && (localStorage.getItem('host') || localStorage.getItem('invited-player'))){
                        //passing the player eat
                        if(pieceToEat.length > 0){
                            //set the turn to yes
                            const encryptUser = ()=>{
                                return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse('yes'), 'turnIndicator').toString();
                            }
                            localStorage.setItem('turnIndicator', encryptUser());

                            //iterate to the array of piece
                            for(let ID of pieceToEat){
                                document.getElementById(ID).style.animation = 'shrinkPiece 1s normal forwards';

                                //storage for piece eaten
                                localStorage.setItem('eaten_' + ID, CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(ID), 'eaten_' + ID).toString());

                                document.getElementById(ID).addEventListener('animationend', ()=>{
                                    document.getElementById(ID).remove();
                                });

                                if(localStorage.getItem('invited-player')){
                                    socket.emit('spectator_eatenEnemy', ID, localStorage.getItem('lobby-room'));
                                }
                            }
                            socket.emit('checker-player-eat-piece', pieceToEat, room);
                        }
                        else{
                            //set the turn to no
                            const encryptUser = ()=>{
                                return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse('no'), 'turnIndicator').toString();
                            }
                            localStorage.setItem('turnIndicator', encryptUser());

                            //render the user
                            var profile = document.getElementById('userTurnProfile');
                            var indicator = document.getElementById('userTurnIndicator');

                            if(profile && indicator){
                                profile.src = '/Profile/' + global_opponent_profile;
                                indicator.innerText = global_opponent_username + ' turn';
                            }
                        }

                        //for spectators
                        if(localStorage.getItem('invited-player')){
                            let turn = CryptoJS.AES.decrypt(localStorage.getItem('turnIndicator'), 'turnIndicator').toString(CryptoJS.enc.Utf8);

                            if(turn){
                                socket.emit('spectator_turnIndicator', localStorage.getItem('turnIndicator'), room, turn === 'yes' ? global_username : global_opponent_username, turn === 'yes' ? global_profile : global_opponent_profile);
                            }
                        }

                        //update the player turn
                        checkBoardStatus();
                        socket.emit('checker-player-turn', localStorage.getItem('turnIndicator'), room);

                        //passing the player piece move
                        let destination = CryptoJS.AES.decrypt(localStorage.getItem('destinationTileID'), 'destinationTileID').toString(CryptoJS.enc.Utf8);

                        if(destination){
                            savePiecePos(pieceID, destination);
                            socket.emit('checker-player-move', pieceID, destination, room);
                        }
                    }
                    else{
                        window.location.href = '/invalidRoom/GameTerminated';
                    }
                }
            }
        }
        else if(!turnIndicator){
            window.location.href = '/InvalidTurn/GameTerminated';
        }
    }
}

//saving piece's position
function savePiecePos(pieceID, tileID){
    localStorage.setItem(pieceID + '_pos', CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(tileID), pieceID + '_pos').toString());

    if(localStorage.getItem('invited-player')){
        socket.emit('spectator_moveBlue', pieceID, tileID, localStorage.getItem('lobby-room'));
    }
}

//for clicking piece
function showAvailableMove(pieceID_Input, pieceID){
    //save the piece ID to the localstorage and encrypt it
    const encryptUser = ()=>{
        return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(pieceID), 'pieceID').toString();
    }

    //set the piece ID
    localStorage.setItem('pieceID', encryptUser());
    resetTileColor(pieceID);

    var currentTile = document.getElementById(pieceID).parentNode; //current tile piece sitting
    var pieceInput = document.getElementById(pieceID_Input); //input for determining the piece type

    //set the tile ID origin
    localStorage.setItem('originTileID', CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(currentTile.id), 'originTileID').toString());

    const moveLeftFront = (type, currentTile)=>{
        //break the current tileID
        let tileKeys = 'abcdefgh'.toUpperCase().split('');
        let currentTile_arr = currentTile.id.split(''); //'tile_1A' structure of an tileID
        let currentTile_char = currentTile_arr[currentTile_arr.length - 1]; //char of the tile ID
        let currentTile_num = currentTile_arr[currentTile_arr.length - 2]; //num of the tile ID
        let currentTile_char_index = tileKeys.findIndex(key => currentTile_char == key); //char of the tile

        //boolean for checking path
        let block = false;

        //queen movement
        if(type === 'queen'){
            //highlighting the left front tile
            for(let i = 0; i < 8; i++){
                currentTile_char_index--;
                currentTile_num--;
                var tile = document.getElementById('tile_' + currentTile_num + tileKeys[currentTile_char_index]);
                
                if(tile){
                    //check if there is ally child blocking the path
                    for(let child of tile.children){
                        if(child && child.id.startsWith('piece')){
                            block = true;
                            break;
                        }
                    }

                    //check if there is enemy child blocking the path
                    for(let child of tile.children){
                        if(child && child.id.startsWith('opponent_piece')){
                            //get the parent tile of the child
                            var tile_parent = child.parentNode;

                            //break the tile parent
                            let currentParTile_arr = tile_parent.id.split(''); //'tile_1A' structure of an tileID
                            let currentParTile_char = currentParTile_arr[currentParTile_arr.length - 1]; //char of the tile ID
                            let currentParTile_num = currentParTile_arr[currentParTile_arr.length - 2]; //num of the tile ID
                            let currentParTile_char_index = tileKeys.findIndex(key => currentParTile_char == key);
                            
                            currentParTile_char_index--;
                            currentParTile_num--;
                            var adjTile = document.getElementById('tile_' + currentParTile_num + tileKeys[currentParTile_char_index]);

                            if(adjTile){
                                for(let child of adjTile.children){
                                    if(child && child.id.startsWith('opponent_piece')){
                                        block = true;
                                        break;
                                    }
                                }
                            }
                            break;
                        }
                    }

                    if(tile.childElementCount === 0 && block == false){
                        tile.style.backgroundColor = 'green';
                    }
                }
            }
        }

        //pawn movement
        if(type === 'pawn'){
            currentTile_char_index--;
            currentTile_num--;

            var tile = document.getElementById('tile_' + currentTile_num + tileKeys[currentTile_char_index]);

            if(tile){
                //check if there is ally child blocking the path
                for(let child of tile.children){
                    if(child && child.id.startsWith('piece')){
                        block = true;
                        break;
                    }
                }

                //check if there is enemy child blocking the path
                for(let child of tile.children){
                    if(child && child.id.startsWith('opponent_piece')){
                        //get the parent tile of the child
                        var tile_parent = child.parentNode;

                        //break the tile parent
                        let currentParTile_arr = tile_parent.id.split(''); //'tile_1A' structure of an tileID
                        let currentParTile_char = currentParTile_arr[currentParTile_arr.length - 1]; //char of the tile ID
                        let currentParTile_num = currentParTile_arr[currentParTile_arr.length - 2]; //num of the tile ID
                        let currentParTile_char_index = tileKeys.findIndex(key => currentParTile_char == key);
                        
                        currentParTile_char_index--;
                        currentParTile_num--;
                        var adjTile = document.getElementById('tile_' + currentParTile_num + tileKeys[currentParTile_char_index]);

                        if(adjTile){
                            for(let child of adjTile.children){
                                if(child && child.id.startsWith('opponent_piece')){
                                    block = true;
                                    break;
                                }
                            }
                            if(adjTile.childElementCount === 0){
                                adjTile.style.backgroundColor = 'green';
                            }
                        }
                        break;
                    }
                }

                if(tile.childElementCount === 0 && block == false){
                    tile.style.backgroundColor = 'green';
                }
            }
        }
    }

    const moveRightFront = (type, currentTile) =>{
        //break the current tileID
        let tileKeys = 'abcdefgh'.toUpperCase().split('');
        let currentTile_arr = currentTile.id.split(''); //'tile_1A' structure of an tileID
        let currentTile_char = currentTile_arr[currentTile_arr.length - 1]; //char of the tile ID
        let currentTile_num = currentTile_arr[currentTile_arr.length - 2]; //num of the tile ID
        let currentTile_char_index = tileKeys.findIndex(key => currentTile_char == key); //char of the tile

        //boolean for checking path
        let block = false;

        //queen movement
        if(type === 'queen'){
            //highlighting right tile
            for(let i = 0; i < 8; i++){
                currentTile_char_index++;
                currentTile_num--;
                
                var tile = document.getElementById('tile_' + currentTile_num + tileKeys[currentTile_char_index]);
                
                if(tile){
                    //check if there is ally child blocking the path
                    for(let child of tile.children){
                        if(child && child.id.startsWith('piece')){
                            block = true;
                            break;
                        }
                    }

                    //check if there is enemy child blocking the path
                    for(let child of tile.children){
                        if(child && child.id.startsWith('opponent_piece')){
                            //get the parent tile of the child
                            var tile_parent = child.parentNode;

                            //break the tile parent
                            let currentParTile_arr = tile_parent.id.split(''); //'tile_1A' structure of an tileID
                            let currentParTile_char = currentParTile_arr[currentParTile_arr.length - 1]; //char of the tile ID
                            let currentParTile_num = currentParTile_arr[currentParTile_arr.length - 2]; //num of the tile ID
                            let currentParTile_char_index = tileKeys.findIndex(key => currentParTile_char == key);
                            
                            currentParTile_char_index++;
                            currentParTile_num--;
                            var adjTile = document.getElementById('tile_' + currentParTile_num + tileKeys[currentParTile_char_index]);

                            if(adjTile){
                                for(let child of adjTile.children){
                                    if(child && child.id.startsWith('opponent_piece')){
                                        block = true;
                                        break;
                                    }
                                }
                            }
                            break;
                        }
                    }

                    if(tile.childElementCount === 0 && block == false){
                        tile.style.backgroundColor = 'green';
                    }
                }
            }
        }
        //pawn movement
        else if(type === 'pawn'){
            currentTile_char_index++;
            currentTile_num--;
            
            var tile = document.getElementById('tile_' + currentTile_num + tileKeys[currentTile_char_index]);

            if(tile){
                //check if there is ally child blocking the path
                for(let child of tile.children){
                    if(child && child.id.startsWith('piece')){
                        block = true;
                        break;
                    }
                }

                //check if there is enemy child blocking the path
                for(let child of tile.children){
                    if(child && child.id.startsWith('opponent_piece')){
                        //get the parent tile of the child
                        var tile_parent = child.parentNode;

                        //break the tile parent
                        let currentParTile_arr = tile_parent.id.split(''); //'tile_1A' structure of an tileID
                        let currentParTile_char = currentParTile_arr[currentParTile_arr.length - 1]; //char of the tile ID
                        let currentParTile_num = currentParTile_arr[currentParTile_arr.length - 2]; //num of the tile ID
                        let currentParTile_char_index = tileKeys.findIndex(key => currentParTile_char == key);
                        
                        currentParTile_char_index++;
                        currentParTile_num--;
                        var adjTile = document.getElementById('tile_' + currentParTile_num + tileKeys[currentParTile_char_index]);

                        if(adjTile){
                            for(let child of adjTile.children){
                                if(child && child.id.startsWith('opponent_piece')){
                                    block = true;
                                    break;
                                }
                            }
                            if(adjTile.childElementCount === 0){
                                adjTile.style.backgroundColor = 'green';
                            }
                        }
                        break;
                    }
                }

                if(tile.childElementCount === 0 && block == false){
                    tile.style.backgroundColor = 'green';
                }
            }
        }
    }

    const moveLeftBack = (type, currentTile) =>{
        //break the current tileID
        let tileKeys = 'abcdefgh'.toUpperCase().split('');
        let currentTile_arr = currentTile.id.split(''); //'tile_1A' structure of an tileID
        let currentTile_char = currentTile_arr[currentTile_arr.length - 1]; //char of the tile ID
        let currentTile_num = currentTile_arr[currentTile_arr.length - 2]; //num of the tile ID
        let currentTile_char_index = tileKeys.findIndex(key => currentTile_char == key); //char of the tile

        //boolean for checking path
        let block = false;

        if(type === 'queen'){
            //highlighting right tile
            for(let i = 0; i < 8; i++){
                currentTile_char_index--;
                currentTile_num++;
                
                var tile = document.getElementById('tile_' + currentTile_num + tileKeys[currentTile_char_index]);
                
                if(tile){
                    //check if there is ally child blocking the path
                    for(let child of tile.children){
                        if(child && child.id.startsWith('piece')){
                            block = true;
                            break;
                        }
                    }

                    //check if there is enemy child blocking the path
                    for(let child of tile.children){
                        if(child && child.id.startsWith('opponent_piece')){
                            //get the parent tile of the child
                            var tile_parent = child.parentNode;

                            //break the tile parent
                            let currentParTile_arr = tile_parent.id.split(''); //'tile_1A' structure of an tileID
                            let currentParTile_char = currentParTile_arr[currentParTile_arr.length - 1]; //char of the tile ID
                            let currentParTile_num = currentParTile_arr[currentParTile_arr.length - 2]; //num of the tile ID
                            let currentParTile_char_index = tileKeys.findIndex(key => currentParTile_char == key);
                            
                            currentParTile_char_index--;
                            currentParTile_num++;
                            var adjTile = document.getElementById('tile_' + currentParTile_num + tileKeys[currentParTile_char_index]);

                            if(adjTile){
                                for(let child of adjTile.children){
                                    if(child && child.id.startsWith('opponent_piece')){
                                        block = true;
                                        break;
                                    }
                                }
                            }
                            break;
                        }
                    }

                    if(tile.childElementCount === 0 && block == false){
                        tile.style.backgroundColor = 'green';
                    }
                }
            }
        }
    }

    const moveRightBack = (type, currentTile) =>{
        //break the current tileID
        let tileKeys = 'abcdefgh'.toUpperCase().split('');
        let currentTile_arr = currentTile.id.split(''); //'tile_1A' structure of an tileID
        let currentTile_char = currentTile_arr[currentTile_arr.length - 1]; //char of the tile ID
        let currentTile_num = currentTile_arr[currentTile_arr.length - 2]; //num of the tile ID
        let currentTile_char_index = tileKeys.findIndex(key => currentTile_char == key); //char of the tile

        //boolean for checking path
        let block = false;

        if(type === 'queen'){
            //highlighting right tile
            for(let i = 0; i < 8; i++){
                currentTile_char_index++;
                currentTile_num++;
                
                var tile = document.getElementById('tile_' + currentTile_num + tileKeys[currentTile_char_index]);
                
                if(tile){
                    //check if there is ally child blocking the path
                    for(let child of tile.children){
                        if(child && child.id.startsWith('piece')){
                            block = true;
                            break;
                        }
                    }

                    //check if there is enemy child blocking the path
                    for(let child of tile.children){
                        if(child && child.id.startsWith('opponent_piece')){
                            //get the parent tile of the child
                            var tile_parent = child.parentNode;

                            //break the tile parent
                            let currentParTile_arr = tile_parent.id.split(''); //'tile_1A' structure of an tileID
                            let currentParTile_char = currentParTile_arr[currentParTile_arr.length - 1]; //char of the tile ID
                            let currentParTile_num = currentParTile_arr[currentParTile_arr.length - 2]; //num of the tile ID
                            let currentParTile_char_index = tileKeys.findIndex(key => currentParTile_char == key);
                            
                            currentParTile_char_index++;
                            currentParTile_num++;
                            var adjTile = document.getElementById('tile_' + currentParTile_num + tileKeys[currentParTile_char_index]);

                            if(adjTile){
                                for(let child of adjTile.children){
                                    if(child && child.id.startsWith('opponent_piece')){
                                        block = true;
                                        break;
                                    }
                                }
                            }
                            break;
                        }
                    }

                    if(tile.childElementCount === 0 && block == false){
                        tile.style.backgroundColor = 'green';
                    }
                }
            }
        }
    }

    if(localStorage.getItem('turnIndicator')){
        let turnIndicator  = CryptoJS.AES.decrypt(localStorage.getItem('turnIndicator'), 'turnIndicator').toString(CryptoJS.enc.Utf8);

        if(turnIndicator && turnIndicator === 'yes' && (localStorage.getItem('host') || localStorage.getItem('invited-player'))){
            //logic of the piece here
            moveLeftFront(pieceInput.value, currentTile);
            moveRightFront(pieceInput.value, currentTile);
            moveLeftBack(pieceInput.value, currentTile);
            moveRightBack(pieceInput.value, currentTile);
        }
    }
}

//for checking piece and determine who won
async function checkBoardStatus(){
    let enemyPieceCount = 0;
    let allyPieceCount = 0;
    var board = document.getElementById('checkerBoard');

   for(let i = 0; i < board.childElementCount; i++){
        var child = board.children[i];

        if(child){
            var tile = document.getElementById(child.id);

            if(tile && tile.childElementCount > 0){
                for(let j = 0; j < tile.childElementCount; j++){
                    var piece = tile.children[j];
                    
                    if(piece && piece.id.startsWith('opponent')){
                        enemyPieceCount++;
                    }
                    if(piece && piece.id.startsWith('piece')){
                        allyPieceCount++;
                    }
                }
            }
        }
   }

   //add the history data
    const getHost = ()=>{
        if(localStorage.getItem('host')){
            let host = CryptoJS.AES.decrypt(localStorage.getItem('host'), 'host').toString(CryptoJS.enc.Utf8);

            if(host){
                return host;
            }
            else{
                return undefined;
            }
        }
    }

    const getInvited = ()=>{
        if(localStorage.getItem('invited-player')){
            let invited = CryptoJS.AES.decrypt(localStorage.getItem('invited-player'), 'invited-player').toString(CryptoJS.enc.Utf8);

            if(invited){
                return invited;
            }
            else{
                window.location.href = '/Modified_saved/GameTerminated';
            }
        }
    }

    const getLobbyType = ()=>{
        if(localStorage.getItem('lobbyType')){
            let lobby = CryptoJS.AES.decrypt(localStorage.getItem('lobbyType'), 'lobbyType').toString(CryptoJS.enc.Utf8);

            if(lobby){
                return lobby;
            }
            else{
                window.location.href = '/Modified_saved/GameTerminated';
            }
        }
        else{
            window.location.href = '/Modified_saved/GameTerminated';
        }
    }

    const getTimer = ()=>{
        if(localStorage.getItem('minute') && localStorage.getItem('sec')){
            let minute = CryptoJS.AES.decrypt(localStorage.getItem('minute'), 'minute').toString(CryptoJS.enc.Utf8);

            let sec = CryptoJS.AES.decrypt(localStorage.getItem('sec'), 'sec').toString(CryptoJS.enc.Utf8);

            if(minute && sec){
                return (minute < 10 ? '0' + minute : minute) + ':' + (sec < 10 ? '0' + sec : sec);
            }
            else{
                window.location.href = '/Modified_saved/GameTerminated';
            }
        }
        else{
            window.location.href = '/Modified_saved/GameTerminated';
        }
    }

     let minute = CryptoJS.AES.decrypt(localStorage.getItem('minute'), 'minute').toString(CryptoJS.enc.Utf8);

    let sec = CryptoJS.AES.decrypt(localStorage.getItem('sec'), 'sec').toString(CryptoJS.enc.Utf8);
    if((minute && sec && minute <= 0 && sec <= 0) || enemyPieceCount <= 1 || allyPieceCount <= 1){
        try{
            const addHistory = await fetch('/history/addHistory', {
                method: "POST",
                headers: {
                    "Accept": "Application/json",
                    "Content-Type": "Application/json"
                },
                body: JSON.stringify({
                    username: global_username,
                    opponent: getHost() !== undefined ? getHost() : getInvited(), 
                    lobbyType: getLobbyType(), 
                    time: getTimer(), 
                    win_status: enemyPieceCount < allyPieceCount ? 'win' : 'lose',
                    trophy: global_trophy
                })
            });

            const addHistory_data = await addHistory.json();

            if(addHistory_data.message === 'success'){
                let room = localStorage.getItem('lobby-room');
                socket.emit('win-status', global_opponent_username, room, addHistory_data.win_status);

                document.getElementById('win_lose-text-display').innerText = (enemyPieceCount < allyPieceCount ? global_username : global_opponent_username) + ' win';
                document.getElementById('win_lose-text-display').style.color = enemyPieceCount < allyPieceCount ? 'green' : 'red';
                document.getElementById('win_lose-time-display').innerText = 'Time Remaining: ' + getTimer();

                if(addHistory_data.status === 'Match'){
                    document.getElementById('win_lose-time-trophy').innerText = 'Trophy now: ' + addHistory_data.trophy;
                    document.getElementById('win_lose-time-trophy').style.color =  enemyPieceCount < allyPieceCount ? 'green' : 'red';
                }
                else{
                    document.getElementById('win_lose-time-trophy').innerText = 'You cannot earn or decrease trophy in custom mode';
                }
                modalStatus('win_loseNotifModal', 'win_loseNotifContainer', 'flex', 'modal_animation');   
            }

        } catch (err){
            console.log(err);
        }
    }
}