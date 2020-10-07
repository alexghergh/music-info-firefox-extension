// the global song name
// we use this as a caching mechanism
// we only change this when a song changes, stops playing or starts playing
let globalSongName = undefined;

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
        let regex = /▶ | - Music - Nextcloud| - YouTube/g;

        // process only the first tab playing audio
        try {
            songPlaying = tabs[0].title.replaceAll(regex, "");
        } catch (err) {
            // TypeError: tabs[0] doesn't exist
            // we're not playing any audio, so just set songPlaying to null
            songPlaying = null;
        }

        // we check if the song changed, if it did we make a request to the server to change the song playing,
        // otherwise do nothing
        if (globalSongName != songPlaying) {
            globalSongName = songPlaying;

            // send the request with the current song playing to a local server
            let request = new XMLHttpRequest();

            request.open('POST', "http://localhost:17565/");
            request.setRequestHeader("Content-Type", "application/json");

            request.send("{\"songPlaying\": \"" + ( globalSongName == null ? "Not playing" : globalSongName ) + "\"}");

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
        }

    }, (err) => {
        console.log("Error: " + err);
    });

}, 5000);
