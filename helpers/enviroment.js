// external module/ dependenicies


// module scraffolding 
const enviroments = {

};

enviroments.stagging = {
    eName: "stagging",
    port: 3000,
    secret: "secretStagging",
    maxChecks: 5,
    twilio: {
        fromPhone: "+17653284517",
        accountSid: "AC6ccaeb5af4f2f854c1ff633dbdc4babc",
        authToken: "6c2176318687f787320fe8c6ddfef112"

    }
}


enviroments.production = {
    eName : "production",
    port: 5000,
    secret: "secretProduction",
    maxChecks: 5,
    twilio: {
        fromPhone: "+17653284517",
        accountSid: "AC6ccaeb5af4f2f854c1ff633dbdc4babc",
        authToken: "6c2176318687f787320fe8c6ddfef112"

    }
}
// detarmine current enviroment 
const currentEnviroment = typeof(process.env.NODE_ENV) === "string" ? process.env.NODE_ENV : "stagging";
const enviromentToExport = typeof(enviroments[currentEnviroment]) === "object" ? enviroments[currentEnviroment] : enviroments["stagging"];

// console.log({enviromentToExport});
// export module 
module.exports = enviromentToExport;
