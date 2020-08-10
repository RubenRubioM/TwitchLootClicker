document.body.onload = AddChannelPoints();
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}
function millisToMinutesAndSeconds(millis) {
    if(millis < 0){
        return "Ready to claim";
    }
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}
document.addEventListener('DOMContentLoaded', function() {
    var link = document.getElementById('resetCount');
    // onClick's logic below:
    link.addEventListener('click', function() {
        ResetAllPoints();
    });
});

function AddChannelPoints(){


    var div = document.getElementById('table-stats');

    chrome.storage.local.get(['ChannelsPoints'], function(result){
        if(!isEmpty(result)){
            //To order the objects
            var sortedRanking = result['ChannelsPoints'].sort(function(a,b){
                if(a.points<b.points){
                    return 1;
                }else{
                    return -1;
                }
            });

            var labels = [];
            var values = [];
            var position = 1;
            sortedRanking.forEach(function(element, i, array){
                //Create an ordered list and store values for the plot
                //div.innerHTML += `<li>  <a href='${element.name}'>${element.name}</a> --- ${element.points} pts`;
               
                var lastSlash = element.name.lastIndexOf('/');
                var res = element.name.substring(lastSlash+1);
                res = res.charAt(0).toUpperCase() + res.slice(1);

                div.innerHTML += `  <tr>
                                        <th scope="row">${position++}</th>
                                        <td><a href="${element.name}">${res}</a></td> 
                                        <td> ${element.points} </td>
                                        <td> ${ millisToMinutesAndSeconds(element.timeToBox)} </td>
                                    </tr>`;
                labels.push(res);
                
                values.push(element.points);
            });
            
            let chartHeight = (1000/25) * values.length;
            //console.log(chartHeight);
            //Create the plot, type bar
            new Chartist.Bar('.ct-chart', {
                labels,
                //values,
                series: [values]
              }, {
                seriesBarDistance: 5,
                reverseData: true,
                horizontalBars: true,
                height: chartHeight,
                axisY: {
                  offset: 100,
                  showGrid: false
                },
                axisX: {
                    showGrid: true
                }
            });


        }else{

        }
    });
}

function ResetAllPoints(){
    chrome.storage.local.get(['ChannelsPoints'], function(result){
        if(!isEmpty(result)){


            chrome.storage.local.remove(['ChannelsPoints'], function() {
                console.log('All channels deleted');
                alert("All channel points reseted");
            });
        }
    });

    setInterval(StorageLocalToSync,100);
}

/**
 * Save the local storage to the cloud storage
 */
function StorageLocalToSync(){
    chrome.storage.local.get(['ChannelsPoints'], function(result){

        chrome.storage.sync.set({'ChannelsPoints': result['ChannelsPoints']}, function() {
            //console.log('El nuevo valor de  ' +channel.name+ ' es ahora ' + channel.points);
        });
    });

}

/**
 * Save the cloud storage to the local storage
 
function StorageSyncToLocal(){
    chrome.storage.sync.get(['ChannelsPoints'], function(result){
        chrome.storage.local.set({'ChannelsPoints': result['ChannelsPoints']}, function() {
            //console.log('El nuevo de  ' +channel.name+ ' es ' + channel.points);
        });
    });
}
*/

function DEBUG_ADD_POINTS(channel){
    var url = channel;
    url = url.split('?')[0]; //In case we have Ninja?referred=raid we get only Ninja
    chrome.storage.local.get(['ChannelsPoints'], function(result){
        var channel = {name: url, points: 50, timeToBox: 894000};
        if(isEmpty(result)){
            var channelArray = [];
            channelArray.push(channel);
            chrome.storage.local.set({'ChannelsPoints': channelArray}, function() {
                //console.log('El nuevo valor de  ' +channel.name+ ' es ahora ' + channel.points);
            });
        }else{

            //To check if this channel already exists
            var found = false;
            result['ChannelsPoints'].forEach(function(element, i, array){
                if(element.name == url){
                    //We already have stored this channel
                    element.points += 50; //TODO: Change this static 50 for 100 if he is suscribed
                    element.timeToBox = 894000;
                    //console.log(element.points);
                    found = true;
                }
            });
            
            //If the channel identified is not in the storage, we create a new object
            if(!found){
                result['ChannelsPoints'].push(channel);
            }

            chrome.storage.local.set({'ChannelsPoints': result['ChannelsPoints']}, function() {
                //console.log('El nuevo valor de  ' +channel.name+ ' es ahora ' + channel.points);
            });

        }
    });
}