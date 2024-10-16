// external module/ dependencies
const { _token: { verify } } = require("./tokenHandler")
const data = require("./../../lib/data");
const enviroment = require("../../helpers/enviroment");
const { createRandomString } = require("../../helpers/utilities");


// module scraffolding 
const handler = {};

handler.checkHandler = function (requestProperties, callback) {

    const allowedMethod = ["get", "post", "put", "delete"];
    if (allowedMethod.includes(requestProperties.reqMethod)) {
        // method allowed 
        handler._check[requestProperties.reqMethod](requestProperties, callback);
    } else {
        // method not allowed 
        callback(405)
    }

}


handler._check = {};
handler._check.post = function (reqProperties, callback) {
    console.log("hitted check post");
    const { body } = reqProperties;

    // validate input 
    const protocol = typeof body.protocol === "string" && ["http", "https"].includes(body.protocol) ? body.protocol : null;
    const url = typeof body.url === "string" && body.url.trim().length > 0 ? body.url : null;
    const method = typeof body.method === "string" && ["get", "post", "put", "delete"].includes(body.method) ? body.method : null;
    const successCodes = Array.isArray(body.successCodes) ? body.successCodes : null;
    const timeOutSec = typeof body.timeOutSec === "number" && body.timeOutSec % 1 === 0 && body.timeOutSec >= 1 && body.timeOutSec <= 5 ? body.timeOutSec : null;
    // console.log({protocol, url, method, successCodes, timeOutSec});
    if (protocol, url, method, successCodes, timeOutSec) {
        // valid input, check token
        const token = typeof (reqProperties.headersObject.token) === "string" ? reqProperties.headersObject.token : false;
        data.read("tokens", token, function (err, tokenData) {
            if (!err) {
                const { phone } = tokenData;
                data.read("users", phone, function (err, userData) {
                    if (!err) {
                        //user found
                        verify(token, phone, function (isValidToken) {
                            if (isValidToken) {

                                const userChecks = Array.isArray(userData.checks) ? userData.checks : [];
                                if (userChecks.length < enviroment.maxChecks) {
                                    //
                                    const checkId = createRandomString(20);

                                    const checkObj = {
                                        checkId,
                                        userPhone: phone,
                                        protocol,
                                        method,
                                        url,
                                        successCodes,
                                        timeOutSec
                                    }

                                    //save the object

                                    data.create("checks", checkId, checkObj, function (err, checkData) {
                                        if (!err) {
                                            //
                                            const updatedUser = {
                                                ...userData,
                                                checks: userChecks
                                            };
                                            updatedUser.checks.push(checkId)
                                            // add check id to user
                                            data.update("users", phone, updatedUser, function (err) {
                                                if (!err) {
                                                    //
                                                    callback(200, { status: true, message: "Successfully added user", checkObj })
                                                } else {
                                                    // error while update user checks
                                                    callback(500, { status: true, message: "error while updating user checks" })
                                                }
                                            })

                                        } else {
                                            // error while storing check
                                            callback(500, { status: true, message: "error while storing check" })
                                        }
                                    })

                                } else {
                                    // max check limit cross
                                    callback(401, { status: true, message: "Max checks litmsit crossed" })
                                }
                            } else {
                                callback(403, { status: true, message: "token expired" })

                            }
                        })
                    } else {
                        callback(403, { status: true, message: "User not found" })
                    }
                })
            } else {
                //token file not found
                callback(403, { status: true, message: "Invalid token" })
            }
        })


    } else {
        callback(400, { status: true, message: "Invalid input" })
    }

}
handler._check.get = function (reqProperties, callback) {
    console.log("hitted check get");
    const id = reqProperties.queryStringObject.id && typeof reqProperties.queryStringObject.id === "string" && reqProperties.queryStringObject.id.trim().length >= 20 ? reqProperties.queryStringObject.id : null;
    console.log(id);
    if (id) {
        //valid input
        data.read("checks", id, function (err, checkData) {
            if (!err && checkData) {
                // data found, check token
                const token = typeof (reqProperties.headersObject.token) === "string" ? reqProperties.headersObject.token : false;
                verify(token, checkData.userPhone, function (isValidToken) {
                    if (isValidToken) {
                        //
                        callback(200, { status: true, message: "Found check data", checkData })

                    } else {
                        callback(403, { status: true, message: "Invalid token" })
                    }
                })
            } else {
                // data not found 
                callback(404, { status: true, message: "Not found check" })
            }
        })
    } else {
        //invalid input
        callback(400, { status: true, message: "Invalid input" })
    }
}

