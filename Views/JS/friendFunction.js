//this one is for friend chat
async function checkFriend(){
    //decrypt the local storage
    const username = CryptoJS.AES.decrypt(localStorage.getItem('username'), 'username').toString(CryptoJS.enc.Utf8);

    if(username){
        if(username.startsWith('guest')){
            document.getElementById('friendTextDisplay').style.display = 'inline';
            document.getElementById('friendTextDisplay').innerText = 'Log in to chat friends';
            document.getElementById('friendList').style.display = 'none';
        }
        else{
            const checkList = await fetch('/friendList', {
                method: "POST",
                headers: {
                    "Accept": "Application/json",
                    "Content-Type": "Application/json"
                },
                body: JSON.stringify({ username: username })
            });

            const checkListData = await checkList.json();

            if(checkListData.message === 'success'){
                if(checkListData.count == 0){
                    var textDisplay = document.getElementById('friendTextDisplay');
                    var list = document.getElementById('friendList');

                    if(textDisplay && list){
                        document.getElementById('friendTextDisplay').style.display = 'inline';
                        document.getElementById('friendTextDisplay').innerText = 'You have no friends yet';
                        document.getElementById('friendList').style.display = 'none';
                    }
                }
                else{
                    const appendContainer = (name)=>{
                        //make a container dedicated only for this specific container
                        const containerMessageParent = document.getElementById('friendContainerHolder');

                        if(containerMessageParent){
                            //for the message containers
                            const containerMsgDiv = document.createElement('div');
                            containerMsgDiv.setAttribute('class', 'h-[15rem] w-full border-2 border-blue-500 rounded-lg flex flex-col space-y-4 overflow-y-auto overflow-x-hidden p-2 xsm:h-[10rem] md:h-[20rem] lg:h-[15rem]');
                            containerMsgDiv.setAttribute('id', 'parentContainerPrivate-' + name);
                            containerMsgDiv.setAttribute('style', 'scroll-behavior: smooth; display:none');
                            containerMessageParent.appendChild(containerMsgDiv);
                        }
                    }
                    const appendDiv = (name)=>{
                        const listParent = document.getElementById('friendList');

                        if(listParent && listParent.contains(document.getElementById('div_friend_' + name)) === false){
                            //div holder for the name
                            const divHolder = document.createElement('div');
                            divHolder.setAttribute('class', 'w-full h-fit p-2 flex justify-center items-center rounded-2xl bg-blue-500 cursor-pointer hover:bg-blue-700');
                            divHolder.setAttribute('id', 'div_friend_' + name);
                            divHolder.setAttribute('onclick', 'openFriendChat("' + name + '")');
                            listParent.appendChild(divHolder);

                            //display name
                            const friendName = document.createElement('p');
                            friendName.setAttribute('class', 'font-Pixelify text-center text-sm text-white');
                            friendName.appendChild(document.createTextNode(name));
                            divHolder.appendChild(friendName);

                            //badge for notification message
                            const badge = document.createElement('span');
                            badge.setAttribute('class', 'rounded-full bg-red-500 font-Pixelify text-white text-sm p-1');
                            badge.setAttribute('id', 'notifMsg_friend_' + name);
                            badge.setAttribute('style', 'display: none;');
                            divHolder.appendChild(badge);
                        }
                    }

                    const friendList = checkListData.list;
                    friendList.forEach(name => {
                        appendContainer(name);
                        appendDiv(name);
                    });
                    var textDisplay = document.getElementById('friendTextDisplay');
                    var list = document.getElementById('friendList');

                    if(textDisplay && list){
                        document.getElementById('friendTextDisplay').style.display = 'none';
                        document.getElementById('friendList').style.display = 'flex';
                    }
                }
            }
        }
    }
    else{
        window.location.href = '/InvalidUser';
    }
}

function openFriendChat(name){
    document.getElementById('friendLobby_status').style.display = 'inline';
    document.getElementById('friendName').innerText = name;
    document.getElementById('activeFriendStatus').style.display = 'inline';

    document.getElementById('friendBackBtn').style.display = 'inline';
    document.getElementById('frontFriendPanel').style.display = 'none';
    document.getElementById('friendChat').style.display = 'flex';

    //send the receiver to the localstorage
    const encryptUser = ()=>{
        return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(name), 'receiver').toString();
    }
    localStorage.setItem('receiver_private', encryptUser());

    document.getElementById('parentContainerPrivate-' + name).style.display = 'flex';

    //for checking if this player is active or nah
    socket.emit('friend-status', name);

    //to check if the user is on lobby or not
    socket.emit('friend-on-lobby', name);
}

