/*
* Title: Workers Library
* Description: Worker related codes
* Author: Joy Sarkar
* Date: 12-Jun-2023  
*/

// dependencies
const url = require('url');
const http = require('http');
const https = require('https');
const { read, update, list } = require('./data');
const { parseJSON } = require('./utils');
const { sendTwilioSms } = require('../helpers/notifications');
const { check } = require('../routes');

// workers obj: module scaffolding
const workers = {};

// validate individual check data
workers.validateCheckData = (originalCheckData) => {
    const originalData = originalCheckData;
    if (originalData && originalData.id) {
        originalData.state = typeof originalCheckData.state === 'string' && ['up', 'down'].includes(originalCheckData.state) ? originalCheckData.state : 'down';

        originalData.lastChecked = typeof originalCheckData.lastChecked === ' number' && originalCheckData.lastChecked > 0 ? originalCheckData.lastChecked : false;

        // pass to the next process
        workers.performCheck(originalData);
    } else {
        console.log('Error: Check was invalid or not properly formatted!');
    }
};

// look for all the checks
workers.gatherAllChecks = () => {
    list('checks', (err, checks) => {
        if (!err && checks && checks.length > 0) {
            checks.forEach(check => {
                read('checks', check, (err, originalCheckData) => {
                    if (!err && originalCheckData) {
                        // pass the data to the check validator
                        workers.validateCheckData(parseJSON(originalCheckData));
                    } else {
                        console.log('Error: reading one of the checks data!');
                    }
                });
            });
        }
    })
};

// perform checks for testing
workers.preform = (originalCheckData) => {
    // prepare the initial check outcome
    let checkOutCome = {
        error: false,
        responseCode: false;
    }

    //mark the outcome has not been sent yet
    let outcomeSent = false;

    // parse the hostname & full url from original data
    const parsedUrl = url.parse(`${originalCheckData.protocol}://${originalCheckData.url}`, true);
    const hostName = parsedUrl.hostname;
    const path = parsedUrl.path;

    // assembling the request obj
    const requestDetails = {
        protocol: `${originalCheckData.protocol}`,
        hostName,
        method: `${originalCheckData.method.toUpperCase()}`,
        path,
        timeout: `${originalCheckData.timeoutSeconds * 1000}`
    }

    const protocolToUse = originalCheckData.protocol === 'http' ? http : https;

    const req = protocolToUse.request(requestDetails, (res) => {
        // grab the status of the response
        const status = res.statusCode;

        // update the check outcome and pass to the next process
        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.on('error', (err) => {
        let checkOutCome = {
            error: true,
            value: err
        }
        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    req.on('timeout', () => {
        let checkOutCome = {
            error: true,
            value: 'timeout'
        }
        if (!outcomeSent) {
            workers.processCheckOutcome(originalCheckData, checkOutCome);
            outcomeSent = true;
        }
    });

    // req send
    req.end();
};

// save check outcome to database and send to the next process
workers.processCheckOutcome = (originalCheckData, checkOutCome) => {
    // check if check outcome is up or down
    const state = !checkOutCome.error && checkOutCome.responseCode && originalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1 ? 'up' : 'down';

    // decide whether we should alert the user or not
    const alertWanted = !!(originalCheckData.lastChecked && originalCheckData.state !== state);

    // update the check data
    const newCheckData = originalCheckData;

    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    update('checks', newCheckData.id, newCheckData, (err) => {
        if (!err) {
            if (alertWanted) {
                // send the check data to next process
                worker.alertUserToStatusChange(newCheckData);
            } else {
                console.log('Alert is not needed as there is no state change!');
            }
        } else {
            console.log('Error trying to save check data of one of the checks!');
        }
    });
};

// send notification sms to user if state changes
workers.alertUserToStatusChange = (newCheckData) => {
    const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol
        }://${newCheckData.url} is currently ${newCheckData.state}`;

    sendTwilioSms(newCheckData.userPhone, msg, (err) => {
        if (!err) {
            console.log(`User was alerted to a status change via SMS: ${msg}`);
        } else {
            console.log('There was a problem sending sms to one of the user!');
        }
    });
};

// timer to execute the workers process once per min
workers.loop = () => {
    setTimeout(() => {
        workers.gatherAllChecks();
    }, 1000 * 60);
};

// start the workers
workers.init = () => {
    // execute all the checks
    workers.gatherAllChecks();

    // call the loop so that checks continue
    workers.loop()
};

// module export
module.exports = workers;

