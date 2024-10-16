// external module/ dependencis
const enviroment = require("./enviroment");

const accountSid = enviroment.twilio.accountSid;
const authToken = enviroment.twilio.authToken;

const twilio = require("twilio");
const client = twilio(accountSid, authToken);
//module scraffolding
const notifications = {

};

notifications.sendTwilioSms = function (phone, sms, callback) {
    // validate input 
    
    const userPhone = typeof phone === "string" && phone.length === 11 ? phone : null;
    const userMessage = typeof sms === "string" && sms.length > 0 && sms.length < 160 ? sms : null;

    if (userPhone && userMessage) {
        const payload = {
            from: enviroment.twilio.fromPhone ,
            body: userMessage,
            to: `+88${userPhone}`
        }


        client.messages.create(payload)
        .then(message => {
            callback(false)
            console.log(message.body);
        })
        .catch(err => {
            callback(err)
            console.log(err);
        })
    } else {
        callback("Invalid Input Parameters")

    }
}


// export module
module.exports = notifications;
