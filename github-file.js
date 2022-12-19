const github = require('./github');
const fetch = require("./fetch");
const logging = require('./logging');
const utils = require("utils");
module.exports = ({ privateKey, branchName, fileName }) => {
   const octokit = github.login({ privateKey });
   const operations = {
      getFileMetadata: async () => {
         try {
            const { data } = await octokit.request(`GET /repos/marchuanv/active-objects/contents/${branchName}.js?ref=${fileName}`);
            return data;
         } catch (error) {
            logging.log({ error });
            logging.log({ info: error.message });
            return null;
         }
      },
      getFileContent: async ({ branchName, fileName }) => {
         const metadata = await operations.getFileMetadata({ branchName, fileName });
         if (!metadata) {
            throw new Error(`no '${fileName}' file(s) in the '${branchName}' branch.`);
         }
         const content = await fetch({ url: metadata.download_url});
         return content;
      },
      ensureFileContent: async ({ branchName, fileName, content }) => {
         try {
            const metadata = await operations.getFileMetadata({ branchName, fileName });
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
               sha: metadata?.sha
            });
         } catch(error) {
            logging.log({ error });
            logging.log({ info: error.message });
         }
      },
      deleteFile: async () => {
         const metadata = await operations.getFileMetadata({ branchName, fileName });
         if (metadata) {
            await octokit.request(`DELETE /repos/marchuanv/active-objects/contents/${fileName}.js`, {
               owner: 'marchuanv',
               repo: 'active-objects',
               path: `/${fileName}.js`,
               message: 'created/updated', 
               branch: branchName,
               committer: {
                  name: 'active-objects-admin',
                  email: 'active-objects-admin@gmail.com'
               },
               sha: metadata?.sha
            });
         }
      }
   };
   return operations;
}