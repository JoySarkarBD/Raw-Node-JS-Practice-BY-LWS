/*
* Title: Node.Js Project
* Description: Raw Node.Js Project Uptime Monitoring API
* Author: Joy Sarkar
* Date: 18-May-2023  
*/

// dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const env = require("./helpers/environments");
const { create, update, read, remove } = require('./library/data');
const { sendTwilioSms } = require('./helpers/notifications');
const server = require('./library/server');
const workers = require('./library/workers');

// app obj - module scaffolding
const app = {};

app.init = () => {
    // start the server
    server.init();

    // start workers functionalities
    workers.init();
}

app.init();