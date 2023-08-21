import utils from 'utils'
import { ContainerConfig } from "../lib/container-config.mjs";
import { ContainerConfigTemplate } from "../lib/container-config-template.mjs";
import { Class, ClassDependencyMock } from './class.mjs';
describe('when creating a', () => {
    it('should', () => {
        const configTemplate = new ContainerConfigTemplate();
        const config = new ContainerConfig(configTemplate, {
            root: {
                container: {
                    members: {
                        github: {
                            class: { Class },
                            args: { auth: 'storeAuthToken' },
                            mock: { ClassDependencyMock }
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
                    behaviour: {
                        singleton: false,
                        errorHalt: false
                    }
                }
            }
        });
    });
});