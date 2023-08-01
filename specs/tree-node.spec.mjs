import { ContainerConfigNode, ObjectNodeTemplate } from '../lib/container/object-tree.mjs';
import { Github, GithubMock } from '../lib/registry.mjs';
fdescribe('when creating a', () => {
    it('should', () => {
        const configTemplate = new ObjectNodeTemplate('container', [
            new ObjectNodeTemplate('members', [
                new ObjectNodeTemplate('any', [
                    new ObjectNodeTemplate('class', {}),
                    new ObjectNodeTemplate('args', {})
                ]),
                new ObjectNodeTemplate('any', [
                    new ObjectNodeTemplate('value', {})
                ]),
                new ObjectNodeTemplate('any', [
                    new ObjectNodeTemplate('callback', {}),
                    new ObjectNodeTemplate('args', {})
                ])
            ]),
            new ObjectNodeTemplate('behavior', [
                new ObjectNodeTemplate('singleton', false),
                new ObjectNodeTemplate('errorHalt', true)
            ]),
            new ObjectNodeTemplate('mocks', [
                new ObjectNodeTemplate('class', {}),
                new ObjectNodeTemplate('classMock', {}),
                new ObjectNodeTemplate('args', {})
            ])
        ]);
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
        const containerConfigNode = new ContainerConfigNode(containerConfig, configTemplate);
        console.log(containerConfigNode.toString());
    });
});