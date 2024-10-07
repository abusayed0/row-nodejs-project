
// module scraffolding 
const handler = {};



handler.sampleHander = function (requestProperties, callback){
callback(200, {sucess: true, message: "Sample"});
}

// export module
module.exports = handler;