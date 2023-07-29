const templates = [];
templates.push({ name: 'members', template: {
   members: [{
      any: { class: null, args: null }
   },{
      any: { value: null }
   },{
      any: { callback: null, args: null }
   }]
}});
templates.push({ name: 'mocks', template: {
   mocks: [{
      any: {
         class: null,
         mockClass: null,
         args: null
      }
   }]
}});
templates.push({ name: 'behaviour', template: {
   behaviour: {
      singleton: null,
      errorHalt: null
   }
}});

const configTemplateProperties = new WeakMap();
export class ConfigTemplate {
   constructor({ name }) {
      configTemplateProperties.delete(this);
      const template = templates.find(x => x.name === name);
      if (template) {
         this.id = name;
         configTemplateProperties.set(this, { messages: [], template });
      }
   }
   get messages() {
      return configTemplateProperties.get(this).messages;
   }
   set messages(value) {
      let messages = configTemplateProperties.get(this).messages;
      if (Array.isArray(value)) {
         messages = messages.concat(value);
         configTemplateProperties.get(this).messages = messages;
      } 
      return messages;
   }
   exists() {
     return configTemplateProperties.get(this) !== undefined;
   }
   match({ object, template }) {
      if (!object) {
         throw new Error('invalid match argument: object');
      }
      if (!template) {
         ({ template } = JSON.parse(JSON.stringify(configTemplateProperties.get(this))));
         ({ template } = template);
      }
      const objectType = typeof object;
      let templateType = Array.isArray(template) ? 'array' : typeof object;     
      if (templateType === 'array') {
         let adjustedTemplate = template.map((x) => {
            const key = Object.keys(x)[0];
            return { key, value: x[key] };
         });
         template = adjustedTemplate.reduce((obj, item, index) => {
            if (item.key === 'any') {
               item.key = `${item.key}_${index}`;
            }
            obj[item.key] = item.value;
            return obj;
         },{});
         templateType = Array.isArray(template) ? 'array' : typeof object;     
      }
      if (objectType !== templateType) {
         return false;
      }
      const templateKeys = Object.keys(template);
      const objectKeys = Object.keys(object);
      const isAllTemplateAny = templateKeys.filter(x => x.startsWith('any_')).length === templateKeys.length;
      if (templateKeys.length !== objectKeys.length && !isAllTemplateAny) {
         return false;
      }
      if (isAllTemplateAny) {
         let unmatchedTemplateKeys = [];
         for (const key of objectKeys) {
            const value = object[key];
            if (value === undefined) {
               return false;
            }
            for (const templateKey of templateKeys) {
               const templateValue = template[templateKey];
               if (templateValue && typeof templateValue === 'object') {
                  if (!this.match({ object: value, template: templateValue })) {
                     unmatchedTemplateKeys.push(Object.keys(templateValue));
                  }
               }
            }
            if(unmatchedTemplateKeys.length > 0) {
               this.messages.push(`'${key}' section in container config does not match any of the following template keys: ${JSON.stringify(unmatchedTemplateKeys)}`);
            }
         }
         if(unmatchedTemplateKeys.length > 0) {
            return false;
         }
         return true;
      } else {
         if (objectKeys.filter(x => templateKeys.find(y => x === y)).length === objectKeys.length) {
            for (const key of templateKeys) {
               const value = object[key];
               if (value === undefined) {
                  this.messages.push(`object[${key}] is undefined.`);
                  return false;
               }
               const templateValue = template[key];
               if (templateValue && typeof templateValue === 'object') {
                  const match = this.match({ object: object[key], template: templateValue });
                  if (!match) {
                     return false;
                  }
               }
            }
            return true;
         }
      }
      return false;
   }
}
