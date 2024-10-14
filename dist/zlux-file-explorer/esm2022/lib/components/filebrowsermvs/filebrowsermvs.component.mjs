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
        if (this.saveHistorySubscription) {
            this.saveHistorySubscription.unsubscribe();
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
            .subscribe({
            next: resp => {
                this.isLoading = false;
                this.snackBar.open(resp.msg, 'Dismiss', defaultSnackbarOptions);
                this.removeChild(rightClickedFile);
                this.deletionQueue.delete(rightClickedFile.data.path);
                rightClickedFile.styleClass = "";
                this.deleteClick.emit(this.rightClickedEvent.node);
            },
            error: error => {
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
            }
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
            .subscribe({
            next: resp => {
                this.isLoading = false;
                this.snackBar.open(resp.msg, 'Dismiss', defaultSnackbarOptions);
                //Update vs removing node since symbolicly linked data/index of vsam can be named anything
                this.updateTreeView(this.path);
                this.deletionQueue.delete(rightClickedFile.data.path);
                rightClickedFile.styleClass = "";
                this.deleteClick.emit(this.rightClickedEvent.node);
            },
            error: error => {
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
            }
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
                .subscribe({
                next: attrs => {
                    this.updateRecalledDatasetNode($event.node, attrs);
                    if (this.showSearch) { // Update search bar cached data
                        let nodeCached = this.findNodeByPath(this.dataCached, $event.node.data.path)[0];
                        if (nodeCached) {
                            this.updateRecalledDatasetNode(nodeCached, attrs);
                        }
                    }
                    this.nodeClick.emit($event.node);
                },
                error: _err => this.snackBar.open(`Failed to recall dataset '${path}'`, 'Dismiss', defaultSnackbarOptions)
            });
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
            this.datasetService.queryDatasets(path, true, this.additionalQualifiers).pipe(take(1)).subscribe({
                next: (res) => {
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
                },
                error: (err) => {
                    this.isLoading = false;
                    reject(err);
                }
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
        this.saveHistorySubscription = this.mvsSearchHistory
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
                this.datasetService.createDataset(datasetAttributes, attributes.name).subscribe({
                    next: resp => {
                        this.snackBar.open(`Dataset: ${attributes.name} created successfully.`, 'Dismiss', quickSnackbarOptions);
                        this.createDataset.emit({ status: 'success', name: attributes.name, org: attributes.organization, initData: dsCreateConfig.data.data });
                    },
                    error: error => {
                        this.snackBar.open(`Failed to create the dataset: ${error.error}`, 'Dismiss', longSnackbarOptions);
                        this.createDataset.emit({ status: 'error', error: error.error, name: attributes.name });
                    }
                });
            }
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FileBrowserMVSComponent, deps: [{ token: i0.ElementRef }, { token: i1.UtilsService }, { token: i2.SearchHistoryService }, { token: i3.MatSnackBar }, { token: i4.DatasetCrudService }, { token: i5.DownloaderService }, { token: i6.MatDialog }, { token: Angular2InjectionTokens.LOGGER }, { token: Angular2InjectionTokens.PLUGIN_DEFINITION }, { token: Angular2InjectionTokens.WINDOW_ACTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: FileBrowserMVSComponent, selector: "file-browser-mvs", inputs: { inputStyle: "inputStyle", searchStyle: "searchStyle", treeStyle: "treeStyle", style: "style", showUpArrow: "showUpArrow" }, outputs: { pathChanged: "pathChanged", dataChanged: "dataChanged", nodeClick: "nodeClick", nodeDblClick: "nodeDblClick", rightClick: "rightClick", deleteClick: "deleteClick", openInNewTab: "openInNewTab", createDataset: "createDataset" }, providers: [DatasetCrudService, /*PersistentDataService,*/ SearchHistoryService], viewQueries: [{ propertyName: "treeComponent", first: true, predicate: TreeComponent, descendants: true }, { propertyName: "searchMVS", first: true, predicate: ["searchMVS"], descendants: true }], ngImport: i0, template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n\n<div style=\"height: 100%\">\n\n  <!-- Tabs, searchbar, and loading indicator -->\n  @if (showUpArrow) {\n  <img data-toggle=\"tooltip\" class=\"filebrowsermvs-pointer-logo\" title=\"Go up to the parent level\" (click)=\"levelUp()\"\n    [ngStyle]=\"treeStyle\" tabindex=\"0\" (keydown.enter)=\"levelUp()\" />\n  }\n\n  <div class=\"filebrowsermvs-search\" [ngStyle]=\"searchStyle\">\n    <div class=\"searchRowFlex\">\n      <input [(ngModel)]=\"path\" list=\"searchMVSHistory\" placeholder=\"Enter a dataset query...\"\n        class=\"filebrowsermvs-search-input\" (keydown.enter)=\"updateTreeView(path);\" [ngStyle]=\"inputStyle\">\n      <!-- TODO: make search history a directive to use in both uss and mvs-->\n      <mat-button-toggle-group id=\"qualGroup\" #group=\"matButtonToggleGroup\">\n        <mat-button-toggle [checked]=\"additionalQualifiers\" class=\"qualButton\"\n          (click)=\"additionalQualifiers = !additionalQualifiers\" aria-label=\"Include additional qualifiers\"\n          title=\"Include Additional Qualifiers\">\n          <strong>.**</strong>\n        </mat-button-toggle>\n      </mat-button-toggle-group>\n      <datalist id=\"searchMVSHistory\">\n        @for (item of mvsSearchHistory.searchHistoryVal; track item) {\n        <option [value]=\"item\"></option>\n        }\n      </datalist>\n    </div>\n  </div>\n\n  <div class=\"fa fa-spinner fa-spin filebrowsermvs-loading-icon\" [hidden]=\"!isLoading\"></div>\n  <div class=\"fa fa-refresh filebrowsermvs-loading-icon\" title=\"Refresh dataset list\" (click)=\"updateTreeView(path);\"\n    [hidden]=\"isLoading\" style=\"margin-left: 9px; cursor: pointer;\"></div>\n  <div class=\"file-tree-utilities\">\n    <div class=\"fa fa-minus-square-o filebrowseruss-collapse-icon\" title=\"Collapse Folders in Explorer\"\n      (click)=\"collapseTree();\" style=\"margin-right: 9px; float:right; cursor: pointer;\"></div>\n    <div class=\"fa fa-trash-o filebrowseruss-delete-icon\" title=\"Delete\" (click)=\"showDeleteDialog(selectedNode);\"\n      style=\"margin-right: 9px; float:right; cursor: pointer;\"></div>\n    <div class=\"fa fa-plus\" title=\"Create new dataset\" (click)=\"createDatasetDialog()\"\n      style=\"margin-right: 9px; float:right; cursor: pointer;\"></div>\n    <div class=\"fa fa-eraser filebrowser-icon special-utility\" title=\"Clear Search History\"\n      (click)=\"clearSearchHistory();\"></div>\n  </div>\n  <!-- Main tree -->\n  <div [hidden]=\"hideExplorer\" style=\"height: 100%;\">\n    <tree-root [treeData]=\"data\" (clickEvent)=\"onNodeClick($event)\" (dblClickEvent)=\"onNodeDblClick($event)\"\n      [style]=\"style\" (rightClickEvent)=\"onNodeRightClick($event)\" (panelRightClickEvent)=\"onPanelRightClick($event)\"\n      (dataChanged)=\"onDataChanged($event)\">\n    </tree-root>\n  </div>\n\n  @if (showSearch) {\n  <div class=\"p-inputgroup filebrowseruss-search-bottom-group\">\n    <span class=\"p-inputgroup-addon\"><i class=\"fa fa-search filebrowseruss-search-bottom-icon\"></i></span>\n    <input type=\"text\" pInputText placeholder=\"Search datasets/members by name...\"\n      class=\"filebrowseruss-search-bottom-input\" [formControl]=\"searchCtrl\" #searchMVS>\n  </div>\n  }\n</div>\n<!--\n    This program and the accompanying materials are\n    made available under the terms of the Eclipse Public License v2.0 which accompanies\n    this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n    SPDX-License-Identifier: EPL-2.0\n\n    Copyright Contributors to the Zowe Project.\n    -->", styles: [".searchRowFlex{display:flex;flex-direction:row}.filebrowsermvs-search{width:fit-content;min-width:250px;margin-left:5px;display:inline-block;height:40px}.filebrowsermvs-search-input{width:100%;min-height:30px;font-family:sans-serif;font-size:15px;height:35px;background-color:#464646;color:#fff;padding-left:5px;border:0px;flex-grow:2}.filebrowsermvs-pointer-logo{content:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsSAAALEgHS3X78AAAA2UlEQVQ4y7XRwUkEQRSE4c9xDcAEFCYFYzCFCaGDavQgeDOEWTQBA1AQ9KCgpxUEQVh3vLyBgdnuw4APGprqqp96NP85KaU2pdTWPE0tjB73NUhTCd+ixTHuSpCmEO5xil2cE/T7IE0h3OIBWwx4Cm0GaQrhNS5xEIDr0GaQaYNx3zU6fAegiXs3gZzNADnnMdjlnDch76LBEFqH85zzzZhbTfcJyL4VD+N9Ey3q3xjzO/FsS6ZVBTDECpYCPvATDd6XAF7xEp63JYBnXOAIj0sAn7iK+1fJ9AcOn0qIhbHEXwAAAABJRU5ErkJggg==);width:20px;height:20px;filter:brightness(3);cursor:pointer}.p-tree-empty-message{color:transparent;height:0px}.filebrowsermvs-node-deleting{opacity:.5}#qualGroup{max-height:35px;min-height:30px}.qualButton:not(.mat-button-toggle-checked){background-color:#464646;color:#757575}.file-tree-utilities{overflow:hidden;border:1px solid #464646}.filebrowsermvs-loading-icon{margin-left:8px!important;font-size:large!important}.filebrowser-icon{margin-right:9px;float:right;cursor:pointer}.special-utility{margin-left:9px}\n"], dependencies: [{ kind: "directive", type: i7.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "directive", type: i8.NgSelectOption, selector: "option", inputs: ["ngValue", "value"] }, { kind: "directive", type: i8.ɵNgSelectMultipleOption, selector: "option", inputs: ["ngValue", "value"] }, { kind: "directive", type: i8.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i8.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i8.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i9.MatButtonToggleGroup, selector: "mat-button-toggle-group", inputs: ["appearance", "name", "vertical", "value", "multiple", "disabled", "hideSingleSelectionIndicator", "hideMultipleSelectionIndicator"], outputs: ["valueChange", "change"], exportAs: ["matButtonToggleGroup"] }, { kind: "component", type: i9.MatButtonToggle, selector: "mat-button-toggle", inputs: ["aria-label", "aria-labelledby", "id", "name", "value", "tabIndex", "disableRipple", "appearance", "checked", "disabled"], outputs: ["change"], exportAs: ["matButtonToggle"] }, { kind: "directive", type: i10.InputText, selector: "[pInputText]", inputs: ["variant"] }, { kind: "directive", type: i8.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }, { kind: "component", type: i11.TreeComponent, selector: "tree-root", inputs: ["treeData", "treeId", "style", "treeStyle"], outputs: ["clickEvent", "dblClickEvent", "rightClickEvent", "panelRightClickEvent"] }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FileBrowserMVSComponent, decorators: [{
            type: Component,
            args: [{ selector: 'file-browser-mvs', encapsulation: ViewEncapsulation.None, providers: [DatasetCrudService, /*PersistentDataService,*/ SearchHistoryService], template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n\n<div style=\"height: 100%\">\n\n  <!-- Tabs, searchbar, and loading indicator -->\n  @if (showUpArrow) {\n  <img data-toggle=\"tooltip\" class=\"filebrowsermvs-pointer-logo\" title=\"Go up to the parent level\" (click)=\"levelUp()\"\n    [ngStyle]=\"treeStyle\" tabindex=\"0\" (keydown.enter)=\"levelUp()\" />\n  }\n\n  <div class=\"filebrowsermvs-search\" [ngStyle]=\"searchStyle\">\n    <div class=\"searchRowFlex\">\n      <input [(ngModel)]=\"path\" list=\"searchMVSHistory\" placeholder=\"Enter a dataset query...\"\n        class=\"filebrowsermvs-search-input\" (keydown.enter)=\"updateTreeView(path);\" [ngStyle]=\"inputStyle\">\n      <!-- TODO: make search history a directive to use in both uss and mvs-->\n      <mat-button-toggle-group id=\"qualGroup\" #group=\"matButtonToggleGroup\">\n        <mat-button-toggle [checked]=\"additionalQualifiers\" class=\"qualButton\"\n          (click)=\"additionalQualifiers = !additionalQualifiers\" aria-label=\"Include additional qualifiers\"\n          title=\"Include Additional Qualifiers\">\n          <strong>.**</strong>\n        </mat-button-toggle>\n      </mat-button-toggle-group>\n      <datalist id=\"searchMVSHistory\">\n        @for (item of mvsSearchHistory.searchHistoryVal; track item) {\n        <option [value]=\"item\"></option>\n        }\n      </datalist>\n    </div>\n  </div>\n\n  <div class=\"fa fa-spinner fa-spin filebrowsermvs-loading-icon\" [hidden]=\"!isLoading\"></div>\n  <div class=\"fa fa-refresh filebrowsermvs-loading-icon\" title=\"Refresh dataset list\" (click)=\"updateTreeView(path);\"\n    [hidden]=\"isLoading\" style=\"margin-left: 9px; cursor: pointer;\"></div>\n  <div class=\"file-tree-utilities\">\n    <div class=\"fa fa-minus-square-o filebrowseruss-collapse-icon\" title=\"Collapse Folders in Explorer\"\n      (click)=\"collapseTree();\" style=\"margin-right: 9px; float:right; cursor: pointer;\"></div>\n    <div class=\"fa fa-trash-o filebrowseruss-delete-icon\" title=\"Delete\" (click)=\"showDeleteDialog(selectedNode);\"\n      style=\"margin-right: 9px; float:right; cursor: pointer;\"></div>\n    <div class=\"fa fa-plus\" title=\"Create new dataset\" (click)=\"createDatasetDialog()\"\n      style=\"margin-right: 9px; float:right; cursor: pointer;\"></div>\n    <div class=\"fa fa-eraser filebrowser-icon special-utility\" title=\"Clear Search History\"\n      (click)=\"clearSearchHistory();\"></div>\n  </div>\n  <!-- Main tree -->\n  <div [hidden]=\"hideExplorer\" style=\"height: 100%;\">\n    <tree-root [treeData]=\"data\" (clickEvent)=\"onNodeClick($event)\" (dblClickEvent)=\"onNodeDblClick($event)\"\n      [style]=\"style\" (rightClickEvent)=\"onNodeRightClick($event)\" (panelRightClickEvent)=\"onPanelRightClick($event)\"\n      (dataChanged)=\"onDataChanged($event)\">\n    </tree-root>\n  </div>\n\n  @if (showSearch) {\n  <div class=\"p-inputgroup filebrowseruss-search-bottom-group\">\n    <span class=\"p-inputgroup-addon\"><i class=\"fa fa-search filebrowseruss-search-bottom-icon\"></i></span>\n    <input type=\"text\" pInputText placeholder=\"Search datasets/members by name...\"\n      class=\"filebrowseruss-search-bottom-input\" [formControl]=\"searchCtrl\" #searchMVS>\n  </div>\n  }\n</div>\n<!--\n    This program and the accompanying materials are\n    made available under the terms of the Eclipse Public License v2.0 which accompanies\n    this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n    SPDX-License-Identifier: EPL-2.0\n\n    Copyright Contributors to the Zowe Project.\n    -->", styles: [".searchRowFlex{display:flex;flex-direction:row}.filebrowsermvs-search{width:fit-content;min-width:250px;margin-left:5px;display:inline-block;height:40px}.filebrowsermvs-search-input{width:100%;min-height:30px;font-family:sans-serif;font-size:15px;height:35px;background-color:#464646;color:#fff;padding-left:5px;border:0px;flex-grow:2}.filebrowsermvs-pointer-logo{content:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsSAAALEgHS3X78AAAA2UlEQVQ4y7XRwUkEQRSE4c9xDcAEFCYFYzCFCaGDavQgeDOEWTQBA1AQ9KCgpxUEQVh3vLyBgdnuw4APGprqqp96NP85KaU2pdTWPE0tjB73NUhTCd+ixTHuSpCmEO5xil2cE/T7IE0h3OIBWwx4Cm0GaQrhNS5xEIDr0GaQaYNx3zU6fAegiXs3gZzNADnnMdjlnDch76LBEFqH85zzzZhbTfcJyL4VD+N9Ey3q3xjzO/FsS6ZVBTDECpYCPvATDd6XAF7xEp63JYBnXOAIj0sAn7iK+1fJ9AcOn0qIhbHEXwAAAABJRU5ErkJggg==);width:20px;height:20px;filter:brightness(3);cursor:pointer}.p-tree-empty-message{color:transparent;height:0px}.filebrowsermvs-node-deleting{opacity:.5}#qualGroup{max-height:35px;min-height:30px}.qualButton:not(.mat-button-toggle-checked){background-color:#464646;color:#757575}.file-tree-utilities{overflow:hidden;border:1px solid #464646}.filebrowsermvs-loading-icon{margin-left:8px!important;font-size:large!important}.filebrowser-icon{margin-right:9px;float:right;cursor:pointer}.special-utility{margin-left:9px}\n"] }]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZWJyb3dzZXJtdnMuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemx1eC1maWxlLWV4cGxvcmVyL3NyYy9saWIvY29tcG9uZW50cy9maWxlYnJvd3Nlcm12cy9maWxlYnJvd3Nlcm12cy5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96bHV4LWZpbGUtZXhwbG9yZXIvc3JjL2xpYi9jb21wb25lbnRzL2ZpbGVicm93c2VybXZzL2ZpbGVicm93c2VybXZzLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBOzs7Ozs7OztFQVFFO0FBR0YsT0FBTyxFQUFFLFNBQVMsRUFBc0IsaUJBQWlCLEVBQWEsS0FBSyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdEosT0FBTyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFOUQsT0FBTyxFQUFFLHVCQUF1QixFQUFnRCxNQUFNLHFDQUFxQyxDQUFDO0FBRTVILE9BQU8sRUFBYSxlQUFlLEVBQWdCLE1BQU0sMEJBQTBCLENBQUM7QUFFcEYsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sZ0VBQWdFLENBQUM7QUFDeEcsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ25GLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxtQkFBbUIsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2xILE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU3QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxLQUFLLENBQUMsTUFBTSxRQUFRLENBQUM7QUFFNUIsY0FBYztBQUNk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YWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcclxuICBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEVjbGlwc2UgUHVibGljIExpY2Vuc2UgdjIuMCB3aGljaCBhY2NvbXBhbmllc1xyXG4gIHRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MjAuaHRtbFxyXG4gIFxyXG4gIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBFUEwtMi4wXHJcbiAgXHJcbiAgQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxyXG4qL1xyXG5cclxuXHJcbmltcG9ydCB7IENvbXBvbmVudCwgRWxlbWVudFJlZiwgT25Jbml0LCBWaWV3RW5jYXBzdWxhdGlvbiwgT25EZXN0cm95LCBJbnB1dCwgRXZlbnRFbWl0dGVyLCBPdXRwdXQsIEluamVjdCwgT3B0aW9uYWwsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyB0YWtlLCBmaW5hbGl6ZSwgZGVib3VuY2VUaW1lIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xyXG5pbXBvcnQgeyBQcm9qZWN0U3RydWN0dXJlLCBEYXRhc2V0QXR0cmlidXRlcywgTWVtYmVyIH0gZnJvbSAnLi4vLi4vc3RydWN0dXJlcy9lZGl0b3ItcHJvamVjdCc7XHJcbmltcG9ydCB7IEFuZ3VsYXIySW5qZWN0aW9uVG9rZW5zLCBBbmd1bGFyMlBsdWdpbldpbmRvd0FjdGlvbnMsIENvbnRleHRNZW51SXRlbSB9IGZyb20gJy4uLy4uLy4uL3BsdWdpbmxpYi9pbmplY3QtcmVzb3VyY2VzJztcclxuaW1wb3J0IHsgRG93bmxvYWRlclNlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9kb3dubG9hZGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBNYXREaWFsb2csIE1hdERpYWxvZ0NvbmZpZywgTWF0RGlhbG9nUmVmIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGlhbG9nJztcclxuaW1wb3J0IHsgTWF0U25hY2tCYXIgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9zbmFjay1iYXInO1xyXG5pbXBvcnQgeyBEYXRhc2V0UHJvcGVydGllc01vZGFsIH0gZnJvbSAnLi4vZGF0YXNldC1wcm9wZXJ0aWVzLW1vZGFsL2RhdGFzZXQtcHJvcGVydGllcy1tb2RhbC5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBEZWxldGVGaWxlTW9kYWwgfSBmcm9tICcuLi9kZWxldGUtZmlsZS1tb2RhbC9kZWxldGUtZmlsZS1tb2RhbC5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBkZWZhdWx0U25hY2tiYXJPcHRpb25zLCBsb25nU25hY2tiYXJPcHRpb25zLCBxdWlja1NuYWNrYmFyT3B0aW9ucyB9IGZyb20gJy4uLy4uL3NoYXJlZC9zbmFja2Jhci1vcHRpb25zJztcclxuaW1wb3J0IHsgRm9ybUNvbnRyb2wgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XHJcbmltcG9ydCB7IFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBUcmVlQ29tcG9uZW50IH0gZnJvbSAnLi4vdHJlZS90cmVlLmNvbXBvbmVudCc7XHJcbmltcG9ydCAqIGFzIF8gZnJvbSAnbG9kYXNoJztcclxuXHJcbi8qIFNlcnZpY2VzICovXHJcbmltcG9ydCB7IFNlYXJjaEhpc3RvcnlTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvc2VhcmNoSGlzdG9yeVNlcnZpY2UnO1xyXG5pbXBvcnQgeyBVdGlsc1NlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy91dGlscy5zZXJ2aWNlJztcclxuaW1wb3J0IHsgRGF0YXNldENydWRTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvZGF0YXNldC5jcnVkLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBDcmVhdGVEYXRhc2V0TW9kYWwgfSBmcm9tICcuLi9jcmVhdGUtZGF0YXNldC1tb2RhbC9jcmVhdGUtZGF0YXNldC1tb2RhbC5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBUcmVlTm9kZSB9IGZyb20gJ3ByaW1lbmcvYXBpJztcclxuLyogVE9ETzogcmUtaW1wbGVtZW50IHRvIGFkZCBmZXRjaGluZyBvZiBwcmV2aW91c2x5IG9wZW5lZCB0cmVlIHZpZXcgZGF0YVxyXG5pbXBvcnQgeyBQZXJzaXN0ZW50RGF0YVNlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9wZXJzaXN0ZW50RGF0YS5zZXJ2aWNlJzsgKi9cclxuXHJcbi8vIFVzZWQgZm9yIERTIGFzeW5jIGRlbGV0aW9uIFVYXHJcbmNvbnN0IENTU19OT0RFX0RFTEVUSU5HID0gXCJmaWxlYnJvd3Nlcm12cy1ub2RlLWRlbGV0aW5nXCI7XHJcbmNvbnN0IFNFQVJDSF9JRCA9ICdtdnMnO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICdmaWxlLWJyb3dzZXItbXZzJyxcclxuICB0ZW1wbGF0ZVVybDogJy4vZmlsZWJyb3dzZXJtdnMuY29tcG9uZW50Lmh0bWwnLFxyXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uLk5vbmUsXHJcbiAgc3R5bGVVcmxzOiBbJy4vZmlsZWJyb3dzZXJtdnMuY29tcG9uZW50LmNzcyddLFxyXG4gIHByb3ZpZGVyczogW0RhdGFzZXRDcnVkU2VydmljZSwgLypQZXJzaXN0ZW50RGF0YVNlcnZpY2UsKi8gU2VhcmNoSGlzdG9yeVNlcnZpY2VdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBGaWxlQnJvd3Nlck1WU0NvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgT25EZXN0cm95IHtcclxuXHJcbiAgLyogVE9ETzogTGVnYWN5LCBjYXBhYmlsaXRpZXMgY29kZSAodW51c2VkIGZvciBub3cpICovXHJcbiAgLy9JRmlsZUJyb3dzZXJNVlMsXHJcbiAgLy9jb21wb25lbnRDbGFzczpDb21wb25lbnRDbGFzcztcclxuICAvL2ZpbGVTZWxlY3RlZDogU3ViamVjdDxGaWxlQnJvd3NlckZpbGVTZWxlY3RlZEV2ZW50PjtcclxuICAvL2NhcGFiaWxpdGllczpBcnJheTxDYXBhYmlsaXR5PjtcclxuXHJcbiAgLyogVE9ETzogRmV0Y2hpbmcgdXBkYXRlcyBmb3IgYXV0b21hdGljIHJlZnJlc2ggKGRpc2FibGVkIGZvciBub3cpICovXHJcbiAgLy8gcHJpdmF0ZSBpbnRlcnZhbElkOiBhbnk7XHJcbiAgLy8gcHJpdmF0ZSB1cGRhdGVJbnRlcnZhbDogbnVtYmVyID0gMzAwMDAwMDtcclxuXHJcbiAgLyogVHJlZSBVSSBhbmQgbW9kYWxzICovXHJcbiAgQFZpZXdDaGlsZChUcmVlQ29tcG9uZW50KSBwcml2YXRlIHRyZWVDb21wb25lbnQ6IFRyZWVDb21wb25lbnQ7XHJcbiAgcHVibGljIGhpZGVFeHBsb3JlcjogYm9vbGVhbjtcclxuICBwcml2YXRlIHJpZ2h0Q2xpY2tQcm9wZXJ0aWVzUGFuZWw6IENvbnRleHRNZW51SXRlbVtdO1xyXG4gIHB1YmxpYyBpc0xvYWRpbmc6IGJvb2xlYW47XHJcbiAgcHJpdmF0ZSByaWdodENsaWNrUHJvcGVydGllc0RhdGFzZXRGaWxlOiBDb250ZXh0TWVudUl0ZW1bXTtcclxuICBwcml2YXRlIHJpZ2h0Q2xpY2tQcm9wZXJ0aWVzRGF0YXNldEZvbGRlcjogQ29udGV4dE1lbnVJdGVtW107XHJcblxyXG4gIC8qIFF1aWNrIHNlYXJjaCAoQWx0ICsgUCkgc3R1ZmYgKi9cclxuICBAVmlld0NoaWxkKCdzZWFyY2hNVlMnKSBwdWJsaWMgc2VhcmNoTVZTOiBFbGVtZW50UmVmO1xyXG4gIHNlYXJjaEN0cmw6IGFueTtcclxuICBwcml2YXRlIHNlYXJjaFZhbHVlU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XHJcbiAgcHJpdmF0ZSBzYXZlSGlzdG9yeVN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xyXG4gIHB1YmxpYyBzaG93U2VhcmNoOiBib29sZWFuO1xyXG5cclxuICAvKiBEYXRhIGFuZCBuYXZpZ2F0aW9uICovXHJcbiAgcHVibGljIHBhdGg6IHN0cmluZztcclxuICBwdWJsaWMgc2VsZWN0ZWROb2RlOiBhbnk7XHJcbiAgLy9UT0RPOiBEZWZpbmUgaW50ZXJmYWNlIHR5cGVzIGZvciBtdnMtZGF0YS9kYXRhXHJcbiAgcHVibGljIGRhdGE6IGFueTsgLy9NYWluIGRhdGEgZGlzcGxheWVkIGluIHRoZSB2aXN1YWwgdHJlZSBhcyBub2Rlc1xyXG4gIHByaXZhdGUgZGF0YUNhY2hlZDogYW55OyAgLy8gVXNlZCBmb3IgZmlsdGVyaW5nIGFnYWluc3QgcXVpY2sgc2VhcmNoXHJcbiAgcHJpdmF0ZSByaWdodENsaWNrZWRGaWxlOiBhbnk7XHJcbiAgLy9UT0RPOiBNYXkgbm90IG5lZWRlZCBhbnltb3JlPyAobWF5IG5lZWQgcmVwbGFjaW5nIHcvIHJpZ2h0Q2xpY2tlZEZpbGUpXHJcbiAgcHJpdmF0ZSByaWdodENsaWNrZWRFdmVudDogYW55O1xyXG4gIHByaXZhdGUgZGVsZXRpb25RdWV1ZSA9IG5ldyBNYXAoKTsgLy9EUyBkZWxldGlvbiBpcyBhc3luYywgc28gcXVldWUgaXMgdXNlZFxyXG4gIHByaXZhdGUgZGVsZXRlU3Vic2NyaXB0aW9uOiBTdWJzY3JpcHRpb247XHJcbiAgLy9UT0RPOiBNYXkgbm90IG5lZWRlZCBhbnltb3JlPyAoY291bGQgYmUgY2xlYW5lZCB1cCBpbnRvIGRlbGV0ZVN1YnNjcmlwdGlvbilcclxuICBwcml2YXRlIGRlbGV0ZVZzYW1TdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcclxuICAvL1RPRE86IE1heSBub3QgbmVlZGVkIGFueW1vcmU/IChjb3VsZCBiZSBjbGVhbmVkIHVwIGludG8gZGVsZXRlU3Vic2NyaXB0aW9uKVxyXG4gIHByaXZhdGUgZGVsZXRlTm9uVnNhbVN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xyXG4gIHB1YmxpYyBhZGRpdGlvbmFsUXVhbGlmaWVyczogYm9vbGVhbjtcclxuXHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxlbWVudFJlZjogRWxlbWVudFJlZixcclxuICAgIHByaXZhdGUgdXRpbHM6IFV0aWxzU2VydmljZSxcclxuICAgIHB1YmxpYyBtdnNTZWFyY2hIaXN0b3J5OiBTZWFyY2hIaXN0b3J5U2VydmljZSxcclxuICAgIHB1YmxpYyBzbmFja0JhcjogTWF0U25hY2tCYXIsXHJcbiAgICBwdWJsaWMgZGF0YXNldFNlcnZpY2U6IERhdGFzZXRDcnVkU2VydmljZSxcclxuICAgIHB1YmxpYyBkb3dubG9hZFNlcnZpY2U6IERvd25sb2FkZXJTZXJ2aWNlLFxyXG4gICAgcHVibGljIGRpYWxvZzogTWF0RGlhbG9nLFxyXG4gICAgQEluamVjdChBbmd1bGFyMkluamVjdGlvblRva2Vucy5MT0dHRVIpIHByaXZhdGUgbG9nOiBaTFVYLkNvbXBvbmVudExvZ2dlcixcclxuICAgIEBJbmplY3QoQW5ndWxhcjJJbmplY3Rpb25Ub2tlbnMuUExVR0lOX0RFRklOSVRJT04pIHByaXZhdGUgcGx1Z2luRGVmaW5pdGlvbjogWkxVWC5Db250YWluZXJQbHVnaW5EZWZpbml0aW9uLFxyXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChBbmd1bGFyMkluamVjdGlvblRva2Vucy5XSU5ET1dfQUNUSU9OUykgcHJpdmF0ZSB3aW5kb3dBY3Rpb25zOiBBbmd1bGFyMlBsdWdpbldpbmRvd0FjdGlvbnNcclxuICApIHtcclxuICAgIC8qIFRPRE86IExlZ2FjeSwgY2FwYWJpbGl0aWVzIGNvZGUgKHVudXNlZCBmb3Igbm93KSAqL1xyXG4gICAgLy90aGlzLmNvbXBvbmVudENsYXNzID0gQ29tcG9uZW50Q2xhc3MuRmlsZUJyb3dzZXI7XHJcbiAgICAvL3RoaXMuaW5pdGFsaXplQ2FwYWJpbGl0aWVzKCk7XHJcbiAgICB0aGlzLm12c1NlYXJjaEhpc3Rvcnkub25Jbml0KFNFQVJDSF9JRCk7XHJcbiAgICB0aGlzLnBhdGggPSBcIlwiO1xyXG4gICAgdGhpcy5oaWRlRXhwbG9yZXIgPSBmYWxzZTtcclxuICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLmFkZGl0aW9uYWxRdWFsaWZpZXJzID0gdHJ1ZTtcclxuICAgIHRoaXMuc2hvd1NlYXJjaCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zZWFyY2hDdHJsID0gbmV3IEZvcm1Db250cm9sKCk7XHJcbiAgICB0aGlzLnNlYXJjaFZhbHVlU3Vic2NyaXB0aW9uID0gdGhpcy5zZWFyY2hDdHJsLnZhbHVlQ2hhbmdlcy5waXBlKFxyXG4gICAgICBkZWJvdW5jZVRpbWUoNTAwKSwgLy8gQnkgZGVmYXVsdCwgNTAwIG1zIHVudGlsIHVzZXIgaW5wdXQsIGZvciBxdWljayBzZWFyY2ggdG8gdXBkYXRlIHJlc3VsdHNcclxuICAgICkuc3Vic2NyaWJlKCh2YWx1ZSkgPT4geyB0aGlzLnNlYXJjaElucHV0Q2hhbmdlZCh2YWx1ZSkgfSk7XHJcbiAgICB0aGlzLnNlbGVjdGVkTm9kZSA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKiBDdXN0b21pemVhYmxlIHRyZWUgc3R5bGVzICovXHJcbiAgQElucHV0KCkgaW5wdXRTdHlsZTogYW55O1xyXG4gIEBJbnB1dCgpIHNlYXJjaFN0eWxlOiBhbnk7XHJcbiAgQElucHV0KCkgdHJlZVN0eWxlOiBhbnk7XHJcbiAgQElucHV0KCkgc3R5bGU6IGFueTtcclxuICBASW5wdXQoKSBzaG93VXBBcnJvdzogYm9vbGVhbjtcclxuXHJcbiAgLyogVHJlZSBvdXRnb2luZyBldmVudHMgKi9cclxuICBAT3V0cHV0KCkgcGF0aENoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIGRhdGFDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSBub2RlQ2xpY2s6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIG5vZGVEYmxDbGljazogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgcmlnaHRDbGljazogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgZGVsZXRlQ2xpY2s6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIG9wZW5Jbk5ld1RhYjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgY3JlYXRlRGF0YXNldCA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG5cclxuICBuZ09uSW5pdCgpIHtcclxuICAgIC8vIFRPRE86IEZldGNoaW5nIHVwZGF0ZXMgZm9yIGF1dG9tYXRpYyByZWZyZXNoIChkaXNhYmxlZCBmb3Igbm93KVxyXG4gICAgLy8gdGhpcy5pbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgLy8gICBpZih0aGlzLmRhdGEpe1xyXG4gICAgLy8gICAgIHRoaXMuZ2V0VHJlZUZvclF1ZXJ5QXN5bmModGhpcy5wYXRoKS50aGVuKChyZXNwb25zZTogYW55KSA9PiB7XHJcbiAgICAvLyAgICAgICBsZXQgbmV3RGF0YSA9IHJlc3BvbnNlO1xyXG4gICAgLy8gICAgICAgdGhpcy51cGRhdGVUcmVlRGF0YSh0aGlzLmRhdGEsIG5ld0RhdGEpO1xyXG5cclxuICAgIC8vICAgICAgIGlmICh0aGlzLnNob3dTZWFyY2gpIHtcclxuICAgIC8vICAgICAgICAgaWYgKHRoaXMuZGF0YUNhY2hlZCkge1xyXG4gICAgLy8gICAgICAgICAgIHRoaXMudXBkYXRlVHJlZURhdGEodGhpcy5kYXRhQ2FjaGVkLCBuZXdEYXRhKTtcclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgfVxyXG4gICAgLy8gICAgICAgLyogV2UgZG9uJ3QgdXBkYXRlIHNlYXJjaCBoaXN0b3J5LCBub3IgZW1pdCBwYXRoIGNoYW5nZWQgZXZlbnQsIGJlY2F1c2UgdGhpcyBtZXRob2QgaXMgbWVhbnRcclxuICAgIC8vICAgICAgIHRvIGJlIGEgZmV0Y2hlZCB1cGRhdGUsIG5vdCBhIHVzZXIgYWN0aW9uIG5ldyBwYXRoICovXHJcbiAgICAvLyAgICAgfSk7XHJcbiAgICAvLyAgIH1cclxuICAgIC8vIH0sIHRoaXMudXBkYXRlSW50ZXJ2YWwpO1xyXG4gICAgdGhpcy5pbml0aWFsaXplUmlnaHRDbGlja1Byb3BlcnRpZXMoKTtcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgaWYgKHRoaXMuc2VhcmNoVmFsdWVTdWJzY3JpcHRpb24pIHtcclxuICAgICAgdGhpcy5zZWFyY2hWYWx1ZVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuZGVsZXRlU3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgIHRoaXMuZGVsZXRlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5kZWxldGVOb25Wc2FtU3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgIHRoaXMuZGVsZXRlTm9uVnNhbVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgfVxyXG4gICAgaWYgKHRoaXMuZGVsZXRlVnNhbVN1YnNjcmlwdGlvbikge1xyXG4gICAgICB0aGlzLmRlbGV0ZVZzYW1TdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnNhdmVIaXN0b3J5U3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgIHRoaXMuc2F2ZUhpc3RvcnlTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgIH1cclxuICAgIC8vIFRPRE86IEZldGNoaW5nIHVwZGF0ZXMgZm9yIGF1dG9tYXRpYyByZWZyZXNoIChkaXNhYmxlZCBmb3Igbm93KVxyXG4gICAgLy8gaWYgKHRoaXMuaW50ZXJ2YWxJZCkge1xyXG4gICAgLy8gICBjbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxJZCk7XHJcbiAgICAvLyB9XHJcbiAgfVxyXG5cclxuICAvLyBVcGRhdGVzIHRoZSAnZGF0YScgYXJyYXkgd2l0aCBuZXcgZGF0YSwgcHJlc2VydmluZyBleGlzdGluZyBleHBhbmRlZCBkYXRhc2V0c1xyXG4gIHVwZGF0ZVRyZWVEYXRhKGRlc3RpbmF0aW9uRGF0YTogYW55LCBuZXdEYXRhOiBhbnkpIHtcclxuICAgIC8vT25seSB1cGRhdGUgaWYgZGF0YSBzZXRzIGFyZSBhZGRlZC9yZW1vdmVkXHJcbiAgICAvLyBUT0RPOiBBZGQgYSBtb3JlIGluLWRlcHRoIGNoZWNrIGZvciBEUyB1cGRhdGVzIChjaGVjayBEUyBwcm9wZXJ0aWVzIHRvbz8pXHJcbiAgICBpZiAoZGVzdGluYXRpb25EYXRhLmxlbmd0aCAhPSBuZXdEYXRhLmxlbmd0aCkge1xyXG4gICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkNoYW5nZSBpbiBkYXRhc2V0IGNvdW50IGRldGVjdGVkLiBVcGRhdGluZyB0cmVlLi4uXCIpO1xyXG4gICAgICBsZXQgZXhwYW5kZWRGb2xkZXJzID0gZGVzdGluYXRpb25EYXRhLmZpbHRlcihkYXRhT2JqID0+IGRhdGFPYmouZXhwYW5kZWQpO1xyXG4gICAgICAvL2NoZWNrcyBpZiB0aGUgcXVlcnkgcmVzcG9uc2UgY29udGFpbnMgdGhlIHNhbWUgUERTJyB0aGF0IGFyZSBjdXJyZW50bHkgZXhwYW5kZWRcclxuICAgICAgbGV0IG5ld0RhdGFIYXNFeHBhbmRlZCA9IG5ld0RhdGEuZmlsdGVyKGRhdGFPYmogPT4gZXhwYW5kZWRGb2xkZXJzLnNvbWUoZXhwYW5kZWQgPT4gZXhwYW5kZWQubGFiZWwgPT09IGRhdGFPYmoubGFiZWwpKTtcclxuICAgICAgLy9LZWVwIGN1cnJlbnRseSBleHBhbmRlZCBkYXRhc2V0cyBleHBhbmRlZCBhZnRlciB1cGRhdGVcclxuICAgICAgaWYgKG5ld0RhdGFIYXNFeHBhbmRlZC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgbGV0IGV4cGFuZGVkTmV3RGF0YSA9IG5ld0RhdGEubWFwKChvYmopID0+IHtcclxuICAgICAgICAgIGxldCByZXRPYmogPSB7fTtcclxuICAgICAgICAgIG5ld0RhdGFIYXNFeHBhbmRlZC5mb3JFYWNoKChleHBhbmRlZE9iaikgPT4ge1xyXG4gICAgICAgICAgICBpZiAob2JqLmxhYmVsID09IGV4cGFuZGVkT2JqLmxhYmVsKSB7XHJcbiAgICAgICAgICAgICAgb2JqLmV4cGFuZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXRPYmogPSBvYmo7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgcmV0dXJuIHJldE9iajtcclxuICAgICAgICB9KVxyXG4gICAgICAgIGRlc3RpbmF0aW9uRGF0YSA9IGV4cGFuZGVkTmV3RGF0YTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBkZXN0aW5hdGlvbkRhdGEgPSBuZXdEYXRhO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKiBUT0RPOiBMZWdhY3ksIGNhcGFiaWxpdGllcyBjb2RlICh1bnVzZWQgZm9yIG5vdykgKi9cclxuICAvKmluaXRhbGl6ZUNhcGFiaWxpdGllcygpe1xyXG4gICAgdGhpcy5jYXBhYmlsaXRpZXMgPSBuZXcgQXJyYXk8Q2FwYWJpbGl0eT4oKTtcclxuICAgIHRoaXMuY2FwYWJpbGl0aWVzLnB1c2goRmlsZUJyb3dzZXJDYXBhYmlsaXRpZXMuRmlsZUJyb3dzZXIpO1xyXG4gICAgdGhpcy5jYXBhYmlsaXRpZXMucHVzaChGaWxlQnJvd3NlckNhcGFiaWxpdGllcy5GaWxlQnJvd3Nlck1WUyk7XHJcbiAgfSovXHJcblxyXG4gIGluaXRpYWxpemVSaWdodENsaWNrUHJvcGVydGllcygpIHtcclxuICAgIHRoaXMucmlnaHRDbGlja1Byb3BlcnRpZXNEYXRhc2V0RmlsZSA9IFtcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiUmVxdWVzdCBPcGVuIGluIE5ldyBCcm93c2VyIFRhYlwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMub3BlbkluTmV3VGFiLmVtaXQodGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIkNvcHkgTGlua1wiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuY29weUxpbmsodGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIlByb3BlcnRpZXNcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNob3dQcm9wZXJ0aWVzRGlhbG9nKHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJEZWxldGVcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNob3dEZWxldGVEaWFsb2codGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIkRvd25sb2FkXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5hdHRlbXB0RG93bmxvYWQodGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIF07XHJcbiAgICB0aGlzLnJpZ2h0Q2xpY2tQcm9wZXJ0aWVzRGF0YXNldEZvbGRlciA9IFtcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiQ29weSBMaW5rXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5jb3B5TGluayh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiUHJvcGVydGllc1wiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2hvd1Byb3BlcnRpZXNEaWFsb2codGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIkRlbGV0ZVwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2hvd0RlbGV0ZURpYWxvZyh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgXTtcclxuICAgIHRoaXMucmlnaHRDbGlja1Byb3BlcnRpZXNQYW5lbCA9IFtcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiU2hvdy9IaWRlIFNlYXJjaFwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMudG9nZ2xlU2VhcmNoKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICBdO1xyXG4gIH1cclxuXHJcbiAgc2hvd0RlbGV0ZURpYWxvZyhyaWdodENsaWNrZWRGaWxlOiBhbnkpIHtcclxuICAgIGlmICh0aGlzLmNoZWNrSWZJbkRlbGV0aW9uUXVldWVBbmRNZXNzYWdlKHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoLCBcIlRoaXMgaXMgYWxyZWFkeSBiZWluZyBkZWxldGVkLlwiKSA9PSB0cnVlKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBmaWxlRGVsZXRlQ29uZmlnID0gbmV3IE1hdERpYWxvZ0NvbmZpZygpO1xyXG4gICAgZmlsZURlbGV0ZUNvbmZpZy5kYXRhID0ge1xyXG4gICAgICBldmVudDogcmlnaHRDbGlja2VkRmlsZSxcclxuICAgICAgd2lkdGg6ICc2MDBweCdcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZmlsZURlbGV0ZVJlZjogTWF0RGlhbG9nUmVmPERlbGV0ZUZpbGVNb2RhbD4gPSB0aGlzLmRpYWxvZy5vcGVuKERlbGV0ZUZpbGVNb2RhbCwgZmlsZURlbGV0ZUNvbmZpZyk7XHJcbiAgICB0aGlzLmRlbGV0ZVN1YnNjcmlwdGlvbiA9IGZpbGVEZWxldGVSZWYuY29tcG9uZW50SW5zdGFuY2Uub25EZWxldGUuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgbGV0IHZzYW1DU0lUeXBlcyA9IFsnUicsICdEJywgJ0cnLCAnSScsICdDJ107XHJcbiAgICAgIGlmICh2c2FtQ1NJVHlwZXMuaW5kZXhPZihyaWdodENsaWNrZWRGaWxlLmRhdGEuZGF0YXNldEF0dHJzLmNzaUVudHJ5VHlwZSkgIT0gLTEpIHtcclxuICAgICAgICB0aGlzLmRlbGV0ZVZzYW1EYXRhc2V0KHJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZGVsZXRlTm9uVnNhbURhdGFzZXQocmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZGVsZXRlTm9uVnNhbURhdGFzZXQocmlnaHRDbGlja2VkRmlsZTogYW55KTogdm9pZCB7XHJcbiAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XHJcbiAgICB0aGlzLmRlbGV0aW9uUXVldWUuc2V0KHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoLCByaWdodENsaWNrZWRGaWxlKTtcclxuICAgIHJpZ2h0Q2xpY2tlZEZpbGUuc3R5bGVDbGFzcyA9IENTU19OT0RFX0RFTEVUSU5HO1xyXG4gICAgdGhpcy5kZWxldGVOb25Wc2FtU3Vic2NyaXB0aW9uID0gdGhpcy5kYXRhc2V0U2VydmljZS5kZWxldGVOb25Wc2FtRGF0YXNldE9yTWVtYmVyKHJpZ2h0Q2xpY2tlZEZpbGUpXHJcbiAgICAgIC5zdWJzY3JpYmUoe1xyXG4gICAgICAgIG5leHQ6IHJlc3AgPT4ge1xyXG4gICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihyZXNwLm1zZyxcclxuICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlQ2hpbGQocmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0aW9uUXVldWUuZGVsZXRlKHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoKTtcclxuICAgICAgICAgIHJpZ2h0Q2xpY2tlZEZpbGUuc3R5bGVDbGFzcyA9IFwiXCI7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0ZUNsaWNrLmVtaXQodGhpcy5yaWdodENsaWNrZWRFdmVudC5ub2RlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVycm9yOiBlcnJvciA9PiB7XHJcbiAgICAgICAgICBpZiAoZXJyb3Iuc3RhdHVzID09ICc1MDAnKSB7IC8vSW50ZXJuYWwgU2VydmVyIEVycm9yXHJcbiAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkZhaWxlZCB0byBkZWxldGU6ICdcIiArIHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoICsgXCInIFRoaXMgaXMgcHJvYmFibHkgZHVlIHRvIGEgc2VydmVyIGFnZW50IHByb2JsZW0uXCIsXHJcbiAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDQnKSB7IC8vTm90IEZvdW5kXHJcbiAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihyaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aCArICcgaGFzIGFscmVhZHkgYmVlbiBkZWxldGVkIG9yIGRvZXMgbm90IGV4aXN0LicsXHJcbiAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgICAgdGhpcy5yZW1vdmVDaGlsZChyaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDAnKSB7IC8vQmFkIFJlcXVlc3RcclxuICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiRmFpbGVkIHRvIGRlbGV0ZSAnXCIgKyByaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aCArIFwiJyBUaGlzIGlzIHByb2JhYmx5IGR1ZSB0byBhIHBlcm1pc3Npb24gcHJvYmxlbS5cIixcclxuICAgICAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgfSBlbHNlIHsgLy9Vbmtub3duXHJcbiAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIlVua25vd24gZXJyb3IgJ1wiICsgZXJyb3Iuc3RhdHVzICsgXCInIG9jY3VycmVkIGZvcjogXCIgKyByaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aCxcclxuICAgICAgICAgICAgICAnRGlzbWlzcycsIGxvbmdTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgICAvLyBFcnJvciBpbmZvIGdldHMgcHJpbnRlZCBpbiB1c3MuY3J1ZC5zZXJ2aWNlLnRzXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLmRlbGV0aW9uUXVldWUuZGVsZXRlKHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoKTtcclxuICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICByaWdodENsaWNrZWRGaWxlLnN0eWxlQ2xhc3MgPSBcIlwiO1xyXG4gICAgICAgICAgdGhpcy5sb2cuc2V2ZXJlKGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICBpZiAodGhpcy5kZWxldGVOb25Wc2FtU3Vic2NyaXB0aW9uLmNsb3NlZCA9PSBmYWxzZSkge1xyXG4gICAgICAgIHRoaXMuc25hY2tCYXIub3BlbignRGVsZXRpbmcgJyArIHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoICsgJy4uLiBMYXJnZXIgcGF5bG9hZHMgbWF5IHRha2UgbG9uZ2VyLiBQbGVhc2UgYmUgcGF0aWVudC4nLFxyXG4gICAgICAgICAgJ0Rpc21pc3MnLCBxdWlja1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgIH1cclxuICAgIH0sIDQwMDApO1xyXG4gIH1cclxuXHJcbiAgZGVsZXRlVnNhbURhdGFzZXQocmlnaHRDbGlja2VkRmlsZTogYW55KTogdm9pZCB7XHJcbiAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XHJcbiAgICB0aGlzLmRlbGV0aW9uUXVldWUuc2V0KHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoLCByaWdodENsaWNrZWRGaWxlKTtcclxuICAgIHJpZ2h0Q2xpY2tlZEZpbGUuc3R5bGVDbGFzcyA9IENTU19OT0RFX0RFTEVUSU5HO1xyXG4gICAgdGhpcy5kZWxldGVWc2FtU3Vic2NyaXB0aW9uID0gdGhpcy5kYXRhc2V0U2VydmljZS5kZWxldGVWc2FtRGF0YXNldChyaWdodENsaWNrZWRGaWxlKVxyXG4gICAgICAuc3Vic2NyaWJlKHtcclxuICAgICAgICBuZXh0OiByZXNwID0+IHtcclxuICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4ocmVzcC5tc2csXHJcbiAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAvL1VwZGF0ZSB2cyByZW1vdmluZyBub2RlIHNpbmNlIHN5bWJvbGljbHkgbGlua2VkIGRhdGEvaW5kZXggb2YgdnNhbSBjYW4gYmUgbmFtZWQgYW55dGhpbmdcclxuICAgICAgICAgIHRoaXMudXBkYXRlVHJlZVZpZXcodGhpcy5wYXRoKTtcclxuICAgICAgICAgIHRoaXMuZGVsZXRpb25RdWV1ZS5kZWxldGUocmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGgpO1xyXG4gICAgICAgICAgcmlnaHRDbGlja2VkRmlsZS5zdHlsZUNsYXNzID0gXCJcIjtcclxuICAgICAgICAgIHRoaXMuZGVsZXRlQ2xpY2suZW1pdCh0aGlzLnJpZ2h0Q2xpY2tlZEV2ZW50Lm5vZGUpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXJyb3I6IGVycm9yID0+IHtcclxuICAgICAgICAgIGlmIChlcnJvci5zdGF0dXMgPT0gJzUwMCcpIHsgLy9JbnRlcm5hbCBTZXJ2ZXIgRXJyb3JcclxuICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiRmFpbGVkIHRvIGRlbGV0ZTogJ1wiICsgcmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGggKyBcIicgVGhpcyBpcyBwcm9iYWJseSBkdWUgdG8gYSBzZXJ2ZXIgYWdlbnQgcHJvYmxlbS5cIixcclxuICAgICAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5zdGF0dXMgPT0gJzQwNCcpIHsgLy9Ob3QgRm91bmRcclxuICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoICsgJyBoYXMgYWxyZWFkeSBiZWVuIGRlbGV0ZWQgb3IgZG9lcyBub3QgZXhpc3QuJyxcclxuICAgICAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVRyZWVWaWV3KHRoaXMucGF0aCk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnN0YXR1cyA9PSAnNDAwJykgeyAvL0JhZCBSZXF1ZXN0XHJcbiAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkZhaWxlZCB0byBkZWxldGUgJ1wiICsgcmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGggKyBcIicgVGhpcyBpcyBwcm9iYWJseSBkdWUgdG8gYSBwZXJtaXNzaW9uIHByb2JsZW0uXCIsXHJcbiAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDMnKSB7IC8vQmFkIFJlcXVlc3RcclxuICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiRmFpbGVkIHRvIGRlbGV0ZSAnXCIgKyByaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aCArIFwiJ1wiICsgXCIuIFwiICsgSlNPTi5wYXJzZShlcnJvci5fYm9keSlbJ21zZyddLFxyXG4gICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICB9IGVsc2UgeyAvL1Vua25vd25cclxuICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiVW5rbm93biBlcnJvciAnXCIgKyBlcnJvci5zdGF0dXMgKyBcIicgb2NjdXJyZWQgZm9yOiBcIiArIHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoLFxyXG4gICAgICAgICAgICAgICdEaXNtaXNzJywgbG9uZ1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIC8vRXJyb3IgaW5mbyBnZXRzIHByaW50ZWQgaW4gdXNzLmNydWQuc2VydmljZS50c1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5kZWxldGlvblF1ZXVlLmRlbGV0ZShyaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aCk7XHJcbiAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgcmlnaHRDbGlja2VkRmlsZS5zdHlsZUNsYXNzID0gXCJcIjtcclxuICAgICAgICAgIHRoaXMubG9nLnNldmVyZShlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKHRoaXMuZGVsZXRlVnNhbVN1YnNjcmlwdGlvbi5jbG9zZWQgPT0gZmFsc2UpIHtcclxuICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oJ0RlbGV0aW5nICcgKyByaWdodENsaWNrZWRGaWxlLmRhdGEucGF0aCArICcuLi4gTGFyZ2VyIHBheWxvYWRzIG1heSB0YWtlIGxvbmdlci4gUGxlYXNlIGJlIHBhdGllbnQuJyxcclxuICAgICAgICAgICdEaXNtaXNzJywgcXVpY2tTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICB9XHJcbiAgICB9LCA0MDAwKTtcclxuICB9XHJcblxyXG4gIHJlbW92ZUNoaWxkKG5vZGU6IGFueSkge1xyXG4gICAgbGV0IG5vZGVzID0gdGhpcy5kYXRhO1xyXG4gICAgaWYgKG5vZGUucGFyZW50KSB7XHJcbiAgICAgIGxldCBwYXJlbnQgPSBub2RlLnBhcmVudDtcclxuICAgICAgbGV0IGluZGV4ID0gcGFyZW50LmNoaWxkcmVuLmluZGV4T2Yobm9kZSk7XHJcbiAgICAgIGlmIChpbmRleCA9PSAtMSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBwYXJlbnQuY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICBub2Rlc1tub2Rlcy5pbmRleE9mKG5vZGUucGFyZW50KV0gPSBwYXJlbnQ7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gbm9kZXM7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxldCBpbmRleCA9IG5vZGVzLmluZGV4T2Yobm9kZSk7XHJcbiAgICAgIGlmIChpbmRleCA9PSAtMSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBub2Rlcy5zcGxpY2Uobm9kZXMuaW5kZXhPZihub2RlKSwgMSk7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gbm9kZXM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5zaG93U2VhcmNoKSB7IC8vIElmIHdlIHJlbW92ZSBhIG5vZGUsIHdlIG5lZWQgdG8gdXBkYXRlIGl0IGluIHNlYXJjaCBiYXIgY2FjaGVcclxuICAgICAgbGV0IG5vZGVEYXRhQ2FjaGVkID0gdGhpcy5maW5kTm9kZUJ5UGF0aCh0aGlzLmRhdGFDYWNoZWQsIG5vZGUuZGF0YS5wYXRoKTtcclxuICAgICAgaWYgKG5vZGVEYXRhQ2FjaGVkKSB7XHJcbiAgICAgICAgbGV0IG5vZGVDYWNoZWQgPSBub2RlRGF0YUNhY2hlZFswXTtcclxuICAgICAgICBsZXQgaW5kZXhDYWNoZWQgPSBub2RlRGF0YUNhY2hlZFsxXTtcclxuICAgICAgICBpZiAoaW5kZXhDYWNoZWQgIT0gLTEpIHtcclxuICAgICAgICAgIGlmIChub2RlQ2FjaGVkLnBhcmVudCkge1xyXG4gICAgICAgICAgICBub2RlQ2FjaGVkLnBhcmVudC5jaGlsZHJlbi5zcGxpY2UoaW5kZXhDYWNoZWQsIDEpO1xyXG4gICAgICAgICAgICBsZXQgcGFyZW50RGF0YUNhY2hlZCA9IHRoaXMuZmluZE5vZGVCeVBhdGgodGhpcy5kYXRhQ2FjaGVkLCBub2RlLnBhcmVudC5kYXRhLnBhdGgpO1xyXG4gICAgICAgICAgICBpZiAocGFyZW50RGF0YUNhY2hlZCkge1xyXG4gICAgICAgICAgICAgIGxldCBwYXJlbnRJbmRleENhY2hlZCA9IHBhcmVudERhdGFDYWNoZWRbMV07XHJcbiAgICAgICAgICAgICAgdGhpcy5kYXRhQ2FjaGVkW3BhcmVudEluZGV4Q2FjaGVkXSA9IG5vZGVDYWNoZWQucGFyZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFDYWNoZWQuc3BsaWNlKGluZGV4Q2FjaGVkLCAxKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFRPRE86IENvdWxkIGJlIG9wdGltaXplZCB0byBkbyBicmVhZHRoIGZpcnN0IHNlYXJjaCB2cyBkZXB0aCBmaXJzdCBzZWFyY2hcclxuICBmaW5kTm9kZUJ5UGF0aChkYXRhOiBhbnksIHBhdGg6IHN0cmluZykge1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChkYXRhW2ldLmRhdGEucGF0aCA9PSBwYXRoKSB7XHJcbiAgICAgICAgcmV0dXJuIFtkYXRhW2ldLCBpXTsgLy8gMCAtIG5vZGUsIDEgLSBpbmRleFxyXG4gICAgICB9XHJcbiAgICAgIGlmIChkYXRhW2ldLmNoaWxkcmVuICYmIGRhdGFbaV0uY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHRoaXMuZmluZE5vZGVCeVBhdGgoZGF0YVtpXS5jaGlsZHJlbiwgcGF0aCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBbbnVsbCwgbnVsbF07XHJcbiAgfVxyXG5cclxuICBhdHRlbXB0RG93bmxvYWQocmlnaHRDbGlja2VkRmlsZTogYW55KSB7XHJcbiAgICBsZXQgZGF0YXNldCA9IHJpZ2h0Q2xpY2tlZEZpbGUuZGF0YS5wYXRoO1xyXG4gICAgbGV0IGZpbGVuYW1lID0gcmlnaHRDbGlja2VkRmlsZS5sYWJlbDtcclxuICAgIGxldCBkb3dubG9hZE9iamVjdCA9IHJpZ2h0Q2xpY2tlZEZpbGU7XHJcbiAgICBsZXQgdXJsOiBzdHJpbmcgPSBab3dlWkxVWC51cmlCcm9rZXIuZGF0YXNldENvbnRlbnRzVXJpKGRhdGFzZXQpO1xyXG5cclxuICAgIHRoaXMuZG93bmxvYWRTZXJ2aWNlLmZldGNoRmlsZUhhbmRsZXIodXJsLCBmaWxlbmFtZSwgZG93bmxvYWRPYmplY3QpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAvLyBUT0RPOiBEb3dubG9hZCBxdWV1ZSBjb2RlIGZvciBwcm9ncmVzcyBiYXIgY291bGQgZ28gaGVyZVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBjb3B5TGluayhyaWdodENsaWNrZWRGaWxlOiBhbnkpIHtcclxuICAgIGxldCBsaW5rID0gJyc7XHJcbiAgICBpZiAocmlnaHRDbGlja2VkRmlsZS50eXBlID09ICdmaWxlJykge1xyXG4gICAgICBsaW5rID0gYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0ke3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZX0/cGx1Z2luSWQ9JHt0aGlzLnBsdWdpbkRlZmluaXRpb24uZ2V0QmFzZVBsdWdpbigpLmdldElkZW50aWZpZXIoKX06ZGF0YToke2VuY29kZVVSSUNvbXBvbmVudChge1widHlwZVwiOlwib3BlbkRhdGFzZXRcIixcIm5hbWVcIjpcIiR7cmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGh9XCIsXCJ0b2dnbGVUcmVlXCI6dHJ1ZX1gKX1gO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbGluayA9IGAke3dpbmRvdy5sb2NhdGlvbi5vcmlnaW59JHt3aW5kb3cubG9jYXRpb24ucGF0aG5hbWV9P3BsdWdpbklkPSR7dGhpcy5wbHVnaW5EZWZpbml0aW9uLmdldEJhc2VQbHVnaW4oKS5nZXRJZGVudGlmaWVyKCl9OmRhdGE6JHtlbmNvZGVVUklDb21wb25lbnQoYHtcInR5cGVcIjpcIm9wZW5EU0xpc3RcIixcIm5hbWVcIjpcIiR7cmlnaHRDbGlja2VkRmlsZS5kYXRhLnBhdGh9XCIsXCJ0b2dnbGVUcmVlXCI6ZmFsc2V9YCl9YDtcclxuICAgIH1cclxuICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGxpbmspLnRoZW4oKCkgPT4ge1xyXG4gICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkxpbmsgY29waWVkIHRvIGNsaXBib2FyZFwiKTtcclxuICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiQ29waWVkIGxpbmsgc3VjY2Vzc2Z1bGx5XCIsICdEaXNtaXNzJywgcXVpY2tTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgfSkuY2F0Y2goKCkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGNvcHkgbGluayB0byBjbGlwYm9hcmRcIik7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHNob3dQcm9wZXJ0aWVzRGlhbG9nKHJpZ2h0Q2xpY2tlZEZpbGU6IGFueSkge1xyXG4gICAgY29uc3QgZmlsZVByb3BDb25maWcgPSBuZXcgTWF0RGlhbG9nQ29uZmlnKCk7XHJcbiAgICBmaWxlUHJvcENvbmZpZy5kYXRhID0ge1xyXG4gICAgICBldmVudDogcmlnaHRDbGlja2VkRmlsZSxcclxuICAgICAgd2lkdGg6ICdmaXQtY29udGVudCcsXHJcbiAgICAgIG1heFdpZHRoOiAnMTEwMHB4JyxcclxuICAgICAgaGVpZ2h0OiAnNDc1cHgnXHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5kaWFsb2cub3BlbihEYXRhc2V0UHJvcGVydGllc01vZGFsLCBmaWxlUHJvcENvbmZpZyk7XHJcbiAgfVxyXG5cclxuICB0b2dnbGVTZWFyY2goKSB7XHJcbiAgICB0aGlzLnNob3dTZWFyY2ggPSAhdGhpcy5zaG93U2VhcmNoO1xyXG4gICAgaWYgKHRoaXMuc2hvd1NlYXJjaCkge1xyXG4gICAgICB0aGlzLmZvY3VzU2VhcmNoSW5wdXQoKTtcclxuICAgICAgdGhpcy5kYXRhQ2FjaGVkID0gXy5jbG9uZURlZXAodGhpcy5kYXRhKTsgLy8gV2Ugd2FudCBhIGRlZXAgY2xvbmUgc28gd2UgY2FuIG1vZGlmeSB0aGlzLmRhdGEgdy9vIGNoYW5naW5nIHRoaXMuZGF0YUNhY2hlZFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMuZGF0YUNhY2hlZCkge1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IHRoaXMuZGF0YUNhY2hlZDsgLy8gV2UgZG9uJ3QgY2FyZSBhYm91dCBkZWVwIGNsb25lIGJlY2F1c2Ugd2UganVzdCB3YW50IHRvIGdldCBkYXRhQ2FjaGVkIGJhY2tcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZm9jdXNTZWFyY2hJbnB1dChhdHRlbXB0Q291bnQ/OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLnNlYXJjaE1WUykge1xyXG4gICAgICB0aGlzLnNlYXJjaE1WUy5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IG1heEF0dGVtcHRzID0gMTA7XHJcbiAgICBpZiAodHlwZW9mIGF0dGVtcHRDb3VudCAhPT0gJ251bWJlcicpIHtcclxuICAgICAgYXR0ZW1wdENvdW50ID0gbWF4QXR0ZW1wdHM7XHJcbiAgICB9XHJcbiAgICBpZiAoYXR0ZW1wdENvdW50ID4gMCkge1xyXG4gICAgICBhdHRlbXB0Q291bnQtLTtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmZvY3VzU2VhcmNoSW5wdXQoYXR0ZW1wdENvdW50KSwgMTAwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNlYXJjaElucHV0Q2hhbmdlZChpbnB1dDogc3RyaW5nKSB7XHJcbiAgICBpbnB1dCA9IGlucHV0LnRvVXBwZXJDYXNlKCk7IC8vIENsaWVudC1zaWRlIHRoZSBEUyBhcmUgdXBwZXJjYXNlXHJcbiAgICBpZiAodGhpcy5kYXRhQ2FjaGVkKSB7XHJcbiAgICAgIHRoaXMuZGF0YSA9IF8uY2xvbmVEZWVwKHRoaXMuZGF0YUNhY2hlZCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmZpbHRlck5vZGVzQnlMYWJlbCh0aGlzLmRhdGEsIGlucHV0KTtcclxuICB9XHJcblxyXG4gIGZpbHRlck5vZGVzQnlMYWJlbChkYXRhOiBhbnksIGxhYmVsOiBzdHJpbmcpIHtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoIShkYXRhW2ldKS5sYWJlbC5pbmNsdWRlcyhsYWJlbCkpIHtcclxuICAgICAgICBpZiAoZGF0YVtpXS5jaGlsZHJlbiAmJiBkYXRhW2ldLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIHRoaXMuZmlsdGVyTm9kZXNCeUxhYmVsKGRhdGFbaV0uY2hpbGRyZW4sIGxhYmVsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEoZGF0YVtpXS5jaGlsZHJlbiAmJiBkYXRhW2ldLmNoaWxkcmVuLmxlbmd0aCA+IDApKSB7XHJcbiAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgIGktLTtcclxuICAgICAgICB9IC8vIFRPRE86IFJlZmFjdG9yIFwiLmRhdGFcIiBvZiBVU1Mgbm9kZSBhbmQgXCIudHlwZVwiIG9mIERTIG5vZGUgdG8gYmUgdGhlIHNhbWUgdGhpbmcgXHJcbiAgICAgICAgZWxzZSBpZiAoZGF0YVtpXS50eXBlID0gXCJmb2xkZXJcIikgeyAvLyBJZiBzb21lIGNoaWxkcmVuIGRpZG4ndCBnZXQgZmlsdGVyZWQgb3V0IChha2Egd2UgZ290IHNvbWUgbWF0Y2hlcykgYW5kIHdlIGhhdmUgYSBmb2xkZXJcclxuICAgICAgICAgIC8vIHRoZW4gd2Ugd2FudCB0byBleHBhbmQgdGhlIG5vZGUgc28gdGhlIHVzZXIgY2FuIHNlZSB0aGVpciByZXN1bHRzIGluIHRoZSBzZWFyY2ggYmFyXHJcbiAgICAgICAgICBkYXRhW2ldLmV4cGFuZGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldERPTUVsZW1lbnQoKTogSFRNTEVsZW1lbnQge1xyXG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50O1xyXG4gIH1cclxuXHJcbiAgZ2V0U2VsZWN0ZWRQYXRoKCk6IHN0cmluZyB7XHJcbiAgICAvL1RPRE86aG93IGRvIHdlIHdhbnQgdG8gd2FudCB0byBoYW5kbGUgY2FjaGluZyB2cyBtZXNzYWdlIHRvIGFwcCB0byBvcGVuIHNhaWQgcGF0aFxyXG4gICAgcmV0dXJuIHRoaXMucGF0aDtcclxuICB9XHJcblxyXG4gIG9uTm9kZUNsaWNrKCRldmVudDogYW55KTogdm9pZCB7XHJcbiAgICB0aGlzLnNlbGVjdGVkTm9kZSA9ICRldmVudC5ub2RlO1xyXG4gICAgaWYgKCRldmVudC5ub2RlLnR5cGUgPT0gJ2ZvbGRlcicpIHtcclxuICAgICAgJGV2ZW50Lm5vZGUuZXhwYW5kZWQgPSAhJGV2ZW50Lm5vZGUuZXhwYW5kZWQ7XHJcbiAgICAgIGlmICh0aGlzLnNob3dTZWFyY2gpIHsgLy8gVXBkYXRlIHNlYXJjaCBiYXIgY2FjaGVkIGRhdGFcclxuICAgICAgICBsZXQgbm9kZUNhY2hlZCA9IHRoaXMuZmluZE5vZGVCeVBhdGgodGhpcy5kYXRhQ2FjaGVkLCAkZXZlbnQubm9kZS5kYXRhLnBhdGgpWzBdO1xyXG4gICAgICAgIGlmIChub2RlQ2FjaGVkKSB7XHJcbiAgICAgICAgICBub2RlQ2FjaGVkLmV4cGFuZGVkID0gJGV2ZW50Lm5vZGUuZXhwYW5kZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy51dGlscy5pc0RhdGFzZXRNaWdyYXRlZCgkZXZlbnQubm9kZS5kYXRhLmRhdGFzZXRBdHRycykpIHtcclxuICAgICAgY29uc3QgcGF0aCA9ICRldmVudC5ub2RlLmRhdGEucGF0aDtcclxuICAgICAgY29uc3Qgc25hY2tCYXJSZWYgPSB0aGlzLnNuYWNrQmFyLm9wZW4oYFJlY2FsbGluZyBkYXRhc2V0ICcke3BhdGh9J2AsXHJcbiAgICAgICAgdW5kZWZpbmVkLCB7IHBhbmVsQ2xhc3M6ICdjZW50ZXInIH0pO1xyXG4gICAgICB0aGlzLmRhdGFzZXRTZXJ2aWNlLnJlY2FsbERhdGFzZXQoJGV2ZW50Lm5vZGUuZGF0YS5wYXRoKVxyXG4gICAgICAgIC5waXBlKGZpbmFsaXplKCgpID0+IHNuYWNrQmFyUmVmLmRpc21pc3MoKSkpXHJcbiAgICAgICAgLnN1YnNjcmliZSh7XHJcbiAgICAgICAgICBuZXh0OiBhdHRycyA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUmVjYWxsZWREYXRhc2V0Tm9kZSgkZXZlbnQubm9kZSwgYXR0cnMpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zaG93U2VhcmNoKSB7IC8vIFVwZGF0ZSBzZWFyY2ggYmFyIGNhY2hlZCBkYXRhXHJcbiAgICAgICAgICAgICAgbGV0IG5vZGVDYWNoZWQgPSB0aGlzLmZpbmROb2RlQnlQYXRoKHRoaXMuZGF0YUNhY2hlZCwgJGV2ZW50Lm5vZGUuZGF0YS5wYXRoKVswXTtcclxuICAgICAgICAgICAgICBpZiAobm9kZUNhY2hlZCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVSZWNhbGxlZERhdGFzZXROb2RlKG5vZGVDYWNoZWQsIGF0dHJzKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5ub2RlQ2xpY2suZW1pdCgkZXZlbnQubm9kZSk7XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZXJyb3I6IF9lcnIgPT4gdGhpcy5zbmFja0Jhci5vcGVuKGBGYWlsZWQgdG8gcmVjYWxsIGRhdGFzZXQgJyR7cGF0aH0nYCxcclxuICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKVxyXG4gICAgICAgIH0pO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB0aGlzLm5vZGVDbGljay5lbWl0KCRldmVudC5ub2RlKTtcclxuICB9XHJcblxyXG4gIG9uTm9kZURibENsaWNrKCRldmVudDogYW55KTogdm9pZCB7XHJcbiAgICB0aGlzLnNlbGVjdGVkTm9kZSA9ICRldmVudC5ub2RlO1xyXG4gICAgaWYgKHRoaXMuc2VsZWN0ZWROb2RlLmRhdGE/Lmhhc0NoaWxkcmVuICYmIHRoaXMuc2VsZWN0ZWROb2RlLmNoaWxkcmVuPy5sZW5ndGggPiAwKSB7XHJcbiAgICAgIHRoaXMucGF0aCA9ICRldmVudC5ub2RlLmRhdGEucGF0aDtcclxuICAgICAgaWYgKHRoaXMucGF0aCkge1xyXG4gICAgICAgIHRoaXMuZ2V0VHJlZUZvclF1ZXJ5QXN5bmModGhpcy5wYXRoKS50aGVuKChyZXMpID0+IHtcclxuICAgICAgICAgIHRoaXMuZGF0YSA9IHJlc1swXS5jaGlsZHJlbjtcclxuICAgICAgICAgIHRoaXMub25QYXRoQ2hhbmdlZCh0aGlzLnBhdGgpO1xyXG4gICAgICAgICAgdGhpcy5yZWZyZXNoSGlzdG9yeSh0aGlzLnBhdGgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMubG9nLmRlYnVnKFwiQSBEUyBub2RlIGRvdWJsZSBjbGljayBldmVudCB3YXMgcmVjZWl2ZWQgdG8gb3BlbiwgYnV0IG5vIHBhdGggd2FzIGZvdW5kXCIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLm5vZGVEYmxDbGljay5lbWl0KCRldmVudC5ub2RlKTtcclxuICB9XHJcblxyXG4gIG9uTm9kZVJpZ2h0Q2xpY2soZXZlbnQ6IGFueSkge1xyXG4gICAgbGV0IG5vZGUgPSBldmVudC5ub2RlO1xyXG4gICAgbGV0IHJpZ2h0Q2xpY2tQcm9wZXJ0aWVzO1xyXG4gICAgaWYgKG5vZGUudHlwZSA9PT0gJ2ZpbGUnKSB7XHJcbiAgICAgIHJpZ2h0Q2xpY2tQcm9wZXJ0aWVzID0gdGhpcy5yaWdodENsaWNrUHJvcGVydGllc0RhdGFzZXRGaWxlO1xyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgIHJpZ2h0Q2xpY2tQcm9wZXJ0aWVzID0gdGhpcy5yaWdodENsaWNrUHJvcGVydGllc0RhdGFzZXRGb2xkZXI7XHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy53aW5kb3dBY3Rpb25zKSB7XHJcbiAgICAgIGxldCBkaWRDb250ZXh0TWVudVNwYXduID0gdGhpcy53aW5kb3dBY3Rpb25zLnNwYXduQ29udGV4dE1lbnUoZXZlbnQub3JpZ2luYWxFdmVudC5jbGllbnRYLCBldmVudC5vcmlnaW5hbEV2ZW50LmNsaWVudFksIHJpZ2h0Q2xpY2tQcm9wZXJ0aWVzLCB0cnVlKTtcclxuICAgICAgLy8gVE9ETzogRml4IFpvd2UncyBjb250ZXh0IG1lbnUgc3VjaCB0aGF0IGlmIGl0IGRvZXNuJ3QgaGF2ZSBlbm91Z2ggc3BhY2UgdG8gc3Bhd24sIGl0IG1vdmVzIGl0c2VsZiBhY2NvcmRpbmdseSB0byBzcGF3bi5cclxuICAgICAgaWYgKCFkaWRDb250ZXh0TWVudVNwYXduKSB7IC8vIElmIGNvbnRleHQgbWVudSBmYWlsZWQgdG8gc3Bhd24uLi5cclxuICAgICAgICBsZXQgaGVpZ2h0QWRqdXN0bWVudCA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQuY2xpZW50WSAtIDI1OyAvLyBCdW1wIGl0IHVwIDI1cHhcclxuICAgICAgICBkaWRDb250ZXh0TWVudVNwYXduID0gdGhpcy53aW5kb3dBY3Rpb25zLnNwYXduQ29udGV4dE1lbnUoZXZlbnQub3JpZ2luYWxFdmVudC5jbGllbnRYLCBoZWlnaHRBZGp1c3RtZW50LCByaWdodENsaWNrUHJvcGVydGllcywgdHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUgPSBub2RlO1xyXG4gICAgdGhpcy5yaWdodENsaWNrZWRFdmVudCA9IGV2ZW50O1xyXG4gICAgdGhpcy5yaWdodENsaWNrLmVtaXQoZXZlbnQubm9kZSk7XHJcbiAgICBldmVudC5vcmlnaW5hbEV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgfVxyXG5cclxuICBvblBhbmVsUmlnaHRDbGljaygkZXZlbnQ6IGFueSkge1xyXG4gICAgaWYgKHRoaXMud2luZG93QWN0aW9ucykge1xyXG4gICAgICBsZXQgZGlkQ29udGV4dE1lbnVTcGF3biA9IHRoaXMud2luZG93QWN0aW9ucy5zcGF3bkNvbnRleHRNZW51KCRldmVudC5jbGllbnRYLCAkZXZlbnQuY2xpZW50WSwgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc1BhbmVsLCB0cnVlKTtcclxuICAgICAgLy8gVE9ETzogRml4IFpvd2UncyBjb250ZXh0IG1lbnUgc3VjaCB0aGF0IGlmIGl0IGRvZXNuJ3QgaGF2ZSBlbm91Z2ggc3BhY2UgdG8gc3Bhd24sIGl0IG1vdmVzIGl0c2VsZiBhY2NvcmRpbmdseSB0byBzcGF3bi5cclxuICAgICAgaWYgKCFkaWRDb250ZXh0TWVudVNwYXduKSB7IC8vIElmIGNvbnRleHQgbWVudSBmYWlsZWQgdG8gc3Bhd24uLi5cclxuICAgICAgICBsZXQgaGVpZ2h0QWRqdXN0bWVudCA9ICRldmVudC5jbGllbnRZIC0gMjU7IC8vIEJ1bXAgaXQgdXAgMjVweFxyXG4gICAgICAgIGRpZENvbnRleHRNZW51U3Bhd24gPSB0aGlzLndpbmRvd0FjdGlvbnMuc3Bhd25Db250ZXh0TWVudSgkZXZlbnQuY2xpZW50WCwgaGVpZ2h0QWRqdXN0bWVudCwgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc1BhbmVsLCB0cnVlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29sbGFwc2VUcmVlKCk6IHZvaWQge1xyXG4gICAgbGV0IGRhdGFBcnJheSA9IHRoaXMuZGF0YTtcclxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBkYXRhQXJyYXkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKHRoaXMuZGF0YVtpXS5leHBhbmRlZCA9PSB0cnVlKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhW2ldLmV4cGFuZGVkID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMudHJlZUNvbXBvbmVudC51bnNlbGVjdE5vZGUoKTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZVRyZWVWaWV3KHBhdGg6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5nZXRUcmVlRm9yUXVlcnlBc3luYyhwYXRoKS50aGVuKChyZXMpID0+IHtcclxuICAgICAgdGhpcy5kYXRhID0gcmVzO1xyXG4gICAgICBpZiAodGhpcy5zaG93U2VhcmNoKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhQ2FjaGVkID0gdGhpcy5kYXRhO1xyXG4gICAgICAgIHRoaXMuc2hvd1NlYXJjaCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9LCAoZXJyb3IpID0+IHtcclxuICAgICAgaWYgKGVycm9yLnN0YXR1cyA9PSAnMCcpIHtcclxuICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJGYWlsZWQgdG8gY29tbXVuaWNhdGUgd2l0aCB0aGUgQXBwIHNlcnZlcjogXCIgKyBlcnJvci5zdGF0dXMsXHJcbiAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICB9IGVsc2UgaWYgKGVycm9yLnN0YXR1cyA9PSAnNDAwJyAmJiBwYXRoID09ICcnKSB7XHJcbiAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiTm8gZGF0YXNldCBuYW1lIHNwZWNpZmllZDogXCIgKyBlcnJvci5zdGF0dXMsXHJcbiAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICB9IGVsc2UgaWYgKGVycm9yLnN0YXR1cyA9PSAnNDAwJykge1xyXG4gICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkJhZCByZXF1ZXN0OiBcIiArIGVycm9yLnN0YXR1cyxcclxuICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiQW4gdW5rbm93biBlcnJvciBvY2N1cnJlZDogXCIgKyBlcnJvci5zdGF0dXMsXHJcbiAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICB9XHJcbiAgICAgIHRoaXMubG9nLnNldmVyZShlcnJvcik7XHJcbiAgICB9KTtcclxuICAgIHRoaXMub25QYXRoQ2hhbmdlZChwYXRoKTtcclxuICAgIHRoaXMucmVmcmVzaEhpc3RvcnkocGF0aCk7XHJcbiAgfVxyXG5cclxuICBvblBhdGhDaGFuZ2VkKCRldmVudDogYW55KTogdm9pZCB7XHJcbiAgICB0aGlzLnBhdGhDaGFuZ2VkLmVtaXQoJGV2ZW50KTtcclxuICB9XHJcblxyXG4gIG9uRGF0YUNoYW5nZWQoJGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMuZGF0YUNoYW5nZWQuZW1pdCgkZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgc2V0UGF0aChwYXRoOiBhbnkpIHtcclxuICAgIHRoaXMucGF0aCA9IHBhdGg7XHJcbiAgfVxyXG5cclxuICBnZXRUcmVlRm9yUXVlcnlBc3luYyhwYXRoOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xyXG4gICAgICB0aGlzLmRhdGFzZXRTZXJ2aWNlLnF1ZXJ5RGF0YXNldHMocGF0aCwgdHJ1ZSwgdGhpcy5hZGRpdGlvbmFsUXVhbGlmaWVycykucGlwZSh0YWtlKDEpKS5zdWJzY3JpYmUoe1xyXG4gICAgICAgIG5leHQ6IChyZXMpID0+IHtcclxuICAgICAgICAgIHRoaXMub25EYXRhQ2hhbmdlZChyZXMpO1xyXG4gICAgICAgICAgbGV0IHBhcmVudHM6IFRyZWVOb2RlW10gPSBbXTtcclxuICAgICAgICAgIGxldCBwYXJlbnRNYXAgPSB7fTtcclxuICAgICAgICAgIGlmIChyZXMuZGF0YXNldHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgcmVzLmRhdGFzZXRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgbGV0IGN1cnJlbnROb2RlOiBUcmVlTm9kZSA9IHt9O1xyXG4gICAgICAgICAgICAgIGN1cnJlbnROb2RlLmNoaWxkcmVuID0gW107XHJcbiAgICAgICAgICAgICAgY3VycmVudE5vZGUubGFiZWwgPSByZXMuZGF0YXNldHNbaV0ubmFtZS5yZXBsYWNlKC9eXFxzK3xcXHMrJC8sICcnKTtcclxuICAgICAgICAgICAgICAvL2RhdGEuaWQgYXR0cmlidXRlIGlzIG5vdCB1c2VkIGJ5IGVpdGhlciBwYXJlbnQgb3IgY2hpbGQsIGJ1dCByZXF1aXJlZCBhcyBwYXJ0IG9mIHRoZSBQcm9qZWN0U3RydWN0dXJlIGludGVyZmFjZVxyXG4gICAgICAgICAgICAgIGxldCByZXNBdHRyID0gcmVzLmRhdGFzZXRzW2ldO1xyXG4gICAgICAgICAgICAgIGxldCBjdXJyZW50Tm9kZURhdGE6IFByb2plY3RTdHJ1Y3R1cmUgPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogU3RyaW5nKGkpLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogY3VycmVudE5vZGUubGFiZWwsXHJcbiAgICAgICAgICAgICAgICBmaWxlTmFtZTogY3VycmVudE5vZGUubGFiZWwsXHJcbiAgICAgICAgICAgICAgICBwYXRoOiBjdXJyZW50Tm9kZS5sYWJlbCxcclxuICAgICAgICAgICAgICAgIGhhc0NoaWxkcmVuOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgIGlzRGF0YXNldDogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGRhdGFzZXRBdHRyczogKHtcclxuICAgICAgICAgICAgICAgICAgY3NpRW50cnlUeXBlOiByZXNBdHRyLmNzaUVudHJ5VHlwZSxcclxuICAgICAgICAgICAgICAgICAgZHNvcmc6IHJlc0F0dHIuZHNvcmcsXHJcbiAgICAgICAgICAgICAgICAgIHJlY2ZtOiByZXNBdHRyLnJlY2ZtLFxyXG4gICAgICAgICAgICAgICAgICB2b2xzZXI6IHJlc0F0dHIudm9sc2VyXHJcbiAgICAgICAgICAgICAgICB9IGFzIERhdGFzZXRBdHRyaWJ1dGVzKVxyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgY3VycmVudE5vZGUuZGF0YSA9IGN1cnJlbnROb2RlRGF0YTtcclxuICAgICAgICAgICAgICBsZXQgbWlncmF0ZWQgPSB0aGlzLnV0aWxzLmlzRGF0YXNldE1pZ3JhdGVkKGN1cnJlbnROb2RlLmRhdGEuZGF0YXNldEF0dHJzKTtcclxuICAgICAgICAgICAgICBpZiAoY3VycmVudE5vZGUuZGF0YS5kYXRhc2V0QXR0cnMuZHNvcmdcclxuICAgICAgICAgICAgICAgICYmIGN1cnJlbnROb2RlLmRhdGEuZGF0YXNldEF0dHJzLmRzb3JnLm9yZ2FuaXphdGlvbiA9PT0gJ3BhcnRpdGlvbmVkJykge1xyXG4gICAgICAgICAgICAgICAgY3VycmVudE5vZGUudHlwZSA9ICdmb2xkZXInO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudE5vZGUuZXhwYW5kZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmIChtaWdyYXRlZCkge1xyXG4gICAgICAgICAgICAgICAgICBjdXJyZW50Tm9kZS5pY29uID0gJ2ZhIGZhLWNsb2NrLW8nO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgY3VycmVudE5vZGUuZXhwYW5kZWRJY29uID0gJ2ZhIGZhLWZvbGRlci1vcGVuJztcclxuICAgICAgICAgICAgICAgICAgY3VycmVudE5vZGUuY29sbGFwc2VkSWNvbiA9ICdmYSBmYS1mb2xkZXInO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHJlcy5kYXRhc2V0c1tpXS5tZW1iZXJzKSB7XHJcbiAgICAgICAgICAgICAgICAgIGN1cnJlbnROb2RlLmRhdGEuaGFzQ2hpbGRyZW4gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmFkZENoaWxkcmVuKGN1cnJlbnROb2RlLCByZXMuZGF0YXNldHNbaV0ubWVtYmVycyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGN1cnJlbnROb2RlLmljb24gPSAobWlncmF0ZWQpID8gJ2ZhIGZhLWNsb2NrLW8nIDogJ2ZhIGZhLWZpbGUnO1xyXG4gICAgICAgICAgICAgICAgY3VycmVudE5vZGUudHlwZSA9ICdmaWxlJztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgcGFyZW50cy5wdXNoKGN1cnJlbnROb2RlKTtcclxuICAgICAgICAgICAgICBwYXJlbnRNYXBbY3VycmVudE5vZGUubGFiZWxdID0gY3VycmVudE5vZGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIk5vIGRhdGFzZXRzIHdlcmUgZm91bmQgZm9yICdcIiArIHBhdGggKyBcIidcIixcclxuICAgICAgICAgICAgICAnRGlzbWlzcycsIHF1aWNrU25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgICAgLy9kYXRhIHNldCBwcm9iYWJseSBkb2VzbnQgZXhpc3RcclxuICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJlc29sdmUocGFyZW50cyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlcnJvcjogKGVycikgPT4ge1xyXG4gICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIHJlamVjdChlcnIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBhZGRDaGlsZHJlbihwYXJlbnROb2RlOiBUcmVlTm9kZSwgbWVtYmVyczogTWVtYmVyW10pOiB2b2lkIHtcclxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBtZW1iZXJzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGxldCBjaGlsZE5vZGU6IFRyZWVOb2RlID0ge307XHJcbiAgICAgIGNoaWxkTm9kZS50eXBlID0gJ2ZpbGUnO1xyXG4gICAgICBjaGlsZE5vZGUuaWNvbiA9ICdmYSBmYS1maWxlJztcclxuICAgICAgY2hpbGROb2RlLmxhYmVsID0gbWVtYmVyc1tpXS5uYW1lLnJlcGxhY2UoL15cXHMrfFxccyskLywgJycpO1xyXG4gICAgICBjaGlsZE5vZGUucGFyZW50ID0gcGFyZW50Tm9kZTtcclxuICAgICAgbGV0IGNoaWxkTm9kZURhdGE6IFByb2plY3RTdHJ1Y3R1cmUgPSB7XHJcbiAgICAgICAgaWQ6IHBhcmVudE5vZGUuZGF0YS5pZCxcclxuICAgICAgICBuYW1lOiBjaGlsZE5vZGUubGFiZWwsXHJcbiAgICAgICAgaGFzQ2hpbGRyZW46IGZhbHNlLFxyXG4gICAgICAgIGlzRGF0YXNldDogdHJ1ZSxcclxuICAgICAgICBkYXRhc2V0QXR0cnM6IHBhcmVudE5vZGUuZGF0YS5kYXRhc2V0QXR0cnNcclxuICAgICAgfVxyXG4gICAgICBjaGlsZE5vZGVEYXRhLnBhdGggPSBjaGlsZE5vZGVEYXRhLmZpbGVOYW1lID0gYCR7cGFyZW50Tm9kZS5sYWJlbH0oJHtjaGlsZE5vZGUubGFiZWx9KWA7XHJcbiAgICAgIGNoaWxkTm9kZS5kYXRhID0gKGNoaWxkTm9kZURhdGEgYXMgUHJvamVjdFN0cnVjdHVyZSk7XHJcbiAgICAgIHBhcmVudE5vZGUuY2hpbGRyZW4ucHVzaChjaGlsZE5vZGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgdXBkYXRlUmVjYWxsZWREYXRhc2V0Tm9kZShub2RlOiBUcmVlTm9kZSwgZGF0YXNldEF0dHJzOiBEYXRhc2V0QXR0cmlidXRlcyk6IHZvaWQge1xyXG4gICAgY29uc3Qgc2hvd0FzRm9sZGVyID0gQXJyYXkuaXNBcnJheShkYXRhc2V0QXR0cnMubWVtYmVycyk7XHJcbiAgICBub2RlLmRhdGEuZGF0YXNldEF0dHJzID0gZGF0YXNldEF0dHJzO1xyXG4gICAgaWYgKHNob3dBc0ZvbGRlcikge1xyXG4gICAgICBub2RlLmRhdGEuaGFzQ2hpbGRyZW4gPSB0cnVlO1xyXG4gICAgICB0aGlzLmFkZENoaWxkcmVuKG5vZGUsIGRhdGFzZXRBdHRycy5tZW1iZXJzKTtcclxuICAgICAgbm9kZS5leHBhbmRlZEljb24gPSAnZmEgZmEtZm9sZGVyLW9wZW4nO1xyXG4gICAgICBub2RlLmNvbGxhcHNlZEljb24gPSAnZmEgZmEtZm9sZGVyJztcclxuICAgICAgbm9kZS5leHBhbmRlZCA9IHRydWU7XHJcbiAgICAgIG5vZGUuaWNvbiA9IHVuZGVmaW5lZDtcclxuICAgICAgbm9kZS50eXBlID0gJ2ZvbGRlcic7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBub2RlLmljb24gPSAnZmEgZmEtZmlsZSc7XHJcbiAgICAgIG5vZGUudHlwZSA9ICdmaWxlJztcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJlZnJlc2hIaXN0b3J5KHBhdGg6IHN0cmluZykge1xyXG4gICAgdGhpcy5zYXZlSGlzdG9yeVN1YnNjcmlwdGlvbiA9IHRoaXMubXZzU2VhcmNoSGlzdG9yeVxyXG4gICAgICAuc2F2ZVNlYXJjaEhpc3RvcnkocGF0aClcclxuICAgICAgLnN1YnNjcmliZSgpO1xyXG4gIH1cclxuXHJcbiAgY2xlYXJTZWFyY2hIaXN0b3J5KCk6IHZvaWQge1xyXG4gICAgdGhpcy5tdnNTZWFyY2hIaXN0b3J5LmRlbGV0ZVNlYXJjaEhpc3RvcnkoKS5zdWJzY3JpYmUoKTtcclxuICAgIHRoaXMubXZzU2VhcmNoSGlzdG9yeS5vbkluaXQoU0VBUkNIX0lEKTtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICogW2xldmVsVXA6IGZ1bmN0aW9uIHRvIGFzY2VuZCB1cCBhIGxldmVsIGluIHRoZSBmaWxlL2ZvbGRlciB0cmVlXVxyXG4gICogQHBhcmFtIGluZGV4IFt0cmVlIGluZGV4IHdoZXJlIHRoZSAnZm9sZGVyJyBwYXJlbnQgaXMgYWNjZXNzZWRdXHJcbiAgKi9cclxuICBsZXZlbFVwKCk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLnBhdGguaW5jbHVkZXMoJy4nKSkge1xyXG4gICAgICB0aGlzLnBhdGggPSAnJztcclxuICAgIH1cclxuICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAoL1xcLlteXFwuXSskLyk7XHJcbiAgICBpZiAodGhpcy5wYXRoLnN1YnN0cih0aGlzLnBhdGgubGVuZ3RoIC0gMiwgMikgPT0gJy4qJykge1xyXG4gICAgICB0aGlzLnBhdGggPSB0aGlzLnBhdGgucmVwbGFjZShyZWdleCwgJycpLnJlcGxhY2UocmVnZXgsICcuKicpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5wYXRoID0gdGhpcy5wYXRoLnJlcGxhY2UocmVnZXgsICcuKicpXHJcbiAgICB9XHJcbiAgICB0aGlzLnVwZGF0ZVRyZWVWaWV3KHRoaXMucGF0aCk7XHJcbiAgfVxyXG5cclxuICBjaGVja0lmSW5EZWxldGlvblF1ZXVlQW5kTWVzc2FnZShwYXRoQW5kTmFtZTogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGlmICh0aGlzLmRlbGV0aW9uUXVldWUuaGFzKHBhdGhBbmROYW1lKSkge1xyXG4gICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oJ0RlbGV0aW9uIGluIHByb2dyZXNzOiAnICsgcGF0aEFuZE5hbWUgKyBcIicgXCIgKyBtZXNzYWdlLFxyXG4gICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlRGF0YXNldERpYWxvZyhkYXRhPzogYW55KSB7XHJcbiAgICBjb25zdCBkc0NyZWF0ZUNvbmZpZyA9IG5ldyBNYXREaWFsb2dDb25maWcoKTtcclxuICAgIGRzQ3JlYXRlQ29uZmlnLmRhdGEgPSB7XHJcbiAgICAgIGRhdGFcclxuICAgIH07XHJcbiAgICBkc0NyZWF0ZUNvbmZpZy5tYXhXaWR0aCA9ICcxMDAwcHgnO1xyXG4gICAgZHNDcmVhdGVDb25maWcuZGlzYWJsZUNsb3NlID0gdHJ1ZTtcclxuXHJcbiAgICBsZXQgc2F2ZVJlZiA9IHRoaXMuZGlhbG9nLm9wZW4oQ3JlYXRlRGF0YXNldE1vZGFsLCBkc0NyZWF0ZUNvbmZpZyk7XHJcblxyXG4gICAgc2F2ZVJlZi5hZnRlckNsb3NlZCgpLnN1YnNjcmliZShhdHRyaWJ1dGVzID0+IHtcclxuICAgICAgaWYgKGF0dHJpYnV0ZXMuZGF0YXNldE5hbWVUeXBlID09ICdMSUJSQVJZJykge1xyXG4gICAgICAgIGF0dHJpYnV0ZXMuZGF0YXNldE5hbWVUeXBlID0gJ1BEU0UnO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChhdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgY29uc3QgZGF0YXNldEF0dHJpYnV0ZXMgPSB7XHJcbiAgICAgICAgICBuZGlzcDogJ0NBVEFMT0cnLFxyXG4gICAgICAgICAgc3RhdHVzOiAnTkVXJyxcclxuICAgICAgICAgIHNwYWNlOiBhdHRyaWJ1dGVzLmFsbG9jYXRpb25Vbml0LFxyXG4gICAgICAgICAgZHNvcmc6IGF0dHJpYnV0ZXMub3JnYW5pemF0aW9uLFxyXG4gICAgICAgICAgbHJlY2w6IHBhcnNlSW50KGF0dHJpYnV0ZXMucmVjb3JkTGVuZ3RoKSxcclxuICAgICAgICAgIHJlY2ZtOiBhdHRyaWJ1dGVzLnJlY29yZEZvcm1hdCxcclxuICAgICAgICAgIGRpcjogcGFyc2VJbnQoYXR0cmlidXRlcy5kaXJlY3RvcnlCbG9ja3MpLFxyXG4gICAgICAgICAgcHJpbWU6IHBhcnNlSW50KGF0dHJpYnV0ZXMucHJpbWFyeVNwYWNlKSxcclxuICAgICAgICAgIHNlY25kOiBwYXJzZUludChhdHRyaWJ1dGVzLnNlY29uZGFyeVNwYWNlKSxcclxuICAgICAgICAgIGRzbnQ6IGF0dHJpYnV0ZXMuZGF0YXNldE5hbWVUeXBlLFxyXG4gICAgICAgICAgY2xvc2U6ICd0cnVlJ1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMuYXZlcmFnZVJlY29yZFVuaXQpIHtcclxuICAgICAgICAgIGRhdGFzZXRBdHRyaWJ1dGVzWydhdmdyJ10gPSBhdHRyaWJ1dGVzLmF2ZXJhZ2VSZWNvcmRVbml0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYXR0cmlidXRlcy5ibG9ja1NpemUpIHtcclxuICAgICAgICAgIGRhdGFzZXRBdHRyaWJ1dGVzWydibGtzeiddID0gcGFyc2VJbnQoYXR0cmlidXRlcy5ibG9ja1NpemUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5kYXRhc2V0U2VydmljZS5jcmVhdGVEYXRhc2V0KGRhdGFzZXRBdHRyaWJ1dGVzLCBhdHRyaWJ1dGVzLm5hbWUpLnN1YnNjcmliZSh7XHJcbiAgICAgICAgICBuZXh0OiByZXNwID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKGBEYXRhc2V0OiAke2F0dHJpYnV0ZXMubmFtZX0gY3JlYXRlZCBzdWNjZXNzZnVsbHkuYCwgJ0Rpc21pc3MnLCBxdWlja1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIHRoaXMuY3JlYXRlRGF0YXNldC5lbWl0KHsgc3RhdHVzOiAnc3VjY2VzcycsIG5hbWU6IGF0dHJpYnV0ZXMubmFtZSwgb3JnOiBhdHRyaWJ1dGVzLm9yZ2FuaXphdGlvbiwgaW5pdERhdGE6IGRzQ3JlYXRlQ29uZmlnLmRhdGEuZGF0YSB9KTtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBlcnJvcjogZXJyb3IgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oYEZhaWxlZCB0byBjcmVhdGUgdGhlIGRhdGFzZXQ6ICR7ZXJyb3IuZXJyb3J9YCwgJ0Rpc21pc3MnLCBsb25nU25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgICAgdGhpcy5jcmVhdGVEYXRhc2V0LmVtaXQoeyBzdGF0dXM6ICdlcnJvcicsIGVycm9yOiBlcnJvci5lcnJvciwgbmFtZTogYXR0cmlidXRlcy5uYW1lIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG59XHJcblxyXG5cclxuXHJcblxyXG4vKlxyXG4gIFRoaXMgcHJvZ3JhbSBhbmQgdGhlIGFjY29tcGFueWluZyBtYXRlcmlhbHMgYXJlXHJcbiAgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcclxuICB0aGlzIGRpc3RyaWJ1dGlvbiwgYW5kIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5lY2xpcHNlLm9yZy9sZWdhbC9lcGwtdjIwLmh0bWxcclxuICBcclxuICBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxyXG4gIFxyXG4gIENvcHlyaWdodCBDb250cmlidXRvcnMgdG8gdGhlIFpvd2UgUHJvamVjdC5cclxuKi9cclxuIiwiPCEtLVxuVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcbm1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRWNsaXBzZSBQdWJsaWMgTGljZW5zZSB2Mi4wIHdoaWNoIGFjY29tcGFuaWVzXG50aGlzIGRpc3RyaWJ1dGlvbiwgYW5kIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5lY2xpcHNlLm9yZy9sZWdhbC9lcGwtdjIwLmh0bWxcblxuU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcblxuQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxuLS0+XG5cbjxkaXYgc3R5bGU9XCJoZWlnaHQ6IDEwMCVcIj5cblxuICA8IS0tIFRhYnMsIHNlYXJjaGJhciwgYW5kIGxvYWRpbmcgaW5kaWNhdG9yIC0tPlxuICBAaWYgKHNob3dVcEFycm93KSB7XG4gIDxpbWcgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCIgY2xhc3M9XCJmaWxlYnJvd3Nlcm12cy1wb2ludGVyLWxvZ29cIiB0aXRsZT1cIkdvIHVwIHRvIHRoZSBwYXJlbnQgbGV2ZWxcIiAoY2xpY2spPVwibGV2ZWxVcCgpXCJcbiAgICBbbmdTdHlsZV09XCJ0cmVlU3R5bGVcIiB0YWJpbmRleD1cIjBcIiAoa2V5ZG93bi5lbnRlcik9XCJsZXZlbFVwKClcIiAvPlxuICB9XG5cbiAgPGRpdiBjbGFzcz1cImZpbGVicm93c2VybXZzLXNlYXJjaFwiIFtuZ1N0eWxlXT1cInNlYXJjaFN0eWxlXCI+XG4gICAgPGRpdiBjbGFzcz1cInNlYXJjaFJvd0ZsZXhcIj5cbiAgICAgIDxpbnB1dCBbKG5nTW9kZWwpXT1cInBhdGhcIiBsaXN0PVwic2VhcmNoTVZTSGlzdG9yeVwiIHBsYWNlaG9sZGVyPVwiRW50ZXIgYSBkYXRhc2V0IHF1ZXJ5Li4uXCJcbiAgICAgICAgY2xhc3M9XCJmaWxlYnJvd3Nlcm12cy1zZWFyY2gtaW5wdXRcIiAoa2V5ZG93bi5lbnRlcik9XCJ1cGRhdGVUcmVlVmlldyhwYXRoKTtcIiBbbmdTdHlsZV09XCJpbnB1dFN0eWxlXCI+XG4gICAgICA8IS0tIFRPRE86IG1ha2Ugc2VhcmNoIGhpc3RvcnkgYSBkaXJlY3RpdmUgdG8gdXNlIGluIGJvdGggdXNzIGFuZCBtdnMtLT5cbiAgICAgIDxtYXQtYnV0dG9uLXRvZ2dsZS1ncm91cCBpZD1cInF1YWxHcm91cFwiICNncm91cD1cIm1hdEJ1dHRvblRvZ2dsZUdyb3VwXCI+XG4gICAgICAgIDxtYXQtYnV0dG9uLXRvZ2dsZSBbY2hlY2tlZF09XCJhZGRpdGlvbmFsUXVhbGlmaWVyc1wiIGNsYXNzPVwicXVhbEJ1dHRvblwiXG4gICAgICAgICAgKGNsaWNrKT1cImFkZGl0aW9uYWxRdWFsaWZpZXJzID0gIWFkZGl0aW9uYWxRdWFsaWZpZXJzXCIgYXJpYS1sYWJlbD1cIkluY2x1ZGUgYWRkaXRpb25hbCBxdWFsaWZpZXJzXCJcbiAgICAgICAgICB0aXRsZT1cIkluY2x1ZGUgQWRkaXRpb25hbCBRdWFsaWZpZXJzXCI+XG4gICAgICAgICAgPHN0cm9uZz4uKio8L3N0cm9uZz5cbiAgICAgICAgPC9tYXQtYnV0dG9uLXRvZ2dsZT5cbiAgICAgIDwvbWF0LWJ1dHRvbi10b2dnbGUtZ3JvdXA+XG4gICAgICA8ZGF0YWxpc3QgaWQ9XCJzZWFyY2hNVlNIaXN0b3J5XCI+XG4gICAgICAgIEBmb3IgKGl0ZW0gb2YgbXZzU2VhcmNoSGlzdG9yeS5zZWFyY2hIaXN0b3J5VmFsOyB0cmFjayBpdGVtKSB7XG4gICAgICAgIDxvcHRpb24gW3ZhbHVlXT1cIml0ZW1cIj48L29wdGlvbj5cbiAgICAgICAgfVxuICAgICAgPC9kYXRhbGlzdD5cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG5cbiAgPGRpdiBjbGFzcz1cImZhIGZhLXNwaW5uZXIgZmEtc3BpbiBmaWxlYnJvd3Nlcm12cy1sb2FkaW5nLWljb25cIiBbaGlkZGVuXT1cIiFpc0xvYWRpbmdcIj48L2Rpdj5cbiAgPGRpdiBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmlsZWJyb3dzZXJtdnMtbG9hZGluZy1pY29uXCIgdGl0bGU9XCJSZWZyZXNoIGRhdGFzZXQgbGlzdFwiIChjbGljayk9XCJ1cGRhdGVUcmVlVmlldyhwYXRoKTtcIlxuICAgIFtoaWRkZW5dPVwiaXNMb2FkaW5nXCIgc3R5bGU9XCJtYXJnaW4tbGVmdDogOXB4OyBjdXJzb3I6IHBvaW50ZXI7XCI+PC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJmaWxlLXRyZWUtdXRpbGl0aWVzXCI+XG4gICAgPGRpdiBjbGFzcz1cImZhIGZhLW1pbnVzLXNxdWFyZS1vIGZpbGVicm93c2VydXNzLWNvbGxhcHNlLWljb25cIiB0aXRsZT1cIkNvbGxhcHNlIEZvbGRlcnMgaW4gRXhwbG9yZXJcIlxuICAgICAgKGNsaWNrKT1cImNvbGxhcHNlVHJlZSgpO1wiIHN0eWxlPVwibWFyZ2luLXJpZ2h0OiA5cHg7IGZsb2F0OnJpZ2h0OyBjdXJzb3I6IHBvaW50ZXI7XCI+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImZhIGZhLXRyYXNoLW8gZmlsZWJyb3dzZXJ1c3MtZGVsZXRlLWljb25cIiB0aXRsZT1cIkRlbGV0ZVwiIChjbGljayk9XCJzaG93RGVsZXRlRGlhbG9nKHNlbGVjdGVkTm9kZSk7XCJcbiAgICAgIHN0eWxlPVwibWFyZ2luLXJpZ2h0OiA5cHg7IGZsb2F0OnJpZ2h0OyBjdXJzb3I6IHBvaW50ZXI7XCI+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImZhIGZhLXBsdXNcIiB0aXRsZT1cIkNyZWF0ZSBuZXcgZGF0YXNldFwiIChjbGljayk9XCJjcmVhdGVEYXRhc2V0RGlhbG9nKClcIlxuICAgICAgc3R5bGU9XCJtYXJnaW4tcmlnaHQ6IDlweDsgZmxvYXQ6cmlnaHQ7IGN1cnNvcjogcG9pbnRlcjtcIj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwiZmEgZmEtZXJhc2VyIGZpbGVicm93c2VyLWljb24gc3BlY2lhbC11dGlsaXR5XCIgdGl0bGU9XCJDbGVhciBTZWFyY2ggSGlzdG9yeVwiXG4gICAgICAoY2xpY2spPVwiY2xlYXJTZWFyY2hIaXN0b3J5KCk7XCI+PC9kaXY+XG4gIDwvZGl2PlxuICA8IS0tIE1haW4gdHJlZSAtLT5cbiAgPGRpdiBbaGlkZGVuXT1cImhpZGVFeHBsb3JlclwiIHN0eWxlPVwiaGVpZ2h0OiAxMDAlO1wiPlxuICAgIDx0cmVlLXJvb3QgW3RyZWVEYXRhXT1cImRhdGFcIiAoY2xpY2tFdmVudCk9XCJvbk5vZGVDbGljaygkZXZlbnQpXCIgKGRibENsaWNrRXZlbnQpPVwib25Ob2RlRGJsQ2xpY2soJGV2ZW50KVwiXG4gICAgICBbc3R5bGVdPVwic3R5bGVcIiAocmlnaHRDbGlja0V2ZW50KT1cIm9uTm9kZVJpZ2h0Q2xpY2soJGV2ZW50KVwiIChwYW5lbFJpZ2h0Q2xpY2tFdmVudCk9XCJvblBhbmVsUmlnaHRDbGljaygkZXZlbnQpXCJcbiAgICAgIChkYXRhQ2hhbmdlZCk9XCJvbkRhdGFDaGFuZ2VkKCRldmVudClcIj5cbiAgICA8L3RyZWUtcm9vdD5cbiAgPC9kaXY+XG5cbiAgQGlmIChzaG93U2VhcmNoKSB7XG4gIDxkaXYgY2xhc3M9XCJwLWlucHV0Z3JvdXAgZmlsZWJyb3dzZXJ1c3Mtc2VhcmNoLWJvdHRvbS1ncm91cFwiPlxuICAgIDxzcGFuIGNsYXNzPVwicC1pbnB1dGdyb3VwLWFkZG9uXCI+PGkgY2xhc3M9XCJmYSBmYS1zZWFyY2ggZmlsZWJyb3dzZXJ1c3Mtc2VhcmNoLWJvdHRvbS1pY29uXCI+PC9pPjwvc3Bhbj5cbiAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBwSW5wdXRUZXh0IHBsYWNlaG9sZGVyPVwiU2VhcmNoIGRhdGFzZXRzL21lbWJlcnMgYnkgbmFtZS4uLlwiXG4gICAgICBjbGFzcz1cImZpbGVicm93c2VydXNzLXNlYXJjaC1ib3R0b20taW5wdXRcIiBbZm9ybUNvbnRyb2xdPVwic2VhcmNoQ3RybFwiICNzZWFyY2hNVlM+XG4gIDwvZGl2PlxuICB9XG48L2Rpdj5cbjwhLS1cbiAgICBUaGlzIHByb2dyYW0gYW5kIHRoZSBhY2NvbXBhbnlpbmcgbWF0ZXJpYWxzIGFyZVxuICAgIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRWNsaXBzZSBQdWJsaWMgTGljZW5zZSB2Mi4wIHdoaWNoIGFjY29tcGFuaWVzXG4gICAgdGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXG5cbiAgICBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxuXG4gICAgQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxuICAgIC0tPiJdfQ==