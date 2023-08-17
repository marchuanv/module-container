import { ContainerConfig } from "../lib/container/container-config.mjs";
import { ContainerConfigTemplate } from "../lib/container/container-config-template.mjs";
import { Github, GithubMock } from '../lib/registry.mjs';
import utils from 'utils'
describe('when creating a', () => {
    it('should', () => {
        const configTemplate = new ContainerConfigTemplate();
        const config = new ContainerConfig(configTemplate, {
            root: {
                container: {
                    members: {
                        github: {
                            class: { Github },
                            args: { auth: 'storeAuthToken' }
                        },
                        branchName: {
                            value: 'branchName'
                        },
                        fileName: {
                            value: 'fileName'
                        },
                        jsFileNameExp: {
                            value: /^.js$/g
                        },
                        jsonFileNameExp: {
                            value: /^.json$/g
                        },
                        utils: {
                            value: utils
                        }
                    },
                    mocks: {
                        githubMock: {
                            class: { Github },
                            mockClass: { GithubMock },
                            args: { auth: 'storeAuthToken' }
                        }
                    },
                    behaviour: {
                        singleton: false,
                        errorHalt: false
                    }
                }
            }
        });
    });
});