function backToFront(){
    //bring back to default
    document.getElementById('friendLobby_status').style.display = 'none';
    document.getElementById('friendName').innerText = "Friend Chat";
    document.getElementById('activeFriendStatus').style.display = 'none';

    document.getElementById('friendBackBtn').style.display = 'none';
    document.getElementById('frontFriendPanel').style.display = 'flex';
    document.getElementById('friendChat').style.display = 'none';

    //hide the div
    if(localStorage.getItem('receiver_private')){
        const receiver = CryptoJS.AES.decrypt(localStorage.getItem('receiver_private'), 'receiver').toString(CryptoJS.enc.Utf8);

        if(receiver){
            if(document.getElementById('parentContainerPrivate-' + receiver)){
                document.getElementById('parentContainerPrivate-' + receiver).style.display = 'none';
            }

            //hide the notif for friend
            private_messageCount = 0;
            if(document.getElementById('notifMsg_friend_' + receiver)){
                document.getElementById('notifMsg_friend_' + receiver).style.display = 'none';
            }
            localStorage.removeItem('receiver_private');
        }
    }
}

//END OF FRIEND CHAT FUNCTIONS---------------------------------------

//for searching player
async function search_player_friendList() {
    var searchInput = document.getElementById('search_friendlist');

    if(searchInput.value){
        try{
            const search_list = await fetch('/friendList/searchFriendList', {
                method: "POST",
                headers: {
                    "Accept": "Application/json",
                    "Content-Type": "Application/json"
                },
                body: JSON.stringify({ username: global_username, searchQuery: searchInput.value })
            });

            const divAppend_friendList = (username, user_profile)=>{
                var container = document.getElementById('friendlist-container');

                if(container){
                    //container wrapper
                    var containerWrapper = document.createElement('div');
                    containerWrapper.setAttribute('class', 'w-full h-fit flex justify-center');
                    containerWrapper.setAttribute('id', 'list_div_' + username);

                    //dont append if there is already there, just for clean up
                    if(container.contains(document.getElementById('list_div_' + username)) === false){
                        container.appendChild(containerWrapper);
                    }

                    //container content
                    var containerContent = document.createElement('div');
                    containerContent.setAttribute('class', 'w-fit h-fit p-4 flex flex-col space-y-2');
                    containerWrapper.appendChild(containerContent);

                    //profile, username ans remove button wrapper
                    var userProfileWrapper = document.createElement('div');
                    userProfileWrapper.setAttribute('class', 'flex flex-row space-x-2 items-center');
                    containerContent.appendChild(userProfileWrapper);

                    //profile
                    var profile = document.createElement('img');
                    profile.setAttribute('class', 'w-[3rem] h-[3rem] rounded-full border-2 border-blue-500');
                    profile.setAttribute('alt', 'user profile');
                    profile.setAttribute('src', '/Profile/' + user_profile);
                    userProfileWrapper.appendChild(profile);

                    //username
                    var name = document.createElement('p');
                    name.setAttribute('class', 'font-Pixelify text-md text-black');
                    name.appendChild(document.createTextNode(username));
                    userProfileWrapper.appendChild(name);

                    //unfollow button
                    var unfollowButton = document.createElement('button');
                    unfollowButton.setAttribute('class', 'font-Pixelify text-sm w-fit h-auto p-2 text-white rounded-2xl bg-red-500 hover:bg-red-700');
                    unfollowButton.setAttribute('onclick', 'removeUser("' + username + '", "list_div_' + username + '")');
                    unfollowButton.appendChild(document.createTextNode('Unfriend'));
                    userProfileWrapper.appendChild(unfollowButton);
                }
            }

            const search_listData = await search_list.json();

            //activate search loader
            document.getElementById('searchLoader').style.display = 'flex';

            if(search_listData){
                document.getElementById('searchLoader').style.display = 'none';

                //clear child
                let parent = document.getElementById("friendlist-container");

                let child = parent.lastElementChild;
                while (child) {
                    parent.removeChild(child);
                    child = parent.lastElementChild;
                }
            }

            if(search_listData.message === 'success'){
                divAppend_friendList(search_listData.username, search_listData.profile);
            }
            else{
                let parent = document.getElementById("friendlist-container");
                var divContainer = document.createElement('div');
                divContainer.setAttribute('class', 'w-full h-fit flex justify-center');
                parent.appendChild(divContainer);

                var label = document.createElement('p');
                label.setAttribute('class', 'font-Pixelify text-md text-black');
                label.appendChild(document.createTextNode(search_listData.message));
                divContainer.appendChild(label);
            }
        }
        catch(err){
            console.log(err);
        }
    }
    else{
        let parent = document.getElementById("friendlist-container");

        let child = parent.lastElementChild;
        while (child) {
            parent.removeChild(child);
            child = parent.lastElementChild;
        }
        friendList_view();
    }
}

