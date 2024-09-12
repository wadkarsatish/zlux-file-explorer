
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { TreeNode } from "primeng/api/treenode";

/**
 * Types currently supported with a workspace
 */
export type FileNodesSupported = FileNodeAgent | FileNodeAgentTopLevel;

export interface FileNode extends TreeNode {
  navigatorId?: string; // Needs to be unique if persistence is implemented
  nodeData?: FileNodesSupported;
  nodeType?: string;
  dynamic?: boolean;

  ORIGINNODE?: string; // TODO remove lower-case variant?
  THRUNODE?: string;
}


export interface FileNodeAgent extends FileNode {
  // used in FileNodeAgentTopLevelsService#getPost
  affinity?: string;
  application?: string;
  defaultws?: boolean;
  objtype?: string;
  // derived
  name?: string;
  originNode?: string;
}

export interface FileNodeAgentTopLevel extends FileNode {
  defaultWorkspaceID: string;
  wsGroupID: string;
  id: string;
  appl: string;
  affinities: string;
  prodProv: string;
  name: string;
  text: string;
  lastUser: string;
  modified: string;
  // derived
  parent: FileNodeAgent;
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

