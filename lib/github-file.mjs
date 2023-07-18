import { Container, Github, GithubFake } from "./registry.mjs";
export class GithubFile extends Container {
   constructor({ branchName, fileName, token }) {
      super({
         github: {
            type: { Github },
            args: { auth: token }
         },
         branchName: {
            name: 'branchName',
            value: branchName
         },
         fileName: {
            name: 'fileName',
            value: fileName
         },
         jsFileNameExp: {
            name: 'jsFileNameExp',
            value: /^.js$/g
         },
         jsonFileNameExp: {
            name: 'jsonFileNameExp',
            value: /^.json$/g
         },
         githubFake: {
            type: { Github },
            typeFake: { GithubFake },
            args: { auth: token }
         },
         behaviour: {
            errors: {
               func: ['exists'],
               return: false
            }
         }
      });
   }
   async getMetadata() {
      const _fileName = this.fileName.replace(this.jsFileNameExp, '.js').replace(this.jsonFileNameExp, '.json');
      const response = await this.github.request({ route: `GET /repos/marchuanv/active-objects/contents/${_fileName}?ref=${this.branchName}` });
      const { data } = response;
      return data;
   }
   async exists() {
      const metadata = await this.getMetadata();
      if (metadata) {
         return true;
      }
      return false;
   }
   async getContent() {
      const metadata = await this.getMetadata();
      if (!metadata) {
         throw new Error(`no '${this.fileName}' file(s) in the '${this.branchName}' branch.`);
      }
      return metadata.content;
   }
   async ensureContent({ content }) {
      const metadata = await this.getMetadata();
      const _fileName = this.fileName.replace(this.jsFileNameExp, '.js').replace(this.jsonFileNameExp, '.json');
      await this.github.request({
         route: `PUT /repos/marchuanv/active-objects/contents/${_fileName}`, parameters: {
            owner: 'marchuanv',
            repo: 'active-objects',
            path: `/${_fileName}`,
            message: 'created/updated',
            branch: this.branchName,
            committer: {
               name: 'active-objects-admin',
               email: 'active-objects-admin@gmail.com'
            },
            content,
            sha: metadata?.sha
         }
      });
      return true;
   }
   async delete() {
      const metadata = await this.getMetadata();
      const _fileName = this.fileName.replace(this.jsFileNameExp, '.js').replace(this.jsonFileNameExp, '.json');
      if (metadata) {
         await this.github.request({
            route: `DELETE /repos/marchuanv/active-objects/contents/${_fileName}`, parameters: {
               owner: 'marchuanv',
               repo: 'active-objects',
               path: `/${_fileName}`,
               message: 'deleted',
               branch: this.branchName,
               committer: {
                  name: 'active-objects-admin',
                  email: 'active-objects-admin@gmail.com'
               },
               sha: metadata?.sha
            }
         });
         return true;
      }
   }
}
