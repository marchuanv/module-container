import utils from "utils";
const subscribers = new Map();
let stackTop = '';
export class MemberEvent {
    constructor({ memberInfo, context }) {
        this.memberInfo = memberInfo;
        this.context = context;
        this.Id = utils.generateGUID();
    }
    subscribe(callback) {
        if (subscribers.has(this.memberInfo.Id)) {
            throw new Error(`'${this.memberInfo.name}' member is already subscribed to event`);
        } else {
            subscribers.set(this.memberInfo.Id, callback);
        }
    }
    unsubscribe() {
        subscribers.delete(this.memberInfo.Id);
    }
    async raise({ resolve, reject, data }) {
        const stack = (new Error()).stack.split('\n');
        const memberInfo = this.memberInfo;
        const logging = this.context.logging;
        const contextName = this.context.constructor.name;
        const memberId = memberInfo.Id;
        const memberName = memberInfo.name;
        const errorHalt = memberInfo.errorHalt;
        const callback = subscribers.get(memberId);
        stackTop = stack.find(x => x.indexOf(`${contextName}.raiseEvent`) > -1);

        try {
            await logging.log(`raised '${contextName}.${memberName}' event`);
            if (memberInfo.isPublic) {
                for (const publicMemberDep of memberInfo.dependencies.filter(x => x.isCallBeforePublicMember)) {
                    const member = await this.context[publicMemberDep.name];
                    await member();
                }
            }
            const output = await callback.call(this.context, { memberInfo, data });
            await logging.log(`subscribers handled '${contextName}.${memberName}' event`);
            resolve(output);
        } catch (error) {
            if (errorHalt) {
                await logging.log(error);
                reject(error);
            } else {
                await logging.log(error);
                resolve();
            }
        }
    }
}
const isPublicMemberTopOfStack = ({ contextId, isProxy }) => {
    const topOfStackMemberInfo = publicMemberRaisedEventStack.get(contextId).shift();
    if (topOfStackMemberInfo) {
        if (topOfStackMemberInfo.isPublic) {
            if (topOfStackMemberInfo.isProxy === isProxy) {
                return publicMemberRaisedEventStack.get(contextId).unshift(topOfStackMemberInfo);
            }
        }
    }
    return false;
}
const shiftPublicMemberFromStack = ({ contextId }) => {
    publicMemberRaisedEventStack.get(contextId).shift();
}
const putPublicMemberOnStack = ({ contextId, memberInfo }) => {
    publicMemberRaisedEventStack.get(contextId).unshift(memberInfo);
}