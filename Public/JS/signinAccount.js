//creating account
async function createAccount(){
    let username = document.getElementById('signinInputUser').value;
    let password = document.getElementById('signinInputPass').value;
    let confirmPass = document.getElementById('signinInputRePass').value;

    try{
        const result = await fetch('/signin/validateNewAcc', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: username, password: password, confirmPass: confirmPass })
        });

        const data = await result.json();

        if(data.message === 'success'){
            document.getElementById('error-text-p').innerText = '';
            document.getElementById('loadingSpinner').style.display = 'flex';

            navigateDashBoard(data.user);
        }
        else{
            document.getElementById('error-text-p').innerText = data.message;
        }
    }
    catch (err){
        console.log(err);
    }
}

//going to sign in page
function signin(){
    document.getElementById('loadingSpinner').style.display = 'flex';

    setTimeout(() => {
        location.href = '/signin';
    }, 100);
}