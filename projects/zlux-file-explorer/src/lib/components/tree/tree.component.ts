
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

declare var require: any;
import { Component, Input, Output, EventEmitter, ViewEncapsulation, ElementRef, ViewChild, AfterContentInit, OnDestroy } from '@angular/core';
import { TreeNode } from 'primeng/api';
import { FileTreeNode } from '../../structures/child-event';
import { FileNode } from '../../structures/file-node';
/**
 * [The tree component serves collapse/expansion of file/datasets]
 * @param  selector     [tree-root]
 * @param  templateUrl   [./tree.component.html]
 * @param  styleUrls     [./tree.component.css]
 * @param  providers     [None]
 * @return               [description]
 */
@Component({
  selector: 'tree-root',
  templateUrl: './tree.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: [
    './tree.component.css',
    "../../../../../../node_modules/primeng/resources/primeng.min.css",
  ],
  providers: []
})
/**
 * [Input treeData supplies the tree structure]
 * [Input treeId supplies which tree is currently clicked]
  [Output  clickEvent supplies the folder click events]
 *
 * @return [description]
 */
export class TreeComponent implements AfterContentInit, OnDestroy {
  @Input() treeData: FileTreeNode[];
  @Input() treeId: TreeNode;
  @Input() style: any;
  @Input() treeStyle: any;
  @Output() clickEvent = new EventEmitter<FileTreeNode>();
  @Output() dblClickEvent = new EventEmitter<MouseEvent>();
  @Output() rightClickEvent = new EventEmitter<MouseEvent>();
  @Output() panelRightClickEvent = new EventEmitter<MouseEvent>();
  selectedNode: FileNode;
  lastClickedNodeName: string; // PrimeNG as of 6.0 has no native double click support for its tree
  lastClickedNodeTimeout: number = 500; // < 500 ms becomes a double click
  @ViewChild('fileExplorerPTree', { static: true }) fileExplorerTree: ElementRef;
  constructor() {
    this.lastClickedNodeName = null;
  }

  /**
   * [nodeSelect provides the child folder click event to the parent file/folder tree tab]
   * @param  _event [click event]
   * @return        [void]
   */
  nodeSelect(_event?: any) {
    if (_event) {
      if (this.lastClickedNodeName == null || this.lastClickedNodeName != (_event.node.name || _event.node.data.name)) {
        this.lastClickedNodeName = _event.node.name || _event.node.data.name;
        this.clickEvent.emit(_event);
        setTimeout(() => (this.lastClickedNodeName = null), this.lastClickedNodeTimeout);
      } else {
        this.dblClickEvent.emit(_event);
      }
    }
  }

  nodeRightClickSelect(_event?: any) {
    if (_event) {
      this.rightClickEvent.emit(_event);
      _event.originalEvent.stopPropagation();
    }
  }

  panelRightClickSelect(_event?: any) {
    if (_event) {
      _event.preventDefault();
      this.panelRightClickEvent.emit(_event);
    }
  }

  ngAfterContentInit() { // PrimeNG as of 6.0 has no native right click support for its tree
    this.fileExplorerTree.nativeElement.addEventListener('contextmenu', this.panelRightClickSelect.bind(this));
  }

  unselectNode() {
    this.selectedNode = null;
  }

  ngOnDestroy() { // PrimeNG as of 6.0 has no native right click support for its tree
    this.fileExplorerTree.nativeElement.removeEventListener('contextmenu', this.panelRightClickSelect.bind(this));
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/