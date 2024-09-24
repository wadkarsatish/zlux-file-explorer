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
        this.mvsSearchHistory
            .saveSearchHistory(path)
            .subscribe();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZWJyb3dzZXJtdnMuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemx1eC1maWxlLWV4cGxvcmVyL3NyYy9saWIvY29tcG9uZW50cy9maWxlYnJvd3Nlcm12cy9maWxlYnJvd3Nlcm12cy5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96bHV4LWZpbGUtZXhwbG9yZXIvc3JjL2xpYi9jb21wb25lbnRzL2ZpbGVicm93c2VybXZzL2ZpbGVicm93c2VybXZzLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBOzs7Ozs7OztFQVFFO0FBR0YsT0FBTyxFQUFFLFNBQVMsRUFBc0IsaUJBQWlCLEVBQWEsS0FBSyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdEosT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFOUQsT0FBTyxFQUFFLHVCQUF1QixFQUFnRCxNQUFNLHFDQUFxQyxDQUFDO0FBRTVILE9BQU8sRUFBYSxlQUFlLEVBQWdCLE1BQU0sMEJBQTBCLENBQUM7QUFFcEYsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sZ0VBQWdFLENBQUM7QUFDeEcsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ25GLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2xILE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU3QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxLQUFLLENBQUMsTUFBTSxRQUFRLENBQUM7QUFFNUIsY0FBYztBQUNk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QUUxQixDQUFDLGtCQUFrQixFQUFFLDBCQUEwQixDQUFDLG9CQUFvQixDQUFDOzswQkFxRDdFLE1BQU07MkJBQUMsdUJBQXVCLENBQUMsTUFBTTs7MEJBQ3JDLE1BQU07MkJBQUMsdUJBQXVCLENBQUMsaUJBQWlCOzswQkFDaEQsUUFBUTs7MEJBQUksTUFBTTsyQkFBQyx1QkFBdUIsQ0FBQyxjQUFjO3lDQXhDMUIsYUFBYTtzQkFBOUMsU0FBUzt1QkFBQyxhQUFhO2dCQVFPLFNBQVM7c0JBQXZDLFNBQVM7dUJBQUMsV0FBVztnQkFtRGIsVUFBVTtzQkFBbEIsS0FBSztnQkFDRyxXQUFXO3NCQUFuQixLQUFLO2dCQUNHLFNBQVM7c0JBQWpCLEtBQUs7Z0JBQ0csS0FBSztzQkFBYixLQUFLO2dCQUNHLFdBQVc7c0JBQW5CLEtBQUs7Z0JBR0ksV0FBVztzQkFBcEIsTUFBTTtnQkFDRyxXQUFXO3NCQUFwQixNQUFNO2dCQUNHLFNBQVM7c0JBQWxCLE1BQU07Z0JBQ0csWUFBWTtzQkFBckIsTUFBTTtnQkFDRyxVQUFVO3NCQUFuQixNQUFNO2dCQUNHLFdBQVc7c0JBQXBCLE1BQU07Z0JBQ0csWUFBWTtzQkFBckIsTUFBTTtnQkFDRyxhQUFhO3NCQUF0QixNQUFNIiwic291cmNlc0NvbnRlbnQiOlsiXHJcblxyXG4vKlxyXG4gIFRoaXMgcHJvZ3JhbSBhbmQgdGhlIGFjY29tcGFueWluZyBtYXRlcmlhbHMgYXJlXHJcbiAgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcclxuICB0aGlzIGRpc3RyaWJ1dGlvbiwgYW5kIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5lY2xpcHNlLm9yZy9sZWdhbC9lcGwtdjIwLmh0bWxcclxuICBcclxuICBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxyXG4gIFxyXG4gIENvcHlyaWdodCBDb250cmlidXRvcnMgdG8gdGhlIFpvd2UgUHJvamVjdC5cclxuKi9cclxuXHJcblxyXG5pbXBvcnQgeyBDb21wb25lbnQsIEVsZW1lbnRSZWYsIE9uSW5pdCwgVmlld0VuY2Fwc3VsYXRpb24sIE9uRGVzdHJveSwgSW5wdXQsIEV2ZW50RW1pdHRlciwgT3V0cHV0LCBJbmplY3QsIE9wdGlvbmFsLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgdGFrZSwgZmluYWxpemUsIGRlYm91bmNlVGltZSB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgUHJvamVjdFN0cnVjdHVyZSwgRGF0YXNldEF0dHJpYnV0ZXMsIE1lbWJlciB9IGZyb20gJy4uLy4uL3N0cnVjdHVyZXMvZWRpdG9yLXByb2plY3QnO1xyXG5pbXBvcnQgeyBBbmd1bGFyMkluamVjdGlvblRva2VucywgQW5ndWxhcjJQbHVnaW5XaW5kb3dBY3Rpb25zLCBDb250ZXh0TWVudUl0ZW0gfSBmcm9tICcuLi8uLi8uLi9wbHVnaW5saWIvaW5qZWN0LXJlc291cmNlcyc7XHJcbmltcG9ydCB7IERvd25sb2FkZXJTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvZG93bmxvYWRlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTWF0RGlhbG9nLCBNYXREaWFsb2dDb25maWcsIE1hdERpYWxvZ1JlZiB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2RpYWxvZyc7XHJcbmltcG9ydCB7IE1hdFNuYWNrQmFyIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc25hY2stYmFyJztcclxuaW1wb3J0IHsgRGF0YXNldFByb3BlcnRpZXNNb2RhbCB9IGZyb20gJy4uL2RhdGFzZXQtcHJvcGVydGllcy1tb2RhbC9kYXRhc2V0LXByb3BlcnRpZXMtbW9kYWwuY29tcG9uZW50JztcclxuaW1wb3J0IHsgRGVsZXRlRmlsZU1vZGFsIH0gZnJvbSAnLi4vZGVsZXRlLWZpbGUtbW9kYWwvZGVsZXRlLWZpbGUtbW9kYWwuY29tcG9uZW50JztcclxuaW1wb3J0IHsgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucywgbG9uZ1NuYWNrYmFyT3B0aW9ucywgcXVpY2tTbmFja2Jhck9wdGlvbnMgfSBmcm9tICcuLi8uLi9zaGFyZWQvc25hY2tiYXItb3B0aW9ucyc7XHJcbmltcG9ydCB7IEZvcm1Db250cm9sIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xyXG5pbXBvcnQgeyBTdWJzY3JpcHRpb24gfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgVHJlZUNvbXBvbmVudCB9IGZyb20gJy4uL3RyZWUvdHJlZS5jb21wb25lbnQnO1xyXG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XHJcblxyXG4vKiBTZXJ2aWNlcyAqL1xyXG5pbXBvcnQgeyBTZWFyY2hIaXN0b3J5U2VydmljZSB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL3NlYXJjaEhpc3RvcnlTZXJ2aWNlJztcclxuaW1wb3J0IHsgVXRpbHNTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvdXRpbHMuc2VydmljZSc7XHJcbmltcG9ydCB7IERhdGFzZXRDcnVkU2VydmljZSB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL2RhdGFzZXQuY3J1ZC5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQ3JlYXRlRGF0YXNldE1vZGFsIH0gZnJvbSAnLi4vY3JlYXRlLWRhdGFzZXQtbW9kYWwvY3JlYXRlLWRhdGFzZXQtbW9kYWwuY29tcG9uZW50JztcclxuaW1wb3J0IHsgVHJlZU5vZGUgfSBmcm9tICdwcmltZW5nL2FwaSc7XHJcbi8qIFRPRE86IHJlLWltcGxlbWVudCB0byBhZGQgZmV0Y2hpbmcgb2YgcHJldmlvdXNseSBvcGVuZWQgdHJlZSB2aWV3IGRhdGFcclxuaW1wb3J0IHsgUGVyc2lzdGVudERhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvcGVyc2lzdGVudERhdGEuc2VydmljZSc7ICovXHJcblxyXG4vLyBVc2VkIGZvciBEUyBhc3luYyBkZWxldGlvbiBVWFxyXG5jb25zdCBDU1NfTk9ERV9ERUxFVElORyA9IFwiZmlsZWJyb3dzZXJtdnMtbm9kZS1kZWxldGluZ1wiO1xyXG5jb25zdCBTRUFSQ0hfSUQgPSAnbXZzJztcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnZmlsZS1icm93c2VyLW12cycsXHJcbiAgdGVtcGxhdGVVcmw6ICcuL2ZpbGVicm93c2VybXZzLmNvbXBvbmVudC5odG1sJyxcclxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxyXG4gIHN0eWxlVXJsczogWycuL2ZpbGVicm93c2VybXZzLmNvbXBvbmVudC5jc3MnXSxcclxuICBwcm92aWRlcnM6IFtEYXRhc2V0Q3J1ZFNlcnZpY2UsIC8qUGVyc2lzdGVudERhdGFTZXJ2aWNlLCovIFNlYXJjaEhpc3RvcnlTZXJ2aWNlXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgRmlsZUJyb3dzZXJNVlNDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XHJcblxyXG4gIC8qIFRPRE86IExlZ2FjeSwgY2FwYWJpbGl0aWVzIGNvZGUgKHVudXNlZCBmb3Igbm93KSAqL1xyXG4gIC8vSUZpbGVCcm93c2VyTVZTLFxyXG4gIC8vY29tcG9uZW50Q2xhc3M6Q29tcG9uZW50Q2xhc3M7XHJcbiAgLy9maWxlU2VsZWN0ZWQ6IFN1YmplY3Q8RmlsZUJyb3dzZXJGaWxlU2VsZWN0ZWRFdmVudD47XHJcbiAgLy9jYXBhYmlsaXRpZXM6QXJyYXk8Q2FwYWJpbGl0eT47XHJcblxyXG4gIC8qIFRPRE86IEZldGNoaW5nIHVwZGF0ZXMgZm9yIGF1dG9tYXRpYyByZWZyZXNoIChkaXNhYmxlZCBmb3Igbm93KSAqL1xyXG4gIC8vIHByaXZhdGUgaW50ZXJ2YWxJZDogYW55O1xyXG4gIC8vIHByaXZhdGUgdXBkYXRlSW50ZXJ2YWw6IG51bWJlciA9IDMwMDAwMDA7XHJcblxyXG4gIC8qIFRyZWUgVUkgYW5kIG1vZGFscyAqL1xyXG4gIEBWaWV3Q2hpbGQoVHJlZUNvbXBvbmVudCkgcHJpdmF0ZSB0cmVlQ29tcG9uZW50OiBUcmVlQ29tcG9uZW50O1xyXG4gIHB1YmxpYyBoaWRlRXhwbG9yZXI6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSByaWdodENsaWNrUHJvcGVydGllc1BhbmVsOiBDb250ZXh0TWVudUl0ZW1bXTtcclxuICBwdWJsaWMgaXNMb2FkaW5nOiBib29sZWFuO1xyXG4gIHByaXZhdGUgcmlnaHRDbGlja1Byb3BlcnRpZXNEYXRhc2V0RmlsZTogQ29udGV4dE1lbnVJdGVtW107XHJcbiAgcHJpdmF0ZSByaWdodENsaWNrUHJvcGVydGllc0RhdGFzZXRGb2xkZXI6IENvbnRleHRNZW51SXRlbVtdO1xyXG5cclxuICAvKiBRdWljayBzZWFyY2ggKEFsdCArIFApIHN0dWZmICovXHJcbiAgQFZpZXdDaGlsZCgnc2VhcmNoTVZTJykgcHVibGljIHNlYXJjaE1WUzogRWxlbWVudFJlZjtcclxuICBzZWFyY2hDdHJsOiBhbnk7XHJcbiAgcHJpdmF0ZSBzZWFyY2hWYWx1ZVN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xyXG4gIHB1YmxpYyBzaG93U2VhcmNoOiBib29sZWFuO1xyXG5cclxuICAvKiBEYXRhIGFuZCBuYXZpZ2F0aW9uICovXHJcbiAgcHVibGljIHBhdGg6IHN0cmluZztcclxuICBwdWJsaWMgc2VsZWN0ZWROb2RlOiBhbnk7XHJcbiAgLy9UT0RPOiBEZWZpbmUgaW50ZXJmYWNlIHR5cGVzIGZvciBtdnMtZGF0YS9kYXRhXHJcbiAgcHVibGljIGRhdGE6IGFueTsgLy9NYWluIGRhdGEgZGlzcGxheWVkIGluIHRoZSB2aXN1YWwgdHJlZSBhcyBub2Rlc1xyXG4gIHByaXZhdGUgZGF0YUNhY2hlZDogYW55OyAgLy8gVXNlZCBmb3IgZmlsdGVyaW5nIGFnYWluc3QgcXVpY2sgc2VhcmNoXHJcbiAgcHJpdmF0ZSByaWdodENsaWNrZWRGaWxlOiBhbnk7XHJcbiAgLy9UT0RPOiBNYXkgbm90IG5lZWRlZCBhbnltb3JlPyAobWF5IG5lZWQgcmVwbGFjaW5nIHcvIHJpZ2h0Q2xpY2tlZEZpbGUpXHJcbiAgcHJpdmF0ZSByaWdodENsaWNrZWRFdmVudDogYW55O1xyXG4gIHByaXZhdGUgZGVsZXRpb25RdWV1ZSA9IG5ldyBNYXAoKTsgLy9EUyBkZWxldGlvbiBpcyBhc3luYywgc28gcXVldWUgaXMgdXNlZFxyXG4gIHByaXZhdGUgZGVsZXRlU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XHJcbiAgLy9UT0RPOiBNYXkgbm90IG5lZWRlZCBhbnltb3JlPyAoY291bGQgYmUgY2xlYW5lZCB1cCBpbnRvIGRlbGV0ZVN1YnNjcmlwdGlvbilcclxuICBwcml2YXRlIGRlbGV0ZVZzYW1TdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcclxuICAvL1RPRE86IE1heSBub3QgbmVlZGVkIGFueW1vcmU/IChjb3VsZCBiZSBjbGVhbmVkIHVwIGludG8gZGVsZXRlU3Vic2NyaXB0aW9uKVxyXG4gIHByaXZhdGUgZGVsZXRlTm9uVnNhbVN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xyXG4gIHB1YmxpYyBhZGRpdGlvbmFsUXVhbGlmaWVyczogYm9vbGVhbjtcclxuXHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxlbWVudFJlZjogRWxlbWVudFJlZixcclxuICAgIHByaXZhdGUgdXRpbHM6IFV0aWxzU2VydmljZSxcclxuICAgIHB1YmxpYyBtdnNTZWFyY2hIaXN0b3J5OiBTZWFyY2hIaXN0b3J5U2VydmljZSxcclxuICAgIHB1YmxpYyBzbmFja0JhcjogTWF0U25hY2tCYXIsXHJcbiAgICBwdWJsaWMgZGF0YXNldFNlcnZpY2U6IERhdGFzZXRDcnVkU2VydmljZSxcclxuICAgIHB1YmxpYyBkb3dubG9hZFNlcnZpY2U6IERvd25sb2FkZXJTZXJ2aWNlLFxyXG4gICAgcHVibGljIGRpYWxvZzogTWF0RGlhbG9nLFxyXG4gICAgQEluamVjdChBbmd1bGFyMkluamVjdGlvblRva2Vucy5MT0dHRVIpIHByaXZhdGUgbG9nOiBaTFVYLkNvbXBvbmVudExvZ2dlcixcclxuICAgIEBJbmplY3QoQW5ndWxhcjJJbmplY3Rpb25Ub2tlbnMuUExVR0lOX0RFRklOSVRJT04pIHByaXZhdGUgcGx1Z2luRGVmaW5pdGlvbjogWkxVWC5Db250YWluZXJQbHVnaW5EZWZpbml0aW9uLFxyXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChBbmd1bGFyMkluamVjdGlvblRva2Vucy5XSU5ET1dfQUNUSU9OUykgcHJpdmF0ZSB3aW5kb3dBY3Rpb25zOiBBbmd1bGFyMlBsdWdpbldpbmRvd0FjdGlvbnNcclxuICApIHtcclxuICAgIC8qIFRPRE86IExlZ2FjeSwgY2FwYWJpbGl0aWVzIGNvZGUgKHVudXNlZCBmb3Igbm93KSAqL1xyXG4gICAgLy90aGlzLmNvbXBvbmVudENsYXNzID0gQ29tcG9uZW50Q2xhc3MuRmlsZUJyb3dzZXI7XHJcbiAgICAvL3RoaXMuaW5pdGFsaXplQ2FwYWJpbGl0aWVzKCk7XHJcbiAgICB0aGlzLm12c1NlYXJjaEhpc3Rvcnkub25Jbml0KFNFQVJDSF9JRCk7XHJcbiAgICB0aGlzLnBhdGggPSBcIlwiO1xyXG4gICAgdGhpcy5oaWRlRXhwbG9yZXIgPSBmYWxzZTtcclxuICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLmFkZGl0aW9uYWxRdWFsaWZpZXJzID0gdHJ1ZTtcclxuICAgIHRoaXMuc2hvd1NlYXJjaCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zZWFyY2hDdHJsID0gbmV3IEZvcm1Db250cm9sKCk7XHJcbiAgICB0aGlzLnNlYXJjaFZhbHVlU3Vic2NyaXB0aW9uID0gdGhpcy5zZWFyY2hDdHJsLnZhbHVlQ2hhbmdlcy5waXBlKFxyXG4gICAgICBkZWJvdW5jZVRpbWUoNTAwKSwgLy8gQnkgZGVmYXVsdCwgNTAwIG1zIHVudGlsIHVzZXIgaW5wdXQsIGZvciBxdWljayBzZWFyY2ggdG8gdXBkYXRlIHJlc3VsdHNcclxuICAgICkuc3Vic2NyaWJlKCh2YWx1ZSkgPT4geyB0aGlzLnNlYXJjaElucHV0Q2hhbmdlZCh2YWx1ZSkgfSk7XHJcbiAgICB0aGlzLnNlbGVjdGVkTm9kZSA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKiBDdXN0b21pemVhYmxlIHRyZWUgc3R5bGVzICovXHJcbiAgQElucHV0KCkgaW5wdXRTdHlsZTogYW55O1xyXG4gIEBJbnB1dCgpIHNlYXJjaFN0eWxlOiBhbnk7XHJcbiAgQElucHV0KCkgdHJlZVN0eWxlOiBhbnk7XHJcbiAgQElucHV0KCkgc3R5bGU6IGFueTtcclxuICBASW5wdXQoKSBzaG93VXBBcnJvdzogYm9vbGVhbjtcclxuXHJcbiAgLyogVHJlZSBvdXRnb2luZyBldmVudHMgKi9cclxuICBAT3V0cHV0KCkgcGF0aENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIGRhdGFDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSBub2RlQ2xpY2s6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIG5vZGVEYmxDbGljazogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgcmlnaHRDbGljazogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgZGVsZXRlQ2xpY2s6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIG9wZW5Jbk5ld1RhYjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgY3JlYXRlRGF0YXNldCA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG5cclxuICBuZ09uSW5pdCgpIHtcclxuICAgIC8vIFRPRE86IEZldGNoaW5nIHVwZGF0ZXMgZm9yIGF1dG9tYXRpYyByZWZyZXNoIChkaXNhYmxlZCBmb3Igbm93KVxyXG4gICAgLy8gdGhpcy5pbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgLy8gICBpZih0aGlzLmRhdGEpe1xyXG4gICAgLy8gICAgIHRoaXMuZ2V0VHJlZUZvclF1ZXJ5QXN5bmModGhpcy5wYXRoKS50aGVuKChyZXNwb25zZTogYW55KSA9PiB7XHJcbiAgICAvLyAgICAgICBsZXQgbmV3RGF0YSA9IHJlc3BvbnNlO1xyXG4gICAgLy8gICAgICAgdGhpcy51cGRhdGVUcmVlRGF0YSh0aGlzLmRhdGEsIG5ld0RhdGEpO1xyXG5cclxuICAgIC8vICAgICAgIGlmICh0aGlzLnNob3dTZWFyY2gpIHtcclxuICAgIC8vICAgICAgICAgaWYgKHRoaXMuZGF0YUNhY2hlZCkge1xyXG4gICAgLy8gICAgICAgICAgIHRoaXMudXBkYXRlVHJlZURhdGEodGhpcy5kYXRhQ2FjaGVkLCBuZXdEYXRhKTtcclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgfVxyXG4gICAgLy8gICAgICAgLyogV2UgZG9uJ3QgdXBkYXRlIHNlYXJjaCBoaXN0b3J5LCBub3IgZW1pdCBwYXRoIGNoYW5nZWQgZXZlbnQsIGJlY2F1c2UgdGhpcyBtZXRob2QgaXMgbWVhbnRcclxuICAgIC8vICAgICAgIHRvIGJlIGEgZmV0Y2hlZCB1cGRhdGUsIG5vdCBhIHVzZXIgYWN0aW9uIG5ldyBwYXRoICovXHJcbiAgICAvLyAgICAgfSk7XHJcbiAgICAvLyAgIH1cclxuICAgIC8vIH0sIHRoaXMudXBkYXRlSW50ZXJ2YWwpO1xyXG4gICAgdGhpcy5pbml0aWFsaXplUmlnaHRDbGlja1Byb3BlcnRpZXMoKTtcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgaWYgKHRoaXMuc2VhcmNoVmFsdWVTdWJzY3JpcHRpb24pIHtcclxuICAgICAgdGhpcy5zZWFyY2hWYWx1ZVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuZGVsZXRlU3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgIHRoaXMuZGVsZXRlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5kZWxldGVOb25Wc2FtU3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgIHRoaXMuZGVsZXRlTm9uVnNhbVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuZGVsZXRlVnNhbVN1YnNjcmlwdGlvbikge1xyXG4gICAgICB0aGlzLmRlbGV0ZVZzYW1TdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgIH1cclxuICAgIC8vIFRPRE86IEZldGNoaW5nIHVwZGF0ZXMgZm9yIGF1dG9tYXRpYyByZWZyZXNoIChkaXNhYmxlZCBmb3Igbm93KVxyXG4gICAgLy8gaWYgKHRoaXMuaW50ZXJ2YWxJZCkge1xyXG4gICAgLy8gICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxJZCk7XHJcbiAgICAvLyB9XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGVzIHRoZSAnZGF0YScgYXJyYXkgd2l0aCBuZXcgZGF0YSwgcHJlc2VydmluZyBleGlzdGluZyBleHBhbmRlZCBkYXRhc2V0c1xyXG4gIHVwZGF0ZVRyZWVEYXRhKGRlc3RpbmF0aW9uRGF0YTogYW55LCBuZXdEYXRhOiBhbnkpIHtcclxuICAgIC8vT25seSB1cGRhdGUgaWYgZGF0YSBzZXRzIGFyZSBhZGRlZC9yZW1vdmVkXHJcbiAgICAvLyBUT0RPOiBBZGQgYSBtb3JlIGluLWRlcHRoIGNoZWNrIGZvciBEUyB1cGRhdGVzIChjaGVjayBEUyBwcm9wZXJ0aWVzIHRvbz8pXHJcbiAgICBpZiAoZGVzdGluYXRpb25EYXRhLmxlbmd0aCAhPSBuZXdEYXRhLmxlbmd0aCkge1xyXG4gICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkNoYW5nZSBpbiBkYXRhc2V0IGNvdW50IGRldGVjdGVkLiBVcGRhdGluZyB0cmVlLi4uXCIpO1xyXG4gICAgICBsZXQgZXhwYW5kZWRGb2xkZXJzID0gZGVzdGluYXRpb25EYXRhLmZpbHRlcihkYXRhT2JqID0+IGRhdGFPYmouZXhwYW5kZWQpO1xyXG4gICAgICAvL2NoZWNrcyBpZiB0aGUgcXVlcnkgcmVzcG9uc2UgY29udGFpbnMgdGhlIHNhbWUgUERTJyB0aGF0IGFyZSBjdXJyZW50bHkgZXhwYW5kZWRcclxuICAgICAgbGV0IG5ld0RhdGFIYXNFeHBhbmRlZCA9IG5ld0RhdGEuZmlsdGVyKGRhdGFPYmogPT4gZXhwYW5kZWRGb2xkZXJzLnNvbWUoZXhwYW5kZWQgPT4gZXhwYW5kZWQubGFiZWwgPT09IGRhdGFPYmoubGFiZWwpKTtcclxuICAgICAgLy9LZWVwIGN1cnJlbnRseSBleHBhbmRlZCBkYXRhc2V0cyBleHBhbmRlZCBhZnRlciB1cGRhdGVcclxuICAgICAgaWYgKG5ld0RhdGFIYXNFeHBhbmRlZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgbGV0IGV4cGFuZGVkTmV3RGF0YSA9IG5ld0RhdGEubWFwKChvYmopID0+IHtcclxuICAgICAgICAgIGxldCByZXRPYmogPSB7fTtcclxuICAgICAgICAgIG5ld0RhdGFIYXNFeHBhbmRlZC5mb3JFYWNoKChleHBhbmRlZE9iaikgPT4ge1xyXG4gICAgICAgICAgICBpZiAob2JqLmxhYmVsID09IGV4cGFuZGVkT2JqLmxhYmVsKSB7XHJcbiAgICAgICAgICAgICAgb2JqLmV4cGFuZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXRPYmogPSBvYmo7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgcmV0dXJuIHJldE9iajtcclxuICAgICAgICB9KVxyXG4gICAgICAgIGRlc3RpbmF0aW9uRGF0YSA9IGV4cGFuZGVkTmV3RGF0YTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBkZXN0aW5hdGlvbkRhdGEgPSBuZXdEYXRhO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiBUT0RPOiBMZWdhY3ksIGNhcGFiaWxpdGllcyBjb2RlICh1bnVzZWQgZm9yIG5vdykgKi9cclxuICAvKmluaXRhbGl6ZUNhcGFiaWxpdGllcygpe1xyXG4gICAgdGhpcy5jYXBhYmlsaXRpZXMgPSBuZXcgQXJyYXk8Q2FwYWJpbGl0eT4oKTtcclxuICAgIHRoaXMuY2FwYWJpbGl0aWVzLnB1c2goRmlsZUJyb3dzZXJDYXBhYmlsaXRpZXMuRmlsZUJyb3dzZXIpO1xyXG4gICAgdGhpcy5jYXBhYmlsaXRpZXMucHVzaChGaWxlQnJvd3NlckNhcGFiaWxpdGllcy5GaWxlQnJvd3Nlck1WUyk7XHJcbiAgfSovXHJcblxyXG4gIGluaXRpYWxpemVSaWdodENsaWNrUHJvcGVydGllcygpIHtcclxuICAgIHRoaXMucmlnaHRDbGlja1Byb3BlcnRpZXNEYXRhc2V0RmlsZSA9IFtcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiUmVxdWVzdCBPcGVuIGluIE5ldyBCcm93c2VyIFRhYlwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMub3BlbkluTmV3VGFiLmVtaXQodGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIkNvcHkgTGlua1wiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuY29weUxpbmsodGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIlByb3BlcnRpZXNcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNob3dQcm9wZXJ0aWVzRGlhbG9nKHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJEZWxldGVcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNob3dEZWxldGVEaWFsb2codGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIkRvd25sb2FkXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5hdHRlbXB0RG93bmxvYWQodGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIF07XHJcbiAgICB0aGlzLnJpZ2h0Q2xpY2tQcm9wZXJ0aWVzRGF0YXNldEZvbGRlciA9IFtcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiQ29weSBMaW5rXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5jb3B5TGluayh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiUHJvcGVydGllc1wiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2hvd1Byb3BlcnRpZXNEaWFsb2codGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIkRlbGV0ZVwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2hvd0RlbGV0ZURpYWxvZyh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgXTtcclxuICAgIHRoaXMucmlnaHRDbGlja1Byb3BlcnRpZXNQYW5lbCA9IFtcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiU2hvdy9IaWRlIFNlYXJjaFwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMudG9nZ2xlU2VhcmNoKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICBdO1xyXG4gIH1cclxuXHJcbiAgc2hvd0RlbGV0ZURpYWxvZyhyaWdodENsaWNrZWRGaWxlOiBhbnkpIHtcclxuICAgIGlmICh0aGlzLmNoZWNrSWZJbkRlbGV0aW9uUXVldWVBbmRNZXNzYWdlKHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoLCBcIlRoaXMgaXMgYWxyZWFkeSBiZWluZyBkZWxldGVkLlwiKSA9PSB0cnVlKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBmaWxlRGVsZXRlQ29uZmlnID0gbmV3IE1hdERpYWxvZ0NvbmZpZygpO1xyXG4gICAgZmlsZURlbGV0ZUNvbmZpZy5kYXRhID0ge1xyXG4gICAgICBldmVudDogcmlnaHRDbGlja2VkRmlsZSxcclxuICAgICAgd2lkdGg6ICc2MDBweCdcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZmlsZURlbGV0ZVJlZjogTWF0RGlhbG9nUmVmPERlbGV0ZUZpbGVNb2RhbD4gPSB0aGlzLmRpYWxvZy5vcGVuKERlbGV0ZUZpbGVNb2RhbCwgZmlsZURlbGV0ZUNvbmZpZyk7XHJcbiAgICB0aGlzLmRlbGV0ZVN1YnNjcmlwdGlvbiA9IGZpbGVEZWxldGVSZWYuY29tcG9uZW50SW5zdGFuY2Uub25EZWxldGUuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgbGV0IHZzYW1DU0lUeXBlcyA9IFsnUicsICdEJywgJ0cnLCAnSScsICdDJ107XHJcbiAgICAgIGlmICh2c2FtQ1NJVHlwZXMuaW5kZXhPZihyaWdodENsaWNrZWRGaWxlLmRhdGEuZGF0YXNldEF0dHJzLmNzaUVudHJ5VHlwZSkgIT0gLTEpIHtcclxuICAgICAgICB0aGlzLmRlbGV0ZVZzYW1EYXRhc2V0KHJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZGVsZXRlTm9uVnNhbURhdGFzZXQocmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZGVsZXRlTm9uVnNhbURhdGFzZXQocmlnaHRDbGlja2VkRmlsZTogYW55KTogdm9pZCB7XHJcbiAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XHJcbiAgICB0aGlzLmRlbGV0aW9uUXVldWUuc2V0KHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoLCByaWdodENsaWNrZWRGaWxlKTtcclxuICAgIHJpZ2h0Q2xpY2tlZEZpbGUuc3R5bGVDbGFzcyA9IENTU19OT0RFX0RFTEVUSU5HO1xyXG4gICAgdGhpcy5kZWxldGVOb25Wc2FtU3Vic2NyaXB0aW9uID0gdGhpcy5kYXRhc2V0U2VydmljZS5kZWxldGVOb25Wc2FtRGF0YXNldE9yTWVtYmVyKHJpZ2h0Q2xpY2tlZEZpbGUpXHJcbiAgICAgIC5zdWJzY3JpYmUoXHJcbiAgICAgICAgcmVzcCA9PiB7XHJcbiAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKHJlc3AubXNnLFxyXG4gICAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVDaGlsZChyaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICAgIHRoaXMuZGVsZXRpb25RdWV1ZS5kZWxldGUocmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGgpO1xyXG4gICAgICAgICAgcmlnaHRDbGlja2VkRmlsZS5zdHlsZUNsYXNzID0gXCJcIjtcclxuICAgICAgICAgIHRoaXMuZGVsZXRlQ2xpY2suZW1pdCh0aGlzLnJpZ2h0Q2xpY2tlZEV2ZW50Lm5vZGUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXJyb3IgPT4ge1xyXG4gICAgICAgICAgaWYgKGVycm9yLnN0YXR1cyA9PSAnNTAwJykgeyAvL0ludGVybmFsIFNlcnZlciBFcnJvclxyXG4gICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJGYWlsZWQgdG8gZGVsZXRlOiAnXCIgKyByaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aCArIFwiJyBUaGlzIGlzIHByb2JhYmx5IGR1ZSB0byBhIHNlcnZlciBhZ2VudCBwcm9ibGVtLlwiLFxyXG4gICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnN0YXR1cyA9PSAnNDA0JykgeyAvL05vdCBGb3VuZFxyXG4gICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4ocmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGggKyAnIGhhcyBhbHJlYWR5IGJlZW4gZGVsZXRlZCBvciBkb2VzIG5vdCBleGlzdC4nLFxyXG4gICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2hpbGQocmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnN0YXR1cyA9PSAnNDAwJykgeyAvL0JhZCBSZXF1ZXN0XHJcbiAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkZhaWxlZCB0byBkZWxldGUgJ1wiICsgcmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGggKyBcIicgVGhpcyBpcyBwcm9iYWJseSBkdWUgdG8gYSBwZXJtaXNzaW9uIHByb2JsZW0uXCIsXHJcbiAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgIH0gZWxzZSB7IC8vVW5rbm93blxyXG4gICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJVbmtub3duIGVycm9yICdcIiArIGVycm9yLnN0YXR1cyArIFwiJyBvY2N1cnJlZCBmb3I6IFwiICsgcmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGgsXHJcbiAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBsb25nU25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgICAgLy8gRXJyb3IgaW5mbyBnZXRzIHByaW50ZWQgaW4gdXNzLmNydWQuc2VydmljZS50c1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5kZWxldGlvblF1ZXVlLmRlbGV0ZShyaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aCk7XHJcbiAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgcmlnaHRDbGlja2VkRmlsZS5zdHlsZUNsYXNzID0gXCJcIjtcclxuICAgICAgICAgIHRoaXMubG9nLnNldmVyZShlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG5cclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5kZWxldGVOb25Wc2FtU3Vic2NyaXB0aW9uLmNsb3NlZCA9PSBmYWxzZSkge1xyXG4gICAgICAgIHRoaXMuc25hY2tCYXIub3BlbignRGVsZXRpbmcgJyArIHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoICsgJy4uLiBMYXJnZXIgcGF5bG9hZHMgbWF5IHRha2UgbG9uZ2VyLiBQbGVhc2UgYmUgcGF0aWVudC4nLFxyXG4gICAgICAgICAgJ0Rpc21pc3MnLCBxdWlja1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgIH1cclxuICAgIH0sIDQwMDApO1xyXG4gIH1cclxuXHJcbiAgZGVsZXRlVnNhbURhdGFzZXQocmlnaHRDbGlja2VkRmlsZTogYW55KTogdm9pZCB7XHJcbiAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XHJcbiAgICB0aGlzLmRlbGV0aW9uUXVldWUuc2V0KHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoLCByaWdodENsaWNrZWRGaWxlKTtcclxuICAgIHJpZ2h0Q2xpY2tlZEZpbGUuc3R5bGVDbGFzcyA9IENTU19OT0RFX0RFTEVUSU5HO1xyXG4gICAgdGhpcy5kZWxldGVWc2FtU3Vic2NyaXB0aW9uID0gdGhpcy5kYXRhc2V0U2VydmljZS5kZWxldGVWc2FtRGF0YXNldChyaWdodENsaWNrZWRGaWxlKVxyXG4gICAgICAuc3Vic2NyaWJlKFxyXG4gICAgICAgIHJlc3AgPT4ge1xyXG4gICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihyZXNwLm1zZyxcclxuICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgIC8vVXBkYXRlIHZzIHJlbW92aW5nIG5vZGUgc2luY2Ugc3ltYm9saWNseSBsaW5rZWQgZGF0YS9pbmRleCBvZiB2c2FtIGNhbiBiZSBuYW1lZCBhbnl0aGluZ1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVUcmVlVmlldyh0aGlzLnBhdGgpO1xyXG4gICAgICAgICAgdGhpcy5kZWxldGlvblF1ZXVlLmRlbGV0ZShyaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aCk7XHJcbiAgICAgICAgICByaWdodENsaWNrZWRGaWxlLnN0eWxlQ2xhc3MgPSBcIlwiO1xyXG4gICAgICAgICAgdGhpcy5kZWxldGVDbGljay5lbWl0KHRoaXMucmlnaHRDbGlja2VkRXZlbnQubm9kZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlcnJvciA9PiB7XHJcbiAgICAgICAgICBpZiAoZXJyb3Iuc3RhdHVzID09ICc1MDAnKSB7IC8vSW50ZXJuYWwgU2VydmVyIEVycm9yXHJcbiAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkZhaWxlZCB0byBkZWxldGU6ICdcIiArIHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoICsgXCInIFRoaXMgaXMgcHJvYmFibHkgZHVlIHRvIGEgc2VydmVyIGFnZW50IHByb2JsZW0uXCIsXHJcbiAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDQnKSB7IC8vTm90IEZvdW5kXHJcbiAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihyaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aCArICcgaGFzIGFscmVhZHkgYmVlbiBkZWxldGVkIG9yIGRvZXMgbm90IGV4aXN0LicsXHJcbiAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVUcmVlVmlldyh0aGlzLnBhdGgpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5zdGF0dXMgPT0gJzQwMCcpIHsgLy9CYWQgUmVxdWVzdFxyXG4gICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJGYWlsZWQgdG8gZGVsZXRlICdcIiArIHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoICsgXCInIFRoaXMgaXMgcHJvYmFibHkgZHVlIHRvIGEgcGVybWlzc2lvbiBwcm9ibGVtLlwiLFxyXG4gICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnN0YXR1cyA9PSAnNDAzJykgeyAvL0JhZCBSZXF1ZXN0XHJcbiAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkZhaWxlZCB0byBkZWxldGUgJ1wiICsgcmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGggKyBcIidcIiArIFwiLiBcIiArIEpTT04ucGFyc2UoZXJyb3IuX2JvZHkpWydtc2cnXSxcclxuICAgICAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgfSBlbHNlIHsgLy9Vbmtub3duXHJcbiAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIlVua25vd24gZXJyb3IgJ1wiICsgZXJyb3Iuc3RhdHVzICsgXCInIG9jY3VycmVkIGZvcjogXCIgKyByaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aCxcclxuICAgICAgICAgICAgICAnRGlzbWlzcycsIGxvbmdTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgICAvL0Vycm9yIGluZm8gZ2V0cyBwcmludGVkIGluIHVzcy5jcnVkLnNlcnZpY2UudHNcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuZGVsZXRpb25RdWV1ZS5kZWxldGUocmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGgpO1xyXG4gICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIHJpZ2h0Q2xpY2tlZEZpbGUuc3R5bGVDbGFzcyA9IFwiXCI7XHJcbiAgICAgICAgICB0aGlzLmxvZy5zZXZlcmUoZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHRoaXMuZGVsZXRlVnNhbVN1YnNjcmlwdGlvbi5jbG9zZWQgPT0gZmFsc2UpIHtcclxuICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oJ0RlbGV0aW5nICcgKyByaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aCArICcuLi4gTGFyZ2VyIHBheWxvYWRzIG1heSB0YWtlIGxvbmdlci4gUGxlYXNlIGJlIHBhdGllbnQuJyxcclxuICAgICAgICAgICdEaXNtaXNzJywgcXVpY2tTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICB9XHJcbiAgICB9LCA0MDAwKTtcclxuICB9XHJcblxyXG4gIHJlbW92ZUNoaWxkKG5vZGU6IGFueSkge1xyXG4gICAgbGV0IG5vZGVzID0gdGhpcy5kYXRhO1xyXG4gICAgaWYgKG5vZGUucGFyZW50KSB7XHJcbiAgICAgIGxldCBwYXJlbnQgPSBub2RlLnBhcmVudDtcclxuICAgICAgbGV0IGluZGV4ID0gcGFyZW50LmNoaWxkcmVuLmluZGV4T2Yobm9kZSk7XHJcbiAgICAgIGlmIChpbmRleCA9PSAtMSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwYXJlbnQuY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICBub2Rlc1tub2Rlcy5pbmRleE9mKG5vZGUucGFyZW50KV0gPSBwYXJlbnQ7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gbm9kZXM7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxldCBpbmRleCA9IG5vZGVzLmluZGV4T2Yobm9kZSk7XHJcbiAgICAgIGlmIChpbmRleCA9PSAtMSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBub2Rlcy5zcGxpY2Uobm9kZXMuaW5kZXhPZihub2RlKSwgMSk7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gbm9kZXM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5zaG93U2VhcmNoKSB7IC8vIElmIHdlIHJlbW92ZSBhIG5vZGUsIHdlIG5lZWQgdG8gdXBkYXRlIGl0IGluIHNlYXJjaCBiYXIgY2FjaGVcclxuICAgICAgbGV0IG5vZGVEYXRhQ2FjaGVkID0gdGhpcy5maW5kTm9kZUJ5UGF0aCh0aGlzLmRhdGFDYWNoZWQsIG5vZGUuZGF0YS5wYXRoKTtcclxuICAgICAgaWYgKG5vZGVEYXRhQ2FjaGVkKSB7XHJcbiAgICAgICAgbGV0IG5vZGVDYWNoZWQgPSBub2RlRGF0YUNhY2hlZFswXTtcclxuICAgICAgICBsZXQgaW5kZXhDYWNoZWQgPSBub2RlRGF0YUNhY2hlZFsxXTtcclxuICAgICAgICBpZiAoaW5kZXhDYWNoZWQgIT0gLTEpIHtcclxuICAgICAgICAgIGlmIChub2RlQ2FjaGVkLnBhcmVudCkge1xyXG4gICAgICAgICAgICBub2RlQ2FjaGVkLnBhcmVudC5jaGlsZHJlbi5zcGxpY2UoaW5kZXhDYWNoZWQsIDEpO1xyXG4gICAgICAgICAgICBsZXQgcGFyZW50RGF0YUNhY2hlZCA9IHRoaXMuZmluZE5vZGVCeVBhdGgodGhpcy5kYXRhQ2FjaGVkLCBub2RlLnBhcmVudC5kYXRhLnBhdGgpO1xyXG4gICAgICAgICAgICBpZiAocGFyZW50RGF0YUNhY2hlZCkge1xyXG4gICAgICAgICAgICAgIGxldCBwYXJlbnRJbmRleENhY2hlZCA9IHBhcmVudERhdGFDYWNoZWRbMV07XHJcbiAgICAgICAgICAgICAgdGhpcy5kYXRhQ2FjaGVkW3BhcmVudEluZGV4Q2FjaGVkXSA9IG5vZGVDYWNoZWQucGFyZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFDYWNoZWQuc3BsaWNlKGluZGV4Q2FjaGVkLCAxKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFRPRE86IENvdWxkIGJlIG9wdGltaXplZCB0byBkbyBicmVhZHRoIGZpcnN0IHNlYXJjaCB2cyBkZXB0aCBmaXJzdCBzZWFyY2hcclxuICBmaW5kTm9kZUJ5UGF0aChkYXRhOiBhbnksIHBhdGg6IHN0cmluZykge1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChkYXRhW2ldLmRhdGEucGF0aCA9PSBwYXRoKSB7XHJcbiAgICAgICAgcmV0dXJuIFtkYXRhW2ldLCBpXTsgLy8gMCAtIG5vZGUsIDEgLSBpbmRleFxyXG4gICAgICB9XHJcbiAgICAgIGlmIChkYXRhW2ldLmNoaWxkcmVuICYmIGRhdGFbaV0uY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHRoaXMuZmluZE5vZGVCeVBhdGgoZGF0YVtpXS5jaGlsZHJlbiwgcGF0aCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBbbnVsbCwgbnVsbF07XHJcbiAgfVxyXG5cclxuICBhdHRlbXB0RG93bmxvYWQocmlnaHRDbGlja2VkRmlsZTogYW55KSB7XHJcbiAgICBsZXQgZGF0YXNldCA9IHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoO1xyXG4gICAgbGV0IGZpbGVuYW1lID0gcmlnaHRDbGlja2VkRmlsZS5sYWJlbDtcclxuICAgIGxldCBkb3dubG9hZE9iamVjdCA9IHJpZ2h0Q2xpY2tlZEZpbGU7XHJcbiAgICBsZXQgdXJsOiBzdHJpbmcgPSBab3dlWkxVWC51cmlCcm9rZXIuZGF0YXNldENvbnRlbnRzVXJpKGRhdGFzZXQpO1xyXG5cclxuICAgIHRoaXMuZG93bmxvYWRTZXJ2aWNlLmZldGNoRmlsZUhhbmRsZXIodXJsLCBmaWxlbmFtZSwgZG93bmxvYWRPYmplY3QpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAvLyBUT0RPOiBEb3dubG9hZCBxdWV1ZSBjb2RlIGZvciBwcm9ncmVzcyBiYXIgY291bGQgZ28gaGVyZVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBjb3B5TGluayhyaWdodENsaWNrZWRGaWxlOiBhbnkpIHtcclxuICAgIGxldCBsaW5rID0gJyc7XHJcbiAgICBpZiAocmlnaHRDbGlja2VkRmlsZS50eXBlID09ICdmaWxlJykge1xyXG4gICAgICBsaW5rID0gYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0ke3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZX0/cGx1Z2luSWQ9JHt0aGlzLnBsdWdpbkRlZmluaXRpb24uZ2V0QmFzZVBsdWdpbigpLmdldElkZW50aWZpZXIoKX06ZGF0YToke2VuY29kZVVSSUNvbXBvbmVudChge1widHlwZVwiOlwib3BlbkRhdGFzZXRcIixcIm5hbWVcIjpcIiR7cmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGh9XCIsXCJ0b2dnbGVUcmVlXCI6dHJ1ZX1gKX1gO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbGluayA9IGAke3dpbmRvdy5sb2NhdGlvbi5vcmlnaW59JHt3aW5kb3cubG9jYXRpb24ucGF0aG5hbWV9P3BsdWdpbklkPSR7dGhpcy5wbHVnaW5EZWZpbml0aW9uLmdldEJhc2VQbHVnaW4oKS5nZXRJZGVudGlmaWVyKCl9OmRhdGE6JHtlbmNvZGVVUklDb21wb25lbnQoYHtcInR5cGVcIjpcIm9wZW5EU0xpc3RcIixcIm5hbWVcIjpcIiR7cmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGh9XCIsXCJ0b2dnbGVUcmVlXCI6ZmFsc2V9YCl9YDtcclxuICAgIH1cclxuICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGxpbmspLnRoZW4oKCkgPT4ge1xyXG4gICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkxpbmsgY29waWVkIHRvIGNsaXBib2FyZFwiKTtcclxuICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiQ29waWVkIGxpbmsgc3VjY2Vzc2Z1bGx5XCIsICdEaXNtaXNzJywgcXVpY2tTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgfSkuY2F0Y2goKCkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGNvcHkgbGluayB0byBjbGlwYm9hcmRcIik7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHNob3dQcm9wZXJ0aWVzRGlhbG9nKHJpZ2h0Q2xpY2tlZEZpbGU6IGFueSkge1xyXG4gICAgY29uc3QgZmlsZVByb3BDb25maWcgPSBuZXcgTWF0RGlhbG9nQ29uZmlnKCk7XHJcbiAgICBmaWxlUHJvcENvbmZpZy5kYXRhID0ge1xyXG4gICAgICBldmVudDogcmlnaHRDbGlja2VkRmlsZSxcclxuICAgICAgd2lkdGg6ICdmaXQtY29udGVudCcsXHJcbiAgICAgIG1heFdpZHRoOiAnMTEwMHB4JyxcclxuICAgICAgaGVpZ2h0OiAnNDc1cHgnXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kaWFsb2cub3BlbihEYXRhc2V0UHJvcGVydGllc01vZGFsLCBmaWxlUHJvcENvbmZpZyk7XHJcbiAgfVxyXG5cclxuICB0b2dnbGVTZWFyY2goKSB7XHJcbiAgICB0aGlzLnNob3dTZWFyY2ggPSAhdGhpcy5zaG93U2VhcmNoO1xyXG4gICAgaWYgKHRoaXMuc2hvd1NlYXJjaCkge1xyXG4gICAgICB0aGlzLmZvY3VzU2VhcmNoSW5wdXQoKTtcclxuICAgICAgdGhpcy5kYXRhQ2FjaGVkID0gXy5jbG9uZURlZXAodGhpcy5kYXRhKTsgLy8gV2Ugd2FudCBhIGRlZXAgY2xvbmUgc28gd2UgY2FuIG1vZGlmeSB0aGlzLmRhdGEgdy9vIGNoYW5naW5nIHRoaXMuZGF0YUNhY2hlZFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMuZGF0YUNhY2hlZCkge1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IHRoaXMuZGF0YUNhY2hlZDsgLy8gV2UgZG9uJ3QgY2FyZSBhYm91dCBkZWVwIGNsb25lIGJlY2F1c2Ugd2UganVzdCB3YW50IHRvIGdldCBkYXRhQ2FjaGVkIGJhY2tcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZm9jdXNTZWFyY2hJbnB1dChhdHRlbXB0Q291bnQ/OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLnNlYXJjaE1WUykge1xyXG4gICAgICB0aGlzLnNlYXJjaE1WUy5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IG1heEF0dGVtcHRzID0gMTA7XHJcbiAgICBpZiAodHlwZW9mIGF0dGVtcHRDb3VudCAhPT0gJ251bWJlcicpIHtcclxuICAgICAgYXR0ZW1wdENvdW50ID0gbWF4QXR0ZW1wdHM7XHJcbiAgICB9XHJcbiAgICBpZiAoYXR0ZW1wdENvdW50ID4gMCkge1xyXG4gICAgICBhdHRlbXB0Q291bnQtLTtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmZvY3VzU2VhcmNoSW5wdXQoYXR0ZW1wdENvdW50KSwgMTAwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNlYXJjaElucHV0Q2hhbmdlZChpbnB1dDogc3RyaW5nKSB7XHJcbiAgICBpbnB1dCA9IGlucHV0LnRvVXBwZXJDYXNlKCk7IC8vIENsaWVudC1zaWRlIHRoZSBEUyBhcmUgdXBwZXJjYXNlXHJcbiAgICBpZiAodGhpcy5kYXRhQ2FjaGVkKSB7XHJcbiAgICAgIHRoaXMuZGF0YSA9IF8uY2xvbmVEZWVwKHRoaXMuZGF0YUNhY2hlZCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmZpbHRlck5vZGVzQnlMYWJlbCh0aGlzLmRhdGEsIGlucHV0KTtcclxuICB9XHJcblxyXG4gIGZpbHRlck5vZGVzQnlMYWJlbChkYXRhOiBhbnksIGxhYmVsOiBzdHJpbmcpIHtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoIShkYXRhW2ldKS5sYWJlbC5pbmNsdWRlcyhsYWJlbCkpIHtcclxuICAgICAgICBpZiAoZGF0YVtpXS5jaGlsZHJlbiAmJiBkYXRhW2ldLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIHRoaXMuZmlsdGVyTm9kZXNCeUxhYmVsKGRhdGFbaV0uY2hpbGRyZW4sIGxhYmVsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEoZGF0YVtpXS5jaGlsZHJlbiAmJiBkYXRhW2ldLmNoaWxkcmVuLmxlbmd0aCA+IDApKSB7XHJcbiAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgIGktLTtcclxuICAgICAgICB9IC8vIFRPRE86IFJlZmFjdG9yIFwiLmRhdGFcIiBvZiBVU1Mgbm9kZSBhbmQgXCIudHlwZVwiIG9mIERTIG5vZGUgdG8gYmUgdGhlIHNhbWUgdGhpbmcgXHJcbiAgICAgICAgZWxzZSBpZiAoZGF0YVtpXS50eXBlID0gXCJmb2xkZXJcIikgeyAvLyBJZiBzb21lIGNoaWxkcmVuIGRpZG4ndCBnZXQgZmlsdGVyZWQgb3V0IChha2Egd2UgZ290IHNvbWUgbWF0Y2hlcykgYW5kIHdlIGhhdmUgYSBmb2xkZXJcclxuICAgICAgICAgIC8vIHRoZW4gd2Ugd2FudCB0byBleHBhbmQgdGhlIG5vZGUgc28gdGhlIHVzZXIgY2FuIHNlZSB0aGVpciByZXN1bHRzIGluIHRoZSBzZWFyY2ggYmFyXHJcbiAgICAgICAgICBkYXRhW2ldLmV4cGFuZGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldERPTUVsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xyXG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xyXG4gIH1cclxuXHJcbiAgZ2V0U2VsZWN0ZWRQYXRoKCk6IHN0cmluZyB7XHJcbiAgICAvL1RPRE86aG93IGRvIHdlIHdhbnQgdG8gd2FudCB0byBoYW5kbGUgY2FjaGluZyB2cyBtZXNzYWdlIHRvIGFwcCB0byBvcGVuIHNhaWQgcGF0aFxyXG4gICAgcmV0dXJuIHRoaXMucGF0aDtcclxuICB9XHJcblxyXG4gIG9uTm9kZUNsaWNrKCRldmVudDogYW55KTogdm9pZCB7XHJcbiAgICB0aGlzLnNlbGVjdGVkTm9kZSA9ICRldmVudC5ub2RlO1xyXG4gICAgaWYgKCRldmVudC5ub2RlLnR5cGUgPT0gJ2ZvbGRlcicpIHtcclxuICAgICAgJGV2ZW50Lm5vZGUuZXhwYW5kZWQgPSAhJGV2ZW50Lm5vZGUuZXhwYW5kZWQ7XHJcbiAgICAgIGlmICh0aGlzLnNob3dTZWFyY2gpIHsgLy8gVXBkYXRlIHNlYXJjaCBiYXIgY2FjaGVkIGRhdGFcclxuICAgICAgICBsZXQgbm9kZUNhY2hlZCA9IHRoaXMuZmluZE5vZGVCeVBhdGgodGhpcy5kYXRhQ2FjaGVkLCAkZXZlbnQubm9kZS5kYXRhLnBhdGgpWzBdO1xyXG4gICAgICAgIGlmIChub2RlQ2FjaGVkKSB7XHJcbiAgICAgICAgICBub2RlQ2FjaGVkLmV4cGFuZGVkID0gJGV2ZW50Lm5vZGUuZXhwYW5kZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy51dGlscy5pc0RhdGFzZXRNaWdyYXRlZCgkZXZlbnQubm9kZS5kYXRhLmRhdGFzZXRBdHRycykpIHtcclxuICAgICAgY29uc3QgcGF0aCA9ICRldmVudC5ub2RlLmRhdGEucGF0aDtcclxuICAgICAgY29uc3Qgc25hY2tCYXJSZWYgPSB0aGlzLnNuYWNrQmFyLm9wZW4oYFJlY2FsbGluZyBkYXRhc2V0ICcke3BhdGh9J2AsXHJcbiAgICAgICAgdW5kZWZpbmVkLCB7IHBhbmVsQ2xhc3M6ICdjZW50ZXInIH0pO1xyXG4gICAgICB0aGlzLmRhdGFzZXRTZXJ2aWNlLnJlY2FsbERhdGFzZXQoJGV2ZW50Lm5vZGUuZGF0YS5wYXRoKVxyXG4gICAgICAgIC5waXBlKGZpbmFsaXplKCgpID0+IHNuYWNrQmFyUmVmLmRpc21pc3MoKSkpXHJcbiAgICAgICAgLnN1YnNjcmliZShcclxuICAgICAgICAgIGF0dHJzID0+IHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGVSZWNhbGxlZERhdGFzZXROb2RlKCRldmVudC5ub2RlLCBhdHRycyk7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNob3dTZWFyY2gpIHsgLy8gVXBkYXRlIHNlYXJjaCBiYXIgY2FjaGVkIGRhdGFcclxuICAgICAgICAgICAgICBsZXQgbm9kZUNhY2hlZCA9IHRoaXMuZmluZE5vZGVCeVBhdGgodGhpcy5kYXRhQ2FjaGVkLCAkZXZlbnQubm9kZS5kYXRhLnBhdGgpWzBdO1xyXG4gICAgICAgICAgICAgIGlmIChub2RlQ2FjaGVkKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVJlY2FsbGVkRGF0YXNldE5vZGUobm9kZUNhY2hlZCwgYXR0cnMpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLm5vZGVDbGljay5lbWl0KCRldmVudC5ub2RlKTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBfZXJyID0+IHRoaXMuc25hY2tCYXIub3BlbihgRmFpbGVkIHRvIHJlY2FsbCBkYXRhc2V0ICcke3BhdGh9J2AsXHJcbiAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucylcclxuICAgICAgICApO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLm5vZGVDbGljay5lbWl0KCRldmVudC5ub2RlKTtcclxuICB9XHJcblxyXG4gIG9uTm9kZURibENsaWNrKCRldmVudDogYW55KTogdm9pZCB7XHJcbiAgICB0aGlzLnNlbGVjdGVkTm9kZSA9ICRldmVudC5ub2RlO1xyXG4gICAgaWYgKHRoaXMuc2VsZWN0ZWROb2RlLmRhdGE/Lmhhc0NoaWxkcmVuICYmIHRoaXMuc2VsZWN0ZWROb2RlLmNoaWxkcmVuPy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHRoaXMucGF0aCA9ICRldmVudC5ub2RlLmRhdGEucGF0aDtcclxuICAgICAgaWYgKHRoaXMucGF0aCkge1xyXG4gICAgICAgIHRoaXMuZ2V0VHJlZUZvclF1ZXJ5QXN5bmModGhpcy5wYXRoKS50aGVuKChyZXMpID0+IHtcclxuICAgICAgICAgIHRoaXMuZGF0YSA9IHJlc1swXS5jaGlsZHJlbjtcclxuICAgICAgICAgIHRoaXMub25QYXRoQ2hhbmdlZCh0aGlzLnBhdGgpO1xyXG4gICAgICAgICAgdGhpcy5yZWZyZXNoSGlzdG9yeSh0aGlzLnBhdGgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiQSBEUyBub2RlIGRvdWJsZSBjbGljayBldmVudCB3YXMgcmVjZWl2ZWQgdG8gb3BlbiwgYnV0IG5vIHBhdGggd2FzIGZvdW5kXCIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLm5vZGVEYmxDbGljay5lbWl0KCRldmVudC5ub2RlKTtcclxuICB9XHJcblxyXG4gIG9uTm9kZVJpZ2h0Q2xpY2soZXZlbnQ6IGFueSkge1xyXG4gICAgbGV0IG5vZGUgPSBldmVudC5ub2RlO1xyXG4gICAgbGV0IHJpZ2h0Q2xpY2tQcm9wZXJ0aWVzO1xyXG4gICAgaWYgKG5vZGUudHlwZSA9PT0gJ2ZpbGUnKSB7XHJcbiAgICAgIHJpZ2h0Q2xpY2tQcm9wZXJ0aWVzID0gdGhpcy5yaWdodENsaWNrUHJvcGVydGllc0RhdGFzZXRGaWxlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJpZ2h0Q2xpY2tQcm9wZXJ0aWVzID0gdGhpcy5yaWdodENsaWNrUHJvcGVydGllc0RhdGFzZXRGb2xkZXI7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy53aW5kb3dBY3Rpb25zKSB7XHJcbiAgICAgIGxldCBkaWRDb250ZXh0TWVudVNwYXduID0gdGhpcy53aW5kb3dBY3Rpb25zLnNwYXduQ29udGV4dE1lbnUoZXZlbnQub3JpZ2luYWxFdmVudC5jbGllbnRYLCBldmVudC5vcmlnaW5hbEV2ZW50LmNsaWVudFksIHJpZ2h0Q2xpY2tQcm9wZXJ0aWVzLCB0cnVlKTtcclxuICAgICAgLy8gVE9ETzogRml4IFpvd2UncyBjb250ZXh0IG1lbnUgc3VjaCB0aGF0IGlmIGl0IGRvZXNuJ3QgaGF2ZSBlbm91Z2ggc3BhY2UgdG8gc3Bhd24sIGl0IG1vdmVzIGl0c2VsZiBhY2NvcmRpbmdseSB0byBzcGF3bi5cclxuICAgICAgaWYgKCFkaWRDb250ZXh0TWVudVNwYXduKSB7IC8vIElmIGNvbnRleHQgbWVudSBmYWlsZWQgdG8gc3Bhd24uLi5cclxuICAgICAgICBsZXQgaGVpZ2h0QWRqdXN0bWVudCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2xpZW50WSAtIDI1OyAvLyBCdW1wIGl0IHVwIDI1cHhcclxuICAgICAgICBkaWRDb250ZXh0TWVudVNwYXduID0gdGhpcy53aW5kb3dBY3Rpb25zLnNwYXduQ29udGV4dE1lbnUoZXZlbnQub3JpZ2luYWxFdmVudC5jbGllbnRYLCBoZWlnaHRBZGp1c3RtZW50LCByaWdodENsaWNrUHJvcGVydGllcywgdHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUgPSBub2RlO1xyXG4gICAgdGhpcy5yaWdodENsaWNrZWRFdmVudCA9IGV2ZW50O1xyXG4gICAgdGhpcy5yaWdodENsaWNrLmVtaXQoZXZlbnQubm9kZSk7XHJcbiAgICBldmVudC5vcmlnaW5hbEV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgfVxyXG5cclxuICBvblBhbmVsUmlnaHRDbGljaygkZXZlbnQ6IGFueSkge1xyXG4gICAgaWYgKHRoaXMud2luZG93QWN0aW9ucykge1xyXG4gICAgICBsZXQgZGlkQ29udGV4dE1lbnVTcGF3biA9IHRoaXMud2luZG93QWN0aW9ucy5zcGF3bkNvbnRleHRNZW51KCRldmVudC5jbGllbnRYLCAkZXZlbnQuY2xpZW50WSwgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc1BhbmVsLCB0cnVlKTtcclxuICAgICAgLy8gVE9ETzogRml4IFpvd2UncyBjb250ZXh0IG1lbnUgc3VjaCB0aGF0IGlmIGl0IGRvZXNuJ3QgaGF2ZSBlbm91Z2ggc3BhY2UgdG8gc3Bhd24sIGl0IG1vdmVzIGl0c2VsZiBhY2NvcmRpbmdseSB0byBzcGF3bi5cclxuICAgICAgaWYgKCFkaWRDb250ZXh0TWVudVNwYXduKSB7IC8vIElmIGNvbnRleHQgbWVudSBmYWlsZWQgdG8gc3Bhd24uLi5cclxuICAgICAgICBsZXQgaGVpZ2h0QWRqdXN0bWVudCA9ICRldmVudC5jbGllbnRZIC0gMjU7IC8vIEJ1bXAgaXQgdXAgMjVweFxyXG4gICAgICAgIGRpZENvbnRleHRNZW51U3Bhd24gPSB0aGlzLndpbmRvd0FjdGlvbnMuc3Bhd25Db250ZXh0TWVudSgkZXZlbnQuY2xpZW50WCwgaGVpZ2h0QWRqdXN0bWVudCwgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc1BhbmVsLCB0cnVlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29sbGFwc2VUcmVlKCk6IHZvaWQge1xyXG4gICAgbGV0IGRhdGFBcnJheSA9IHRoaXMuZGF0YTtcclxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBkYXRhQXJyYXkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKHRoaXMuZGF0YVtpXS5leHBhbmRlZCA9PSB0cnVlKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhW2ldLmV4cGFuZGVkID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMudHJlZUNvbXBvbmVudC51bnNlbGVjdE5vZGUoKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZVRyZWVWaWV3KHBhdGg6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5nZXRUcmVlRm9yUXVlcnlBc3luYyhwYXRoKS50aGVuKChyZXMpID0+IHtcclxuICAgICAgdGhpcy5kYXRhID0gcmVzO1xyXG4gICAgICBpZiAodGhpcy5zaG93U2VhcmNoKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhQ2FjaGVkID0gdGhpcy5kYXRhO1xyXG4gICAgICAgIHRoaXMuc2hvd1NlYXJjaCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9LCAoZXJyb3IpID0+IHtcclxuICAgICAgaWYgKGVycm9yLnN0YXR1cyA9PSAnMCcpIHtcclxuICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJGYWlsZWQgdG8gY29tbXVuaWNhdGUgd2l0aCB0aGUgQXBwIHNlcnZlcjogXCIgKyBlcnJvci5zdGF0dXMsXHJcbiAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICB9IGVsc2UgaWYgKGVycm9yLnN0YXR1cyA9PSAnNDAwJyAmJiBwYXRoID09ICcnKSB7XHJcbiAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiTm8gZGF0YXNldCBuYW1lIHNwZWNpZmllZDogXCIgKyBlcnJvci5zdGF0dXMsXHJcbiAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICB9IGVsc2UgaWYgKGVycm9yLnN0YXR1cyA9PSAnNDAwJykge1xyXG4gICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkJhZCByZXF1ZXN0OiBcIiArIGVycm9yLnN0YXR1cyxcclxuICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiQW4gdW5rbm93biBlcnJvciBvY2N1cnJlZDogXCIgKyBlcnJvci5zdGF0dXMsXHJcbiAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMubG9nLnNldmVyZShlcnJvcik7XHJcbiAgICB9KTtcclxuICAgIHRoaXMub25QYXRoQ2hhbmdlZChwYXRoKTtcclxuICAgIHRoaXMucmVmcmVzaEhpc3RvcnkocGF0aCk7XHJcbiAgfVxyXG5cclxuICBvblBhdGhDaGFuZ2VkKCRldmVudDogYW55KTogdm9pZCB7XHJcbiAgICB0aGlzLnBhdGhDaGFuZ2VkLmVtaXQoJGV2ZW50KTtcclxuICB9XHJcblxyXG4gIG9uRGF0YUNoYW5nZWQoJGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMuZGF0YUNoYW5nZWQuZW1pdCgkZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgc2V0UGF0aChwYXRoOiBhbnkpIHtcclxuICAgIHRoaXMucGF0aCA9IHBhdGg7XHJcbiAgfVxyXG5cclxuICBnZXRUcmVlRm9yUXVlcnlBc3luYyhwYXRoOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xyXG4gICAgICB0aGlzLmRhdGFzZXRTZXJ2aWNlLnF1ZXJ5RGF0YXNldHMocGF0aCwgdHJ1ZSwgdGhpcy5hZGRpdGlvbmFsUXVhbGlmaWVycykucGlwZSh0YWtlKDEpKS5zdWJzY3JpYmUoKHJlcykgPT4ge1xyXG4gICAgICAgIHRoaXMub25EYXRhQ2hhbmdlZChyZXMpO1xyXG4gICAgICAgIGxldCBwYXJlbnRzOiBUcmVlTm9kZVtdID0gW107XHJcbiAgICAgICAgbGV0IHBhcmVudE1hcCA9IHt9O1xyXG4gICAgICAgIGlmIChyZXMuZGF0YXNldHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHJlcy5kYXRhc2V0cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudE5vZGU6IFRyZWVOb2RlID0ge307XHJcbiAgICAgICAgICAgIGN1cnJlbnROb2RlLmNoaWxkcmVuID0gW107XHJcbiAgICAgICAgICAgIGN1cnJlbnROb2RlLmxhYmVsID0gcmVzLmRhdGFzZXRzW2ldLm5hbWUucmVwbGFjZSgvXlxccyt8XFxzKyQvLCAnJyk7XHJcbiAgICAgICAgICAgIC8vZGF0YS5pZCBhdHRyaWJ1dGUgaXMgbm90IHVzZWQgYnkgZWl0aGVyIHBhcmVudCBvciBjaGlsZCwgYnV0IHJlcXVpcmVkIGFzIHBhcnQgb2YgdGhlIFByb2plY3RTdHJ1Y3R1cmUgaW50ZXJmYWNlXHJcbiAgICAgICAgICAgIGxldCByZXNBdHRyID0gcmVzLmRhdGFzZXRzW2ldO1xyXG4gICAgICAgICAgICBsZXQgY3VycmVudE5vZGVEYXRhOiBQcm9qZWN0U3RydWN0dXJlID0ge1xyXG4gICAgICAgICAgICAgIGlkOiBTdHJpbmcoaSksXHJcbiAgICAgICAgICAgICAgbmFtZTogY3VycmVudE5vZGUubGFiZWwsXHJcbiAgICAgICAgICAgICAgZmlsZU5hbWU6IGN1cnJlbnROb2RlLmxhYmVsLFxyXG4gICAgICAgICAgICAgIHBhdGg6IGN1cnJlbnROb2RlLmxhYmVsLFxyXG4gICAgICAgICAgICAgIGhhc0NoaWxkcmVuOiBmYWxzZSxcclxuICAgICAgICAgICAgICBpc0RhdGFzZXQ6IHRydWUsXHJcbiAgICAgICAgICAgICAgZGF0YXNldEF0dHJzOiAoe1xyXG4gICAgICAgICAgICAgICAgY3NpRW50cnlUeXBlOiByZXNBdHRyLmNzaUVudHJ5VHlwZSxcclxuICAgICAgICAgICAgICAgIGRzb3JnOiByZXNBdHRyLmRzb3JnLFxyXG4gICAgICAgICAgICAgICAgcmVjZm06IHJlc0F0dHIucmVjZm0sXHJcbiAgICAgICAgICAgICAgICB2b2xzZXI6IHJlc0F0dHIudm9sc2VyXHJcbiAgICAgICAgICAgICAgfSBhcyBEYXRhc2V0QXR0cmlidXRlcylcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgY3VycmVudE5vZGUuZGF0YSA9IGN1cnJlbnROb2RlRGF0YTtcclxuICAgICAgICAgICAgbGV0IG1pZ3JhdGVkID0gdGhpcy51dGlscy5pc0RhdGFzZXRNaWdyYXRlZChjdXJyZW50Tm9kZS5kYXRhLmRhdGFzZXRBdHRycyk7XHJcbiAgICAgICAgICAgIGlmIChjdXJyZW50Tm9kZS5kYXRhLmRhdGFzZXRBdHRycy5kc29yZ1xyXG4gICAgICAgICAgICAgICYmIGN1cnJlbnROb2RlLmRhdGEuZGF0YXNldEF0dHJzLmRzb3JnLm9yZ2FuaXphdGlvbiA9PT0gJ3BhcnRpdGlvbmVkJykge1xyXG4gICAgICAgICAgICAgIGN1cnJlbnROb2RlLnR5cGUgPSAnZm9sZGVyJztcclxuICAgICAgICAgICAgICBjdXJyZW50Tm9kZS5leHBhbmRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIGlmIChtaWdyYXRlZCkge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudE5vZGUuaWNvbiA9ICdmYSBmYS1jbG9jay1vJztcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudE5vZGUuZXhwYW5kZWRJY29uID0gJ2ZhIGZhLWZvbGRlci1vcGVuJztcclxuICAgICAgICAgICAgICAgIGN1cnJlbnROb2RlLmNvbGxhcHNlZEljb24gPSAnZmEgZmEtZm9sZGVyJztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKHJlcy5kYXRhc2V0c1tpXS5tZW1iZXJzKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50Tm9kZS5kYXRhLmhhc0NoaWxkcmVuID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGRyZW4oY3VycmVudE5vZGUsIHJlcy5kYXRhc2V0c1tpXS5tZW1iZXJzKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgY3VycmVudE5vZGUuaWNvbiA9IChtaWdyYXRlZCkgPyAnZmEgZmEtY2xvY2stbycgOiAnZmEgZmEtZmlsZSc7XHJcbiAgICAgICAgICAgICAgY3VycmVudE5vZGUudHlwZSA9ICdmaWxlJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwYXJlbnRzLnB1c2goY3VycmVudE5vZGUpO1xyXG4gICAgICAgICAgICBwYXJlbnRNYXBbY3VycmVudE5vZGUubGFiZWxdID0gY3VycmVudE5vZGU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJObyBkYXRhc2V0cyB3ZXJlIGZvdW5kIGZvciAnXCIgKyBwYXRoICsgXCInXCIsXHJcbiAgICAgICAgICAgICdEaXNtaXNzJywgcXVpY2tTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgLy9kYXRhIHNldCBwcm9iYWJseSBkb2VzbnQgZXhpc3RcclxuICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJlc29sdmUocGFyZW50cyk7XHJcbiAgICAgIH0sIChlcnIpID0+IHtcclxuICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGFkZENoaWxkcmVuKHBhcmVudE5vZGU6IFRyZWVOb2RlLCBtZW1iZXJzOiBNZW1iZXJbXSk6IHZvaWQge1xyXG4gICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IG1lbWJlcnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgbGV0IGNoaWxkTm9kZTogVHJlZU5vZGUgPSB7fTtcclxuICAgICAgY2hpbGROb2RlLnR5cGUgPSAnZmlsZSc7XHJcbiAgICAgIGNoaWxkTm9kZS5pY29uID0gJ2ZhIGZhLWZpbGUnO1xyXG4gICAgICBjaGlsZE5vZGUubGFiZWwgPSBtZW1iZXJzW2ldLm5hbWUucmVwbGFjZSgvXlxccyt8XFxzKyQvLCAnJyk7XHJcbiAgICAgIGNoaWxkTm9kZS5wYXJlbnQgPSBwYXJlbnROb2RlO1xyXG4gICAgICBsZXQgY2hpbGROb2RlRGF0YTogUHJvamVjdFN0cnVjdHVyZSA9IHtcclxuICAgICAgICBpZDogcGFyZW50Tm9kZS5kYXRhLmlkLFxyXG4gICAgICAgIG5hbWU6IGNoaWxkTm9kZS5sYWJlbCxcclxuICAgICAgICBoYXNDaGlsZHJlbjogZmFsc2UsXHJcbiAgICAgICAgaXNEYXRhc2V0OiB0cnVlLFxyXG4gICAgICAgIGRhdGFzZXRBdHRyczogcGFyZW50Tm9kZS5kYXRhLmRhdGFzZXRBdHRyc1xyXG4gICAgICB9XHJcbiAgICAgIGNoaWxkTm9kZURhdGEucGF0aCA9IGNoaWxkTm9kZURhdGEuZmlsZU5hbWUgPSBgJHtwYXJlbnROb2RlLmxhYmVsfSgke2NoaWxkTm9kZS5sYWJlbH0pYDtcclxuICAgICAgY2hpbGROb2RlLmRhdGEgPSAoY2hpbGROb2RlRGF0YSBhcyBQcm9qZWN0U3RydWN0dXJlKTtcclxuICAgICAgcGFyZW50Tm9kZS5jaGlsZHJlbi5wdXNoKGNoaWxkTm9kZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB1cGRhdGVSZWNhbGxlZERhdGFzZXROb2RlKG5vZGU6IFRyZWVOb2RlLCBkYXRhc2V0QXR0cnM6IERhdGFzZXRBdHRyaWJ1dGVzKTogdm9pZCB7XHJcbiAgICBjb25zdCBzaG93QXNGb2xkZXIgPSBBcnJheS5pc0FycmF5KGRhdGFzZXRBdHRycy5tZW1iZXJzKTtcclxuICAgIG5vZGUuZGF0YS5kYXRhc2V0QXR0cnMgPSBkYXRhc2V0QXR0cnM7XHJcbiAgICBpZiAoc2hvd0FzRm9sZGVyKSB7XHJcbiAgICAgIG5vZGUuZGF0YS5oYXNDaGlsZHJlbiA9IHRydWU7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGRyZW4obm9kZSwgZGF0YXNldEF0dHJzLm1lbWJlcnMpO1xyXG4gICAgICBub2RlLmV4cGFuZGVkSWNvbiA9ICdmYSBmYS1mb2xkZXItb3Blbic7XHJcbiAgICAgIG5vZGUuY29sbGFwc2VkSWNvbiA9ICdmYSBmYS1mb2xkZXInO1xyXG4gICAgICBub2RlLmV4cGFuZGVkID0gdHJ1ZTtcclxuICAgICAgbm9kZS5pY29uID0gdW5kZWZpbmVkO1xyXG4gICAgICBub2RlLnR5cGUgPSAnZm9sZGVyJztcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIG5vZGUuaWNvbiA9ICdmYSBmYS1maWxlJztcclxuICAgICAgbm9kZS50eXBlID0gJ2ZpbGUnO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmVmcmVzaEhpc3RvcnkocGF0aDogc3RyaW5nKSB7XHJcbiAgICB0aGlzLm12c1NlYXJjaEhpc3RvcnlcclxuICAgICAgLnNhdmVTZWFyY2hIaXN0b3J5KHBhdGgpXHJcbiAgICAgIC5zdWJzY3JpYmUoKTtcclxuICB9XHJcblxyXG4gIGNsZWFyU2VhcmNoSGlzdG9yeSgpOiB2b2lkIHtcclxuICAgIHRoaXMubXZzU2VhcmNoSGlzdG9yeS5kZWxldGVTZWFyY2hIaXN0b3J5KCkuc3Vic2NyaWJlKCk7XHJcbiAgICB0aGlzLm12c1NlYXJjaEhpc3Rvcnkub25Jbml0KFNFQVJDSF9JRCk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAqIFtsZXZlbFVwOiBmdW5jdGlvbiB0byBhc2NlbmQgdXAgYSBsZXZlbCBpbiB0aGUgZmlsZS9mb2xkZXIgdHJlZV1cclxuICAqIEBwYXJhbSBpbmRleCBbdHJlZSBpbmRleCB3aGVyZSB0aGUgJ2ZvbGRlcicgcGFyZW50IGlzIGFjY2Vzc2VkXVxyXG4gICovXHJcbiAgbGV2ZWxVcCgpOiB2b2lkIHtcclxuICAgIGlmICghdGhpcy5wYXRoLmluY2x1ZGVzKCcuJykpIHtcclxuICAgICAgdGhpcy5wYXRoID0gJyc7XHJcbiAgICB9XHJcbiAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKC9cXC5bXlxcLl0rJC8pO1xyXG4gICAgaWYgKHRoaXMucGF0aC5zdWJzdHIodGhpcy5wYXRoLmxlbmd0aCAtIDIsIDIpID09ICcuKicpIHtcclxuICAgICAgdGhpcy5wYXRoID0gdGhpcy5wYXRoLnJlcGxhY2UocmVnZXgsICcnKS5yZXBsYWNlKHJlZ2V4LCAnLionKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMucGF0aCA9IHRoaXMucGF0aC5yZXBsYWNlKHJlZ2V4LCAnLionKVxyXG4gICAgfVxyXG4gICAgdGhpcy51cGRhdGVUcmVlVmlldyh0aGlzLnBhdGgpO1xyXG4gIH1cclxuXHJcbiAgY2hlY2tJZkluRGVsZXRpb25RdWV1ZUFuZE1lc3NhZ2UocGF0aEFuZE5hbWU6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICBpZiAodGhpcy5kZWxldGlvblF1ZXVlLmhhcyhwYXRoQW5kTmFtZSkpIHtcclxuICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKCdEZWxldGlvbiBpbiBwcm9ncmVzczogJyArIHBhdGhBbmROYW1lICsgXCInIFwiICsgbWVzc2FnZSxcclxuICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIGNyZWF0ZURhdGFzZXREaWFsb2coZGF0YT86IGFueSkge1xyXG4gICAgY29uc3QgZHNDcmVhdGVDb25maWcgPSBuZXcgTWF0RGlhbG9nQ29uZmlnKCk7XHJcbiAgICBkc0NyZWF0ZUNvbmZpZy5kYXRhID0ge1xyXG4gICAgICBkYXRhXHJcbiAgICB9O1xyXG4gICAgZHNDcmVhdGVDb25maWcubWF4V2lkdGggPSAnMTAwMHB4JztcclxuICAgIGRzQ3JlYXRlQ29uZmlnLmRpc2FibGVDbG9zZSA9IHRydWU7XHJcblxyXG4gICAgbGV0IHNhdmVSZWYgPSB0aGlzLmRpYWxvZy5vcGVuKENyZWF0ZURhdGFzZXRNb2RhbCwgZHNDcmVhdGVDb25maWcpO1xyXG5cclxuICAgIHNhdmVSZWYuYWZ0ZXJDbG9zZWQoKS5zdWJzY3JpYmUoYXR0cmlidXRlcyA9PiB7XHJcbiAgICAgIGlmIChhdHRyaWJ1dGVzLmRhdGFzZXROYW1lVHlwZSA9PSAnTElCUkFSWScpIHtcclxuICAgICAgICBhdHRyaWJ1dGVzLmRhdGFzZXROYW1lVHlwZSA9ICdQRFNFJztcclxuICAgICAgfVxyXG4gICAgICBpZiAoYXR0cmlidXRlcykge1xyXG4gICAgICAgIGNvbnN0IGRhdGFzZXRBdHRyaWJ1dGVzID0ge1xyXG4gICAgICAgICAgbmRpc3A6ICdDQVRBTE9HJyxcclxuICAgICAgICAgIHN0YXR1czogJ05FVycsXHJcbiAgICAgICAgICBzcGFjZTogYXR0cmlidXRlcy5hbGxvY2F0aW9uVW5pdCxcclxuICAgICAgICAgIGRzb3JnOiBhdHRyaWJ1dGVzLm9yZ2FuaXphdGlvbixcclxuICAgICAgICAgIGxyZWNsOiBwYXJzZUludChhdHRyaWJ1dGVzLnJlY29yZExlbmd0aCksXHJcbiAgICAgICAgICByZWNmbTogYXR0cmlidXRlcy5yZWNvcmRGb3JtYXQsXHJcbiAgICAgICAgICBkaXI6IHBhcnNlSW50KGF0dHJpYnV0ZXMuZGlyZWN0b3J5QmxvY2tzKSxcclxuICAgICAgICAgIHByaW1lOiBwYXJzZUludChhdHRyaWJ1dGVzLnByaW1hcnlTcGFjZSksXHJcbiAgICAgICAgICBzZWNuZDogcGFyc2VJbnQoYXR0cmlidXRlcy5zZWNvbmRhcnlTcGFjZSksXHJcbiAgICAgICAgICBkc250OiBhdHRyaWJ1dGVzLmRhdGFzZXROYW1lVHlwZSxcclxuICAgICAgICAgIGNsb3NlOiAndHJ1ZSdcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChhdHRyaWJ1dGVzLmF2ZXJhZ2VSZWNvcmRVbml0KSB7XHJcbiAgICAgICAgICBkYXRhc2V0QXR0cmlidXRlc1snYXZnciddID0gYXR0cmlidXRlcy5hdmVyYWdlUmVjb3JkVW5pdDtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMuYmxvY2tTaXplKSB7XHJcbiAgICAgICAgICBkYXRhc2V0QXR0cmlidXRlc1snYmxrc3onXSA9IHBhcnNlSW50KGF0dHJpYnV0ZXMuYmxvY2tTaXplKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHRoaXMuZGF0YXNldFNlcnZpY2UuY3JlYXRlRGF0YXNldChkYXRhc2V0QXR0cmlidXRlcywgYXR0cmlidXRlcy5uYW1lKS5zdWJzY3JpYmUocmVzcCA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oYERhdGFzZXQ6ICR7YXR0cmlidXRlcy5uYW1lfSBjcmVhdGVkIHN1Y2Nlc3NmdWxseS5gLCAnRGlzbWlzcycsIHF1aWNrU25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgIHRoaXMuY3JlYXRlRGF0YXNldC5lbWl0KHsgc3RhdHVzOiAnc3VjY2VzcycsIG5hbWU6IGF0dHJpYnV0ZXMubmFtZSwgb3JnOiBhdHRyaWJ1dGVzLm9yZ2FuaXphdGlvbiwgaW5pdERhdGE6IGRzQ3JlYXRlQ29uZmlnLmRhdGEuZGF0YSB9KTtcclxuICAgICAgICB9LCBlcnJvciA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oYEZhaWxlZCB0byBjcmVhdGUgdGhlIGRhdGFzZXQ6ICR7ZXJyb3IuZXJyb3J9YCwgJ0Rpc21pc3MnLCBsb25nU25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgIHRoaXMuY3JlYXRlRGF0YXNldC5lbWl0KHsgc3RhdHVzOiAnZXJyb3InLCBlcnJvcjogZXJyb3IuZXJyb3IsIG5hbWU6IGF0dHJpYnV0ZXMubmFtZSB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuXHJcblxyXG5cclxuLypcclxuICBUaGlzIHByb2dyYW0gYW5kIHRoZSBhY2NvbXBhbnlpbmcgbWF0ZXJpYWxzIGFyZVxyXG4gIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRWNsaXBzZSBQdWJsaWMgTGljZW5zZSB2Mi4wIHdoaWNoIGFjY29tcGFuaWVzXHJcbiAgdGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXHJcbiAgXHJcbiAgU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcclxuICBcclxuICBDb3B5cmlnaHQgQ29udHJpYnV0b3JzIHRvIHRoZSBab3dlIFByb2plY3QuXHJcbiovXHJcbiIsIjwhLS1cblRoaXMgcHJvZ3JhbSBhbmQgdGhlIGFjY29tcGFueWluZyBtYXRlcmlhbHMgYXJlXG5tYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEVjbGlwc2UgUHVibGljIExpY2Vuc2UgdjIuMCB3aGljaCBhY2NvbXBhbmllc1xudGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXG5cblNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBFUEwtMi4wXG5cbkNvcHlyaWdodCBDb250cmlidXRvcnMgdG8gdGhlIFpvd2UgUHJvamVjdC5cbi0tPlxuXG48ZGl2IHN0eWxlPVwiaGVpZ2h0OiAxMDAlXCI+XG5cbiAgPCEtLSBUYWJzLCBzZWFyY2hiYXIsIGFuZCBsb2FkaW5nIGluZGljYXRvciAtLT5cbiAgQGlmIChzaG93VXBBcnJvdykge1xuICA8aW1nIFtzcmNdPVwiJy4vYXNzZXRzL2V4cGxvcmVyLXVwYXJyb3cucG5nJ1wiIGRhdGEtdG9nZ2xlPVwidG9vbHRpcFwiIGNsYXNzPVwiZmlsZWJyb3dzZXJtdnMtcG9pbnRlci1sb2dvXCJcbiAgICB0aXRsZT1cIkdvIHVwIHRvIHRoZSBwYXJlbnQgbGV2ZWxcIiAoY2xpY2spPVwibGV2ZWxVcCgpXCIgW25nU3R5bGVdPVwidHJlZVN0eWxlXCIgdGFiaW5kZXg9XCIwXCJcbiAgICAoa2V5ZG93bi5lbnRlcik9XCJsZXZlbFVwKClcIiAvPlxuICB9XG5cbiAgPGRpdiBjbGFzcz1cImZpbGVicm93c2VybXZzLXNlYXJjaFwiIFtuZ1N0eWxlXT1cInNlYXJjaFN0eWxlXCI+XG4gICAgPGRpdiBjbGFzcz1cInNlYXJjaFJvd0ZsZXhcIj5cbiAgICAgIDxpbnB1dCBbKG5nTW9kZWwpXT1cInBhdGhcIiBsaXN0PVwic2VhcmNoTVZTSGlzdG9yeVwiIHBsYWNlaG9sZGVyPVwiRW50ZXIgYSBkYXRhc2V0IHF1ZXJ5Li4uXCJcbiAgICAgICAgY2xhc3M9XCJmaWxlYnJvd3Nlcm12cy1zZWFyY2gtaW5wdXRcIiAoa2V5ZG93bi5lbnRlcik9XCJ1cGRhdGVUcmVlVmlldyhwYXRoKTtcIiBbbmdTdHlsZV09XCJpbnB1dFN0eWxlXCI+XG4gICAgICA8IS0tIFRPRE86IG1ha2Ugc2VhcmNoIGhpc3RvcnkgYSBkaXJlY3RpdmUgdG8gdXNlIGluIGJvdGggdXNzIGFuZCBtdnMtLT5cbiAgICAgIDxtYXQtYnV0dG9uLXRvZ2dsZS1ncm91cCBpZD1cInF1YWxHcm91cFwiICNncm91cD1cIm1hdEJ1dHRvblRvZ2dsZUdyb3VwXCI+XG4gICAgICAgIDxtYXQtYnV0dG9uLXRvZ2dsZSBbY2hlY2tlZF09XCJhZGRpdGlvbmFsUXVhbGlmaWVyc1wiIGNsYXNzPVwicXVhbEJ1dHRvblwiXG4gICAgICAgICAgKGNsaWNrKT1cImFkZGl0aW9uYWxRdWFsaWZpZXJzID0gIWFkZGl0aW9uYWxRdWFsaWZpZXJzXCIgYXJpYS1sYWJlbD1cIkluY2x1ZGUgYWRkaXRpb25hbCBxdWFsaWZpZXJzXCJcbiAgICAgICAgICB0aXRsZT1cIkluY2x1ZGUgQWRkaXRpb25hbCBRdWFsaWZpZXJzXCI+XG4gICAgICAgICAgPHN0cm9uZz4uKio8L3N0cm9uZz5cbiAgICAgICAgPC9tYXQtYnV0dG9uLXRvZ2dsZT5cbiAgICAgIDwvbWF0LWJ1dHRvbi10b2dnbGUtZ3JvdXA+XG4gICAgICA8ZGF0YWxpc3QgaWQ9XCJzZWFyY2hNVlNIaXN0b3J5XCI+XG4gICAgICAgIEBmb3IgKGl0ZW0gb2YgbXZzU2VhcmNoSGlzdG9yeS5zZWFyY2hIaXN0b3J5VmFsOyB0cmFjayBpdGVtKSB7XG4gICAgICAgIDxvcHRpb24gW3ZhbHVlXT1cIml0ZW1cIj48L29wdGlvbj5cbiAgICAgICAgfVxuICAgICAgPC9kYXRhbGlzdD5cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG5cbiAgPGRpdiBjbGFzcz1cImZhIGZhLXNwaW5uZXIgZmEtc3BpbiBmaWxlYnJvd3Nlcm12cy1sb2FkaW5nLWljb25cIiBbaGlkZGVuXT1cIiFpc0xvYWRpbmdcIj48L2Rpdj5cbiAgPGRpdiBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmlsZWJyb3dzZXJtdnMtbG9hZGluZy1pY29uXCIgdGl0bGU9XCJSZWZyZXNoIGRhdGFzZXQgbGlzdFwiIChjbGljayk9XCJ1cGRhdGVUcmVlVmlldyhwYXRoKTtcIlxuICAgIFtoaWRkZW5dPVwiaXNMb2FkaW5nXCIgc3R5bGU9XCJtYXJnaW4tbGVmdDogOXB4OyBjdXJzb3I6IHBvaW50ZXI7XCI+PC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJmaWxlLXRyZWUtdXRpbGl0aWVzXCI+XG4gICAgPGRpdiBjbGFzcz1cImZhIGZhLW1pbnVzLXNxdWFyZS1vIGZpbGVicm93c2VydXNzLWNvbGxhcHNlLWljb25cIiB0aXRsZT1cIkNvbGxhcHNlIEZvbGRlcnMgaW4gRXhwbG9yZXJcIlxuICAgICAgKGNsaWNrKT1cImNvbGxhcHNlVHJlZSgpO1wiIHN0eWxlPVwibWFyZ2luLXJpZ2h0OiA5cHg7IGZsb2F0OnJpZ2h0OyBjdXJzb3I6IHBvaW50ZXI7XCI+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImZhIGZhLXRyYXNoLW8gZmlsZWJyb3dzZXJ1c3MtZGVsZXRlLWljb25cIiB0aXRsZT1cIkRlbGV0ZVwiIChjbGljayk9XCJzaG93RGVsZXRlRGlhbG9nKHNlbGVjdGVkTm9kZSk7XCJcbiAgICAgIHN0eWxlPVwibWFyZ2luLXJpZ2h0OiA5cHg7IGZsb2F0OnJpZ2h0OyBjdXJzb3I6IHBvaW50ZXI7XCI+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImZhIGZhLXBsdXNcIiB0aXRsZT1cIkNyZWF0ZSBuZXcgZGF0YXNldFwiIChjbGljayk9XCJjcmVhdGVEYXRhc2V0RGlhbG9nKClcIlxuICAgICAgc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDlweDsgZmxvYXQ6cmlnaHQ7IGN1cnNvcjogcG9pbnRlcjtcIj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwiZmEgZmEtZXJhc2VyIGZpbGVicm93c2VyLWljb24gc3BlY2lhbC11dGlsaXR5XCIgdGl0bGU9XCJDbGVhciBTZWFyY2ggSGlzdG9yeVwiXG4gICAgICAoY2xpY2spPVwiY2xlYXJTZWFyY2hIaXN0b3J5KCk7XCI+PC9kaXY+XG4gIDwvZGl2PlxuICA8IS0tIE1haW4gdHJlZSAtLT5cbiAgPGRpdiBbaGlkZGVuXT1cImhpZGVFeHBsb3JlclwiIHN0eWxlPVwiaGVpZ2h0OiAxMDAlO1wiPlxuICAgIDx0cmVlLXJvb3QgW3RyZWVEYXRhXT1cImRhdGFcIiAoY2xpY2tFdmVudCk9XCJvbk5vZGVDbGljaygkZXZlbnQpXCIgKGRibENsaWNrRXZlbnQpPVwib25Ob2RlRGJsQ2xpY2soJGV2ZW50KVwiXG4gICAgICBbc3R5bGVdPVwic3R5bGVcIiAocmlnaHRDbGlja0V2ZW50KT1cIm9uTm9kZVJpZ2h0Q2xpY2soJGV2ZW50KVwiIChwYW5lbFJpZ2h0Q2xpY2tFdmVudCk9XCJvblBhbmVsUmlnaHRDbGljaygkZXZlbnQpXCJcbiAgICAgIChkYXRhQ2hhbmdlZCk9XCJvbkRhdGFDaGFuZ2VkKCRldmVudClcIj5cbiAgICA8L3RyZWUtcm9vdD5cbiAgPC9kaXY+XG5cbiAgQGlmIChzaG93U2VhcmNoKSB7XG4gIDxkaXYgY2xhc3M9XCJ1aS1pbnB1dGdyb3VwIGZpbGVicm93c2VydXNzLXNlYXJjaC1ib3R0b20tZ3JvdXBcIj5cbiAgICA8c3BhbiBjbGFzcz1cInVpLWlucHV0Z3JvdXAtYWRkb25cIj48aSBjbGFzcz1cImZhIGZhLXNlYXJjaCBmaWxlYnJvd3NlcnVzcy1zZWFyY2gtYm90dG9tLWljb25cIj48L2k+PC9zcGFuPlxuICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHBJbnB1dFRleHQgcGxhY2Vob2xkZXI9XCJTZWFyY2ggZGF0YXNldHMvbWVtYmVycyBieSBuYW1lLi4uXCJcbiAgICAgIGNsYXNzPVwiZmlsZWJyb3dzZXJ1c3Mtc2VhcmNoLWJvdHRvbS1pbnB1dFwiIFtmb3JtQ29udHJvbF09XCJzZWFyY2hDdHJsXCIgI3NlYXJjaE1WUz5cbiAgPC9kaXY+XG4gIH1cbjwvZGl2PlxuPCEtLVxuICAgIFRoaXMgcHJvZ3JhbSBhbmQgdGhlIGFjY29tcGFueWluZyBtYXRlcmlhbHMgYXJlXG4gICAgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcbiAgICB0aGlzIGRpc3RyaWJ1dGlvbiwgYW5kIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5lY2xpcHNlLm9yZy9sZWdhbC9lcGwtdjIwLmh0bWxcblxuICAgIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBFUEwtMi4wXG5cbiAgICBDb3B5cmlnaHQgQ29udHJpYnV0b3JzIHRvIHRoZSBab3dlIFByb2plY3QuXG4gICAgLS0+Il19