async function search_player_findfriend() {
    var searchInput = document.getElementById('search_findfriend');

    if(searchInput.value){
        try{
            const search_list = await fetch('/friendList/searchFindFriend', {
                method: "POST",
                headers: {
                    "Accept": "Application/json",
                    "Content-Type": "Application/json"
                },
                body: JSON.stringify({ searchQuery: searchInput.value })
            });

            const divAppend = (username, user_profile)=>{
                var container = document.getElementById('friend-container');

                var wrapper = document.createElement('div');
                wrapper.setAttribute('class', 'w-full h-fit flex justify-center');
                container.appendChild(wrapper);

                var divContainer = document.createElement('div');
                divContainer.setAttribute('class', 'w-fit h-fit p-4 flex flex-row space-x-2 items-center cursor-pointer');
                divContainer.setAttribute('onclick', 'visitUser("' + username + '")');
                wrapper.appendChild(divContainer);

                //image profile
                var profile = document.createElement('img');
                profile.setAttribute('class', 'w-[3rem] h-[3rem] rounded-full border-2 border-blue-500');
                profile.setAttribute('alt', 'user profile');
                profile.setAttribute('src', '/Profile/' + user_profile);
                divContainer.appendChild(profile);

                //username
                var user = document.createElement('p');
                user.setAttribute('class', 'font-Pixelify text-md text-black underline');
                user.appendChild(document.createTextNode(username));
                divContainer.appendChild(user);
            }

            const search_listData = await search_list.json();

            //activate search loader
            document.getElementById('searchLoader').style.display = 'flex';

            if(search_listData){
                document.getElementById('searchLoader').style.display = 'none';

                //clear child
                let parent = document.getElementById("friend-container");

                let child = parent.lastElementChild;
                while (child) {
                    parent.removeChild(child);
                    child = parent.lastElementChild;
                }
            }

            if(search_listData.message === 'success'){
                divAppend(search_listData.username, search_listData.profile);
            }
            else{
                let parent = document.getElementById("friend-container");
                var divContainer = document.createElement('div');
                divContainer.setAttribute('class', 'w-full h-fit flex justify-center');
                parent.appendChild(divContainer);

                var label = document.createElement('p');
                label.setAttribute('class', 'font-Pixelify text-md text-black');
                label.appendChild(document.createTextNode(search_listData.message));
                divContainer.appendChild(label);
            }
        }
        catch(err){
            console.log(err);
        }
    }
    else{
        let parent = document.getElementById("friend-container");

        let child = parent.lastElementChild;
        while (child) {
            parent.removeChild(child);
            child = parent.lastElementChild;
        }
        findFriend_view();
    }
}

async function findFriend_view(){
    try{
        //decrypt the local storage
        const local_username = CryptoJS.AES.decrypt(localStorage.getItem('username'), 'username').toString(CryptoJS.enc.Utf8);

        if(local_username === false){
            window.location.href = '/invalid'
        }
        else{
            const checkPlayers = await fetch('/friendList/displayPlayers', {
                method: "POST",
                headers: {
                    "Accept": "Application/json",
                    "Content-Type": "Application/json"
                },
                body: JSON.stringify({ username: local_username })
            });
            const checkPlayers_data = await checkPlayers.json();

            const divAppend = (username, user_profile)=>{
                var container = document.getElementById('friend-container');

                var wrapper = document.createElement('div');
                wrapper.setAttribute('class', 'w-full h-fit flex justify-center');
                container.appendChild(wrapper);

                var divContainer = document.createElement('div');
                divContainer.setAttribute('class', 'w-fit h-fit p-4 flex flex-row space-x-2 items-center cursor-pointer');
                divContainer.setAttribute('onclick', 'visitUser("' + username + '")');
                wrapper.appendChild(divContainer);

                //image profile
                var profile = document.createElement('img');
                profile.setAttribute('class', 'w-[3rem] h-[3rem] rounded-full border-2 border-blue-500');
                profile.setAttribute('alt', 'user profile');
                profile.setAttribute('src', '/Profile/' + user_profile);
                divContainer.appendChild(profile);

                //username
                var user = document.createElement('p');
                user.setAttribute('class', 'font-Pixelify text-md text-black underline');
                user.appendChild(document.createTextNode(username));
                divContainer.appendChild(user);
            }

            if(checkPlayers_data.message === 'success'){
                document.getElementById('searchLoader').style.display = 'none';

                //display stuff
                for(let i = 0; i < checkPlayers_data.list.length; i++){
                    divAppend(checkPlayers_data.list[i]['username'], checkPlayers_data.list[i]['profile']);
                }
            }
        }
    }
    catch(err){
        console.log(err);
    }
}

