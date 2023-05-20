/*
* Title: Environments
* Description: Handle all environment related things
* Author: Joy Sarkar
* Date: 20-May-2023  
*/

// module scaffolding
const environments = {};

environments.staging = {
    port: 3000,
    envName: "staging"
}

environments.production = {
    port: 3000,
    envName: "production"
}

// determine which one need to choose
const currentEnv = typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

// export corresponding environment obj
const envToExport = typeof environments[currentEnv] === 'object' ? environments[currentEnv] : environments.staging;

// export module 
module.exports = envToExport;