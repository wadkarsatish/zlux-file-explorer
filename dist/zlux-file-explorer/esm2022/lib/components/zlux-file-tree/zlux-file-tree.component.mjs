import { Component, Input, Output, ViewChild, ViewEncapsulation, EventEmitter, Inject } from '@angular/core';
//import {ComponentClass} from '../../../../../../zlux-platform/interface/src/registry/classes';
/*import { PersistentDataService } from '../../services/persistentData.service';*/
/*import {FileBrowserFileSelectedEvent,
  IFileBrowser,
  IFileBrowserMultiSelect,
  IFileBrowserFolderSelect,
  IFileBrowserUSS,
  IFileBrowserMVS
} from '../../../../../../zlux-platform/interface/src/registry/component-classes/file-browser';*/
//Commented out to fix compilation errors from zlux-platform changes, does not affect program
//TODO: Implement new capabilities from zlux-platform
import { FileBrowserMVSComponent } from '../filebrowsermvs/filebrowsermvs.component';
import { FileBrowserUSSComponent } from '../filebrowseruss/filebrowseruss.component';
import { Subscription } from 'rxjs';
/* Services */
import { UtilsService } from '../../services/utils.service';
import { KeyCode } from '../../services/keybinding.service';
import { Angular2InjectionTokens } from '../../../pluginlib/inject-resources';
import * as i0 from "@angular/core";
import * as i1 from "../../services/utils.service";
import * as i2 from "../../services/keybinding.service";
import * as i3 from "@angular/common";
import * as i4 from "../filebrowsermvs/filebrowsermvs.component";
import * as i5 from "../filebrowseruss/filebrowseruss.component";
export class ZluxFileTreeComponent {
    constructor(/*private persistentDataService: PersistentDataService,*/ utils, elemRef, cd, appKeyboard, log) {
        this.utils = utils;
        this.elemRef = elemRef;
        this.cd = cd;
        this.appKeyboard = appKeyboard;
        this.log = log;
        this.keyBindingSub = new Subscription();
        this.style = {};
        this.headerStyle = {};
        this.inputStyle = {};
        this.searchStyle = {};
        this.treeStyle = {};
        this.fileOutput = new EventEmitter();
        this.nodeClick = new EventEmitter();
        this.nodeDblClick = new EventEmitter();
        this.newFolderClick = new EventEmitter();
        this.fileUploaded = new EventEmitter();
        // @Output() newFileClick: EventEmitter<any> = new EventEmitter<any>();
        this.copyClick = new EventEmitter();
        this.deleteClick = new EventEmitter();
        this.ussRenameEvent = new EventEmitter();
        this.datasetSelect = new EventEmitter();
        this.ussSelect = new EventEmitter();
        this.pathChanged = new EventEmitter();
        this.dataChanged = new EventEmitter();
        this.rightClick = new EventEmitter();
        this.openInNewTab = new EventEmitter();
        this.createDataset = new EventEmitter();
        //this.componentClass = ComponentClass.FileBrowser;
        this.currentIndex = 0;
        this.tabs = [{ index: 0, name: "USS" }, { index: 1, name: "Datasets" }];
        this.showUpArrow = true;
    }
    set spawnModal(typeAndData) {
        if (typeAndData == undefined) {
            return;
        }
        let type = typeAndData.type;
        let data = typeAndData.data;
        let isDataset = (data.data && data.data.datasetAttrs) ? true : false;
        switch (type) {
            case 'properties':
                isDataset ? this.mvsComponent.showPropertiesDialog(data) : this.ussComponent.showPropertiesDialog(data);
                break;
            case 'delete':
                isDataset ? this.mvsComponent.showDeleteDialog(data) : this.ussComponent.showDeleteDialog(data);
                break;
            case 'createFolder':
                !isDataset && this.ussComponent.showCreateFolderDialog(data);
                break;
            case 'requestUpload':
                !isDataset && this.ussComponent.showUploadDialog(data);
                break;
            case 'createDataset':
                this.mvsComponent.createDatasetDialog(data);
                break;
            case 'changeOwners':
                this.ussComponent.showOwnerDialog(data);
                break;
            case 'tagFile':
                this.ussComponent.showTaggingDialog(data);
                break;
            case 'changePermissions':
                this.ussComponent.showPermissionsDialog(data);
                break;
            case 'createFile':
                this.ussComponent.showCreateFileDialog(data);
                break;
            default:
                //invalid type
                this.log.warn(`Unsuccessful in spawning modal for type: `, type);
                break;
        }
    }
    set toggleSearchInput(value) {
        if (value) {
            if (value.path.startsWith("/")) {
                if (this.ussComponent) {
                    this.ussComponent.toggleSearch();
                }
            }
            else {
                if (this.mvsComponent) {
                    this.mvsComponent.toggleSearch();
                }
            }
        }
    }
    ngOnInit() {
        // var obj = {
        //   "ussInput": "",
        //   "mvsInput": "",
        //   "ussData": [],
        //   "mvsData": []
        // }
        // this.persistentDataService.setData(obj)
        //   .subscribe((res: any) => { });
        switch (this.theme) {
            case 'carbon': {
                this.headerStyle = {
                    'background-color': '#3d70b2',
                    'color': 'white',
                    'width': '99.7%',
                    'text-align': 'right'
                };
                this.inputStyle = {
                    'background-color': '#eee',
                    'color': 'black',
                    'border': '2px solid #3d70b2',
                    'margin-top': '20px'
                };
                this.searchStyle = {
                    'min-width': '250px',
                    'display': 'inline-block',
                    'height': '40px',
                    'width': '90%',
                };
                this.treeStyle = {
                    'color': '#646464'
                };
                this.style = {
                    'background-color': '#F4F7FB',
                    'margin-top': '10px',
                    'max-height': '320px',
                    'overflow-y': 'scroll',
                    'padding': '0px',
                    'margin-left': '0px'
                };
                break;
            }
            default: {
                this.treeStyle = { 'filter': 'brightness(3)', 'color': 'white' };
                break;
            }
        }
        const fileExplorerGlobalElement = this.fileExplorerGlobal.nativeElement;
        this.appKeyboard.registerKeyUpEvent(fileExplorerGlobalElement);
        this.appKeyboard.registerKeyDownEvent(fileExplorerGlobalElement);
        this.keyBindingSub.add(this.appKeyboard.keydownEvent
            .subscribe((event) => {
            if (event.which === KeyCode.KEY_P && !event.ctrlKey) {
                this.toggleSearch();
            }
        }));
    }
    ngOnDestroy() {
        // let dataObject = {mvsData:Array<MvsDataObject>(), ussData:Array<UssDataObject>()};
        // this.persistentDataService.getData()
        //   .subscribe(data => {
        //     dataObject = data.contents;
        //     dataObject.mvsData = [];
        //     dataObject.ussData = [];
        //     //console.log(JSON.stringify(dataObject))
        //     this.persistentDataService.setData(dataObject)
        //       .subscribe((res: any) => { });
        //   })
    }
    onCreateDataset($event) {
        // Event to tell if the dataset creation is successful or not
        this.createDataset.emit($event);
    }
    deleteFileOrFolder(pathAndName) {
        this.ussComponent.deleteFileOrFolder(pathAndName);
    }
    createDirectory(pathAndName) {
        if (pathAndName) {
            this.ussComponent.showCreateFolderDialog(pathAndName);
        }
        else {
            this.ussComponent.showCreateFolderDialog(this.ussComponent.getSelectedPath());
        }
    }
    getActiveDirectory() {
        if (this.currentIndex == 0) {
            return this.ussComponent.getSelectedPath();
        }
        else { //Datasets do not yet have an active directory context
            return null;
        }
    }
    hideExplorers() {
        if (this.ussComponent) {
            this.ussComponent.hideExplorer = true;
        }
        if (this.mvsComponent) {
            this.mvsComponent.hideExplorer = true;
        }
    }
    toggleSearch() {
        if (this.currentIndex == 0) {
            this.ussComponent.toggleSearch();
        }
        else {
            this.mvsComponent.toggleSearch();
        }
    }
    displayUpArrow(show) {
        this.showUpArrow = show;
    }
    onCopyClick($event) {
        this.copyClick.emit($event);
    }
    onDeleteClick($event) {
        this.deleteClick.emit($event);
    }
    onUSSRenameEvent($event) {
        this.ussRenameEvent.emit($event);
    }
    // onNewFileClick($event:any){
    //   this.newFileClick.emit($event);
    // }
    onNewFolderClick($event) {
        this.newFolderClick.emit($event);
    }
    onFileUploaded($event) {
        this.fileUploaded.emit($event);
    }
    onNodeClick($event) {
        this.nodeClick.emit($event);
    }
    onNodeDblClick($event) {
        this.nodeDblClick.emit($event);
    }
    onPathChanged($event) {
        this.pathChanged.emit($event);
    }
    onDataChanged($event) {
        this.dataChanged.emit($event);
    }
    onRightClick($event) {
        this.rightClick.emit($event);
    }
    onOpenInNewTab($event) {
        this.openInNewTab.emit($event);
    }
    // onUssFileLoad($event:FileContents){
    //   this.fileOutput.emit($event);
    // }
    provideZLUXDispatcherCallbacks() {
        return {
            onMessage: (eventContext) => {
                return this.zluxOnMessage(eventContext);
            }
        };
    }
    setIndex(inputIndex) {
        this.currentIndex = inputIndex;
        if (this.currentIndex == 0) {
            this.ussSelect.emit();
        }
        else {
            this.datasetSelect.emit();
        }
    }
    showDatasets() {
        this.currentIndex = 1;
        if (this.mvsComponent) {
            this.mvsComponent.hideExplorer = false;
        }
    }
    showUss() {
        this.currentIndex = 0;
        if (this.ussComponent) {
            this.ussComponent.hideExplorer = false;
        }
    }
    spawnUploadModal() {
        if (this.ussComponent) {
            this.ussComponent.showUploadDialog(null);
        }
        else {
            // ... Disabled for DS mode for now
        }
    }
    updateDirectory(dirName) {
        this.showUss();
        this.ussComponent.updateUss(dirName);
    }
    updateDSList(query) {
        this.showDatasets();
        this.mvsComponent.setPath(query);
        this.mvsComponent.updateTreeView(query);
    }
    refreshFileMetadatdaByPath(path) {
        return this.ussComponent.refreshFileMetadatdaUsingPath(path);
    }
    zluxOnMessage(eventContext) {
        return new Promise((resolve, reject) => {
            if (!eventContext || !eventContext.action) {
                return reject('Event context missing or malformed');
            }
            if (eventContext.action === 'save-file') {
                // This is no longer needed as Editor takes over any file edit/context functions.
                // this.parentUssEdit = eventContext;
                // console.log("parentUssEdit:" + this.parentUssEdit)
                //TODO:throw this down to FileBrowserUSSComponent
                resolve();
            }
            // else if (eventContext.action === 'open-file'){
            //   if (!eventContext.filePath || !eventContext.fileName || !eventContext.fileContents) {
            //     return reject('Event context missing or malformed');
            //   }
            //   this.initMonaco(eventContext);
            // }
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: ZluxFileTreeComponent, deps: [{ token: i1.UtilsService }, { token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: i2.KeybindingService }, { token: Angular2InjectionTokens.LOGGER }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: ZluxFileTreeComponent, selector: "zlux-file-tree", inputs: { spawnModal: "spawnModal", toggleSearchInput: "toggleSearchInput", selectPath: "selectPath", style: "style", headerStyle: "headerStyle", inputStyle: "inputStyle", searchStyle: "searchStyle", treeStyle: "treeStyle", theme: "theme" }, outputs: { fileOutput: "fileOutput", nodeClick: "nodeClick", nodeDblClick: "nodeDblClick", newFolderClick: "newFolderClick", fileUploaded: "fileUploaded", copyClick: "copyClick", deleteClick: "deleteClick", ussRenameEvent: "ussRenameEvent", datasetSelect: "datasetSelect", ussSelect: "ussSelect", pathChanged: "pathChanged", dataChanged: "dataChanged", rightClick: "rightClick", openInNewTab: "openInNewTab", createDataset: "createDataset" }, providers: [UtilsService /*, PersistentDataService*/], viewQueries: [{ propertyName: "ussComponent", first: true, predicate: FileBrowserUSSComponent, descendants: true }, { propertyName: "mvsComponent", first: true, predicate: FileBrowserMVSComponent, descendants: true }, { propertyName: "fileExplorerGlobal", first: true, predicate: ["fileExplorerGlobal"], descendants: true, static: true }], ngImport: i0, template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n\n<div class=\"fileexplorer-global\" #fileExplorerGlobal>\n  <nav data-tabs class=\"fileexplorer-tabs\" role=\"navigation\">\n    <div class=\"fileexplorer-tabs-trigger\" tabindex=\"-1\">\n      <a href=\"javascript:void(0)\" class=\"bx--tabs-trigger-text\" tabindex=\"-1\"></a>\n\n    </div>\n    <ul class=\"fileexplorer-tabs-list\" role=\"tablist\" [ngStyle]=\"headerStyle\">\n      @for (tab of tabs; track tab) {\n      <li [ngClass]=\"tab.index == currentIndex ? 'fileexplorer-tab-selected' : 'fileexplorer-tab'\"\n        (click)=\"setIndex(tab.index)\" id=\"tab-{{tab.index}}\" role=\"presentation\" [ngStyle]=\"headerStyle\"\n        class=\"bx--tabs__nav-item\">\n        <a class=\"fileexplorer-tabs-text\" href=\"javascript:void(0)\" role=\"tab\" aria-selected=\"false\"\n          [ngStyle]=\"headerStyle\">{{tab.name}}</a>\n      </li>\n      }\n    </ul>\n  </nav>\n  <div class=\"fileexplorer-browser-module\" [ngStyle]=\"style\">\n    <file-browser-uss #ussComponent [hidden]=\"currentIndex != 0\" (nodeClick)=\"onNodeClick($event)\"\n      (nodeDblClick)=\"onNodeDblClick($event)\" (openInNewTab)=\"onOpenInNewTab($event)\"\n      (newFolderClick)=\"onNewFolderClick($event)\" (fileUploaded)=\"onFileUploaded($event)\"\n      (deleteClick)=\"onDeleteClick($event)\" (ussRenameEvent)=\"onUSSRenameEvent($event)\"\n      (copyClick)=\"onCopyClick($event)\" (rightClick)=\"onRightClick($event)\" (pathChanged)=\"onPathChanged($event)\"\n      (dataChanged)=\"onDataChanged($event)\" [style]=\"style\" [inputStyle]=\"inputStyle\" [treeStyle]=\"treeStyle\"\n      [searchStyle]=\"searchStyle\" [showUpArrow]=\"showUpArrow\"></file-browser-uss>\n    <file-browser-mvs #mvsComponent [hidden]=\"currentIndex != 1\" (nodeClick)=\"onNodeClick($event)\"\n      (nodeDblClick)=\"onNodeDblClick($event)\" (openInNewTab)=\"onOpenInNewTab($event)\"\n      (deleteClick)=\"onDeleteClick($event)\" (rightClick)=\"onRightClick($event)\" (pathChanged)=\"onPathChanged($event)\"\n      (dataChanged)=\"onDataChanged($event)\" (createDataset)=\"onCreateDataset($event)\" [inputStyle]=\"inputStyle\"\n      [treeStyle]=\"treeStyle\" [searchStyle]=\"searchStyle\" [style]=\"style\"\n      [showUpArrow]=\"showUpArrow\"></file-browser-mvs>\n  </div>\n</div>\n\n<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\n<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->", styles: [".fileexplorer-browser-module{margin-left:10px;margin-top:10px;height:100%}.fileexplorer-global{height:100%}.fileexplorer-tabs{height:25px;text-align:center;padding-bottom:30px}.fileexplorer-tab{font-size:15px;color:#007bff;height:35px;width:170px;padding-top:6px;margin-left:-10px}.fileexplorer-tab-selected{font-size:15px;height:35px;width:165px;font-weight:700;padding-top:6px;margin-left:-7px;color:#005abb;background-color:#d4d4d4}.fileexplorer-tabs-list{-webkit-column-count:2;-moz-column-count:2;column-count:2;width:100%;height:35px;background-color:#464646;cursor:pointer}.fileexplorer-tabs-text{color:inherit;text-decoration:none;background-color:transparent}ul{padding-left:0!important}\n"], dependencies: [{ kind: "directive", type: i3.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i3.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "component", type: i4.FileBrowserMVSComponent, selector: "file-browser-mvs", inputs: ["inputStyle", "searchStyle", "treeStyle", "style", "showUpArrow"], outputs: ["pathChanged", "dataChanged", "nodeClick", "nodeDblClick", "rightClick", "deleteClick", "openInNewTab", "createDataset"] }, { kind: "component", type: i5.FileBrowserUSSComponent, selector: "file-browser-uss", inputs: ["inputStyle", "searchStyle", "treeStyle", "showUpArrow"], outputs: ["pathChanged", "dataChanged", "nodeClick", "nodeDblClick", "nodeRightClick", "newFolderClick", "newFileClick", "fileUploaded", "copyClick", "deleteClick", "ussRenameEvent", "rightClick", "openInNewTab"] }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: ZluxFileTreeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'zlux-file-tree', encapsulation: ViewEncapsulation.None, providers: [UtilsService /*, PersistentDataService*/], template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n\n<div class=\"fileexplorer-global\" #fileExplorerGlobal>\n  <nav data-tabs class=\"fileexplorer-tabs\" role=\"navigation\">\n    <div class=\"fileexplorer-tabs-trigger\" tabindex=\"-1\">\n      <a href=\"javascript:void(0)\" class=\"bx--tabs-trigger-text\" tabindex=\"-1\"></a>\n\n    </div>\n    <ul class=\"fileexplorer-tabs-list\" role=\"tablist\" [ngStyle]=\"headerStyle\">\n      @for (tab of tabs; track tab) {\n      <li [ngClass]=\"tab.index == currentIndex ? 'fileexplorer-tab-selected' : 'fileexplorer-tab'\"\n        (click)=\"setIndex(tab.index)\" id=\"tab-{{tab.index}}\" role=\"presentation\" [ngStyle]=\"headerStyle\"\n        class=\"bx--tabs__nav-item\">\n        <a class=\"fileexplorer-tabs-text\" href=\"javascript:void(0)\" role=\"tab\" aria-selected=\"false\"\n          [ngStyle]=\"headerStyle\">{{tab.name}}</a>\n      </li>\n      }\n    </ul>\n  </nav>\n  <div class=\"fileexplorer-browser-module\" [ngStyle]=\"style\">\n    <file-browser-uss #ussComponent [hidden]=\"currentIndex != 0\" (nodeClick)=\"onNodeClick($event)\"\n      (nodeDblClick)=\"onNodeDblClick($event)\" (openInNewTab)=\"onOpenInNewTab($event)\"\n      (newFolderClick)=\"onNewFolderClick($event)\" (fileUploaded)=\"onFileUploaded($event)\"\n      (deleteClick)=\"onDeleteClick($event)\" (ussRenameEvent)=\"onUSSRenameEvent($event)\"\n      (copyClick)=\"onCopyClick($event)\" (rightClick)=\"onRightClick($event)\" (pathChanged)=\"onPathChanged($event)\"\n      (dataChanged)=\"onDataChanged($event)\" [style]=\"style\" [inputStyle]=\"inputStyle\" [treeStyle]=\"treeStyle\"\n      [searchStyle]=\"searchStyle\" [showUpArrow]=\"showUpArrow\"></file-browser-uss>\n    <file-browser-mvs #mvsComponent [hidden]=\"currentIndex != 1\" (nodeClick)=\"onNodeClick($event)\"\n      (nodeDblClick)=\"onNodeDblClick($event)\" (openInNewTab)=\"onOpenInNewTab($event)\"\n      (deleteClick)=\"onDeleteClick($event)\" (rightClick)=\"onRightClick($event)\" (pathChanged)=\"onPathChanged($event)\"\n      (dataChanged)=\"onDataChanged($event)\" (createDataset)=\"onCreateDataset($event)\" [inputStyle]=\"inputStyle\"\n      [treeStyle]=\"treeStyle\" [searchStyle]=\"searchStyle\" [style]=\"style\"\n      [showUpArrow]=\"showUpArrow\"></file-browser-mvs>\n  </div>\n</div>\n\n<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\n<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->", styles: [".fileexplorer-browser-module{margin-left:10px;margin-top:10px;height:100%}.fileexplorer-global{height:100%}.fileexplorer-tabs{height:25px;text-align:center;padding-bottom:30px}.fileexplorer-tab{font-size:15px;color:#007bff;height:35px;width:170px;padding-top:6px;margin-left:-10px}.fileexplorer-tab-selected{font-size:15px;height:35px;width:165px;font-weight:700;padding-top:6px;margin-left:-7px;color:#005abb;background-color:#d4d4d4}.fileexplorer-tabs-list{-webkit-column-count:2;-moz-column-count:2;column-count:2;width:100%;height:35px;background-color:#464646;cursor:pointer}.fileexplorer-tabs-text{color:inherit;text-decoration:none;background-color:transparent}ul{padding-left:0!important}\n"] }]
        }], ctorParameters: () => [{ type: i1.UtilsService }, { type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: i2.KeybindingService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.LOGGER]
                }] }], propDecorators: { ussComponent: [{
                type: ViewChild,
                args: [FileBrowserUSSComponent]
            }], mvsComponent: [{
                type: ViewChild,
                args: [FileBrowserMVSComponent]
            }], fileExplorerGlobal: [{
                type: ViewChild,
                args: ['fileExplorerGlobal', { static: true }]
            }], spawnModal: [{
                type: Input
            }], toggleSearchInput: [{
                type: Input
            }], selectPath: [{
                type: Input
            }], style: [{
                type: Input
            }], headerStyle: [{
                type: Input
            }], inputStyle: [{
                type: Input
            }], searchStyle: [{
                type: Input
            }], treeStyle: [{
                type: Input
            }], theme: [{
                type: Input
            }], fileOutput: [{
                type: Output
            }], nodeClick: [{
                type: Output
            }], nodeDblClick: [{
                type: Output
            }], newFolderClick: [{
                type: Output
            }], fileUploaded: [{
                type: Output
            }], copyClick: [{
                type: Output
            }], deleteClick: [{
                type: Output
            }], ussRenameEvent: [{
                type: Output
            }], datasetSelect: [{
                type: Output
            }], ussSelect: [{
                type: Output
            }], pathChanged: [{
                type: Output
            }], dataChanged: [{
                type: Output
            }], rightClick: [{
                type: Output
            }], openInNewTab: [{
                type: Output
            }], createDataset: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemx1eC1maWxlLXRyZWUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemx1eC1maWxlLWV4cGxvcmVyL3NyYy9saWIvY29tcG9uZW50cy96bHV4LWZpbGUtdHJlZS96bHV4LWZpbGUtdHJlZS5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96bHV4LWZpbGUtZXhwbG9yZXIvc3JjL2xpYi9jb21wb25lbnRzL3psdXgtZmlsZS10cmVlL3psdXgtZmlsZS10cmVlLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWNBLE9BQU8sRUFDTCxTQUFTLEVBQ1QsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBRTNDLFlBQVksRUFBcUIsTUFBTSxFQUN4QyxNQUFNLGVBQWUsQ0FBQztBQUd2QixnR0FBZ0c7QUFDaEcsa0ZBQWtGO0FBQ2xGOzs7Ozs7aUdBTWlHO0FBQ2pHLDZGQUE2RjtBQUM3RixxREFBcUQ7QUFDckQsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFDckYsT0FBTyxFQUFFLHVCQUF1QixFQUFFLE1BQU0sNENBQTRDLENBQUM7QUFDckYsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUVwQyxjQUFjO0FBQ2QsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzVELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUU1RCxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQzs7Ozs7OztBQVU5RSxNQUFNLE9BQU8scUJBQXFCO0lBZ0JoQyxZQUFZLHlEQUF5RCxDQUMzRCxLQUFtQixFQUNuQixPQUFtQixFQUNuQixFQUFxQixFQUNyQixXQUE4QixFQUNVLEdBQXlCO1FBSmpFLFVBQUssR0FBTCxLQUFLLENB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QUFBLDJCQUEyQixDQUFDOzswQkF3QmpELE1BQU07MkJBQUMsdUJBQXVCLENBQUMsTUFBTTt5Q0FiaEMsWUFBWTtzQkFEbkIsU0FBUzt1QkFBQyx1QkFBdUI7Z0JBSTFCLFlBQVk7c0JBRG5CLFNBQVM7dUJBQUMsdUJBQXVCO2dCQUlsQyxrQkFBa0I7c0JBRGpCLFNBQVM7dUJBQUMsb0JBQW9CLEVBQUUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO2dCQWVwQyxVQUFVO3NCQUF0QixLQUFLO2dCQTJDTyxpQkFBaUI7c0JBQTdCLEtBQUs7Z0JBY0csVUFBVTtzQkFBbEIsS0FBSztnQkFDRyxLQUFLO3NCQUFiLEtBQUs7Z0JBQ0csV0FBVztzQkFBbkIsS0FBSztnQkFDRyxVQUFVO3NCQUFsQixLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBQ0csU0FBUztzQkFBakIsS0FBSztnQkFDRyxLQUFLO3NCQUFiLEtBQUs7Z0JBRUksVUFBVTtzQkFBbkIsTUFBTTtnQkFDRyxTQUFTO3NCQUFsQixNQUFNO2dCQUNHLFlBQVk7c0JBQXJCLE1BQU07Z0JBQ0csY0FBYztzQkFBdkIsTUFBTTtnQkFDRyxZQUFZO3NCQUFyQixNQUFNO2dCQUVHLFNBQVM7c0JBQWxCLE1BQU07Z0JBQ0csV0FBVztzQkFBcEIsTUFBTTtnQkFDRyxjQUFjO3NCQUF2QixNQUFNO2dCQUNHLGFBQWE7c0JBQXRCLE1BQU07Z0JBQ0csU0FBUztzQkFBbEIsTUFBTTtnQkFDRyxXQUFXO3NCQUFwQixNQUFNO2dCQUNHLFdBQVc7c0JBQXBCLE1BQU07Z0JBQ0csVUFBVTtzQkFBbkIsTUFBTTtnQkFDRyxZQUFZO3NCQUFyQixNQUFNO2dCQUNHLGFBQWE7c0JBQXRCLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJcclxuXHJcbi8qXHJcbiAgVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcclxuICBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEVjbGlwc2UgUHVibGljIExpY2Vuc2UgdjIuMCB3aGljaCBhY2NvbXBhbmllc1xyXG4gIHRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MjAuaHRtbFxyXG4gIFxyXG4gIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBFUEwtMi4wXHJcbiAgXHJcbiAgQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxyXG4qL1xyXG5cclxuZGVjbGFyZSB2YXIgcmVxdWlyZTogYW55O1xyXG5cclxuaW1wb3J0IHtcclxuICBDb21wb25lbnQsXHJcbiAgSW5wdXQsIE91dHB1dCwgVmlld0NoaWxkLCBWaWV3RW5jYXBzdWxhdGlvbixcclxuICBFbGVtZW50UmVmLCBDaGFuZ2VEZXRlY3RvclJlZixcclxuICBFdmVudEVtaXR0ZXIsIE9uSW5pdCwgT25EZXN0cm95LCBJbmplY3RcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuLy8gaW1wb3J0IHtGaWxlQ29udGVudHN9IGZyb20gJy4uLy4uL3N0cnVjdHVyZXMvZmlsZWNvbnRlbnRzJztcclxuaW1wb3J0IHsgdGFiIH0gZnJvbSAnLi4vLi4vc3RydWN0dXJlcy90YWInO1xyXG4vL2ltcG9ydCB7Q29tcG9uZW50Q2xhc3N9IGZyb20gJy4uLy4uLy4uLy4uLy4uLy4uL3psdXgtcGxhdGZvcm0vaW50ZXJmYWNlL3NyYy9yZWdpc3RyeS9jbGFzc2VzJztcclxuLyppbXBvcnQgeyBQZXJzaXN0ZW50RGF0YVNlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9wZXJzaXN0ZW50RGF0YS5zZXJ2aWNlJzsqL1xyXG4vKmltcG9ydCB7RmlsZUJyb3dzZXJGaWxlU2VsZWN0ZWRFdmVudCxcclxuICBJRmlsZUJyb3dzZXIsXHJcbiAgSUZpbGVCcm93c2VyTXVsdGlTZWxlY3QsXHJcbiAgSUZpbGVCcm93c2VyRm9sZGVyU2VsZWN0LFxyXG4gIElGaWxlQnJvd3NlclVTUyxcclxuICBJRmlsZUJyb3dzZXJNVlNcclxufSBmcm9tICcuLi8uLi8uLi8uLi8uLi8uLi96bHV4LXBsYXRmb3JtL2ludGVyZmFjZS9zcmMvcmVnaXN0cnkvY29tcG9uZW50LWNsYXNzZXMvZmlsZS1icm93c2VyJzsqL1xyXG4vL0NvbW1lbnRlZCBvdXQgdG8gZml4IGNvbXBpbGF0aW9uIGVycm9ycyBmcm9tIHpsdXgtcGxhdGZvcm0gY2hhbmdlcywgZG9lcyBub3QgYWZmZWN0IHByb2dyYW1cclxuLy9UT0RPOiBJbXBsZW1lbnQgbmV3IGNhcGFiaWxpdGllcyBmcm9tIHpsdXgtcGxhdGZvcm1cclxuaW1wb3J0IHsgRmlsZUJyb3dzZXJNVlNDb21wb25lbnQgfSBmcm9tICcuLi9maWxlYnJvd3Nlcm12cy9maWxlYnJvd3Nlcm12cy5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBGaWxlQnJvd3NlclVTU0NvbXBvbmVudCB9IGZyb20gJy4uL2ZpbGVicm93c2VydXNzL2ZpbGVicm93c2VydXNzLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xyXG5cclxuLyogU2VydmljZXMgKi9cclxuaW1wb3J0IHsgVXRpbHNTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvdXRpbHMuc2VydmljZSc7XHJcbmltcG9ydCB7IEtleUNvZGUgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9rZXliaW5kaW5nLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBLZXliaW5kaW5nU2VydmljZSB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL2tleWJpbmRpbmcuc2VydmljZSc7XHJcbmltcG9ydCB7IEFuZ3VsYXIySW5qZWN0aW9uVG9rZW5zIH0gZnJvbSAnLi4vLi4vLi4vcGx1Z2lubGliL2luamVjdC1yZXNvdXJjZXMnO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICd6bHV4LWZpbGUtdHJlZScsXHJcbiAgdGVtcGxhdGVVcmw6ICcuL3psdXgtZmlsZS10cmVlLmNvbXBvbmVudC5odG1sJyxcclxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxyXG4gIHN0eWxlVXJsczogWycuL3psdXgtZmlsZS10cmVlLmNvbXBvbmVudC5jc3MnXSxcclxuICBwcm92aWRlcnM6IFtVdGlsc1NlcnZpY2UvKiwgUGVyc2lzdGVudERhdGFTZXJ2aWNlKi9dXHJcbn0pXHJcblxyXG5leHBvcnQgY2xhc3MgWmx1eEZpbGVUcmVlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG4gIC8vY29tcG9uZW50Q2xhc3M6IENvbXBvbmVudENsYXNzO1xyXG4gIHB1YmxpYyBjdXJyZW50SW5kZXg6IG51bWJlcjtcclxuICBwdWJsaWMgdGFiczogQXJyYXk8dGFiPjtcclxuICBwdWJsaWMgc2hvd1VwQXJyb3c6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSBrZXlCaW5kaW5nU3ViOiBTdWJzY3JpcHRpb24gPSBuZXcgU3Vic2NyaXB0aW9uKCk7XHJcblxyXG4gIEBWaWV3Q2hpbGQoRmlsZUJyb3dzZXJVU1NDb21wb25lbnQpXHJcbiAgcHJpdmF0ZSB1c3NDb21wb25lbnQ6IEZpbGVCcm93c2VyVVNTQ29tcG9uZW50O1xyXG5cclxuICBAVmlld0NoaWxkKEZpbGVCcm93c2VyTVZTQ29tcG9uZW50KVxyXG4gIHByaXZhdGUgbXZzQ29tcG9uZW50OiBGaWxlQnJvd3Nlck1WU0NvbXBvbmVudDtcclxuXHJcbiAgQFZpZXdDaGlsZCgnZmlsZUV4cGxvcmVyR2xvYmFsJywgeyBzdGF0aWM6IHRydWUgfSlcclxuICBmaWxlRXhwbG9yZXJHbG9iYWw6IEVsZW1lbnRSZWY8YW55PjtcclxuXHJcbiAgY29uc3RydWN0b3IoLypwcml2YXRlIHBlcnNpc3RlbnREYXRhU2VydmljZTogUGVyc2lzdGVudERhdGFTZXJ2aWNlLCovXHJcbiAgICBwcml2YXRlIHV0aWxzOiBVdGlsc1NlcnZpY2UsXHJcbiAgICBwcml2YXRlIGVsZW1SZWY6IEVsZW1lbnRSZWYsXHJcbiAgICBwcml2YXRlIGNkOiBDaGFuZ2VEZXRlY3RvclJlZixcclxuICAgIHByaXZhdGUgYXBwS2V5Ym9hcmQ6IEtleWJpbmRpbmdTZXJ2aWNlLFxyXG4gICAgQEluamVjdChBbmd1bGFyMkluamVjdGlvblRva2Vucy5MT0dHRVIpIHByaXZhdGUgbG9nOiBaTFVYLkNvbXBvbmVudExvZ2dlciwpIHtcclxuICAgIC8vdGhpcy5jb21wb25lbnRDbGFzcyA9IENvbXBvbmVudENsYXNzLkZpbGVCcm93c2VyO1xyXG4gICAgdGhpcy5jdXJyZW50SW5kZXggPSAwO1xyXG4gICAgdGhpcy50YWJzID0gW3sgaW5kZXg6IDAsIG5hbWU6IFwiVVNTXCIgfSwgeyBpbmRleDogMSwgbmFtZTogXCJEYXRhc2V0c1wiIH1dO1xyXG4gICAgdGhpcy5zaG93VXBBcnJvdyA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBASW5wdXQoKSBzZXQgc3Bhd25Nb2RhbCh0eXBlQW5kRGF0YTogYW55KSB7XHJcbiAgICBpZiAodHlwZUFuZERhdGEgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGxldCB0eXBlID0gdHlwZUFuZERhdGEudHlwZTtcclxuICAgIGxldCBkYXRhID0gdHlwZUFuZERhdGEuZGF0YTtcclxuICAgIGxldCBpc0RhdGFzZXQgPSAoZGF0YS5kYXRhICYmIGRhdGEuZGF0YS5kYXRhc2V0QXR0cnMpID8gdHJ1ZSA6IGZhbHNlO1xyXG5cclxuICAgIHN3aXRjaCAodHlwZSkge1xyXG4gICAgICBjYXNlICdwcm9wZXJ0aWVzJzpcclxuICAgICAgICBpc0RhdGFzZXQgPyB0aGlzLm12c0NvbXBvbmVudC5zaG93UHJvcGVydGllc0RpYWxvZyhkYXRhKSA6IHRoaXMudXNzQ29tcG9uZW50LnNob3dQcm9wZXJ0aWVzRGlhbG9nKGRhdGEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdkZWxldGUnOlxyXG4gICAgICAgIGlzRGF0YXNldCA/IHRoaXMubXZzQ29tcG9uZW50LnNob3dEZWxldGVEaWFsb2coZGF0YSkgOiB0aGlzLnVzc0NvbXBvbmVudC5zaG93RGVsZXRlRGlhbG9nKGRhdGEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdjcmVhdGVGb2xkZXInOlxyXG4gICAgICAgICFpc0RhdGFzZXQgJiYgdGhpcy51c3NDb21wb25lbnQuc2hvd0NyZWF0ZUZvbGRlckRpYWxvZyhkYXRhKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAncmVxdWVzdFVwbG9hZCc6XHJcbiAgICAgICAgIWlzRGF0YXNldCAmJiB0aGlzLnVzc0NvbXBvbmVudC5zaG93VXBsb2FkRGlhbG9nKGRhdGEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdjcmVhdGVEYXRhc2V0JzpcclxuICAgICAgICB0aGlzLm12c0NvbXBvbmVudC5jcmVhdGVEYXRhc2V0RGlhbG9nKGRhdGEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBjYXNlICdjaGFuZ2VPd25lcnMnOlxyXG4gICAgICAgIHRoaXMudXNzQ29tcG9uZW50LnNob3dPd25lckRpYWxvZyhkYXRhKTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgY2FzZSAndGFnRmlsZSc6XHJcbiAgICAgICAgdGhpcy51c3NDb21wb25lbnQuc2hvd1RhZ2dpbmdEaWFsb2coZGF0YSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2NoYW5nZVBlcm1pc3Npb25zJzpcclxuICAgICAgICB0aGlzLnVzc0NvbXBvbmVudC5zaG93UGVybWlzc2lvbnNEaWFsb2coZGF0YSk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIGNhc2UgJ2NyZWF0ZUZpbGUnOlxyXG4gICAgICAgIHRoaXMudXNzQ29tcG9uZW50LnNob3dDcmVhdGVGaWxlRGlhbG9nKGRhdGEpO1xyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIC8vaW52YWxpZCB0eXBlXHJcbiAgICAgICAgdGhpcy5sb2cud2FybihgVW5zdWNjZXNzZnVsIGluIHNwYXduaW5nIG1vZGFsIGZvciB0eXBlOiBgLCB0eXBlKTtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIEBJbnB1dCgpIHNldCB0b2dnbGVTZWFyY2hJbnB1dCh2YWx1ZTogYW55KSB7XHJcbiAgICBpZiAodmFsdWUpIHtcclxuICAgICAgaWYgKHZhbHVlLnBhdGguc3RhcnRzV2l0aChcIi9cIikpIHtcclxuICAgICAgICBpZiAodGhpcy51c3NDb21wb25lbnQpIHtcclxuICAgICAgICAgIHRoaXMudXNzQ29tcG9uZW50LnRvZ2dsZVNlYXJjaCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAodGhpcy5tdnNDb21wb25lbnQpIHtcclxuICAgICAgICAgIHRoaXMubXZzQ29tcG9uZW50LnRvZ2dsZVNlYXJjaCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgQElucHV0KCkgc2VsZWN0UGF0aDogc3RyaW5nO1xyXG4gIEBJbnB1dCgpIHN0eWxlOiBabHV4RmlsZVRyZWVTdHlsZSA9IHt9O1xyXG4gIEBJbnB1dCgpIGhlYWRlclN0eWxlOiBabHV4RmlsZVRyZWVTdHlsZSA9IHt9O1xyXG4gIEBJbnB1dCgpIGlucHV0U3R5bGU6IFpsdXhGaWxlVHJlZVN0eWxlID0ge307XHJcbiAgQElucHV0KCkgc2VhcmNoU3R5bGU6IFpsdXhGaWxlVHJlZVN0eWxlID0ge307XHJcbiAgQElucHV0KCkgdHJlZVN0eWxlOiBabHV4RmlsZVRyZWVTdHlsZSA9IHt9O1xyXG4gIEBJbnB1dCgpIHRoZW1lOiBzdHJpbmc7XHJcblxyXG4gIEBPdXRwdXQoKSBmaWxlT3V0cHV0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSBub2RlQ2xpY2s6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIG5vZGVEYmxDbGljazogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgbmV3Rm9sZGVyQ2xpY2s6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIGZpbGVVcGxvYWRlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICAvLyBAT3V0cHV0KCkgbmV3RmlsZUNsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSBjb3B5Q2xpY2s6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIGRlbGV0ZUNsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSB1c3NSZW5hbWVFdmVudDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgZGF0YXNldFNlbGVjdDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgdXNzU2VsZWN0OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSBwYXRoQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgZGF0YUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIHJpZ2h0Q2xpY2s6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIG9wZW5Jbk5ld1RhYjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgY3JlYXRlRGF0YXNldDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuXHJcbiAgbmdPbkluaXQoKSB7XHJcbiAgICAvLyB2YXIgb2JqID0ge1xyXG4gICAgLy8gICBcInVzc0lucHV0XCI6IFwiXCIsXHJcbiAgICAvLyAgIFwibXZzSW5wdXRcIjogXCJcIixcclxuICAgIC8vICAgXCJ1c3NEYXRhXCI6IFtdLFxyXG4gICAgLy8gICBcIm12c0RhdGFcIjogW11cclxuICAgIC8vIH1cclxuICAgIC8vIHRoaXMucGVyc2lzdGVudERhdGFTZXJ2aWNlLnNldERhdGEob2JqKVxyXG4gICAgLy8gICAuc3Vic2NyaWJlKChyZXM6IGFueSkgPT4geyB9KTtcclxuICAgIHN3aXRjaCAodGhpcy50aGVtZSkge1xyXG4gICAgICBjYXNlICdjYXJib24nOiB7XHJcbiAgICAgICAgdGhpcy5oZWFkZXJTdHlsZSA9IHtcclxuICAgICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJyMzZDcwYjInLFxyXG4gICAgICAgICAgJ2NvbG9yJzogJ3doaXRlJyxcclxuICAgICAgICAgICd3aWR0aCc6ICc5OS43JScsXHJcbiAgICAgICAgICAndGV4dC1hbGlnbic6ICdyaWdodCdcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuaW5wdXRTdHlsZSA9IHtcclxuICAgICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNlZWUnLFxyXG4gICAgICAgICAgJ2NvbG9yJzogJ2JsYWNrJyxcclxuICAgICAgICAgICdib3JkZXInOiAnMnB4IHNvbGlkICMzZDcwYjInLFxyXG4gICAgICAgICAgJ21hcmdpbi10b3AnOiAnMjBweCdcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2VhcmNoU3R5bGUgPSB7XHJcbiAgICAgICAgICAnbWluLXdpZHRoJzogJzI1MHB4JyxcclxuICAgICAgICAgICdkaXNwbGF5JzogJ2lubGluZS1ibG9jaycsXHJcbiAgICAgICAgICAnaGVpZ2h0JzogJzQwcHgnLFxyXG4gICAgICAgICAgJ3dpZHRoJzogJzkwJScsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGhpcy50cmVlU3R5bGUgPSB7XHJcbiAgICAgICAgICAnY29sb3InOiAnIzY0NjQ2NCdcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB0aGlzLnN0eWxlID0ge1xyXG4gICAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAnI0Y0RjdGQicsXHJcbiAgICAgICAgICAnbWFyZ2luLXRvcCc6ICcxMHB4JyxcclxuICAgICAgICAgICdtYXgtaGVpZ2h0JzogJzMyMHB4JyxcclxuICAgICAgICAgICdvdmVyZmxvdy15JzogJ3Njcm9sbCcsXHJcbiAgICAgICAgICAncGFkZGluZyc6ICcwcHgnLFxyXG4gICAgICAgICAgJ21hcmdpbi1sZWZ0JzogJzBweCdcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgICBkZWZhdWx0OiB7XHJcbiAgICAgICAgdGhpcy50cmVlU3R5bGUgPSB7ICdmaWx0ZXInOiAnYnJpZ2h0bmVzcygzKScsICdjb2xvcic6ICd3aGl0ZScgfTtcclxuICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgY29uc3QgZmlsZUV4cGxvcmVyR2xvYmFsRWxlbWVudCA9IHRoaXMuZmlsZUV4cGxvcmVyR2xvYmFsLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgICB0aGlzLmFwcEtleWJvYXJkLnJlZ2lzdGVyS2V5VXBFdmVudChmaWxlRXhwbG9yZXJHbG9iYWxFbGVtZW50KTtcclxuICAgIHRoaXMuYXBwS2V5Ym9hcmQucmVnaXN0ZXJLZXlEb3duRXZlbnQoZmlsZUV4cGxvcmVyR2xvYmFsRWxlbWVudCk7XHJcbiAgICB0aGlzLmtleUJpbmRpbmdTdWIuYWRkKHRoaXMuYXBwS2V5Ym9hcmQua2V5ZG93bkV2ZW50XHJcbiAgICAgIC5zdWJzY3JpYmUoKGV2ZW50KSA9PiB7XHJcbiAgICAgICAgaWYgKGV2ZW50LndoaWNoID09PSBLZXlDb2RlLktFWV9QICYmICFldmVudC5jdHJsS2V5KSB7XHJcbiAgICAgICAgICB0aGlzLnRvZ2dsZVNlYXJjaCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICAvLyBsZXQgZGF0YU9iamVjdCA9IHttdnNEYXRhOkFycmF5PE12c0RhdGFPYmplY3Q+KCksIHVzc0RhdGE6QXJyYXk8VXNzRGF0YU9iamVjdD4oKX07XHJcbiAgICAvLyB0aGlzLnBlcnNpc3RlbnREYXRhU2VydmljZS5nZXREYXRhKClcclxuICAgIC8vICAgLnN1YnNjcmliZShkYXRhID0+IHtcclxuICAgIC8vICAgICBkYXRhT2JqZWN0ID0gZGF0YS5jb250ZW50cztcclxuICAgIC8vICAgICBkYXRhT2JqZWN0Lm12c0RhdGEgPSBbXTtcclxuICAgIC8vICAgICBkYXRhT2JqZWN0LnVzc0RhdGEgPSBbXTtcclxuICAgIC8vICAgICAvL2NvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KGRhdGFPYmplY3QpKVxyXG4gICAgLy8gICAgIHRoaXMucGVyc2lzdGVudERhdGFTZXJ2aWNlLnNldERhdGEoZGF0YU9iamVjdClcclxuICAgIC8vICAgICAgIC5zdWJzY3JpYmUoKHJlczogYW55KSA9PiB7IH0pO1xyXG4gICAgLy8gICB9KVxyXG4gIH1cclxuXHJcbiAgb25DcmVhdGVEYXRhc2V0KCRldmVudCk6IGFueSB7XHJcbiAgICAvLyBFdmVudCB0byB0ZWxsIGlmIHRoZSBkYXRhc2V0IGNyZWF0aW9uIGlzIHN1Y2Nlc3NmdWwgb3Igbm90XHJcbiAgICB0aGlzLmNyZWF0ZURhdGFzZXQuZW1pdCgkZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgZGVsZXRlRmlsZU9yRm9sZGVyKHBhdGhBbmROYW1lOiBzdHJpbmcpIHtcclxuICAgIHRoaXMudXNzQ29tcG9uZW50LmRlbGV0ZUZpbGVPckZvbGRlcihwYXRoQW5kTmFtZSk7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVEaXJlY3RvcnkocGF0aEFuZE5hbWU/OiBzdHJpbmcpIHtcclxuICAgIGlmIChwYXRoQW5kTmFtZSkge1xyXG4gICAgICB0aGlzLnVzc0NvbXBvbmVudC5zaG93Q3JlYXRlRm9sZGVyRGlhbG9nKHBhdGhBbmROYW1lKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMudXNzQ29tcG9uZW50LnNob3dDcmVhdGVGb2xkZXJEaWFsb2codGhpcy51c3NDb21wb25lbnQuZ2V0U2VsZWN0ZWRQYXRoKCkpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0QWN0aXZlRGlyZWN0b3J5KCk6IHN0cmluZyB7XHJcbiAgICBpZiAodGhpcy5jdXJyZW50SW5kZXggPT0gMCkge1xyXG4gICAgICByZXR1cm4gdGhpcy51c3NDb21wb25lbnQuZ2V0U2VsZWN0ZWRQYXRoKCk7XHJcbiAgICB9IGVsc2UgeyAvL0RhdGFzZXRzIGRvIG5vdCB5ZXQgaGF2ZSBhbiBhY3RpdmUgZGlyZWN0b3J5IGNvbnRleHRcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBoaWRlRXhwbG9yZXJzKCkge1xyXG4gICAgaWYgKHRoaXMudXNzQ29tcG9uZW50KSB7XHJcbiAgICAgIHRoaXMudXNzQ29tcG9uZW50LmhpZGVFeHBsb3JlciA9IHRydWU7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5tdnNDb21wb25lbnQpIHtcclxuICAgICAgdGhpcy5tdnNDb21wb25lbnQuaGlkZUV4cGxvcmVyID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHRvZ2dsZVNlYXJjaCgpIHtcclxuICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCA9PSAwKSB7XHJcbiAgICAgIHRoaXMudXNzQ29tcG9uZW50LnRvZ2dsZVNlYXJjaCgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5tdnNDb21wb25lbnQudG9nZ2xlU2VhcmNoKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBkaXNwbGF5VXBBcnJvdyhzaG93OiBib29sZWFuKSB7XHJcbiAgICB0aGlzLnNob3dVcEFycm93ID0gc2hvdztcclxuICB9XHJcblxyXG4gIG9uQ29weUNsaWNrKCRldmVudDogYW55KSB7XHJcbiAgICB0aGlzLmNvcHlDbGljay5lbWl0KCRldmVudCk7XHJcbiAgfVxyXG5cclxuICBvbkRlbGV0ZUNsaWNrKCRldmVudDogYW55KSB7XHJcbiAgICB0aGlzLmRlbGV0ZUNsaWNrLmVtaXQoJGV2ZW50KTtcclxuICB9XHJcblxyXG4gIG9uVVNTUmVuYW1lRXZlbnQoJGV2ZW50OiBhbnkpIHtcclxuICAgIHRoaXMudXNzUmVuYW1lRXZlbnQuZW1pdCgkZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgLy8gb25OZXdGaWxlQ2xpY2soJGV2ZW50OmFueSl7XHJcbiAgLy8gICB0aGlzLm5ld0ZpbGVDbGljay5lbWl0KCRldmVudCk7XHJcbiAgLy8gfVxyXG5cclxuICBvbk5ld0ZvbGRlckNsaWNrKCRldmVudDogYW55KSB7XHJcbiAgICB0aGlzLm5ld0ZvbGRlckNsaWNrLmVtaXQoJGV2ZW50KTtcclxuICB9XHJcblxyXG4gIG9uRmlsZVVwbG9hZGVkKCRldmVudDogYW55KSB7XHJcbiAgICB0aGlzLmZpbGVVcGxvYWRlZC5lbWl0KCRldmVudCk7XHJcbiAgfVxyXG5cclxuICBvbk5vZGVDbGljaygkZXZlbnQ6IGFueSkge1xyXG4gICAgdGhpcy5ub2RlQ2xpY2suZW1pdCgkZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgb25Ob2RlRGJsQ2xpY2soJGV2ZW50OiBhbnkpIHtcclxuICAgIHRoaXMubm9kZURibENsaWNrLmVtaXQoJGV2ZW50KTtcclxuICB9XHJcblxyXG4gIG9uUGF0aENoYW5nZWQoJGV2ZW50OiBhbnkpIHtcclxuICAgIHRoaXMucGF0aENoYW5nZWQuZW1pdCgkZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgb25EYXRhQ2hhbmdlZCgkZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgdGhpcy5kYXRhQ2hhbmdlZC5lbWl0KCRldmVudCk7XHJcbiAgfVxyXG5cclxuICBvblJpZ2h0Q2xpY2soJGV2ZW50OiBhbnkpIHtcclxuICAgIHRoaXMucmlnaHRDbGljay5lbWl0KCRldmVudCk7XHJcbiAgfVxyXG5cclxuICBvbk9wZW5Jbk5ld1RhYigkZXZlbnQ6IGFueSkge1xyXG4gICAgdGhpcy5vcGVuSW5OZXdUYWIuZW1pdCgkZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgLy8gb25Vc3NGaWxlTG9hZCgkZXZlbnQ6RmlsZUNvbnRlbnRzKXtcclxuICAvLyAgIHRoaXMuZmlsZU91dHB1dC5lbWl0KCRldmVudCk7XHJcbiAgLy8gfVxyXG5cclxuICBwcm92aWRlWkxVWERpc3BhdGNoZXJDYWxsYmFja3MoKTogWkxVWC5BcHBsaWNhdGlvbkNhbGxiYWNrcyB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBvbk1lc3NhZ2U6IChldmVudENvbnRleHQ6IGFueSk6IFByb21pc2U8YW55PiA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuemx1eE9uTWVzc2FnZShldmVudENvbnRleHQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzZXRJbmRleChpbnB1dEluZGV4OiBudW1iZXIpIHtcclxuICAgIHRoaXMuY3VycmVudEluZGV4ID0gaW5wdXRJbmRleDtcclxuICAgIGlmICh0aGlzLmN1cnJlbnRJbmRleCA9PSAwKSB7XHJcbiAgICAgIHRoaXMudXNzU2VsZWN0LmVtaXQoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZGF0YXNldFNlbGVjdC5lbWl0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzaG93RGF0YXNldHMoKSB7XHJcbiAgICB0aGlzLmN1cnJlbnRJbmRleCA9IDE7XHJcbiAgICBpZiAodGhpcy5tdnNDb21wb25lbnQpIHtcclxuICAgICAgdGhpcy5tdnNDb21wb25lbnQuaGlkZUV4cGxvcmVyID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzaG93VXNzKCkge1xyXG4gICAgdGhpcy5jdXJyZW50SW5kZXggPSAwO1xyXG4gICAgaWYgKHRoaXMudXNzQ29tcG9uZW50KSB7XHJcbiAgICAgIHRoaXMudXNzQ29tcG9uZW50LmhpZGVFeHBsb3JlciA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc3Bhd25VcGxvYWRNb2RhbCgpIHtcclxuICAgIGlmICh0aGlzLnVzc0NvbXBvbmVudCkge1xyXG4gICAgICB0aGlzLnVzc0NvbXBvbmVudC5zaG93VXBsb2FkRGlhbG9nKG51bGwpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gLi4uIERpc2FibGVkIGZvciBEUyBtb2RlIGZvciBub3dcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHVwZGF0ZURpcmVjdG9yeShkaXJOYW1lOiBzdHJpbmcpIHtcclxuICAgIHRoaXMuc2hvd1VzcygpO1xyXG4gICAgdGhpcy51c3NDb21wb25lbnQudXBkYXRlVXNzKGRpck5hbWUpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlRFNMaXN0KHF1ZXJ5OiBzdHJpbmcpIHtcclxuICAgIHRoaXMuc2hvd0RhdGFzZXRzKCk7XHJcbiAgICB0aGlzLm12c0NvbXBvbmVudC5zZXRQYXRoKHF1ZXJ5KTtcclxuICAgIHRoaXMubXZzQ29tcG9uZW50LnVwZGF0ZVRyZWVWaWV3KHF1ZXJ5KTtcclxuICB9XHJcblxyXG4gIHJlZnJlc2hGaWxlTWV0YWRhdGRhQnlQYXRoKHBhdGg6IHN0cmluZykge1xyXG4gICAgcmV0dXJuIHRoaXMudXNzQ29tcG9uZW50LnJlZnJlc2hGaWxlTWV0YWRhdGRhVXNpbmdQYXRoKHBhdGgpO1xyXG4gIH1cclxuXHJcbiAgemx1eE9uTWVzc2FnZShldmVudENvbnRleHQ6IGFueSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuXHJcbiAgICAgIGlmICghZXZlbnRDb250ZXh0IHx8ICFldmVudENvbnRleHQuYWN0aW9uKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlamVjdCgnRXZlbnQgY29udGV4dCBtaXNzaW5nIG9yIG1hbGZvcm1lZCcpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChldmVudENvbnRleHQuYWN0aW9uID09PSAnc2F2ZS1maWxlJykge1xyXG4gICAgICAgIC8vIFRoaXMgaXMgbm8gbG9uZ2VyIG5lZWRlZCBhcyBFZGl0b3IgdGFrZXMgb3ZlciBhbnkgZmlsZSBlZGl0L2NvbnRleHQgZnVuY3Rpb25zLlxyXG4gICAgICAgIC8vIHRoaXMucGFyZW50VXNzRWRpdCA9IGV2ZW50Q29udGV4dDtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhcInBhcmVudFVzc0VkaXQ6XCIgKyB0aGlzLnBhcmVudFVzc0VkaXQpXHJcbiAgICAgICAgLy9UT0RPOnRocm93IHRoaXMgZG93biB0byBGaWxlQnJvd3NlclVTU0NvbXBvbmVudFxyXG4gICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgfVxyXG4gICAgICAvLyBlbHNlIGlmIChldmVudENvbnRleHQuYWN0aW9uID09PSAnb3Blbi1maWxlJyl7XHJcbiAgICAgIC8vICAgaWYgKCFldmVudENvbnRleHQuZmlsZVBhdGggfHwgIWV2ZW50Q29udGV4dC5maWxlTmFtZSB8fCAhZXZlbnRDb250ZXh0LmZpbGVDb250ZW50cykge1xyXG4gICAgICAvLyAgICAgcmV0dXJuIHJlamVjdCgnRXZlbnQgY29udGV4dCBtaXNzaW5nIG9yIG1hbGZvcm1lZCcpO1xyXG4gICAgICAvLyAgIH1cclxuICAgICAgLy8gICB0aGlzLmluaXRNb25hY28oZXZlbnRDb250ZXh0KTtcclxuICAgICAgLy8gfVxyXG4gICAgfSk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFpsdXhGaWxlVHJlZVN0eWxlIHsgLy9UT0RPOiBXZSBjYW4gc3BlY2lmeSB3aGljaCBVSSB0aGluZ3MgY2FuL2Nhbm5vdCBiZSBjaGFuZ2VkLlxyXG59IC8vIEZvciB0aGUgc2FrZSBvZiBjdXN0b21pemVhYmlsaXR5LCBJIGRvbid0IHNlZSB3aHkgdGhlcmUgc2hvdWxkIGJlIHJlc3RyaWN0aW9ucyBhdCB0aGUgbW9tZW50LlxyXG5cclxuXHJcbi8qXHJcbiAgVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcclxuICBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEVjbGlwc2UgUHVibGljIExpY2Vuc2UgdjIuMCB3aGljaCBhY2NvbXBhbmllc1xyXG4gIHRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MjAuaHRtbFxyXG4gIFxyXG4gIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBFUEwtMi4wXHJcbiAgXHJcbiAgQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxyXG4qL1xyXG4iLCI8IS0tXG5UaGlzIHByb2dyYW0gYW5kIHRoZSBhY2NvbXBhbnlpbmcgbWF0ZXJpYWxzIGFyZVxubWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcbnRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MjAuaHRtbFxuXG5TUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxuXG5Db3B5cmlnaHQgQ29udHJpYnV0b3JzIHRvIHRoZSBab3dlIFByb2plY3QuXG4tLT5cblxuPGRpdiBjbGFzcz1cImZpbGVleHBsb3Jlci1nbG9iYWxcIiAjZmlsZUV4cGxvcmVyR2xvYmFsPlxuICA8bmF2IGRhdGEtdGFicyBjbGFzcz1cImZpbGVleHBsb3Jlci10YWJzXCIgcm9sZT1cIm5hdmlnYXRpb25cIj5cbiAgICA8ZGl2IGNsYXNzPVwiZmlsZWV4cGxvcmVyLXRhYnMtdHJpZ2dlclwiIHRhYmluZGV4PVwiLTFcIj5cbiAgICAgIDxhIGhyZWY9XCJqYXZhc2NyaXB0OnZvaWQoMClcIiBjbGFzcz1cImJ4LS10YWJzLXRyaWdnZXItdGV4dFwiIHRhYmluZGV4PVwiLTFcIj48L2E+XG5cbiAgICA8L2Rpdj5cbiAgICA8dWwgY2xhc3M9XCJmaWxlZXhwbG9yZXItdGFicy1saXN0XCIgcm9sZT1cInRhYmxpc3RcIiBbbmdTdHlsZV09XCJoZWFkZXJTdHlsZVwiPlxuICAgICAgQGZvciAodGFiIG9mIHRhYnM7IHRyYWNrIHRhYikge1xuICAgICAgPGxpIFtuZ0NsYXNzXT1cInRhYi5pbmRleCA9PSBjdXJyZW50SW5kZXggPyAnZmlsZWV4cGxvcmVyLXRhYi1zZWxlY3RlZCcgOiAnZmlsZWV4cGxvcmVyLXRhYidcIlxuICAgICAgICAoY2xpY2spPVwic2V0SW5kZXgodGFiLmluZGV4KVwiIGlkPVwidGFiLXt7dGFiLmluZGV4fX1cIiByb2xlPVwicHJlc2VudGF0aW9uXCIgW25nU3R5bGVdPVwiaGVhZGVyU3R5bGVcIlxuICAgICAgICBjbGFzcz1cImJ4LS10YWJzX19uYXYtaXRlbVwiPlxuICAgICAgICA8YSBjbGFzcz1cImZpbGVleHBsb3Jlci10YWJzLXRleHRcIiBocmVmPVwiamF2YXNjcmlwdDp2b2lkKDApXCIgcm9sZT1cInRhYlwiIGFyaWEtc2VsZWN0ZWQ9XCJmYWxzZVwiXG4gICAgICAgICAgW25nU3R5bGVdPVwiaGVhZGVyU3R5bGVcIj57e3RhYi5uYW1lfX08L2E+XG4gICAgICA8L2xpPlxuICAgICAgfVxuICAgIDwvdWw+XG4gIDwvbmF2PlxuICA8ZGl2IGNsYXNzPVwiZmlsZWV4cGxvcmVyLWJyb3dzZXItbW9kdWxlXCIgW25nU3R5bGVdPVwic3R5bGVcIj5cbiAgICA8ZmlsZS1icm93c2VyLXVzcyAjdXNzQ29tcG9uZW50IFtoaWRkZW5dPVwiY3VycmVudEluZGV4ICE9IDBcIiAobm9kZUNsaWNrKT1cIm9uTm9kZUNsaWNrKCRldmVudClcIlxuICAgICAgKG5vZGVEYmxDbGljayk9XCJvbk5vZGVEYmxDbGljaygkZXZlbnQpXCIgKG9wZW5Jbk5ld1RhYik9XCJvbk9wZW5Jbk5ld1RhYigkZXZlbnQpXCJcbiAgICAgIChuZXdGb2xkZXJDbGljayk9XCJvbk5ld0ZvbGRlckNsaWNrKCRldmVudClcIiAoZmlsZVVwbG9hZGVkKT1cIm9uRmlsZVVwbG9hZGVkKCRldmVudClcIlxuICAgICAgKGRlbGV0ZUNsaWNrKT1cIm9uRGVsZXRlQ2xpY2soJGV2ZW50KVwiICh1c3NSZW5hbWVFdmVudCk9XCJvblVTU1JlbmFtZUV2ZW50KCRldmVudClcIlxuICAgICAgKGNvcHlDbGljayk9XCJvbkNvcHlDbGljaygkZXZlbnQpXCIgKHJpZ2h0Q2xpY2spPVwib25SaWdodENsaWNrKCRldmVudClcIiAocGF0aENoYW5nZWQpPVwib25QYXRoQ2hhbmdlZCgkZXZlbnQpXCJcbiAgICAgIChkYXRhQ2hhbmdlZCk9XCJvbkRhdGFDaGFuZ2VkKCRldmVudClcIiBbc3R5bGVdPVwic3R5bGVcIiBbaW5wdXRTdHlsZV09XCJpbnB1dFN0eWxlXCIgW3RyZWVTdHlsZV09XCJ0cmVlU3R5bGVcIlxuICAgICAgW3NlYXJjaFN0eWxlXT1cInNlYXJjaFN0eWxlXCIgW3Nob3dVcEFycm93XT1cInNob3dVcEFycm93XCI+PC9maWxlLWJyb3dzZXItdXNzPlxuICAgIDxmaWxlLWJyb3dzZXItbXZzICNtdnNDb21wb25lbnQgW2hpZGRlbl09XCJjdXJyZW50SW5kZXggIT0gMVwiIChub2RlQ2xpY2spPVwib25Ob2RlQ2xpY2soJGV2ZW50KVwiXG4gICAgICAobm9kZURibENsaWNrKT1cIm9uTm9kZURibENsaWNrKCRldmVudClcIiAob3BlbkluTmV3VGFiKT1cIm9uT3BlbkluTmV3VGFiKCRldmVudClcIlxuICAgICAgKGRlbGV0ZUNsaWNrKT1cIm9uRGVsZXRlQ2xpY2soJGV2ZW50KVwiIChyaWdodENsaWNrKT1cIm9uUmlnaHRDbGljaygkZXZlbnQpXCIgKHBhdGhDaGFuZ2VkKT1cIm9uUGF0aENoYW5nZWQoJGV2ZW50KVwiXG4gICAgICAoZGF0YUNoYW5nZWQpPVwib25EYXRhQ2hhbmdlZCgkZXZlbnQpXCIgKGNyZWF0ZURhdGFzZXQpPVwib25DcmVhdGVEYXRhc2V0KCRldmVudClcIiBbaW5wdXRTdHlsZV09XCJpbnB1dFN0eWxlXCJcbiAgICAgIFt0cmVlU3R5bGVdPVwidHJlZVN0eWxlXCIgW3NlYXJjaFN0eWxlXT1cInNlYXJjaFN0eWxlXCIgW3N0eWxlXT1cInN0eWxlXCJcbiAgICAgIFtzaG93VXBBcnJvd109XCJzaG93VXBBcnJvd1wiPjwvZmlsZS1icm93c2VyLW12cz5cbiAgPC9kaXY+XG48L2Rpdj5cblxuPCEtLVxuVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcbm1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRWNsaXBzZSBQdWJsaWMgTGljZW5zZSB2Mi4wIHdoaWNoIGFjY29tcGFuaWVzXG50aGlzIGRpc3RyaWJ1dGlvbiwgYW5kIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5lY2xpcHNlLm9yZy9sZWdhbC9lcGwtdjIwLmh0bWxcblxuU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcblxuPCEtLVxuVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcbm1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRWNsaXBzZSBQdWJsaWMgTGljZW5zZSB2Mi4wIHdoaWNoIGFjY29tcGFuaWVzXG50aGlzIGRpc3RyaWJ1dGlvbiwgYW5kIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5lY2xpcHNlLm9yZy9sZWdhbC9lcGwtdjIwLmh0bWxcblxuU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcblxuQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxuLS0+Il19