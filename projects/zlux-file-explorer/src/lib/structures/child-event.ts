

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import {TreeNode} from 'primeng/api';

export class FileTreeNode implements TreeNode { 
  public label: string;
  public children: FileTreeNode[];
  public parent: FileTreeNode;
  public path: string;
  public size: number;
  public type: string;
  public id: number;
  public expanded: boolean;
  public expandedIcon: any;
  public collapsedIcon: any;
  public data: 'Folder' | 'File';

  toJSON() {
    return {
      label: this.label,
      children: this.children,
      parent: this.parent,
      path: this.path,
      size: this.size,
      type: this.size,
      expanded: this.expanded,
      expandedIcon: this.expandedIcon,
      collapsedIcon: this.collapsedIcon

    }
  }

}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

