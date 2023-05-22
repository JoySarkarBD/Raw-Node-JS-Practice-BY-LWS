/*
* Title: Utilities
* Description: Important utility functions
* Author: Joy Sarkar
* Date: 21-May-2023  
*/

// dependencies
const crypto = require('crypto');
const envToExport = require('./../helpers/environments');

// module scaffolding
const utilities = {};

// parsing data
utilities.parseJSON = (jsonString) => {
    let output;
    try {
        output = JSON.parse(jsonString);
    } catch (err) {
        output = {};
    }
    return output;
};

// hashing the password
utilities.hash = (str) => {
    if (typeof str === 'string' && str.length > 0) {
        const hash = crypto.createHmac('sha256', envToExport.secretKey).update(str).digest('hex');
        return hash;
    }
    return false;
};


// export module 
module.exports = utilities;