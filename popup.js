function isEmpty(obj) {
  for(var key in obj) {
      if(obj.hasOwnProperty(key))
          return false;
  }
  return true;
}

chrome.runtime.onMessage.addListener(function(response,sender,sendResponse){
    console.log(response);
});

function UpdateTimeLeft(){
    var div = document.getElementById('time-to-box');
    var url = window.location.href;
    chrome.storage.sync.get(['ChannelsPoints'], function(result){
        if(!isEmpty(result)){

            result['ChannelsPoints'].forEach(function(element, i, array){
                if(element.name == url){
                    div.innerText = element.timeToBox;
                }
            });
        }
    });
}

setInterval(UpdateTimeLeft,1000);