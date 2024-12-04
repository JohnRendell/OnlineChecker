//for notifying users on request
socket.on('notify-player-request', async (player, status, user)=>{
    try{
        //desktop on the friend list tab
        const notif_f_r = document.getElementById('notifMsg_friendRequest');

        //mobile/tablet on the friend list tab
        const m_notif_f_r = document.getElementById('m_notifMsg_friendRequest');

        if(notif_f_r && m_notif_f_r){
            document.getElementById('notifMsg_friendRequest').style.display = 'none';
            document.getElementById('m_notifMsg_friendRequest').style.display = 'none';
        }
        const countUser = await fetch('/friendList/countUserRequest', {
            method: "POST",
            headers: {
                "Content-Type": "Application/json",
                "Accept": "Application/json"
            },
            body: JSON.stringify({ playerName: player })
        });
        const countUser_data = await countUser.json();

        if(countUser_data.message === 'success'){

            //add the friend request if there is any
            if(countUser_data.count > 0){
                //desktop on the friend list tab
                if(document.getElementById('notifMsg_friendRequest')){
                    document.getElementById('notifMsg_friendRequest').style.display = 'inline';
                    document.getElementById('notifMsg_friendRequest').innerText = countUser_data.count;
                }

                //mobile/tablet on the friend list tab
                if(document.getElementById('m_notifMsg_friendRequest')){
                    document.getElementById('m_notifMsg_friendRequest').style.display = 'inline';
                    document.getElementById('m_notifMsg_friendRequest').innerText = countUser_data.count;
                }
            }
            else{
                //desktop on the friend list tab
                if(document.getElementById('notifMsg_friendRequest')){
                    document.getElementById('notifMsg_friendRequest').style.display = 'none';
                }
                
                //mobile/tablet on the friend list tab
                if(document.getElementById('m_notifMsg_friendRequest')){
                    document.getElementById('m_notifMsg_friendRequest').style.display = 'none';
                }
            }

            //check if the status is cancel, if it does then remove the user from the request div
            if(status === 'Cancel'){
                var child = document.getElementById('req_div_' + user);

                if(child){
                    child.parentNode.removeChild(child);
                }
            }
            else{
                friendList_view();
            }
        }
    }
    catch(err){
        console.log(err);
    }
});

//notify user on added request
socket.on('request_accepted', ()=>{
    friendList_view();
    checkReqList();
});

//notify user on decline request
socket.on('request_decline', ()=>{
    checkReqList();
});

//notify user on removed list
socket.on('list_removed', (id, name)=>{
    checkReqList();
    var child = document.getElementById(id);

    if(child){
        child.parentNode.removeChild(child);
    }

    //remove the user from the chat div list on private message
    if(document.getElementById('div_friend_' + name)){
        document.getElementById('div_friend_' + name).remove();
    }
});

//for both user on visit page
socket.on('both_request', ()=>{
    if(document.getElementById('addFriendBtn')){
        document.getElementById('addFriendBtn').disabled = true;
        document.getElementById('addFriendBtn').style.pointerEvents = 'not-allowed';
        document.getElementById('addFriendBtn').style.backgroundColor = 'green';
        
        document.getElementById('addFriendBtn').innerText = 'Friend';
    }
});