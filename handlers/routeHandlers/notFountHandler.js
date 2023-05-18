/*
* Title: Not Found Handler
* Description: 404 Not Found Route Handler
* Author: Joy Sarkar
* Date: 18-May-2023  
*/

// module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, cb) => {
    cb(404, {
        message: 'Page Not Found....!'
    });
};

module.exports = handler;