/*
* Title: Server Library
* Description: Server related codes
* Author: Joy Sarkar
* Date: 12-Jun-2023  
*/

// dependencies
const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const env = require('./../helpers/environments');

// server obj: module scaffolding
const server = {};

// create server
server.createServer = () => {
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(env.port, () => {
        console.log(`listening to port ${env.port}`);
    });
};

// handle request response
server.handleReqRes = handleReqRes;

// start the sever
server.init = () => {
    server.createServer();
}

// module export
module.exports = server;