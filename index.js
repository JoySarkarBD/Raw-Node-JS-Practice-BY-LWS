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

// app obj - module scaffolding
const app = {};

// testing file system

// create('test', 'newFile', { name: "Bangladesh", lang: "Bangla" }, (err) => {
//     console.log(err);
// });

// read('test', 'newFile', (err) => {
//     console.log(err);
// });

// update('test', 'newFile', { name: "India", lang: "Hindi" }, (err) => {
//     console.log(err);
// });

// remove('test', 'newFile', (err) => {
//     console.log(err);
// });

// send sms to user
// sendTwilioSms('01911111111', 'Hello world', (err) => {
//     console.log(`this is the error`, err);
// });

// handle Request Response
app.handleReqRes = handleReqRes;

// create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(env.port, () => {
        console.log(`listening to port ${env.port}`);
    });
};


app.createServer()