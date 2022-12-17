const github = require('./github');
module.exports = {
   getFile: async ({ branchName, fileName }) => {
      const octokit = await github.login();
      const { data } = await octokit.request(`GET /repos/marchuanv/active-objects/contents/${branchName}.js?ref=${fileName}`);
      const sha = data?.sha;
      const content = await fetch({ url: data.download_url});
      return { 
         sha,
         content
      };
   },
   createFile: async ({ branchName, fileName, content }) => {
      const octokit = await github.login();
      const file = await module.exports.getFile({ branchName, fileName });
      await octokit.request(`PUT /repos/marchuanv/active-objects/contents/${fileName}.js`, {
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
         sha: file?.sha;
      });
   }
}
