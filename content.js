
var claimable = false;
var i = 1;

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function clickLoot(){
    var claimableIcon = document.getElementsByClassName('claimable-bonus__icon')[0];

    if(typeof claimableIcon != 'undefined' && claimable){
        var lootButton = claimableIcon.parentNode.parentNode;
        //Acces to storage to increment the value
        var url = window.location.href;

        chrome.storage.sync.get(['ChannelsPoints'], function(result){
            if(isEmpty(result)){
                var channelArray = [];
                var channel = {name: url, points: 50};
                channelArray.push(channel);
                chrome.storage.sync.set({'ChannelsPoints': channelArray}, function() {
                    //console.log('El nuevo valor de  ' +channel.name+ ' es ahora ' + channel.points);
                });
            }else{

                //To check if this channel already exists
                var found = false;
                result['ChannelsPoints'].forEach(function(element, i, array){
                    if(element.name == url){
                        //We already have stored this channel
                        element.points += 50; //TODO: Change this static 50 for 100 if he is suscribed
                        //console.log(element.points);
                        found = true;
                    }
                });
                
                //If the channel identified is not in the storage, we create a new object
                if(!found){
                    var channel = {name: url, points: 50};
                    result['ChannelsPoints'].push(channel);
                }

                chrome.storage.sync.set({'ChannelsPoints': result['ChannelsPoints']}, function() {
                    //console.log('El nuevo valor de  ' +channel.name+ ' es ahora ' + channel.points);
                });

            }
        });

        lootButton.click();
        claimable = false;
    }
}

function checkLoot(){

    var claimableIcon = document.getElementsByClassName('claimable-bonus__icon')[0];
    if(typeof claimableIcon != 'undefined' && !claimable){
        claimable = true;
        setInterval(clickLoot,2000); //We set a delay between detecting the loot and clicking it
    }
    
}

setInterval(checkLoot,1000);