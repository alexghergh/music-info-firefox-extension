const http = require('http');
const fs = require('fs');

const server = http.createServer((request, response) => {

    let body = []

    const { url, method, headers } = request;

    // log the call to the server
    console.log(method + " " + url + " " + JSON.stringify(headers));

    request.on('data', (chunk) => {

        // process the body of the request
        body.push(chunk);

    }).on('end', () => {

        // assemble the body
        body = Buffer.concat(body).toString();

        response.on('error', (err) => {
            console.log("Response error: " + err);
        });

        // write the song playing to a temp file
        if (method === 'POST') {
            let songPlaying = JSON.parse(body)['songPlaying'];

            fs.writeFile('/tmp/mozilla_song', songPlaying, (err) => {
                if (err) {
                    console.log('Error writing to file: ' + err);
                }
            });
        }

        // prepare and send a reponse body
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        const responseBody = {
            "status": response.statusCode
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
