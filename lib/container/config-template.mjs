const configTemplateProperties = new WeakMap();
export class ConfigTemplate {
   constructor({ name }) {
      configTemplateProperties.delete(this);
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
      const template = templates.find(x => x.name === name);
      this.id = name;
      configTemplateProperties.set(this, template);
   }
   exists() {
     return configTemplateProperties.get(this) !== undefined;
   }
   match({ object, template }) {
      if (!object) {
         throw new Error('invalid match argument: object');
      }
      if (!template) {
         template = JSON.parse(JSON.stringify(configTemplateProperties.get(this)));
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
         for (const key of objectKeys) {
            const value = object[key];
            if (value === undefined) {
               return false;
            }
            let hasMatch = false;
            for (const templateKey of templateKeys) {
               const templateValue = template[templateKey];
               if (templateValue && typeof templateValue === 'object') {
                  const match = this.match({ object: value, template: templateValue });
                  if (match) {
                     hasMatch = true;
                     break;
                  }
               }
            }
            if(!hasMatch) {
               return false;
            }
         }
         return true;
      } else {
         if (objectKeys.find(x => templateKeys.find(y => x === y))) {
            for (const key of templateKeys) {
               const value = object[key];
               if (value === undefined) {
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
