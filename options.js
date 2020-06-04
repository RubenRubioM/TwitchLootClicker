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


function AddChannelPoints(){
    var div = document.getElementById('channel-stats-list');

    chrome.storage.sync.get(['ChannelsPoints'], function(result){
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
            sortedRanking.forEach(function(element, i, array){
                //Create an ordered list and store values for the plot
                div.innerHTML += `<li>  <a href='${element.name}'>${element.name}</a> --- ${element.points} pts`;
                var lastSlash = element.name.lastIndexOf('/');
                var res = element.name.substring(lastSlash+1);
                res = res.charAt(0).toUpperCase() + res.slice(1);
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
                  offset: 200,
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
    chrome.storage.sync.get(['ChannelsPoints'], function(result){
        if(!isEmpty(result)){


            chrome.storage.sync.remove(['ChannelsPoints'], function() {
                console.log('All channels deleted');
            });
        }
    });
}



