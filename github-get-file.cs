const github = require('./github');
module.exports = {
   getContent: ({ branchName, fileName }) => {
      try {
         const octokit = github.login();
         const { data } = await octokit.request(`GET /repos/marchuanv/active-objects/contents/${branchName}.js?ref=${fileName}`);
         return await fetch({ url: data.download_url});
      } catch(error) {
         console.error(error);
      }
   }
}
