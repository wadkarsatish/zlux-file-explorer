

/*
This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.
*/


export function getExtension(name:string):string{
  if (name.split('.').length > 1) {
    let extension = name.split('.')[name.split('.').length - 1];
    let index = name.lastIndexOf('.');
    return name.slice(index);
  }
  return '';
}

export function getBaseName(name:string):string{
  if (name.split('.').length > 1) {
    let extension = name.split('.')[name.split('.').length - 1];
    let index = name.lastIndexOf('.');
    return name.slice(0,index);
  }
  return name;
}

export function incrementFileName(name: string): string {
    let extSuffix = this.getExtension(name);
    let namePrefix = this.getBaseName(name);

    // name copy 5(.txt) => name copy 6(.txt)
    // name copy(.txt) => name copy 2(.txt)
    const suffixRegex = /^(.+ copy)( \d+)?$/;
    if (suffixRegex.test(namePrefix)) {
      return namePrefix.replace(suffixRegex, (match, g1?, g2?) => {
        let number = (g2 ? parseInt(g2) : 1);
        return number === 0
          ? `${g1}`
          : (number < 888
            ? `${g1} ${number + 1}`
            : `${g1}${g2} copy`);
      }) + extSuffix;
    }

    // name(.txt) => name copy(.txt)
    return `${namePrefix} copy${extSuffix}`;
}




/*
This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.
*/

