import utils from 'utils'
export class ContainerUtils {
   
   getTypeRef({ type }) {
      let name = type.name;
      name = name.charAt(0).toLowerCase() + name.slice(1);
      return `$${name}`;
   }
}