import { ContainerConfig, ContainerConfigTemplate } from '../lib/container/container-config.mjs';
import { Github, GithubMock } from '../lib/registry.mjs';
fdescribe('when creating a', () => {
    it('should', () => {
        const containerConfigTemplate = new ContainerConfigTemplate('container', [
            new ContainerConfigTemplate('members', [
                new ContainerConfigTemplate('any', [
                    new ContainerConfigTemplate('class', {}),
                    new ContainerConfigTemplate('args', {})
                ]),
                new ContainerConfigTemplate('any', [
                    new ContainerConfigTemplate('value', {})
                ]),
                new ContainerConfigTemplate('any', [
                    new ContainerConfigTemplate('callback', {}),
                    new ContainerConfigTemplate('args', {})
                ])
            ]),
            new ContainerConfigTemplate('behavior', [
                new ContainerConfigTemplate('singleton', false),
                new ContainerConfigTemplate('errorHalt', true)
            ]),
            new ContainerConfigTemplate('mocks', [
                new ContainerConfigTemplate('class', {}),
                new ContainerConfigTemplate('classMock', {}),
                new ContainerConfigTemplate('args', {})
            ])
        ]);
        // console.log(containerConfigTemplate.toString());
        const containerConfig = {
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
        };
        const config = new ContainerConfig('root', containerConfig);
        console.log(config.toString());
    });
});