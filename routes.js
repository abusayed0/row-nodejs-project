// dependenices/ external module
const {sampleHander} = require("./handlers/routeHandlers/sampleHandler");
const {notFoundHandler} = require("./handlers/routeHandlers/notFoundHandler");

const routes = {
    sample: sampleHander,
    notFound: notFoundHandler,
};

// export module 
module.exports = routes;