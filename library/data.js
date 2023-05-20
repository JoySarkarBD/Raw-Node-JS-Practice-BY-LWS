/*
* Title: Data Library
* Description: Data Library functions for CRUD
* Author: Joy Sarkar
* Date: 20-May-2023  
*/

// dependencies
const fs = require('fs');
const path = require('path');

// module scaffolding
const lib = {};

// base directory of data folder
lib.basedir = path.join(__dirname, './../.data');

// write data to file
lib.create = (dir, fileName, data, cb) => {
    //open file for writing
    fs.open(`${lib.basedir}/${dir}/${fileName}.json`, 'wx', (err, result) => {
        if (!err && result) {
            // convert data to string
            const stringData = JSON.stringify(data);

            // write data to file and then close it
            fs.writeFile(result, stringData, (err) => {
                if (!err) {
                    fs.close(result, (err) => {
                        if (!err) {
                            cb(false)
                        } else {
                            cb('Error closing the file')
                        }
                    })
                } else {
                    cb('There was an error, file may already exists!');
                }
            })
        } else {
            cb(err);
        }
    });
};

// read data to file
lib.read = (dir, fileName, cb) => {
    //read the file
    fs.readFile(`${lib.basedir}/${dir}/${fileName}.json`, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
        } else {
            console.log('File contents:', JSON.parse(data));
        };
    });
};

// update data to file
lib.update = (dir, fileName, data, cb) => {
    //open file for writing
    fs.open(`${lib.basedir}/${dir}/${fileName}.json`, 'r+', (err, result) => {
        if (!err && result) {
            // convert data to string
            const stringData = JSON.stringify(data);

            // update data to file and then close it

            // need to empty the file by fs.truncate
            fs.ftruncate(result, (err) => {
                if (!err) {
                    fs.writeFile(result, stringData, (err) => {
                        if (!err) {
                            fs.close(result, (err) => {
                                if (!err) {
                                    cb(false)
                                } else {
                                    cb('Error closing the new file!')
                                }
                            })
                        } else {
                            cb('There was an error, Error writing to new file');
                        }
                    })
                } else {
                    cb('There was an error, to update file data!');
                }
            })
        } else {
            cb(err);
        }
    });
};

// delete data file
lib.remove = (dir, fileName, cb) => {
    //read the file
    fs.unlink(`${lib.basedir}/${dir}/${fileName}.json`, (err) => {
        if (err) {
            console.error('Error deleting the file:', err);
        } else {
            console.log('File deleted successfully');
        };
    });
};



// module exports
module.exports = lib;