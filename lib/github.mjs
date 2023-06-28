import { Octokit } from 'octokit';
export class Github {
    login({ privateKey }) {
        return new Octokit({
            auth: privateKey
        });
    }
}
