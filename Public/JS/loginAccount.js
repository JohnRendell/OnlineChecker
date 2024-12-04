async function login(){
    let username = document.getElementById('loginInputUser').value;
    let password = document.getElementById('loginInputPass').value;

    try{
        const fetchData = await fetch('/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, password: password })
        });

        const data = await fetchData.json();

        if(data.message === 'success'){
            document.getElementById('error-text-p').innerText = '';
            document.getElementById('loadingSpinner').style.display = 'flex';
            navigateDashBoard(data.user);
        }
        else{
            document.getElementById('error-text-p').innerText = data.message;
        }
    } catch (err){
        console.log(err);
    }
}

//for guest mode
async function guestMode(){
    function generateGuestID(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
        }
        return result;
    }

    let username = 'guest_' + generateGuestID(5);

    //set the user status, encrypt the username and the key
    const encryptUser = ()=>{
        return CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(username), 'username').toString();
    }

    const guestToken = await fetch('/guest', {
        method: "POST",
        headers: {
            "Accept": "Application/json",
            "Content-Type": "Application/json"
        },
        body: JSON.stringify({ username: encryptUser() })
    })

    const guestTokenData = await guestToken.json();

    if(guestTokenData.message === 'success'){
        navigateDashBoard(encryptUser());
    }
}


//for automatic login, check the cookies on the browser
window.onload = async ()=>{
    try{
        const getCookie = await fetch('/cookie/getCookie');
        const getCookieData = await getCookie.json();

        //if cookies are there
        if(getCookieData.status === 'success' && localStorage.getItem('username')){
            const decrypt_user = CryptoJS.AES.decrypt(localStorage.getItem('username'), 'username').toString(CryptoJS.enc.Utf8);

            if(decrypt_user && getCookieData.cookieValue === decrypt_user){
                navigateDashBoard(localStorage.getItem('username'));
            }
            else{
                const getCookie = await fetch('/cookie/deleteCookie');
                const getCookieData = getCookie.ok;

                //if cookies are there
                if(getCookieData){
                    localStorage.clear();
                }
            }
        }
        else{
            const getCookie = await fetch('/cookie/deleteCookie');
            const getCookieData = getCookie.ok;

            //if cookies are there
            if(getCookieData){
                localStorage.clear();
            }
        }
    }
    catch(err){
        console.log(err);
    }
}

//for logged in using enter key
document.addEventListener("keypress", function(event) {
    if (event.keyCode == 13) {
        login();
    }
});