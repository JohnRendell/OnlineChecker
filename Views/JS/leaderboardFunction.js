//display all players sort by number of trophies
async function displayPlayers_trophies(){
    if(document.getElementById('searchLoader')){
        document.getElementById('searchLoader').style.display = 'flex';
    }
    try{
        const displayTrophy = await fetch('/leaderboard', {
            method: "POST",
            headers: {
                "Content-Type": "Application/json",
                "Accept": "Application/json"
            },
            body: JSON.stringify({ guaranteedAccess: true })
        });

        const displayTrophy_data = await displayTrophy.json();
        const username = CryptoJS.AES.decrypt(localStorage.getItem('username'), 'username').toString(CryptoJS.enc.Utf8);

        if(displayTrophy_data.message === 'success' && username){
            document.getElementById('playerCount').innerText = 'Total Players: ' + displayTrophy_data.count;
            
            if(document.getElementById('searchLoader')){
                document.getElementById('searchLoader').style.display = 'none';
            }
            const users = displayTrophy_data.player;

            const appendPlayer = (player, trophy, rankCount)=>{
                const isYou = player === username;
                const highlight = isYou === true ? 'bg-blue-400' : 'bg-none';
                const textHighlight = isYou === true ? 'text-white' : 'text-black';

                var container = document.getElementById('leaderboardContainer');
                const divContainer = document.createElement('div');
                divContainer.setAttribute('class', 'grid grid-cols-3 w-full rounded-2xl ' + highlight);
                container.appendChild(divContainer);

                const rank = document.createElement('p');
                rank.setAttribute('class', 'font-Pixelify font-bold text-center ' + textHighlight);
                rank.appendChild(document.createTextNode(rankCount));

                const name = document.createElement('p');
                name.setAttribute('class', 'font-Pixelify font-bold text-center ' + textHighlight);
                name.appendChild(document.createTextNode(player));

                const trophyCount = document.createElement('p');
                trophyCount.setAttribute('class', 'font-Pixelify font-bold text-center ' + textHighlight);
                trophyCount.appendChild(document.createTextNode(trophy));

                divContainer.appendChild(rank);
                divContainer.appendChild(name);
                divContainer.appendChild(trophyCount);
            }

            users.forEach(player => {
                appendPlayer(player.username, player.trophy, player.rank);
            });
        }
    } 
    catch(err){
        console.log(err);
    }
}

//for searching players:
async function search_player_leaderboard(){
    const query = document.getElementById('search_leaderboard');

    if(query.value){
        try{
            const findUser = await fetch('/leaderboard/searchPlayer', {
                method: "POST",
                headers: {
                    "Content-Type": "Application/json",
                    "Accept": "Application/json"
                },
                body: JSON.stringify({ username: query.value })
            });

            const findUser_data = await findUser.json();

            if(findUser_data.message === 'success'){
                var container = document.getElementById('leaderboardContainer');

                let child = container.lastElementChild;
                while (child) {
                    container.removeChild(child);
                    child = container.lastElementChild;
                }

                if(document.getElementById('searchLoader')){
                    document.getElementById('searchLoader').style.display = 'none';
                }

                const appendPlayer = (player, trophy, rankCount)=>{
                    const divContainer = document.createElement('div');
                    divContainer.setAttribute('class', 'grid grid-cols-3 w-full rounded-2xl');
                    container.appendChild(divContainer);

                    const rank = document.createElement('p');
                    rank.setAttribute('class', 'font-Pixelify font-bold text-center text-black');
                    rank.appendChild(document.createTextNode(rankCount));

                    const name = document.createElement('p');
                    name.setAttribute('class', 'font-Pixelify font-bold text-center text-black');
                    name.appendChild(document.createTextNode(player));

                    const trophyCount = document.createElement('p');
                    trophyCount.setAttribute('class', 'font-Pixelify font-bold text-center text-black');
                    trophyCount.appendChild(document.createTextNode(trophy));

                    divContainer.appendChild(rank);
                    divContainer.appendChild(name);
                    divContainer.appendChild(trophyCount);
                }
                appendPlayer(findUser_data.username, findUser_data.trophy, findUser_data.rank);
            }
            else{
                var container = document.getElementById('leaderboardContainer');

                let child = container.lastElementChild;
                while (child) {
                    container.removeChild(child);
                    child = container.lastElementChild;
                }

                const queryP = document.createElement('p');
                queryP.setAttribute('class', 'font-Pixelify font-bold text-center text-black');
                queryP.appendChild(document.createTextNode(findUser_data.message));
                container.appendChild(queryP);
            }
        }
        catch(err){
            console.log(err);
        }
    }
    else{
        var container = document.getElementById('leaderboardContainer');

        let child = container.lastElementChild;
        while (child) {
            container.removeChild(child);
            child = container.lastElementChild;
        }
        displayPlayers_trophies();
    }
}