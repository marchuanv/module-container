const https = require("https");
module.exports = ({ url }) => {
    return new Promise((resolve, reject) => {
        https.get(url, (resp) => {
            let content = "";
            resp.on('data', (chunk) => content += chunk);
            resp.on('end', () => {
                resolve(content);
            });
        }).on("error", (err) => {
            reject(err);
        });
    });
};