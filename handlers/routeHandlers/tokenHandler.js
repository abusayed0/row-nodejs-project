// external module/ dependencies
const { hashString, createRandomString } = require("../../helpers/utilities");
const data = require("./../../lib/data");
// module scraffolding 
const handler = {};

handler.tokenHander = function (requestProperties, callback) {

    const allowedMethod = ["get", "post", "put", "delete"];
    if (allowedMethod.includes(requestProperties.reqMethod)) {
        // method allowed 
        handler._token[requestProperties.reqMethod](requestProperties, callback);
    } else {
        // method not allowed 
        callback(405)
    }

}


handler._token = {};
handler._token.post = function (reqProperties, callback) {
    console.log("hitted token post");
    const { body } = reqProperties;
    const phone = body.phone && typeof body.phone === "string" && body.phone.trim().length === 11 ? body.phone : null;
    const password = body.password && typeof body.password === "string" && body.password.trim().length > 5 ? body.password : null;

    if (phone && password) {
        //
        data.read("users", phone, function (err, userData) {
            if (!err) {
                //user found
                const camparePass = userData.password === hashString(password);
                if (camparePass) {
                    // valid user
                    const tokenId = createRandomString(20);
                    const expires = Date.now() + 60 * 60 * 1000;

                    const tokenObject = {
                        phone,
                        id: tokenId,
                        expires
                    }

                    // store the token obj 
                    data.create("tokens", tokenId, tokenObject, function (err) {
                        if (!err) {
                            // stored successfully
                            callback(200, { status: true, message: "Token stored sucessfully", tokenObject })
                        } else {
                            callback(500, { status: true, message: "Error while storing token." })
                        }
                    })

                } else {
                    // invaild user
                    callback(400, { status: true, message: "Invaild Password" })
                }
            } else {
                // user not found 
                callback(404, { status: true, message: "Not found" })
            }
        })

    } else {
        //
        callback(400, { status: true, message: "Invalid input" })
    }

}
handler._token.get = function (reqProperties, callback) {
    console.log("hitted token get");
    const { body } = reqProperties;
    const id = body.id && typeof body.id === "string" && body.id.trim().length >= 20 ? body.id : null;
    // console.log(id);
    if (id) {
        //valid id
        data.read("tokens", id, function (err, data) {

            if (!err && data) {

                // token found
                callback(200, { status: true, message: "token founded", tokenObj: data })
            } else {
                // token not founded
                callback(404, { status: true, message: "Not found" })
            }
        })
    } else {
        //invaild phone
        callback(400, { status: true, message: "Invalid token." })
    }

}

handler._token.put = function (reqProperties, callback) {
    console.log("hitted token put");
    const { body } = reqProperties;
    const id = body.id && typeof body.id === "string" && body.id.trim().length >= 20 ? body.id : null;
    const doExtend = body.doExtend && typeof body.doExtend === "boolean" ? body.doExtend : null;
    if (id && doExtend) {
        // token correct
        data.read("tokens", id, function (err, token) {
            if (!err) {

                // token found, check its validaty
                if (token.expires > Date.now()) {
                    //valid token
                    const expires = Date.now() + 60 * 60 * 1000;
                    const newTokenObj = {
                        ...token,
                        expires
                    }

                    data.update("tokens", id, newTokenObj, function (err) {
                        if (!err) {
                            // token update successfully
                            callback(200, { status: true, message: "Successfully updated token", tokenObj: newTokenObj })
                        } else {
                            // faild to update token
                            callback(500, { status: true, message: "Error while update token" })
                        }
                    })
                } else {
                    // token expires
                    callback(403, {status: true, message: "Invalid token"})
                }
            } else {
                callback(404, { status: true, message: "Not found" })
            }
        })
    } else {
        callback(400, { status: true, message: "Incorrect input" })
    }
}

handler._token.delete = function (reqProperties, callback) {
    console.log("hitted token delete");
    const id = reqProperties.queryStringObject.id && typeof reqProperties.queryStringObject.id === "string" && reqProperties.queryStringObject.id.trim().length >= 20 ? reqProperties.queryStringObject.id : null;
    if(id){
        //valid id
        data.read("tokens", id, function(err){
            
            if(!err){
                
                // id founded, delete tokens.
                data.delete("tokens", id, function(err){
                    if(!err){
                        //tokens deleted successfully
                        callback(200, {status: true, message: "Successfully deleted token."})
                    }else{
                        //erro while deleting
                        callback(500, {status: false, message: "Error while deleting token."})
                    }
                })
               
            }else{
                // id not founded
                callback(404, {status: true, message: "Not found"})
            }
        })
    }else{
        //invaild phone
        callback(400, {status: true, message: "Invalid phone."})
    }
}

handler._token.verify = function(id, phone, callback){
    data.read("tokens", id, function(err, token) {
        if(!err && token){
            //token founded, check validaty
            if(token.phone === phone && token.expires > Date.now()){
                // token valid
                callback(true, token)
            }else{
                //token invalid
                callback(false);
            }

        }else{
            //token not founded
            callback(false);
        }
    })
}

// export module
module.exports = handler;