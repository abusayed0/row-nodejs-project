
// module scraffolding 
const handler = {};



handler.notFoundHandler = function (requestProperties, callback){
callback(404, {success: true, message: "not found"})
}

// export module
module.exports = handler;