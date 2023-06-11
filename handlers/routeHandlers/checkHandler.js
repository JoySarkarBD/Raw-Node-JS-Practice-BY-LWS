/*
* Title: Check Handler
* Description: Check Handlers to define checks
* Author: Joy Sarkar
* Date: 23-May-2023  
*/

// dependencies
const envToExport = require('../../helpers/environments');
const { hash, parseJSON, createRandomString } = require('../../library/utils');
const { create, read, update, remove } = require('./../../library/data');
const tokenHandler = require('./tokenHandler');

// module scaffolding
const handler = {}

handler.checkHandler = (requestProperties, cb) => {
    const acceptedMethods = ['get', 'put', 'post', 'delete'];
    if (acceptedMethods.includes(requestProperties.method)) {
        handler._check[requestProperties.method](requestProperties, cb)
    } else {
        cb(405, {
            message: 'This is the route you are asking for is not accepted.'
        });
    }
};

handler._check = {};

handler._check.post = (requestProperties, cb) => {
    // validate inputs
    const protocol =
        typeof requestProperties.body.protocol === 'string' &&
            ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;

    const url =
        typeof requestProperties.body.url === 'string' &&
            requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url
            : false;

    const method =
        typeof requestProperties.body.method === 'string' &&
            ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
            ? requestProperties.body.method
            : false;

    const successCodes =
        typeof requestProperties.body.successCodes === 'object' &&
            requestProperties.body.successCodes instanceof Array
            ? requestProperties.body.successCodes
            : false;

    const timeoutSeconds =
        typeof requestProperties.body.timeoutSeconds === 'number' &&
            requestProperties.body.timeoutSeconds % 1 === 0 &&
            requestProperties.body.timeoutSeconds >= 1 &&
            requestProperties.body.timeoutSeconds <= 5
            ? requestProperties.body.timeoutSeconds
            : false;

    if (protocol && url && method && successCodes && timeoutSeconds) {
        const token =
            typeof requestProperties.headersObject.token === 'string'
                ? requestProperties.headersObject.token
                : false;
        // lookup the user phone by reading the token
        read('tokens', token, (err, tokenData) => {
            if (!err && tokenData) {
                const userPhone = parseJSON(tokenData).phone;
                // lookup the user data
                read('users', userPhone, (err, userData) => {
                    if (!err && userData) {
                        tokenHandler._token.verify(userPhone, token, (tokenIsValid) => {
                            if (tokenIsValid) {
                                const userObject = parseJSON(userData);
                                const userChecks =
                                    typeof userObject.checks === 'object' &&
                                        userObject.checks instanceof Array
                                        ? userObject.checks
                                        : [];

                                if (userChecks.length < envToExport.maxChecks) {
                                    const checkId = createRandomString(20);
                                    const checkObject = {
                                        id: checkId,
                                        userPhone,
                                        protocol,
                                        url,
                                        method,
                                        successCodes,
                                        timeoutSeconds,
                                    };
                                    // save the object
                                    create('checks', checkId, checkObject, (err) => {
                                        if (!err) {
                                            // add check id to the user's object
                                            userObject.checks = userChecks;
                                            userObject.checks.push(checkId);

                                            // save the new user data
                                            update('users', userPhone, userObject, (err) => {
                                                if (!err) {
                                                    // return the data about the new check
                                                    cb(200, checkObject);
                                                } else {
                                                    cb(500, {
                                                        error:
                                                            'There was a problem in the server side!',
                                                    });
                                                }
                                            });
                                        } else {
                                            cb(500, {
                                                error: 'There was a problem in the server side!',
                                            });
                                        }
                                    });
                                } else {
                                    cb(401, {
                                        error: 'User has already reached max check limit!',
                                    });
                                }
                            } else {
                                cb(403, {
                                    error: 'Authentication problem!',
                                });
                            }
                        });
                    } else {
                        cb(403, {
                            error: 'User not found!',
                        });
                    }
                });
            } else {
                cb(403, {
                    error: 'Authentication problem!',
                });
            }
        });
    } else {
        cb(400, {
            error: 'You have a problem in your request',
        });
    }
};

handler._check.get = (requestProperties, cb) => {
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
            requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;

    if (id) {
        // lookup the check
        read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                const token =
                    typeof requestProperties.headersObject.token === 'string'
                        ? requestProperties.headersObject.token
                        : false;

                tokenHandler._token.verify(
                    token,
                    parseJSON(checkData).userPhone,
                    (tokenIsValid) => {
                        if (tokenIsValid) {
                            cb(200, parseJSON(checkData));
                        } else {
                            cb(403, {
                                error: 'Authentication failure!',
                            });
                        }
                    }
                );
            } else {
                cb(500, {
                    error: 'You have a problem in your request',
                });
            }
        });
    } else {
        cb(400, {
            error: 'You have a problem in your request',
        })
    }
}

