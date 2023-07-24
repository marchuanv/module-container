import { Container, Github, GithubMock } from "./registry.mjs";
export class GithubBranch extends Container {
   constructor({ branchName, token }) {
      super({
         github: {
            type: { Github },
            args: { auth: token }
         },
         branch: {
            name: 'branchName',
            value: branchName
         },
         githubMock: {
            type: { Github },
            mockType: { GithubMock },
            args: { auth: token }
         },
         behaviour: {
            singleton: false,
            errors: {
               func: ['exists'],
               return: false
            }
         }
      });
   }
   async exists() {
      const github = await this.github;
      const branchName = await this.branchName;
      return await github.request({ route: `GET /repos/marchuanv/active-objects/branches/${branchName}` });
   }
   async create() {
      const github = await this.github;
      const branchName = await this.branchName;
      const { data } = await github.request({ route: `GET /repos/marchuanv/active-objects/git/refs/heads` });
      let revision = data.shift().object.sha;
      if (revision) {
         await github.request({
            route: `POST /repos/marchuanv/active-objects/git/refs`, parameters: {
               ref: `refs/heads/${branchName}`,
               sha: revision
            }
         });
         return true;
      }
      return false;
   }
   async delete() {
      const github = await this.github;
      const branchName = await this.branchName;
      await github.request({ route: `DELETE /repos/marchuanv/active-objects/git/refs/heads/${branchName}` });
      return true;
   }
}
