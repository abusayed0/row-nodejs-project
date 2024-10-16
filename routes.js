// dependenices/ external module
const {sampleHander} = require("./handlers/routeHandlers/sampleHandler");
const {notFoundHandler} = require("./handlers/routeHandlers/notFoundHandler");
const {userHander} = require("./handlers/routeHandlers/userHandler");
const { tokenHander } = require("./handlers/routeHandlers/tokenHandler");
const { checkHandler } = require("./handlers/routeHandlers/checkHandler");
const routes = {
    sample: sampleHander,
    notFound: notFoundHandler,
    user: userHander,
    token: tokenHander,
    check: checkHandler,
};

// export module 
module.exports = routes;