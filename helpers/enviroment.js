// external module/ dependenicies


// module scraffolding 
const enviroments = {

};

enviroments.stagging = {
    eName: "stagging",
    port: 3000,
}


enviroments.production = {
    eName : "production",
    port: 5000,
}

// detarmine current enviroment 
const currentEnviroment = typeof(process.env.NODE_ENV) === "string" ? process.env.NODE_ENV : "stagging";
const enviromentToExport = typeof(enviroments[currentEnviroment]) === "object" ? enviroments[currentEnviroment] : enviroments["stagging"];

// console.log({enviromentToExport});
// export module 
module.exports = enviromentToExport;
