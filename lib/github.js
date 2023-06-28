const { Octokit } = require("octokit");
module.exports = {
    login: ({ privateKey }) => {
        return new Octokit({
            auth: privateKey
        });
    }
}


