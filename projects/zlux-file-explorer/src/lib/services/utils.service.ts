

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Injectable } from '@angular/core';
import { DatasetAttributes } from '../structures/editor-project';

@Injectable()
export class UtilsService {
  constructor(){}

  filePathCheck(path:string):string{
    if (path.charAt(0) === '/') {
        return path.substring(1);
    }
    return path;
  }
  filePathEndCheck(path:string):string{
    if (path.slice(-1) !== '/') {
        return path + "/";
    }
    return path;
  }

  isDatasetMigrated(attrs: DatasetAttributes): boolean {
    return attrs.volser === 'MIGRAT' || attrs.volser === 'ARCIVE';
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

