/*
* Title: Routes
* Description: All the routes of this application
* Author: Joy Sarkar
* Date: 18-May-2023  
*/

const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler');

const routes = {
    sample: sampleHandler,
};

module.exports = routes;