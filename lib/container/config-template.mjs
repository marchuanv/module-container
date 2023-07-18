const configTemplateProperties = new WeakMap();
export class ConfigTemplate {
   constructor({ name }) {
      configTemplateProperties.delete(this);
      const templates = {
         type: {
            type: null,
            args: null
         },
         func: {
            args: null,
            callback: {
               func: null
            }
         },
         valueType: {
            name: null,
            value: null
         },
         mock: {
            type: null,
            typeFake: null,
            args: null
         },
         behaviour: {
            errors: {
               func: null,
               return: null
            }
         }
      };
      const template = Object.keys(templates)
         .filter(key => key === name)
         .map(key => templates[key])[0];
      if (!template) {
         throw new Error('could not locate template');
      }
      this.id = name;
      configTemplateProperties.set(this, template);
   }
   match({ object, template }) {
      if (!object) {
         throw new Error('invalid match argument: object');
      }
      if (!template) {
         template = JSON.parse(JSON.stringify(configTemplateProperties.get(this)));
      }
      const templateKeys = Object.keys(template);
      const objectKeys = Object.keys(object);
      if (templateKeys.length !== objectKeys.length) {
         return false;
      }
      for (const key of templateKeys) {
         const value = object[key];
         if (value === undefined || value === null) {
            return false;
         }
         if (template[key] && typeof template[key] === 'object') {
            const match = this.match({ object: object[key], template: template[key] });
            if (!match) {
               return false;
            }
         }
      }
      return true;
   }
}
