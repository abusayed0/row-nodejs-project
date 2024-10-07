/* 
Title: Uptime monitoring applicaion
*/

// dependencies 
const http = require("http");
const { handleReqRes } = require("./helpers/handleReqRes");
const config = require("./helpers/enviroment");
const data = require("./lib/data");


//testing file system
data.delete("test", "data", function(err){
    console.log(`${err}`);
})


// module scraffolding: aspp object
const app = {};


app.config = config;



app.handleReqRes = handleReqRes;

//create server
app.createServer = () => {
    const server = http.createServer(app.handleReqRes);
    server.listen(app.config.port, () => {
        console.log(`Server running on port: ${app.config.port}`);
    });
};



//star the server
app.createServer();