/// <reference types="../../../../zlux-platform/interface/src/index.d.ts" />
import { ElementRef, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { DatasetAttributes, Member } from '../../structures/editor-project';
import { Angular2PluginWindowActions } from '../../../pluginlib/inject-resources';
import { DownloaderService } from '../../services/downloader.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SearchHistoryService } from '../../services/searchHistoryService';
import { UtilsService } from '../../services/utils.service';
import { DatasetCrudService } from '../../services/dataset.crud.service';
import { TreeNode } from 'primeng/api';
import * as i0 from "@angular/core";
export declare class FileBrowserMVSComponent implements OnInit, OnDestroy {
    private elementRef;
    private utils;
    mvsSearchHistory: SearchHistoryService;
    snackBar: MatSnackBar;
    datasetService: DatasetCrudService;
    downloadService: DownloaderService;
    dialog: MatDialog;
    private log;
    private pluginDefinition;
    private windowActions;
    private treeComponent;
    hideExplorer: boolean;
    private rightClickPropertiesPanel;
    isLoading: boolean;
    private rightClickPropertiesDatasetFile;
    private rightClickPropertiesDatasetFolder;
    searchMVS: ElementRef;
    searchCtrl: any;
    private searchValueSubscription;
    private saveHistorySubscription;
    showSearch: boolean;
    path: string;
    selectedNode: any;
    data: any;
    private dataCached;
    private rightClickedFile;
    private rightClickedEvent;
    private deletionQueue;
    private deleteSubscription;
    private deleteVsamSubscription;
    private deleteNonVsamSubscription;
    additionalQualifiers: boolean;
    constructor(elementRef: ElementRef, utils: UtilsService, mvsSearchHistory: SearchHistoryService, snackBar: MatSnackBar, datasetService: DatasetCrudService, downloadService: DownloaderService, dialog: MatDialog, log: ZLUX.ComponentLogger, pluginDefinition: ZLUX.ContainerPluginDefinition, windowActions: Angular2PluginWindowActions);
    inputStyle: any;
    searchStyle: any;
    treeStyle: any;
    style: any;
    showUpArrow: boolean;
    pathChanged: EventEmitter<any>;
    dataChanged: EventEmitter<any>;
    nodeClick: EventEmitter<any>;
    nodeDblClick: EventEmitter<any>;
    rightClick: EventEmitter<any>;
    deleteClick: EventEmitter<any>;
    openInNewTab: EventEmitter<any>;
    createDataset: EventEmitter<any>;
    ngOnInit(): void;
    ngOnDestroy(): void;
    updateTreeData(destinationData: any, newData: any): void;
    initializeRightClickProperties(): void;
    showDeleteDialog(rightClickedFile: any): void;
    deleteNonVsamDataset(rightClickedFile: any): void;
    deleteVsamDataset(rightClickedFile: any): void;
    removeChild(node: any): void;
    findNodeByPath(data: any, path: string): any[];
    attemptDownload(rightClickedFile: any): void;
    copyLink(rightClickedFile: any): void;
    showPropertiesDialog(rightClickedFile: any): void;
    toggleSearch(): void;
    focusSearchInput(attemptCount?: number): void;
    searchInputChanged(input: string): void;
    filterNodesByLabel(data: any, label: string): void;
    getDOMElement(): HTMLElement;
    getSelectedPath(): string;
    onNodeClick($event: any): void;
    onNodeDblClick($event: any): void;
    onNodeRightClick(event: any): void;
    onPanelRightClick($event: any): void;
    collapseTree(): void;
    updateTreeView(path: string): void;
    onPathChanged($event: any): void;
    onDataChanged($event: any): void;
    setPath(path: any): void;
    getTreeForQueryAsync(path: string): Promise<any>;
    addChildren(parentNode: TreeNode, members: Member[]): void;
    updateRecalledDatasetNode(node: TreeNode, datasetAttrs: DatasetAttributes): void;
    refreshHistory(path: string): void;
    clearSearchHistory(): void;
    /**
    * [levelUp: function to ascend up a level in the file/folder tree]
    * @param index [tree index where the 'folder' parent is accessed]
    */
    levelUp(): void;
    checkIfInDeletionQueueAndMessage(pathAndName: string, message: string): boolean;
    createDatasetDialog(data?: any): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FileBrowserMVSComponent, [null, null, null, null, null, null, null, null, null, { optional: true; }]>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FileBrowserMVSComponent, "file-browser-mvs", never, { "inputStyle": { "alias": "inputStyle"; "required": false; }; "searchStyle": { "alias": "searchStyle"; "required": false; }; "treeStyle": { "alias": "treeStyle"; "required": false; }; "style": { "alias": "style"; "required": false; }; "showUpArrow": { "alias": "showUpArrow"; "required": false; }; }, { "pathChanged": "pathChanged"; "dataChanged": "dataChanged"; "nodeClick": "nodeClick"; "nodeDblClick": "nodeDblClick"; "rightClick": "rightClick"; "deleteClick": "deleteClick"; "openInNewTab": "openInNewTab"; "createDataset": "createDataset"; }, never, never, false, never>;
}
