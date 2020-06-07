document.body.onload = AddChannelPoints();

document.addEventListener('DOMContentLoaded', function() {
    var link = document.getElementById('resetCount');
    // onClick's logic below:
    link.addEventListener('click', function() {
        ResetAllPoints();
    });
});

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

function AddChannelPoints(){

    StorageLocalInSync();

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
            
            //Create the plot, type bar
            new Chartist.Bar('.ct-chart', {
                labels,
                //values,
                series: [values]
              }, {
                seriesBarDistance: 5,
                reverseData: true,
                horizontalBars: true,
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
}



function StorageLocalInSync(){
    chrome.storage.local.get(['ChannelsPoints'], function(result){

        chrome.storage.sync.set({'ChannelsPoints': result['ChannelsPoints']}, function() {
            //console.log('El nuevo valor de  ' +channel.name+ ' es ahora ' + channel.points);
        });
    });
}
    