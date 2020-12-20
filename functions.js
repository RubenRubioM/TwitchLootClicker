function millisToMinutesAndSeconds(millis) {
    if(millis < 0){
        return "Ready to claim";
    }
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

function millisToHoursMinutesAndSeconds(millis){
    var seconds = (millis / 1000).toFixed(0);
    var minutes = Math.floor(seconds / 60);
    var hours = "";
    if (minutes > 59) {
        hours = Math.floor(minutes / 60);
        hours = (hours >= 10) ? hours : "0" + hours;
        minutes = minutes - (hours * 60);
        minutes = (minutes >= 10) ? minutes : "0" + minutes;
    }

    seconds = Math.floor(seconds % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    if (hours != "") {
        return hours + "h " + minutes + "m " + seconds + "s";
    }
    return minutes + "m " + seconds + "s ";
}

function minutesToMilliseconds(minutes){
    return (minutes * 60000);
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function AddChannel(name) {
    url = name.split('?')[0]; //In case we have Ninja?referred=raid we get only Ninja
    var channelToReturn;
    chrome.storage.local.get(['ChannelsPoints'], function(result){
        var channel = {name: url, points: 50, timeToBox: timeToNextBox, timeRegister: [new Date().toJSON()]};

        // Is the first channel to be added
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
                    element.timeToBox = timeToNextBox;
                    if(typeof element.timeRegister === 'undefined'){ 
                        element.timeRegister = [new Date().toJSON()]
                    }else{
                        element.timeRegister.push(new Date().toJSON())
                    }

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
