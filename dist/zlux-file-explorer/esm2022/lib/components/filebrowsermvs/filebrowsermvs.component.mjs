/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, ViewEncapsulation, Input, EventEmitter, Output, Inject, Optional, ViewChild } from '@angular/core';
import { take, finalize, debounceTime } from 'rxjs/operators';
import { Angular2InjectionTokens } from '../../../pluginlib/inject-resources';
import { MatDialogConfig } from '@angular/material/dialog';
import { DatasetPropertiesModal } from '../dataset-properties-modal/dataset-properties-modal.component';
import { DeleteFileModal } from '../delete-file-modal/delete-file-modal.component';
import { defaultSnackbarOptions, longSnackbarOptions, quickSnackbarOptions } from '../../shared/snackbar-options';
import { FormControl } from '@angular/forms';
import { TreeComponent } from '../tree/tree.component';
import * as _ from 'lodash';
/* Services */
import { SearchHistoryService } from '../../services/searchHistoryService';
import { DatasetCrudService } from '../../services/dataset.crud.service';
import { CreateDatasetModal } from '../create-dataset-modal/create-dataset-modal.component';
import * as i0 from "@angular/core";
import * as i1 from "../../services/utils.service";
import * as i2 from "../../services/searchHistoryService";
import * as i3 from "@angular/material/snack-bar";
import * as i4 from "../../services/dataset.crud.service";
import * as i5 from "../../services/downloader.service";
import * as i6 from "@angular/material/dialog";
import * as i7 from "@angular/common";
import * as i8 from "@angular/forms";
import * as i9 from "@angular/material/button-toggle";
import * as i10 from "primeng/inputtext";
import * as i11 from "../tree/tree.component";
/* TODO: re-implement to add fetching of previously opened tree view data
import { PersistentDataService } from '../../services/persistentData.service'; */
// Used for DS async deletion UX
const CSS_NODE_DELETING = "filebrowsermvs-node-deleting";
const SEARCH_ID = 'mvs';
export class FileBrowserMVSComponent {
    constructor(elementRef, utils, mvsSearchHistory, snackBar, datasetService, downloadService, dialog, log, pluginDefinition, windowActions) {
        this.elementRef = elementRef;
        this.utils = utils;
        this.mvsSearchHistory = mvsSearchHistory;
        this.snackBar = snackBar;
        this.datasetService = datasetService;
        this.downloadService = downloadService;
        this.dialog = dialog;
        this.log = log;
        this.pluginDefinition = pluginDefinition;
        this.windowActions = windowActions;
        this.deletionQueue = new Map(); //DS deletion is async, so queue is used
        /* Tree outgoing events */
        this.pathChanged = new EventEmitter();
        this.dataChanged = new EventEmitter();
        this.nodeClick = new EventEmitter();
        this.nodeDblClick = new EventEmitter();
        this.rightClick = new EventEmitter();
        this.deleteClick = new EventEmitter();
        this.openInNewTab = new EventEmitter();
        this.createDataset = new EventEmitter();
        /* TODO: Legacy, capabilities code (unused for now) */
        //this.componentClass = ComponentClass.FileBrowser;
        //this.initalizeCapabilities();
        this.mvsSearchHistory.onInit(SEARCH_ID);
        this.path = "";
        this.hideExplorer = false;
        this.isLoading = false;
        this.additionalQualifiers = true;
        this.showSearch = false;
        this.searchCtrl = new FormControl();
        this.searchValueSubscription = this.searchCtrl.valueChanges.pipe(debounceTime(500)).subscribe((value) => { this.searchInputChanged(value); });
        this.selectedNode = null;
    }
    ngOnInit() {
        // TODO: Fetching updates for automatic refresh (disabled for now)
        // this.intervalId = setInterval(() => {
        //   if(this.data){
        //     this.getTreeForQueryAsync(this.path).then((response: any) => {
        //       let newData = response;
        //       this.updateTreeData(this.data, newData);
        //       if (this.showSearch) {
        //         if (this.dataCached) {
        //           this.updateTreeData(this.dataCached, newData);
        //         }
        //       }
        //       /* We don't update search history, nor emit path changed event, because this method is meant
        //       to be a fetched update, not a user action new path */
        //     });
        //   }
        // }, this.updateInterval);
        this.initializeRightClickProperties();
    }
    ngOnDestroy() {
        if (this.searchValueSubscription) {
            this.searchValueSubscription.unsubscribe();
        }
        if (this.deleteSubscription) {
            this.deleteSubscription.unsubscribe();
        }
        if (this.deleteNonVsamSubscription) {
            this.deleteNonVsamSubscription.unsubscribe();
        }
        if (this.deleteVsamSubscription) {
            this.deleteVsamSubscription.unsubscribe();
        }
        // TODO: Fetching updates for automatic refresh (disabled for now)
        // if (this.intervalId) {
        //   clearInterval(this.intervalId);
        // }
    }
    // Updates the 'data' array with new data, preserving existing expanded datasets
    updateTreeData(destinationData, newData) {
        //Only update if data sets are added/removed
        // TODO: Add a more in-depth check for DS updates (check DS properties too?)
        if (destinationData.length != newData.length) {
            this.log.debug("Change in dataset count detected. Updating tree...");
            let expandedFolders = destinationData.filter(dataObj => dataObj.expanded);
            //checks if the query response contains the same PDS' that are currently expanded
            let newDataHasExpanded = newData.filter(dataObj => expandedFolders.some(expanded => expanded.label === dataObj.label));
            //Keep currently expanded datasets expanded after update
            if (newDataHasExpanded.length > 0) {
                let expandedNewData = newData.map((obj) => {
                    let retObj = {};
                    newDataHasExpanded.forEach((expandedObj) => {
                        if (obj.label == expandedObj.label) {
                            obj.expanded = true;
                        }
                        retObj = obj;
                    });
                    return retObj;
                });
                destinationData = expandedNewData;
            }
            else {
                destinationData = newData;
            }
        }
    }
    /* TODO: Legacy, capabilities code (unused for now) */
    /*initalizeCapabilities(){
      this.capabilities = new Array<Capability>();
      this.capabilities.push(FileBrowserCapabilities.FileBrowser);
      this.capabilities.push(FileBrowserCapabilities.FileBrowserMVS);
    }*/
    initializeRightClickProperties() {
        this.rightClickPropertiesDatasetFile = [
            {
                text: "Request Open in New Browser Tab", action: () => {
                    this.openInNewTab.emit(this.rightClickedFile);
                }
            },
            {
                text: "Copy Link", action: () => {
                    this.copyLink(this.rightClickedFile);
                }
            },
            {
                text: "Properties", action: () => {
                    this.showPropertiesDialog(this.rightClickedFile);
                }
            },
            {
                text: "Delete", action: () => {
                    this.showDeleteDialog(this.rightClickedFile);
                }
            },
            {
                text: "Download", action: () => {
                    this.attemptDownload(this.rightClickedFile);
                }
            }
        ];
        this.rightClickPropertiesDatasetFolder = [
            {
                text: "Copy Link", action: () => {
                    this.copyLink(this.rightClickedFile);
                }
            },
            {
                text: "Properties", action: () => {
                    this.showPropertiesDialog(this.rightClickedFile);
                }
            },
            {
                text: "Delete", action: () => {
                    this.showDeleteDialog(this.rightClickedFile);
                }
            }
        ];
        this.rightClickPropertiesPanel = [
            {
                text: "Show/Hide Search", action: () => {
                    this.toggleSearch();
                }
            }
        ];
    }
    showDeleteDialog(rightClickedFile) {
        if (this.checkIfInDeletionQueueAndMessage(rightClickedFile.data.path, "This is already being deleted.") == true) {
            return;
        }
        const fileDeleteConfig = new MatDialogConfig();
        fileDeleteConfig.data = {
            event: rightClickedFile,
            width: '600px'
        };
        let fileDeleteRef = this.dialog.open(DeleteFileModal, fileDeleteConfig);
        this.deleteSubscription = fileDeleteRef.componentInstance.onDelete.subscribe(() => {
            let vsamCSITypes = ['R', 'D', 'G', 'I', 'C'];
            if (vsamCSITypes.indexOf(rightClickedFile.data.datasetAttrs.csiEntryType) != -1) {
                this.deleteVsamDataset(rightClickedFile);
            }
            else {
                this.deleteNonVsamDataset(rightClickedFile);
            }
        });
    }
    deleteNonVsamDataset(rightClickedFile) {
        this.isLoading = true;
        this.deletionQueue.set(rightClickedFile.data.path, rightClickedFile);
        rightClickedFile.styleClass = CSS_NODE_DELETING;
        this.deleteNonVsamSubscription = this.datasetService.deleteNonVsamDatasetOrMember(rightClickedFile)
            .subscribe(resp => {
            this.isLoading = false;
            this.snackBar.open(resp.msg, 'Dismiss', defaultSnackbarOptions);
            this.removeChild(rightClickedFile);
            this.deletionQueue.delete(rightClickedFile.data.path);
            rightClickedFile.styleClass = "";
            this.deleteClick.emit(this.rightClickedEvent.node);
        }, error => {
            if (error.status == '500') { //Internal Server Error
                this.snackBar.open("Failed to delete: '" + rightClickedFile.data.path + "' This is probably due to a server agent problem.", 'Dismiss', defaultSnackbarOptions);
            }
            else if (error.status == '404') { //Not Found
                this.snackBar.open(rightClickedFile.data.path + ' has already been deleted or does not exist.', 'Dismiss', defaultSnackbarOptions);
                this.removeChild(rightClickedFile);
            }
            else if (error.status == '400') { //Bad Request
                this.snackBar.open("Failed to delete '" + rightClickedFile.data.path + "' This is probably due to a permission problem.", 'Dismiss', defaultSnackbarOptions);
            }
            else { //Unknown
                this.snackBar.open("Unknown error '" + error.status + "' occurred for: " + rightClickedFile.data.path, 'Dismiss', longSnackbarOptions);
                // Error info gets printed in uss.crud.service.ts
            }
            this.deletionQueue.delete(rightClickedFile.data.path);
            this.isLoading = false;
            rightClickedFile.styleClass = "";
            this.log.severe(error);
        });
        setTimeout(() => {
            if (this.deleteNonVsamSubscription.closed == false) {
                this.snackBar.open('Deleting ' + rightClickedFile.data.path + '... Larger payloads may take longer. Please be patient.', 'Dismiss', quickSnackbarOptions);
            }
        }, 4000);
    }
    deleteVsamDataset(rightClickedFile) {
        this.isLoading = true;
        this.deletionQueue.set(rightClickedFile.data.path, rightClickedFile);
        rightClickedFile.styleClass = CSS_NODE_DELETING;
        this.deleteVsamSubscription = this.datasetService.deleteVsamDataset(rightClickedFile)
            .subscribe(resp => {
            this.isLoading = false;
            this.snackBar.open(resp.msg, 'Dismiss', defaultSnackbarOptions);
            //Update vs removing node since symbolicly linked data/index of vsam can be named anything
            this.updateTreeView(this.path);
            this.deletionQueue.delete(rightClickedFile.data.path);
            rightClickedFile.styleClass = "";
            this.deleteClick.emit(this.rightClickedEvent.node);
        }, error => {
            if (error.status == '500') { //Internal Server Error
                this.snackBar.open("Failed to delete: '" + rightClickedFile.data.path + "' This is probably due to a server agent problem.", 'Dismiss', defaultSnackbarOptions);
            }
            else if (error.status == '404') { //Not Found
                this.snackBar.open(rightClickedFile.data.path + ' has already been deleted or does not exist.', 'Dismiss', defaultSnackbarOptions);
                this.updateTreeView(this.path);
            }
            else if (error.status == '400') { //Bad Request
                this.snackBar.open("Failed to delete '" + rightClickedFile.data.path + "' This is probably due to a permission problem.", 'Dismiss', defaultSnackbarOptions);
            }
            else if (error.status == '403') { //Bad Request
                this.snackBar.open("Failed to delete '" + rightClickedFile.data.path + "'" + ". " + JSON.parse(error._body)['msg'], 'Dismiss', defaultSnackbarOptions);
            }
            else { //Unknown
                this.snackBar.open("Unknown error '" + error.status + "' occurred for: " + rightClickedFile.data.path, 'Dismiss', longSnackbarOptions);
                //Error info gets printed in uss.crud.service.ts
            }
            this.deletionQueue.delete(rightClickedFile.data.path);
            this.isLoading = false;
            rightClickedFile.styleClass = "";
            this.log.severe(error);
        });
        setTimeout(() => {
            if (this.deleteVsamSubscription.closed == false) {
                this.snackBar.open('Deleting ' + rightClickedFile.data.path + '... Larger payloads may take longer. Please be patient.', 'Dismiss', quickSnackbarOptions);
            }
        }, 4000);
    }
    removeChild(node) {
        let nodes = this.data;
        if (node.parent) {
            let parent = node.parent;
            let index = parent.children.indexOf(node);
            if (index == -1) {
                return;
            }
            else {
                parent.children.splice(index, 1);
                nodes[nodes.indexOf(node.parent)] = parent;
                this.data = nodes;
            }
        }
        else {
            let index = nodes.indexOf(node);
            if (index == -1) {
                return;
            }
            else {
                nodes.splice(nodes.indexOf(node), 1);
                this.data = nodes;
            }
        }
        if (this.showSearch) { // If we remove a node, we need to update it in search bar cache
            let nodeDataCached = this.findNodeByPath(this.dataCached, node.data.path);
            if (nodeDataCached) {
                let nodeCached = nodeDataCached[0];
                let indexCached = nodeDataCached[1];
                if (indexCached != -1) {
                    if (nodeCached.parent) {
                        nodeCached.parent.children.splice(indexCached, 1);
                        let parentDataCached = this.findNodeByPath(this.dataCached, node.parent.data.path);
                        if (parentDataCached) {
                            let parentIndexCached = parentDataCached[1];
                            this.dataCached[parentIndexCached] = nodeCached.parent;
                        }
                    }
                    else {
                        this.dataCached.splice(indexCached, 1);
                    }
                }
            }
        }
    }
    // TODO: Could be optimized to do breadth first search vs depth first search
    findNodeByPath(data, path) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].data.path == path) {
                return [data[i], i]; // 0 - node, 1 - index
            }
            if (data[i].children && data[i].children.length > 0) {
                this.findNodeByPath(data[i].children, path);
            }
        }
        return [null, null];
    }
    attemptDownload(rightClickedFile) {
        let dataset = rightClickedFile.data.path;
        let filename = rightClickedFile.label;
        let downloadObject = rightClickedFile;
        let url = ZoweZLUX.uriBroker.datasetContentsUri(dataset);
        this.downloadService.fetchFileHandler(url, filename, downloadObject).then((res) => {
            // TODO: Download queue code for progress bar could go here
        });
    }
    copyLink(rightClickedFile) {
        let link = '';
        if (rightClickedFile.type == 'file') {
            link = `${window.location.origin}${window.location.pathname}?pluginId=${this.pluginDefinition.getBasePlugin().getIdentifier()}:data:${encodeURIComponent(`{"type":"openDataset","name":"${rightClickedFile.data.path}","toggleTree":true}`)}`;
        }
        else {
            link = `${window.location.origin}${window.location.pathname}?pluginId=${this.pluginDefinition.getBasePlugin().getIdentifier()}:data:${encodeURIComponent(`{"type":"openDSList","name":"${rightClickedFile.data.path}","toggleTree":false}`)}`;
        }
        navigator.clipboard.writeText(link).then(() => {
            this.log.debug("Link copied to clipboard");
            this.snackBar.open("Copied link successfully", 'Dismiss', quickSnackbarOptions);
        }).catch(() => {
            console.error("Failed to copy link to clipboard");
        });
    }
    showPropertiesDialog(rightClickedFile) {
        const filePropConfig = new MatDialogConfig();
        filePropConfig.data = {
            event: rightClickedFile,
            width: 'fit-content',
            maxWidth: '1100px',
            height: '475px'
        };
        this.dialog.open(DatasetPropertiesModal, filePropConfig);
    }
    toggleSearch() {
        this.showSearch = !this.showSearch;
        if (this.showSearch) {
            this.focusSearchInput();
            this.dataCached = _.cloneDeep(this.data); // We want a deep clone so we can modify this.data w/o changing this.dataCached
        }
        else {
            if (this.dataCached) {
                this.data = this.dataCached; // We don't care about deep clone because we just want to get dataCached back
            }
        }
    }
    focusSearchInput(attemptCount) {
        if (this.searchMVS) {
            this.searchMVS.nativeElement.focus();
            return;
        }
        const maxAttempts = 10;
        if (typeof attemptCount !== 'number') {
            attemptCount = maxAttempts;
        }
        if (attemptCount > 0) {
            attemptCount--;
            setTimeout(() => this.focusSearchInput(attemptCount), 100);
        }
    }
    searchInputChanged(input) {
        input = input.toUpperCase(); // Client-side the DS are uppercase
        if (this.dataCached) {
            this.data = _.cloneDeep(this.dataCached);
        }
        this.filterNodesByLabel(this.data, input);
    }
    filterNodesByLabel(data, label) {
        for (let i = 0; i < data.length; i++) {
            if (!(data[i]).label.includes(label)) {
                if (data[i].children && data[i].children.length > 0) {
                    this.filterNodesByLabel(data[i].children, label);
                }
                if (!(data[i].children && data[i].children.length > 0)) {
                    data.splice(i, 1);
                    i--;
                } // TODO: Refactor ".data" of USS node and ".type" of DS node to be the same thing 
                else if (data[i].type = "folder") { // If some children didn't get filtered out (aka we got some matches) and we have a folder
                    // then we want to expand the node so the user can see their results in the search bar
                    data[i].expanded = true;
                }
            }
        }
    }
    getDOMElement() {
        return this.elementRef.nativeElement;
    }
    getSelectedPath() {
        //TODO:how do we want to want to handle caching vs message to app to open said path
        return this.path;
    }
    onNodeClick($event) {
        this.selectedNode = $event.node;
        if ($event.node.type == 'folder') {
            $event.node.expanded = !$event.node.expanded;
            if (this.showSearch) { // Update search bar cached data
                let nodeCached = this.findNodeByPath(this.dataCached, $event.node.data.path)[0];
                if (nodeCached) {
                    nodeCached.expanded = $event.node.expanded;
                }
            }
        }
        if (this.utils.isDatasetMigrated($event.node.data.datasetAttrs)) {
            const path = $event.node.data.path;
            const snackBarRef = this.snackBar.open(`Recalling dataset '${path}'`, undefined, { panelClass: 'center' });
            this.datasetService.recallDataset($event.node.data.path)
                .pipe(finalize(() => snackBarRef.dismiss()))
                .subscribe(attrs => {
                this.updateRecalledDatasetNode($event.node, attrs);
                if (this.showSearch) { // Update search bar cached data
                    let nodeCached = this.findNodeByPath(this.dataCached, $event.node.data.path)[0];
                    if (nodeCached) {
                        this.updateRecalledDatasetNode(nodeCached, attrs);
                    }
                }
                this.nodeClick.emit($event.node);
            }, _err => this.snackBar.open(`Failed to recall dataset '${path}'`, 'Dismiss', defaultSnackbarOptions));
            return;
        }
        this.nodeClick.emit($event.node);
    }
    onNodeDblClick($event) {
        this.selectedNode = $event.node;
        if (this.selectedNode.data?.hasChildren && this.selectedNode.children?.length > 0) {
            this.path = $event.node.data.path;
            if (this.path) {
                this.getTreeForQueryAsync(this.path).then((res) => {
                    this.data = res[0].children;
                    this.onPathChanged(this.path);
                    this.refreshHistory(this.path);
                });
            }
            else {
                this.log.debug("A DS node double click event was received to open, but no path was found");
            }
        }
        this.nodeDblClick.emit($event.node);
    }
    onNodeRightClick(event) {
        let node = event.node;
        let rightClickProperties;
        if (node.type === 'file') {
            rightClickProperties = this.rightClickPropertiesDatasetFile;
        }
        else {
            rightClickProperties = this.rightClickPropertiesDatasetFolder;
        }
        if (this.windowActions) {
            let didContextMenuSpawn = this.windowActions.spawnContextMenu(event.originalEvent.clientX, event.originalEvent.clientY, rightClickProperties, true);
            // TODO: Fix Zowe's context menu such that if it doesn't have enough space to spawn, it moves itself accordingly to spawn.
            if (!didContextMenuSpawn) { // If context menu failed to spawn...
                let heightAdjustment = event.originalEvent.clientY - 25; // Bump it up 25px
                didContextMenuSpawn = this.windowActions.spawnContextMenu(event.originalEvent.clientX, heightAdjustment, rightClickProperties, true);
            }
        }
        this.rightClickedFile = node;
        this.rightClickedEvent = event;
        this.rightClick.emit(event.node);
        event.originalEvent.preventDefault();
    }
    onPanelRightClick($event) {
        if (this.windowActions) {
            let didContextMenuSpawn = this.windowActions.spawnContextMenu($event.clientX, $event.clientY, this.rightClickPropertiesPanel, true);
            // TODO: Fix Zowe's context menu such that if it doesn't have enough space to spawn, it moves itself accordingly to spawn.
            if (!didContextMenuSpawn) { // If context menu failed to spawn...
                let heightAdjustment = $event.clientY - 25; // Bump it up 25px
                didContextMenuSpawn = this.windowActions.spawnContextMenu($event.clientX, heightAdjustment, this.rightClickPropertiesPanel, true);
            }
        }
    }
    collapseTree() {
        let dataArray = this.data;
        for (let i = 0; i < dataArray.length; i++) {
            if (this.data[i].expanded == true) {
                this.data[i].expanded = false;
            }
        }
        this.treeComponent.unselectNode();
    }
    updateTreeView(path) {
        this.getTreeForQueryAsync(path).then((res) => {
            this.data = res;
            if (this.showSearch) {
                this.dataCached = this.data;
                this.showSearch = false;
            }
        }, (error) => {
            if (error.status == '0') {
                this.snackBar.open("Failed to communicate with the App server: " + error.status, 'Dismiss', defaultSnackbarOptions);
            }
            else if (error.status == '400' && path == '') {
                this.snackBar.open("No dataset name specified: " + error.status, 'Dismiss', defaultSnackbarOptions);
            }
            else if (error.status == '400') {
                this.snackBar.open("Bad request: " + error.status, 'Dismiss', defaultSnackbarOptions);
            }
            else {
                this.snackBar.open("An unknown error occurred: " + error.status, 'Dismiss', defaultSnackbarOptions);
            }
            this.log.severe(error);
        });
        this.onPathChanged(path);
        this.refreshHistory(path);
    }
    onPathChanged($event) {
        this.pathChanged.emit($event);
    }
    onDataChanged($event) {
        this.dataChanged.emit($event);
    }
    setPath(path) {
        this.path = path;
    }
    getTreeForQueryAsync(path) {
        return new Promise((resolve, reject) => {
            this.isLoading = true;
            this.datasetService.queryDatasets(path, true, this.additionalQualifiers).pipe(take(1)).subscribe((res) => {
                this.onDataChanged(res);
                let parents = [];
                let parentMap = {};
                if (res.datasets.length > 0) {
                    for (let i = 0; i < res.datasets.length; i++) {
                        let currentNode = {};
                        currentNode.children = [];
                        currentNode.label = res.datasets[i].name.replace(/^\s+|\s+$/, '');
                        //data.id attribute is not used by either parent or child, but required as part of the ProjectStructure interface
                        let resAttr = res.datasets[i];
                        let currentNodeData = {
                            id: String(i),
                            name: currentNode.label,
                            fileName: currentNode.label,
                            path: currentNode.label,
                            hasChildren: false,
                            isDataset: true,
                            datasetAttrs: {
                                csiEntryType: resAttr.csiEntryType,
                                dsorg: resAttr.dsorg,
                                recfm: resAttr.recfm,
                                volser: resAttr.volser
                            }
                        };
                        currentNode.data = currentNodeData;
                        let migrated = this.utils.isDatasetMigrated(currentNode.data.datasetAttrs);
                        if (currentNode.data.datasetAttrs.dsorg
                            && currentNode.data.datasetAttrs.dsorg.organization === 'partitioned') {
                            currentNode.type = 'folder';
                            currentNode.expanded = false;
                            if (migrated) {
                                currentNode.icon = 'fa fa-clock-o';
                            }
                            else {
                                currentNode.expandedIcon = 'fa fa-folder-open';
                                currentNode.collapsedIcon = 'fa fa-folder';
                            }
                            if (res.datasets[i].members) {
                                currentNode.data.hasChildren = true;
                                this.addChildren(currentNode, res.datasets[i].members);
                            }
                        }
                        else {
                            currentNode.icon = (migrated) ? 'fa fa-clock-o' : 'fa fa-file';
                            currentNode.type = 'file';
                        }
                        parents.push(currentNode);
                        parentMap[currentNode.label] = currentNode;
                    }
                    this.isLoading = false;
                }
                else {
                    this.snackBar.open("No datasets were found for '" + path + "'", 'Dismiss', quickSnackbarOptions);
                    //data set probably doesnt exist
                    this.isLoading = false;
                }
                resolve(parents);
            }, (err) => {
                this.isLoading = false;
                reject(err);
            });
        });
    }
    addChildren(parentNode, members) {
        for (let i = 0; i < members.length; i++) {
            let childNode = {};
            childNode.type = 'file';
            childNode.icon = 'fa fa-file';
            childNode.label = members[i].name.replace(/^\s+|\s+$/, '');
            childNode.parent = parentNode;
            let childNodeData = {
                id: parentNode.data.id,
                name: childNode.label,
                hasChildren: false,
                isDataset: true,
                datasetAttrs: parentNode.data.datasetAttrs
            };
            childNodeData.path = childNodeData.fileName = `${parentNode.label}(${childNode.label})`;
            childNode.data = childNodeData;
            parentNode.children.push(childNode);
        }
    }
    updateRecalledDatasetNode(node, datasetAttrs) {
        const showAsFolder = Array.isArray(datasetAttrs.members);
        node.data.datasetAttrs = datasetAttrs;
        if (showAsFolder) {
            node.data.hasChildren = true;
            this.addChildren(node, datasetAttrs.members);
            node.expandedIcon = 'fa fa-folder-open';
            node.collapsedIcon = 'fa fa-folder';
            node.expanded = true;
            node.icon = undefined;
            node.type = 'folder';
        }
        else {
            node.icon = 'fa fa-file';
            node.type = 'file';
        }
    }
    refreshHistory(path) {
        const sub = this.mvsSearchHistory
            .saveSearchHistory(path)
            .subscribe(() => {
            if (sub)
                sub.unsubscribe();
        });
    }
    clearSearchHistory() {
        this.mvsSearchHistory.deleteSearchHistory().subscribe();
        this.mvsSearchHistory.onInit(SEARCH_ID);
    }
    /**
    * [levelUp: function to ascend up a level in the file/folder tree]
    * @param index [tree index where the 'folder' parent is accessed]
    */
    levelUp() {
        if (!this.path.includes('.')) {
            this.path = '';
        }
        let regex = new RegExp(/\.[^\.]+$/);
        if (this.path.substr(this.path.length - 2, 2) == '.*') {
            this.path = this.path.replace(regex, '').replace(regex, '.*');
        }
        else {
            this.path = this.path.replace(regex, '.*');
        }
        this.updateTreeView(this.path);
    }
    checkIfInDeletionQueueAndMessage(pathAndName, message) {
        if (this.deletionQueue.has(pathAndName)) {
            this.snackBar.open('Deletion in progress: ' + pathAndName + "' " + message, 'Dismiss', defaultSnackbarOptions);
            return true;
        }
        return false;
    }
    createDatasetDialog(data) {
        const dsCreateConfig = new MatDialogConfig();
        dsCreateConfig.data = {
            data
        };
        dsCreateConfig.maxWidth = '1000px';
        dsCreateConfig.disableClose = true;
        let saveRef = this.dialog.open(CreateDatasetModal, dsCreateConfig);
        saveRef.afterClosed().subscribe(attributes => {
            if (attributes.datasetNameType == 'LIBRARY') {
                attributes.datasetNameType = 'PDSE';
            }
            if (attributes) {
                const datasetAttributes = {
                    ndisp: 'CATALOG',
                    status: 'NEW',
                    space: attributes.allocationUnit,
                    dsorg: attributes.organization,
                    lrecl: parseInt(attributes.recordLength),
                    recfm: attributes.recordFormat,
                    dir: parseInt(attributes.directoryBlocks),
                    prime: parseInt(attributes.primarySpace),
                    secnd: parseInt(attributes.secondarySpace),
                    dsnt: attributes.datasetNameType,
                    close: 'true'
                };
                if (attributes.averageRecordUnit) {
                    datasetAttributes['avgr'] = attributes.averageRecordUnit;
                }
                if (attributes.blockSize) {
                    datasetAttributes['blksz'] = parseInt(attributes.blockSize);
                }
                this.datasetService.createDataset(datasetAttributes, attributes.name).subscribe(resp => {
                    this.snackBar.open(`Dataset: ${attributes.name} created successfully.`, 'Dismiss', quickSnackbarOptions);
                    this.createDataset.emit({ status: 'success', name: attributes.name, org: attributes.organization, initData: dsCreateConfig.data.data });
                }, error => {
                    this.snackBar.open(`Failed to create the dataset: ${error.error}`, 'Dismiss', longSnackbarOptions);
                    this.createDataset.emit({ status: 'error', error: error.error, name: attributes.name });
                });
            }
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FileBrowserMVSComponent, deps: [{ token: i0.ElementRef }, { token: i1.UtilsService }, { token: i2.SearchHistoryService }, { token: i3.MatSnackBar }, { token: i4.DatasetCrudService }, { token: i5.DownloaderService }, { token: i6.MatDialog }, { token: Angular2InjectionTokens.LOGGER }, { token: Angular2InjectionTokens.PLUGIN_DEFINITION }, { token: Angular2InjectionTokens.WINDOW_ACTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: FileBrowserMVSComponent, selector: "file-browser-mvs", inputs: { inputStyle: "inputStyle", searchStyle: "searchStyle", treeStyle: "treeStyle", style: "style", showUpArrow: "showUpArrow" }, outputs: { pathChanged: "pathChanged", dataChanged: "dataChanged", nodeClick: "nodeClick", nodeDblClick: "nodeDblClick", rightClick: "rightClick", deleteClick: "deleteClick", openInNewTab: "openInNewTab", createDataset: "createDataset" }, providers: [DatasetCrudService, /*PersistentDataService,*/ SearchHistoryService], viewQueries: [{ propertyName: "treeComponent", first: true, predicate: TreeComponent, descendants: true }, { propertyName: "searchMVS", first: true, predicate: ["searchMVS"], descendants: true }], ngImport: i0, template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n\n<div style=\"height: 100%\">\n\n  <!-- Tabs, searchbar, and loading indicator -->\n  @if (showUpArrow) {\n  <img [src]=\"'./assets/explorer-uparrow.png'\" data-toggle=\"tooltip\" class=\"filebrowsermvs-pointer-logo\"\n    title=\"Go up to the parent level\" (click)=\"levelUp()\" [ngStyle]=\"treeStyle\" tabindex=\"0\"\n    (keydown.enter)=\"levelUp()\" />\n  }\n\n  <div class=\"filebrowsermvs-search\" [ngStyle]=\"searchStyle\">\n    <div class=\"searchRowFlex\">\n      <input [(ngModel)]=\"path\" list=\"searchMVSHistory\" placeholder=\"Enter a dataset query...\"\n        class=\"filebrowsermvs-search-input\" (keydown.enter)=\"updateTreeView(path);\" [ngStyle]=\"inputStyle\">\n      <!-- TODO: make search history a directive to use in both uss and mvs-->\n      <mat-button-toggle-group id=\"qualGroup\" #group=\"matButtonToggleGroup\">\n        <mat-button-toggle [checked]=\"additionalQualifiers\" class=\"qualButton\"\n          (click)=\"additionalQualifiers = !additionalQualifiers\" aria-label=\"Include additional qualifiers\"\n          title=\"Include Additional Qualifiers\">\n          <strong>.**</strong>\n        </mat-button-toggle>\n      </mat-button-toggle-group>\n      <datalist id=\"searchMVSHistory\">\n        @for (item of mvsSearchHistory.searchHistoryVal; track item) {\n        <option [value]=\"item\"></option>\n        }\n      </datalist>\n    </div>\n  </div>\n\n  <div class=\"fa fa-spinner fa-spin filebrowsermvs-loading-icon\" [hidden]=\"!isLoading\"></div>\n  <div class=\"fa fa-refresh filebrowsermvs-loading-icon\" title=\"Refresh dataset list\" (click)=\"updateTreeView(path);\"\n    [hidden]=\"isLoading\" style=\"margin-left: 9px; cursor: pointer;\"></div>\n  <div class=\"file-tree-utilities\">\n    <div class=\"fa fa-minus-square-o filebrowseruss-collapse-icon\" title=\"Collapse Folders in Explorer\"\n      (click)=\"collapseTree();\" style=\"margin-right: 9px; float:right; cursor: pointer;\"></div>\n    <div class=\"fa fa-trash-o filebrowseruss-delete-icon\" title=\"Delete\" (click)=\"showDeleteDialog(selectedNode);\"\n      style=\"margin-right: 9px; float:right; cursor: pointer;\"></div>\n    <div class=\"fa fa-plus\" title=\"Create new dataset\" (click)=\"createDatasetDialog()\"\n      style=\"margin-right: 9px; float:right; cursor: pointer;\"></div>\n    <div class=\"fa fa-eraser filebrowser-icon special-utility\" title=\"Clear Search History\"\n      (click)=\"clearSearchHistory();\"></div>\n  </div>\n  <!-- Main tree -->\n  <div [hidden]=\"hideExplorer\" style=\"height: 100%;\">\n    <tree-root [treeData]=\"data\" (clickEvent)=\"onNodeClick($event)\" (dblClickEvent)=\"onNodeDblClick($event)\"\n      [style]=\"style\" (rightClickEvent)=\"onNodeRightClick($event)\" (panelRightClickEvent)=\"onPanelRightClick($event)\"\n      (dataChanged)=\"onDataChanged($event)\">\n    </tree-root>\n  </div>\n\n  @if (showSearch) {\n  <div class=\"ui-inputgroup filebrowseruss-search-bottom-group\">\n    <span class=\"ui-inputgroup-addon\"><i class=\"fa fa-search filebrowseruss-search-bottom-icon\"></i></span>\n    <input type=\"text\" pInputText placeholder=\"Search datasets/members by name...\"\n      class=\"filebrowseruss-search-bottom-input\" [formControl]=\"searchCtrl\" #searchMVS>\n  </div>\n  }\n</div>\n<!--\n    This program and the accompanying materials are\n    made available under the terms of the Eclipse Public License v2.0 which accompanies\n    this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n    SPDX-License-Identifier: EPL-2.0\n\n    Copyright Contributors to the Zowe Project.\n    -->", styles: [".searchRowFlex{display:flex;flex-direction:row}.filebrowsermvs-search{width:fit-content;min-width:250px;margin-left:5px;display:inline-block;height:40px}.filebrowsermvs-search-input{width:100%;min-height:30px;font-family:sans-serif;font-size:15px;height:35px;background-color:#464646;color:#fff;padding-left:5px;border:0px;flex-grow:2}.filebrowsermvs-pointer-logo{width:20px;height:20px;filter:brightness(3);cursor:pointer}.ui-tree-empty-message{color:transparent;height:0px}.filebrowsermvs-node-deleting{opacity:.5}#qualGroup{max-height:35px;min-height:30px}.qualButton:not(.mat-button-toggle-checked){background-color:#464646;color:#757575}.file-tree-utilities{overflow:hidden;border:1px solid #464646}.filebrowsermvs-loading-icon{margin-left:8px!important;font-size:large!important}.filebrowser-icon{margin-right:9px;float:right;cursor:pointer}.special-utility{margin-left:9px}\n"], dependencies: [{ kind: "directive", type: i7.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "directive", type: i8.NgSelectOption, selector: "option", inputs: ["ngValue", "value"] }, { kind: "directive", type: i8.ɵNgSelectMultipleOption, selector: "option", inputs: ["ngValue", "value"] }, { kind: "directive", type: i8.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i8.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i8.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i9.MatButtonToggleGroup, selector: "mat-button-toggle-group", inputs: ["appearance", "name", "vertical", "value", "multiple", "disabled", "hideSingleSelectionIndicator", "hideMultipleSelectionIndicator"], outputs: ["valueChange", "change"], exportAs: ["matButtonToggleGroup"] }, { kind: "component", type: i9.MatButtonToggle, selector: "mat-button-toggle", inputs: ["aria-label", "aria-labelledby", "id", "name", "value", "tabIndex", "disableRipple", "appearance", "checked", "disabled"], outputs: ["change"], exportAs: ["matButtonToggle"] }, { kind: "directive", type: i10.InputText, selector: "[pInputText]", inputs: ["variant"] }, { kind: "directive", type: i8.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }, { kind: "component", type: i11.TreeComponent, selector: "tree-root", inputs: ["treeData", "treeId", "style", "treeStyle"], outputs: ["clickEvent", "dblClickEvent", "rightClickEvent", "panelRightClickEvent"] }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FileBrowserMVSComponent, decorators: [{
            type: Component,
            args: [{ selector: 'file-browser-mvs', encapsulation: ViewEncapsulation.None, providers: [DatasetCrudService, /*PersistentDataService,*/ SearchHistoryService], template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n\n<div style=\"height: 100%\">\n\n  <!-- Tabs, searchbar, and loading indicator -->\n  @if (showUpArrow) {\n  <img [src]=\"'./assets/explorer-uparrow.png'\" data-toggle=\"tooltip\" class=\"filebrowsermvs-pointer-logo\"\n    title=\"Go up to the parent level\" (click)=\"levelUp()\" [ngStyle]=\"treeStyle\" tabindex=\"0\"\n    (keydown.enter)=\"levelUp()\" />\n  }\n\n  <div class=\"filebrowsermvs-search\" [ngStyle]=\"searchStyle\">\n    <div class=\"searchRowFlex\">\n      <input [(ngModel)]=\"path\" list=\"searchMVSHistory\" placeholder=\"Enter a dataset query...\"\n        class=\"filebrowsermvs-search-input\" (keydown.enter)=\"updateTreeView(path);\" [ngStyle]=\"inputStyle\">\n      <!-- TODO: make search history a directive to use in both uss and mvs-->\n      <mat-button-toggle-group id=\"qualGroup\" #group=\"matButtonToggleGroup\">\n        <mat-button-toggle [checked]=\"additionalQualifiers\" class=\"qualButton\"\n          (click)=\"additionalQualifiers = !additionalQualifiers\" aria-label=\"Include additional qualifiers\"\n          title=\"Include Additional Qualifiers\">\n          <strong>.**</strong>\n        </mat-button-toggle>\n      </mat-button-toggle-group>\n      <datalist id=\"searchMVSHistory\">\n        @for (item of mvsSearchHistory.searchHistoryVal; track item) {\n        <option [value]=\"item\"></option>\n        }\n      </datalist>\n    </div>\n  </div>\n\n  <div class=\"fa fa-spinner fa-spin filebrowsermvs-loading-icon\" [hidden]=\"!isLoading\"></div>\n  <div class=\"fa fa-refresh filebrowsermvs-loading-icon\" title=\"Refresh dataset list\" (click)=\"updateTreeView(path);\"\n    [hidden]=\"isLoading\" style=\"margin-left: 9px; cursor: pointer;\"></div>\n  <div class=\"file-tree-utilities\">\n    <div class=\"fa fa-minus-square-o filebrowseruss-collapse-icon\" title=\"Collapse Folders in Explorer\"\n      (click)=\"collapseTree();\" style=\"margin-right: 9px; float:right; cursor: pointer;\"></div>\n    <div class=\"fa fa-trash-o filebrowseruss-delete-icon\" title=\"Delete\" (click)=\"showDeleteDialog(selectedNode);\"\n      style=\"margin-right: 9px; float:right; cursor: pointer;\"></div>\n    <div class=\"fa fa-plus\" title=\"Create new dataset\" (click)=\"createDatasetDialog()\"\n      style=\"margin-right: 9px; float:right; cursor: pointer;\"></div>\n    <div class=\"fa fa-eraser filebrowser-icon special-utility\" title=\"Clear Search History\"\n      (click)=\"clearSearchHistory();\"></div>\n  </div>\n  <!-- Main tree -->\n  <div [hidden]=\"hideExplorer\" style=\"height: 100%;\">\n    <tree-root [treeData]=\"data\" (clickEvent)=\"onNodeClick($event)\" (dblClickEvent)=\"onNodeDblClick($event)\"\n      [style]=\"style\" (rightClickEvent)=\"onNodeRightClick($event)\" (panelRightClickEvent)=\"onPanelRightClick($event)\"\n      (dataChanged)=\"onDataChanged($event)\">\n    </tree-root>\n  </div>\n\n  @if (showSearch) {\n  <div class=\"ui-inputgroup filebrowseruss-search-bottom-group\">\n    <span class=\"ui-inputgroup-addon\"><i class=\"fa fa-search filebrowseruss-search-bottom-icon\"></i></span>\n    <input type=\"text\" pInputText placeholder=\"Search datasets/members by name...\"\n      class=\"filebrowseruss-search-bottom-input\" [formControl]=\"searchCtrl\" #searchMVS>\n  </div>\n  }\n</div>\n<!--\n    This program and the accompanying materials are\n    made available under the terms of the Eclipse Public License v2.0 which accompanies\n    this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n    SPDX-License-Identifier: EPL-2.0\n\n    Copyright Contributors to the Zowe Project.\n    -->", styles: [".searchRowFlex{display:flex;flex-direction:row}.filebrowsermvs-search{width:fit-content;min-width:250px;margin-left:5px;display:inline-block;height:40px}.filebrowsermvs-search-input{width:100%;min-height:30px;font-family:sans-serif;font-size:15px;height:35px;background-color:#464646;color:#fff;padding-left:5px;border:0px;flex-grow:2}.filebrowsermvs-pointer-logo{width:20px;height:20px;filter:brightness(3);cursor:pointer}.ui-tree-empty-message{color:transparent;height:0px}.filebrowsermvs-node-deleting{opacity:.5}#qualGroup{max-height:35px;min-height:30px}.qualButton:not(.mat-button-toggle-checked){background-color:#464646;color:#757575}.file-tree-utilities{overflow:hidden;border:1px solid #464646}.filebrowsermvs-loading-icon{margin-left:8px!important;font-size:large!important}.filebrowser-icon{margin-right:9px;float:right;cursor:pointer}.special-utility{margin-left:9px}\n"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.UtilsService }, { type: i2.SearchHistoryService }, { type: i3.MatSnackBar }, { type: i4.DatasetCrudService }, { type: i5.DownloaderService }, { type: i6.MatDialog }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.LOGGER]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.PLUGIN_DEFINITION]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [Angular2InjectionTokens.WINDOW_ACTIONS]
                }] }], propDecorators: { treeComponent: [{
                type: ViewChild,
                args: [TreeComponent]
            }], searchMVS: [{
                type: ViewChild,
                args: ['searchMVS']
            }], inputStyle: [{
                type: Input
            }], searchStyle: [{
                type: Input
            }], treeStyle: [{
                type: Input
            }], style: [{
                type: Input
            }], showUpArrow: [{
                type: Input
            }], pathChanged: [{
                type: Output
            }], dataChanged: [{
                type: Output
            }], nodeClick: [{
                type: Output
            }], nodeDblClick: [{
                type: Output
            }], rightClick: [{
                type: Output
            }], deleteClick: [{
                type: Output
            }], openInNewTab: [{
                type: Output
            }], createDataset: [{
                type: Output
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZWJyb3dzZXJtdnMuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemx1eC1maWxlLWV4cGxvcmVyL3NyYy9saWIvY29tcG9uZW50cy9maWxlYnJvd3Nlcm12cy9maWxlYnJvd3Nlcm12cy5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96bHV4LWZpbGUtZXhwbG9yZXIvc3JjL2xpYi9jb21wb25lbnRzL2ZpbGVicm93c2VybXZzL2ZpbGVicm93c2VybXZzLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBOzs7Ozs7OztFQVFFO0FBR0YsT0FBTyxFQUFFLFNBQVMsRUFBc0IsaUJBQWlCLEVBQWEsS0FBSyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdEosT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFOUQsT0FBTyxFQUFFLHVCQUF1QixFQUFnRCxNQUFNLHFDQUFxQyxDQUFDO0FBRTVILE9BQU8sRUFBYSxlQUFlLEVBQWdCLE1BQU0sMEJBQTBCLENBQUM7QUFFcEYsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sZ0VBQWdFLENBQUM7QUFDeEcsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ25GLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2xILE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU3QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxLQUFLLENBQUMsTUFBTSxRQUFRLENBQUM7QUFFNUIsY0FBYztBQUNk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LGFBQWEseUlDN0QxQix3MUhBNEVPOzsyRkQ1Qk0sdUJBQXVCO2tCQVBuQyxTQUFTOytCQUNFLGtCQUFrQixpQkFFYixpQkFBaUIsQ0FBQyxJQUFJLGFBRTFCLENBQUMsa0JBQWtCLEVBQUUsMEJBQTBCLENBQUMsb0JBQW9CLENBQUM7OzBCQXFEN0UsTUFBTTsyQkFBQyx1QkFBdUIsQ0FBQyxNQUFNOzswQkFDckMsTUFBTTsyQkFBQyx1QkFBdUIsQ0FBQyxpQkFBaUI7OzBCQUNoRCxRQUFROzswQkFBSSxNQUFNOzJCQUFDLHVCQUF1QixDQUFDLGNBQWM7eUNBeEMxQixhQUFhO3NCQUE5QyxTQUFTO3VCQUFDLGFBQWE7Z0JBUU8sU0FBUztzQkFBdkMsU0FBUzt1QkFBQyxXQUFXO2dCQW1EYixVQUFVO3NCQUFsQixLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBQ0csU0FBUztzQkFBakIsS0FBSztnQkFDRyxLQUFLO3NCQUFiLEtBQUs7Z0JBQ0csV0FBVztzQkFBbkIsS0FBSztnQkFHSSxXQUFXO3NCQUFwQixNQUFNO2dCQUNHLFdBQVc7c0JBQXBCLE1BQU07Z0JBQ0csU0FBUztzQkFBbEIsTUFBTTtnQkFDRyxZQUFZO3NCQUFyQixNQUFNO2dCQUNHLFVBQVU7c0JBQW5CLE1BQU07Z0JBQ0csV0FBVztzQkFBcEIsTUFBTTtnQkFDRyxZQUFZO3NCQUFyQixNQUFNO2dCQUNHLGFBQWE7c0JBQXRCLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyJcclxuXHJcbi8qXHJcbiAgVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcclxuICBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEVjbGlwc2UgUHVibGljIExpY2Vuc2UgdjIuMCB3aGljaCBhY2NvbXBhbmllc1xyXG4gIHRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MjAuaHRtbFxyXG4gIFxyXG4gIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBFUEwtMi4wXHJcbiAgXHJcbiAgQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxyXG4qL1xyXG5cclxuXHJcbmltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgT25Jbml0LCBWaWV3RW5jYXBzdWxhdGlvbiwgT25EZXN0cm95LCBJbnB1dCwgRXZlbnRFbWl0dGVyLCBPdXRwdXQsIEluamVjdCwgT3B0aW9uYWwsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyB0YWtlLCBmaW5hbGl6ZSwgZGVib3VuY2VUaW1lIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBQcm9qZWN0U3RydWN0dXJlLCBEYXRhc2V0QXR0cmlidXRlcywgTWVtYmVyIH0gZnJvbSAnLi4vLi4vc3RydWN0dXJlcy9lZGl0b3ItcHJvamVjdCc7XHJcbmltcG9ydCB7IEFuZ3VsYXIySW5qZWN0aW9uVG9rZW5zLCBBbmd1bGFyMlBsdWdpbldpbmRvd0FjdGlvbnMsIENvbnRleHRNZW51SXRlbSB9IGZyb20gJy4uLy4uLy4uL3BsdWdpbmxpYi9pbmplY3QtcmVzb3VyY2VzJztcclxuaW1wb3J0IHsgRG93bmxvYWRlclNlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9kb3dubG9hZGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBNYXREaWFsb2csIE1hdERpYWxvZ0NvbmZpZywgTWF0RGlhbG9nUmVmIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGlhbG9nJztcclxuaW1wb3J0IHsgTWF0U25hY2tCYXIgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9zbmFjay1iYXInO1xyXG5pbXBvcnQgeyBEYXRhc2V0UHJvcGVydGllc01vZGFsIH0gZnJvbSAnLi4vZGF0YXNldC1wcm9wZXJ0aWVzLW1vZGFsL2RhdGFzZXQtcHJvcGVydGllcy1tb2RhbC5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBEZWxldGVGaWxlTW9kYWwgfSBmcm9tICcuLi9kZWxldGUtZmlsZS1tb2RhbC9kZWxldGUtZmlsZS1tb2RhbC5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBkZWZhdWx0U25hY2tiYXJPcHRpb25zLCBsb25nU25hY2tiYXJPcHRpb25zLCBxdWlja1NuYWNrYmFyT3B0aW9ucyB9IGZyb20gJy4uLy4uL3NoYXJlZC9zbmFja2Jhci1vcHRpb25zJztcclxuaW1wb3J0IHsgRm9ybUNvbnRyb2wgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XHJcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBUcmVlQ29tcG9uZW50IH0gZnJvbSAnLi4vdHJlZS90cmVlLmNvbXBvbmVudCc7XHJcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcclxuXHJcbi8qIFNlcnZpY2VzICovXHJcbmltcG9ydCB7IFNlYXJjaEhpc3RvcnlTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvc2VhcmNoSGlzdG9yeVNlcnZpY2UnO1xyXG5pbXBvcnQgeyBVdGlsc1NlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy91dGlscy5zZXJ2aWNlJztcclxuaW1wb3J0IHsgRGF0YXNldENydWRTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvZGF0YXNldC5jcnVkLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBDcmVhdGVEYXRhc2V0TW9kYWwgfSBmcm9tICcuLi9jcmVhdGUtZGF0YXNldC1tb2RhbC9jcmVhdGUtZGF0YXNldC1tb2RhbC5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBUcmVlTm9kZSB9IGZyb20gJ3ByaW1lbmcvYXBpJztcclxuLyogVE9ETzogcmUtaW1wbGVtZW50IHRvIGFkZCBmZXRjaGluZyBvZiBwcmV2aW91c2x5IG9wZW5lZCB0cmVlIHZpZXcgZGF0YVxyXG5pbXBvcnQgeyBQZXJzaXN0ZW50RGF0YVNlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9wZXJzaXN0ZW50RGF0YS5zZXJ2aWNlJzsgKi9cclxuXHJcbi8vIFVzZWQgZm9yIERTIGFzeW5jIGRlbGV0aW9uIFVYXHJcbmNvbnN0IENTU19OT0RFX0RFTEVUSU5HID0gXCJmaWxlYnJvd3Nlcm12cy1ub2RlLWRlbGV0aW5nXCI7XHJcbmNvbnN0IFNFQVJDSF9JRCA9ICdtdnMnO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICdmaWxlLWJyb3dzZXItbXZzJyxcclxuICB0ZW1wbGF0ZVVybDogJy4vZmlsZWJyb3dzZXJtdnMuY29tcG9uZW50Lmh0bWwnLFxyXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXHJcbiAgc3R5bGVVcmxzOiBbJy4vZmlsZWJyb3dzZXJtdnMuY29tcG9uZW50LmNzcyddLFxyXG4gIHByb3ZpZGVyczogW0RhdGFzZXRDcnVkU2VydmljZSwgLypQZXJzaXN0ZW50RGF0YVNlcnZpY2UsKi8gU2VhcmNoSGlzdG9yeVNlcnZpY2VdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBGaWxlQnJvd3Nlck1WU0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcclxuXHJcbiAgLyogVE9ETzogTGVnYWN5LCBjYXBhYmlsaXRpZXMgY29kZSAodW51c2VkIGZvciBub3cpICovXHJcbiAgLy9JRmlsZUJyb3dzZXJNVlMsXHJcbiAgLy9jb21wb25lbnRDbGFzczpDb21wb25lbnRDbGFzcztcclxuICAvL2ZpbGVTZWxlY3RlZDogU3ViamVjdDxGaWxlQnJvd3NlckZpbGVTZWxlY3RlZEV2ZW50PjtcclxuICAvL2NhcGFiaWxpdGllczpBcnJheTxDYXBhYmlsaXR5PjtcclxuXHJcbiAgLyogVE9ETzogRmV0Y2hpbmcgdXBkYXRlcyBmb3IgYXV0b21hdGljIHJlZnJlc2ggKGRpc2FibGVkIGZvciBub3cpICovXHJcbiAgLy8gcHJpdmF0ZSBpbnRlcnZhbElkOiBhbnk7XHJcbiAgLy8gcHJpdmF0ZSB1cGRhdGVJbnRlcnZhbDogbnVtYmVyID0gMzAwMDAwMDtcclxuXHJcbiAgLyogVHJlZSBVSSBhbmQgbW9kYWxzICovXHJcbiAgQFZpZXdDaGlsZChUcmVlQ29tcG9uZW50KSBwcml2YXRlIHRyZWVDb21wb25lbnQ6IFRyZWVDb21wb25lbnQ7XHJcbiAgcHVibGljIGhpZGVFeHBsb3JlcjogYm9vbGVhbjtcclxuICBwcml2YXRlIHJpZ2h0Q2xpY2tQcm9wZXJ0aWVzUGFuZWw6IENvbnRleHRNZW51SXRlbVtdO1xyXG4gIHB1YmxpYyBpc0xvYWRpbmc6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSByaWdodENsaWNrUHJvcGVydGllc0RhdGFzZXRGaWxlOiBDb250ZXh0TWVudUl0ZW1bXTtcclxuICBwcml2YXRlIHJpZ2h0Q2xpY2tQcm9wZXJ0aWVzRGF0YXNldEZvbGRlcjogQ29udGV4dE1lbnVJdGVtW107XHJcblxyXG4gIC8qIFF1aWNrIHNlYXJjaCAoQWx0ICsgUCkgc3R1ZmYgKi9cclxuICBAVmlld0NoaWxkKCdzZWFyY2hNVlMnKSBwdWJsaWMgc2VhcmNoTVZTOiBFbGVtZW50UmVmO1xyXG4gIHNlYXJjaEN0cmw6IGFueTtcclxuICBwcml2YXRlIHNlYXJjaFZhbHVlU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XHJcbiAgcHVibGljIHNob3dTZWFyY2g6IGJvb2xlYW47XHJcblxyXG4gIC8qIERhdGEgYW5kIG5hdmlnYXRpb24gKi9cclxuICBwdWJsaWMgcGF0aDogc3RyaW5nO1xyXG4gIHB1YmxpYyBzZWxlY3RlZE5vZGU6IGFueTtcclxuICAvL1RPRE86IERlZmluZSBpbnRlcmZhY2UgdHlwZXMgZm9yIG12cy1kYXRhL2RhdGFcclxuICBwdWJsaWMgZGF0YTogYW55OyAvL01haW4gZGF0YSBkaXNwbGF5ZWQgaW4gdGhlIHZpc3VhbCB0cmVlIGFzIG5vZGVzXHJcbiAgcHJpdmF0ZSBkYXRhQ2FjaGVkOiBhbnk7ICAvLyBVc2VkIGZvciBmaWx0ZXJpbmcgYWdhaW5zdCBxdWljayBzZWFyY2hcclxuICBwcml2YXRlIHJpZ2h0Q2xpY2tlZEZpbGU6IGFueTtcclxuICAvL1RPRE86IE1heSBub3QgbmVlZGVkIGFueW1vcmU/IChtYXkgbmVlZCByZXBsYWNpbmcgdy8gcmlnaHRDbGlja2VkRmlsZSlcclxuICBwcml2YXRlIHJpZ2h0Q2xpY2tlZEV2ZW50OiBhbnk7XHJcbiAgcHJpdmF0ZSBkZWxldGlvblF1ZXVlID0gbmV3IE1hcCgpOyAvL0RTIGRlbGV0aW9uIGlzIGFzeW5jLCBzbyBxdWV1ZSBpcyB1c2VkXHJcbiAgcHJpdmF0ZSBkZWxldGVTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcclxuICAvL1RPRE86IE1heSBub3QgbmVlZGVkIGFueW1vcmU/IChjb3VsZCBiZSBjbGVhbmVkIHVwIGludG8gZGVsZXRlU3Vic2NyaXB0aW9uKVxyXG4gIHByaXZhdGUgZGVsZXRlVnNhbVN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xyXG4gIC8vVE9ETzogTWF5IG5vdCBuZWVkZWQgYW55bW9yZT8gKGNvdWxkIGJlIGNsZWFuZWQgdXAgaW50byBkZWxldGVTdWJzY3JpcHRpb24pXHJcbiAgcHJpdmF0ZSBkZWxldGVOb25Wc2FtU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XHJcbiAgcHVibGljIGFkZGl0aW9uYWxRdWFsaWZpZXJzOiBib29sZWFuO1xyXG5cclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxyXG4gICAgcHJpdmF0ZSB1dGlsczogVXRpbHNTZXJ2aWNlLFxyXG4gICAgcHVibGljIG12c1NlYXJjaEhpc3Rvcnk6IFNlYXJjaEhpc3RvcnlTZXJ2aWNlLFxyXG4gICAgcHVibGljIHNuYWNrQmFyOiBNYXRTbmFja0JhcixcclxuICAgIHB1YmxpYyBkYXRhc2V0U2VydmljZTogRGF0YXNldENydWRTZXJ2aWNlLFxyXG4gICAgcHVibGljIGRvd25sb2FkU2VydmljZTogRG93bmxvYWRlclNlcnZpY2UsXHJcbiAgICBwdWJsaWMgZGlhbG9nOiBNYXREaWFsb2csXHJcbiAgICBASW5qZWN0KEFuZ3VsYXIySW5qZWN0aW9uVG9rZW5zLkxPR0dFUikgcHJpdmF0ZSBsb2c6IFpMVVguQ29tcG9uZW50TG9nZ2VyLFxyXG4gICAgQEluamVjdChBbmd1bGFyMkluamVjdGlvblRva2Vucy5QTFVHSU5fREVGSU5JVElPTikgcHJpdmF0ZSBwbHVnaW5EZWZpbml0aW9uOiBaTFVYLkNvbnRhaW5lclBsdWdpbkRlZmluaXRpb24sXHJcbiAgICBAT3B0aW9uYWwoKSBASW5qZWN0KEFuZ3VsYXIySW5qZWN0aW9uVG9rZW5zLldJTkRPV19BQ1RJT05TKSBwcml2YXRlIHdpbmRvd0FjdGlvbnM6IEFuZ3VsYXIyUGx1Z2luV2luZG93QWN0aW9uc1xyXG4gICkge1xyXG4gICAgLyogVE9ETzogTGVnYWN5LCBjYXBhYmlsaXRpZXMgY29kZSAodW51c2VkIGZvciBub3cpICovXHJcbiAgICAvL3RoaXMuY29tcG9uZW50Q2xhc3MgPSBDb21wb25lbnRDbGFzcy5GaWxlQnJvd3NlcjtcclxuICAgIC8vdGhpcy5pbml0YWxpemVDYXBhYmlsaXRpZXMoKTtcclxuICAgIHRoaXMubXZzU2VhcmNoSGlzdG9yeS5vbkluaXQoU0VBUkNIX0lEKTtcclxuICAgIHRoaXMucGF0aCA9IFwiXCI7XHJcbiAgICB0aGlzLmhpZGVFeHBsb3JlciA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuYWRkaXRpb25hbFF1YWxpZmllcnMgPSB0cnVlO1xyXG4gICAgdGhpcy5zaG93U2VhcmNoID0gZmFsc2U7XHJcbiAgICB0aGlzLnNlYXJjaEN0cmwgPSBuZXcgRm9ybUNvbnRyb2woKTtcclxuICAgIHRoaXMuc2VhcmNoVmFsdWVTdWJzY3JpcHRpb24gPSB0aGlzLnNlYXJjaEN0cmwudmFsdWVDaGFuZ2VzLnBpcGUoXHJcbiAgICAgIGRlYm91bmNlVGltZSg1MDApLCAvLyBCeSBkZWZhdWx0LCA1MDAgbXMgdW50aWwgdXNlciBpbnB1dCwgZm9yIHF1aWNrIHNlYXJjaCB0byB1cGRhdGUgcmVzdWx0c1xyXG4gICAgKS5zdWJzY3JpYmUoKHZhbHVlKSA9PiB7IHRoaXMuc2VhcmNoSW5wdXRDaGFuZ2VkKHZhbHVlKSB9KTtcclxuICAgIHRoaXMuc2VsZWN0ZWROb2RlID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qIEN1c3RvbWl6ZWFibGUgdHJlZSBzdHlsZXMgKi9cclxuICBASW5wdXQoKSBpbnB1dFN0eWxlOiBhbnk7XHJcbiAgQElucHV0KCkgc2VhcmNoU3R5bGU6IGFueTtcclxuICBASW5wdXQoKSB0cmVlU3R5bGU6IGFueTtcclxuICBASW5wdXQoKSBzdHlsZTogYW55O1xyXG4gIEBJbnB1dCgpIHNob3dVcEFycm93OiBib29sZWFuO1xyXG5cclxuICAvKiBUcmVlIG91dGdvaW5nIGV2ZW50cyAqL1xyXG4gIEBPdXRwdXQoKSBwYXRoQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgZGF0YUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIG5vZGVDbGljazogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgbm9kZURibENsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSByaWdodENsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSBkZWxldGVDbGljazogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgb3BlbkluTmV3VGFiOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSBjcmVhdGVEYXRhc2V0ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcblxyXG4gIG5nT25Jbml0KCkge1xyXG4gICAgLy8gVE9ETzogRmV0Y2hpbmcgdXBkYXRlcyBmb3IgYXV0b21hdGljIHJlZnJlc2ggKGRpc2FibGVkIGZvciBub3cpXHJcbiAgICAvLyB0aGlzLmludGVydmFsSWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAvLyAgIGlmKHRoaXMuZGF0YSl7XHJcbiAgICAvLyAgICAgdGhpcy5nZXRUcmVlRm9yUXVlcnlBc3luYyh0aGlzLnBhdGgpLnRoZW4oKHJlc3BvbnNlOiBhbnkpID0+IHtcclxuICAgIC8vICAgICAgIGxldCBuZXdEYXRhID0gcmVzcG9uc2U7XHJcbiAgICAvLyAgICAgICB0aGlzLnVwZGF0ZVRyZWVEYXRhKHRoaXMuZGF0YSwgbmV3RGF0YSk7XHJcblxyXG4gICAgLy8gICAgICAgaWYgKHRoaXMuc2hvd1NlYXJjaCkge1xyXG4gICAgLy8gICAgICAgICBpZiAodGhpcy5kYXRhQ2FjaGVkKSB7XHJcbiAgICAvLyAgICAgICAgICAgdGhpcy51cGRhdGVUcmVlRGF0YSh0aGlzLmRhdGFDYWNoZWQsIG5ld0RhdGEpO1xyXG4gICAgLy8gICAgICAgICB9XHJcbiAgICAvLyAgICAgICB9XHJcbiAgICAvLyAgICAgICAvKiBXZSBkb24ndCB1cGRhdGUgc2VhcmNoIGhpc3RvcnksIG5vciBlbWl0IHBhdGggY2hhbmdlZCBldmVudCwgYmVjYXVzZSB0aGlzIG1ldGhvZCBpcyBtZWFudFxyXG4gICAgLy8gICAgICAgdG8gYmUgYSBmZXRjaGVkIHVwZGF0ZSwgbm90IGEgdXNlciBhY3Rpb24gbmV3IHBhdGggKi9cclxuICAgIC8vICAgICB9KTtcclxuICAgIC8vICAgfVxyXG4gICAgLy8gfSwgdGhpcy51cGRhdGVJbnRlcnZhbCk7XHJcbiAgICB0aGlzLmluaXRpYWxpemVSaWdodENsaWNrUHJvcGVydGllcygpO1xyXG4gIH1cclxuXHJcbiAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICBpZiAodGhpcy5zZWFyY2hWYWx1ZVN1YnNjcmlwdGlvbikge1xyXG4gICAgICB0aGlzLnNlYXJjaFZhbHVlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5kZWxldGVTdWJzY3JpcHRpb24pIHtcclxuICAgICAgdGhpcy5kZWxldGVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLmRlbGV0ZU5vblZzYW1TdWJzY3JpcHRpb24pIHtcclxuICAgICAgdGhpcy5kZWxldGVOb25Wc2FtU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5kZWxldGVWc2FtU3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgIHRoaXMuZGVsZXRlVnNhbVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgfVxyXG4gICAgLy8gVE9ETzogRmV0Y2hpbmcgdXBkYXRlcyBmb3IgYXV0b21hdGljIHJlZnJlc2ggKGRpc2FibGVkIGZvciBub3cpXHJcbiAgICAvLyBpZiAodGhpcy5pbnRlcnZhbElkKSB7XHJcbiAgICAvLyAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElkKTtcclxuICAgIC8vIH1cclxuICB9XHJcblxyXG4gIC8vIFVwZGF0ZXMgdGhlICdkYXRhJyBhcnJheSB3aXRoIG5ldyBkYXRhLCBwcmVzZXJ2aW5nIGV4aXN0aW5nIGV4cGFuZGVkIGRhdGFzZXRzXHJcbiAgdXBkYXRlVHJlZURhdGEoZGVzdGluYXRpb25EYXRhOiBhbnksIG5ld0RhdGE6IGFueSkge1xyXG4gICAgLy9Pbmx5IHVwZGF0ZSBpZiBkYXRhIHNldHMgYXJlIGFkZGVkL3JlbW92ZWRcclxuICAgIC8vIFRPRE86IEFkZCBhIG1vcmUgaW4tZGVwdGggY2hlY2sgZm9yIERTIHVwZGF0ZXMgKGNoZWNrIERTIHByb3BlcnRpZXMgdG9vPylcclxuICAgIGlmIChkZXN0aW5hdGlvbkRhdGEubGVuZ3RoICE9IG5ld0RhdGEubGVuZ3RoKSB7XHJcbiAgICAgIHRoaXMubG9nLmRlYnVnKFwiQ2hhbmdlIGluIGRhdGFzZXQgY291bnQgZGV0ZWN0ZWQuIFVwZGF0aW5nIHRyZWUuLi5cIik7XHJcbiAgICAgIGxldCBleHBhbmRlZEZvbGRlcnMgPSBkZXN0aW5hdGlvbkRhdGEuZmlsdGVyKGRhdGFPYmogPT4gZGF0YU9iai5leHBhbmRlZCk7XHJcbiAgICAgIC8vY2hlY2tzIGlmIHRoZSBxdWVyeSByZXNwb25zZSBjb250YWlucyB0aGUgc2FtZSBQRFMnIHRoYXQgYXJlIGN1cnJlbnRseSBleHBhbmRlZFxyXG4gICAgICBsZXQgbmV3RGF0YUhhc0V4cGFuZGVkID0gbmV3RGF0YS5maWx0ZXIoZGF0YU9iaiA9PiBleHBhbmRlZEZvbGRlcnMuc29tZShleHBhbmRlZCA9PiBleHBhbmRlZC5sYWJlbCA9PT0gZGF0YU9iai5sYWJlbCkpO1xyXG4gICAgICAvL0tlZXAgY3VycmVudGx5IGV4cGFuZGVkIGRhdGFzZXRzIGV4cGFuZGVkIGFmdGVyIHVwZGF0ZVxyXG4gICAgICBpZiAobmV3RGF0YUhhc0V4cGFuZGVkLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBsZXQgZXhwYW5kZWROZXdEYXRhID0gbmV3RGF0YS5tYXAoKG9iaikgPT4ge1xyXG4gICAgICAgICAgbGV0IHJldE9iaiA9IHt9O1xyXG4gICAgICAgICAgbmV3RGF0YUhhc0V4cGFuZGVkLmZvckVhY2goKGV4cGFuZGVkT2JqKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChvYmoubGFiZWwgPT0gZXhwYW5kZWRPYmoubGFiZWwpIHtcclxuICAgICAgICAgICAgICBvYmouZXhwYW5kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldE9iaiA9IG9iajtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICByZXR1cm4gcmV0T2JqO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgZGVzdGluYXRpb25EYXRhID0gZXhwYW5kZWROZXdEYXRhO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGRlc3RpbmF0aW9uRGF0YSA9IG5ld0RhdGE7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qIFRPRE86IExlZ2FjeSwgY2FwYWJpbGl0aWVzIGNvZGUgKHVudXNlZCBmb3Igbm93KSAqL1xyXG4gIC8qaW5pdGFsaXplQ2FwYWJpbGl0aWVzKCl7XHJcbiAgICB0aGlzLmNhcGFiaWxpdGllcyA9IG5ldyBBcnJheTxDYXBhYmlsaXR5PigpO1xyXG4gICAgdGhpcy5jYXBhYmlsaXRpZXMucHVzaChGaWxlQnJvd3NlckNhcGFiaWxpdGllcy5GaWxlQnJvd3Nlcik7XHJcbiAgICB0aGlzLmNhcGFiaWxpdGllcy5wdXNoKEZpbGVCcm93c2VyQ2FwYWJpbGl0aWVzLkZpbGVCcm93c2VyTVZTKTtcclxuICB9Ki9cclxuXHJcbiAgaW5pdGlhbGl6ZVJpZ2h0Q2xpY2tQcm9wZXJ0aWVzKCkge1xyXG4gICAgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc0RhdGFzZXRGaWxlID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJSZXF1ZXN0IE9wZW4gaW4gTmV3IEJyb3dzZXIgVGFiXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5vcGVuSW5OZXdUYWIuZW1pdCh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiQ29weSBMaW5rXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5jb3B5TGluayh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiUHJvcGVydGllc1wiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2hvd1Byb3BlcnRpZXNEaWFsb2codGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIkRlbGV0ZVwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2hvd0RlbGV0ZURpYWxvZyh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiRG93bmxvYWRcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmF0dGVtcHREb3dubG9hZCh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgXTtcclxuICAgIHRoaXMucmlnaHRDbGlja1Byb3BlcnRpZXNEYXRhc2V0Rm9sZGVyID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJDb3B5IExpbmtcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmNvcHlMaW5rKHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJQcm9wZXJ0aWVzXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5zaG93UHJvcGVydGllc0RpYWxvZyh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiRGVsZXRlXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5zaG93RGVsZXRlRGlhbG9nKHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICBdO1xyXG4gICAgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc1BhbmVsID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJTaG93L0hpZGUgU2VhcmNoXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy50b2dnbGVTZWFyY2goKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIF07XHJcbiAgfVxyXG5cclxuICBzaG93RGVsZXRlRGlhbG9nKHJpZ2h0Q2xpY2tlZEZpbGU6IGFueSkge1xyXG4gICAgaWYgKHRoaXMuY2hlY2tJZkluRGVsZXRpb25RdWV1ZUFuZE1lc3NhZ2UocmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGgsIFwiVGhpcyBpcyBhbHJlYWR5IGJlaW5nIGRlbGV0ZWQuXCIpID09IHRydWUpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZpbGVEZWxldGVDb25maWcgPSBuZXcgTWF0RGlhbG9nQ29uZmlnKCk7XHJcbiAgICBmaWxlRGVsZXRlQ29uZmlnLmRhdGEgPSB7XHJcbiAgICAgIGV2ZW50OiByaWdodENsaWNrZWRGaWxlLFxyXG4gICAgICB3aWR0aDogJzYwMHB4J1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBmaWxlRGVsZXRlUmVmOiBNYXREaWFsb2dSZWY8RGVsZXRlRmlsZU1vZGFsPiA9IHRoaXMuZGlhbG9nLm9wZW4oRGVsZXRlRmlsZU1vZGFsLCBmaWxlRGVsZXRlQ29uZmlnKTtcclxuICAgIHRoaXMuZGVsZXRlU3Vic2NyaXB0aW9uID0gZmlsZURlbGV0ZVJlZi5jb21wb25lbnRJbnN0YW5jZS5vbkRlbGV0ZS5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICBsZXQgdnNhbUNTSVR5cGVzID0gWydSJywgJ0QnLCAnRycsICdJJywgJ0MnXTtcclxuICAgICAgaWYgKHZzYW1DU0lUeXBlcy5pbmRleE9mKHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5kYXRhc2V0QXR0cnMuY3NpRW50cnlUeXBlKSAhPSAtMSkge1xyXG4gICAgICAgIHRoaXMuZGVsZXRlVnNhbURhdGFzZXQocmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5kZWxldGVOb25Wc2FtRGF0YXNldChyaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBkZWxldGVOb25Wc2FtRGF0YXNldChyaWdodENsaWNrZWRGaWxlOiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgIHRoaXMuZGVsZXRpb25RdWV1ZS5zZXQocmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGgsIHJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgcmlnaHRDbGlja2VkRmlsZS5zdHlsZUNsYXNzID0gQ1NTX05PREVfREVMRVRJTkc7XHJcbiAgICB0aGlzLmRlbGV0ZU5vblZzYW1TdWJzY3JpcHRpb24gPSB0aGlzLmRhdGFzZXRTZXJ2aWNlLmRlbGV0ZU5vblZzYW1EYXRhc2V0T3JNZW1iZXIocmlnaHRDbGlja2VkRmlsZSlcclxuICAgICAgLnN1YnNjcmliZShcclxuICAgICAgICByZXNwID0+IHtcclxuICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4ocmVzcC5tc2csXHJcbiAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICB0aGlzLnJlbW92ZUNoaWxkKHJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICAgICAgdGhpcy5kZWxldGlvblF1ZXVlLmRlbGV0ZShyaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aCk7XHJcbiAgICAgICAgICByaWdodENsaWNrZWRGaWxlLnN0eWxlQ2xhc3MgPSBcIlwiO1xyXG4gICAgICAgICAgdGhpcy5kZWxldGVDbGljay5lbWl0KHRoaXMucmlnaHRDbGlja2VkRXZlbnQubm9kZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlcnJvciA9PiB7XHJcbiAgICAgICAgICBpZiAoZXJyb3Iuc3RhdHVzID09ICc1MDAnKSB7IC8vSW50ZXJuYWwgU2VydmVyIEVycm9yXHJcbiAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkZhaWxlZCB0byBkZWxldGU6ICdcIiArIHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoICsgXCInIFRoaXMgaXMgcHJvYmFibHkgZHVlIHRvIGEgc2VydmVyIGFnZW50IHByb2JsZW0uXCIsXHJcbiAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDQnKSB7IC8vTm90IEZvdW5kXHJcbiAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihyaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aCArICcgaGFzIGFscmVhZHkgYmVlbiBkZWxldGVkIG9yIGRvZXMgbm90IGV4aXN0LicsXHJcbiAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVDaGlsZChyaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDAnKSB7IC8vQmFkIFJlcXVlc3RcclxuICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiRmFpbGVkIHRvIGRlbGV0ZSAnXCIgKyByaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aCArIFwiJyBUaGlzIGlzIHByb2JhYmx5IGR1ZSB0byBhIHBlcm1pc3Npb24gcHJvYmxlbS5cIixcclxuICAgICAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgfSBlbHNlIHsgLy9Vbmtub3duXHJcbiAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIlVua25vd24gZXJyb3IgJ1wiICsgZXJyb3Iuc3RhdHVzICsgXCInIG9jY3VycmVkIGZvcjogXCIgKyByaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aCxcclxuICAgICAgICAgICAgICAnRGlzbWlzcycsIGxvbmdTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgICAvLyBFcnJvciBpbmZvIGdldHMgcHJpbnRlZCBpbiB1c3MuY3J1ZC5zZXJ2aWNlLnRzXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmRlbGV0aW9uUXVldWUuZGVsZXRlKHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoKTtcclxuICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICByaWdodENsaWNrZWRGaWxlLnN0eWxlQ2xhc3MgPSBcIlwiO1xyXG4gICAgICAgICAgdGhpcy5sb2cuc2V2ZXJlKGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcblxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmICh0aGlzLmRlbGV0ZU5vblZzYW1TdWJzY3JpcHRpb24uY2xvc2VkID09IGZhbHNlKSB7XHJcbiAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKCdEZWxldGluZyAnICsgcmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGggKyAnLi4uIExhcmdlciBwYXlsb2FkcyBtYXkgdGFrZSBsb25nZXIuIFBsZWFzZSBiZSBwYXRpZW50LicsXHJcbiAgICAgICAgICAnRGlzbWlzcycsIHF1aWNrU25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgfVxyXG4gICAgfSwgNDAwMCk7XHJcbiAgfVxyXG5cclxuICBkZWxldGVWc2FtRGF0YXNldChyaWdodENsaWNrZWRGaWxlOiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgIHRoaXMuZGVsZXRpb25RdWV1ZS5zZXQocmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGgsIHJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgcmlnaHRDbGlja2VkRmlsZS5zdHlsZUNsYXNzID0gQ1NTX05PREVfREVMRVRJTkc7XHJcbiAgICB0aGlzLmRlbGV0ZVZzYW1TdWJzY3JpcHRpb24gPSB0aGlzLmRhdGFzZXRTZXJ2aWNlLmRlbGV0ZVZzYW1EYXRhc2V0KHJpZ2h0Q2xpY2tlZEZpbGUpXHJcbiAgICAgIC5zdWJzY3JpYmUoXHJcbiAgICAgICAgcmVzcCA9PiB7XHJcbiAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKHJlc3AubXNnLFxyXG4gICAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgLy9VcGRhdGUgdnMgcmVtb3Zpbmcgbm9kZSBzaW5jZSBzeW1ib2xpY2x5IGxpbmtlZCBkYXRhL2luZGV4IG9mIHZzYW0gY2FuIGJlIG5hbWVkIGFueXRoaW5nXHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZVRyZWVWaWV3KHRoaXMucGF0aCk7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0aW9uUXVldWUuZGVsZXRlKHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoKTtcclxuICAgICAgICAgIHJpZ2h0Q2xpY2tlZEZpbGUuc3R5bGVDbGFzcyA9IFwiXCI7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0ZUNsaWNrLmVtaXQodGhpcy5yaWdodENsaWNrZWRFdmVudC5ub2RlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVycm9yID0+IHtcclxuICAgICAgICAgIGlmIChlcnJvci5zdGF0dXMgPT0gJzUwMCcpIHsgLy9JbnRlcm5hbCBTZXJ2ZXIgRXJyb3JcclxuICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiRmFpbGVkIHRvIGRlbGV0ZTogJ1wiICsgcmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGggKyBcIicgVGhpcyBpcyBwcm9iYWJseSBkdWUgdG8gYSBzZXJ2ZXIgYWdlbnQgcHJvYmxlbS5cIixcclxuICAgICAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5zdGF0dXMgPT0gJzQwNCcpIHsgLy9Ob3QgRm91bmRcclxuICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoICsgJyBoYXMgYWxyZWFkeSBiZWVuIGRlbGV0ZWQgb3IgZG9lcyBub3QgZXhpc3QuJyxcclxuICAgICAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRyZWVWaWV3KHRoaXMucGF0aCk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnN0YXR1cyA9PSAnNDAwJykgeyAvL0JhZCBSZXF1ZXN0XHJcbiAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkZhaWxlZCB0byBkZWxldGUgJ1wiICsgcmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGggKyBcIicgVGhpcyBpcyBwcm9iYWJseSBkdWUgdG8gYSBwZXJtaXNzaW9uIHByb2JsZW0uXCIsXHJcbiAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDMnKSB7IC8vQmFkIFJlcXVlc3RcclxuICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiRmFpbGVkIHRvIGRlbGV0ZSAnXCIgKyByaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aCArIFwiJ1wiICsgXCIuIFwiICsgSlNPTi5wYXJzZShlcnJvci5fYm9keSlbJ21zZyddLFxyXG4gICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICB9IGVsc2UgeyAvL1Vua25vd25cclxuICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiVW5rbm93biBlcnJvciAnXCIgKyBlcnJvci5zdGF0dXMgKyBcIicgb2NjdXJyZWQgZm9yOiBcIiArIHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoLFxyXG4gICAgICAgICAgICAgICdEaXNtaXNzJywgbG9uZ1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIC8vRXJyb3IgaW5mbyBnZXRzIHByaW50ZWQgaW4gdXNzLmNydWQuc2VydmljZS50c1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5kZWxldGlvblF1ZXVlLmRlbGV0ZShyaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aCk7XHJcbiAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgcmlnaHRDbGlja2VkRmlsZS5zdHlsZUNsYXNzID0gXCJcIjtcclxuICAgICAgICAgIHRoaXMubG9nLnNldmVyZShlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG5cclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5kZWxldGVWc2FtU3Vic2NyaXB0aW9uLmNsb3NlZCA9PSBmYWxzZSkge1xyXG4gICAgICAgIHRoaXMuc25hY2tCYXIub3BlbignRGVsZXRpbmcgJyArIHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoICsgJy4uLiBMYXJnZXIgcGF5bG9hZHMgbWF5IHRha2UgbG9uZ2VyLiBQbGVhc2UgYmUgcGF0aWVudC4nLFxyXG4gICAgICAgICAgJ0Rpc21pc3MnLCBxdWlja1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgIH1cclxuICAgIH0sIDQwMDApO1xyXG4gIH1cclxuXHJcbiAgcmVtb3ZlQ2hpbGQobm9kZTogYW55KSB7XHJcbiAgICBsZXQgbm9kZXMgPSB0aGlzLmRhdGE7XHJcbiAgICBpZiAobm9kZS5wYXJlbnQpIHtcclxuICAgICAgbGV0IHBhcmVudCA9IG5vZGUucGFyZW50O1xyXG4gICAgICBsZXQgaW5kZXggPSBwYXJlbnQuY2hpbGRyZW4uaW5kZXhPZihub2RlKTtcclxuICAgICAgaWYgKGluZGV4ID09IC0xKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHBhcmVudC5jaGlsZHJlbi5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIG5vZGVzW25vZGVzLmluZGV4T2Yobm9kZS5wYXJlbnQpXSA9IHBhcmVudDtcclxuICAgICAgICB0aGlzLmRhdGEgPSBub2RlcztcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbGV0IGluZGV4ID0gbm9kZXMuaW5kZXhPZihub2RlKTtcclxuICAgICAgaWYgKGluZGV4ID09IC0xKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIG5vZGVzLnNwbGljZShub2Rlcy5pbmRleE9mKG5vZGUpLCAxKTtcclxuICAgICAgICB0aGlzLmRhdGEgPSBub2RlcztcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnNob3dTZWFyY2gpIHsgLy8gSWYgd2UgcmVtb3ZlIGEgbm9kZSwgd2UgbmVlZCB0byB1cGRhdGUgaXQgaW4gc2VhcmNoIGJhciBjYWNoZVxyXG4gICAgICBsZXQgbm9kZURhdGFDYWNoZWQgPSB0aGlzLmZpbmROb2RlQnlQYXRoKHRoaXMuZGF0YUNhY2hlZCwgbm9kZS5kYXRhLnBhdGgpO1xyXG4gICAgICBpZiAobm9kZURhdGFDYWNoZWQpIHtcclxuICAgICAgICBsZXQgbm9kZUNhY2hlZCA9IG5vZGVEYXRhQ2FjaGVkWzBdO1xyXG4gICAgICAgIGxldCBpbmRleENhY2hlZCA9IG5vZGVEYXRhQ2FjaGVkWzFdO1xyXG4gICAgICAgIGlmIChpbmRleENhY2hlZCAhPSAtMSkge1xyXG4gICAgICAgICAgaWYgKG5vZGVDYWNoZWQucGFyZW50KSB7XHJcbiAgICAgICAgICAgIG5vZGVDYWNoZWQucGFyZW50LmNoaWxkcmVuLnNwbGljZShpbmRleENhY2hlZCwgMSk7XHJcbiAgICAgICAgICAgIGxldCBwYXJlbnREYXRhQ2FjaGVkID0gdGhpcy5maW5kTm9kZUJ5UGF0aCh0aGlzLmRhdGFDYWNoZWQsIG5vZGUucGFyZW50LmRhdGEucGF0aCk7XHJcbiAgICAgICAgICAgIGlmIChwYXJlbnREYXRhQ2FjaGVkKSB7XHJcbiAgICAgICAgICAgICAgbGV0IHBhcmVudEluZGV4Q2FjaGVkID0gcGFyZW50RGF0YUNhY2hlZFsxXTtcclxuICAgICAgICAgICAgICB0aGlzLmRhdGFDYWNoZWRbcGFyZW50SW5kZXhDYWNoZWRdID0gbm9kZUNhY2hlZC5wYXJlbnQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YUNhY2hlZC5zcGxpY2UoaW5kZXhDYWNoZWQsIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLy8gVE9ETzogQ291bGQgYmUgb3B0aW1pemVkIHRvIGRvIGJyZWFkdGggZmlyc3Qgc2VhcmNoIHZzIGRlcHRoIGZpcnN0IHNlYXJjaFxyXG4gIGZpbmROb2RlQnlQYXRoKGRhdGE6IGFueSwgcGF0aDogc3RyaW5nKSB7XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKGRhdGFbaV0uZGF0YS5wYXRoID09IHBhdGgpIHtcclxuICAgICAgICByZXR1cm4gW2RhdGFbaV0sIGldOyAvLyAwIC0gbm9kZSwgMSAtIGluZGV4XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGRhdGFbaV0uY2hpbGRyZW4gJiYgZGF0YVtpXS5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgdGhpcy5maW5kTm9kZUJ5UGF0aChkYXRhW2ldLmNoaWxkcmVuLCBwYXRoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIFtudWxsLCBudWxsXTtcclxuICB9XHJcblxyXG4gIGF0dGVtcHREb3dubG9hZChyaWdodENsaWNrZWRGaWxlOiBhbnkpIHtcclxuICAgIGxldCBkYXRhc2V0ID0gcmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGg7XHJcbiAgICBsZXQgZmlsZW5hbWUgPSByaWdodENsaWNrZWRGaWxlLmxhYmVsO1xyXG4gICAgbGV0IGRvd25sb2FkT2JqZWN0ID0gcmlnaHRDbGlja2VkRmlsZTtcclxuICAgIGxldCB1cmw6IHN0cmluZyA9IFpvd2VaTFVYLnVyaUJyb2tlci5kYXRhc2V0Q29udGVudHNVcmkoZGF0YXNldCk7XHJcblxyXG4gICAgdGhpcy5kb3dubG9hZFNlcnZpY2UuZmV0Y2hGaWxlSGFuZGxlcih1cmwsIGZpbGVuYW1lLCBkb3dubG9hZE9iamVjdCkudGhlbigocmVzKSA9PiB7XHJcbiAgICAgIC8vIFRPRE86IERvd25sb2FkIHF1ZXVlIGNvZGUgZm9yIHByb2dyZXNzIGJhciBjb3VsZCBnbyBoZXJlXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGNvcHlMaW5rKHJpZ2h0Q2xpY2tlZEZpbGU6IGFueSkge1xyXG4gICAgbGV0IGxpbmsgPSAnJztcclxuICAgIGlmIChyaWdodENsaWNrZWRGaWxlLnR5cGUgPT0gJ2ZpbGUnKSB7XHJcbiAgICAgIGxpbmsgPSBgJHt3aW5kb3cubG9jYXRpb24ub3JpZ2lufSR7d2luZG93LmxvY2F0aW9uLnBhdGhuYW1lfT9wbHVnaW5JZD0ke3RoaXMucGx1Z2luRGVmaW5pdGlvbi5nZXRCYXNlUGx1Z2luKCkuZ2V0SWRlbnRpZmllcigpfTpkYXRhOiR7ZW5jb2RlVVJJQ29tcG9uZW50KGB7XCJ0eXBlXCI6XCJvcGVuRGF0YXNldFwiLFwibmFtZVwiOlwiJHtyaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aH1cIixcInRvZ2dsZVRyZWVcIjp0cnVlfWApfWA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsaW5rID0gYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0ke3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZX0/cGx1Z2luSWQ9JHt0aGlzLnBsdWdpbkRlZmluaXRpb24uZ2V0QmFzZVBsdWdpbigpLmdldElkZW50aWZpZXIoKX06ZGF0YToke2VuY29kZVVSSUNvbXBvbmVudChge1widHlwZVwiOlwib3BlbkRTTGlzdFwiLFwibmFtZVwiOlwiJHtyaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aH1cIixcInRvZ2dsZVRyZWVcIjpmYWxzZX1gKX1gO1xyXG4gICAgfVxyXG4gICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQobGluaykudGhlbigoKSA9PiB7XHJcbiAgICAgIHRoaXMubG9nLmRlYnVnKFwiTGluayBjb3BpZWQgdG8gY2xpcGJvYXJkXCIpO1xyXG4gICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJDb3BpZWQgbGluayBzdWNjZXNzZnVsbHlcIiwgJ0Rpc21pc3MnLCBxdWlja1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICB9KS5jYXRjaCgoKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gY29weSBsaW5rIHRvIGNsaXBib2FyZFwiKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgc2hvd1Byb3BlcnRpZXNEaWFsb2cocmlnaHRDbGlja2VkRmlsZTogYW55KSB7XHJcbiAgICBjb25zdCBmaWxlUHJvcENvbmZpZyA9IG5ldyBNYXREaWFsb2dDb25maWcoKTtcclxuICAgIGZpbGVQcm9wQ29uZmlnLmRhdGEgPSB7XHJcbiAgICAgIGV2ZW50OiByaWdodENsaWNrZWRGaWxlLFxyXG4gICAgICB3aWR0aDogJ2ZpdC1jb250ZW50JyxcclxuICAgICAgbWF4V2lkdGg6ICcxMTAwcHgnLFxyXG4gICAgICBoZWlnaHQ6ICc0NzVweCdcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmRpYWxvZy5vcGVuKERhdGFzZXRQcm9wZXJ0aWVzTW9kYWwsIGZpbGVQcm9wQ29uZmlnKTtcclxuICB9XHJcblxyXG4gIHRvZ2dsZVNlYXJjaCgpIHtcclxuICAgIHRoaXMuc2hvd1NlYXJjaCA9ICF0aGlzLnNob3dTZWFyY2g7XHJcbiAgICBpZiAodGhpcy5zaG93U2VhcmNoKSB7XHJcbiAgICAgIHRoaXMuZm9jdXNTZWFyY2hJbnB1dCgpO1xyXG4gICAgICB0aGlzLmRhdGFDYWNoZWQgPSBfLmNsb25lRGVlcCh0aGlzLmRhdGEpOyAvLyBXZSB3YW50IGEgZGVlcCBjbG9uZSBzbyB3ZSBjYW4gbW9kaWZ5IHRoaXMuZGF0YSB3L28gY2hhbmdpbmcgdGhpcy5kYXRhQ2FjaGVkXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAodGhpcy5kYXRhQ2FjaGVkKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5kYXRhQ2FjaGVkOyAvLyBXZSBkb24ndCBjYXJlIGFib3V0IGRlZXAgY2xvbmUgYmVjYXVzZSB3ZSBqdXN0IHdhbnQgdG8gZ2V0IGRhdGFDYWNoZWQgYmFja1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmb2N1c1NlYXJjaElucHV0KGF0dGVtcHRDb3VudD86IG51bWJlcik6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuc2VhcmNoTVZTKSB7XHJcbiAgICAgIHRoaXMuc2VhcmNoTVZTLm5hdGl2ZUVsZW1lbnQuZm9jdXMoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgY29uc3QgbWF4QXR0ZW1wdHMgPSAxMDtcclxuICAgIGlmICh0eXBlb2YgYXR0ZW1wdENvdW50ICE9PSAnbnVtYmVyJykge1xyXG4gICAgICBhdHRlbXB0Q291bnQgPSBtYXhBdHRlbXB0cztcclxuICAgIH1cclxuICAgIGlmIChhdHRlbXB0Q291bnQgPiAwKSB7XHJcbiAgICAgIGF0dGVtcHRDb3VudC0tO1xyXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMuZm9jdXNTZWFyY2hJbnB1dChhdHRlbXB0Q291bnQpLCAxMDApO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2VhcmNoSW5wdXRDaGFuZ2VkKGlucHV0OiBzdHJpbmcpIHtcclxuICAgIGlucHV0ID0gaW5wdXQudG9VcHBlckNhc2UoKTsgLy8gQ2xpZW50LXNpZGUgdGhlIERTIGFyZSB1cHBlcmNhc2VcclxuICAgIGlmICh0aGlzLmRhdGFDYWNoZWQpIHtcclxuICAgICAgdGhpcy5kYXRhID0gXy5jbG9uZURlZXAodGhpcy5kYXRhQ2FjaGVkKTtcclxuICAgIH1cclxuICAgIHRoaXMuZmlsdGVyTm9kZXNCeUxhYmVsKHRoaXMuZGF0YSwgaW5wdXQpO1xyXG4gIH1cclxuXHJcbiAgZmlsdGVyTm9kZXNCeUxhYmVsKGRhdGE6IGFueSwgbGFiZWw6IHN0cmluZykge1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmICghKGRhdGFbaV0pLmxhYmVsLmluY2x1ZGVzKGxhYmVsKSkge1xyXG4gICAgICAgIGlmIChkYXRhW2ldLmNoaWxkcmVuICYmIGRhdGFbaV0uY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgdGhpcy5maWx0ZXJOb2Rlc0J5TGFiZWwoZGF0YVtpXS5jaGlsZHJlbiwgbGFiZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIShkYXRhW2ldLmNoaWxkcmVuICYmIGRhdGFbaV0uY2hpbGRyZW4ubGVuZ3RoID4gMCkpIHtcclxuICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgaS0tO1xyXG4gICAgICAgIH0gLy8gVE9ETzogUmVmYWN0b3IgXCIuZGF0YVwiIG9mIFVTUyBub2RlIGFuZCBcIi50eXBlXCIgb2YgRFMgbm9kZSB0byBiZSB0aGUgc2FtZSB0aGluZyBcclxuICAgICAgICBlbHNlIGlmIChkYXRhW2ldLnR5cGUgPSBcImZvbGRlclwiKSB7IC8vIElmIHNvbWUgY2hpbGRyZW4gZGlkbid0IGdldCBmaWx0ZXJlZCBvdXQgKGFrYSB3ZSBnb3Qgc29tZSBtYXRjaGVzKSBhbmQgd2UgaGF2ZSBhIGZvbGRlclxyXG4gICAgICAgICAgLy8gdGhlbiB3ZSB3YW50IHRvIGV4cGFuZCB0aGUgbm9kZSBzbyB0aGUgdXNlciBjYW4gc2VlIHRoZWlyIHJlc3VsdHMgaW4gdGhlIHNlYXJjaCBiYXJcclxuICAgICAgICAgIGRhdGFbaV0uZXhwYW5kZWQgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0RE9NRWxlbWVudCgpOiBIVE1MRWxlbWVudCB7XHJcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgfVxyXG5cclxuICBnZXRTZWxlY3RlZFBhdGgoKTogc3RyaW5nIHtcclxuICAgIC8vVE9ETzpob3cgZG8gd2Ugd2FudCB0byB3YW50IHRvIGhhbmRsZSBjYWNoaW5nIHZzIG1lc3NhZ2UgdG8gYXBwIHRvIG9wZW4gc2FpZCBwYXRoXHJcbiAgICByZXR1cm4gdGhpcy5wYXRoO1xyXG4gIH1cclxuXHJcbiAgb25Ob2RlQ2xpY2soJGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMuc2VsZWN0ZWROb2RlID0gJGV2ZW50Lm5vZGU7XHJcbiAgICBpZiAoJGV2ZW50Lm5vZGUudHlwZSA9PSAnZm9sZGVyJykge1xyXG4gICAgICAkZXZlbnQubm9kZS5leHBhbmRlZCA9ICEkZXZlbnQubm9kZS5leHBhbmRlZDtcclxuICAgICAgaWYgKHRoaXMuc2hvd1NlYXJjaCkgeyAvLyBVcGRhdGUgc2VhcmNoIGJhciBjYWNoZWQgZGF0YVxyXG4gICAgICAgIGxldCBub2RlQ2FjaGVkID0gdGhpcy5maW5kTm9kZUJ5UGF0aCh0aGlzLmRhdGFDYWNoZWQsICRldmVudC5ub2RlLmRhdGEucGF0aClbMF07XHJcbiAgICAgICAgaWYgKG5vZGVDYWNoZWQpIHtcclxuICAgICAgICAgIG5vZGVDYWNoZWQuZXhwYW5kZWQgPSAkZXZlbnQubm9kZS5leHBhbmRlZDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICh0aGlzLnV0aWxzLmlzRGF0YXNldE1pZ3JhdGVkKCRldmVudC5ub2RlLmRhdGEuZGF0YXNldEF0dHJzKSkge1xyXG4gICAgICBjb25zdCBwYXRoID0gJGV2ZW50Lm5vZGUuZGF0YS5wYXRoO1xyXG4gICAgICBjb25zdCBzbmFja0JhclJlZiA9IHRoaXMuc25hY2tCYXIub3BlbihgUmVjYWxsaW5nIGRhdGFzZXQgJyR7cGF0aH0nYCxcclxuICAgICAgICB1bmRlZmluZWQsIHsgcGFuZWxDbGFzczogJ2NlbnRlcicgfSk7XHJcbiAgICAgIHRoaXMuZGF0YXNldFNlcnZpY2UucmVjYWxsRGF0YXNldCgkZXZlbnQubm9kZS5kYXRhLnBhdGgpXHJcbiAgICAgICAgLnBpcGUoZmluYWxpemUoKCkgPT4gc25hY2tCYXJSZWYuZGlzbWlzcygpKSlcclxuICAgICAgICAuc3Vic2NyaWJlKFxyXG4gICAgICAgICAgYXR0cnMgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVJlY2FsbGVkRGF0YXNldE5vZGUoJGV2ZW50Lm5vZGUsIGF0dHJzKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd1NlYXJjaCkgeyAvLyBVcGRhdGUgc2VhcmNoIGJhciBjYWNoZWQgZGF0YVxyXG4gICAgICAgICAgICAgIGxldCBub2RlQ2FjaGVkID0gdGhpcy5maW5kTm9kZUJ5UGF0aCh0aGlzLmRhdGFDYWNoZWQsICRldmVudC5ub2RlLmRhdGEucGF0aClbMF07XHJcbiAgICAgICAgICAgICAgaWYgKG5vZGVDYWNoZWQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlUmVjYWxsZWREYXRhc2V0Tm9kZShub2RlQ2FjaGVkLCBhdHRycyk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubm9kZUNsaWNrLmVtaXQoJGV2ZW50Lm5vZGUpO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIF9lcnIgPT4gdGhpcy5zbmFja0Jhci5vcGVuKGBGYWlsZWQgdG8gcmVjYWxsIGRhdGFzZXQgJyR7cGF0aH0nYCxcclxuICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKVxyXG4gICAgICAgICk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMubm9kZUNsaWNrLmVtaXQoJGV2ZW50Lm5vZGUpO1xyXG4gIH1cclxuXHJcbiAgb25Ob2RlRGJsQ2xpY2soJGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMuc2VsZWN0ZWROb2RlID0gJGV2ZW50Lm5vZGU7XHJcbiAgICBpZiAodGhpcy5zZWxlY3RlZE5vZGUuZGF0YT8uaGFzQ2hpbGRyZW4gJiYgdGhpcy5zZWxlY3RlZE5vZGUuY2hpbGRyZW4/Lmxlbmd0aCA+IDApIHtcclxuICAgICAgdGhpcy5wYXRoID0gJGV2ZW50Lm5vZGUuZGF0YS5wYXRoO1xyXG4gICAgICBpZiAodGhpcy5wYXRoKSB7XHJcbiAgICAgICAgdGhpcy5nZXRUcmVlRm9yUXVlcnlBc3luYyh0aGlzLnBhdGgpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAgICAgdGhpcy5kYXRhID0gcmVzWzBdLmNoaWxkcmVuO1xyXG4gICAgICAgICAgdGhpcy5vblBhdGhDaGFuZ2VkKHRoaXMucGF0aCk7XHJcbiAgICAgICAgICB0aGlzLnJlZnJlc2hIaXN0b3J5KHRoaXMucGF0aCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJBIERTIG5vZGUgZG91YmxlIGNsaWNrIGV2ZW50IHdhcyByZWNlaXZlZCB0byBvcGVuLCBidXQgbm8gcGF0aCB3YXMgZm91bmRcIik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMubm9kZURibENsaWNrLmVtaXQoJGV2ZW50Lm5vZGUpO1xyXG4gIH1cclxuXHJcbiAgb25Ob2RlUmlnaHRDbGljayhldmVudDogYW55KSB7XHJcbiAgICBsZXQgbm9kZSA9IGV2ZW50Lm5vZGU7XHJcbiAgICBsZXQgcmlnaHRDbGlja1Byb3BlcnRpZXM7XHJcbiAgICBpZiAobm9kZS50eXBlID09PSAnZmlsZScpIHtcclxuICAgICAgcmlnaHRDbGlja1Byb3BlcnRpZXMgPSB0aGlzLnJpZ2h0Q2xpY2tQcm9wZXJ0aWVzRGF0YXNldEZpbGU7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgcmlnaHRDbGlja1Byb3BlcnRpZXMgPSB0aGlzLnJpZ2h0Q2xpY2tQcm9wZXJ0aWVzRGF0YXNldEZvbGRlcjtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLndpbmRvd0FjdGlvbnMpIHtcclxuICAgICAgbGV0IGRpZENvbnRleHRNZW51U3Bhd24gPSB0aGlzLndpbmRvd0FjdGlvbnMuc3Bhd25Db250ZXh0TWVudShldmVudC5vcmlnaW5hbEV2ZW50LmNsaWVudFgsIGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2xpZW50WSwgcmlnaHRDbGlja1Byb3BlcnRpZXMsIHRydWUpO1xyXG4gICAgICAvLyBUT0RPOiBGaXggWm93ZSdzIGNvbnRleHQgbWVudSBzdWNoIHRoYXQgaWYgaXQgZG9lc24ndCBoYXZlIGVub3VnaCBzcGFjZSB0byBzcGF3biwgaXQgbW92ZXMgaXRzZWxmIGFjY29yZGluZ2x5IHRvIHNwYXduLlxyXG4gICAgICBpZiAoIWRpZENvbnRleHRNZW51U3Bhd24pIHsgLy8gSWYgY29udGV4dCBtZW51IGZhaWxlZCB0byBzcGF3bi4uLlxyXG4gICAgICAgIGxldCBoZWlnaHRBZGp1c3RtZW50ID0gZXZlbnQub3JpZ2luYWxFdmVudC5jbGllbnRZIC0gMjU7IC8vIEJ1bXAgaXQgdXAgMjVweFxyXG4gICAgICAgIGRpZENvbnRleHRNZW51U3Bhd24gPSB0aGlzLndpbmRvd0FjdGlvbnMuc3Bhd25Db250ZXh0TWVudShldmVudC5vcmlnaW5hbEV2ZW50LmNsaWVudFgsIGhlaWdodEFkanVzdG1lbnQsIHJpZ2h0Q2xpY2tQcm9wZXJ0aWVzLCB0cnVlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHRoaXMucmlnaHRDbGlja2VkRmlsZSA9IG5vZGU7XHJcbiAgICB0aGlzLnJpZ2h0Q2xpY2tlZEV2ZW50ID0gZXZlbnQ7XHJcbiAgICB0aGlzLnJpZ2h0Q2xpY2suZW1pdChldmVudC5ub2RlKTtcclxuICAgIGV2ZW50Lm9yaWdpbmFsRXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICB9XHJcblxyXG4gIG9uUGFuZWxSaWdodENsaWNrKCRldmVudDogYW55KSB7XHJcbiAgICBpZiAodGhpcy53aW5kb3dBY3Rpb25zKSB7XHJcbiAgICAgIGxldCBkaWRDb250ZXh0TWVudVNwYXduID0gdGhpcy53aW5kb3dBY3Rpb25zLnNwYXduQ29udGV4dE1lbnUoJGV2ZW50LmNsaWVudFgsICRldmVudC5jbGllbnRZLCB0aGlzLnJpZ2h0Q2xpY2tQcm9wZXJ0aWVzUGFuZWwsIHRydWUpO1xyXG4gICAgICAvLyBUT0RPOiBGaXggWm93ZSdzIGNvbnRleHQgbWVudSBzdWNoIHRoYXQgaWYgaXQgZG9lc24ndCBoYXZlIGVub3VnaCBzcGFjZSB0byBzcGF3biwgaXQgbW92ZXMgaXRzZWxmIGFjY29yZGluZ2x5IHRvIHNwYXduLlxyXG4gICAgICBpZiAoIWRpZENvbnRleHRNZW51U3Bhd24pIHsgLy8gSWYgY29udGV4dCBtZW51IGZhaWxlZCB0byBzcGF3bi4uLlxyXG4gICAgICAgIGxldCBoZWlnaHRBZGp1c3RtZW50ID0gJGV2ZW50LmNsaWVudFkgLSAyNTsgLy8gQnVtcCBpdCB1cCAyNXB4XHJcbiAgICAgICAgZGlkQ29udGV4dE1lbnVTcGF3biA9IHRoaXMud2luZG93QWN0aW9ucy5zcGF3bkNvbnRleHRNZW51KCRldmVudC5jbGllbnRYLCBoZWlnaHRBZGp1c3RtZW50LCB0aGlzLnJpZ2h0Q2xpY2tQcm9wZXJ0aWVzUGFuZWwsIHRydWUpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBjb2xsYXBzZVRyZWUoKTogdm9pZCB7XHJcbiAgICBsZXQgZGF0YUFycmF5ID0gdGhpcy5kYXRhO1xyXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IGRhdGFBcnJheS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAodGhpcy5kYXRhW2ldLmV4cGFuZGVkID09IHRydWUpIHtcclxuICAgICAgICB0aGlzLmRhdGFbaV0uZXhwYW5kZWQgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy50cmVlQ29tcG9uZW50LnVuc2VsZWN0Tm9kZSgpO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlVHJlZVZpZXcocGF0aDogc3RyaW5nKTogdm9pZCB7XHJcbiAgICB0aGlzLmdldFRyZWVGb3JRdWVyeUFzeW5jKHBhdGgpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICB0aGlzLmRhdGEgPSByZXM7XHJcbiAgICAgIGlmICh0aGlzLnNob3dTZWFyY2gpIHtcclxuICAgICAgICB0aGlzLmRhdGFDYWNoZWQgPSB0aGlzLmRhdGE7XHJcbiAgICAgICAgdGhpcy5zaG93U2VhcmNoID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH0sIChlcnJvcikgPT4ge1xyXG4gICAgICBpZiAoZXJyb3Iuc3RhdHVzID09ICcwJykge1xyXG4gICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkZhaWxlZCB0byBjb21tdW5pY2F0ZSB3aXRoIHRoZSBBcHAgc2VydmVyOiBcIiArIGVycm9yLnN0YXR1cyxcclxuICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDAnICYmIHBhdGggPT0gJycpIHtcclxuICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJObyBkYXRhc2V0IG5hbWUgc3BlY2lmaWVkOiBcIiArIGVycm9yLnN0YXR1cyxcclxuICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgIH0gZWxzZSBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDAnKSB7XHJcbiAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiQmFkIHJlcXVlc3Q6IFwiICsgZXJyb3Iuc3RhdHVzLFxyXG4gICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJBbiB1bmtub3duIGVycm9yIG9jY3VycmVkOiBcIiArIGVycm9yLnN0YXR1cyxcclxuICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgIH1cclxuICAgICAgdGhpcy5sb2cuc2V2ZXJlKGVycm9yKTtcclxuICAgIH0pO1xyXG4gICAgdGhpcy5vblBhdGhDaGFuZ2VkKHBhdGgpO1xyXG4gICAgdGhpcy5yZWZyZXNoSGlzdG9yeShwYXRoKTtcclxuICB9XHJcblxyXG4gIG9uUGF0aENoYW5nZWQoJGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMucGF0aENoYW5nZWQuZW1pdCgkZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgb25EYXRhQ2hhbmdlZCgkZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgdGhpcy5kYXRhQ2hhbmdlZC5lbWl0KCRldmVudCk7XHJcbiAgfVxyXG5cclxuICBzZXRQYXRoKHBhdGg6IGFueSkge1xyXG4gICAgdGhpcy5wYXRoID0gcGF0aDtcclxuICB9XHJcblxyXG4gIGdldFRyZWVGb3JRdWVyeUFzeW5jKHBhdGg6IHN0cmluZyk6IFByb21pc2U8YW55PiB7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XHJcbiAgICAgIHRoaXMuZGF0YXNldFNlcnZpY2UucXVlcnlEYXRhc2V0cyhwYXRoLCB0cnVlLCB0aGlzLmFkZGl0aW9uYWxRdWFsaWZpZXJzKS5waXBlKHRha2UoMSkpLnN1YnNjcmliZSgocmVzKSA9PiB7XHJcbiAgICAgICAgdGhpcy5vbkRhdGFDaGFuZ2VkKHJlcyk7XHJcbiAgICAgICAgbGV0IHBhcmVudHM6IFRyZWVOb2RlW10gPSBbXTtcclxuICAgICAgICBsZXQgcGFyZW50TWFwID0ge307XHJcbiAgICAgICAgaWYgKHJlcy5kYXRhc2V0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgcmVzLmRhdGFzZXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50Tm9kZTogVHJlZU5vZGUgPSB7fTtcclxuICAgICAgICAgICAgY3VycmVudE5vZGUuY2hpbGRyZW4gPSBbXTtcclxuICAgICAgICAgICAgY3VycmVudE5vZGUubGFiZWwgPSByZXMuZGF0YXNldHNbaV0ubmFtZS5yZXBsYWNlKC9eXFxzK3xcXHMrJC8sICcnKTtcclxuICAgICAgICAgICAgLy9kYXRhLmlkIGF0dHJpYnV0ZSBpcyBub3QgdXNlZCBieSBlaXRoZXIgcGFyZW50IG9yIGNoaWxkLCBidXQgcmVxdWlyZWQgYXMgcGFydCBvZiB0aGUgUHJvamVjdFN0cnVjdHVyZSBpbnRlcmZhY2VcclxuICAgICAgICAgICAgbGV0IHJlc0F0dHIgPSByZXMuZGF0YXNldHNbaV07XHJcbiAgICAgICAgICAgIGxldCBjdXJyZW50Tm9kZURhdGE6IFByb2plY3RTdHJ1Y3R1cmUgPSB7XHJcbiAgICAgICAgICAgICAgaWQ6IFN0cmluZyhpKSxcclxuICAgICAgICAgICAgICBuYW1lOiBjdXJyZW50Tm9kZS5sYWJlbCxcclxuICAgICAgICAgICAgICBmaWxlTmFtZTogY3VycmVudE5vZGUubGFiZWwsXHJcbiAgICAgICAgICAgICAgcGF0aDogY3VycmVudE5vZGUubGFiZWwsXHJcbiAgICAgICAgICAgICAgaGFzQ2hpbGRyZW46IGZhbHNlLFxyXG4gICAgICAgICAgICAgIGlzRGF0YXNldDogdHJ1ZSxcclxuICAgICAgICAgICAgICBkYXRhc2V0QXR0cnM6ICh7XHJcbiAgICAgICAgICAgICAgICBjc2lFbnRyeVR5cGU6IHJlc0F0dHIuY3NpRW50cnlUeXBlLFxyXG4gICAgICAgICAgICAgICAgZHNvcmc6IHJlc0F0dHIuZHNvcmcsXHJcbiAgICAgICAgICAgICAgICByZWNmbTogcmVzQXR0ci5yZWNmbSxcclxuICAgICAgICAgICAgICAgIHZvbHNlcjogcmVzQXR0ci52b2xzZXJcclxuICAgICAgICAgICAgICB9IGFzIERhdGFzZXRBdHRyaWJ1dGVzKVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBjdXJyZW50Tm9kZS5kYXRhID0gY3VycmVudE5vZGVEYXRhO1xyXG4gICAgICAgICAgICBsZXQgbWlncmF0ZWQgPSB0aGlzLnV0aWxzLmlzRGF0YXNldE1pZ3JhdGVkKGN1cnJlbnROb2RlLmRhdGEuZGF0YXNldEF0dHJzKTtcclxuICAgICAgICAgICAgaWYgKGN1cnJlbnROb2RlLmRhdGEuZGF0YXNldEF0dHJzLmRzb3JnXHJcbiAgICAgICAgICAgICAgJiYgY3VycmVudE5vZGUuZGF0YS5kYXRhc2V0QXR0cnMuZHNvcmcub3JnYW5pemF0aW9uID09PSAncGFydGl0aW9uZWQnKSB7XHJcbiAgICAgICAgICAgICAgY3VycmVudE5vZGUudHlwZSA9ICdmb2xkZXInO1xyXG4gICAgICAgICAgICAgIGN1cnJlbnROb2RlLmV4cGFuZGVkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgaWYgKG1pZ3JhdGVkKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50Tm9kZS5pY29uID0gJ2ZhIGZhLWNsb2NrLW8nO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50Tm9kZS5leHBhbmRlZEljb24gPSAnZmEgZmEtZm9sZGVyLW9wZW4nO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudE5vZGUuY29sbGFwc2VkSWNvbiA9ICdmYSBmYS1mb2xkZXInO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBpZiAocmVzLmRhdGFzZXRzW2ldLm1lbWJlcnMpIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnROb2RlLmRhdGEuaGFzQ2hpbGRyZW4gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRDaGlsZHJlbihjdXJyZW50Tm9kZSwgcmVzLmRhdGFzZXRzW2ldLm1lbWJlcnMpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBjdXJyZW50Tm9kZS5pY29uID0gKG1pZ3JhdGVkKSA/ICdmYSBmYS1jbG9jay1vJyA6ICdmYSBmYS1maWxlJztcclxuICAgICAgICAgICAgICBjdXJyZW50Tm9kZS50eXBlID0gJ2ZpbGUnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhcmVudHMucHVzaChjdXJyZW50Tm9kZSk7XHJcbiAgICAgICAgICAgIHBhcmVudE1hcFtjdXJyZW50Tm9kZS5sYWJlbF0gPSBjdXJyZW50Tm9kZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIk5vIGRhdGFzZXRzIHdlcmUgZm91bmQgZm9yICdcIiArIHBhdGggKyBcIidcIixcclxuICAgICAgICAgICAgJ0Rpc21pc3MnLCBxdWlja1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAvL2RhdGEgc2V0IHByb2JhYmx5IGRvZXNudCBleGlzdFxyXG4gICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzb2x2ZShwYXJlbnRzKTtcclxuICAgICAgfSwgKGVycikgPT4ge1xyXG4gICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgcmVqZWN0KGVycik7XHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgYWRkQ2hpbGRyZW4ocGFyZW50Tm9kZTogVHJlZU5vZGUsIG1lbWJlcnM6IE1lbWJlcltdKTogdm9pZCB7XHJcbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgbWVtYmVycy5sZW5ndGg7IGkrKykge1xyXG4gICAgICBsZXQgY2hpbGROb2RlOiBUcmVlTm9kZSA9IHt9O1xyXG4gICAgICBjaGlsZE5vZGUudHlwZSA9ICdmaWxlJztcclxuICAgICAgY2hpbGROb2RlLmljb24gPSAnZmEgZmEtZmlsZSc7XHJcbiAgICAgIGNoaWxkTm9kZS5sYWJlbCA9IG1lbWJlcnNbaV0ubmFtZS5yZXBsYWNlKC9eXFxzK3xcXHMrJC8sICcnKTtcclxuICAgICAgY2hpbGROb2RlLnBhcmVudCA9IHBhcmVudE5vZGU7XHJcbiAgICAgIGxldCBjaGlsZE5vZGVEYXRhOiBQcm9qZWN0U3RydWN0dXJlID0ge1xyXG4gICAgICAgIGlkOiBwYXJlbnROb2RlLmRhdGEuaWQsXHJcbiAgICAgICAgbmFtZTogY2hpbGROb2RlLmxhYmVsLFxyXG4gICAgICAgIGhhc0NoaWxkcmVuOiBmYWxzZSxcclxuICAgICAgICBpc0RhdGFzZXQ6IHRydWUsXHJcbiAgICAgICAgZGF0YXNldEF0dHJzOiBwYXJlbnROb2RlLmRhdGEuZGF0YXNldEF0dHJzXHJcbiAgICAgIH1cclxuICAgICAgY2hpbGROb2RlRGF0YS5wYXRoID0gY2hpbGROb2RlRGF0YS5maWxlTmFtZSA9IGAke3BhcmVudE5vZGUubGFiZWx9KCR7Y2hpbGROb2RlLmxhYmVsfSlgO1xyXG4gICAgICBjaGlsZE5vZGUuZGF0YSA9IChjaGlsZE5vZGVEYXRhIGFzIFByb2plY3RTdHJ1Y3R1cmUpO1xyXG4gICAgICBwYXJlbnROb2RlLmNoaWxkcmVuLnB1c2goY2hpbGROb2RlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHVwZGF0ZVJlY2FsbGVkRGF0YXNldE5vZGUobm9kZTogVHJlZU5vZGUsIGRhdGFzZXRBdHRyczogRGF0YXNldEF0dHJpYnV0ZXMpOiB2b2lkIHtcclxuICAgIGNvbnN0IHNob3dBc0ZvbGRlciA9IEFycmF5LmlzQXJyYXkoZGF0YXNldEF0dHJzLm1lbWJlcnMpO1xyXG4gICAgbm9kZS5kYXRhLmRhdGFzZXRBdHRycyA9IGRhdGFzZXRBdHRycztcclxuICAgIGlmIChzaG93QXNGb2xkZXIpIHtcclxuICAgICAgbm9kZS5kYXRhLmhhc0NoaWxkcmVuID0gdHJ1ZTtcclxuICAgICAgdGhpcy5hZGRDaGlsZHJlbihub2RlLCBkYXRhc2V0QXR0cnMubWVtYmVycyk7XHJcbiAgICAgIG5vZGUuZXhwYW5kZWRJY29uID0gJ2ZhIGZhLWZvbGRlci1vcGVuJztcclxuICAgICAgbm9kZS5jb2xsYXBzZWRJY29uID0gJ2ZhIGZhLWZvbGRlcic7XHJcbiAgICAgIG5vZGUuZXhwYW5kZWQgPSB0cnVlO1xyXG4gICAgICBub2RlLmljb24gPSB1bmRlZmluZWQ7XHJcbiAgICAgIG5vZGUudHlwZSA9ICdmb2xkZXInO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbm9kZS5pY29uID0gJ2ZhIGZhLWZpbGUnO1xyXG4gICAgICBub2RlLnR5cGUgPSAnZmlsZSc7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZWZyZXNoSGlzdG9yeShwYXRoOiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IHN1YiA9IHRoaXMubXZzU2VhcmNoSGlzdG9yeVxyXG4gICAgICAuc2F2ZVNlYXJjaEhpc3RvcnkocGF0aClcclxuICAgICAgLnN1YnNjcmliZSgoKSA9PiB7XHJcbiAgICAgICAgaWYgKHN1Yikgc3ViLnVuc3Vic2NyaWJlKCk7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgY2xlYXJTZWFyY2hIaXN0b3J5KCk6IHZvaWQge1xyXG4gICAgdGhpcy5tdnNTZWFyY2hIaXN0b3J5LmRlbGV0ZVNlYXJjaEhpc3RvcnkoKS5zdWJzY3JpYmUoKTtcclxuICAgIHRoaXMubXZzU2VhcmNoSGlzdG9yeS5vbkluaXQoU0VBUkNIX0lEKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogW2xldmVsVXA6IGZ1bmN0aW9uIHRvIGFzY2VuZCB1cCBhIGxldmVsIGluIHRoZSBmaWxlL2ZvbGRlciB0cmVlXVxyXG4gICogQHBhcmFtIGluZGV4IFt0cmVlIGluZGV4IHdoZXJlIHRoZSAnZm9sZGVyJyBwYXJlbnQgaXMgYWNjZXNzZWRdXHJcbiAgKi9cclxuICBsZXZlbFVwKCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLnBhdGguaW5jbHVkZXMoJy4nKSkge1xyXG4gICAgICB0aGlzLnBhdGggPSAnJztcclxuICAgIH1cclxuICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoL1xcLlteXFwuXSskLyk7XHJcbiAgICBpZiAodGhpcy5wYXRoLnN1YnN0cih0aGlzLnBhdGgubGVuZ3RoIC0gMiwgMikgPT0gJy4qJykge1xyXG4gICAgICB0aGlzLnBhdGggPSB0aGlzLnBhdGgucmVwbGFjZShyZWdleCwgJycpLnJlcGxhY2UocmVnZXgsICcuKicpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5wYXRoID0gdGhpcy5wYXRoLnJlcGxhY2UocmVnZXgsICcuKicpXHJcbiAgICB9XHJcbiAgICB0aGlzLnVwZGF0ZVRyZWVWaWV3KHRoaXMucGF0aCk7XHJcbiAgfVxyXG5cclxuICBjaGVja0lmSW5EZWxldGlvblF1ZXVlQW5kTWVzc2FnZShwYXRoQW5kTmFtZTogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGlmICh0aGlzLmRlbGV0aW9uUXVldWUuaGFzKHBhdGhBbmROYW1lKSkge1xyXG4gICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oJ0RlbGV0aW9uIGluIHByb2dyZXNzOiAnICsgcGF0aEFuZE5hbWUgKyBcIicgXCIgKyBtZXNzYWdlLFxyXG4gICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlRGF0YXNldERpYWxvZyhkYXRhPzogYW55KSB7XHJcbiAgICBjb25zdCBkc0NyZWF0ZUNvbmZpZyA9IG5ldyBNYXREaWFsb2dDb25maWcoKTtcclxuICAgIGRzQ3JlYXRlQ29uZmlnLmRhdGEgPSB7XHJcbiAgICAgIGRhdGFcclxuICAgIH07XHJcbiAgICBkc0NyZWF0ZUNvbmZpZy5tYXhXaWR0aCA9ICcxMDAwcHgnO1xyXG4gICAgZHNDcmVhdGVDb25maWcuZGlzYWJsZUNsb3NlID0gdHJ1ZTtcclxuXHJcbiAgICBsZXQgc2F2ZVJlZiA9IHRoaXMuZGlhbG9nLm9wZW4oQ3JlYXRlRGF0YXNldE1vZGFsLCBkc0NyZWF0ZUNvbmZpZyk7XHJcblxyXG4gICAgc2F2ZVJlZi5hZnRlckNsb3NlZCgpLnN1YnNjcmliZShhdHRyaWJ1dGVzID0+IHtcclxuICAgICAgaWYgKGF0dHJpYnV0ZXMuZGF0YXNldE5hbWVUeXBlID09ICdMSUJSQVJZJykge1xyXG4gICAgICAgIGF0dHJpYnV0ZXMuZGF0YXNldE5hbWVUeXBlID0gJ1BEU0UnO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChhdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YXNldEF0dHJpYnV0ZXMgPSB7XHJcbiAgICAgICAgICBuZGlzcDogJ0NBVEFMT0cnLFxyXG4gICAgICAgICAgc3RhdHVzOiAnTkVXJyxcclxuICAgICAgICAgIHNwYWNlOiBhdHRyaWJ1dGVzLmFsbG9jYXRpb25Vbml0LFxyXG4gICAgICAgICAgZHNvcmc6IGF0dHJpYnV0ZXMub3JnYW5pemF0aW9uLFxyXG4gICAgICAgICAgbHJlY2w6IHBhcnNlSW50KGF0dHJpYnV0ZXMucmVjb3JkTGVuZ3RoKSxcclxuICAgICAgICAgIHJlY2ZtOiBhdHRyaWJ1dGVzLnJlY29yZEZvcm1hdCxcclxuICAgICAgICAgIGRpcjogcGFyc2VJbnQoYXR0cmlidXRlcy5kaXJlY3RvcnlCbG9ja3MpLFxyXG4gICAgICAgICAgcHJpbWU6IHBhcnNlSW50KGF0dHJpYnV0ZXMucHJpbWFyeVNwYWNlKSxcclxuICAgICAgICAgIHNlY25kOiBwYXJzZUludChhdHRyaWJ1dGVzLnNlY29uZGFyeVNwYWNlKSxcclxuICAgICAgICAgIGRzbnQ6IGF0dHJpYnV0ZXMuZGF0YXNldE5hbWVUeXBlLFxyXG4gICAgICAgICAgY2xvc2U6ICd0cnVlJ1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMuYXZlcmFnZVJlY29yZFVuaXQpIHtcclxuICAgICAgICAgIGRhdGFzZXRBdHRyaWJ1dGVzWydhdmdyJ10gPSBhdHRyaWJ1dGVzLmF2ZXJhZ2VSZWNvcmRVbml0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYXR0cmlidXRlcy5ibG9ja1NpemUpIHtcclxuICAgICAgICAgIGRhdGFzZXRBdHRyaWJ1dGVzWydibGtzeiddID0gcGFyc2VJbnQoYXR0cmlidXRlcy5ibG9ja1NpemUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5kYXRhc2V0U2VydmljZS5jcmVhdGVEYXRhc2V0KGRhdGFzZXRBdHRyaWJ1dGVzLCBhdHRyaWJ1dGVzLm5hbWUpLnN1YnNjcmliZShyZXNwID0+IHtcclxuICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihgRGF0YXNldDogJHthdHRyaWJ1dGVzLm5hbWV9IGNyZWF0ZWQgc3VjY2Vzc2Z1bGx5LmAsICdEaXNtaXNzJywgcXVpY2tTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgdGhpcy5jcmVhdGVEYXRhc2V0LmVtaXQoeyBzdGF0dXM6ICdzdWNjZXNzJywgbmFtZTogYXR0cmlidXRlcy5uYW1lLCBvcmc6IGF0dHJpYnV0ZXMub3JnYW5pemF0aW9uLCBpbml0RGF0YTogZHNDcmVhdGVDb25maWcuZGF0YS5kYXRhIH0pO1xyXG4gICAgICAgIH0sIGVycm9yID0+IHtcclxuICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihgRmFpbGVkIHRvIGNyZWF0ZSB0aGUgZGF0YXNldDogJHtlcnJvci5lcnJvcn1gLCAnRGlzbWlzcycsIGxvbmdTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgdGhpcy5jcmVhdGVEYXRhc2V0LmVtaXQoeyBzdGF0dXM6ICdlcnJvcicsIGVycm9yOiBlcnJvci5lcnJvciwgbmFtZTogYXR0cmlidXRlcy5uYW1lIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG59XHJcblxyXG5cclxuXHJcblxyXG4vKlxyXG4gIFRoaXMgcHJvZ3JhbSBhbmQgdGhlIGFjY29tcGFueWluZyBtYXRlcmlhbHMgYXJlXHJcbiAgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcclxuICB0aGlzIGRpc3RyaWJ1dGlvbiwgYW5kIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5lY2xpcHNlLm9yZy9sZWdhbC9lcGwtdjIwLmh0bWxcclxuICBcclxuICBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxyXG4gIFxyXG4gIENvcHlyaWdodCBDb250cmlidXRvcnMgdG8gdGhlIFpvd2UgUHJvamVjdC5cclxuKi9cclxuIiwiPCEtLVxuVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcbm1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRWNsaXBzZSBQdWJsaWMgTGljZW5zZSB2Mi4wIHdoaWNoIGFjY29tcGFuaWVzXG50aGlzIGRpc3RyaWJ1dGlvbiwgYW5kIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5lY2xpcHNlLm9yZy9sZWdhbC9lcGwtdjIwLmh0bWxcblxuU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcblxuQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxuLS0+XG5cbjxkaXYgc3R5bGU9XCJoZWlnaHQ6IDEwMCVcIj5cblxuICA8IS0tIFRhYnMsIHNlYXJjaGJhciwgYW5kIGxvYWRpbmcgaW5kaWNhdG9yIC0tPlxuICBAaWYgKHNob3dVcEFycm93KSB7XG4gIDxpbWcgW3NyY109XCInLi9hc3NldHMvZXhwbG9yZXItdXBhcnJvdy5wbmcnXCIgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgY2xhc3M9XCJmaWxlYnJvd3Nlcm12cy1wb2ludGVyLWxvZ29cIlxuICAgIHRpdGxlPVwiR28gdXAgdG8gdGhlIHBhcmVudCBsZXZlbFwiIChjbGljayk9XCJsZXZlbFVwKClcIiBbbmdTdHlsZV09XCJ0cmVlU3R5bGVcIiB0YWJpbmRleD1cIjBcIlxuICAgIChrZXlkb3duLmVudGVyKT1cImxldmVsVXAoKVwiIC8+XG4gIH1cblxuICA8ZGl2IGNsYXNzPVwiZmlsZWJyb3dzZXJtdnMtc2VhcmNoXCIgW25nU3R5bGVdPVwic2VhcmNoU3R5bGVcIj5cbiAgICA8ZGl2IGNsYXNzPVwic2VhcmNoUm93RmxleFwiPlxuICAgICAgPGlucHV0IFsobmdNb2RlbCldPVwicGF0aFwiIGxpc3Q9XCJzZWFyY2hNVlNIaXN0b3J5XCIgcGxhY2Vob2xkZXI9XCJFbnRlciBhIGRhdGFzZXQgcXVlcnkuLi5cIlxuICAgICAgICBjbGFzcz1cImZpbGVicm93c2VybXZzLXNlYXJjaC1pbnB1dFwiIChrZXlkb3duLmVudGVyKT1cInVwZGF0ZVRyZWVWaWV3KHBhdGgpO1wiIFtuZ1N0eWxlXT1cImlucHV0U3R5bGVcIj5cbiAgICAgIDwhLS0gVE9ETzogbWFrZSBzZWFyY2ggaGlzdG9yeSBhIGRpcmVjdGl2ZSB0byB1c2UgaW4gYm90aCB1c3MgYW5kIG12cy0tPlxuICAgICAgPG1hdC1idXR0b24tdG9nZ2xlLWdyb3VwIGlkPVwicXVhbEdyb3VwXCIgI2dyb3VwPVwibWF0QnV0dG9uVG9nZ2xlR3JvdXBcIj5cbiAgICAgICAgPG1hdC1idXR0b24tdG9nZ2xlIFtjaGVja2VkXT1cImFkZGl0aW9uYWxRdWFsaWZpZXJzXCIgY2xhc3M9XCJxdWFsQnV0dG9uXCJcbiAgICAgICAgICAoY2xpY2spPVwiYWRkaXRpb25hbFF1YWxpZmllcnMgPSAhYWRkaXRpb25hbFF1YWxpZmllcnNcIiBhcmlhLWxhYmVsPVwiSW5jbHVkZSBhZGRpdGlvbmFsIHF1YWxpZmllcnNcIlxuICAgICAgICAgIHRpdGxlPVwiSW5jbHVkZSBBZGRpdGlvbmFsIFF1YWxpZmllcnNcIj5cbiAgICAgICAgICA8c3Ryb25nPi4qKjwvc3Ryb25nPlxuICAgICAgICA8L21hdC1idXR0b24tdG9nZ2xlPlxuICAgICAgPC9tYXQtYnV0dG9uLXRvZ2dsZS1ncm91cD5cbiAgICAgIDxkYXRhbGlzdCBpZD1cInNlYXJjaE1WU0hpc3RvcnlcIj5cbiAgICAgICAgQGZvciAoaXRlbSBvZiBtdnNTZWFyY2hIaXN0b3J5LnNlYXJjaEhpc3RvcnlWYWw7IHRyYWNrIGl0ZW0pIHtcbiAgICAgICAgPG9wdGlvbiBbdmFsdWVdPVwiaXRlbVwiPjwvb3B0aW9uPlxuICAgICAgICB9XG4gICAgICA8L2RhdGFsaXN0PlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cblxuICA8ZGl2IGNsYXNzPVwiZmEgZmEtc3Bpbm5lciBmYS1zcGluIGZpbGVicm93c2VybXZzLWxvYWRpbmctaWNvblwiIFtoaWRkZW5dPVwiIWlzTG9hZGluZ1wiPjwvZGl2PlxuICA8ZGl2IGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmaWxlYnJvd3Nlcm12cy1sb2FkaW5nLWljb25cIiB0aXRsZT1cIlJlZnJlc2ggZGF0YXNldCBsaXN0XCIgKGNsaWNrKT1cInVwZGF0ZVRyZWVWaWV3KHBhdGgpO1wiXG4gICAgW2hpZGRlbl09XCJpc0xvYWRpbmdcIiBzdHlsZT1cIm1hcmdpbi1sZWZ0OiA5cHg7IGN1cnNvcjogcG9pbnRlcjtcIj48L2Rpdj5cbiAgPGRpdiBjbGFzcz1cImZpbGUtdHJlZS11dGlsaXRpZXNcIj5cbiAgICA8ZGl2IGNsYXNzPVwiZmEgZmEtbWludXMtc3F1YXJlLW8gZmlsZWJyb3dzZXJ1c3MtY29sbGFwc2UtaWNvblwiIHRpdGxlPVwiQ29sbGFwc2UgRm9sZGVycyBpbiBFeHBsb3JlclwiXG4gICAgICAoY2xpY2spPVwiY29sbGFwc2VUcmVlKCk7XCIgc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDlweDsgZmxvYXQ6cmlnaHQ7IGN1cnNvcjogcG9pbnRlcjtcIj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwiZmEgZmEtdHJhc2gtbyBmaWxlYnJvd3NlcnVzcy1kZWxldGUtaWNvblwiIHRpdGxlPVwiRGVsZXRlXCIgKGNsaWNrKT1cInNob3dEZWxldGVEaWFsb2coc2VsZWN0ZWROb2RlKTtcIlxuICAgICAgc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDlweDsgZmxvYXQ6cmlnaHQ7IGN1cnNvcjogcG9pbnRlcjtcIj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwiZmEgZmEtcGx1c1wiIHRpdGxlPVwiQ3JlYXRlIG5ldyBkYXRhc2V0XCIgKGNsaWNrKT1cImNyZWF0ZURhdGFzZXREaWFsb2coKVwiXG4gICAgICBzdHlsZT1cIm1hcmdpbi1yaWdodDogOXB4OyBmbG9hdDpyaWdodDsgY3Vyc29yOiBwb2ludGVyO1wiPjwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJmYSBmYS1lcmFzZXIgZmlsZWJyb3dzZXItaWNvbiBzcGVjaWFsLXV0aWxpdHlcIiB0aXRsZT1cIkNsZWFyIFNlYXJjaCBIaXN0b3J5XCJcbiAgICAgIChjbGljayk9XCJjbGVhclNlYXJjaEhpc3RvcnkoKTtcIj48L2Rpdj5cbiAgPC9kaXY+XG4gIDwhLS0gTWFpbiB0cmVlIC0tPlxuICA8ZGl2IFtoaWRkZW5dPVwiaGlkZUV4cGxvcmVyXCIgc3R5bGU9XCJoZWlnaHQ6IDEwMCU7XCI+XG4gICAgPHRyZWUtcm9vdCBbdHJlZURhdGFdPVwiZGF0YVwiIChjbGlja0V2ZW50KT1cIm9uTm9kZUNsaWNrKCRldmVudClcIiAoZGJsQ2xpY2tFdmVudCk9XCJvbk5vZGVEYmxDbGljaygkZXZlbnQpXCJcbiAgICAgIFtzdHlsZV09XCJzdHlsZVwiIChyaWdodENsaWNrRXZlbnQpPVwib25Ob2RlUmlnaHRDbGljaygkZXZlbnQpXCIgKHBhbmVsUmlnaHRDbGlja0V2ZW50KT1cIm9uUGFuZWxSaWdodENsaWNrKCRldmVudClcIlxuICAgICAgKGRhdGFDaGFuZ2VkKT1cIm9uRGF0YUNoYW5nZWQoJGV2ZW50KVwiPlxuICAgIDwvdHJlZS1yb290PlxuICA8L2Rpdj5cblxuICBAaWYgKHNob3dTZWFyY2gpIHtcbiAgPGRpdiBjbGFzcz1cInVpLWlucHV0Z3JvdXAgZmlsZWJyb3dzZXJ1c3Mtc2VhcmNoLWJvdHRvbS1ncm91cFwiPlxuICAgIDxzcGFuIGNsYXNzPVwidWktaW5wdXRncm91cC1hZGRvblwiPjxpIGNsYXNzPVwiZmEgZmEtc2VhcmNoIGZpbGVicm93c2VydXNzLXNlYXJjaC1ib3R0b20taWNvblwiPjwvaT48L3NwYW4+XG4gICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgcElucHV0VGV4dCBwbGFjZWhvbGRlcj1cIlNlYXJjaCBkYXRhc2V0cy9tZW1iZXJzIGJ5IG5hbWUuLi5cIlxuICAgICAgY2xhc3M9XCJmaWxlYnJvd3NlcnVzcy1zZWFyY2gtYm90dG9tLWlucHV0XCIgW2Zvcm1Db250cm9sXT1cInNlYXJjaEN0cmxcIiAjc2VhcmNoTVZTPlxuICA8L2Rpdj5cbiAgfVxuPC9kaXY+XG48IS0tXG4gICAgVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcbiAgICBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEVjbGlwc2UgUHVibGljIExpY2Vuc2UgdjIuMCB3aGljaCBhY2NvbXBhbmllc1xuICAgIHRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MjAuaHRtbFxuXG4gICAgU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcblxuICAgIENvcHlyaWdodCBDb250cmlidXRvcnMgdG8gdGhlIFpvd2UgUHJvamVjdC5cbiAgICAtLT4iXX0=