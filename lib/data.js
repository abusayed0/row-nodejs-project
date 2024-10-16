// external module/ dependencies 
const path = require("path");
const fs = require("fs");
const { parseJSON } = require("../helpers/utilities");

//fs, path, crypto, stringdecoder, url, http, os, event

// module scraffolding 
const lib = {};


lib.basedir = path.join(__dirname, "../.data/");



// write data to file 
lib.create = function(dir, fileName, data, callback){

    //open file for writing 
    fs.open(`${lib.basedir + dir}/${fileName}.json`, "wx", function(err, fileDiscriptor){
        if(!err){
        
            //create data to json
            const stringData = JSON.stringify(data);

            // write the data 
            fs.writeFile(fileDiscriptor, stringData, (err ) => {
                if(!err){
                    fs.close(fileDiscriptor, (err) => {
                        if(!err){
                            callback(false)
                        }
                        else{
                            callback("Error closing the new file")
                        }
                    })
                }else{
                    callback("Error writing to new file")
                }
            })
        }else{
            callback("File may already exists.")
        }
    });
} 


// read data from file 
lib.read = function(dir, fileName, callback){

    // read the file 
    fs.readFile(`${lib.basedir + dir}/${fileName}.json`,"utf8", (err, data) => {
        if(!err){
            callback(false, parseJSON(data));
        }else{
            callback(err)
        }
    })
};


// update file 
lib.update = function(dir, fileName, data, callback){

 // open file for reading and writing
    fs.open(`${lib.basedir + dir}/${fileName}.json`, "r+", (err, fileDiscriptor) => {
        if(!err && fileDiscriptor){

            const stringData = JSON.stringify(data);

            // clear the file 
            fs.ftruncate(fileDiscriptor, (err) => {
                if(!err){
                    fs.writeFile(fileDiscriptor, stringData, (err) => {
                        if(!err){
                            fs.close(fileDiscriptor, (err) => {
                                if(!err){
                                    callback(false);
                                }else{
                                    callback("Error while closing the file")
                                }
                            })
                        }else{
                            callback("Error while writing file")
                        }
                    })
                }else{

                    callback("Error while truncate file")
                }
            })

            
        }else{
            callback("Error while opening file")
        }
    })
};


// delete file 
lib.delete = function(dir, fileName, callback) {
    fs.unlink(`${lib.basedir + dir}/${fileName}.json`, (err) =>{
        if(!err){
            callback(false)
        }else{
            callback("error while deleting file")
        }
    })
};

//read all the file in a directory
lib.list = function(dir, callback){
    fs.readdir(lib.basedir + dir, function(err, fileNames) {
        if(!err && fileNames.length > 0){
           
            const fileNamesWithoutExten= fileNames.map(fileName => {
                return fileName.replace(".json", "");
            });
            callback(false, fileNamesWithoutExten)
        }else{
            // no file in this directory
            callback("no file in this directory")
        }
    })
};

// export module 
module.exports = lib;