handler._check.put = (requestProperties, cb) => {
    const id =
        typeof requestProperties.body.id === 'string' &&
            requestProperties.body.id.trim().length === 20
            ? requestProperties.body.id
            : false;

    // validate inputs
    const protocol =
        typeof requestProperties.body.protocol === 'string' &&
            ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
            ? requestProperties.body.protocol
            : false;

    const url =
        typeof requestProperties.body.url === 'string' &&
            requestProperties.body.url.trim().length > 0
            ? requestProperties.body.url
            : false;

    const method =
        typeof requestProperties.body.method === 'string' &&
            ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
            ? requestProperties.body.method
            : false;

    const successCodes =
        typeof requestProperties.body.successCodes === 'object' &&
            requestProperties.body.successCodes instanceof Array
            ? requestProperties.body.successCodes
            : false;

    const timeoutSeconds =
        typeof requestProperties.body.timeoutSeconds === 'number' &&
            requestProperties.body.timeoutSeconds % 1 === 0 &&
            requestProperties.body.timeoutSeconds >= 1 &&
            requestProperties.body.timeoutSeconds <= 5
            ? requestProperties.body.timeoutSeconds
            : false;

    if (id) {
        if (protocol || url || method || successCodes || timeoutSeconds) { } else {
            read('checks', id, (err, checkData) => {
                if (!err && checkData) {
                    const checkObject = parseJSON(checkData);
                    const token =
                        typeof requestProperties.headersObject.token === 'string'
                            ? requestProperties.headersObject.token
                            : false;

                    tokenHandler._token.verify(token, checkObject.userPhone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            if (protocol) {
                                checkObject.protocol = protocol;
                            }
                            if (url) {
                                checkObject.url = url;
                            }
                            if (method) {
                                checkObject.method = method;
                            }
                            if (successCodes) {
                                checkObject.successCodes = successCodes;
                            }
                            if (timeoutSeconds) {
                                checkObject.timeoutSeconds = timeoutSeconds;
                            }
                            // store the checkObject
                            update('checks', id, checkObject, (err2) => {
                                if (!err2) {
                                    cb(200);
                                } else {
                                    cb(500, {
                                        error: 'There was a server side error!',
                                    });
                                }
                            });

                        } else {
                            cb(403, {
                                error: 'Authentication error!',
                            });
                        }
                    });
                }
                else {
                    cb(500, {
                        error: 'There was a problem in the server side!',
                    });
                }
            });
        } cb(400, {
            error: 'You must provide at least one field to update!',
        });
    } else {
        cb(400, {
            error: 'You have problem in your request.'
        })
    }
}

handler._check.delete = (requestProperties, cb) => {
    const id =
        typeof requestProperties.queryStringObject.id === 'string' &&
            requestProperties.queryStringObject.id.trim().length === 20
            ? requestProperties.queryStringObject.id
            : false;
    if (id) {
        // lookup the check
        read('checks', id, (err, checkData) => {
            if (!err && checkData) {
                const token =
                    typeof requestProperties.headersObject.token === 'string'
                        ? requestProperties.headersObject.token
                        : false;

                tokenHandler._token.verify(token, parseJSON(checkData).userPhone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        delete ('checks', id, (err) => {
                            if (!err) {
                                read(
                                    'users',
                                    parseJSON(checkData).userPhone,
                                    (err, userData) => {
                                        if (!err && userData) {
                                            const userChecks =
                                                typeof userObject.checks === 'object' &&
                                                    userObject.checks instanceof Array
                                                    ? userObject.checks
                                                    : [];

                                            // remove the deleted check id from user's list of checks

                                            const checkPosition = userChecks.indexOf(id);

                                            if (checkPosition > -1) {
                                                userChecks.splice(checkPosition, 1);
                                                // re-save the user data
                                                userObject.checks = userChecks;
                                                data.update(
                                                    'users',
                                                    userObject.phone,
                                                    userObject,
                                                    (err) => {
                                                        if (!err) {
                                                            cb(200);
                                                        } else {
                                                            cb(500, {
                                                                error:
                                                                    'There was a server side problem!',
                                                            });
                                                        }
                                                    }
                                                );
                                            } else {
                                                cb(500, {
                                                    error:
                                                        'The check id that you are trying to remove is not found in user!',
                                                });
                                            }
                                        } else {
                                            cb(500, {
                                                error: 'There was a server side problem!',
                                            });
                                        }
                                    })
                            } else {
                                cb(500, {
                                    error: 'There was a server side problem!',
                                });
                            }
                        })
                    } else {
                        cb(403, {
                            error: 'Authentication failure!',
                        });
                    }
                })
            } else {
                cb(500, {
                    error: 'You have a problem in your request.'
                })
            }
        })
    } else {
        cb(400, {
            error: 'You have a problem in your request',
        });
    }
}

// module exports
module.exports = handler;