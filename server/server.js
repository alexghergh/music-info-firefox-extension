const http = require('http');
const fs = require('fs');

const song_file = '/tmp/mozilla_song'
const not_playing_message = 'Not playing'

// use this as a caching mechanism
let globalSongPlaying = null;

// create the server and the callback function to execute on request
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

        // write the song playing to a temp file
        if (method === 'POST') {
            let songPlaying = JSON.parse(body)['songPlaying'];
            //console.log("Body: " + JSON.stringify(JSON.parse(body), null, 4));
            console.log("songplaying: " + songPlaying);

            if (globalSongPlaying !== songPlaying) {

                globalSongPlaying = songPlaying;
                //console.log("Wrote to file: " + ( globalSongPlaying === null ? not_playing_message : globalSongPlaying ));

                fs.writeFile(song_file, ( globalSongPlaying === null ? not_playing_message : globalSongPlaying ), (err) => {
                    if (err) {
                        console.log('Error writing to file: ' + err);
                    }
                });
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
