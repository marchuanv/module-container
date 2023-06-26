const github = require('./github');
const logging = require('./logging');
const utils = require("utils");
let octokit = null;
module.exports = {
   login: ({ privateKey }) => {
      octokit = github.login({ privateKey });
   },
   getFileMetadata: async ({ branchName, fileName }) => {
      try {
         const _fileName = fileName.replace(/.js/g, '.js');
         const { data } = await octokit.request(`GET /repos/marchuanv/active-objects/contents/${_fileName}?ref=${branchName}`);
         return data;
      } catch (error) {
         logging.log({ error });
         logging.log({ info: error.message });
         return null;
      }
   },
   isExisting: async ({ branchName, fileName }) => {
      try {
         const metadata = await module.exports.getFileMetadata({ branchName, fileName });
         if (metadata) {
            return true;
         }
         return false;
      } catch (error) {
         return false;
      }
   },
   getFileContent: async ({ branchName, fileName }) => {
      try {
         const metadata = await module.exports.getFileMetadata({ branchName, fileName });
         if (!metadata) {
            throw new Error(`no '${fileName}' file(s) in the '${branchName}' branch.`);
         }
         return utils.base64ToString(metadata.content);
      } catch (error) {
         logging.log({ error });
         logging.log({ info: error.message });
         return null;
      }
   },
   ensureFileContent: async ({ branchName, fileName, content }) => {
      try {
         const metadata = await module.exports.getFileMetadata({ branchName, fileName });
         const _fileName = fileName.replace(/.js/g, '.js');
         await octokit.request(`PUT /repos/marchuanv/active-objects/contents/${_fileName}.js`, {
            owner: 'marchuanv',
            repo: 'active-objects',
            path: `/${_fileName}`,
            message: 'created/updated',
            branch: branchName,
            committer: {
               name: 'active-objects-admin',
               email: 'active-objects-admin@gmail.com'
            },
            content: utils.stringToBase64(content),
            sha: metadata?.sha
         });
         return true;
      } catch (error) {
         logging.log({ error });
         logging.log({ info: error.message });
         return false;
      }
   },
   deleteFile: async ({ branchName, fileName }) => {
      const metadata = await module.exports.getFileMetadata({ branchName, fileName });
      const _fileName = fileName.replace(/.js/g, '.js');
      if (metadata) {
         try {
            await octokit.request(`DELETE /repos/marchuanv/active-objects/contents/${_fileName}`, {
               owner: 'marchuanv',
               repo: 'active-objects',
               path: `/${_fileName}`,
               message: 'deleted',
               branch: branchName,
               committer: {
                  name: 'active-objects-admin',
                  email: 'active-objects-admin@gmail.com'
               },
               sha: metadata?.sha
            });
            return true;
         } catch (error) {
            logging.log({ error });
            logging.log({ info: error.message });
            return false;
         }
      }
   }
}