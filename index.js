/*
* Title: Node.Js Project
* Description: Raw Node.Js Project Uptime Monitoring API
* Author: Joy Sarkar
* Date: 18-May-2023  
*/

// dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');

// app obj - module scaffolding
const app = {};

// configuration
app.config = {
    port: 3000,
}

// handle Request Response
app.handleReqRes = handleReqRes;

// create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(app.config.port, () => {
        console.log(`listening to port ${app.config.port}`);
    });
};


app.createServer()