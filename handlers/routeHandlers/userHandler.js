/*
* Title: User Handler
* Description: Handler to handle user related routes
* Author: Joy Sarkar
* Date: 21-May-2023  
*/

// dependencies
const { hash, parseJSON } = require('../../library/utils');
const { create, read, update, remove } = require('./../../library/data');
const tokenHandler = require('./tokenHandler')
const path = require('path');

// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, cb) => {
    const acceptedMethods = ['get', 'put', 'post', 'delete'];
    if (acceptedMethods.includes(requestProperties.method)) {
        handler._users[requestProperties.method](requestProperties, cb)
    } else {
        cb(405, {
            message: 'This is the route you are asking for is not accepted.'
        });
    }
};

handler._users = {};

handler._users.post = (requestProperties, cb) => {
    const firstName = typeof requestProperties.body.firstName === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof requestProperties.body.lastName === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const phone = typeof requestProperties.body.phone === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof requestProperties.body.password === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    const toAgreement = typeof requestProperties.body.toAgreement === 'boolean' ? requestProperties.body.toAgreement : false;

    if (firstName && lastName && phone && password && toAgreement) {
        // make sure that the user doesn't already exists
        const userData = {
            firstName,
            lastName,
            phone,
            password: hash(password),
            toAgreement
        }
        create('users', phone, userData, (err) => {
            if (!err) {
                cb(200, {
                    message: 'User was created successfully!',
                });
            } else {
                cb(400, { message: 'User Already Exist!' });
            }
        })
    } else {
        cb(400, {
            error: 'You have a problem in your request',
        });
    }
}

handler._users.get = (requestProperties, cb) => {
    const phone = typeof requestProperties.queryStringObject.phone === 'string' && requestProperties.queryStringObject.phone.trim().length === 11 ? requestProperties.queryStringObject.phone : false;

    if (phone) {
        const token =
            typeof requestProperties.headersObject.token === 'string'
                ? requestProperties.headersObject.token
                : false;

        tokenHandler._token.verify(phone, token, (tokenId) => {
            if (tokenId) {
                read('users', phone, (err, user) => {
                    const userData = { ...parseJSON(user) };
                    if (!err && userData) {
                        delete userData.password;
                        cb(200, userData);
                    } else {
                        cb(404, {
                            error: 'Requested user not found.'
                        })
                    }
                });
            } else {
                cb(403, {
                    error: "Authentication Failed....!"
                });
            }
        })
    } else {
        cb(404, {
            error: 'Requested user was not found!',
        });
    }
}

handler._users.put = (requestProperties, cb) => {
    const firstName = typeof requestProperties.body.firstName === 'string' && requestProperties.body.firstName.trim().length > 0 ? requestProperties.body.firstName : false;

    const lastName = typeof requestProperties.body.lastName === 'string' && requestProperties.body.lastName.trim().length > 0 ? requestProperties.body.lastName : false;

    const phone = typeof requestProperties.body.phone === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof requestProperties.body.password === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if (phone) {
        if (firstName || lastName || password) {
            const token =
                typeof requestProperties.headersObject.token === 'string'
                    ? requestProperties.headersObject.token
                    : false;

            tokenHandler._token.verify(phone, token, (tokenId) => {
                if (tokenId) {
                    read('users', phone, (err, user) => {
                        const userData = { ...parseJSON(user) }
                        if (!err && userData) {
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.password = hash(password);
                            }
                            update('users', phone, userData, (err) => {
                                if (!err) {
                                    cb(200, {
                                        message: 'user updated successfully...!'
                                    })
                                } else {
                                    cb(500, {
                                        error: 'There was a problem in the server side....!'
                                    })
                                }
                            })
                        } else {
                            callback(400, {
                                error: 'You have a problem in your request!',
                            });
                        }
                    })
                } else {
                    cb(403,
                        {
                            error: 'Authentication Failed....!'
                        }
                    )
                }
            });
        } else {
            cb(400, {
                error: 'You have a problem in your request',
            });
        }
    } else {
        cb(400, {
            error: 'Invalid phone number. Please try again!',
        });
    }

}

handler._users.delete = (requestProperties, cb) => {
    const phone = typeof requestProperties.queryStringObject.phone === 'string' && requestProperties.queryStringObject.phone.trim().length === 11 ? requestProperties.queryStringObject.phone : false;

    if (phone) {

        const token =
            typeof requestProperties.headersObject.token === 'string'
                ? requestProperties.headersObject.token
                : false;
        tokenHandler._token.verify(phone, token, (tokenId) => {
            if (tokenId) {

                read('users', phone, (err, userData) => {
                    if (!err && userData) {
                        remove('users', phone, (err) => {
                            if (!err) {
                                cb(200, {
                                    message: 'User was successfully deleted!',
                                });
                            } else {
                                cb(500, {
                                    error: 'There was a server side error!',
                                });
                            }
                        });
                    } else {
                        cb(500, {
                            error: 'There was a server side error!',
                        });
                    }
                });
            } else {
                cb(403, {
                    error: 'Authentication Failed....!'
                })
            }
        });

    } else {
        cb(400, {
            error: 'There was a problem in your request!',
        });
    }
}


// export module

module.exports = handler;