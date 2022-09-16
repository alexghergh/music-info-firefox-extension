// TODO file socket instead of tcp/ip socket?

const http = require('http');
const net = require('net');

const IDLE_MESSAGE = 'Not playing';
const OFFSET = 30;

// use this as a caching mechanism
let globalSongPlaying = null;

// create a TCP server to listen for incoming requests for current song
net.createServer((sock) => {

    // ony any data, just send the current song name or the idle message and
    // close the socket
    sock.on('data', (data) => {

        if (globalSongPlaying === null) {

            // just write nothing
            sock.write(IDLE_MESSAGE);
            sock.destroy();

        } else {

            // if the song title is small, just display it
            if (globalSongPlaying.length < OFFSET + 1) {

                sock.write(globalSongPlaying);
                sock.destroy();

            } else {

                // add a bit of extra space for readability
                displayMessage = globalSongPlaying + "        ";

                // if the song title isn't at least OFFSET + 1 characters, add padding
                while (displayMessage.length < OFFSET + 1) {
                    displayMessage = displayMessage + " ";
                }

                // get the current uptime of the process
                // just needed for the index calculation, doesn't need to be precise
                currTime = parseInt(process.uptime());

                // start index calculation
                startIndex = currTime % displayMessage.length;

                // end index calculation
                endIndex = (currTime + OFFSET) % displayMessage.length;

                // we need this because "substring" doesn't wrap around the string
                if (startIndex > endIndex) {
                    sock.write( displayMessage.substring(startIndex, displayMessage.length) +
                        displayMessage.substring(0, endIndex) );
                    sock.destroy();
                } else {
                    sock.write( displayMessage.substring(startIndex, endIndex) );
                    sock.destroy();
                }
            }
        }
    });

}).listen(15467, '127.0.0.1');

// create the http server and the callback function to execute on request
http.createServer((request, response) => {

    let body = []

    const { url, method, headers } = request;

    // log the call to the server
    //console.log(method + ' ' + url + ' ' + JSON.stringify(headers));

    request.on('data', (chunk) => {

        // process the body of the request
        body.push(chunk);

    }).on('end', () => {

        // assemble the body
        body = Buffer.concat(body).toString();

        response.on('error', (err) => {
            console.log('Response error: ' + err);
        });

        // parse the currently playing song and save it in the global variable
        if (method === 'POST') {
            let songPlaying = JSON.parse(body)['songPlaying'];
            //console.log("Body: " + JSON.stringify(JSON.parse(body), null, 4));
            //console.log("songplaying: " + songPlaying);

            // !!songPlaying is null if there's nothing playing in firefox,
            // so globalSongPlaying will be set to that
            if (globalSongPlaying !== songPlaying) {

                //console.log("Wrote to file: " + ( globalSongPlaying === null ? not_playing_message : globalSongPlaying ));
                globalSongPlaying = songPlaying;
            }
        }

        // prepare and send a reponse body
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        const responseBody = {
            'status': response.statusCode
        }

        response.write(JSON.stringify(responseBody));
        response.end();

    }).on('error', (err) => {
        console.log('Error processing data in request: ' + err);
    });

}).listen(17565, (err) => {
    if (err) {
        console.log('Server error: ' + err);
    }
});
