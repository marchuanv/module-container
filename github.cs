const { Octokit } = require("octokit");
module.exports = {
    login: () => {
        retun new Octokit({ 
            auth: process.env.GIT 
        }); 
    }
}
