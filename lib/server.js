/* 
Title: Uptime monitoring applicaion
*/

// dependencies 
const http = require("http");
const { handleReqRes } = require("./../helpers/handleReqRes");
const config = require("./../helpers/enviroment");



// module scraffolding: aspp object
const server = {};


server.config = config;



server.handleReqRes = handleReqRes;

//create server
server.createServer = () => {
    const createServerVariable = http.createServer(server.handleReqRes);
    createServerVariable.listen(server.config.port, () => {
        console.log(`Server running on port: ${server.config.port}`);
    });
    
};

server.init = server.createServer;



//star the server
module.exports = server;