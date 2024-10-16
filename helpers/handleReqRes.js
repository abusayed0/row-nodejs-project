// module scraffolding 
const handler = {};

// dependencies
const url = require("url");
const { StringDecoder } = require("string_decoder");
const routes = require("./../routes");
const {parseJSON} = require("./../helpers/utilities")


handler.handleReqRes = (req, res) => {

    //handle req
    const parseUrl = url.parse(req.url, true);
    const pathname = parseUrl.pathname;
    const trimmedPath = pathname.replace(/^\/+|\/+$/g, "");
    const reqMethod = req.method.toLowerCase();
    const queryStringObject = parseUrl.query;
    const headersObject = req.headers;
    const requestProperties = {
        parseUrl,
        pathname,
        trimmedPath,
        reqMethod,
        queryStringObject,
        headersObject
    }

    const decoder = new StringDecoder("utf8");
    let realData = "";

    const chosenHandler = routes[trimmedPath] ? routes[trimmedPath] : routes["notFound"];

    req.on("data", (chunk) => {
        realData += decoder.write(chunk);
    })
    req.on("end", () => {
        decoder.end();
        requestProperties.body = parseJSON(realData);
    
        chosenHandler(requestProperties, (statusCode, payload) => {
            statusCode = typeof (statusCode) === "number" ? statusCode : 500;
            payload = typeof (payload) === "object" ? payload : {};

            const payloadString = JSON.stringify(payload);

            // return the response 
            res.setHeader("Content-Type","application.json")
            res.writeHead(statusCode);
            res.end(payloadString);

        })

    })
}

module.exports = handler;
