var claimable = false;
var timeBetweenChecking = 1000;
var syncPolling = 30;
var active = true;
var syncInLocal = false;

setInterval(StorageLocalToSync,syncPolling*1000);
setInterval(checkLoot,timeBetweenChecking);

/**
 * When we open the stream we sync the cloud storage to our local storage
 */
if(!syncInLocal){
    StorageSyncToLocal();
    syncInLocal = true;
}

/**
 * Click the loot and add or update the channel
 */
function clickLoot(){
    var claimableIcon = document.getElementsByClassName('claimable-bonus__icon')[0];

    if(typeof claimableIcon != 'undefined' && claimable){
        var lootButton = claimableIcon.parentNode.parentNode;
        //Acces to storage to increment the value
        var url = window.location.href;
        AddChannel(url);

        lootButton.click();
        claimable = false;
    }
}

/**
 * Updates the time left to box data
 */
function checkTime(){
    var url = window.location.href;
    url = url.split('?')[0]; //In case we have Ninja?referred=raid we get only Ninja

    chrome.storage.local.get(['ChannelsPoints'], function(result){
        
        if(isEmpty(result)) return;
        //To check if this channel already exists
        result['ChannelsPoints'].forEach(function(element, i, array){
            if(element.name == url){
                //We already have stored this channel
                if(element.timeToBox >= 0){
                    element.timeToBox -= timeBetweenChecking;
                }else{
                    element.timeToBox = 0;
                }

            }
        });
        
        chrome.storage.local.set({'ChannelsPoints': result['ChannelsPoints']}, function() {
            //console.log('El nuevo valor de  ' +channel.name+ ' es ahora ' + channel.points);
        });

        
    });
}

/**
 * Checks if there is any loot to click
 */
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
