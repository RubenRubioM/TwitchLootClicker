var claimable = false;
var timeBetweenChecking = 1000;
var syncPolling = 30;
var active = true;
var syncInLocal = false;

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

setInterval(StorageLocalToSync,syncPolling*1000);
setInterval(checkLoot,timeBetweenChecking);

/**
 * When we open the stream we sync the cloud storage to our local storage
 */
if(!syncInLocal){
    StorageSyncToLocal();
    syncInLocal = true;
}



function clickLoot(){
    var claimableIcon = document.getElementsByClassName('claimable-bonus__icon')[0];

    if(typeof claimableIcon != 'undefined' && claimable){
        var lootButton = claimableIcon.parentNode.parentNode;
        //Acces to storage to increment the value
        var url = window.location.href;
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

        lootButton.click();
        claimable = false;
    }
}

function checkTime(){
    var url = window.location.href;
    url = url.split('?')[0]; //In case we have Ninja?referred=raid we get only Ninja

    chrome.storage.local.get(['ChannelsPoints'], function(result){
        
        if(isEmpty(result)) return;
        //To check if this channel already exists
        result['ChannelsPoints'].forEach(function(element, i, array){
            if(element.name == url){
                //We already have stored this channel
                element.timeToBox -= timeBetweenChecking;
                //console.log(element.timeToBox);
            }
        });
        

        chrome.storage.local.set({'ChannelsPoints': result['ChannelsPoints']}, function() {
            //console.log('El nuevo valor de  ' +channel.name+ ' es ahora ' + channel.points);
        });

        
    });
}

function checkLoot(){

    //If we have the plugin disabled, return
    if(!active) return;

    checkTime();
    var claimableIcon = document.getElementsByClassName('claimable-bonus__icon')[0];
    if(typeof claimableIcon != 'undefined' && !claimable){
        claimable = true;
        setInterval(clickLoot,1000); //We set a delay between detecting the loot and clicking it
    }
    
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
 */
function StorageSyncToLocal(){
    //console.log("Sync to local...");
    chrome.storage.sync.get(['ChannelsPoints'], function(result){
        chrome.storage.local.set({'ChannelsPoints': result['ChannelsPoints']}, function() {
            //console.log('El nuevo de  ' +channel.name+ ' es ' + channel.points);
        });
    });
}
