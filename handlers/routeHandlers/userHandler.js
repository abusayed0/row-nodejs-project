// external module/ dependencies
const { hashString } = require("../../helpers/utilities");

// module scraffolding 
const handler = {};
const data = require("./../../lib/data");
const { _token: { verify } } = require("./tokenHandler")

handler.userHander = function (requestProperties, callback) {

    const allowedMethod = ["get", "post", "put", "delete"];
    if (allowedMethod.includes(requestProperties.reqMethod)) {
        // method allowed 
        handler._users[requestProperties.reqMethod](requestProperties, callback);
    } else {
        // method not allowed 
        callback(405)
    }

}


handler._users = {};
//TODO: authenticate user
handler._users.get = function (reqProperties, callback) {
    console.log("hitted users get");

    const phone = reqProperties.queryStringObject.phone && typeof reqProperties.queryStringObject.phone === "string" && reqProperties.queryStringObject.phone.trim().length === 11 ? reqProperties.queryStringObject.phone : null;
    if (phone) {
        //valid phone, check token
        const token = typeof (reqProperties.headersObject.token) === "string" ? reqProperties.headersObject.token : false;
        if (token) {
            //token found, check token validaty
            verify(token, phone, function (isValidToken) {
                if (isValidToken) {
                    data.read("users", phone, function (err, data) {

                        if (!err && data) {
                            delete data.password;
                            // user founded
                            callback(200, { status: true, message: "Users founded", data })
                        } else {
                            // user not founded
                            callback(404, { status: true, message: "Not found" })
                        }
                    })
                } else {
                    callback(403, { status: true, message: "Invalid token" })
                }
            });

        } else {
            // token not found
            callback(401, { status: true, message: "no token" })
        }


    } else {
        //invaild phone
        callback(400, { status: true, message: "Invalid phone." })
    }

}
handler._users.post = function (reqProperties, callback) {
    const { body } = reqProperties;

    const firstName = body.firstName && typeof body.firstName === "string" && body.firstName.trim().length > 0 ? body.firstName : null;
    const lastName = body.lastName && typeof body.lastName === "string" && body.lastName.trim().length > 0 ? body.lastName : null;
    const phone = body.phone && typeof body.phone === "string" && body.phone.trim().length === 11 ? body.phone : null;
    const password = body.password && typeof body.password === "string" && body.password.trim().length > 5 ? body.password : null;
    const doAggree = body.doAggree && typeof body.doAggree === "boolean" ? body.doAggree : null;

    if (firstName && lastName && phone && password && doAggree) {
        // make sure user does not exists
        data.read("users", phone, function (err, user) {

            if (err && !user) {

                //means user not exist, create new user.
                const newUser = { firstName, lastName, phone, password: hashString(password), doAggree };
                data.create("users", phone, newUser, function (err) {
                    if (!err) {
                        // user created successfully
                        callback(200, { status: true, message: "Successfully created user." })
                    } else {
                        //failed to create user
                        callback(500, { status: true, message: "failed to create new user." })
                    }
                })

            } else {

                // use does exist
                callback(500, { status: true, message: "User already exist." })
            }
        })
    } else {
        callback(400, { status: true, message: "All field required!" })
    }
}
//TODO: authenticate user
handler._users.put = function (reqProperties, callback) {
    console.log("hitted user put");

    const { body } = reqProperties;
    const firstName = body.firstName && typeof body.firstName === "string" && body.firstName.trim().length > 0 ? body.firstName : null;
    const lastName = body.lastName && typeof body.lastName === "string" && body.lastName.trim().length > 0 ? body.lastName : null;
    const phone = body.phone && typeof body.phone === "string" && body.phone.trim().length === 11 ? body.phone : null;
    const password = body.password && typeof body.password === "string" && body.password.trim().length > 5 ? body.password : null;


    if (phone) {
        // valid phone, check token
        const token = typeof (reqProperties.headersObject.token) === "string" ? reqProperties.headersObject.token : false;
        if (token) {
            //token found, check token validaty
            verify(token, phone, function (isValidToken) {
                if (isValidToken) {

                    //lookup user now
                    data.read("users", phone, function (err, userData) {

                        if (!err && userData) {
                            // user founded, update user
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            if (password) {
                                userData.password = hashString(password);
                            }

                            data.update("users", phone, userData, function (err) {
                                if (!err) {
                                    // updated successfully
                                    callback(200, { status: true, message: "Updated successfully" })
                                } else {
                                    //faild to update
                                    callback(500, { status: true, message: "Failed to update" })
                                }
                            })

                        } else {
                            // user not founded
                            callback(404, { status: true, message: "Not found" })
                        }
                    })
                } else {
                    callback(403, { status: true, message: "Invalid token" })
                }
            });

        } else {
            // token not found
            callback(401, { status: true, message: "no token" })
        }


    } else {
        // invalid phone
        callback(400, { status: true, message: "Invaild phone" })
    }
}
//TODO: authenticate user
handler._users.delete = function (reqProperties, callback) {
    console.log("hitted users delete");

    const phone = reqProperties.queryStringObject.phone && typeof reqProperties.queryStringObject.phone === "string" && reqProperties.queryStringObject.phone.trim().length === 11 ? reqProperties.queryStringObject.phone : null;

    if (phone) {
        //valid phone, check token
        const token = typeof (reqProperties.headersObject.token) === "string" ? reqProperties.headersObject.token : false;
        if (token) {
            //token found, check token validaty
            verify(token, phone, function (isValidToken) {
                if (isValidToken) {
                    data.read("users", phone, function (err) {

                        if (!err) {

                            // user founded, delete user.
                            data.delete("users", phone, function (err) {
                                if (!err) {
                                    //user deleted successfully
                                    callback(200, { status: true, message: "Successfully deleted user." })
                                } else {
                                    //erro while deleting
                                    callback(500, { status: false, message: "Error while deleting user." })
                                }
                            })

                        } else {
                            // user not founded
                            callback(404, { status: true, message: "Not found" })
                        }
                    })
                } else {
                    callback(403, { status: true, message: "Invalid token" })
                }
            });

        } else {
            // token not found
            callback(401, { status: true, message: "no token" })
        }

    } else {
        //invaild phone
        callback(400, { status: true, message: "Invalid phone." })
    }
}

// export module
module.exports = handler;