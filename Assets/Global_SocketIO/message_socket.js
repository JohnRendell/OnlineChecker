//for receive message on global
let global_messageCount = 0;
socket.on('globalMessage', (message, user, userProfile)=>{
    global_messageCount++;

    //display the notif
    document.getElementById('notifMsg_global').style.display = 'inline';
    document.getElementById('notifMsg_global').innerText = global_messageCount;

    //main container
    var container = document.getElementById('parentContainerGlobal');

    //holder of the message container
    var messageHolder = document.createElement('div');
    messageHolder.setAttribute('class', "flex justify-end w-full h-auto");
    container.appendChild(messageHolder);

    //holder for the message formatting
    var messageFormatting = document.createElement('div');
    messageFormatting.setAttribute('class', 'flex flex-col space-y-2 w-fit h-fit');
    messageHolder.appendChild(messageFormatting);

    //message holder for profile
    var profileSenderHolder = document.createElement('div');
    profileSenderHolder.setAttribute('class', 'flex flex-row space-x-2 items-center justify-end');
    messageFormatting.appendChild(profileSenderHolder);

    //sender name
    var messageSender = document.createElement('p');
    messageSender.setAttribute('class', "font-Pixelify text-black font-bold text-sm");
    messageSender.appendChild(document.createTextNode(user));
    profileSenderHolder.appendChild(messageSender);

    //profile display
    var profile = document.createElement('img');
    profile.setAttribute('alt', 'user profile');
    profile.setAttribute('class', 'w-[2rem] h-[2rem] border-2 border-blue-500 rounded-full');
    profile.setAttribute('src', '/Profile/' + userProfile);
    profileSenderHolder.appendChild(profile);

    //message container
    var messageContainer = document.createElement('div');
    messageContainer.setAttribute('class', "w-[10rem] h-auto text-left bg-blue-700 rounded-2xl p-2 md:w-[15rem]");
    messageFormatting.appendChild(messageContainer);

    //message content
    var messageContent = document.createElement('p');
    messageContent.setAttribute('class', "font-Pixelify text-white text-sm");
    messageContent.appendChild(document.createTextNode(message));
    messageContainer.appendChild(messageContent);

    container.scrollTo(0, container.scrollHeight);
});

//for receive message on private
let private_messageCount = 0;
socket.on('privateMessage', (message, user, userProfile)=>{
    private_messageCount++;

    //display the notif
    if(document.getElementById('notifMsg_friend')){
        document.getElementById('notifMsg_friend').style.display = 'inline';
        document.getElementById('notifMsg_friend').innerText = private_messageCount;
    }

    //main container
    var container = document.getElementById('parentContainerPrivate-' + user);

    if(container){
         //holder of the message container
        var messageHolder = document.createElement('div');
        messageHolder.setAttribute('class', "flex justify-end w-full h-auto");
        container.appendChild(messageHolder);

        //holder for the message formatting
        var messageFormatting = document.createElement('div');
        messageFormatting.setAttribute('class', 'flex flex-col space-y-2 w-fit h-fit');
        messageHolder.appendChild(messageFormatting);

        //message holder for profile
        var profileSenderHolder = document.createElement('div');
        profileSenderHolder.setAttribute('class', 'flex flex-row space-x-2 items-center justify-end');
        messageFormatting.appendChild(profileSenderHolder);

        //sender name
        var messageSender = document.createElement('p');
        messageSender.setAttribute('class', "font-Pixelify text-black font-bold text-sm");
        messageSender.appendChild(document.createTextNode(user));
        profileSenderHolder.appendChild(messageSender);

        //profile display
        var profile = document.createElement('img');
        profile.setAttribute('alt', 'user profile');
        profile.setAttribute('class', 'w-[2rem] h-[2rem] border-2 border-blue-500 rounded-full');
        profile.setAttribute('src', '/Profile/' + userProfile);
        profileSenderHolder.appendChild(profile);

        //message container
        var messageContainer = document.createElement('div');
        messageContainer.setAttribute('class', "w-[10rem] h-auto text-left bg-blue-700 rounded-2xl p-2 md:w-[15rem]");
        messageFormatting.appendChild(messageContainer);

        //message content
        var messageContent = document.createElement('p');
        messageContent.setAttribute('class', "font-Pixelify text-white text-sm");
        messageContent.appendChild(document.createTextNode(message));
        messageContainer.appendChild(messageContent);

        container.scrollTo(0, container.scrollHeight);
    }
});

//for badge on private message specific
socket.on('private_notif_message', (idName, count)=>{
    if(document.getElementById('notifMsg_friend_' + idName)){
        document.getElementById('notifMsg_friend_' + idName).style.display = 'inline';
        document.getElementById('notifMsg_friend_' + idName).innerText = count;

        count = 0;
    }
});

//for showing status if that player is active or not for private messaging
socket.on('friend-status', (status)=>{
    switch(status){
        case 'Active':
            document.getElementById('friendStatus').style.backgroundColor = 'green';
            break;

        default:
            document.getElementById('friendStatus').style.backgroundColor = 'red';
            break;
    }
});

//for checking if the user in on lobby or not
socket.on('friend-on-lobby', (isLobby, user)=>{
    let status;

    if(isLobby){
        status = user + ' is currently on lobby, he won\'t see the message you send';
    }
    else{
       status = user + ' now on dashboard.';
    }
    document.getElementById('friendLobby_status').innerText = status;
});