//for checking friend list
async function friendList_view(){
    try{
        //decrypt the local storage
        const local_username = CryptoJS.AES.decrypt(localStorage.getItem('username'), 'username').toString(CryptoJS.enc.Utf8);

        if(local_username === false){
            window.location.href = '/Invalid';
        }
        else{
            const checkPlayers = await fetch('/friendList/displayFriend', {
                method: "POST",
                headers: {
                    "Accept": "Application/json",
                    "Content-Type": "Application/json"
                },
                body: JSON.stringify({ username: local_username })
            });
            const checkPlayers_data = await checkPlayers.json();

            const divAppend_friendRequest = (username, user_profile)=>{
                var container = document.getElementById('requestPanel');

               if(container){
                    //container wrapper
                    var containerWrapper = document.createElement('div');
                    containerWrapper.setAttribute('class', 'w-full h-fit flex justify-center');
                    containerWrapper.setAttribute('id', 'req_div_' + username);
                    container.appendChild(containerWrapper);

                    //container content
                    var containerContent = document.createElement('div');
                    containerContent.setAttribute('class', 'w-fit h-fit p-4 flex flex-col space-y-2');
                    containerWrapper.appendChild(containerContent);

                    //profile and username wrapper
                    var userProfileWrapper = document.createElement('div');
                    userProfileWrapper.setAttribute('class', 'flex flex-row space-x-2 items-center cursor-pointer');
                    containerContent.appendChild(userProfileWrapper);

                    //profile
                    var profile = document.createElement('img');
                    profile.setAttribute('class', 'w-[3rem] h-[3rem] rounded-full border-2 border-blue-500');
                    profile.setAttribute('alt', 'user profile');
                    profile.setAttribute('src', '/Profile/' + user_profile);
                    userProfileWrapper.appendChild(profile);

                    //username
                    var name = document.createElement('p');
                    name.setAttribute('class', 'font-Pixelify text-md text-black underline');
                    name.appendChild(document.createTextNode(username));
                    userProfileWrapper.appendChild(name);

                    //button holder
                    var buttonWrapper = document.createElement('div');
                    buttonWrapper.setAttribute('class', 'flex flex-row space-x-4');
                    containerContent.appendChild(buttonWrapper);

                    //accept button
                    var acceptButton = document.createElement('button');
                    acceptButton.setAttribute('class', 'font-Pixelify text-sm w-fit h-auto p-2 text-white rounded-2xl bg-blue-500 hover:bg-blue-700');
                    acceptButton.setAttribute('onclick', 'addUser("' + username + '", "req_div_' + username + '")');
                    acceptButton.appendChild(document.createTextNode('Accept'));
                    buttonWrapper.appendChild(acceptButton);

                    //decline button
                    var declineButton = document.createElement('button');
                    declineButton.setAttribute('class', 'font-Pixelify text-sm w-fit h-auto p-2 text-white rounded-2xl bg-red-500 hover:bg-red-700');
                    declineButton.setAttribute('onclick', 'declineUser("' + username + '", "req_div_' + username + '")');
                    declineButton.appendChild(document.createTextNode('Decline'));
                    buttonWrapper.appendChild(declineButton);
               }
            }

            const divAppend_friendList = (username, user_profile)=>{
                var container = document.getElementById('friendlist-container');

                if(container){
                    //container wrapper
                    var containerWrapper = document.createElement('div');
                    containerWrapper.setAttribute('class', 'w-full h-fit flex justify-center');
                    containerWrapper.setAttribute('id', 'list_div_' + username);

                    //dont append if there is already there, just for clean up
                    if(container.contains(document.getElementById('list_div_' + username)) === false){
                        container.appendChild(containerWrapper);
                    }

                    //container content
                    var containerContent = document.createElement('div');
                    containerContent.setAttribute('class', 'w-fit h-fit p-4 flex flex-col space-y-2');
                    containerWrapper.appendChild(containerContent);

                    //profile, username ans remove button wrapper
                    var userProfileWrapper = document.createElement('div');
                    userProfileWrapper.setAttribute('class', 'flex flex-row space-x-2 items-center');
                    containerContent.appendChild(userProfileWrapper);

                    //profile
                    var profile = document.createElement('img');
                    profile.setAttribute('class', 'w-[3rem] h-[3rem] rounded-full border-2 border-blue-500');
                    profile.setAttribute('alt', 'user profile');
                    profile.setAttribute('src', '/Profile/' + user_profile);
                    userProfileWrapper.appendChild(profile);

                    //username
                    var name = document.createElement('p');
                    name.setAttribute('class', 'font-Pixelify text-md text-black');
                    name.appendChild(document.createTextNode(username));
                    userProfileWrapper.appendChild(name);

                    //unfollow button
                    var unfollowButton = document.createElement('button');
                    unfollowButton.setAttribute('class', 'font-Pixelify text-sm w-fit h-auto p-2 text-white rounded-2xl bg-red-500 hover:bg-red-700');
                    unfollowButton.setAttribute('onclick', 'removeUser("' + username + '", "list_div_' + username + '")');
                    unfollowButton.appendChild(document.createTextNode('Unfriend'));
                    userProfileWrapper.appendChild(unfollowButton);
                }
            }

            if(checkPlayers_data.message === 'success'){
                document.getElementById('searchLoader').style.display = 'none';
                
                //display stuff on request
                for(let i = 0; i < checkPlayers_data.requestList.length; i++){
                    divAppend_friendRequest(checkPlayers_data.requestList[i]['username'], checkPlayers_data.requestList[i]['profile']);
                }

                //display stuff on friendlist
                for(let i = 0; i < checkPlayers_data.friendList.length; i++){
                    divAppend_friendList(checkPlayers_data.friendList[i]['username'], checkPlayers_data.friendList[i]['profile']);
                }
            }
        }
    }
    catch(err){
        console.log(err);
    }
}

