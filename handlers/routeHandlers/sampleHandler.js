/*
* Title: Sample Handler
* Description: Sample Route Handler
* Author: Joy Sarkar
* Date: 18-May-2023  
*/

// module scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, cb) => {
    console.log(requestProperties);

    cb(200, {
        message: 'This is the route you are asking for.'
    });
};

module.exports = handler;