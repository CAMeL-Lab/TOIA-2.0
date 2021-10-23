const fs = require('fs');
const mkdirp = require('mkdirp');

module.exports = {
    isEmptyObject: function (obj) {
        if (obj){
            return Object.keys(obj).length === 0;
        } else {
            return true;
        }
    },
    moveFile: function (originalPath, newPath, fileName, newFileName=null) {
        if (newFileName == null) newFileName = fileName;
        return new Promise(function (resolve, reject) {
            mkdirp(newPath).then(() => {
                fs.readFile(originalPath + fileName, function (err, fileContent) {
                    if (err) {
                        reject(err);
                        throw err;
                    }
                    fs.writeFile(newPath + newFileName, fileContent, function (err) {
                        if (err) {
                            reject(err);
                            throw err;
                        }
                        fs.unlink(originalPath + fileName, function (err) {
                            if (err) {
                                reject(err);
                                throw err;
                            }
                            resolve("success");
                        });
                    });
                });
            }, (error) => {
                reject(error);
            });
        });
    }
};
