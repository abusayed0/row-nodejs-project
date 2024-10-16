/* 
Title: Uptime monitoring applicaion: Entry point
*/

// dependencies 
const server = require("./lib/server");
const workers = require("./lib/workers");



// module scraffolding: aspp object
const app = {};


app.init = function(){
    //start the server
    server.init()
    
    //start the workers
    workers.init()
}

app.init()

//export the module

module.exports = app;