//external module/dependencies
const crypto = require("crypto")
const {secret} = require("./enviroment")
// module scrffolding

const utilities = {

};

utilities.parseJSON = function(stringJSON){
    let output = {};
    
    try {
        output = JSON.parse(stringJSON);
    } catch (error) {
        // console.log(error);
    }
   
    return output;
};

utilities.hashString = function(string){
    let hash = crypto.createHmac("sha256", secret).update(string).digest("hex");
    // console.log(hash);
    return hash;
};

utilities.createRandomString = function(length){
    length = typeof length === "number" && length > 0 ? length : 20;
    const possibleCharacter = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
    let output = "";
    for(let i = 0; i <= length; i++){
        let randomPosition = Math.floor(Math.random() * possibleCharacter.length);
        output += possibleCharacter[randomPosition]
    }
    
    return output;
}

//export module
module.exports = utilities;