const github = require('./github');
module.exports = {
   getContent: async ({ branchName, fileName }) => {
      const octokit = await github.login();
      const { data } = await octokit.request(`GET /repos/marchuanv/active-objects/contents/${branchName}.js?ref=${fileName}`);
      return await fetch({ url: data.download_url});
   },
   createContent: async ({ branchName, fileName }) => {
      const octokit = await github.login();
      await octokit.request(`${request.method} /repos/marchuanv/active-objects/contents/${fileName}.js`, {
         owner: 'marchuanv',
         repo: 'active-objects',
         path: `/${fileName}.js`,
         message: 'created/updated', 
         branch: branchName,
         committer: {
             name: 'active-objects-admin',
             email: 'active-objects-admin@gmail.com'
         }, 
         content: utils.stringToBase64(content),
         sha: fileSha
      });
   }
}
