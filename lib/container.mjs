const promises = [];
const objects = [];

const createMemeber = function(context, name, callback) {
  const member = context.constructor.prototype[name];
  if (member) {
    const info = member.toString();
    const asyncFuncExpression = /async\s+[a-zA-z0-9]+\(\)/g;
    if (asyncFuncExpression.test(info)) { //is async function
      return context.constructor.prototype[name] = async function(args) {
        console.log('intercepting ', name);
        await callback(args);
        return await member.apply(context, args);
      }
    }
  }
  Object.defineProperty(context, name, { configurable: false, get: (args) => {
    return callback(args);
  }});
}

class Container {
  constructor() {
    if (this.constructor.name === 'Container') {
      throw new Error('Container is an abstract class');
    }
    for(const prop of Object.getOwnPropertyNames(this.constructor.prototype)){
      if (prop !== 'constructor') {
        createMemeber(this, prop, async () => {
          while(promises.length > 0) {
            const promise = promises.shift();
            await promise();
          }
        });
      }
    }
  }
  dependency(obj) {
    if (typeof obj === 'function') {
      promises.unshift(obj);
    } else if (typeof obj === 'object') {
      if (!obj.name && obj.Class) {
        obj.name = obj.Class.name;
      }
      const { name, Class, value, ctorArgs } = obj;
      createMemeber(this, name, function() {
        if (value) {
          return value;
        } else if (Class) {
          obj.value = new Class(ctorArgs);
          return obj.value;
        }
      });
    }
  }
}