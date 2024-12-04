async function checkHistory(){
    document.getElementById('searchLoader').style.display = 'flex';
    try{
        const displayHistory = await fetch('/history/displayHistory', {
            method: "POST",
            headers: {
                "Content-Type": "Application/json",
                "Accept": "Application/json"
            },
            body: JSON.stringify({ username: global_username })
        });

        const displayHistory_data = await displayHistory.json();

        if(displayHistory_data.message === 'success'){
            document.getElementById('searchLoader').style.display = 'none';
            const appendingHistoryTab = (status, lobby, opponent, time, date, trophy)=>{
                let containerColor = status === 'win' ? 'from-green-500' : 'from-red-500';
                var parent = document.getElementById('historyContainer');

                //for container
                var contentContainer = document.createElement('div');
                contentContainer.setAttribute('class', 'w-full h-fit p-2 grid grid-rows-2 bg-gradient-to-r ' + containerColor + ' to-blue-500 rounded-2xl items-center');
                parent.appendChild(contentContainer);

                //for lobby and date wrapper
                var lobbyDiv = document.createElement('div');
                lobbyDiv.setAttribute('class', 'flex flex-row space-x-2 justify-start');
                contentContainer.appendChild(lobbyDiv);

                //lobby type
                var lobbyType = document.createElement('p');
                lobbyType.setAttribute('class', 'font-Pixelify text-[12px] text-center text-white font-bold xsm:text-[10px] md:text-sm');
                lobbyType.appendChild(document.createTextNode(lobby));
                lobbyDiv.appendChild(lobbyType);

                //history date
                var historyDate = document.createElement('p');
                historyDate.setAttribute('class', 'font-Pixelify text-[12px] text-center text-white font-bold xsm:text-[10px] md:text-sm');
                historyDate.appendChild(document.createTextNode(date));
                lobbyDiv.appendChild(historyDate);

                //opponent and player name display
                var nameDisplay = document.createElement('p');
                nameDisplay.setAttribute('class', 'font-Pixelify text-[12px] text-center text-white font-bold xsm:text-[10px] md:text-sm');
                nameDisplay.appendChild(document.createTextNode(global_username + ' vs ' + opponent));
                contentContainer.appendChild(nameDisplay);

                //wrapper for time and trophy
                var wrapperLeft = document.createElement('div');
                wrapperLeft.setAttribute('class', 'flex flex-row space-x-2 justify-end');
                contentContainer.appendChild(wrapperLeft);

                //time remaining
                var timeRemain = document.createElement('p');
                timeRemain.setAttribute('class', 'font-Pixelify text-[12px] text-center text-white font-bold xsm:text-[10px] md:text-sm');
                timeRemain.appendChild(document.createTextNode('Time Remaining: ' + time));
                wrapperLeft.appendChild(timeRemain);

                //trophy got
                var trophyGot = document.createElement('p');
                trophyGot.setAttribute('class', 'font-Pixelify text-[12px] text-center text-white font-bold xsm:text-[10px] md:text-sm');
                trophyGot.appendChild(document.createTextNode('Trophy earn: ' + trophy));
                wrapperLeft.appendChild(trophyGot);
            }
            for(let i = 0; i < displayHistory_data.historyCount; i++){
                let history = displayHistory_data.history[i];

                //history component
                let status = history.win_status;
                let lobby = history.lobbyType;
                let opponent = history.opponent;
                let time = history.time;
                let date = history.date;
                let trophy = history.trophy;

                appendingHistoryTab(status, lobby, opponent, time, date, trophy);
            }            
        }
    }
    catch(err){
        console.log(err);
    }
}