import { Component, Input, Output, EventEmitter, ViewEncapsulation, ViewChild } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common";
import * as i2 from "primeng/tree";
import * as i3 from "primeng/contextmenu";
/**
 * [The tree component serves collapse/expansion of file/datasets]
 * @param  selector     [tree-root]
 * @param  templateUrl   [./tree.component.html]
 * @param  styleUrls     [./tree.component.css]
 * @param  providers     [None]
 * @return               [description]
 */
/**
 * [Input treeData supplies the tree structure]
 * [Input treeId supplies which tree is currently clicked]
  [Output  clickEvent supplies the folder click events]
 *
 * @return [description]
 */
export class TreeComponent {
    constructor() {
        this.clickEvent = new EventEmitter();
        this.dblClickEvent = new EventEmitter();
        this.rightClickEvent = new EventEmitter();
        this.panelRightClickEvent = new EventEmitter();
        this.lastClickedNodeTimeout = 500; // < 500 ms becomes a double click
        this.lastClickedNodeName = null;
    }
    /**
     * [nodeSelect provides the child folder click event to the parent file/folder tree tab]
     * @param  _event [click event]
     * @return        [void]
     */
    nodeSelect(_event) {
        if (_event) {
            if (this.lastClickedNodeName == null || this.lastClickedNodeName != (_event.node.name || _event.node.data.name)) {
                this.lastClickedNodeName = _event.node.name || _event.node.data.name;
                this.clickEvent.emit(_event);
                setTimeout(() => (this.lastClickedNodeName = null), this.lastClickedNodeTimeout);
            }
            else {
                this.dblClickEvent.emit(_event);
            }
        }
    }
    nodeRightClickSelect(_event) {
        if (_event) {
            this.rightClickEvent.emit(_event);
            _event.originalEvent.stopPropagation();
        }
    }
    panelRightClickSelect(_event) {
        if (_event) {
            _event.preventDefault();
            this.panelRightClickEvent.emit(_event);
        }
    }
    ngAfterContentInit() {
        this.fileExplorerTree.nativeElement.addEventListener('contextmenu', this.panelRightClickSelect.bind(this));
    }
    unselectNode() {
        this.selectedNode = null;
    }
    ngOnDestroy() {
        this.fileExplorerTree.nativeElement.removeEventListener('contextmenu', this.panelRightClickSelect.bind(this));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: TreeComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.0.7", type: TreeComponent, selector: "tree-root", inputs: { treeData: "treeData", treeId: "treeId", style: "style", treeStyle: "treeStyle" }, outputs: { clickEvent: "clickEvent", dblClickEvent: "dblClickEvent", rightClickEvent: "rightClickEvent", panelRightClickEvent: "panelRightClickEvent" }, providers: [], viewQueries: [{ propertyName: "fileExplorerTree", first: true, predicate: ["fileExplorerPTree"], descendants: true, static: true }], ngImport: i0, template: "\r\n<!-- \r\n  This program and the accompanying materials are\r\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\r\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n  \r\n  SPDX-License-Identifier: EPL-2.0\r\n  \r\n  Copyright Contributors to the Zowe Project.\r\n-->\r\n\r\n<div class=\"fileexplorer-tree-panel\" #fileExplorerPTree [ngStyle]=\"treeStyle\">\r\n  <!-- {{treeData | json}} -->\r\n  <!-- <p-tree\r\n    styleClass=\"rs-com-css-file-navigator\"\r\n    [value]=\"treeData\"\r\n    <!- - selectionMode=\"single\"\r\n    [(selection)]=\"selectedNode\"\r\n    (onNodeSelect)=\"nodeSelect($event)\"\r\n    (onNodeExpand)=\"nodeExpand($event)\" - ->\r\n  >\r\n  </p-tree> -->\r\n  <p-tree\r\n    class=\"fileexplorer-p-tree\"\r\n    [value]=\"treeData\" \r\n    [id]=\"treeId\"\r\n    selectionMode=\"single\"\r\n    [(selection)]=\"selectedNode\"\r\n    (onNodeSelect)=\"nodeSelect($event)\"\r\n    (onNodeContextMenuSelect)=\"nodeRightClickSelect($event)\"\r\n    [ngStyle]=\"treeStyle\"\r\n    [contextMenu]=\"dummy\"\r\n    emptyMessage=\"\"\r\n  >\r\n  <!-- add [filter]=\"true\" with latest prime version (new feature March 2019) -->\r\n  </p-tree>\r\n  <!-- To properly use Prime's right click, we need a dummy context menu -->\r\n  <p-contextMenu #dummy></p-contextMenu>\r\n\r\n  <!-- <p-treeTable [value]=\"fileFolders\">\r\n      <p-column field=\"name\" header=\"Name\"></p-column>\r\n      <p-column field=\"type\" header=\"Type\"></p-column>\r\n  </p-treeTable> -->\r\n  <!-- <h1>{{treeData}}</h1> -->\r\n</div>\r\n\r\n<!-- \r\n  This program and the accompanying materials are\r\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\r\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n  \r\n  SPDX-License-Identifier: EPL-2.0\r\n  \r\n  Copyright Contributors to the Zowe Project.\r\n-->", styles: [".fileexplorer-tree-panel{flex:1 1 0px!important;background:transparent!important;height:100%!important;width:100%!important;margin-right:10px!important;color:inherit!important}.ui-tree{width:100%!important;height:100%!important;min-width:300px!important;background:transparent!important;border:0px!important;border:none!important}.ui-tree .ui-tree-container{padding:15px 15px 9px!important;font-size:medium!important;color:inherit!important;overflow:auto!important;background-color:inherit!important;height:100%!important}.ui-tree .ui-widget .ui-widget-content{background:transparent!important;border:0px!important;background-color:inherit!important}.ui-treenode-label.ui-state-highlight{background-color:#e0e0e0;border-radius:4px!important;padding-left:5px!important;padding-right:5px!important}.ui-tree .ui-treenode-label.ui-state-highlight{color:#000}.ui-treenode{width:fit-content!important;padding:1px!important;cursor:pointer!important}.ui-treenode-content{display:table}.ui-treenode-label{padding-left:3px;display:table-cell}.ui-treenode-icon{padding-right:3px;display:table-cell}.ui-tree-empty-message{color:#fff!important}.ui-tree .ui-treenode-children{margin:0!important;padding:0 0 0 1em!important}::-webkit-scrollbar-corner{background:#0000}*{list-style-type:none}\n"], dependencies: [{ kind: "directive", type: i1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "component", type: i2.Tree, selector: "p-tree", inputs: ["value", "selectionMode", "loadingMode", "selection", "style", "styleClass", "contextMenu", "layout", "draggableScope", "droppableScope", "draggableNodes", "droppableNodes", "metaKeySelection", "propagateSelectionUp", "propagateSelectionDown", "loading", "loadingIcon", "emptyMessage", "ariaLabel", "togglerAriaLabel", "ariaLabelledBy", "validateDrop", "filter", "filterBy", "filterMode", "filterPlaceholder", "filteredNodes", "filterLocale", "scrollHeight", "lazy", "virtualScroll", "virtualScrollItemSize", "virtualScrollOptions", "indentation", "_templateMap", "trackBy", "virtualNodeHeight"], outputs: ["selectionChange", "onNodeSelect", "onNodeUnselect", "onNodeExpand", "onNodeCollapse", "onNodeContextMenuSelect", "onNodeDrop", "onLazyLoad", "onScroll", "onScrollIndexChange", "onFilter"] }, { kind: "component", type: i3.ContextMenu, selector: "p-contextMenu", inputs: ["model", "triggerEvent", "target", "global", "style", "styleClass", "appendTo", "autoZIndex", "baseZIndex", "id", "ariaLabel", "ariaLabelledBy", "pressDelay"], outputs: ["onShow", "onHide"] }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: TreeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'tree-root', encapsulation: ViewEncapsulation.None, providers: [], template: "\r\n<!-- \r\n  This program and the accompanying materials are\r\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\r\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n  \r\n  SPDX-License-Identifier: EPL-2.0\r\n  \r\n  Copyright Contributors to the Zowe Project.\r\n-->\r\n\r\n<div class=\"fileexplorer-tree-panel\" #fileExplorerPTree [ngStyle]=\"treeStyle\">\r\n  <!-- {{treeData | json}} -->\r\n  <!-- <p-tree\r\n    styleClass=\"rs-com-css-file-navigator\"\r\n    [value]=\"treeData\"\r\n    <!- - selectionMode=\"single\"\r\n    [(selection)]=\"selectedNode\"\r\n    (onNodeSelect)=\"nodeSelect($event)\"\r\n    (onNodeExpand)=\"nodeExpand($event)\" - ->\r\n  >\r\n  </p-tree> -->\r\n  <p-tree\r\n    class=\"fileexplorer-p-tree\"\r\n    [value]=\"treeData\" \r\n    [id]=\"treeId\"\r\n    selectionMode=\"single\"\r\n    [(selection)]=\"selectedNode\"\r\n    (onNodeSelect)=\"nodeSelect($event)\"\r\n    (onNodeContextMenuSelect)=\"nodeRightClickSelect($event)\"\r\n    [ngStyle]=\"treeStyle\"\r\n    [contextMenu]=\"dummy\"\r\n    emptyMessage=\"\"\r\n  >\r\n  <!-- add [filter]=\"true\" with latest prime version (new feature March 2019) -->\r\n  </p-tree>\r\n  <!-- To properly use Prime's right click, we need a dummy context menu -->\r\n  <p-contextMenu #dummy></p-contextMenu>\r\n\r\n  <!-- <p-treeTable [value]=\"fileFolders\">\r\n      <p-column field=\"name\" header=\"Name\"></p-column>\r\n      <p-column field=\"type\" header=\"Type\"></p-column>\r\n  </p-treeTable> -->\r\n  <!-- <h1>{{treeData}}</h1> -->\r\n</div>\r\n\r\n<!-- \r\n  This program and the accompanying materials are\r\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\r\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n  \r\n  SPDX-License-Identifier: EPL-2.0\r\n  \r\n  Copyright Contributors to the Zowe Project.\r\n-->", styles: [".fileexplorer-tree-panel{flex:1 1 0px!important;background:transparent!important;height:100%!important;width:100%!important;margin-right:10px!important;color:inherit!important}.ui-tree{width:100%!important;height:100%!important;min-width:300px!important;background:transparent!important;border:0px!important;border:none!important}.ui-tree .ui-tree-container{padding:15px 15px 9px!important;font-size:medium!important;color:inherit!important;overflow:auto!important;background-color:inherit!important;height:100%!important}.ui-tree .ui-widget .ui-widget-content{background:transparent!important;border:0px!important;background-color:inherit!important}.ui-treenode-label.ui-state-highlight{background-color:#e0e0e0;border-radius:4px!important;padding-left:5px!important;padding-right:5px!important}.ui-tree .ui-treenode-label.ui-state-highlight{color:#000}.ui-treenode{width:fit-content!important;padding:1px!important;cursor:pointer!important}.ui-treenode-content{display:table}.ui-treenode-label{padding-left:3px;display:table-cell}.ui-treenode-icon{padding-right:3px;display:table-cell}.ui-tree-empty-message{color:#fff!important}.ui-tree .ui-treenode-children{margin:0!important;padding:0 0 0 1em!important}::-webkit-scrollbar-corner{background:#0000}*{list-style-type:none}\n"] }]
        }], ctorParameters: () => [], propDecorators: { treeData: [{
                type: Input
            }], treeId: [{
                type: Input
            }], style: [{
                type: Input
            }], treeStyle: [{
                type: Input
            }], clickEvent: [{
                type: Output
            }], dblClickEvent: [{
                type: Output
            }], rightClickEvent: [{
                type: Output
            }], panelRightClickEvent: [{
                type: Output
            }], fileExplorerTree: [{
                type: ViewChild,
                args: ['fileExplorerPTree', { static: true }]
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96bHV4LWZpbGUtZXhwbG9yZXIvc3JjL2xpYi9jb21wb25lbnRzL3RyZWUvdHJlZS5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96bHV4LWZpbGUtZXhwbG9yZXIvc3JjL2xpYi9jb21wb25lbnRzL3RyZWUvdHJlZS5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFZQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFjLFNBQVMsRUFBK0IsTUFBTSxlQUFlLENBQUM7Ozs7O0FBSTlJOzs7Ozs7O0dBT0c7QUFRSDs7Ozs7O0dBTUc7QUFDSCxNQUFNLE9BQU8sYUFBYTtJQWF4QjtRQVJVLGVBQVUsR0FBRyxJQUFJLFlBQVksRUFBZ0IsQ0FBQztRQUM5QyxrQkFBYSxHQUFHLElBQUksWUFBWSxFQUFjLENBQUM7UUFDL0Msb0JBQWUsR0FBRyxJQUFJLFlBQVksRUFBYyxDQUFDO1FBQ2pELHlCQUFvQixHQUFHLElBQUksWUFBWSxFQUFjLENBQUM7UUFHaEUsMkJBQXNCLEdBQVcsR0FBRyxDQUFDLENBQUMsa0NBQWtDO1FBR3RFLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUM7SUFDbEMsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxVQUFVLENBQUMsTUFBWTtRQUNyQixJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ1gsSUFBSSxJQUFJLENBQUMsbUJBQW1CLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxtQkFBbUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7Z0JBQ2hILElBQUksQ0FBQyxtQkFBbUIsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ3JFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUM3QixVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFDbkYsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xDLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELG9CQUFvQixDQUFDLE1BQVk7UUFDL0IsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNYLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xDLE1BQU0sQ0FBQyxhQUFhLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDekMsQ0FBQztJQUNILENBQUM7SUFFRCxxQkFBcUIsQ0FBQyxNQUFZO1FBQ2hDLElBQUksTUFBTSxFQUFFLENBQUM7WUFDWCxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDeEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN6QyxDQUFDO0lBQ0gsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDN0csQ0FBQztJQUVELFlBQVk7UUFDVixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztJQUMzQixDQUFDO0lBRUQsV0FBVztRQUNULElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUNoSCxDQUFDOzhHQTFEVSxhQUFhO2tHQUFiLGFBQWEseVJBVGIsRUFBRSwrSkM3QmYsczZEQXNERzs7MkZEaEJVLGFBQWE7a0JBZHpCLFNBQVM7K0JBQ0UsV0FBVyxpQkFFTixpQkFBaUIsQ0FBQyxJQUFJLGFBRTFCLEVBQUU7d0RBVUosUUFBUTtzQkFBaEIsS0FBSztnQkFDRyxNQUFNO3NCQUFkLEtBQUs7Z0JBQ0csS0FBSztzQkFBYixLQUFLO2dCQUNHLFNBQVM7c0JBQWpCLEtBQUs7Z0JBQ0ksVUFBVTtzQkFBbkIsTUFBTTtnQkFDRyxhQUFhO3NCQUF0QixNQUFNO2dCQUNHLGVBQWU7c0JBQXhCLE1BQU07Z0JBQ0csb0JBQW9CO3NCQUE3QixNQUFNO2dCQUkyQyxnQkFBZ0I7c0JBQWpFLFNBQVM7dUJBQUMsbUJBQW1CLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbi8qXHJcbiAgVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcclxuICBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEVjbGlwc2UgUHVibGljIExpY2Vuc2UgdjIuMCB3aGljaCBhY2NvbXBhbmllc1xyXG4gIHRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MjAuaHRtbFxyXG4gIFxyXG4gIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBFUEwtMi4wXHJcbiAgXHJcbiAgQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxyXG4qL1xyXG5cclxuZGVjbGFyZSB2YXIgcmVxdWlyZTogYW55O1xyXG5pbXBvcnQgeyBDb21wb25lbnQsIElucHV0LCBPdXRwdXQsIEV2ZW50RW1pdHRlciwgVmlld0VuY2Fwc3VsYXRpb24sIEVsZW1lbnRSZWYsIFZpZXdDaGlsZCwgQWZ0ZXJDb250ZW50SW5pdCwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IFRyZWVOb2RlIH0gZnJvbSAncHJpbWVuZy9hcGknO1xyXG5pbXBvcnQgeyBGaWxlVHJlZU5vZGUgfSBmcm9tICcuLi8uLi9zdHJ1Y3R1cmVzL2NoaWxkLWV2ZW50JztcclxuaW1wb3J0IHsgRmlsZU5vZGUgfSBmcm9tICcuLi8uLi9zdHJ1Y3R1cmVzL2ZpbGUtbm9kZSc7XHJcbi8qKlxyXG4gKiBbVGhlIHRyZWUgY29tcG9uZW50IHNlcnZlcyBjb2xsYXBzZS9leHBhbnNpb24gb2YgZmlsZS9kYXRhc2V0c11cclxuICogQHBhcmFtICBzZWxlY3RvciAgICAgW3RyZWUtcm9vdF1cclxuICogQHBhcmFtICB0ZW1wbGF0ZVVybCAgIFsuL3RyZWUuY29tcG9uZW50Lmh0bWxdXHJcbiAqIEBwYXJhbSAgc3R5bGVVcmxzICAgICBbLi90cmVlLmNvbXBvbmVudC5jc3NdXHJcbiAqIEBwYXJhbSAgcHJvdmlkZXJzICAgICBbTm9uZV1cclxuICogQHJldHVybiAgICAgICAgICAgICAgIFtkZXNjcmlwdGlvbl1cclxuICovXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAndHJlZS1yb290JyxcclxuICB0ZW1wbGF0ZVVybDogJy4vdHJlZS5jb21wb25lbnQuaHRtbCcsXHJcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcclxuICBzdHlsZVVybHM6IFsnLi90cmVlLmNvbXBvbmVudC5jc3MnXSxcclxuICBwcm92aWRlcnM6IFtdXHJcbn0pXHJcbi8qKlxyXG4gKiBbSW5wdXQgdHJlZURhdGEgc3VwcGxpZXMgdGhlIHRyZWUgc3RydWN0dXJlXVxyXG4gKiBbSW5wdXQgdHJlZUlkIHN1cHBsaWVzIHdoaWNoIHRyZWUgaXMgY3VycmVudGx5IGNsaWNrZWRdXHJcbiAgW091dHB1dCAgY2xpY2tFdmVudCBzdXBwbGllcyB0aGUgZm9sZGVyIGNsaWNrIGV2ZW50c11cclxuICpcclxuICogQHJldHVybiBbZGVzY3JpcHRpb25dXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVHJlZUNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSB7XHJcbiAgQElucHV0KCkgdHJlZURhdGE6IEZpbGVUcmVlTm9kZVtdO1xyXG4gIEBJbnB1dCgpIHRyZWVJZDogVHJlZU5vZGU7XHJcbiAgQElucHV0KCkgc3R5bGU6IGFueTtcclxuICBASW5wdXQoKSB0cmVlU3R5bGU6IGFueTtcclxuICBAT3V0cHV0KCkgY2xpY2tFdmVudCA9IG5ldyBFdmVudEVtaXR0ZXI8RmlsZVRyZWVOb2RlPigpO1xyXG4gIEBPdXRwdXQoKSBkYmxDbGlja0V2ZW50ID0gbmV3IEV2ZW50RW1pdHRlcjxNb3VzZUV2ZW50PigpO1xyXG4gIEBPdXRwdXQoKSByaWdodENsaWNrRXZlbnQgPSBuZXcgRXZlbnRFbWl0dGVyPE1vdXNlRXZlbnQ+KCk7XHJcbiAgQE91dHB1dCgpIHBhbmVsUmlnaHRDbGlja0V2ZW50ID0gbmV3IEV2ZW50RW1pdHRlcjxNb3VzZUV2ZW50PigpO1xyXG4gIHNlbGVjdGVkTm9kZTogRmlsZU5vZGU7XHJcbiAgbGFzdENsaWNrZWROb2RlTmFtZTogc3RyaW5nOyAvLyBQcmltZU5HIGFzIG9mIDYuMCBoYXMgbm8gbmF0aXZlIGRvdWJsZSBjbGljayBzdXBwb3J0IGZvciBpdHMgdHJlZVxyXG4gIGxhc3RDbGlja2VkTm9kZVRpbWVvdXQ6IG51bWJlciA9IDUwMDsgLy8gPCA1MDAgbXMgYmVjb21lcyBhIGRvdWJsZSBjbGlja1xyXG4gIEBWaWV3Q2hpbGQoJ2ZpbGVFeHBsb3JlclBUcmVlJywgeyBzdGF0aWM6IHRydWUgfSkgZmlsZUV4cGxvcmVyVHJlZTogRWxlbWVudFJlZjtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMubGFzdENsaWNrZWROb2RlTmFtZSA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBbbm9kZVNlbGVjdCBwcm92aWRlcyB0aGUgY2hpbGQgZm9sZGVyIGNsaWNrIGV2ZW50IHRvIHRoZSBwYXJlbnQgZmlsZS9mb2xkZXIgdHJlZSB0YWJdXHJcbiAgICogQHBhcmFtICBfZXZlbnQgW2NsaWNrIGV2ZW50XVxyXG4gICAqIEByZXR1cm4gICAgICAgIFt2b2lkXVxyXG4gICAqL1xyXG4gIG5vZGVTZWxlY3QoX2V2ZW50PzogYW55KSB7XHJcbiAgICBpZiAoX2V2ZW50KSB7XHJcbiAgICAgIGlmICh0aGlzLmxhc3RDbGlja2VkTm9kZU5hbWUgPT0gbnVsbCB8fCB0aGlzLmxhc3RDbGlja2VkTm9kZU5hbWUgIT0gKF9ldmVudC5ub2RlLm5hbWUgfHwgX2V2ZW50Lm5vZGUuZGF0YS5uYW1lKSkge1xyXG4gICAgICAgIHRoaXMubGFzdENsaWNrZWROb2RlTmFtZSA9IF9ldmVudC5ub2RlLm5hbWUgfHwgX2V2ZW50Lm5vZGUuZGF0YS5uYW1lO1xyXG4gICAgICAgIHRoaXMuY2xpY2tFdmVudC5lbWl0KF9ldmVudCk7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiAodGhpcy5sYXN0Q2xpY2tlZE5vZGVOYW1lID0gbnVsbCksIHRoaXMubGFzdENsaWNrZWROb2RlVGltZW91dCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5kYmxDbGlja0V2ZW50LmVtaXQoX2V2ZW50KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgbm9kZVJpZ2h0Q2xpY2tTZWxlY3QoX2V2ZW50PzogYW55KSB7XHJcbiAgICBpZiAoX2V2ZW50KSB7XHJcbiAgICAgIHRoaXMucmlnaHRDbGlja0V2ZW50LmVtaXQoX2V2ZW50KTtcclxuICAgICAgX2V2ZW50Lm9yaWdpbmFsRXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBwYW5lbFJpZ2h0Q2xpY2tTZWxlY3QoX2V2ZW50PzogYW55KSB7XHJcbiAgICBpZiAoX2V2ZW50KSB7XHJcbiAgICAgIF9ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICB0aGlzLnBhbmVsUmlnaHRDbGlja0V2ZW50LmVtaXQoX2V2ZW50KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHsgLy8gUHJpbWVORyBhcyBvZiA2LjAgaGFzIG5vIG5hdGl2ZSByaWdodCBjbGljayBzdXBwb3J0IGZvciBpdHMgdHJlZVxyXG4gICAgdGhpcy5maWxlRXhwbG9yZXJUcmVlLm5hdGl2ZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCB0aGlzLnBhbmVsUmlnaHRDbGlja1NlbGVjdC5iaW5kKHRoaXMpKTtcclxuICB9XHJcblxyXG4gIHVuc2VsZWN0Tm9kZSgpIHtcclxuICAgIHRoaXMuc2VsZWN0ZWROb2RlID0gbnVsbDtcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkgeyAvLyBQcmltZU5HIGFzIG9mIDYuMCBoYXMgbm8gbmF0aXZlIHJpZ2h0IGNsaWNrIHN1cHBvcnQgZm9yIGl0cyB0cmVlXHJcbiAgICB0aGlzLmZpbGVFeHBsb3JlclRyZWUubmF0aXZlRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIHRoaXMucGFuZWxSaWdodENsaWNrU2VsZWN0LmJpbmQodGhpcykpO1xyXG4gIH1cclxufVxyXG5cclxuLypcclxuICBUaGlzIHByb2dyYW0gYW5kIHRoZSBhY2NvbXBhbnlpbmcgbWF0ZXJpYWxzIGFyZVxyXG4gIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRWNsaXBzZSBQdWJsaWMgTGljZW5zZSB2Mi4wIHdoaWNoIGFjY29tcGFuaWVzXHJcbiAgdGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXHJcbiAgXHJcbiAgU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcclxuICBcclxuICBDb3B5cmlnaHQgQ29udHJpYnV0b3JzIHRvIHRoZSBab3dlIFByb2plY3QuXHJcbiovIiwiXHJcbjwhLS0gXHJcbiAgVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcclxuICBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEVjbGlwc2UgUHVibGljIExpY2Vuc2UgdjIuMCB3aGljaCBhY2NvbXBhbmllc1xyXG4gIHRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MjAuaHRtbFxyXG4gIFxyXG4gIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBFUEwtMi4wXHJcbiAgXHJcbiAgQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxyXG4tLT5cclxuXHJcbjxkaXYgY2xhc3M9XCJmaWxlZXhwbG9yZXItdHJlZS1wYW5lbFwiICNmaWxlRXhwbG9yZXJQVHJlZSBbbmdTdHlsZV09XCJ0cmVlU3R5bGVcIj5cclxuICA8IS0tIHt7dHJlZURhdGEgfCBqc29ufX0gLS0+XHJcbiAgPCEtLSA8cC10cmVlXHJcbiAgICBzdHlsZUNsYXNzPVwicnMtY29tLWNzcy1maWxlLW5hdmlnYXRvclwiXHJcbiAgICBbdmFsdWVdPVwidHJlZURhdGFcIlxyXG4gICAgPCEtIC0gc2VsZWN0aW9uTW9kZT1cInNpbmdsZVwiXHJcbiAgICBbKHNlbGVjdGlvbildPVwic2VsZWN0ZWROb2RlXCJcclxuICAgIChvbk5vZGVTZWxlY3QpPVwibm9kZVNlbGVjdCgkZXZlbnQpXCJcclxuICAgIChvbk5vZGVFeHBhbmQpPVwibm9kZUV4cGFuZCgkZXZlbnQpXCIgLSAtPlxyXG4gID5cclxuICA8L3AtdHJlZT4gLS0+XHJcbiAgPHAtdHJlZVxyXG4gICAgY2xhc3M9XCJmaWxlZXhwbG9yZXItcC10cmVlXCJcclxuICAgIFt2YWx1ZV09XCJ0cmVlRGF0YVwiIFxyXG4gICAgW2lkXT1cInRyZWVJZFwiXHJcbiAgICBzZWxlY3Rpb25Nb2RlPVwic2luZ2xlXCJcclxuICAgIFsoc2VsZWN0aW9uKV09XCJzZWxlY3RlZE5vZGVcIlxyXG4gICAgKG9uTm9kZVNlbGVjdCk9XCJub2RlU2VsZWN0KCRldmVudClcIlxyXG4gICAgKG9uTm9kZUNvbnRleHRNZW51U2VsZWN0KT1cIm5vZGVSaWdodENsaWNrU2VsZWN0KCRldmVudClcIlxyXG4gICAgW25nU3R5bGVdPVwidHJlZVN0eWxlXCJcclxuICAgIFtjb250ZXh0TWVudV09XCJkdW1teVwiXHJcbiAgICBlbXB0eU1lc3NhZ2U9XCJcIlxyXG4gID5cclxuICA8IS0tIGFkZCBbZmlsdGVyXT1cInRydWVcIiB3aXRoIGxhdGVzdCBwcmltZSB2ZXJzaW9uIChuZXcgZmVhdHVyZSBNYXJjaCAyMDE5KSAtLT5cclxuICA8L3AtdHJlZT5cclxuICA8IS0tIFRvIHByb3Blcmx5IHVzZSBQcmltZSdzIHJpZ2h0IGNsaWNrLCB3ZSBuZWVkIGEgZHVtbXkgY29udGV4dCBtZW51IC0tPlxyXG4gIDxwLWNvbnRleHRNZW51ICNkdW1teT48L3AtY29udGV4dE1lbnU+XHJcblxyXG4gIDwhLS0gPHAtdHJlZVRhYmxlIFt2YWx1ZV09XCJmaWxlRm9sZGVyc1wiPlxyXG4gICAgICA8cC1jb2x1bW4gZmllbGQ9XCJuYW1lXCIgaGVhZGVyPVwiTmFtZVwiPjwvcC1jb2x1bW4+XHJcbiAgICAgIDxwLWNvbHVtbiBmaWVsZD1cInR5cGVcIiBoZWFkZXI9XCJUeXBlXCI+PC9wLWNvbHVtbj5cclxuICA8L3AtdHJlZVRhYmxlPiAtLT5cclxuICA8IS0tIDxoMT57e3RyZWVEYXRhfX08L2gxPiAtLT5cclxuPC9kaXY+XHJcblxyXG48IS0tIFxyXG4gIFRoaXMgcHJvZ3JhbSBhbmQgdGhlIGFjY29tcGFueWluZyBtYXRlcmlhbHMgYXJlXHJcbiAgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcclxuICB0aGlzIGRpc3RyaWJ1dGlvbiwgYW5kIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5lY2xpcHNlLm9yZy9sZWdhbC9lcGwtdjIwLmh0bWxcclxuICBcclxuICBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxyXG4gIFxyXG4gIENvcHlyaWdodCBDb250cmlidXRvcnMgdG8gdGhlIFpvd2UgUHJvamVjdC5cclxuLS0+Il19