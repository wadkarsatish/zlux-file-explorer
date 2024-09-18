import { TreeNode } from 'primeng/api';
export declare class FileTreeNode implements TreeNode {
    label: string;
    children: FileTreeNode[];
    parent: FileTreeNode;
    path: string;
    size: number;
    type: string;
    id: number;
    expanded: boolean;
    expandedIcon: any;
    collapsedIcon: any;
    data: 'Folder' | 'File';
    toJSON(): {
        label: string;
        children: FileTreeNode[];
        parent: FileTreeNode;
        path: string;
        size: number;
        type: number;
        expanded: boolean;
        expandedIcon: any;
        collapsedIcon: any;
    };
}
