document.body.onload = LoadConfiguration();

var channelsData;
var labels;
var values;

// Convert points to time watched.
// Every 50 points is 15 minutes.
// <param name="points"> Channel points </param>
// <param name="leftTimeToBox"> Time to next box used for offset </param>
function pointsToTime(points, leftTimeToBox){
    var time = minutesToMilliseconds(minutesBetweenBoxes * (points/pointsPerBox));
    time = time + (minutesToMilliseconds(minutesBetweenBoxes) - leftTimeToBox);

    return millisToHoursMinutesAndSeconds(time);
}

// Reset points event listener
document.addEventListener('DOMContentLoaded', function() {
    var resetButton = document.getElementById('resetCount');
    var barChartButton = document.getElementById('barChartButton');
    var pieChartButton = document.getElementById('pieChartButton');
    // onClick's logic below:
    resetButton.addEventListener('click', function() {
        ResetAllPoints();
    });

    barChartButton.addEventListener('click', function() {
        var barChart = document.getElementById('ct-chart-bar');
        var pieChart = document.getElementById('ct-chart-pie');
        var barChannelChart = document.getElementById('ct-chart-bar-channel');
        var chartDiv = document.getElementById('chart-div');

        if(barChart != null) barChart.parentNode.removeChild(barChart);
        if(pieChart != null) pieChart.parentNode.removeChild(pieChart);
        if(barChannelChart != null) barChannelChart.parentNode.removeChild(barChannelChart);

        var newElement = document.createElement('div');
        newElement.innerHTML = `<div class="ct-chart ct-golden-section d-flex justify-content-center" id="ct-chart-bar"></div>`;
        chartDiv.appendChild(newElement);
        DrawHorizontalBarChart();
    });

    pieChartButton.addEventListener('click', function() {
        var barChart = document.getElementById('ct-chart-bar');
        var pieChart = document.getElementById('ct-chart-pie');
        var barChannelChart = document.getElementById('ct-chart-bar-channel');
        var chartDiv = document.getElementById('chart-div');

        if(barChart != null) barChart.parentNode.removeChild(barChart);
        if(pieChart != null) pieChart.parentNode.removeChild(pieChart);
        if(barChannelChart != null) barChannelChart.parentNode.removeChild(barChannelChart);

        var newElement = document.createElement('div');
        chartDiv.innerHTML = `<div class="ct-chart ct-golden-section d-flex justify-content-center" id="ct-chart-pie"></div>`;
        chartDiv.appendChild(newElement);
        DrawPieChart();
    });
});


function LoadConfiguration() {
    AddVersionString();
    AddChannelPoints();
}

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

            channelsData = sortedRanking;

            labels = [];
            values = [];
            var position = 1;
            sortedRanking.forEach(function(element, i, array){
                //Create an ordered list and store values for the plot
               
                var lastSlash = element.name.lastIndexOf('/');
                var res = element.name.substring(lastSlash+1);
                res = res.charAt(0).toUpperCase() + res.slice(1);

                div.innerHTML += `  <tr>
                                        <th scope="row">${position++}</th>
                                        <td><a href="${element.name}">${res}</a></td> 
                                        <td title="Tier 1 sub: ${element.points * 1.2} &#xA;Tier 2 sub: ${element.points * 1.5} &#xA;Tier 3 sub: ${element.points * 2}"> ${element.points} </td>
                                        <td> ${ millisToMinutesAndSeconds(element.timeToBox) } </td>
                                        <td> ${ pointsToTime(element.points, element.timeToBox) } </td>
                                    </tr>`;
                labels.push(res);
                
                values.push(element.points);
            });
            
            DrawHorizontalBarChart();            
        }
    });
}

function DrawHorizontalBarChart() {
    let chartHeight = (1000/25) * values.length;

    //Create the plot, type bar
    new Chartist.Bar('#ct-chart-bar', {
        labels: labels,
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
    }, {
        //Options
    }, [
        //ResponsiveOptions
    ]);
}

function DrawPieChart() {
    var pieLabels = [];
    const sum = values.reduce((partial_sum, a) => partial_sum + a,0); 

    labels.forEach(function(element, i, array){        
        var label = element + " (" + ((values[i]/sum)*100).toFixed(2) + "%)";
        pieLabels.push(label);
    });

    //Create the plot, type bar
    new Chartist.Pie('#ct-chart-pie',{
        labels: pieLabels,
        series: values,
    }, {
        width: 600,
        height: 600,
        chartPadding: 10,
        total: sum,
        showLabel: true,
        labelPosition: 'center',
        labelOffset: 225,
        labelDirection: 'neutral'
    },{
        //Options
    },[
        //ResponsiveOptions
    ]);

}

function AddVersionString(){
    var manifestData = chrome.runtime.getManifest();
    document.getElementById('versionString').innerHTML = manifestData.version;
}

function ResetAllPoints(){
    var response = confirm("Do you really want to reset all the points?");

    if(response){
        chrome.storage.local.get(['ChannelsPoints'], function(result){
            if(!isEmpty(result)){
                chrome.storage.local.remove(['ChannelsPoints'], function() {
                    console.log('All channels deleted');
                    alert("All channel points reseted");
                });
            }
        });
    }
    
    setInterval(StorageLocalToSync,100);
}

/**
 * Save the local storage to the cloud storage
 */
function StorageLocalToSync(){
    chrome.storage.local.get(['ChannelsPoints'], function(result){

        chrome.storage.sync.set({'ChannelsPoints': result['ChannelsPoints']}, function() {
            console.log("Local storage synced!");
        });
    });

}

function DEBUG_ADD_POINTS(name){
    AddChannel(name)
    setInterval(StorageLocalToSync,1000)
}