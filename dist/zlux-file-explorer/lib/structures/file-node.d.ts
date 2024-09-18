import { TreeNode } from "primeng/api";
/**
 * Types currently supported with a workspace
 */
export type FileNodesSupported = FileNodeAgent | FileNodeAgentTopLevel;
export interface FileNode extends TreeNode {
    navigatorId?: string;
    nodeData?: FileNodesSupported;
    nodeType?: string;
    dynamic?: boolean;
    ORIGINNODE?: string;
    THRUNODE?: string;
}
export interface FileNodeAgent extends FileNode {
    affinity?: string;
    application?: string;
    defaultws?: boolean;
    objtype?: string;
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
    parent: FileNodeAgent;
}
