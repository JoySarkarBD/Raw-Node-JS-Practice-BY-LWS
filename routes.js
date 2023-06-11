/*
* Title: Routes
* Description: All the routes of this application
* Author: Joy Sarkar
* Date: 18-May-2023  
*/

const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler');
const { tokenHandler } = require('./handlers/routeHandlers/tokenHandler');
const { userHandler } = require('./handlers/routeHandlers/userHandler');
const { checkHandler } = require('./handlers/routeHandlers/checkHandler');

const routes = {
    sample: sampleHandler,
    users: userHandler,
    token: tokenHandler,
    check: checkHandler
};

module.exports = routes;