handler._check.put = function (reqProperties, callback) {
    console.log("hitted check put");
    const { body } = reqProperties;
    const id = body.id && typeof body.id === "string" && body.id.trim().length >= 20 ? body.id : null;
    const protocol = typeof body.protocol === "string" && ["http", "https"].includes(body.protocol) ? body.protocol : null;
    const url = typeof body.url === "string" && body.url.trim().length > 0 ? body.url : null;
    const method = typeof body.method === "string" && ["get", "post", "put", "delete"].includes(body.method) ? body.method : null;
    const successCodes = Array.isArray(body.successCodes) ? body.successCodes : null;
    const timeOutSec = typeof body.timeOutSec === "number" && body.timeOutSec % 1 === 0 && body.timeOutSec >= 1 && body.timeOutSec <= 5 ? body.timeOutSec : null;

    if (id) {
        // id found
        if (protocol || url || method || successCodes || timeOutSec) {
            data.read("checks", id, function (err, checkData) {
                if (!err && checkData) {
                    const token = typeof (reqProperties.headersObject.token) === "string" ? reqProperties.headersObject.token : false;
                    verify(token, checkData.userPhone, function (isValidToken) {
                        if (isValidToken) {
                            // token is valid
                            if (protocol) {
                                checkData.protocol = protocol
                            }
                            if (method) {
                                checkData.method = method
                            }
                            if (url) {
                                checkData.url = url
                            }
                            if (successCodes) {
                                checkData.successCodes = successCodes
                            }
                            if (timeOutSec) {
                                checkData.timeOutSec = timeOutSec
                            }
                            data.update("checks", id, checkData, function (err) {
                                if (!err) {
                                    // update successfully
                                    callback(200, { status: true, message: "Check updated successfully" })

                                } else {
                                    //error while updating check
                                    callback(500, { status: true, message: "Error while updating checks" })
                                }
                            })
                        } else {
                            // token is invalid
                            callback(403, { status: true, message: "Invaild token" })
                        }
                    })
                } else {
                    console.log(err);
                    // not found check file
                    callback(404, { status: true, message: "Not found the check route" })
                }
            })

        } else {
            // noting updated
            callback(400, { status: true, message: "Invalid value" })
        }
    } else {
        // id not found 
        callback(400, { status: true, message: "Invalid id" })
    }
}

handler._check.delete = function (reqProperties, callback) {
    console.log("hitted check delete");
    const id = reqProperties.queryStringObject.id && typeof reqProperties.queryStringObject.id === "string" && reqProperties.queryStringObject.id.trim().length >= 20 ? reqProperties.queryStringObject.id : null;
    if (id) {
        // id found
        data.read("checks", id, function (err, checkData) {
            if (!err && checkData) {
                // file found, check token
                const token = typeof (reqProperties.headersObject.token) === "string" ? reqProperties.headersObject.token : false;
                verify(token, checkData.userPhone, function (isValidToken) {
                    if (isValidToken) {
                        // token is valid
                        data.delete("checks", id, function (err) {
                            if (!err) {
                                // check deleted successfully

                                data.read("users", checkData.userPhone, function (err, userData) {
                                    if (!err && userData) {
                                        const userChecks = Array.isArray(userData.checks) ? userData.checks : [];

                                        userChecks.splice(userChecks.indexOf(id), 1);
                                        console.log({userChecks});
                                        userData.checks = userChecks;

                                        data.update("users", checkData.userPhone, userData, function (err) {
                                            if (!err) {
                                                // updated user check successfully
                                                callback(200, { status: true, message: "Deleted user checks successfully" })
                                            } else {
                                                // error while update user checks
                                                callback(500, { status: true, message: "error while updating user checks" })
                                            }
                                        })
                                    } else {
                                        // faild to read user file
                                        callback(500, { status: true, message: "error while reading user" })
                                    }
                                })
                            } else {
                                // error while delete
                                callback(500, { status: true, message: "Error while delete check" })
                            }
                        })
                    } else {
                        //token is invaild
                        callback(403, { status: true, message: "Invalid token" })
                    }
                })
            } else {
                callback(404, { status: true, message: "not found check" })
            }
        })
    } else {
        // id not found
        callback(400, { status: true, message: "no id found in the request" })
    }
}



// export module
module.exports = handler;