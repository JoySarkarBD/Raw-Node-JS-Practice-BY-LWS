/*
* Title: Token Handler
* Description: Handler to handle token related routes
* Author: Joy Sarkar
* Date: 22-May-2023  
*/

// dependencies
const { hash, parseJSON, createRandomString } = require('../../library/utils');
const { create, read, update, remove } = require('./../../library/data');

// module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, cb) => {
    const acceptedMethods = ['get', 'put', 'post', 'delete'];
    if (acceptedMethods.includes(requestProperties.method)) {
        handler._token[requestProperties.method](requestProperties, cb)
    } else {
        cb(405, {
            message: 'This is the route you are asking for is not accepted.'
        });
    }
};

handler._token = {};

handler._token.post = (requestProperties, cb) => {
    const phone = typeof requestProperties.body.phone === 'string' && requestProperties.body.phone.trim().length === 11 ? requestProperties.body.phone : false;

    const password = typeof requestProperties.body.password === 'string' && requestProperties.body.password.trim().length > 0 ? requestProperties.body.password : false;

    if (phone && password) {
        read('users', phone, (err, userData) => {
            const hashedPassword = hash(password);
            if (hashedPassword === parseJSON(userData).password) {
                const tokenId = createRandomString(20);
                const expires = Date.now() + 60 * 60 * 1000;
                const tokenObject = {
                    phone,
                    tokenId,
                    expires,
                };
                create('tokens', tokenId, tokenObject, (err) => {
                    if (!err) {
                        cb(200, tokenObject);
                    } else {
                        cb(500, { error: 'There was a problem in the server side!' });
                    }
                })
            } else {
                cb(400, {
                    error: 'You have a problem in your request',
                });
            }
        });
    } else {
        cb(400, {
            error: 'You have a problem in your request',
        });
    }
}

handler._token.get = (requestProperties, cb) => {
    const tokenId = typeof requestProperties.queryStringObject.tokenId === 'string' && requestProperties.queryStringObject.tokenId.trim().length === 20 ? requestProperties.queryStringObject.tokenId : false;

    if (tokenId) {
        read('tokens', tokenId, (err, token) => {
            const tokenData = { ...parseJSON(token) };
            if (!err && tokenData) {
                cb(200, tokenData);
            } else {
                cb(404, {
                    error: 'Requested token not found.'
                })
            }
        })
    } else {
        cb(404, {
            error: 'Requested token was not found!',
        });
    }
}

handler._token.put = (requestProperties, cb) => {
    const tokenId = typeof requestProperties.body.tokenId === 'string' && requestProperties.body.tokenId.trim().length > 0 ? requestProperties.body.tokenId : false;

    const extend = typeof requestProperties.body.extend === 'boolean' && requestProperties.body.extend === true ? true : false;

    if (tokenId && extend) {
        read('tokens', tokenId, (err, token) => {
            const tokenData = { ...parseJSON(token) }
            if (!err && tokenData.expires > Date.now()) {
                tokenData.expires = Date.now() + 60 * 60 * 1000;
                update('tokens', tokenId, tokenData, (err) => {
                    if (!err) {
                        cb(200, {
                            message: 'Token Updated Successfully...!'
                        })
                    } else {
                        cb(500,
                            { error: 'There was a problem in server side.' }
                        )
                    }
                })
            } else {
                cb(500,
                    { error: 'There was a problem in server side.' }
                )
            }
        })
    } else {
        cb(400, {
            error: 'There was a problem in your request!',
        });
    }

}

handler._token.delete = (requestProperties, cb) => {
    const tokenId = typeof requestProperties.body.tokenId === 'string' && requestProperties.body.tokenId.trim().length > 0 ? requestProperties.body.tokenId : false;

    if (tokenId) {
        read('tokens', tokenId, (err, tokenData) => {
            if (!err && tokenData) {
                remove('tokens', tokenId, (err) => {
                    if (!err) {
                        cb(200, {
                            message: 'Token was successfully deleted!',
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
        cb(400, {
            error: 'There was a problem in your request!',
        });
    }
}

handler._token.verify = (phone, tokenId, cb) => {
    read('tokens', tokenId, (err, token) => {
        const tokenData = { ...parseJSON(token) }
        if (!err && token) {
            if (tokenData.phone === phone && tokenData.expires > Date.now()) {
                cb(true);
            } else {
                cb(false);
            }
        } else {
            cb(false);
        }
    });

}

// export module

module.exports = handler;