//for declining user
async function declineUser(targetName, id){
    try{
        const removeReq = await fetch('/friendList/declineUserRequest', {
            method: "POST",
            headers: {
                "Accept": "Application/json",
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({ username: global_username, targetPlayer: targetName })
        });

        const removeReq_data = await removeReq.json();

        if(removeReq_data.message === 'success'){
            var child = document.getElementById(id);

            if(child){
                socket.emit('request_decline', targetName);
                child.parentNode.removeChild(child);
                friendList_view();
            }
        }
    }
    catch(err){
        console.log(err);
    }
}

//for accepting user
async function addUser(targetName, id){
    notifyAllUsers();
    try{
        const addReq = await fetch('/friendList/addUserRequest', {
            method: "POST",
            headers: {
                "Accept": "Application/json",
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({ username: global_username, targetPlayer: targetName })
        });

        const addReq_data = await addReq.json();

        if(addReq_data.message === 'success'){
            var child = document.getElementById(id);

            if(child){
                child.parentNode.removeChild(child);
                friendList_view();

                //notify the other end
                socket.emit('request_accepted', targetName);
            }
        }
    }
    catch(err){
        console.log(err);
    }
}

//for removing user on the friend list
async function removeUser(targetName, id){
    notifyAllUsers();
    try{
        const addReq = await fetch('/friendList/removeUserToList', {
            method: "POST",
            headers: {
                "Accept": "Application/json",
                "Content-Type": "Application/json"
            },
            body: JSON.stringify({ username: global_username, targetPlayer: targetName })
        });

        const addReq_data = await addReq.json();

        if(addReq_data.message === 'success'){
            var child = document.getElementById(id);

            if(child){
                child.parentNode.removeChild(child);

                //notify the other end
                socket.emit('list_removed', targetName, 'list_div_' + global_username, global_username);
                friendList_view();
            }
        }
    }
    catch(err){
        console.log(err);
    }
}

//for visiting user profile
async function visitUser(username) {
    imInLobby(true, global_username);

    const checkUser = await fetch('/player', {
        method: "POST",
        headers: {
            "Accept": "Application/json",
            "Content-Type": "Application/json"
        },
        body: JSON.stringify({ username: username })
    });

    const checkUserData = await checkUser.json();

    if(checkUserData.message === 'success'){
        window.location.href = '/player/' + username;
    }
}

//restarting status
function restartStatus_private(){
    private_messageCount = 0;
    document.getElementById('notifMsg_friend').style.display = 'none';
}