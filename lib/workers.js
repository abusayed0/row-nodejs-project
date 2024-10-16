
/* 
Title: Uptime monitoring applicaion
*/

// dependencies 
const data = require("./data");
const url = require("url");
const http = require("http");
const https = require("https");
const notifications = require("./../helpers/notifications");



// module scraffolding: aspp object
const workers = {};

workers.sendUserAlert = function (newCheckData) {
    console.log(newCheckData);
    const msg = `Alert: your check for ${newCheckData.protocol}, ${newCheckData.url}, ${newCheckData.method} is currently ${newCheckData.state} 💹`;
    notifications.sendTwilioSms(newCheckData.userPhone, msg, function (err) {
        if (!err) {
            console.log("Successfully send notification");
        } else {
            console.log(err);
        }
    });

};


workers.processCheckOutCome = function (checkData, checkOutCome) {
    // check if the check out come up or down

    let state = !checkOutCome.error && checkOutCome.responseCode && checkData.successCodes.includes(checkOutCome.responseCode) ? "up" : "down";

    // decide whatever alert user or not

    let alertWanted = checkData.lastCheck && checkData.state !== state ? true : false;

    console.log("41 altertWanted", checkData.lastCheck);
    let newCheckData = checkData;
    newCheckData.state = state;
    newCheckData.lastCheck = Date.now()


    //update check to db
    data.update("checks", newCheckData.checkId, newCheckData, function (err) {
        if (!err) {
            console.log("50 altertWanted",checkData.lastCheck);
           

            if (alertWanted) {

                // send check data to next process: show altert
                workers.sendUserAlert(newCheckData);
            }else{
                console.log("No changes to state");
            }
        } else {
            console.log("error while update check data");
        }
    })

};

workers.performCheck = function (checkData) {

    //prepare the initial check outcome
    let checkOutCome = {
        error: false,
        responseCode: false
    };

    //mark the outcome status 
    let outComeSend = false;

    const parseUrl = url.parse(`${checkData.protocol}://${checkData.url}`, true);
    const path = parseUrl.path;
    const hostname = parseUrl.hostname

    //construct the request
    const requestObj = {
        protocol: parseUrl.protocol,
        hostname: hostname,
        method: checkData.method.toUpperCase(),
        path: path,
        timeout: checkData.timeOutSec * 1000,

    };

    const protocolToUse = parseUrl.protocol === "https" ? https : http;

    const req = protocolToUse.request(requestObj, function (res) {
        const status = res.statusCode;
        checkOutCome.responseCode = status;
        console.log({ status });
        // pass the check outcome to update 
        if (!outComeSend) {
            workers.processCheckOutCome(checkData, checkOutCome);
            outComeSend = true;
        }
    });

    req.on("error", (e) => {
        // pass the check outcome to update 
        checkOutCome = {
            error: true,
            value: e
        }
        if (!outComeSend) {
            workers.processCheckOutCome(checkData, checkOutCome);
            outComeSend = true;
        }
    });

    req.on("timeout", () => {
        checkOutCome = {
            error: true,
            value: "timeout"
        }
        // pass the check outcome to update 
        if (!outComeSend) {
            workers.processCheckOutCome(checkData, checkOutCome);
            outComeSend = true;
        }
    })

    req.end()


};

workers.validateCheckData = function (checkData) {
    if (checkData && checkData.checkId) {
        checkData.state = typeof checkData.state === "string" && ["up", "down"].includes(checkData.state) ? checkData.state : "down";
        checkData.lastCheck = typeof checkData.lastCheck === "number" && checkData.lastCheck > 0 ? checkData.lastCheck : null;
        //pass to next process
        workers.performCheck(checkData);

    } else {
        console.log("Error: Invalid check datasss");
    }
};

// lookup all the checks
workers.gatherAllChecks = function () {
    data.list("checks", function (err, checks) {
        if (!err && checks) {

            // read the check data
            checks.forEach(check => {
                data.read("checks", check, function (err, checkData) {
                    if (!err && checkData) {
                        // console.log(checkData);
                        // pass the data to the validator
                        workers.validateCheckData(checkData);
                    } else {
                        console.log("Error while reading check file data");
                    }
                })
            });
        } else {
            console.log("Error while reading checks directory");
        }
    })
};

//timer to execute the worker process once per minute
workers.loop = function () {
    setInterval(() => {
        workers.gatherAllChecks();
    }, 1000 * 60);
};


workers.init = function () {
    console.log("worker running");

    // execute all the checks 
    workers.gatherAllChecks();


    //call the loop so the checks continue
    workers.loop();

};



//star the server
module.exports = workers;
