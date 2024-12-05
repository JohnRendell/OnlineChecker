socket.on('spectator_time', (minute, sec)=>{
    if(localStorage.getItem('spectator')){
        let timeP = document.getElementById('checkerTime');

        // Start the timer
        timeP.innerText = (minute < 10 ? '0' + minute : minute) + ':' + (sec < 10 ? '0' + sec : sec);

        localStorage.setItem('minute', CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(minute), 'minute').toString());
        localStorage.setItem('sec', CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(sec), 'sec').toString());
    }
});

//for blue player
socket.on('spectator_moveBlue', (pieceID, tileID)=>{
    if(localStorage.getItem('spectator')){
        document.getElementById(tileID).append(document.getElementById(pieceID));
    }
});

//for blue promoted
socket.on('spectator_promoteBlue', (pieceID, pieceID_Input, username)=>{
    if(localStorage.getItem('spectator')){
        modalStatus('promotedModal', 'promotedContainer', 'flex', 'modal_animation');

        document.getElementById('promoteLabel').innerText = username + ' piece\'s promoted';
        document.getElementById(pieceID_Input).value = 'queen';
        
        //append the crown icon
        var img = document.createElement('img');
        img.setAttribute('class', 'w-full h-full');
        img.setAttribute('src', '/Images/Crown.png');
        img.setAttribute('alt', 'Crown icon');

        document.getElementById(pieceID).appendChild(img);

        document.getElementById('promotedContainer').addEventListener('animationend', ()=>{
            setTimeout(() => {
                modalStatus('promotedModal', 'promotedContainer', 'none', null);
            }, 1000);
        });
    }
});

//for enemy eaten
socket.on('spectator_eatenEnemy', (pieceID)=>{
    if(localStorage.getItem('spectator')){
        document.getElementById(pieceID).style.animation = 'shrinkPiece 1s normal forwards';
        document.getElementById(pieceID).addEventListener('animationend', ()=>{
            document.getElementById(pieceID).remove();
        });
    }
});

//for red player
socket.on('spectator_moveRed', (pieceID, tileID)=>{
    if(localStorage.getItem('spectator')){
        document.getElementById(tileID).append(document.getElementById(pieceID));
    }
});

//for red promoted
socket.on('spectator_promoteRed', (pieceID, pieceID_Input, username)=>{
    if(localStorage.getItem('spectator')){
        var child = document.getElementById(pieceID);
        modalStatus('promotedModal', 'promotedContainer', 'flex', 'modal_animation');

        document.getElementById('promoteLabel').innerText = username + ' piece\'s promoted';
        document.getElementById(pieceID_Input).value = 'queen';
        
        //append the crown icon
        var img = document.createElement('img');
        img.setAttribute('class', 'w-full h-full');
        img.setAttribute('src', '/Images/Crown.png');
        img.setAttribute('alt', 'Crown icon');

        child.appendChild(img);

        document.getElementById('promotedContainer').addEventListener('animationend', ()=>{
            setTimeout(() => {
                modalStatus('promotedModal', 'promotedContainer', 'none', null);
            }, 1000);
        });
    }
});

//for ally eaten
socket.on('spectator_eatenAlly', (pieceID)=>{
    if(localStorage.getItem('spectator')){
        document.getElementById(pieceID).style.animation = 'shrinkPiece 1s normal forwards';
        document.getElementById(pieceID).addEventListener('animationend', ()=>{
            document.getElementById(pieceID).remove();
        });
    }
});

//for turn indicator
socket.on('spectator_turnIndicator', (turn, username, profile)=>{
    if(localStorage.getItem('spectator')){
        var profile_div = document.getElementById('userTurnProfile');
        var indicator_div = document.getElementById('userTurnIndicator');

        if(profile_div && indicator_div){
            profile_div.src = profile;
            indicator_div.innerText = username + ' turn';
        }

        const encryptUser = ()=>{
            return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(turn), 'turnIndicator').toString();
        }
        localStorage.setItem('turnIndicator', encryptUser());
    }
});