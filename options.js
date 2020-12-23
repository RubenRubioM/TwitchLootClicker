document.body.onload = LoadConfiguration();

var channelsData;
var labels;
var values;

/**
 * Converts points to time watched
 * @param {Channel points} points 
 * @param {Time to next box used for offset} leftTimeToBox 
 */
function pointsToTime(points, leftTimeToBox){
    var time = minutesToMilliseconds(minutesBetweenBoxes * (points/pointsPerBox));
    time = time + (minutesToMilliseconds(minutesBetweenBoxes) - leftTimeToBox);

    return millisToHoursMinutesAndSeconds(time);
}

/**
 * Deletes all the charts
 */
function DeleteCharts() {
    var barChart = document.getElementById('ct-chart-bar');
    var pieChart = document.getElementById('ct-chart-pie');
    var barChannelChart = document.getElementById('ct-chart-bar-channel');

    if(barChart != null) barChart.parentNode.removeChild(barChart);
    if(pieChart != null) pieChart.parentNode.removeChild(pieChart);
    if(barChannelChart != null) barChannelChart.parentNode.removeChild(barChannelChart);
}

/**
 * Triggered when loading the page
 */
document.addEventListener('DOMContentLoaded', function() {
    var resetButton = document.getElementById('resetCount');
    var barChartButton = document.getElementById('barChartButton');
    var pieChartButton = document.getElementById('pieChartButton');
    // onClick's logic below:
    resetButton.addEventListener('click', function() {
        ResetAllPoints();
    });

    barChartButton.addEventListener('click', function() {
        var chartDiv = document.getElementById('chart-div');

        DeleteCharts();

        var newElement = document.createElement('div');
        newElement.innerHTML = `<div class="ct-chart ct-golden-section d-flex justify-content-center" id="ct-chart-bar"></div>`;
        chartDiv.appendChild(newElement);
        DrawHorizontalBarChart();
    });

    pieChartButton.addEventListener('click', function() {
        var chartDiv = document.getElementById('chart-div');

        DeleteCharts();

        var newElement = document.createElement('div');
        chartDiv.innerHTML = `<div class="ct-chart ct-golden-section d-flex justify-content-center" id="ct-chart-pie"></div>`;
        chartDiv.appendChild(newElement);
        DrawPieChart();
    });
});

/**
 * Load configuration
 */
function LoadConfiguration() {
    AddVersionString();
    AddInitialHTML();
}

/**
 * Adds the initial HTML which is generated dynamically
 */
function AddInitialHTML(){

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
                                        <td>${res} <a href="${element.name}"><i class="fab fa-twitch"></i></a>  <span class="channelChartIcon" id="${res}-chart" data-name=${element.name}><i class="fas fa-chart-bar" ></i></span></td> 
                                        <td title="Tier 1 sub: ${element.points * 1.2} &#xA;Tier 2 sub: ${element.points * 1.5} &#xA;Tier 3 sub: ${element.points * 2}"> ${element.points} </td>
                                        <td> ${ millisToMinutesAndSeconds(element.timeToBox) } </td>
                                        <td> ${ pointsToTime(element.points, element.timeToBox) } </td>
                                    </tr>`;
                labels.push(res);
                values.push(element.points);
            });
            
            DrawHorizontalBarChart();    
            SetUpChannelChartsListeners();        
        }
    });
}

/**
 * Add the event listeners for the channel chart icons
 */
function SetUpChannelChartsListeners() {
    const spans = document.getElementsByClassName("channelChartIcon");

    for (let i = 0; i < spans.length; i++) {
        spans[i].addEventListener('click', function() {
            DrawChannelChart(spans[i].dataset['name'])
        }); 
    }

}

/**
 * Draw channel chart of the channel name given
 * @param {Name to search in the channelsData} name 
 */
function DrawChannelChart(name) {
    console.log(name);

    DeleteCharts();
}

/**
 * Draw the channels horizontal bar chart
 */
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

/**
 * Draw the channels pie chart
 */
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

/**
 * Add extension version in the footer
 */
function AddVersionString(){
    var manifestData = chrome.runtime.getManifest();
    document.getElementById('versionString').innerHTML = manifestData.version;
}

/**
 * Resets all sync points
 */
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
 * Save local storage in sync
 */
function StorageLocalToSync(){
    chrome.storage.local.get(['ChannelsPoints'], function(result){

        chrome.storage.sync.set({'ChannelsPoints': result['ChannelsPoints']}, function() {
            console.log("Local storage synced!");
        });
    });

}

/**
 * Adds points to the channel given
 * @param {name of the channel} name 
 */
function DEBUG_ADD_POINTS(name){
    AddChannel(name)
    setInterval(StorageLocalToSync,1000)
}