const github = require('./github');
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
            logging.log({ info: error.stack });
            return null;
         }
      },
      isExisting: async () => {
         try {
            const metadata = await operations.getFileMetadata();
            if (metadata) {
               return true;
            }
            return false;
         } catch(error) {
            return false;
         }
      },
      getFileContent: async () => {
         try {
            const metadata = await operations.getFileMetadata();
            if (!metadata) {
               throw new Error(`no '${fileName}' file(s) in the '${branchName}' branch.`);
            }
            return utils.base64ToString(metadata.content);
         } catch(error) {
            logging.log({ error });
            logging.log({ info: error.message });
            logging.log({ info: error.stack });
            return null;
         }
      },
      ensureFileContent: async ({ content }) => {
         try {
            const metadata = await operations.getFileMetadata();
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
            logging.log({ info: error.stack });
         }
      },
      deleteFile: async () => {
         const metadata = await operations.getFileMetadata();
         if (metadata) {
            try {
               await octokit.request(`DELETE /repos/marchuanv/active-objects/contents/${fileName}.js`, {
                  owner: 'marchuanv',
                  repo: 'active-objects',
                  path: `/${fileName}.js`,
                  message: 'deleted', 
                  branch: branchName,
                  committer: {
                     name: 'active-objects-admin',
                     email: 'active-objects-admin@gmail.com'
                  },
                  sha: metadata?.sha
               });
            } catch(error) {
               logging.log({ error });
               logging.log({ info: error.message });
               logging.log({ info: error.stack });
            }
         }
      }
   };
   return operations;
}