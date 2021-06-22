// check for tabs playing audio every few seconds
window.setInterval(() => {

    let songPlaying;

    function onError(error) {
        console.log("Error: ${error}");
    }

    // query all the tabs that play sound
    let query = browser.tabs.query({audible: true});

    query.then((tabs) => {
        // process the tab name with a regex to remove all the unnecessary bits from tab names
        let regex = /▶ | - Music| - Nextcloud| - YouTube/g;

        // process only the first tab playing audio
        try {
            songPlaying = tabs[0].title.replaceAll(regex, "");
        } catch (err) {
            // TypeError: tabs[0] doesn't exist
            // we're not playing any audio, so just set songPlaying to null
            songPlaying = null;
        }

        // send the request with the current song playing to a local server
        let request = new XMLHttpRequest();

        request.open('POST', "http://localhost:17565/");
        request.setRequestHeader("Content-Type", "application/json");

        console.log("json: " + JSON.stringify({songPlaying: songPlaying}));
        request.send(JSON.stringify({songPlaying: songPlaying}));

        request.onload = function () {
            if (request.status == 200) {
                // everything worked succesfully
            } else {
                console.log("Something went wrong, status code: " + request.status);
            }
        };

        request.onerror = function() {
            console.log("Cannot reach server, check that it is running locally.");
        };

    }, (err) => {
        console.log("Error: " + err);
    });

}, 5000);
