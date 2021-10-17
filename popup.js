// function isEmpty(obj) {
//   for(var key in obj) {
//       if(obj.hasOwnProperty(key))
//           return false;
//   }
//   return true;
// }

document.addEventListener('DOMContentLoaded', function() {
    var goToStatsButton = document.getElementById('goToStats');

    goToStatsButton.addEventListener('click', function() {
        window.open("chrome-extension://" + chrome.runtime.id + "/options.html", '_blank').focus(); 
    });
});

// function UpdateTimeLeft(){
//     console.log("ENTRA POPUP");
//     var div = document.getElementById('time-to-box');
//     var url = window.location.href;
//     chrome.storage.sync.get(['ChannelsPoints'], function(result){
//         if(!isEmpty(result)){

//             result['ChannelsPoints'].forEach(function(element, i, array){
//                 if(element.name == url){
//                     div.innerText = element.timeToBox;
//                 }
//             });
//         }
//     });
// }

// setInterval(UpdateTimeLeft,1000);