//add user to the list
async function addUserList(user) {
    const username = CryptoJS.AES.decrypt(user, 'username').toString(CryptoJS.enc.Utf8);

    if(username){
        socket.emit('addUser', username);
    
        //for counting users
        socket.emit('countUser');
    }
    else{
        window.location.href = '/Invalid';
    }
}

//remove user to the list
async function removeUserList(user) {
    socket.emit('removeUser', user);

    //for counting users
    socket.emit('countUser');

    //delete username cookie
    const deleteCookie = await fetch('/cookie/deleteCookie');
    const deleteCookieData = deleteCookie.ok;

    if(deleteCookieData){
        socket.emit('logged-out-users', user);
        localStorage.clear();
        window.location.href = '/';
    }
}

//send message to the clients on global
function sendMessageGlobal(){
    let message = document.getElementById('messageInputGlobal');

    if(message.value){
        //main container
        var container = document.getElementById('parentContainerGlobal');

        //holder of the message container
        var messageHolder = document.createElement('div');
        messageHolder.setAttribute('class', "flex justify-start w-full h-auto");
        container.appendChild(messageHolder);

        //holder for the message formatting
        var messageFormatting = document.createElement('div');
        messageFormatting.setAttribute('class', 'flex flex-col space-y-2 w-fit h-fit');
        messageHolder.appendChild(messageFormatting);

        //message holder for profile
        var profileSenderHolder = document.createElement('div');
        profileSenderHolder.setAttribute('class', 'flex flex-row space-x-2 items-center justify-start');
        messageFormatting.appendChild(profileSenderHolder);

        //profile display
        var profile = document.createElement('img');
        profile.setAttribute('alt', 'user profile');
        profile.setAttribute('class', 'w-[2rem] h-[2rem] text-sm border-2 border-blue-500 rounded-full');
        profile.setAttribute('src', '/Profile/' + global_profile);
        profileSenderHolder.appendChild(profile);

        //sender name
        var messageSender = document.createElement('p');
        messageSender.setAttribute('class', "font-Pixelify text-black font-bold text-sm");
        messageSender.appendChild(document.createTextNode(global_username));
        profileSenderHolder.appendChild(messageSender);

        //message container
        var messageContainer = document.createElement('div');
        messageContainer.setAttribute('class', "w-[10rem] h-auto text-left bg-blue-500 rounded-2xl p-2 md:w-[15rem]");
        messageFormatting.appendChild(messageContainer);

        //message content
        var messageContent = document.createElement('p');
        messageContent.setAttribute('class', "font-Pixelify text-white text-sm");
        messageContent.appendChild(document.createTextNode(message.value));
        messageContainer.appendChild(messageContent);

        //send message to the socket
        socket.emit('globalMessage', message.value, global_username, global_profile);

        //reset the input and counter
        document.getElementById('messageInputGlobal').value = '';
        document.getElementById('messageInputGlobalCount').innerText = '0/80';

        container.scrollTo(0, container.scrollHeight);
    }
}

//send message to the clients on private
let count = 0;
function sendMessagePrivate(){
    let message = document.getElementById('messageInputFriend');

    if(message.value){
        //send message to the socket
        const receiver = CryptoJS.AES.decrypt(localStorage.getItem('receiver_private'), 'receiver').toString(CryptoJS.enc.Utf8);

        if(receiver){
            count++;

            //main container
            var container = document.getElementById('parentContainerPrivate-' + receiver);

            //holder of the message container
            var messageHolder = document.createElement('div');
            messageHolder.setAttribute('class', "flex justify-start w-full h-auto");
            container.appendChild(messageHolder);

            //holder for the message formatting
            var messageFormatting = document.createElement('div');
            messageFormatting.setAttribute('class', 'flex flex-col space-y-2 w-fit h-fit');
            messageHolder.appendChild(messageFormatting);

            //message holder for profile
            var profileSenderHolder = document.createElement('div');
            profileSenderHolder.setAttribute('class', 'flex flex-row space-x-2 items-center justify-start');
            messageFormatting.appendChild(profileSenderHolder);

            //profile display
            var profile = document.createElement('img');
            profile.setAttribute('alt', 'user profile');
            profile.setAttribute('class', 'w-[2rem] h-[2rem] text-sm border-2 border-blue-500 rounded-full');
            profile.setAttribute('src', '/Profile/' + global_profile);
            profileSenderHolder.appendChild(profile);

            //sender name
            var messageSender = document.createElement('p');
            messageSender.setAttribute('class', "font-Pixelify text-black font-bold text-sm");
            messageSender.appendChild(document.createTextNode(global_username));
            profileSenderHolder.appendChild(messageSender);

            //message container
            var messageContainer = document.createElement('div');
            messageContainer.setAttribute('class', "w-[10rem] h-auto text-left bg-blue-500 rounded-2xl p-2 md:w-[15rem]");
            messageFormatting.appendChild(messageContainer);

            //message content
            var messageContent = document.createElement('p');
            messageContent.setAttribute('class', "font-Pixelify text-white text-sm");
            messageContent.appendChild(document.createTextNode(message.value));
            messageContainer.appendChild(messageContent);

            //send to the receiver socket
            socket.emit('privateMessage', message.value, global_username, global_profile, receiver);
            socket.emit('private_notif_message', global_username, receiver, count);

            //reset the input and counter
            document.getElementById('messageInputFriend').value = '';
            document.getElementById('messageInputFriendCount').innerText = '0/80';

            container.scrollTo(0, container.scrollHeight);
        }
        else{
            window.location.href = '/invalid';
        }
    }
}

//for opening modal
function modalStatus(modalID, modalContainerID, status, animationName){
    document.getElementById(modalID).style.display = status;

    if(status !== 'none'){
        setTimeout(() => {
            document.getElementById(modalContainerID).style.animation = animationName + ' 1s normal forwards';
        }, 100);
    }
}

//if user is on lobby
function imInLobby(isLobby, name){
    //this is for the user when going in lobby
    socket.emit('lobbyStatus', name, isLobby);

    //this is for removing player to the user's invite custom box, a notification that states this user is now on lobby
    socket.emit('custom-div-status-player-remove', name);

    //if user exit the lobby, make them available this is only for custom mode
    if(isLobby == false){
        notifyAllUsers();
    }
}

//notifying user across server
function notifyAllUsers(){
    socket.emit('refresh-custom-div-invite'); //notif for the custom lobby
}