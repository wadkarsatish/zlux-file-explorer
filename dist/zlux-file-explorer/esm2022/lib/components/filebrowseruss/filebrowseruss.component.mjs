/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, EventEmitter, Input, Output, ViewEncapsulation, Inject, Optional, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, debounceTime, finalize, map, timeout } from 'rxjs/operators';
import { Angular2InjectionTokens } from '../../../pluginlib/inject-resources';
import { MatDialogConfig } from '@angular/material/dialog';
import { FilePropertiesModal } from '../file-properties-modal/file-properties-modal.component';
import { DeleteFileModal } from '../delete-file-modal/delete-file-modal.component';
import { CreateFolderModal } from '../create-folder-modal/create-folder-modal.component';
import { CreateFileModal } from '../create-file-modal/create-file-modal.component';
import { UploadModal } from '../upload-files-modal/upload-files-modal.component';
import { FilePermissionsModal } from '../file-permissions-modal/file-permissions-modal.component';
import { FileOwnershipModal } from '../file-ownership-modal/file-ownership-modal.component';
import { FileTaggingModal } from '../file-tagging-modal/file-tagging-modal.component';
import { quickSnackbarOptions, defaultSnackbarOptions, longSnackbarOptions } from '../../shared/snackbar-options';
import { incrementFileName } from '../../shared/fileActions';
import { TreeComponent } from '../tree/tree.component';
import * as _ from 'lodash';
import { UssCrudService } from '../../services/uss.crud.service';
import { SearchHistoryService } from '../../services/searchHistoryService';
import * as i0 from "@angular/core";
import * as i1 from "../../services/uss.crud.service";
import * as i2 from "../../services/utils.service";
import * as i3 from "../../services/searchHistoryService";
import * as i4 from "@angular/material/dialog";
import * as i5 from "@angular/material/snack-bar";
import * as i6 from "../../services/downloader.service";
import * as i7 from "@angular/common";
import * as i8 from "@angular/forms";
import * as i9 from "primeng/inputtext";
import * as i10 from "../tree/tree.component";
/* TODO: re-implement to add fetching of previously opened tree view data
import { PersistentDataService } from '../../services/persistentData.service'; */
const SEARCH_ID = 'uss';
export class FileBrowserUSSComponent {
    constructor(elementRef, ussSrv, utils, ussSearchHistory, dialog, snackBar, downloadService, log, launchMetadata, pluginDefinition, windowActions) {
        this.elementRef = elementRef;
        this.ussSrv = ussSrv;
        this.utils = utils;
        this.ussSearchHistory = ussSearchHistory;
        this.dialog = dialog;
        this.snackBar = snackBar;
        this.downloadService = downloadService;
        this.log = log;
        this.launchMetadata = launchMetadata;
        this.pluginDefinition = pluginDefinition;
        this.windowActions = windowActions;
        this.deletionQueue = new Map(); //multiple files deletion is async, so queue is used
        /* Tree outgoing events */
        this.pathChanged = new EventEmitter();
        this.dataChanged = new EventEmitter();
        this.nodeClick = new EventEmitter();
        this.nodeDblClick = new EventEmitter();
        this.nodeRightClick = new EventEmitter();
        // @Output() newFileClick: EventEmitter<any> = new EventEmitter<any>();
        this.newFolderClick = new EventEmitter();
        this.newFileClick = new EventEmitter();
        this.fileUploaded = new EventEmitter();
        this.copyClick = new EventEmitter();
        this.deleteClick = new EventEmitter();
        this.ussRenameEvent = new EventEmitter();
        this.rightClick = new EventEmitter();
        this.openInNewTab = new EventEmitter();
        /* TODO: Legacy, capabilities code (unused for now) */
        //this.componentClass = ComponentClass.FileBrowser;
        this.initalizeCapabilities();
        this.ussSearchHistory.onInit(SEARCH_ID);
        this.root = "/"; // Dev purposes: Replace with home directory to test Explorer functionalities
        this.path = this.root;
        this.data = [];
        this.hideExplorer = false;
        this.isLoading = false;
        this.showSearch = false;
        this.searchCtrl = new FormControl();
        this.searchValueSubscription = this.searchCtrl.valueChanges.pipe(debounceTime(500)).subscribe((value) => { this.searchInputChanged(value); });
        this.selectedNode = null;
    }
    ngOnInit() {
        this.loadUserHomeDirectory().pipe(catchError(err => {
            this.log.warn(`Unsuccessful in loading user home directory: ${err}`);
            return of('/');
        })).subscribe(home => {
            if (!this.homePath) {
                if (this.launchMetadata && this.launchMetadata.data && this.launchMetadata.data.name) {
                    this.path = this.launchMetadata.data.name;
                    this.updateUss(this.path);
                }
                else {
                    this.path = home;
                    this.updateUss(home);
                }
                this.homePath = home;
            }
        });
        this.initializeRightClickProperties();
        // TODO: Uncomment & fix auto-update of node data based on an interval. Maybe future setting?
        // this.persistentDataService.getData()
        //   .subscribe(data => {
        //     if (data.contents.ussInput) {
        //       this.path = data.contents.ussInput; }
        //     if (data.contents.ussData !== undefined)
        //     data.contents.ussData.length == 0 ? this.displayTree(this.path, false) : (this.data = data.contents.ussData, this.path = data.contents.ussInput)
        //     else
        //     this.displayTree(this.root, false);
        //   })
        // this.intervalId = setInterval(() => {
        //  this.updateUss(this.path);
        // }, this.updateInterval);
    }
    ngOnDestroy() {
        /* TODO: Fetching updates for automatic refresh (disabled for now) */
        // if (this.intervalId) {
        //   clearInterval(this.intervalId);
        // }
        if (this.searchValueSubscription) {
            this.searchValueSubscription.unsubscribe();
        }
        if (this.ussSearchHistorySubscription) {
            this.ussSearchHistorySubscription.unsubscribe();
        }
    }
    getDOMElement() {
        return this.elementRef.nativeElement;
    }
    getSelectedPath() {
        //TODO:how do we want to want to handle caching vs message to app to open said path
        return this.path;
    }
    loadUserHomeDirectory() {
        this.isLoading = true;
        return this.ussSrv.getUserHomeFolder().pipe(timeout(2000), map(resp => resp.home.trim()), finalize(() => this.isLoading = false));
    }
    initalizeCapabilities() {
        //   //this.capabilities = new Array<Capability>();
        //   //this.capabilities.push(FileBrowserCapabilities.FileBrowser);
        //   //this.capabilities.push(FileBrowserCapabilities.FileBrowserUSS);
    }
    initializeRightClickProperties() {
        this.rightClickPropertiesFile = [
            {
                text: "Request Open in New Browser Tab", action: () => {
                    this.openInNewTab.emit(this.rightClickedFile);
                }
            },
            {
                text: "Refresh Metadata", action: () => {
                    this.refreshFileMetadata(this.rightClickedFile);
                }
            },
            {
                text: "Change Mode/Permissions...", action: () => {
                    this.showPermissionsDialog(this.rightClickedFile);
                }
            },
            {
                text: "Change Owners...", action: () => {
                    this.showOwnerDialog(this.rightClickedFile);
                }
            },
            {
                text: "Tag...", action: () => {
                    this.showTaggingDialog(this.rightClickedFile);
                }
            },
            {
                text: "Download", action: () => {
                    this.attemptDownload(this.rightClickedFile);
                }
            },
            {
                text: "Cut", action: () => {
                    this.cutFile(this.rightClickedFile);
                }
            },
            {
                text: "Copy", action: () => {
                    this.copyFile(this.rightClickedFile);
                }
            },
            {
                text: "Copy Link", action: () => {
                    this.copyLink(this.rightClickedFile);
                }
            },
            {
                text: "Copy Path", action: () => {
                    this.copyPath(this.rightClickedFile);
                }
            },
            {
                text: "Delete", action: () => {
                    this.showDeleteDialog(this.rightClickedFile);
                }
            },
            {
                text: "Rename", action: () => {
                    this.showRenameField(this.rightClickedFile);
                }
            },
            {
                text: "Properties", action: () => {
                    this.showPropertiesDialog(this.rightClickedFile);
                }
            },
        ];
        this.rightClickPropertiesFolder = [
            {
                text: "Refresh", action: () => {
                    this.addChild(this.rightClickedFile, true, this.rightClickedFile.expanded || false);
                }
            },
            {
                text: "Change Mode/Permissions...", action: () => {
                    this.showPermissionsDialog(this.rightClickedFile);
                }
            },
            {
                text: "Change Owners...", action: () => {
                    this.showOwnerDialog(this.rightClickedFile);
                }
            },
            {
                text: "Tag Directory...", action: () => {
                    this.showTaggingDialog(this.rightClickedFile);
                }
            },
            {
                text: "Create a File...", action: () => {
                    this.showCreateFileDialog(this.rightClickedFile);
                }
            },
            {
                text: "Create a Directory...", action: () => {
                    this.showCreateFolderDialog(this.rightClickedFile);
                }
            },
            {
                text: "Upload...", action: () => {
                    this.showUploadDialog(this.rightClickedFile);
                }
            },
            {
                text: "Copy Link", action: () => {
                    this.copyLink(this.rightClickedFile);
                }
            },
            {
                text: "Copy Path", action: () => {
                    this.copyPath(this.rightClickedFile);
                }
            },
            {
                text: "Delete", action: () => {
                    this.showDeleteDialog(this.rightClickedFile);
                }
            },
            {
                text: "Rename", action: () => {
                    this.showRenameField(this.rightClickedFile);
                }
            },
            {
                text: "Properties", action: () => {
                    this.showPropertiesDialog(this.rightClickedFile);
                }
            }
        ];
        this.rightClickPropertiesPanel = [
            {
                text: "Show/Hide Search", action: () => {
                    this.toggleSearch();
                }
            },
            {
                text: "Create a File...", action: () => {
                    let nodeToUse = {
                        path: this.path,
                    };
                    this.showCreateFileDialog(nodeToUse);
                }
            },
            {
                text: "Create a Directory...", action: () => {
                    let nodeToUse = {
                        path: this.path,
                    };
                    this.showCreateFolderDialog(nodeToUse);
                }
            },
            {
                text: "Upload...", action: () => {
                    this.showUploadDialog(this.rightClickedFile);
                }
            },
        ];
    }
    copyFile(rightClickedFile) {
        this.log.debug(`copyfile for  ${this.fileToCopyOrCut}, ${this.rightClickedFile.path}, ${this.path}`);
        if (this.fileToCopyOrCut == null) {
            this.rightClickPropertiesFolder.push(// Create a paste option for the folder
            {
                text: "Paste", action: () => {
                    this.pasteFile(this.fileToCopyOrCut, this.rightClickedFile.path, false);
                }
            });
            this.rightClickPropertiesPanel.push(// Create a paste option for the active directory
            {
                text: "Paste", action: () => {
                    this.pasteFile(this.fileToCopyOrCut, this.path, false);
                }
            });
        }
        this.fileToCopyOrCut = rightClickedFile;
        this.copyClick.emit(rightClickedFile);
    }
    cutFile(rightClickedFile) {
        if (this.fileToCopyOrCut) {
            this.rightClickPropertiesFolder.splice(this.rightClickPropertiesFolder.map(item => item.text).indexOf("Paste"), 1);
            this.rightClickPropertiesPanel.splice(this.rightClickPropertiesPanel.map(item => item.text).indexOf("Paste"), 1);
        }
        this.log.debug(`cutfile for  ${this.fileToCopyOrCut}, ${this.rightClickedFile.path}, ${this.path}`);
        this.rightClickPropertiesFolder.push(// Create a paste option for the folder
        {
            text: "Paste", action: () => {
                this.pasteFile(this.fileToCopyOrCut, this.rightClickedFile.path, true);
            }
        });
        this.rightClickPropertiesPanel.push(// Create a paste option for the active directory
        {
            text: "Paste", action: () => {
                this.pasteFile(this.fileToCopyOrCut, this.path, true);
            }
        });
        this.fileToCopyOrCut = rightClickedFile;
        this.copyClick.emit(rightClickedFile);
    }
    pasteFile(fileNode, destinationPath, isCut) {
        let pathAndName = fileNode.path;
        let name = this.getNameFromPathAndName(pathAndName);
        this.log.debug(`paste for ${name}, ${destinationPath}, and cut=${isCut}`);
        if (pathAndName.indexOf(' ') >= 0) {
            this.snackBar.open("Paste failed: '" + pathAndName + "' Operation not yet supported for filenames with spaces.", 'Dismiss', defaultSnackbarOptions);
            return;
        }
        let metaData = this.ussSrv.getFileMetadata(pathAndName);
        metaData.subscribe({
            next: (result) => {
                if (result.ccsid == -1) {
                    this.snackBar.open("Paste failed: '" + pathAndName + "' Operation not yet supported for this encoding.", 'Dismiss', defaultSnackbarOptions);
                    return;
                }
                else {
                    this.isLoading = true;
                    let destinationMetadata = this.ussSrv.getFileContents(destinationPath);
                    destinationMetadata.subscribe({
                        next: (result) => {
                            /*rename the file when doing paste, in case same named file exists in the destination.*/
                            for (let i = 0; i < result.entries.length; i++) {
                                if (!result.entries[i].directory && result.entries[i].name == name) {
                                    if (isCut) {
                                        this.snackBar.open("Unable to move '" + pathAndName + "' because target '" + destinationPath + '\/' + name + "'already exists at destination.", 'Dismiss', longSnackbarOptions);
                                        return;
                                    }
                                    i = -1;
                                    name = incrementFileName(name);
                                }
                            }
                            let copySubscription = this.ussSrv.copyFile(pathAndName, destinationPath + "/" + name)
                                .subscribe({
                                next: (resp) => {
                                    if (this.rightClickedFile) {
                                        if (this.rightClickedFile.children && this.rightClickedFile.children.length > 0) {
                                            let expanded = this.rightClickedFile.expanded;
                                            /* We recycle the same method used for opening (clicking on) a node. But instead of expanding it,
                                            we keep the same expanded state, and just use it to add a node */
                                            this.addChild(this.rightClickedFile, true);
                                            this.rightClickedFile.expanded = expanded;
                                        }
                                        else if (this.path == destinationPath) {
                                            /* In the case that we right click to paste on the active directory instead of a node, we update our tree
                                            (active directory) instead of adding onto a specific node */
                                            this.displayTree(this.path, true);
                                        }
                                    }
                                    if (isCut) {
                                        /* Clear the paste option, because even if delete fails after, we have already done the copy */
                                        this.isLoading = true;
                                        this.fileToCopyOrCut = null;
                                        this.rightClickPropertiesFolder.splice(this.rightClickPropertiesFolder.map(item => item.text).indexOf("Paste"), 1);
                                        this.rightClickPropertiesPanel.splice(this.rightClickPropertiesPanel.map(item => item.text).indexOf("Paste"), 1);
                                        /* Delete (cut) portion */
                                        this.ussSrv.deleteFileOrFolder(pathAndName)
                                            .subscribe({
                                            next: (resp) => {
                                                this.isLoading = false;
                                                this.removeChild(fileNode);
                                                this.snackBar.open('Paste successful: ' + name, 'Dismiss', quickSnackbarOptions);
                                            },
                                            error: (error) => {
                                                if (error.status == '500') { //Internal Server Error
                                                    this.snackBar.open("Copied successfully, but failed to cut '" + pathAndName + "' Server returned with: " + error._body, 'Dismiss', longSnackbarOptions);
                                                }
                                                else if (error.status == '404') { //Not Found
                                                    this.snackBar.open("Copied successfully, but '" + pathAndName + "' has already been deleted or does not exist.", 'Dismiss', defaultSnackbarOptions);
                                                    this.removeChild(fileNode);
                                                }
                                                else if (error.status == '400' || error.status == '403') { //Bad Request
                                                    this.snackBar.open("Copied successfully but failed to cut '" + pathAndName + "' This is probably due to a permission problem.", 'Dismiss', defaultSnackbarOptions);
                                                }
                                                else { //Unknown
                                                    this.snackBar.open("Copied successfully, but unknown error cutting '" + error.status + "' occurred for '" + pathAndName + "' Server returned with: " + error._body, 'Dismiss', longSnackbarOptions);
                                                }
                                                this.isLoading = false;
                                                this.log.severe(error);
                                            }
                                        });
                                    }
                                    else {
                                        this.isLoading = false;
                                        this.snackBar.open('Paste successful: ' + name, 'Dismiss', quickSnackbarOptions);
                                    }
                                },
                                error: (error) => {
                                    if (error.status == '500') { //Internal Server Error
                                        this.snackBar.open("Paste failed: HTTP 500 from app-server or agent occurred for '" + pathAndName + "'. Server returned with: " + error._body, 'Dismiss', longSnackbarOptions);
                                    }
                                    else if (error.status == '404') { //Not Found
                                        this.snackBar.open("Paste failed: '" + pathAndName + "' does not exist.", 'Dismiss', defaultSnackbarOptions);
                                    }
                                    else if (error.status == '400') { //Bad Request
                                        this.snackBar.open("Paste failed: HTTP 400 occurred for '" + pathAndName + "'. Check that you have correct permissions for this action.", 'Dismiss', defaultSnackbarOptions);
                                    }
                                    else { //Unknown
                                        this.snackBar.open("Paste failed: '" + error.status + "' occurred for '" + pathAndName + "' Server returned with: " + error._body, 'Dismiss', longSnackbarOptions);
                                    }
                                    this.isLoading = false;
                                    this.log.severe(error);
                                }
                            });
                            setTimeout(() => {
                                if (copySubscription.closed == false) {
                                    this.snackBar.open('Pasting ' + pathAndName + '... Larger payloads may take longer. Please be patient.', 'Dismiss', quickSnackbarOptions);
                                }
                            }, 4000);
                        },
                        error: (error) => {
                            if (error.status == '403') { //Permission denied
                                this.snackBar.open('Failed to access destination folder: Permission denied.', 'Dismiss', defaultSnackbarOptions);
                            }
                            else if (error.status == '0') {
                                this.snackBar.open("Failed to communicate with the App server: " + error.status, 'Dismiss', defaultSnackbarOptions);
                            }
                            else if (error.status == '404') {
                                this.snackBar.open("Destination folder not found. " + error.status, 'Dismiss', quickSnackbarOptions);
                            }
                            else {
                                this.snackBar.open("An unknown error occurred: " + error.status, 'Dismiss', defaultSnackbarOptions);
                            }
                            this.log.severe(error);
                        }
                    });
                }
            },
            error: (error) => {
                if (error.status == '404') { // This happens when user attempts to paste a file that's been deleted after copying
                    this.snackBar.open("Paste failed: Original '" + pathAndName + "' no longer exists.", 'Dismiss', defaultSnackbarOptions);
                }
                this.isLoading = false;
                this.log.warn(error);
            }
        });
    }
    showPropertiesDialog(rightClickedFile) {
        const filePropConfig = new MatDialogConfig();
        filePropConfig.data = {
            event: rightClickedFile
        };
        filePropConfig.maxWidth = '350px';
        this.dialog.open(FilePropertiesModal, filePropConfig);
    }
    showRenameField(file) {
        const selectedNode = this.rightClickedEvent.originalEvent.srcElement;
        let oldName = file.name;
        let oldPath = file.path;
        file.selectable = false;
        let renameFn = (node) => {
            renameField.parentNode.replaceChild(node, renameField);
            file.selectable = true;
            let nameFromNode = renameField.value;
            let pathForRename = this.getPathFromPathAndName(oldPath);
            if (oldName != nameFromNode) {
                let newPath = `${pathForRename}/${nameFromNode}`;
                this.ussSrv.renameFile(oldPath, newPath).subscribe({
                    next: (res) => {
                        this.snackBar.open("Renamed '" + oldName + "' to '" + nameFromNode + "'", 'Dismiss', quickSnackbarOptions);
                        // this.updateUss(this.path); - We don't need to update the whole tree for 1 changed node (rename should be O(1) operation), 
                        // but if problems come up uncomment this
                        this.ussRenameEvent.emit(this.rightClickedEvent.node);
                        if (this.showSearch) { // Update saved cache if we're using the search bar
                            let nodeCached = this.findNodeByPath(this.dataCached, file.path)[0];
                            if (nodeCached) {
                                nodeCached.label = nameFromNode;
                                nodeCached.path = newPath;
                                nodeCached.name = nameFromNode;
                            }
                        }
                        file.label = nameFromNode;
                        file.path = newPath;
                        file.name = nameFromNode;
                        return;
                    },
                    error: (error) => {
                        if (error.status == '403') { //Internal Server Error
                            this.snackBar.open("Failed to rename '" + file.path + "'. Bad permissions.", 'Dismiss', defaultSnackbarOptions);
                        }
                        else if (error.status == '404') { //Not Found
                            this.snackBar.open("'" + file.path + "' could not be opened or does not exist.", 'Dismiss', defaultSnackbarOptions);
                        }
                        else { //Unknown
                            this.snackBar.open("Failed to rename '" + file.path + "'. Error: " + error._body, 'Dismiss', longSnackbarOptions);
                        }
                        this.log.severe(error);
                        return;
                    }
                });
            }
        };
        var renameField = document.createElement("input");
        renameField.setAttribute('id', 'renameHighlightedField');
        renameField.value = oldName;
        renameField.style.width = selectedNode.style.width;
        renameField.style.height = selectedNode.style.height;
        let rnNode = (e) => {
            if (e.which == 13 || e.key == "Enter" || e.keyCode == 13) {
                e.stopImmediatePropagation();
                e.stopPropagation();
                e.preventDefault();
                e.cancelBubble = true;
                renameField.blur();
                return;
            }
        };
        renameField.addEventListener('keydown', rnNode);
        renameField.onblur = function (e) {
            renameFn(selectedNode);
        };
        selectedNode.parentNode.replaceChild(renameField, selectedNode);
        renameField.focus();
        renameField.select();
    }
    showPermissionsDialog(rightClickedFile) {
        const filePropConfig = new MatDialogConfig();
        filePropConfig.data = {
            event: rightClickedFile
        };
        filePropConfig.width = '400px';
        const dialogRef = this.dialog.open(FilePermissionsModal, filePropConfig);
        dialogRef.afterClosed().subscribe((res) => {
            if (res) {
                this.addChild(rightClickedFile, true);
            }
        });
    }
    showOwnerDialog(rightClickedFile) {
        const filePropConfig = new MatDialogConfig();
        filePropConfig.data = {
            event: rightClickedFile
        };
        filePropConfig.maxWidth = '400px';
        const dialogRef = this.dialog.open(FileOwnershipModal, filePropConfig);
        dialogRef.afterClosed().subscribe((res) => {
            if (res) {
                this.addChild(rightClickedFile, true);
            }
        });
    }
    showDeleteDialog(rightClickedFile) {
        if (this.checkIfInDeletionQueueAndMessage(rightClickedFile.path, "This is already being deleted.") == true) {
            return;
        }
        const fileDeleteConfig = new MatDialogConfig();
        fileDeleteConfig.data = {
            event: rightClickedFile,
            width: '600px'
        };
        let fileDeleteRef = this.dialog.open(DeleteFileModal, fileDeleteConfig);
        const deleteFileOrFolder = fileDeleteRef.componentInstance.onDelete.subscribe(() => {
            this.deleteFileOrFolder(rightClickedFile);
        });
    }
    attemptDownload(rightClickedFile) {
        let remotePath = rightClickedFile.path;
        let filename = rightClickedFile.name;
        let downloadObject = rightClickedFile;
        let url = ZoweZLUX.uriBroker.unixFileUri('contents', remotePath);
        this.downloadService.fetchFileHandler(url, filename, downloadObject).then((res) => {
            // TODO: Download queue code for progress bar could go here
        });
    }
    showCreateFolderDialog(rightClickedFile) {
        if (rightClickedFile.path) { // If this came from a node object
            if (this.checkIfInDeletionQueueAndMessage(rightClickedFile.path, "Cannot create a directory inside a directory queued for deletion.") == true) {
                return;
            }
        }
        else { // Or if this is just a path
            if (this.checkIfInDeletionQueueAndMessage(rightClickedFile, "Cannot create a directory inside a directory queued for deletion.") == true) {
                return;
            }
        }
        const folderCreateConfig = new MatDialogConfig();
        folderCreateConfig.data = {
            event: rightClickedFile,
            width: '600px'
        };
        let fileCreateRef = this.dialog.open(CreateFolderModal, folderCreateConfig);
        const createFolder = fileCreateRef.componentInstance.onCreate.subscribe(onCreateResponse => {
            /* pathAndName - Path and name obtained from create folder prompt
            updateExistingTree - Should the existing tree update or fetch a new one */
            this.createFolder(onCreateResponse.get("pathAndName"), rightClickedFile, onCreateResponse.get("updateExistingTree"));
            // emit the event with node info only when node is right clicked and not on file tree panel
            this.newFolderClick.emit(this.rightClickedEvent.node ? this.rightClickedEvent.node : '');
        });
    }
    showCreateFileDialog(rightClickedFile) {
        if (rightClickedFile.path) { // If this came from a node object
            if (this.checkIfInDeletionQueueAndMessage(rightClickedFile.path, "Cannot create a file inside a directory queued for deletion.") == true) {
                return;
            }
        }
        else { // Or if this is just a path
            if (this.checkIfInDeletionQueueAndMessage(rightClickedFile, "Cannot create a file inside a directory queued for deletion.") == true) {
                return;
            }
        }
        const fileCreateConfig = new MatDialogConfig();
        fileCreateConfig.data = {
            event: rightClickedFile,
            width: '600px'
        };
        let fileCreateRef = this.dialog.open(CreateFileModal, fileCreateConfig);
        const createFile = fileCreateRef.componentInstance.onFileCreate.subscribe(onFileCreateResponse => {
            /* pathAndName - Path and name obtained from create folder prompt
            updateExistingTree - Should the existing tree update or fetch a new one */
            this.createFile(onFileCreateResponse.get("pathAndName"), rightClickedFile, onFileCreateResponse.get("updateExistingTree"));
            // emit the event with node info only when node is right clicked and not on file tree panel
            this.newFileClick.emit(this.rightClickedEvent.node ? this.rightClickedEvent.node : '');
        });
    }
    showUploadDialog(rightClickedFile) {
        const folderUploadConfig = new MatDialogConfig();
        folderUploadConfig.data = {
            event: rightClickedFile || this.path,
            width: '600px'
        };
        let fileUploadRef = this.dialog.open(UploadModal, folderUploadConfig);
        const upload = fileUploadRef.componentInstance.onUpload.subscribe(onUploadResponse => {
            if (rightClickedFile && rightClickedFile.path && rightClickedFile.path != this.path) {
                this.addChild(rightClickedFile, true);
                this.fileUploaded.emit(this.rightClickedEvent.node.path);
            }
            else {
                this.displayTree(this.path, false);
                this.fileUploaded.emit(this.path);
            }
        });
    }
    copyLink(rightClickedFile) {
        let link = '';
        if (rightClickedFile.directory) {
            link = `${window.location.origin}${window.location.pathname}?pluginId=${this.pluginDefinition.getBasePlugin().getIdentifier()}:data:${encodeURIComponent(`{"type":"openDir","name":"${rightClickedFile.path}","toggleTree":false}`)}`;
        }
        else {
            link = `${window.location.origin}${window.location.pathname}?pluginId=${this.pluginDefinition.getBasePlugin().getIdentifier()}:data:${encodeURIComponent(`{"type":"openFile","name":"${rightClickedFile.path}","toggleTree":true}`)}`;
        }
        navigator.clipboard.writeText(link).then(() => {
            this.log.debug("Link copied to clipboard");
            this.snackBar.open("Copied link successfully", 'Dismiss', quickSnackbarOptions);
        }).catch(() => {
            console.error("Failed to copy Link to clipboard");
        });
    }
    copyPath(rightClickedFile) {
        navigator.clipboard.writeText(rightClickedFile.path).then(() => {
            this.log.debug("Path copied to clipboard");
        }).catch(() => {
            console.error("Failed to copy path to clipboard");
        });
    }
    showTaggingDialog(rightClickedFile) {
        const config = new MatDialogConfig();
        config.data = {
            node: rightClickedFile
        };
        config.maxWidth = '450px';
        const dialogRef = this.dialog.open(FileTaggingModal, config);
        dialogRef.afterClosed().subscribe((res) => {
            if (res) {
                this.addChild(rightClickedFile, true);
            }
        });
    }
    toggleSearch() {
        this.showSearch = !this.showSearch;
        if (this.showSearch) {
            this.focusSearchInput();
            this.dataCached = _.cloneDeep(this.data); // We want a deep clone so we can modify this.data w/o changing this.dataCached
            if (this.searchCtrl.value) {
                this.searchInputChanged(this.searchCtrl.value);
            }
        }
        else {
            if (this.dataCached) {
                this.data = this.dataCached; // We don't care about deep clone because we just want to get dataCached back
            }
        }
    }
    // TODO: There's an app2app opportunity here, where an app using the File Tree could spawn with a pre-filtered list of nodes
    focusSearchInput(attemptCount) {
        if (this.searchUSS) {
            this.searchUSS.nativeElement.focus();
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
    // onNewFileClick($event: any): void {
    //   this.newFileClick.emit($event);
    // }
    onNodeClick($event) {
        this.path = this.path.replace(/\/$/, '');
        this.selectedNode = $event.node;
        if ($event.node.data === 'Folder') {
            if (this.checkIfInDeletionQueueAndMessage($event.node.path, "Cannot open a directory queued for deletion.") == true) {
                return;
            }
            this.addChild($event.node);
            this.nodeClick.emit($event.node);
        }
        else {
            if (this.checkIfInDeletionQueueAndMessage($event.node.path, "Cannot open a file queued for deletion.") == true) {
                return;
            }
            this.nodeClick.emit($event.node);
        }
    }
    onNodeDblClick($event) {
        let updateTree = false; // A double click drills into a folder, so we make a fresh query instead of update
        this.displayTree($event.node.path, updateTree);
        this.nodeDblClick.emit($event.node);
        this.selectedNode = $event.node;
    }
    onNodeRightClick($event) {
        let node = $event.node;
        let rightClickProperties;
        if (node.directory) {
            rightClickProperties = this.rightClickPropertiesFolder;
            this.selectedNode = node;
        }
        else {
            rightClickProperties = this.rightClickPropertiesFile;
            this.selectedNode = node.parent;
        }
        if (this.windowActions) {
            let didContextMenuSpawn = this.windowActions.spawnContextMenu($event.originalEvent.clientX, $event.originalEvent.clientY, rightClickProperties, true);
            // TODO: Fix Zowe's context menu such that if it doesn't have enough space to spawn, it moves itself accordingly to spawn.
            if (!didContextMenuSpawn) { // If context menu failed to spawn...
                let heightAdjustment = $event.originalEvent.clientY - 25; // Bump it up 25px
                didContextMenuSpawn = this.windowActions.spawnContextMenu($event.originalEvent.clientX, heightAdjustment, rightClickProperties, true);
            }
        }
        this.rightClickedFile = node;
        this.rightClickedEvent = $event;
        this.rightClick.emit($event.node);
        $event.originalEvent.preventDefault();
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
        this.rightClickedEvent = $event;
    }
    onPathChanged($event) {
        this.pathChanged.emit($event);
    }
    onDataChanged($event) {
        this.dataChanged.emit($event);
    }
    sortFn(a, b) {
        if (a.directory !== b.directory) {
            if (a.directory === true) {
                return -1;
            }
            else {
                return 1;
            }
        }
        else {
            if (a.name.toLowerCase() < b.name.toLowerCase()) {
                return -1;
            }
            else {
                return 1;
            }
        }
    }
    collapseTree() {
        let dataArray = this.data;
        this.selectedNode = null;
        for (let i = 0; i < dataArray.length; i++) {
            if (this.data[i].expanded == true) {
                this.data[i].expanded = false;
            }
        }
        this.treeComponent.unselectNode();
    }
    //Displays the starting file structure of 'path'. When update == true, tree will be updated
    //instead of reset to 'path' (meaning currently opened children don't get wiped/closed)
    displayTree(path, update) {
        //To reduce unintentional bugs by defaulting to root directory or dropping if caller sent an object we're not supposed to be using
        if (path === undefined || path === '') {
            path = this.root;
        }
        else if (typeof path !== 'string') {
            this.log.warn("The FT received a path object that wasn't a string so it couldn't continue, object=", path);
            return;
        }
        this.selectedNode = null;
        this.isLoading = true;
        let ussData = this.ussSrv.getFileContents(path);
        ussData.subscribe({
            next: (files) => {
                this.isLoading = false;
                if (!files || !files?.entries) { // Reduces console errors and other bugs by accidentally providing a USS file as USS path
                    return;
                }
                files.entries.sort(this.sortFn);
                this.onDataChanged(files.entries);
                const tempChildren = [];
                for (let i = 0; i < files.entries.length; i++) {
                    if (files.entries[i].directory) {
                        files.entries[i].children = [];
                        files.entries[i].data = "Folder";
                        files.entries[i].collapsedIcon = "fa fa-folder";
                        files.entries[i].expandedIcon = "fa fa-folder-open";
                    }
                    else {
                        files.entries[i].items = {};
                        files.entries[i].icon = "fa fa-file";
                        files.entries[i].data = "File";
                    }
                    files.entries[i].label = files.entries[i].name;
                    files.entries[i].id = i;
                    tempChildren.push(files.entries[i]);
                }
                this.isLoading = false;
                if (update == true) { //Tree is displayed to update existing opened nodes, while maintaining currently opened trees 
                    let indexArray;
                    let dataArray; //represents the working FileTreeNode[] that will eventually be added to tempChildren and make up the tree
                    let networkArray; //represents the FileTreeNode[] obtained from the uss server, will iteratively replace dataArray as need be
                    let parentNode;
                    indexArray = [0];
                    dataArray = this.data;
                    networkArray = tempChildren;
                    while (indexArray[indexArray.length - 1] <= dataArray.length) {
                        //Go back up a layer
                        if (indexArray[indexArray.length - 1] == dataArray.length) {
                            indexArray.pop();
                            if (parentNode !== undefined && parentNode.parent !== undefined) {
                                parentNode = parentNode.parent;
                                dataArray = parentNode.children;
                                networkArray = dataArray;
                            }
                            else {
                                if (parentNode !== undefined) {
                                    for (let i = 0; i < tempChildren.length; i++) {
                                        if (parentNode.label == tempChildren[i].label || parentNode.children == tempChildren[i].children) {
                                            tempChildren[i] = parentNode;
                                            break;
                                        }
                                    }
                                }
                                dataArray = this.data;
                                networkArray = tempChildren;
                            }
                        }
                        else if (dataArray[indexArray[indexArray.length - 1]] !== undefined && dataArray[indexArray[indexArray.length - 1]].data == 'Folder'
                            && dataArray[indexArray[indexArray.length - 1]].children !== undefined && dataArray[indexArray[indexArray.length - 1]].children.length !== 0) {
                            //... if the children of dataArray with index in last element of indexArray are not empty, drill into them!
                            parentNode = dataArray[indexArray[indexArray.length - 1]];
                            dataArray = parentNode.children;
                            networkArray = dataArray;
                            indexArray[indexArray.length - 1]++;
                            indexArray.push(0);
                        }
                        else {
                            dataArray[indexArray[indexArray.length - 1]] = networkArray[indexArray[indexArray.length - 1]];
                            indexArray[indexArray.length - 1]++; //go up index to check new element in data array
                        }
                    }
                }
                this.log.debug("Tree has been updated.");
                this.log.debug(tempChildren);
                this.data = tempChildren;
                if (this.showSearch) {
                    this.dataCached = this.data; // TODO: Implement logic to update tree of search queried results (so reverting the search filter doesn't fail)
                    if (!update) { // When a fresh tree is requested, it will get rid of this.data search queried results, so hide search bar
                        this.showSearch = false;
                    }
                }
                this.path = path;
                this.onPathChanged(this.path);
                // this.persistentDataService.getData()
                //       .subscribe(data => {
                //         this.dataObject = data.contents;
                //         this.dataObject.ussInput = this.path;
                //         this.dataObject.ussData = this.data;
                //         this.persistentDataService.setData(this.dataObject)
                //           .subscribe((res: any) => { });
                //       })
            },
            error: (error) => {
                this.isLoading = false;
                if (error.status == '403') { //Permission denied
                    this.snackBar.open('Failed to open: Permission denied.', 'Dismiss', defaultSnackbarOptions);
                }
                else if (error.status == '0') {
                    this.snackBar.open("Failed to communicate with the App server: " + error.status, 'Dismiss', defaultSnackbarOptions);
                }
                else if (error.status == '404') {
                    this.snackBar.open("File/folder not found. " + error.status, 'Dismiss', quickSnackbarOptions);
                }
                else {
                    this.snackBar.open("An unknown error occurred: " + error.status, 'Dismiss', defaultSnackbarOptions);
                }
                this.log.severe(error);
            }
        });
        this.refreshHistory(this.path);
    }
    refreshHistory(path) {
        this.ussSearchHistorySubscription = this.ussSearchHistory
            .saveSearchHistory(path)
            .subscribe();
    }
    clearSearchHistory() {
        this.ussSearchHistory.deleteSearchHistory().subscribe();
        this.ussSearchHistory.onInit(SEARCH_ID);
    }
    //Adds children to the existing node to update this.data array, 
    //fetch - fetches new data, expand - expands or not folder node after fetching new data
    addChild(node, fetch, expand) {
        let path = node.path;
        if (node.children && node.children.length > 0 && !fetch) {
            //If an opened node has children, and the user clicked on it...
            if (node.expanded) {
                node.expanded = false;
            }
            //If a closed node has children, and the user clicked on it...
            else {
                node.expanded = true;
            }
            if (this.showSearch) { // Update node in cached data as well
                let nodeCached = this.findNodeByPath(this.dataCached, path)[0];
                if (nodeCached) {
                    nodeCached.expanded = node.expanded;
                }
            }
        }
        else //When the selected node has no children or we want to fetch new data
         {
            this.refreshFileMetadata(node);
            node.expanded = expand !== undefined ? expand : true;
            let ussData = this.ussSrv.getFileContents(path);
            let tempChildren = [];
            ussData.subscribe(files => {
                files.entries.sort(this.sortFn);
                //TODO: Could be turned into a util service...
                for (let i = 0; i < files.entries.length; i++) {
                    if (files.entries[i].directory) {
                        files.entries[i].children = [];
                        files.entries[i].data = "Folder";
                        files.entries[i].collapsedIcon = "fa fa-folder";
                        files.entries[i].expandedIcon = "fa fa-folder-open";
                    }
                    else {
                        files.entries[i].items = {};
                        files.entries[i].icon = "fa fa-file";
                        files.entries[i].data = "File";
                    }
                    files.entries[i].label = files.entries[i].name;
                    files.entries[i].id = i;
                    tempChildren.push(files.entries[i]);
                }
                node.children = tempChildren;
                node.expandedIcon = "fa fa-folder-open";
                node.collapsedIcon = "fa fa-folder";
                this.log.debug(path + " was populated with " + tempChildren.length + " children.");
                while (node.parent !== undefined) {
                    let newChild = node.parent;
                    newChild.children[node.id] = node;
                    newChild.expanded = true;
                    newChild.expandedIcon = "fa fa-folder-open";
                    newChild.collapsedIcon = "fa fa-folder";
                    node = newChild;
                }
                let index = -1;
                for (let i = 0; i < this.data.length; i++) {
                    if (this.data[i].label == node.label) {
                        index = i;
                        break;
                    }
                }
                if (index != -1) {
                    this.data[index] = node;
                    if (this.showSearch) { // If we update a node in the working directory, we need to find that same node in the cached data
                        index = -1; // which may be in a different index due to filtering by search query
                        for (let i = 0; i < this.dataCached.length; i++) { // We could use this.findNodeByPath, but we need search only parent level
                            if (this.dataCached[i].label == node.label) {
                                index = i;
                                break;
                            }
                        }
                        if (index != -1) {
                            this.dataCached[index] = node;
                        }
                        else {
                            this.log.debug("Though node added in working directory, failed to find index in cached data");
                        }
                    }
                    // this.persistentDataService.getData()
                    //   .subscribe(data => {
                    //     this.dataObject = data.contents;
                    //     this.dataObject.ussInput = this.path;
                    //     this.dataObject.ussData = this.data;
                    //     this.persistentDataService.setData(this.dataObject)
                    //       .subscribe((res: any) => { });
                    //   })
                }
                else
                    this.log.debug("failed to find index");
            });
        }
    }
    refreshFileMetadata(node) {
        let path = node.path;
        let someData = this.ussSrv.getFileMetadata(path);
        someData.subscribe({
            next: (result) => {
                if (result.directory) {
                    node.data = "Folder";
                    node.collapsedIcon = "fa fa-folder";
                    node.expandedIcon = "fa fa-folder-open";
                }
                else {
                    node.items = {};
                    node.icon = "fa fa-file";
                    node.data = "File";
                }
                node.directory = result.directory;
                node.mode = result.mode;
                node.owner = result.owner;
                node.group = result.group;
                node.size = result.size;
                node.ccsid = result.ccsid;
                node.createdAt = result.createdAt;
                return node;
            },
            error: e => {
                if (e.status == 404) {
                    this.snackBar.open("Failed to refresh '" + node.name + "' No longer exists or has been renamed.", 'Dismiss', defaultSnackbarOptions);
                    this.removeChild(node);
                }
                else if (e.status == 403) {
                    this.snackBar.open("Failed to refresh '" + node.name + "' Permission denied.", 'Dismiss', defaultSnackbarOptions);
                }
                else if (e.status == 500) {
                    this.snackBar.open("Failed to refresh '" + node.name + "' Server returned with: " + e._body, 'Dismiss', longSnackbarOptions);
                }
                return node;
            }
        });
    }
    refreshFileMetadatdaUsingPath(path) {
        let foundNode = this.findNodeByPath(this.data, path)[0];
        if (foundNode) {
            this.refreshFileMetadata(foundNode);
        }
    }
    searchInputChanged(input) {
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
                }
                else if (data[i].data = "Folder") { // If some children didn't get filtered out (aka we got some matches) and we have a folder
                    // then we want to expand the node so the user can see their results in the search bar
                    data[i].expanded = true;
                }
            }
        }
    }
    // TODO: Could be optimized to do breadth first search vs depth first search
    findNodeByPath(data, path) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].path == path) {
                return [data[i], i]; // 0 - node, 1 - index
            }
            if (data[i].children && data[i].children.length > 0) {
                let foundValue;
                foundValue = this.findNodeByPath(data[i].children, path);
                // if match not found in the childern nodes then contine with pending Top level nodes
                if (foundValue[0] == null && i != data.length - 1) {
                    continue;
                }
                else {
                    return foundValue;
                }
            }
        }
        return [null, null];
    }
    updateUss(path) {
        this.displayTree(path, true);
    }
    createFile(pathAndName, node, update) {
        this.ussSrv.makeFile(pathAndName).subscribe({
            next: (res) => {
                this.log.debug('Created: ' + pathAndName);
                let path = this.getPathFromPathAndName(pathAndName);
                let someData = this.ussSrv.getFileMetadata(pathAndName);
                this.snackBar.open(`Successfully created file: "${pathAndName.substring(pathAndName.lastIndexOf('/') + 1)}"`, 'Dismiss', defaultSnackbarOptions);
                someData.subscribe({
                    next: result => {
                        // If the right-clicked 'node' is the correct, valid node
                        if (node.children && node.path == path) {
                            let nodeToAdd = {
                                id: node.children.length,
                                label: this.getNameFromPathAndName(pathAndName),
                                mode: result.mode,
                                owner: result.owner,
                                group: result.group,
                                createdAt: result.createdAt,
                                data: "File",
                                directory: false,
                                icon: "fa fa-file",
                                items: {},
                                name: this.getNameFromPathAndName(pathAndName),
                                parent: node,
                                path: pathAndName,
                                size: result.size
                            };
                            node.children.push(nodeToAdd); //Add node to right clicked node
                            if (this.showSearch) { // If we update a node in the working directory, we need to find that same node in the cached data
                                let nodeCached = this.findNodeByPath(this.dataCached, node.path)[0];
                                if (nodeCached) {
                                    nodeCached.children.push(nodeToAdd);
                                }
                            }
                            node.expanded = true;
                        }
                        // ..otherwise treat folder creation without any context.
                        else {
                            if (path == this.path) { // If we are creating a folder at the parent level
                                this.displayTree(path, true);
                            }
                            else if (update) { // If we want to update the tree
                                this.addChild(node);
                            }
                            else { // If we are creating a new folder in a location we're not looking at
                                this.displayTree(path, false); // ...plop the Explorer into the newly created location.
                            }
                        }
                    }
                });
            },
            error: error => {
                this.ussSrv.getFileMetadata(pathAndName).subscribe({
                    next: response => {
                        this.snackBar.open("Failed to create File. '" + pathAndName + "' already exists", 'Dismiss', defaultSnackbarOptions);
                    },
                    error: err => {
                        this.snackBar.open("Failed to create File: '" + pathAndName + "'", 'Dismiss', defaultSnackbarOptions);
                        this.log.severe(error);
                    }
                });
            }
        });
    }
    createFolder(pathAndName, node, update) {
        this.ussSrv.makeDirectory(pathAndName)
            .subscribe({
            next: resp => {
                this.log.debug('Created: ' + pathAndName);
                let path = this.getPathFromPathAndName(pathAndName);
                let someData = this.ussSrv.getFileMetadata(pathAndName);
                someData.subscribe({
                    next: result => {
                        // If the right-clicked 'node' is the correct, valid node
                        if (node.children && node.path == path) {
                            let nodeToAdd = {
                                id: node.children.length,
                                children: [],
                                label: this.getNameFromPathAndName(pathAndName),
                                mode: result.mode,
                                owner: result.owner,
                                group: result.group,
                                createdAt: result.createdAt,
                                data: "Folder",
                                directory: true,
                                expandedIcon: "fa fa-folder-open",
                                collapsedIcon: "fa fa-folder",
                                name: this.getNameFromPathAndName(pathAndName),
                                parent: node,
                                path: pathAndName,
                                size: result.size
                            };
                            node.children.push(nodeToAdd); //Add node to right clicked node
                            if (this.showSearch) { // If we update a node in the working directory, we need to find that same node in the cached data
                                let nodeCached = this.findNodeByPath(this.dataCached, node.path)[0];
                                if (nodeCached) {
                                    nodeCached.children.push(nodeToAdd);
                                }
                            }
                            node.expanded = true;
                        }
                        // ..otherwise treat folder creation without any context.
                        else {
                            if (path == this.path) { // If we are creating a folder at the parent level
                                this.displayTree(path, true);
                            }
                            else if (update) { // If we want to update the tree
                                this.addChild(node);
                            }
                            else { // If we are creating a new folder in a location we're not looking at
                                this.displayTree(pathAndName, false); // ...plop the Explorer into the newly created location.
                            }
                        }
                    }
                });
            },
            error: error => {
                if (error.status == '500') { //Internal Server Error
                    this.snackBar.open("Failed to create directory: '" + pathAndName + "' This is probably due to a server agent problem.", 'Dismiss', defaultSnackbarOptions);
                }
                this.log.severe(error);
            }
        });
    }
    deleteFileOrFolder(rightClickedFile) {
        let pathAndName = rightClickedFile.path;
        let name = this.getNameFromPathAndName(pathAndName);
        this.isLoading = true;
        this.deletionQueue.set(rightClickedFile.path, rightClickedFile);
        rightClickedFile.styleClass = "filebrowseruss-node-deleting";
        let deleteSubscription = this.ussSrv.deleteFileOrFolder(pathAndName)
            .subscribe({
            next: resp => {
                this.isLoading = false;
                this.snackBar.open("Deleted '" + name + "'", 'Dismiss', quickSnackbarOptions);
                this.removeChild(rightClickedFile);
                this.deletionQueue.delete(rightClickedFile.path);
                rightClickedFile.styleClass = "";
                this.deleteClick.emit(this.rightClickedEvent.node);
            },
            error: error => {
                if (error.status == '500') { //Internal Server Error
                    this.snackBar.open("Failed to delete '" + pathAndName + "' Server returned with: " + error._body, 'Dismiss', longSnackbarOptions);
                }
                else if (error.status == '404') { //Not Found
                    this.snackBar.open("Failed to delete '" + pathAndName + "'. Already been deleted or does not exist.", 'Dismiss', defaultSnackbarOptions);
                    this.removeChild(rightClickedFile);
                }
                else if (error.status == '400' || error.status == '403') { //Bad Request
                    this.snackBar.open("Failed to delete '" + pathAndName + "' This is probably due to a permission problem.", 'Dismiss', defaultSnackbarOptions);
                }
                else { //Unknown
                    this.snackBar.open("Unknown error '" + error.status + "' occurred for '" + pathAndName + "' Server returned with: " + error._body, 'Dismiss', longSnackbarOptions);
                    //Error info gets printed in uss.crud.service.ts
                }
                this.deletionQueue.delete(rightClickedFile.path);
                this.isLoading = false;
                rightClickedFile.styleClass = "";
                this.log.severe(error);
            }
        });
        setTimeout(() => {
            if (deleteSubscription.closed == false) {
                this.snackBar.open("Deleting '" + pathAndName + "'... Larger payloads may take longer. Please be patient.", 'Dismiss', quickSnackbarOptions);
            }
        }, 4000);
    }
    removeChild(node) {
        let parent;
        let children;
        if (node.parent) { // If the selected node has a parent,
            parent = node.parent;
            children = parent.children; // ...just use the top-most children
        }
        else { // The selected node *is* the top-most node,
            children = this.data; // ...just use the UI nodes as our children
        }
        let nodeData = this.findNodeByPath(children, node.path);
        if (nodeData) { // If we catch the node we wanted to remove,
            let nodeObj = nodeData[0];
            let nodeIndex = nodeData[1];
            children.splice(nodeIndex, 1); // ...remove it
            if (node.parent && node.parent.children) { // Update the children to no longer include removed node
                node.parent.children = children;
            }
            else {
                this.data = children;
            }
        }
        if (this.showSearch) { // If we update a node in the working directory, we need to find that same node in the cached data
            let nodeDataCached = this.findNodeByPath(this.dataCached, node.path);
            if (nodeDataCached) {
                let nodeCached = nodeDataCached[0];
                let indexCached = nodeDataCached[1];
                if (nodeCached.parent) {
                    if (indexCached != -1) {
                        nodeCached.parent.children.splice(indexCached, 1);
                    }
                }
            }
        }
    }
    sendNotification(title, message) {
        let pluginId = this.pluginDefinition.getBasePlugin().getIdentifier();
        // We can specify a different styleClass to theme the notification UI i.e. [...] message, 1, pluginId, "org_zowe_zlux_editor_snackbar"
        let notification = ZoweZLUX.notificationManager.createNotification(title, message, 1, pluginId);
        return ZoweZLUX.notificationManager.notify(notification);
    }
    levelUp() {
        //TODO: may want to change this to 'root' depending on mainframe file access security
        //to prevent people from accessing files/folders outside their root dir
        if (this.path !== "/" && this.path !== '') {
            this.path = this.getPathFromPathAndName(this.path);
            if (this.path === '' || this.path == '/') {
                this.path = '/';
            }
            let parentindex = this.path.length - 1;
            while (this.path.charAt(parentindex) != '/') {
                parentindex--;
            }
            let parent = this.path.slice(parentindex + 1, this.path.length);
            this.log.debug("Going up to: " + parent);
            this.displayTree(this.path, false);
        }
        else {
            this.updateUss(this.path);
        }
    }
    getPathFromPathAndName(pathAndName) {
        let path = pathAndName.replace(/\/$/, '').replace(/\/[^\/]+$/, '');
        return path;
    }
    getNameFromPathAndName(pathAndName) {
        let name = pathAndName.replace(/(^.*)(\/.*\/)/, '');
        return name;
    }
    checkPath(input) {
        return this.utils.filePathEndCheck(this.path) + input;
    }
    checkPathSlash(event) {
        if (this.path == "") {
            this.path = "/";
            this.pathInputUSS.nativeElement.value = "/";
        }
    }
    checkIfInDeletionQueueAndMessage(pathAndName, message) {
        if (this.deletionQueue.has(pathAndName)) {
            this.snackBar.open("Deletion in progress: '" + pathAndName + "' " + message, 'Dismiss', defaultSnackbarOptions);
            return true;
        }
        return false;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FileBrowserUSSComponent, deps: [{ token: i0.ElementRef }, { token: i1.UssCrudService }, { token: i2.UtilsService }, { token: i3.SearchHistoryService }, { token: i4.MatDialog }, { token: i5.MatSnackBar }, { token: i6.DownloaderService }, { token: Angular2InjectionTokens.LOGGER }, { token: Angular2InjectionTokens.LAUNCH_METADATA }, { token: Angular2InjectionTokens.PLUGIN_DEFINITION }, { token: Angular2InjectionTokens.WINDOW_ACTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: FileBrowserUSSComponent, selector: "file-browser-uss", inputs: { inputStyle: "inputStyle", searchStyle: "searchStyle", treeStyle: "treeStyle", showUpArrow: "showUpArrow" }, outputs: { pathChanged: "pathChanged", dataChanged: "dataChanged", nodeClick: "nodeClick", nodeDblClick: "nodeDblClick", nodeRightClick: "nodeRightClick", newFolderClick: "newFolderClick", newFileClick: "newFileClick", fileUploaded: "fileUploaded", copyClick: "copyClick", deleteClick: "deleteClick", ussRenameEvent: "ussRenameEvent", rightClick: "rightClick", openInNewTab: "openInNewTab" }, providers: [UssCrudService, /*PersistentDataService,*/ SearchHistoryService], viewQueries: [{ propertyName: "treeComponent", first: true, predicate: TreeComponent, descendants: true }, { propertyName: "pathInputUSS", first: true, predicate: ["pathInputUSS"], descendants: true }, { propertyName: "searchUSS", first: true, predicate: ["searchUSS"], descendants: true }], ngImport: i0, template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n\n<div style=\"height: 100%;\">\n\n  <!-- Tabs, searchbar, and loading indicator -->\n  @if (showUpArrow) {\n  <img data-toggle=\"tooltip\" class=\"filebrowseruss-pointer-logo\" title=\"Go up to the parent level\" (click)=\"levelUp()\"\n    [ngStyle]=\"treeStyle\" tabindex=\"0\" (keydown.enter)=\"levelUp()\">\n  }\n\n  <div class=\"filebrowseruss-search\" [ngStyle]=\"searchStyle\">\n    <input #pathInputUSS [(ngModel)]=\"path\" list=\"searchUSSHistory\" placeholder=\"Enter an absolute path...\"\n      [ngStyle]=\"inputStyle\" class=\"filebrowseruss-search-input\" (keydown.enter)=\"displayTree(path, false);\"\n      [disabled]=\"isLoading\" (ngModelChange)=\"checkPathSlash($event)\">\n    <!-- TODO: make search history a directive to use in both uss and mvs-->\n    <datalist id=\"searchUSSHistory\">\n      @for (item of ussSearchHistory.searchHistoryVal; track item) {\n      <option [value]=\"item\"></option>\n      }\n    </datalist>\n  </div>\n  <div class=\"fa fa-spinner fa-spin filebrowseruss-loading-icon\" [hidden]=\"!isLoading\" style=\"margin-left: 9px;\"></div>\n  <div class=\"fa fa-refresh filebrowseruss-loading-icon\" title=\"Refresh whole directory\"\n    (click)=\"displayTree(path, false);\" [hidden]=\"isLoading\" style=\"margin-left: 9px; cursor: pointer;\"></div>\n  <div class=\"file-tree-utilities\">\n    <div class=\"fa fa-minus-square-o filebrowser-icon\" title=\"Collapse Folders in Explorer\" (click)=\"collapseTree();\">\n    </div>\n    <div class=\"fa fa-trash-o filebrowser-icon\" title=\"Delete\" (click)=\"showDeleteDialog(selectedNode);\"></div>\n    <div class=\"fa fa-folder-o filebrowser-icon\" title=\"Create New Folder\"\n      (click)=\"showCreateFolderDialog(!selectedNode || (!selectedNode.parent && !selectedNode.directory) ? { 'path' : path } : selectedNode.directory ? selectedNode : selectedNode.parent);\">\n    </div>\n    <div class=\"fa fa-eraser filebrowser-icon special-utility\" title=\"Clear Search History\"\n      (click)=\"clearSearchHistory();\"></div>\n  </div>\n\n  <!-- Main tree -->\n  <div [hidden]=\"hideExplorer\" style=\"height: 100%;\">\n    <tree-root [treeData]=\"data\" (clickEvent)=\"onNodeClick($event)\" (dblClickEvent)=\"onNodeDblClick($event)\"\n      [ngStyle]=\"treeStyle\" (rightClickEvent)=\"onNodeRightClick($event)\"\n      (panelRightClickEvent)=\"onPanelRightClick($event)\" (dataChanged)=\"onDataChanged($event)\"></tree-root>\n  </div>\n\n  @if (showSearch) {\n  <div class=\"ui-inputgroup filebrowseruss-search-bottom-group\">\n    <span class=\"ui-inputgroup-addon\"><i class=\"fa fa-search filebrowseruss-search-bottom-icon\"></i></span>\n    <input type=\"text\" pInputText placeholder=\"Search opened files/folders by name...\"\n      class=\"filebrowseruss-search-bottom-input\" [formControl]=\"searchCtrl\" #searchUSS>\n  </div>\n  }\n\n</div>\n\n<!--\n    This program and the accompanying materials are\n    made available under the terms of the Eclipse Public License v2.0 which accompanies\n    this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n    SPDX-License-Identifier: EPL-2.0\n\n    Copyright Contributors to the Zowe Project.\n    -->", styles: [".filebrowseruss-search{width:fit-content;min-width:250px;margin-left:5px;display:inline-block;height:40px}.filebrowseruss-search-input{width:100%;min-height:30px;font-family:sans-serif;font-size:15px;height:35px;background-color:#464646;color:#fff;padding-left:5px;border:0px}.filebrowseruss-search-bottom-group{margin-top:-17px;position:relative}.filebrowseruss-search-bottom-icon{font-size:large;position:absolute;color:#d4d4d4;padding-left:5px}.filebrowseruss-search-bottom-input{padding-left:28px;width:calc(100% - 5px);min-height:30px;font-family:sans-serif;font-size:15px;height:35px;background-color:#313030;color:#fff;border:0px;margin-top:-10px}.filebrowseruss-search-bottom-input:focus{outline:none;border:1px solid rgb(161,160,160);border-radius:3px}.filebrowseruss-dialog-menu{background:#fff;padding:0;height:auto;width:auto}.filebrowseruss-pointer-logo{content:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsSAAALEgHS3X78AAAA2UlEQVQ4y7XRwUkEQRSE4c9xDcAEFCYFYzCFCaGDavQgeDOEWTQBA1AQ9KCgpxUEQVh3vLyBgdnuw4APGprqqp96NP85KaU2pdTWPE0tjB73NUhTCd+ixTHuSpCmEO5xil2cE/T7IE0h3OIBWwx4Cm0GaQrhNS5xEIDr0GaQaYNx3zU6fAegiXs3gZzNADnnMdjlnDch76LBEFqH85zzzZhbTfcJyL4VD+N9Ey3q3xjzO/FsS6ZVBTDECpYCPvATDd6XAF7xEp63JYBnXOAIj0sAn7iK+1fJ9AcOn0qIhbHEXwAAAABJRU5ErkJggg==);width:20px;height:20px;filter:brightness(3);cursor:pointer}.filebrowseruss-node-deleting{opacity:.5}.filebrowseruss-loading-icon{margin-left:8px!important;font-size:large!important}.file-tree-utilities{overflow:hidden;border:1px solid #464646}.filebrowser-icon{margin-right:9px;float:right;cursor:pointer}.special-utility{margin-left:9px}\n"], dependencies: [{ kind: "directive", type: i7.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "directive", type: i8.NgSelectOption, selector: "option", inputs: ["ngValue", "value"] }, { kind: "directive", type: i8.ɵNgSelectMultipleOption, selector: "option", inputs: ["ngValue", "value"] }, { kind: "directive", type: i8.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i8.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i8.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i9.InputText, selector: "[pInputText]", inputs: ["variant"] }, { kind: "directive", type: i8.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }, { kind: "component", type: i10.TreeComponent, selector: "tree-root", inputs: ["treeData", "treeId", "style", "treeStyle"], outputs: ["clickEvent", "dblClickEvent", "rightClickEvent", "panelRightClickEvent"] }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FileBrowserUSSComponent, decorators: [{
            type: Component,
            args: [{ selector: 'file-browser-uss', encapsulation: ViewEncapsulation.None, providers: [UssCrudService, /*PersistentDataService,*/ SearchHistoryService], template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n\n<div style=\"height: 100%;\">\n\n  <!-- Tabs, searchbar, and loading indicator -->\n  @if (showUpArrow) {\n  <img data-toggle=\"tooltip\" class=\"filebrowseruss-pointer-logo\" title=\"Go up to the parent level\" (click)=\"levelUp()\"\n    [ngStyle]=\"treeStyle\" tabindex=\"0\" (keydown.enter)=\"levelUp()\">\n  }\n\n  <div class=\"filebrowseruss-search\" [ngStyle]=\"searchStyle\">\n    <input #pathInputUSS [(ngModel)]=\"path\" list=\"searchUSSHistory\" placeholder=\"Enter an absolute path...\"\n      [ngStyle]=\"inputStyle\" class=\"filebrowseruss-search-input\" (keydown.enter)=\"displayTree(path, false);\"\n      [disabled]=\"isLoading\" (ngModelChange)=\"checkPathSlash($event)\">\n    <!-- TODO: make search history a directive to use in both uss and mvs-->\n    <datalist id=\"searchUSSHistory\">\n      @for (item of ussSearchHistory.searchHistoryVal; track item) {\n      <option [value]=\"item\"></option>\n      }\n    </datalist>\n  </div>\n  <div class=\"fa fa-spinner fa-spin filebrowseruss-loading-icon\" [hidden]=\"!isLoading\" style=\"margin-left: 9px;\"></div>\n  <div class=\"fa fa-refresh filebrowseruss-loading-icon\" title=\"Refresh whole directory\"\n    (click)=\"displayTree(path, false);\" [hidden]=\"isLoading\" style=\"margin-left: 9px; cursor: pointer;\"></div>\n  <div class=\"file-tree-utilities\">\n    <div class=\"fa fa-minus-square-o filebrowser-icon\" title=\"Collapse Folders in Explorer\" (click)=\"collapseTree();\">\n    </div>\n    <div class=\"fa fa-trash-o filebrowser-icon\" title=\"Delete\" (click)=\"showDeleteDialog(selectedNode);\"></div>\n    <div class=\"fa fa-folder-o filebrowser-icon\" title=\"Create New Folder\"\n      (click)=\"showCreateFolderDialog(!selectedNode || (!selectedNode.parent && !selectedNode.directory) ? { 'path' : path } : selectedNode.directory ? selectedNode : selectedNode.parent);\">\n    </div>\n    <div class=\"fa fa-eraser filebrowser-icon special-utility\" title=\"Clear Search History\"\n      (click)=\"clearSearchHistory();\"></div>\n  </div>\n\n  <!-- Main tree -->\n  <div [hidden]=\"hideExplorer\" style=\"height: 100%;\">\n    <tree-root [treeData]=\"data\" (clickEvent)=\"onNodeClick($event)\" (dblClickEvent)=\"onNodeDblClick($event)\"\n      [ngStyle]=\"treeStyle\" (rightClickEvent)=\"onNodeRightClick($event)\"\n      (panelRightClickEvent)=\"onPanelRightClick($event)\" (dataChanged)=\"onDataChanged($event)\"></tree-root>\n  </div>\n\n  @if (showSearch) {\n  <div class=\"ui-inputgroup filebrowseruss-search-bottom-group\">\n    <span class=\"ui-inputgroup-addon\"><i class=\"fa fa-search filebrowseruss-search-bottom-icon\"></i></span>\n    <input type=\"text\" pInputText placeholder=\"Search opened files/folders by name...\"\n      class=\"filebrowseruss-search-bottom-input\" [formControl]=\"searchCtrl\" #searchUSS>\n  </div>\n  }\n\n</div>\n\n<!--\n    This program and the accompanying materials are\n    made available under the terms of the Eclipse Public License v2.0 which accompanies\n    this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n    SPDX-License-Identifier: EPL-2.0\n\n    Copyright Contributors to the Zowe Project.\n    -->", styles: [".filebrowseruss-search{width:fit-content;min-width:250px;margin-left:5px;display:inline-block;height:40px}.filebrowseruss-search-input{width:100%;min-height:30px;font-family:sans-serif;font-size:15px;height:35px;background-color:#464646;color:#fff;padding-left:5px;border:0px}.filebrowseruss-search-bottom-group{margin-top:-17px;position:relative}.filebrowseruss-search-bottom-icon{font-size:large;position:absolute;color:#d4d4d4;padding-left:5px}.filebrowseruss-search-bottom-input{padding-left:28px;width:calc(100% - 5px);min-height:30px;font-family:sans-serif;font-size:15px;height:35px;background-color:#313030;color:#fff;border:0px;margin-top:-10px}.filebrowseruss-search-bottom-input:focus{outline:none;border:1px solid rgb(161,160,160);border-radius:3px}.filebrowseruss-dialog-menu{background:#fff;padding:0;height:auto;width:auto}.filebrowseruss-pointer-logo{content:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsSAAALEgHS3X78AAAA2UlEQVQ4y7XRwUkEQRSE4c9xDcAEFCYFYzCFCaGDavQgeDOEWTQBA1AQ9KCgpxUEQVh3vLyBgdnuw4APGprqqp96NP85KaU2pdTWPE0tjB73NUhTCd+ixTHuSpCmEO5xil2cE/T7IE0h3OIBWwx4Cm0GaQrhNS5xEIDr0GaQaYNx3zU6fAegiXs3gZzNADnnMdjlnDch76LBEFqH85zzzZhbTfcJyL4VD+N9Ey3q3xjzO/FsS6ZVBTDECpYCPvATDd6XAF7xEp63JYBnXOAIj0sAn7iK+1fJ9AcOn0qIhbHEXwAAAABJRU5ErkJggg==);width:20px;height:20px;filter:brightness(3);cursor:pointer}.filebrowseruss-node-deleting{opacity:.5}.filebrowseruss-loading-icon{margin-left:8px!important;font-size:large!important}.file-tree-utilities{overflow:hidden;border:1px solid #464646}.filebrowser-icon{margin-right:9px;float:right;cursor:pointer}.special-utility{margin-left:9px}\n"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: i1.UssCrudService }, { type: i2.UtilsService }, { type: i3.SearchHistoryService }, { type: i4.MatDialog }, { type: i5.MatSnackBar }, { type: i6.DownloaderService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.LOGGER]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.LAUNCH_METADATA]
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
            }], pathInputUSS: [{
                type: ViewChild,
                args: ['pathInputUSS']
            }], searchUSS: [{
                type: ViewChild,
                args: ['searchUSS']
            }], pathChanged: [{
                type: Output
            }], dataChanged: [{
                type: Output
            }], nodeClick: [{
                type: Output
            }], nodeDblClick: [{
                type: Output
            }], nodeRightClick: [{
                type: Output
            }], newFolderClick: [{
                type: Output
            }], newFileClick: [{
                type: Output
            }], fileUploaded: [{
                type: Output
            }], copyClick: [{
                type: Output
            }], deleteClick: [{
                type: Output
            }], ussRenameEvent: [{
                type: Output
            }], rightClick: [{
                type: Output
            }], openInNewTab: [{
                type: Output
            }], inputStyle: [{
                type: Input
            }], searchStyle: [{
                type: Input
            }], treeStyle: [{
                type: Input
            }], showUpArrow: [{
                type: Input
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZWJyb3dzZXJ1c3MuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemx1eC1maWxlLWV4cGxvcmVyL3NyYy9saWIvY29tcG9uZW50cy9maWxlYnJvd3NlcnVzcy9maWxlYnJvd3NlcnVzcy5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96bHV4LWZpbGUtZXhwbG9yZXIvc3JjL2xpYi9jb21wb25lbnRzL2ZpbGVicm93c2VydXNzL2ZpbGVicm93c2VydXNzLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBOzs7Ozs7OztFQVFFO0FBRUYsT0FBTyxFQUNMLFNBQVMsRUFBYyxZQUFZLEVBQUUsS0FBSyxFQUMxQyxNQUFNLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQ3ZELE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUM1QyxPQUFPLEVBQWMsRUFBRSxFQUFnQixNQUFNLE1BQU0sQ0FBQztBQUNwRCxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ2xGLE9BQU8sRUFBRSx1QkFBdUIsRUFBZ0QsTUFBTSxxQ0FBcUMsQ0FBQztBQUM1SCxPQUFPLEVBQWEsZUFBZSxFQUFnQixNQUFNLDBCQUEwQixDQUFDO0FBRXBGLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBQy9GLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUNuRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzREFBc0QsQ0FBQztBQUN6RixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFDbkYsT0FBTyxF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QkFBQyx1QkFBdUIsQ0FBQyxlQUFlOzswQkFDOUMsTUFBTTsyQkFBQyx1QkFBdUIsQ0FBQyxpQkFBaUI7OzBCQUNoRCxRQUFROzswQkFBSSxNQUFNOzJCQUFDLHVCQUF1QixDQUFDLGNBQWM7eUNBbkIxQixhQUFhO3NCQUE5QyxTQUFTO3VCQUFDLGFBQWE7Z0JBQ1UsWUFBWTtzQkFBN0MsU0FBUzt1QkFBQyxjQUFjO2dCQUNNLFNBQVM7c0JBQXZDLFNBQVM7dUJBQUMsV0FBVztnQkFvQ1osV0FBVztzQkFBcEIsTUFBTTtnQkFDRyxXQUFXO3NCQUFwQixNQUFNO2dCQUNHLFNBQVM7c0JBQWxCLE1BQU07Z0JBQ0csWUFBWTtzQkFBckIsTUFBTTtnQkFDRyxjQUFjO3NCQUF2QixNQUFNO2dCQUVHLGNBQWM7c0JBQXZCLE1BQU07Z0JBQ0csWUFBWTtzQkFBckIsTUFBTTtnQkFDRyxZQUFZO3NCQUFyQixNQUFNO2dCQUNHLFNBQVM7c0JBQWxCLE1BQU07Z0JBQ0csV0FBVztzQkFBcEIsTUFBTTtnQkFDRyxjQUFjO3NCQUF2QixNQUFNO2dCQUNHLFVBQVU7c0JBQW5CLE1BQU07Z0JBQ0csWUFBWTtzQkFBckIsTUFBTTtnQkFHUyxVQUFVO3NCQUF6QixLQUFLO2dCQUNVLFdBQVc7c0JBQTFCLEtBQUs7Z0JBQ1UsU0FBUztzQkFBeEIsS0FBSztnQkFDVSxXQUFXO3NCQUExQixLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiXHJcblxyXG4vKlxyXG4gIFRoaXMgcHJvZ3JhbSBhbmQgdGhlIGFjY29tcGFueWluZyBtYXRlcmlhbHMgYXJlXHJcbiAgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcclxuICB0aGlzIGRpc3RyaWJ1dGlvbiwgYW5kIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5lY2xpcHNlLm9yZy9sZWdhbC9lcGwtdjIwLmh0bWxcclxuICBcclxuICBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxyXG4gIFxyXG4gIENvcHlyaWdodCBDb250cmlidXRvcnMgdG8gdGhlIFpvd2UgUHJvamVjdC5cclxuKi9cclxuXHJcbmltcG9ydCB7XHJcbiAgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBFdmVudEVtaXR0ZXIsIElucHV0LCBPbkRlc3Ryb3ksIE9uSW5pdCxcclxuICBPdXRwdXQsIFZpZXdFbmNhcHN1bGF0aW9uLCBJbmplY3QsIE9wdGlvbmFsLCBWaWV3Q2hpbGRcclxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgRm9ybUNvbnRyb2wgfSBmcm9tICdAYW5ndWxhci9mb3JtcydcclxuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgb2YsIFN1YnNjcmlwdGlvbiB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBjYXRjaEVycm9yLCBkZWJvdW5jZVRpbWUsIGZpbmFsaXplLCBtYXAsIHRpbWVvdXQgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IEFuZ3VsYXIySW5qZWN0aW9uVG9rZW5zLCBBbmd1bGFyMlBsdWdpbldpbmRvd0FjdGlvbnMsIENvbnRleHRNZW51SXRlbSB9IGZyb20gJy4uLy4uLy4uL3BsdWdpbmxpYi9pbmplY3QtcmVzb3VyY2VzJztcclxuaW1wb3J0IHsgTWF0RGlhbG9nLCBNYXREaWFsb2dDb25maWcsIE1hdERpYWxvZ1JlZiB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2RpYWxvZyc7XHJcbmltcG9ydCB7IE1hdFNuYWNrQmFyIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc25hY2stYmFyJztcclxuaW1wb3J0IHsgRmlsZVByb3BlcnRpZXNNb2RhbCB9IGZyb20gJy4uL2ZpbGUtcHJvcGVydGllcy1tb2RhbC9maWxlLXByb3BlcnRpZXMtbW9kYWwuY29tcG9uZW50JztcclxuaW1wb3J0IHsgRGVsZXRlRmlsZU1vZGFsIH0gZnJvbSAnLi4vZGVsZXRlLWZpbGUtbW9kYWwvZGVsZXRlLWZpbGUtbW9kYWwuY29tcG9uZW50JztcclxuaW1wb3J0IHsgQ3JlYXRlRm9sZGVyTW9kYWwgfSBmcm9tICcuLi9jcmVhdGUtZm9sZGVyLW1vZGFsL2NyZWF0ZS1mb2xkZXItbW9kYWwuY29tcG9uZW50JztcclxuaW1wb3J0IHsgQ3JlYXRlRmlsZU1vZGFsIH0gZnJvbSAnLi4vY3JlYXRlLWZpbGUtbW9kYWwvY3JlYXRlLWZpbGUtbW9kYWwuY29tcG9uZW50JztcclxuaW1wb3J0IHsgVXBsb2FkTW9kYWwgfSBmcm9tICcuLi91cGxvYWQtZmlsZXMtbW9kYWwvdXBsb2FkLWZpbGVzLW1vZGFsLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IEZpbGVQZXJtaXNzaW9uc01vZGFsIH0gZnJvbSAnLi4vZmlsZS1wZXJtaXNzaW9ucy1tb2RhbC9maWxlLXBlcm1pc3Npb25zLW1vZGFsLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IEZpbGVPd25lcnNoaXBNb2RhbCB9IGZyb20gJy4uL2ZpbGUtb3duZXJzaGlwLW1vZGFsL2ZpbGUtb3duZXJzaGlwLW1vZGFsLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IEZpbGVUYWdnaW5nTW9kYWwgfSBmcm9tICcuLi9maWxlLXRhZ2dpbmctbW9kYWwvZmlsZS10YWdnaW5nLW1vZGFsLmNvbXBvbmVudCc7XHJcbmltcG9ydCB7IHF1aWNrU25hY2tiYXJPcHRpb25zLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zLCBsb25nU25hY2tiYXJPcHRpb25zIH0gZnJvbSAnLi4vLi4vc2hhcmVkL3NuYWNrYmFyLW9wdGlvbnMnO1xyXG5pbXBvcnQgeyBpbmNyZW1lbnRGaWxlTmFtZSB9IGZyb20gJy4uLy4uL3NoYXJlZC9maWxlQWN0aW9ucydcclxuaW1wb3J0IHsgRmlsZVRyZWVOb2RlIH0gZnJvbSAnLi4vLi4vc3RydWN0dXJlcy9jaGlsZC1ldmVudCc7XHJcbmltcG9ydCB7IFRyZWVDb21wb25lbnQgfSBmcm9tICcuLi90cmVlL3RyZWUuY29tcG9uZW50JztcclxuaW1wb3J0ICogYXMgXyBmcm9tICdsb2Rhc2gnO1xyXG5cclxuLyogU2VydmljZXMgKi9cclxuaW1wb3J0IHsgVXRpbHNTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvdXRpbHMuc2VydmljZSc7XHJcbmltcG9ydCB7IFVzc0NydWRTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvdXNzLmNydWQuc2VydmljZSc7XHJcbmltcG9ydCB7IERvd25sb2FkZXJTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvZG93bmxvYWRlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU2VhcmNoSGlzdG9yeVNlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9zZWFyY2hIaXN0b3J5U2VydmljZSc7XHJcblxyXG4vKiBUT0RPOiByZS1pbXBsZW1lbnQgdG8gYWRkIGZldGNoaW5nIG9mIHByZXZpb3VzbHkgb3BlbmVkIHRyZWUgdmlldyBkYXRhXHJcbmltcG9ydCB7IFBlcnNpc3RlbnREYXRhU2VydmljZSB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL3BlcnNpc3RlbnREYXRhLnNlcnZpY2UnOyAqL1xyXG5cclxuY29uc3QgU0VBUkNIX0lEID0gJ3Vzcyc7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ2ZpbGUtYnJvd3Nlci11c3MnLFxyXG4gIHRlbXBsYXRlVXJsOiAnLi9maWxlYnJvd3NlcnVzcy5jb21wb25lbnQuaHRtbCcsXHJcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcclxuICBzdHlsZVVybHM6IFsnLi9maWxlYnJvd3NlcnVzcy5jb21wb25lbnQuY3NzJ10sXHJcbiAgcHJvdmlkZXJzOiBbVXNzQ3J1ZFNlcnZpY2UsIC8qUGVyc2lzdGVudERhdGFTZXJ2aWNlLCovIFNlYXJjaEhpc3RvcnlTZXJ2aWNlXVxyXG59KVxyXG5cclxuZXhwb3J0IGNsYXNzIEZpbGVCcm93c2VyVVNTQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3kge1xyXG5cclxuICAvKiBUT0RPOiBMZWdhY3ksIGNhcGFiaWxpdGllcyBjb2RlICh1bnVzZWQgZm9yIG5vdykgKi9cclxuICAvL0lGaWxlQnJvd3NlclVTUyxcclxuICAvL2NvbXBvbmVudENsYXNzOiBDb21wb25lbnRDbGFzcztcclxuICAvL2ZpbGVTZWxlY3RlZDogU3ViamVjdDxGaWxlQnJvd3NlckZpbGVTZWxlY3RlZEV2ZW50PjtcclxuICAvL2NhcGFiaWxpdGllczogQXJyYXk8Q2FwYWJpbGl0eT47XHJcblxyXG4gIC8qIFRPRE86IEZldGNoaW5nIHVwZGF0ZXMgZm9yIGF1dG9tYXRpYyByZWZyZXNoIChkaXNhYmxlZCBmb3Igbm93KSAqL1xyXG4gIC8vIHByaXZhdGUgaW50ZXJ2YWxJZDogYW55O1xyXG4gIC8vIHByaXZhdGUgdXBkYXRlSW50ZXJ2YWw6IG51bWJlciA9IDEwMDAwOy8vIFRPRE86IHRpbWUgcmVwcmVzZW50cyBpbiBtcyBob3cgZmFzdCB0cmVlIHVwZGF0ZXMgY2hhbmdlcyBmcm9tIG1haW5mcmFtZVxyXG5cclxuICAvKiBEYXRhIGFuZCBuYXZpZ2F0aW9uICovXHJcbiAgcHVibGljIHBhdGg6IHN0cmluZztcclxuICBwdWJsaWMgc2VsZWN0ZWROb2RlOiBhbnk7XHJcbiAgcHVibGljIGhvbWVQYXRoOiBzdHJpbmc7IC8vIElmIHN0YXlzIG51bGwgYWZ0ZXIgaW5pdCwgWlNTIHdhcyB1bmFibGUgdG8gZmluZCBhIHVzZXIgaG9tZSBkaXJlY3RvcnlcclxuICBwdWJsaWMgcm9vdDogc3RyaW5nOyAvLyBEZWZhdWx0IC8gZGlyZWN0b3J5IChkaWZmZXJlbnQgZnJvbSBob21lUGF0aClcclxuICBwdWJsaWMgcmlnaHRDbGlja2VkRmlsZTogYW55O1xyXG4gIC8vVE9ETzogTWF5IG5vdCBuZWVkZWQgYW55bW9yZT8gKG1heSBuZWVkIHJlcGxhY2luZyB3LyByaWdodENsaWNrZWRGaWxlKVxyXG4gIHByaXZhdGUgcmlnaHRDbGlja2VkRXZlbnQ6IGFueTtcclxuICBwcml2YXRlIGRlbGV0aW9uUXVldWUgPSBuZXcgTWFwKCk7IC8vbXVsdGlwbGUgZmlsZXMgZGVsZXRpb24gaXMgYXN5bmMsIHNvIHF1ZXVlIGlzIHVzZWRcclxuICBwcml2YXRlIGZpbGVUb0NvcHlPckN1dDogYW55O1xyXG4gIC8vVE9ETzogRGVmaW5lIGludGVyZmFjZSB0eXBlcyBmb3IgdXNzLWRhdGEvZGF0YVxyXG4gIHB1YmxpYyBkYXRhOiBGaWxlVHJlZU5vZGVbXTsgLy9NYWluIGRhdGEgZGlzcGxheWVkIGluIHRoZSB2aXN1YWwgdHJlZSBhcyBub2Rlc1xyXG4gIHByaXZhdGUgZGF0YUNhY2hlZDogRmlsZVRyZWVOb2RlW107IC8vIFVzZWQgZm9yIGZpbHRlcmluZyBhZ2FpbnN0IHF1aWNrIHNlYXJjaFxyXG5cclxuICAvKiBRdWljayBzZWFyY2ggKEFsdCArIFApIHN0dWZmICovXHJcbiAgcHVibGljIHNob3dTZWFyY2g6IGJvb2xlYW47XHJcbiAgcHVibGljIHNlYXJjaEN0cmw6IGFueTtcclxuICBwdWJsaWMgc2VhcmNoVmFsdWVTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcclxuICBwcml2YXRlIHVzc1NlYXJjaEhpc3RvcnlTdWJzY3JpcHRpb246IFN1YnNjcmlwdGlvbjtcclxuXHJcbiAgLyogVHJlZSBVSSBhbmQgbW9kYWxzICovXHJcbiAgQFZpZXdDaGlsZChUcmVlQ29tcG9uZW50KSBwcml2YXRlIHRyZWVDb21wb25lbnQ6IFRyZWVDb21wb25lbnQ7XHJcbiAgQFZpZXdDaGlsZCgncGF0aElucHV0VVNTJykgcHVibGljIHBhdGhJbnB1dFVTUzogRWxlbWVudFJlZjtcclxuICBAVmlld0NoaWxkKCdzZWFyY2hVU1MnKSBwdWJsaWMgc2VhcmNoVVNTOiBFbGVtZW50UmVmO1xyXG4gIHB1YmxpYyBoaWRlRXhwbG9yZXI6IGJvb2xlYW47XHJcbiAgcHVibGljIGlzTG9hZGluZzogYm9vbGVhbjtcclxuICBwcml2YXRlIHJpZ2h0Q2xpY2tQcm9wZXJ0aWVzRmlsZTogQ29udGV4dE1lbnVJdGVtW107XHJcbiAgcHJpdmF0ZSByaWdodENsaWNrUHJvcGVydGllc0ZvbGRlcjogQ29udGV4dE1lbnVJdGVtW107XHJcbiAgcHJpdmF0ZSByaWdodENsaWNrUHJvcGVydGllc1BhbmVsOiBDb250ZXh0TWVudUl0ZW1bXTtcclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLFxyXG4gICAgcHJpdmF0ZSB1c3NTcnY6IFVzc0NydWRTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSB1dGlsczogVXRpbHNTZXJ2aWNlLFxyXG4gICAgcHVibGljIHVzc1NlYXJjaEhpc3Rvcnk6IFNlYXJjaEhpc3RvcnlTZXJ2aWNlLFxyXG4gICAgcHVibGljIGRpYWxvZzogTWF0RGlhbG9nLFxyXG4gICAgcHVibGljIHNuYWNrQmFyOiBNYXRTbmFja0JhcixcclxuICAgIHB1YmxpYyBkb3dubG9hZFNlcnZpY2U6IERvd25sb2FkZXJTZXJ2aWNlLFxyXG4gICAgQEluamVjdChBbmd1bGFyMkluamVjdGlvblRva2Vucy5MT0dHRVIpIHByaXZhdGUgbG9nOiBaTFVYLkNvbXBvbmVudExvZ2dlcixcclxuICAgIEBJbmplY3QoQW5ndWxhcjJJbmplY3Rpb25Ub2tlbnMuTEFVTkNIX01FVEFEQVRBKSBwcml2YXRlIGxhdW5jaE1ldGFkYXRhOiBhbnksXHJcbiAgICBASW5qZWN0KEFuZ3VsYXIySW5qZWN0aW9uVG9rZW5zLlBMVUdJTl9ERUZJTklUSU9OKSBwcml2YXRlIHBsdWdpbkRlZmluaXRpb246IFpMVVguQ29udGFpbmVyUGx1Z2luRGVmaW5pdGlvbixcclxuICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQW5ndWxhcjJJbmplY3Rpb25Ub2tlbnMuV0lORE9XX0FDVElPTlMpIHByaXZhdGUgd2luZG93QWN0aW9uczogQW5ndWxhcjJQbHVnaW5XaW5kb3dBY3Rpb25zKSB7XHJcbiAgICAvKiBUT0RPOiBMZWdhY3ksIGNhcGFiaWxpdGllcyBjb2RlICh1bnVzZWQgZm9yIG5vdykgKi9cclxuICAgIC8vdGhpcy5jb21wb25lbnRDbGFzcyA9IENvbXBvbmVudENsYXNzLkZpbGVCcm93c2VyO1xyXG4gICAgdGhpcy5pbml0YWxpemVDYXBhYmlsaXRpZXMoKTtcclxuICAgIHRoaXMudXNzU2VhcmNoSGlzdG9yeS5vbkluaXQoU0VBUkNIX0lEKTtcclxuICAgIHRoaXMucm9vdCA9IFwiL1wiOyAvLyBEZXYgcHVycG9zZXM6IFJlcGxhY2Ugd2l0aCBob21lIGRpcmVjdG9yeSB0byB0ZXN0IEV4cGxvcmVyIGZ1bmN0aW9uYWxpdGllc1xyXG4gICAgdGhpcy5wYXRoID0gdGhpcy5yb290O1xyXG4gICAgdGhpcy5kYXRhID0gW107XHJcbiAgICB0aGlzLmhpZGVFeHBsb3JlciA9IGZhbHNlO1xyXG4gICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgIHRoaXMuc2hvd1NlYXJjaCA9IGZhbHNlO1xyXG4gICAgdGhpcy5zZWFyY2hDdHJsID0gbmV3IEZvcm1Db250cm9sKCk7XHJcbiAgICB0aGlzLnNlYXJjaFZhbHVlU3Vic2NyaXB0aW9uID0gdGhpcy5zZWFyY2hDdHJsLnZhbHVlQ2hhbmdlcy5waXBlKFxyXG4gICAgICBkZWJvdW5jZVRpbWUoNTAwKSwgLy8gQnkgZGVmYXVsdCwgNTAwIG1zIHVudGlsIHVzZXIgaW5wdXQsIGZvciBxdWljayBzZWFyY2ggdG8gdXBkYXRlIHJlc3VsdHNcclxuICAgICkuc3Vic2NyaWJlKCh2YWx1ZSkgPT4geyB0aGlzLnNlYXJjaElucHV0Q2hhbmdlZCh2YWx1ZSkgfSk7XHJcbiAgICB0aGlzLnNlbGVjdGVkTm9kZSA9IG51bGw7XHJcbiAgfVxyXG5cclxuICAvKiBUcmVlIG91dGdvaW5nIGV2ZW50cyAqL1xyXG4gIEBPdXRwdXQoKSBwYXRoQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgZGF0YUNoYW5nZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIG5vZGVDbGljazogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgbm9kZURibENsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSBub2RlUmlnaHRDbGljazogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICAvLyBAT3V0cHV0KCkgbmV3RmlsZUNsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSBuZXdGb2xkZXJDbGljazogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgbmV3RmlsZUNsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSBmaWxlVXBsb2FkZWQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIGNvcHlDbGljazogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgZGVsZXRlQ2xpY2s6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIHVzc1JlbmFtZUV2ZW50OiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSByaWdodENsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSBvcGVuSW5OZXdUYWI6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcblxyXG4gIC8qIEN1c3RvbWl6ZWFibGUgdHJlZSBzdHlsZXMgKi9cclxuICBASW5wdXQoKSBwdWJsaWMgaW5wdXRTdHlsZTogYW55O1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBzZWFyY2hTdHlsZTogYW55O1xyXG4gIEBJbnB1dCgpIHB1YmxpYyB0cmVlU3R5bGU6IGFueTtcclxuICBASW5wdXQoKSBwdWJsaWMgc2hvd1VwQXJyb3c6IGJvb2xlYW47XHJcblxyXG4gIG5nT25Jbml0KCkge1xyXG4gICAgdGhpcy5sb2FkVXNlckhvbWVEaXJlY3RvcnkoKS5waXBlKFxyXG4gICAgICBjYXRjaEVycm9yKGVyciA9PiB7XHJcbiAgICAgICAgdGhpcy5sb2cud2FybihgVW5zdWNjZXNzZnVsIGluIGxvYWRpbmcgdXNlciBob21lIGRpcmVjdG9yeTogJHtlcnJ9YCk7XHJcbiAgICAgICAgcmV0dXJuIG9mKCcvJyk7XHJcbiAgICAgIH0pLFxyXG4gICAgKS5zdWJzY3JpYmUoaG9tZSA9PiB7XHJcbiAgICAgIGlmICghdGhpcy5ob21lUGF0aCkge1xyXG4gICAgICAgIGlmICh0aGlzLmxhdW5jaE1ldGFkYXRhICYmIHRoaXMubGF1bmNoTWV0YWRhdGEuZGF0YSAmJiB0aGlzLmxhdW5jaE1ldGFkYXRhLmRhdGEubmFtZSkge1xyXG4gICAgICAgICAgdGhpcy5wYXRoID0gdGhpcy5sYXVuY2hNZXRhZGF0YS5kYXRhLm5hbWU7XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZVVzcyh0aGlzLnBhdGgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnBhdGggPSBob21lO1xyXG4gICAgICAgICAgdGhpcy51cGRhdGVVc3MoaG9tZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaG9tZVBhdGggPSBob21lO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHRoaXMuaW5pdGlhbGl6ZVJpZ2h0Q2xpY2tQcm9wZXJ0aWVzKCk7XHJcbiAgICAvLyBUT0RPOiBVbmNvbW1lbnQgJiBmaXggYXV0by11cGRhdGUgb2Ygbm9kZSBkYXRhIGJhc2VkIG9uIGFuIGludGVydmFsLiBNYXliZSBmdXR1cmUgc2V0dGluZz9cclxuICAgIC8vIHRoaXMucGVyc2lzdGVudERhdGFTZXJ2aWNlLmdldERhdGEoKVxyXG4gICAgLy8gICAuc3Vic2NyaWJlKGRhdGEgPT4ge1xyXG4gICAgLy8gICAgIGlmIChkYXRhLmNvbnRlbnRzLnVzc0lucHV0KSB7XHJcbiAgICAvLyAgICAgICB0aGlzLnBhdGggPSBkYXRhLmNvbnRlbnRzLnVzc0lucHV0OyB9XHJcbiAgICAvLyAgICAgaWYgKGRhdGEuY29udGVudHMudXNzRGF0YSAhPT0gdW5kZWZpbmVkKVxyXG4gICAgLy8gICAgIGRhdGEuY29udGVudHMudXNzRGF0YS5sZW5ndGggPT0gMCA/IHRoaXMuZGlzcGxheVRyZWUodGhpcy5wYXRoLCBmYWxzZSkgOiAodGhpcy5kYXRhID0gZGF0YS5jb250ZW50cy51c3NEYXRhLCB0aGlzLnBhdGggPSBkYXRhLmNvbnRlbnRzLnVzc0lucHV0KVxyXG4gICAgLy8gICAgIGVsc2VcclxuICAgIC8vICAgICB0aGlzLmRpc3BsYXlUcmVlKHRoaXMucm9vdCwgZmFsc2UpO1xyXG4gICAgLy8gICB9KVxyXG4gICAgLy8gdGhpcy5pbnRlcnZhbElkID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgLy8gIHRoaXMudXBkYXRlVXNzKHRoaXMucGF0aCk7XHJcbiAgICAvLyB9LCB0aGlzLnVwZGF0ZUludGVydmFsKTtcclxuICB9XHJcblxyXG4gIG5nT25EZXN0cm95KCkge1xyXG4gICAgLyogVE9ETzogRmV0Y2hpbmcgdXBkYXRlcyBmb3IgYXV0b21hdGljIHJlZnJlc2ggKGRpc2FibGVkIGZvciBub3cpICovXHJcbiAgICAvLyBpZiAodGhpcy5pbnRlcnZhbElkKSB7XHJcbiAgICAvLyAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElkKTtcclxuICAgIC8vIH1cclxuICAgIGlmICh0aGlzLnNlYXJjaFZhbHVlU3Vic2NyaXB0aW9uKSB7XHJcbiAgICAgIHRoaXMuc2VhcmNoVmFsdWVTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKTtcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnVzc1NlYXJjaEhpc3RvcnlTdWJzY3JpcHRpb24pIHtcclxuICAgICAgdGhpcy51c3NTZWFyY2hIaXN0b3J5U3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXRET01FbGVtZW50KCk6IEhUTUxFbGVtZW50IHtcclxuICAgIHJldHVybiB0aGlzLmVsZW1lbnRSZWYubmF0aXZlRWxlbWVudDtcclxuICB9XHJcblxyXG4gIGdldFNlbGVjdGVkUGF0aCgpOiBzdHJpbmcge1xyXG4gICAgLy9UT0RPOmhvdyBkbyB3ZSB3YW50IHRvIHdhbnQgdG8gaGFuZGxlIGNhY2hpbmcgdnMgbWVzc2FnZSB0byBhcHAgdG8gb3BlbiBzYWlkIHBhdGhcclxuICAgIHJldHVybiB0aGlzLnBhdGg7XHJcbiAgfVxyXG5cclxuICBsb2FkVXNlckhvbWVEaXJlY3RvcnkoKTogT2JzZXJ2YWJsZTxzdHJpbmc+IHtcclxuICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgIHJldHVybiB0aGlzLnVzc1Nydi5nZXRVc2VySG9tZUZvbGRlcigpLnBpcGUoXHJcbiAgICAgIHRpbWVvdXQoMjAwMCksXHJcbiAgICAgIG1hcChyZXNwID0+IHJlc3AuaG9tZS50cmltKCkpLFxyXG4gICAgICBmaW5hbGl6ZSgoKSA9PiB0aGlzLmlzTG9hZGluZyA9IGZhbHNlKVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGluaXRhbGl6ZUNhcGFiaWxpdGllcygpIHtcclxuICAgIC8vICAgLy90aGlzLmNhcGFiaWxpdGllcyA9IG5ldyBBcnJheTxDYXBhYmlsaXR5PigpO1xyXG4gICAgLy8gICAvL3RoaXMuY2FwYWJpbGl0aWVzLnB1c2goRmlsZUJyb3dzZXJDYXBhYmlsaXRpZXMuRmlsZUJyb3dzZXIpO1xyXG4gICAgLy8gICAvL3RoaXMuY2FwYWJpbGl0aWVzLnB1c2goRmlsZUJyb3dzZXJDYXBhYmlsaXRpZXMuRmlsZUJyb3dzZXJVU1MpO1xyXG4gIH1cclxuXHJcbiAgaW5pdGlhbGl6ZVJpZ2h0Q2xpY2tQcm9wZXJ0aWVzKCkge1xyXG4gICAgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc0ZpbGUgPSBbXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIlJlcXVlc3QgT3BlbiBpbiBOZXcgQnJvd3NlciBUYWJcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLm9wZW5Jbk5ld1RhYi5lbWl0KHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJSZWZyZXNoIE1ldGFkYXRhXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5yZWZyZXNoRmlsZU1ldGFkYXRhKHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJDaGFuZ2UgTW9kZS9QZXJtaXNzaW9ucy4uLlwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2hvd1Blcm1pc3Npb25zRGlhbG9nKHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJDaGFuZ2UgT3duZXJzLi4uXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5zaG93T3duZXJEaWFsb2codGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIlRhZy4uLlwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2hvd1RhZ2dpbmdEaWFsb2codGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIkRvd25sb2FkXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5hdHRlbXB0RG93bmxvYWQodGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIkN1dFwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuY3V0RmlsZSh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiQ29weVwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuY29weUZpbGUodGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIkNvcHkgTGlua1wiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuY29weUxpbmsodGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIkNvcHkgUGF0aFwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuY29weVBhdGgodGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIkRlbGV0ZVwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2hvd0RlbGV0ZURpYWxvZyh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiUmVuYW1lXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5zaG93UmVuYW1lRmllbGQodGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIlByb3BlcnRpZXNcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNob3dQcm9wZXJ0aWVzRGlhbG9nKHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgXTtcclxuXHJcbiAgICB0aGlzLnJpZ2h0Q2xpY2tQcm9wZXJ0aWVzRm9sZGVyID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJSZWZyZXNoXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5hZGRDaGlsZCh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUsIHRydWUsIHRoaXMucmlnaHRDbGlja2VkRmlsZS5leHBhbmRlZCB8fCBmYWxzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJDaGFuZ2UgTW9kZS9QZXJtaXNzaW9ucy4uLlwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2hvd1Blcm1pc3Npb25zRGlhbG9nKHRoaXMucmlnaHRDbGlja2VkRmlsZSlcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIkNoYW5nZSBPd25lcnMuLi5cIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNob3dPd25lckRpYWxvZyh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJUYWcgRGlyZWN0b3J5Li4uXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5zaG93VGFnZ2luZ0RpYWxvZyh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJDcmVhdGUgYSBGaWxlLi4uXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5zaG93Q3JlYXRlRmlsZURpYWxvZyh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiQ3JlYXRlIGEgRGlyZWN0b3J5Li4uXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5zaG93Q3JlYXRlRm9sZGVyRGlhbG9nKHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJVcGxvYWQuLi5cIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNob3dVcGxvYWREaWFsb2codGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIkNvcHkgTGlua1wiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuY29weUxpbmsodGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIkNvcHkgUGF0aFwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuY29weVBhdGgodGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIkRlbGV0ZVwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2hvd0RlbGV0ZURpYWxvZyh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiUmVuYW1lXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5zaG93UmVuYW1lRmllbGQodGhpcy5yaWdodENsaWNrZWRGaWxlKVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiUHJvcGVydGllc1wiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2hvd1Byb3BlcnRpZXNEaWFsb2codGhpcy5yaWdodENsaWNrZWRGaWxlKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgXTtcclxuXHJcbiAgICB0aGlzLnJpZ2h0Q2xpY2tQcm9wZXJ0aWVzUGFuZWwgPSBbXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIlNob3cvSGlkZSBTZWFyY2hcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnRvZ2dsZVNlYXJjaCgpO1xyXG5cclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIkNyZWF0ZSBhIEZpbGUuLi5cIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICBsZXQgbm9kZVRvVXNlID0ge1xyXG4gICAgICAgICAgICBwYXRoOiB0aGlzLnBhdGgsXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLnNob3dDcmVhdGVGaWxlRGlhbG9nKG5vZGVUb1VzZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJDcmVhdGUgYSBEaXJlY3RvcnkuLi5cIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICBsZXQgbm9kZVRvVXNlID0ge1xyXG4gICAgICAgICAgICBwYXRoOiB0aGlzLnBhdGgsXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0aGlzLnNob3dDcmVhdGVGb2xkZXJEaWFsb2cobm9kZVRvVXNlKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJVcGxvYWQuLi5cIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNob3dVcGxvYWREaWFsb2codGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICBdO1xyXG4gIH1cclxuXHJcbiAgY29weUZpbGUocmlnaHRDbGlja2VkRmlsZTogYW55KSB7XHJcbiAgICB0aGlzLmxvZy5kZWJ1ZyhgY29weWZpbGUgZm9yICAke3RoaXMuZmlsZVRvQ29weU9yQ3V0fSwgJHt0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUucGF0aH0sICR7dGhpcy5wYXRofWApO1xyXG4gICAgaWYgKHRoaXMuZmlsZVRvQ29weU9yQ3V0ID09IG51bGwpIHtcclxuICAgICAgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc0ZvbGRlci5wdXNoKCAvLyBDcmVhdGUgYSBwYXN0ZSBvcHRpb24gZm9yIHRoZSBmb2xkZXJcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0ZXh0OiBcIlBhc3RlXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBhc3RlRmlsZSh0aGlzLmZpbGVUb0NvcHlPckN1dCwgdGhpcy5yaWdodENsaWNrZWRGaWxlLnBhdGgsIGZhbHNlKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuICAgICAgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc1BhbmVsLnB1c2goIC8vIENyZWF0ZSBhIHBhc3RlIG9wdGlvbiBmb3IgdGhlIGFjdGl2ZSBkaXJlY3RvcnlcclxuICAgICAgICB7XHJcbiAgICAgICAgICB0ZXh0OiBcIlBhc3RlXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnBhc3RlRmlsZSh0aGlzLmZpbGVUb0NvcHlPckN1dCwgdGhpcy5wYXRoLCBmYWxzZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmZpbGVUb0NvcHlPckN1dCA9IHJpZ2h0Q2xpY2tlZEZpbGU7XHJcbiAgICB0aGlzLmNvcHlDbGljay5lbWl0KHJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gIH1cclxuXHJcbiAgY3V0RmlsZShyaWdodENsaWNrZWRGaWxlOiBhbnkpIHtcclxuICAgIGlmICh0aGlzLmZpbGVUb0NvcHlPckN1dCkge1xyXG4gICAgICB0aGlzLnJpZ2h0Q2xpY2tQcm9wZXJ0aWVzRm9sZGVyLnNwbGljZSh0aGlzLnJpZ2h0Q2xpY2tQcm9wZXJ0aWVzRm9sZGVyLm1hcChpdGVtID0+IGl0ZW0udGV4dCkuaW5kZXhPZihcIlBhc3RlXCIpLCAxKTtcclxuICAgICAgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc1BhbmVsLnNwbGljZSh0aGlzLnJpZ2h0Q2xpY2tQcm9wZXJ0aWVzUGFuZWwubWFwKGl0ZW0gPT4gaXRlbS50ZXh0KS5pbmRleE9mKFwiUGFzdGVcIiksIDEpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5sb2cuZGVidWcoYGN1dGZpbGUgZm9yICAke3RoaXMuZmlsZVRvQ29weU9yQ3V0fSwgJHt0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUucGF0aH0sICR7dGhpcy5wYXRofWApO1xyXG4gICAgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc0ZvbGRlci5wdXNoKCAvLyBDcmVhdGUgYSBwYXN0ZSBvcHRpb24gZm9yIHRoZSBmb2xkZXJcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiUGFzdGVcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnBhc3RlRmlsZSh0aGlzLmZpbGVUb0NvcHlPckN1dCwgdGhpcy5yaWdodENsaWNrZWRGaWxlLnBhdGgsIHRydWUpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc1BhbmVsLnB1c2goIC8vIENyZWF0ZSBhIHBhc3RlIG9wdGlvbiBmb3IgdGhlIGFjdGl2ZSBkaXJlY3RvcnlcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiUGFzdGVcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnBhc3RlRmlsZSh0aGlzLmZpbGVUb0NvcHlPckN1dCwgdGhpcy5wYXRoLCB0cnVlKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIHRoaXMuZmlsZVRvQ29weU9yQ3V0ID0gcmlnaHRDbGlja2VkRmlsZTtcclxuICAgIHRoaXMuY29weUNsaWNrLmVtaXQocmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgfVxyXG5cclxuICBwYXN0ZUZpbGUoZmlsZU5vZGU6IGFueSwgZGVzdGluYXRpb25QYXRoOiBhbnksIGlzQ3V0OiBib29sZWFuKSB7XHJcbiAgICBsZXQgcGF0aEFuZE5hbWUgPSBmaWxlTm9kZS5wYXRoO1xyXG4gICAgbGV0IG5hbWUgPSB0aGlzLmdldE5hbWVGcm9tUGF0aEFuZE5hbWUocGF0aEFuZE5hbWUpO1xyXG4gICAgdGhpcy5sb2cuZGVidWcoYHBhc3RlIGZvciAke25hbWV9LCAke2Rlc3RpbmF0aW9uUGF0aH0sIGFuZCBjdXQ9JHtpc0N1dH1gKTtcclxuICAgIGlmIChwYXRoQW5kTmFtZS5pbmRleE9mKCcgJykgPj0gMCkge1xyXG4gICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJQYXN0ZSBmYWlsZWQ6ICdcIiArIHBhdGhBbmROYW1lICsgXCInIE9wZXJhdGlvbiBub3QgeWV0IHN1cHBvcnRlZCBmb3IgZmlsZW5hbWVzIHdpdGggc3BhY2VzLlwiLFxyXG4gICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGxldCBtZXRhRGF0YSA9IHRoaXMudXNzU3J2LmdldEZpbGVNZXRhZGF0YShwYXRoQW5kTmFtZSk7XHJcbiAgICBtZXRhRGF0YS5zdWJzY3JpYmUoe1xyXG4gICAgICBuZXh0OiAocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgaWYgKHJlc3VsdC5jY3NpZCA9PSAtMSkge1xyXG4gICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiUGFzdGUgZmFpbGVkOiAnXCIgKyBwYXRoQW5kTmFtZSArIFwiJyBPcGVyYXRpb24gbm90IHlldCBzdXBwb3J0ZWQgZm9yIHRoaXMgZW5jb2RpbmcuXCIsXHJcbiAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgIGxldCBkZXN0aW5hdGlvbk1ldGFkYXRhID0gdGhpcy51c3NTcnYuZ2V0RmlsZUNvbnRlbnRzKGRlc3RpbmF0aW9uUGF0aCk7XHJcbiAgICAgICAgICBkZXN0aW5hdGlvbk1ldGFkYXRhLnN1YnNjcmliZSh7XHJcbiAgICAgICAgICAgIG5leHQ6IChyZXN1bHQpID0+IHtcclxuICAgICAgICAgICAgICAvKnJlbmFtZSB0aGUgZmlsZSB3aGVuIGRvaW5nIHBhc3RlLCBpbiBjYXNlIHNhbWUgbmFtZWQgZmlsZSBleGlzdHMgaW4gdGhlIGRlc3RpbmF0aW9uLiovXHJcbiAgICAgICAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHJlc3VsdC5lbnRyaWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXJlc3VsdC5lbnRyaWVzW2ldLmRpcmVjdG9yeSAmJiByZXN1bHQuZW50cmllc1tpXS5uYW1lID09IG5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgaWYgKGlzQ3V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiVW5hYmxlIHRvIG1vdmUgJ1wiICsgcGF0aEFuZE5hbWUgKyBcIicgYmVjYXVzZSB0YXJnZXQgJ1wiICsgZGVzdGluYXRpb25QYXRoICsgJ1xcLycgKyBuYW1lICsgXCInYWxyZWFkeSBleGlzdHMgYXQgZGVzdGluYXRpb24uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAnRGlzbWlzcycsIGxvbmdTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICBpID0gLTE7XHJcbiAgICAgICAgICAgICAgICAgIG5hbWUgPSBpbmNyZW1lbnRGaWxlTmFtZShuYW1lKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGxldCBjb3B5U3Vic2NyaXB0aW9uID0gdGhpcy51c3NTcnYuY29weUZpbGUocGF0aEFuZE5hbWUsIGRlc3RpbmF0aW9uUGF0aCArIFwiL1wiICsgbmFtZSlcclxuICAgICAgICAgICAgICAgIC5zdWJzY3JpYmUoe1xyXG4gICAgICAgICAgICAgICAgICBuZXh0OiAocmVzcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUuY2hpbGRyZW4gJiYgdGhpcy5yaWdodENsaWNrZWRGaWxlLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGV4cGFuZGVkID0gdGhpcy5yaWdodENsaWNrZWRGaWxlLmV4cGFuZGVkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBXZSByZWN5Y2xlIHRoZSBzYW1lIG1ldGhvZCB1c2VkIGZvciBvcGVuaW5nIChjbGlja2luZyBvbikgYSBub2RlLiBCdXQgaW5zdGVhZCBvZiBleHBhbmRpbmcgaXQsIFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB3ZSBrZWVwIHRoZSBzYW1lIGV4cGFuZGVkIHN0YXRlLCBhbmQganVzdCB1c2UgaXQgdG8gYWRkIGEgbm9kZSAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZENoaWxkKHRoaXMucmlnaHRDbGlja2VkRmlsZSwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmlnaHRDbGlja2VkRmlsZS5leHBhbmRlZCA9IGV4cGFuZGVkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnBhdGggPT0gZGVzdGluYXRpb25QYXRoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIEluIHRoZSBjYXNlIHRoYXQgd2UgcmlnaHQgY2xpY2sgdG8gcGFzdGUgb24gdGhlIGFjdGl2ZSBkaXJlY3RvcnkgaW5zdGVhZCBvZiBhIG5vZGUsIHdlIHVwZGF0ZSBvdXIgdHJlZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoYWN0aXZlIGRpcmVjdG9yeSkgaW5zdGVhZCBvZiBhZGRpbmcgb250byBhIHNwZWNpZmljIG5vZGUgKi9cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5VHJlZSh0aGlzLnBhdGgsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNDdXQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIC8qIENsZWFyIHRoZSBwYXN0ZSBvcHRpb24sIGJlY2F1c2UgZXZlbiBpZiBkZWxldGUgZmFpbHMgYWZ0ZXIsIHdlIGhhdmUgYWxyZWFkeSBkb25lIHRoZSBjb3B5ICovXHJcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbGVUb0NvcHlPckN1dCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJpZ2h0Q2xpY2tQcm9wZXJ0aWVzRm9sZGVyLnNwbGljZSh0aGlzLnJpZ2h0Q2xpY2tQcm9wZXJ0aWVzRm9sZGVyLm1hcChpdGVtID0+IGl0ZW0udGV4dCkuaW5kZXhPZihcIlBhc3RlXCIpLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmlnaHRDbGlja1Byb3BlcnRpZXNQYW5lbC5zcGxpY2UodGhpcy5yaWdodENsaWNrUHJvcGVydGllc1BhbmVsLm1hcChpdGVtID0+IGl0ZW0udGV4dCkuaW5kZXhPZihcIlBhc3RlXCIpLCAxKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAvKiBEZWxldGUgKGN1dCkgcG9ydGlvbiAqL1xyXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy51c3NTcnYuZGVsZXRlRmlsZU9yRm9sZGVyKHBhdGhBbmROYW1lKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBuZXh0OiAocmVzcCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2hpbGQoZmlsZU5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKCdQYXN0ZSBzdWNjZXNzZnVsOiAnICsgbmFtZSwgJ0Rpc21pc3MnLCBxdWlja1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3Iuc3RhdHVzID09ICc1MDAnKSB7IC8vSW50ZXJuYWwgU2VydmVyIEVycm9yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkNvcGllZCBzdWNjZXNzZnVsbHksIGJ1dCBmYWlsZWQgdG8gY3V0ICdcIiArIHBhdGhBbmROYW1lICsgXCInIFNlcnZlciByZXR1cm5lZCB3aXRoOiBcIiArIGVycm9yLl9ib2R5LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdEaXNtaXNzJywgbG9uZ1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnN0YXR1cyA9PSAnNDA0JykgeyAvL05vdCBGb3VuZFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJDb3BpZWQgc3VjY2Vzc2Z1bGx5LCBidXQgJ1wiICsgcGF0aEFuZE5hbWUgKyBcIicgaGFzIGFscmVhZHkgYmVlbiBkZWxldGVkIG9yIGRvZXMgbm90IGV4aXN0LlwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2hpbGQoZmlsZU5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5zdGF0dXMgPT0gJzQwMCcgfHwgZXJyb3Iuc3RhdHVzID09ICc0MDMnKSB7IC8vQmFkIFJlcXVlc3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiQ29waWVkIHN1Y2Nlc3NmdWxseSBidXQgZmFpbGVkIHRvIGN1dCAnXCIgKyBwYXRoQW5kTmFtZSArIFwiJyBUaGlzIGlzIHByb2JhYmx5IGR1ZSB0byBhIHBlcm1pc3Npb24gcHJvYmxlbS5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHsgLy9Vbmtub3duXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkNvcGllZCBzdWNjZXNzZnVsbHksIGJ1dCB1bmtub3duIGVycm9yIGN1dHRpbmcgJ1wiICsgZXJyb3Iuc3RhdHVzICsgXCInIG9jY3VycmVkIGZvciAnXCIgKyBwYXRoQW5kTmFtZSArIFwiJyBTZXJ2ZXIgcmV0dXJuZWQgd2l0aDogXCIgKyBlcnJvci5fYm9keSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnRGlzbWlzcycsIGxvbmdTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nLnNldmVyZShlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbignUGFzdGUgc3VjY2Vzc2Z1bDogJyArIG5hbWUsICdEaXNtaXNzJywgcXVpY2tTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgZXJyb3I6IChlcnJvcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvci5zdGF0dXMgPT0gJzUwMCcpIHsgLy9JbnRlcm5hbCBTZXJ2ZXIgRXJyb3JcclxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIlBhc3RlIGZhaWxlZDogSFRUUCA1MDAgZnJvbSBhcHAtc2VydmVyIG9yIGFnZW50IG9jY3VycmVkIGZvciAnXCIgKyBwYXRoQW5kTmFtZSArIFwiJy4gU2VydmVyIHJldHVybmVkIHdpdGg6IFwiICsgZXJyb3IuX2JvZHksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdEaXNtaXNzJywgbG9uZ1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5zdGF0dXMgPT0gJzQwNCcpIHsgLy9Ob3QgRm91bmRcclxuICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIlBhc3RlIGZhaWxlZDogJ1wiICsgcGF0aEFuZE5hbWUgKyBcIicgZG9lcyBub3QgZXhpc3QuXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5zdGF0dXMgPT0gJzQwMCcpIHsgLy9CYWQgUmVxdWVzdFxyXG4gICAgICAgICAgICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiUGFzdGUgZmFpbGVkOiBIVFRQIDQwMCBvY2N1cnJlZCBmb3IgJ1wiICsgcGF0aEFuZE5hbWUgKyBcIicuIENoZWNrIHRoYXQgeW91IGhhdmUgY29ycmVjdCBwZXJtaXNzaW9ucyBmb3IgdGhpcyBhY3Rpb24uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHsgLy9Vbmtub3duXHJcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJQYXN0ZSBmYWlsZWQ6ICdcIiArIGVycm9yLnN0YXR1cyArIFwiJyBvY2N1cnJlZCBmb3IgJ1wiICsgcGF0aEFuZE5hbWUgKyBcIicgU2VydmVyIHJldHVybmVkIHdpdGg6IFwiICsgZXJyb3IuX2JvZHksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdEaXNtaXNzJywgbG9uZ1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cuc2V2ZXJlKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvcHlTdWJzY3JpcHRpb24uY2xvc2VkID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbignUGFzdGluZyAnICsgcGF0aEFuZE5hbWUgKyAnLi4uIExhcmdlciBwYXlsb2FkcyBtYXkgdGFrZSBsb25nZXIuIFBsZWFzZSBiZSBwYXRpZW50LicsXHJcbiAgICAgICAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBxdWlja1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSwgNDAwMCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiAoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDMnKSB7IC8vUGVybWlzc2lvbiBkZW5pZWRcclxuICAgICAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbignRmFpbGVkIHRvIGFjY2VzcyBkZXN0aW5hdGlvbiBmb2xkZXI6IFBlcm1pc3Npb24gZGVuaWVkLicsXHJcbiAgICAgICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5zdGF0dXMgPT0gJzAnKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJGYWlsZWQgdG8gY29tbXVuaWNhdGUgd2l0aCB0aGUgQXBwIHNlcnZlcjogXCIgKyBlcnJvci5zdGF0dXMsXHJcbiAgICAgICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5zdGF0dXMgPT0gJzQwNCcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkRlc3RpbmF0aW9uIGZvbGRlciBub3QgZm91bmQuIFwiICsgZXJyb3Iuc3RhdHVzLFxyXG4gICAgICAgICAgICAgICAgICAnRGlzbWlzcycsIHF1aWNrU25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiQW4gdW5rbm93biBlcnJvciBvY2N1cnJlZDogXCIgKyBlcnJvci5zdGF0dXMsXHJcbiAgICAgICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHRoaXMubG9nLnNldmVyZShlcnJvcik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgZXJyb3I6IChlcnJvcikgPT4ge1xyXG4gICAgICAgIGlmIChlcnJvci5zdGF0dXMgPT0gJzQwNCcpIHsgLy8gVGhpcyBoYXBwZW5zIHdoZW4gdXNlciBhdHRlbXB0cyB0byBwYXN0ZSBhIGZpbGUgdGhhdCdzIGJlZW4gZGVsZXRlZCBhZnRlciBjb3B5aW5nXHJcbiAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJQYXN0ZSBmYWlsZWQ6IE9yaWdpbmFsICdcIiArIHBhdGhBbmROYW1lICsgXCInIG5vIGxvbmdlciBleGlzdHMuXCIsXHJcbiAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5sb2cud2FybihlcnJvcik7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgc2hvd1Byb3BlcnRpZXNEaWFsb2cocmlnaHRDbGlja2VkRmlsZTogYW55KSB7XHJcbiAgICBjb25zdCBmaWxlUHJvcENvbmZpZyA9IG5ldyBNYXREaWFsb2dDb25maWcoKTtcclxuICAgIGZpbGVQcm9wQ29uZmlnLmRhdGEgPSB7XHJcbiAgICAgIGV2ZW50OiByaWdodENsaWNrZWRGaWxlXHJcbiAgICB9XHJcbiAgICBmaWxlUHJvcENvbmZpZy5tYXhXaWR0aCA9ICczNTBweCc7XHJcblxyXG4gICAgdGhpcy5kaWFsb2cub3BlbihGaWxlUHJvcGVydGllc01vZGFsLCBmaWxlUHJvcENvbmZpZyk7XHJcbiAgfVxyXG5cclxuICBzaG93UmVuYW1lRmllbGQoZmlsZTogYW55KSB7XHJcbiAgICBjb25zdCBzZWxlY3RlZE5vZGUgPSB0aGlzLnJpZ2h0Q2xpY2tlZEV2ZW50Lm9yaWdpbmFsRXZlbnQuc3JjRWxlbWVudDtcclxuICAgIGxldCBvbGROYW1lID0gZmlsZS5uYW1lO1xyXG4gICAgbGV0IG9sZFBhdGggPSBmaWxlLnBhdGg7XHJcbiAgICBmaWxlLnNlbGVjdGFibGUgPSBmYWxzZTtcclxuXHJcbiAgICBsZXQgcmVuYW1lRm4gPSAobm9kZTogSFRNTEVsZW1lbnQpID0+IHtcclxuICAgICAgcmVuYW1lRmllbGQucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobm9kZSwgcmVuYW1lRmllbGQpO1xyXG4gICAgICBmaWxlLnNlbGVjdGFibGUgPSB0cnVlO1xyXG4gICAgICBsZXQgbmFtZUZyb21Ob2RlID0gcmVuYW1lRmllbGQudmFsdWU7XHJcbiAgICAgIGxldCBwYXRoRm9yUmVuYW1lID0gdGhpcy5nZXRQYXRoRnJvbVBhdGhBbmROYW1lKG9sZFBhdGgpO1xyXG4gICAgICBpZiAob2xkTmFtZSAhPSBuYW1lRnJvbU5vZGUpIHtcclxuICAgICAgICBsZXQgbmV3UGF0aCA9IGAke3BhdGhGb3JSZW5hbWV9LyR7bmFtZUZyb21Ob2RlfWA7XHJcbiAgICAgICAgdGhpcy51c3NTcnYucmVuYW1lRmlsZShvbGRQYXRoLCBuZXdQYXRoKS5zdWJzY3JpYmUoe1xyXG4gICAgICAgICAgbmV4dDogKHJlcykgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJSZW5hbWVkICdcIiArIG9sZE5hbWUgKyBcIicgdG8gJ1wiICsgbmFtZUZyb21Ob2RlICsgXCInXCIsXHJcbiAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBxdWlja1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIC8vIHRoaXMudXBkYXRlVXNzKHRoaXMucGF0aCk7IC0gV2UgZG9uJ3QgbmVlZCB0byB1cGRhdGUgdGhlIHdob2xlIHRyZWUgZm9yIDEgY2hhbmdlZCBub2RlIChyZW5hbWUgc2hvdWxkIGJlIE8oMSkgb3BlcmF0aW9uKSwgXHJcbiAgICAgICAgICAgIC8vIGJ1dCBpZiBwcm9ibGVtcyBjb21lIHVwIHVuY29tbWVudCB0aGlzXHJcbiAgICAgICAgICAgIHRoaXMudXNzUmVuYW1lRXZlbnQuZW1pdCh0aGlzLnJpZ2h0Q2xpY2tlZEV2ZW50Lm5vZGUpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zaG93U2VhcmNoKSB7IC8vIFVwZGF0ZSBzYXZlZCBjYWNoZSBpZiB3ZSdyZSB1c2luZyB0aGUgc2VhcmNoIGJhclxyXG4gICAgICAgICAgICAgIGxldCBub2RlQ2FjaGVkID0gdGhpcy5maW5kTm9kZUJ5UGF0aCh0aGlzLmRhdGFDYWNoZWQsIGZpbGUucGF0aClbMF07XHJcbiAgICAgICAgICAgICAgaWYgKG5vZGVDYWNoZWQpIHtcclxuICAgICAgICAgICAgICAgIG5vZGVDYWNoZWQubGFiZWwgPSBuYW1lRnJvbU5vZGU7XHJcbiAgICAgICAgICAgICAgICBub2RlQ2FjaGVkLnBhdGggPSBuZXdQYXRoO1xyXG4gICAgICAgICAgICAgICAgbm9kZUNhY2hlZC5uYW1lID0gbmFtZUZyb21Ob2RlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmaWxlLmxhYmVsID0gbmFtZUZyb21Ob2RlO1xyXG4gICAgICAgICAgICBmaWxlLnBhdGggPSBuZXdQYXRoO1xyXG4gICAgICAgICAgICBmaWxlLm5hbWUgPSBuYW1lRnJvbU5vZGU7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICBlcnJvcjogKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChlcnJvci5zdGF0dXMgPT0gJzQwMycpIHsgLy9JbnRlcm5hbCBTZXJ2ZXIgRXJyb3JcclxuICAgICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJGYWlsZWQgdG8gcmVuYW1lICdcIiArIGZpbGUucGF0aCArIFwiJy4gQmFkIHBlcm1pc3Npb25zLlwiLFxyXG4gICAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5zdGF0dXMgPT0gJzQwNCcpIHsgLy9Ob3QgRm91bmRcclxuICAgICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCInXCIgKyBmaWxlLnBhdGggKyBcIicgY291bGQgbm90IGJlIG9wZW5lZCBvciBkb2VzIG5vdCBleGlzdC5cIixcclxuICAgICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7IC8vVW5rbm93blxyXG4gICAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkZhaWxlZCB0byByZW5hbWUgJ1wiICsgZmlsZS5wYXRoICsgXCInLiBFcnJvcjogXCIgKyBlcnJvci5fYm9keSxcclxuICAgICAgICAgICAgICAgICdEaXNtaXNzJywgbG9uZ1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5sb2cuc2V2ZXJlKGVycm9yKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB2YXIgcmVuYW1lRmllbGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XHJcbiAgICByZW5hbWVGaWVsZC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3JlbmFtZUhpZ2hsaWdodGVkRmllbGQnKTtcclxuICAgIHJlbmFtZUZpZWxkLnZhbHVlID0gb2xkTmFtZTtcclxuICAgIHJlbmFtZUZpZWxkLnN0eWxlLndpZHRoID0gKHNlbGVjdGVkTm9kZSBhcyBIVE1MRWxlbWVudCkuc3R5bGUud2lkdGg7XHJcbiAgICByZW5hbWVGaWVsZC5zdHlsZS5oZWlnaHQgPSAoc2VsZWN0ZWROb2RlIGFzIEhUTUxFbGVtZW50KS5zdHlsZS5oZWlnaHQ7XHJcbiAgICBsZXQgcm5Ob2RlID0gKGUpID0+IHtcclxuICAgICAgaWYgKGUud2hpY2ggPT0gMTMgfHwgZS5rZXkgPT0gXCJFbnRlclwiIHx8IGUua2V5Q29kZSA9PSAxMykge1xyXG4gICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZS5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG4gICAgICAgIHJlbmFtZUZpZWxkLmJsdXIoKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJlbmFtZUZpZWxkLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBybk5vZGUpO1xyXG4gICAgcmVuYW1lRmllbGQub25ibHVyID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgcmVuYW1lRm4oc2VsZWN0ZWROb2RlKVxyXG4gICAgfTtcclxuICAgIHNlbGVjdGVkTm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChyZW5hbWVGaWVsZCwgc2VsZWN0ZWROb2RlKTtcclxuICAgIHJlbmFtZUZpZWxkLmZvY3VzKCk7XHJcbiAgICByZW5hbWVGaWVsZC5zZWxlY3QoKTtcclxuICB9XHJcblxyXG4gIHNob3dQZXJtaXNzaW9uc0RpYWxvZyhyaWdodENsaWNrZWRGaWxlOiBhbnkpIHtcclxuICAgIGNvbnN0IGZpbGVQcm9wQ29uZmlnID0gbmV3IE1hdERpYWxvZ0NvbmZpZygpO1xyXG4gICAgZmlsZVByb3BDb25maWcuZGF0YSA9IHtcclxuICAgICAgZXZlbnQ6IHJpZ2h0Q2xpY2tlZEZpbGVcclxuICAgIH1cclxuICAgIGZpbGVQcm9wQ29uZmlnLndpZHRoID0gJzQwMHB4JztcclxuXHJcbiAgICBjb25zdCBkaWFsb2dSZWYgPSB0aGlzLmRpYWxvZy5vcGVuKEZpbGVQZXJtaXNzaW9uc01vZGFsLCBmaWxlUHJvcENvbmZpZyk7XHJcbiAgICBkaWFsb2dSZWYuYWZ0ZXJDbG9zZWQoKS5zdWJzY3JpYmUoKHJlcz86IGJvb2xlYW4pID0+IHtcclxuICAgICAgaWYgKHJlcykge1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQocmlnaHRDbGlja2VkRmlsZSwgdHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgc2hvd093bmVyRGlhbG9nKHJpZ2h0Q2xpY2tlZEZpbGU6IGFueSkge1xyXG4gICAgY29uc3QgZmlsZVByb3BDb25maWcgPSBuZXcgTWF0RGlhbG9nQ29uZmlnKCk7XHJcbiAgICBmaWxlUHJvcENvbmZpZy5kYXRhID0ge1xyXG4gICAgICBldmVudDogcmlnaHRDbGlja2VkRmlsZVxyXG4gICAgfVxyXG4gICAgZmlsZVByb3BDb25maWcubWF4V2lkdGggPSAnNDAwcHgnO1xyXG5cclxuICAgIGNvbnN0IGRpYWxvZ1JlZiA9IHRoaXMuZGlhbG9nLm9wZW4oRmlsZU93bmVyc2hpcE1vZGFsLCBmaWxlUHJvcENvbmZpZyk7XHJcbiAgICBkaWFsb2dSZWYuYWZ0ZXJDbG9zZWQoKS5zdWJzY3JpYmUoKHJlcz86IGJvb2xlYW4pID0+IHtcclxuICAgICAgaWYgKHJlcykge1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQocmlnaHRDbGlja2VkRmlsZSwgdHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgc2hvd0RlbGV0ZURpYWxvZyhyaWdodENsaWNrZWRGaWxlOiBhbnkpIHtcclxuICAgIGlmICh0aGlzLmNoZWNrSWZJbkRlbGV0aW9uUXVldWVBbmRNZXNzYWdlKHJpZ2h0Q2xpY2tlZEZpbGUucGF0aCwgXCJUaGlzIGlzIGFscmVhZHkgYmVpbmcgZGVsZXRlZC5cIikgPT0gdHJ1ZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZmlsZURlbGV0ZUNvbmZpZyA9IG5ldyBNYXREaWFsb2dDb25maWcoKTtcclxuICAgIGZpbGVEZWxldGVDb25maWcuZGF0YSA9IHtcclxuICAgICAgZXZlbnQ6IHJpZ2h0Q2xpY2tlZEZpbGUsXHJcbiAgICAgIHdpZHRoOiAnNjAwcHgnXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGZpbGVEZWxldGVSZWY6IE1hdERpYWxvZ1JlZjxEZWxldGVGaWxlTW9kYWw+ID0gdGhpcy5kaWFsb2cub3BlbihEZWxldGVGaWxlTW9kYWwsIGZpbGVEZWxldGVDb25maWcpO1xyXG4gICAgY29uc3QgZGVsZXRlRmlsZU9yRm9sZGVyID0gZmlsZURlbGV0ZVJlZi5jb21wb25lbnRJbnN0YW5jZS5vbkRlbGV0ZS5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICB0aGlzLmRlbGV0ZUZpbGVPckZvbGRlcihyaWdodENsaWNrZWRGaWxlKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgYXR0ZW1wdERvd25sb2FkKHJpZ2h0Q2xpY2tlZEZpbGU6IGFueSkge1xyXG4gICAgbGV0IHJlbW90ZVBhdGggPSByaWdodENsaWNrZWRGaWxlLnBhdGg7XHJcbiAgICBsZXQgZmlsZW5hbWUgPSByaWdodENsaWNrZWRGaWxlLm5hbWU7XHJcbiAgICBsZXQgZG93bmxvYWRPYmplY3QgPSByaWdodENsaWNrZWRGaWxlO1xyXG4gICAgbGV0IHVybDogc3RyaW5nID0gWm93ZVpMVVgudXJpQnJva2VyLnVuaXhGaWxlVXJpKCdjb250ZW50cycsIHJlbW90ZVBhdGgpO1xyXG5cclxuICAgIHRoaXMuZG93bmxvYWRTZXJ2aWNlLmZldGNoRmlsZUhhbmRsZXIodXJsLCBmaWxlbmFtZSwgZG93bmxvYWRPYmplY3QpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAvLyBUT0RPOiBEb3dubG9hZCBxdWV1ZSBjb2RlIGZvciBwcm9ncmVzcyBiYXIgY291bGQgZ28gaGVyZVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBzaG93Q3JlYXRlRm9sZGVyRGlhbG9nKHJpZ2h0Q2xpY2tlZEZpbGU6IGFueSkge1xyXG4gICAgaWYgKHJpZ2h0Q2xpY2tlZEZpbGUucGF0aCkgeyAvLyBJZiB0aGlzIGNhbWUgZnJvbSBhIG5vZGUgb2JqZWN0XHJcbiAgICAgIGlmICh0aGlzLmNoZWNrSWZJbkRlbGV0aW9uUXVldWVBbmRNZXNzYWdlKHJpZ2h0Q2xpY2tlZEZpbGUucGF0aCwgXCJDYW5ub3QgY3JlYXRlIGEgZGlyZWN0b3J5IGluc2lkZSBhIGRpcmVjdG9yeSBxdWV1ZWQgZm9yIGRlbGV0aW9uLlwiKSA9PSB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgeyAvLyBPciBpZiB0aGlzIGlzIGp1c3QgYSBwYXRoXHJcbiAgICAgIGlmICh0aGlzLmNoZWNrSWZJbkRlbGV0aW9uUXVldWVBbmRNZXNzYWdlKHJpZ2h0Q2xpY2tlZEZpbGUsIFwiQ2Fubm90IGNyZWF0ZSBhIGRpcmVjdG9yeSBpbnNpZGUgYSBkaXJlY3RvcnkgcXVldWVkIGZvciBkZWxldGlvbi5cIikgPT0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZvbGRlckNyZWF0ZUNvbmZpZyA9IG5ldyBNYXREaWFsb2dDb25maWcoKTtcclxuICAgIGZvbGRlckNyZWF0ZUNvbmZpZy5kYXRhID0ge1xyXG4gICAgICBldmVudDogcmlnaHRDbGlja2VkRmlsZSxcclxuICAgICAgd2lkdGg6ICc2MDBweCdcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZmlsZUNyZWF0ZVJlZjogTWF0RGlhbG9nUmVmPENyZWF0ZUZvbGRlck1vZGFsPiA9IHRoaXMuZGlhbG9nLm9wZW4oQ3JlYXRlRm9sZGVyTW9kYWwsIGZvbGRlckNyZWF0ZUNvbmZpZyk7XHJcbiAgICBjb25zdCBjcmVhdGVGb2xkZXIgPSBmaWxlQ3JlYXRlUmVmLmNvbXBvbmVudEluc3RhbmNlLm9uQ3JlYXRlLnN1YnNjcmliZShvbkNyZWF0ZVJlc3BvbnNlID0+IHtcclxuICAgICAgLyogcGF0aEFuZE5hbWUgLSBQYXRoIGFuZCBuYW1lIG9idGFpbmVkIGZyb20gY3JlYXRlIGZvbGRlciBwcm9tcHRcclxuICAgICAgdXBkYXRlRXhpc3RpbmdUcmVlIC0gU2hvdWxkIHRoZSBleGlzdGluZyB0cmVlIHVwZGF0ZSBvciBmZXRjaCBhIG5ldyBvbmUgKi9cclxuICAgICAgdGhpcy5jcmVhdGVGb2xkZXIob25DcmVhdGVSZXNwb25zZS5nZXQoXCJwYXRoQW5kTmFtZVwiKSwgcmlnaHRDbGlja2VkRmlsZSwgb25DcmVhdGVSZXNwb25zZS5nZXQoXCJ1cGRhdGVFeGlzdGluZ1RyZWVcIikpO1xyXG4gICAgICAvLyBlbWl0IHRoZSBldmVudCB3aXRoIG5vZGUgaW5mbyBvbmx5IHdoZW4gbm9kZSBpcyByaWdodCBjbGlja2VkIGFuZCBub3Qgb24gZmlsZSB0cmVlIHBhbmVsXHJcbiAgICAgIHRoaXMubmV3Rm9sZGVyQ2xpY2suZW1pdCh0aGlzLnJpZ2h0Q2xpY2tlZEV2ZW50Lm5vZGUgPyB0aGlzLnJpZ2h0Q2xpY2tlZEV2ZW50Lm5vZGUgOiAnJyk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHNob3dDcmVhdGVGaWxlRGlhbG9nKHJpZ2h0Q2xpY2tlZEZpbGU6IGFueSkge1xyXG4gICAgaWYgKHJpZ2h0Q2xpY2tlZEZpbGUucGF0aCkgeyAvLyBJZiB0aGlzIGNhbWUgZnJvbSBhIG5vZGUgb2JqZWN0XHJcbiAgICAgIGlmICh0aGlzLmNoZWNrSWZJbkRlbGV0aW9uUXVldWVBbmRNZXNzYWdlKHJpZ2h0Q2xpY2tlZEZpbGUucGF0aCwgXCJDYW5ub3QgY3JlYXRlIGEgZmlsZSBpbnNpZGUgYSBkaXJlY3RvcnkgcXVldWVkIGZvciBkZWxldGlvbi5cIikgPT0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHsgLy8gT3IgaWYgdGhpcyBpcyBqdXN0IGEgcGF0aFxyXG4gICAgICBpZiAodGhpcy5jaGVja0lmSW5EZWxldGlvblF1ZXVlQW5kTWVzc2FnZShyaWdodENsaWNrZWRGaWxlLCBcIkNhbm5vdCBjcmVhdGUgYSBmaWxlIGluc2lkZSBhIGRpcmVjdG9yeSBxdWV1ZWQgZm9yIGRlbGV0aW9uLlwiKSA9PSB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZmlsZUNyZWF0ZUNvbmZpZyA9IG5ldyBNYXREaWFsb2dDb25maWcoKTtcclxuICAgIGZpbGVDcmVhdGVDb25maWcuZGF0YSA9IHtcclxuICAgICAgZXZlbnQ6IHJpZ2h0Q2xpY2tlZEZpbGUsXHJcbiAgICAgIHdpZHRoOiAnNjAwcHgnXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGZpbGVDcmVhdGVSZWY6IE1hdERpYWxvZ1JlZjxDcmVhdGVGaWxlTW9kYWw+ID0gdGhpcy5kaWFsb2cub3BlbihDcmVhdGVGaWxlTW9kYWwsIGZpbGVDcmVhdGVDb25maWcpO1xyXG4gICAgY29uc3QgY3JlYXRlRmlsZSA9IGZpbGVDcmVhdGVSZWYuY29tcG9uZW50SW5zdGFuY2Uub25GaWxlQ3JlYXRlLnN1YnNjcmliZShvbkZpbGVDcmVhdGVSZXNwb25zZSA9PiB7XHJcbiAgICAgIC8qIHBhdGhBbmROYW1lIC0gUGF0aCBhbmQgbmFtZSBvYnRhaW5lZCBmcm9tIGNyZWF0ZSBmb2xkZXIgcHJvbXB0XHJcbiAgICAgIHVwZGF0ZUV4aXN0aW5nVHJlZSAtIFNob3VsZCB0aGUgZXhpc3RpbmcgdHJlZSB1cGRhdGUgb3IgZmV0Y2ggYSBuZXcgb25lICovXHJcbiAgICAgIHRoaXMuY3JlYXRlRmlsZShvbkZpbGVDcmVhdGVSZXNwb25zZS5nZXQoXCJwYXRoQW5kTmFtZVwiKSwgcmlnaHRDbGlja2VkRmlsZSwgb25GaWxlQ3JlYXRlUmVzcG9uc2UuZ2V0KFwidXBkYXRlRXhpc3RpbmdUcmVlXCIpKTtcclxuICAgICAgLy8gZW1pdCB0aGUgZXZlbnQgd2l0aCBub2RlIGluZm8gb25seSB3aGVuIG5vZGUgaXMgcmlnaHQgY2xpY2tlZCBhbmQgbm90IG9uIGZpbGUgdHJlZSBwYW5lbFxyXG4gICAgICB0aGlzLm5ld0ZpbGVDbGljay5lbWl0KHRoaXMucmlnaHRDbGlja2VkRXZlbnQubm9kZSA/IHRoaXMucmlnaHRDbGlja2VkRXZlbnQubm9kZSA6ICcnKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgc2hvd1VwbG9hZERpYWxvZyhyaWdodENsaWNrZWRGaWxlOiBhbnkpIHtcclxuICAgIGNvbnN0IGZvbGRlclVwbG9hZENvbmZpZyA9IG5ldyBNYXREaWFsb2dDb25maWcoKTtcclxuICAgIGZvbGRlclVwbG9hZENvbmZpZy5kYXRhID0ge1xyXG4gICAgICBldmVudDogcmlnaHRDbGlja2VkRmlsZSB8fCB0aGlzLnBhdGgsXHJcbiAgICAgIHdpZHRoOiAnNjAwcHgnXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGZpbGVVcGxvYWRSZWY6IE1hdERpYWxvZ1JlZjxVcGxvYWRNb2RhbD4gPSB0aGlzLmRpYWxvZy5vcGVuKFVwbG9hZE1vZGFsLCBmb2xkZXJVcGxvYWRDb25maWcpO1xyXG4gICAgY29uc3QgdXBsb2FkID0gZmlsZVVwbG9hZFJlZi5jb21wb25lbnRJbnN0YW5jZS5vblVwbG9hZC5zdWJzY3JpYmUob25VcGxvYWRSZXNwb25zZSA9PiB7XHJcbiAgICAgIGlmIChyaWdodENsaWNrZWRGaWxlICYmIHJpZ2h0Q2xpY2tlZEZpbGUucGF0aCAmJiByaWdodENsaWNrZWRGaWxlLnBhdGggIT0gdGhpcy5wYXRoKSB7XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZChyaWdodENsaWNrZWRGaWxlLCB0cnVlKTtcclxuICAgICAgICB0aGlzLmZpbGVVcGxvYWRlZC5lbWl0KHRoaXMucmlnaHRDbGlja2VkRXZlbnQubm9kZS5wYXRoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmRpc3BsYXlUcmVlKHRoaXMucGF0aCwgZmFsc2UpO1xyXG4gICAgICAgIHRoaXMuZmlsZVVwbG9hZGVkLmVtaXQodGhpcy5wYXRoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBjb3B5TGluayhyaWdodENsaWNrZWRGaWxlOiBhbnkpIHtcclxuICAgIGxldCBsaW5rID0gJyc7XHJcbiAgICBpZiAocmlnaHRDbGlja2VkRmlsZS5kaXJlY3RvcnkpIHtcclxuICAgICAgbGluayA9IGAke3dpbmRvdy5sb2NhdGlvbi5vcmlnaW59JHt3aW5kb3cubG9jYXRpb24ucGF0aG5hbWV9P3BsdWdpbklkPSR7dGhpcy5wbHVnaW5EZWZpbml0aW9uLmdldEJhc2VQbHVnaW4oKS5nZXRJZGVudGlmaWVyKCl9OmRhdGE6JHtlbmNvZGVVUklDb21wb25lbnQoYHtcInR5cGVcIjpcIm9wZW5EaXJcIixcIm5hbWVcIjpcIiR7cmlnaHRDbGlja2VkRmlsZS5wYXRofVwiLFwidG9nZ2xlVHJlZVwiOmZhbHNlfWApfWA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsaW5rID0gYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0ke3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZX0/cGx1Z2luSWQ9JHt0aGlzLnBsdWdpbkRlZmluaXRpb24uZ2V0QmFzZVBsdWdpbigpLmdldElkZW50aWZpZXIoKX06ZGF0YToke2VuY29kZVVSSUNvbXBvbmVudChge1widHlwZVwiOlwib3BlbkZpbGVcIixcIm5hbWVcIjpcIiR7cmlnaHRDbGlja2VkRmlsZS5wYXRofVwiLFwidG9nZ2xlVHJlZVwiOnRydWV9YCl9YDtcclxuICAgIH1cclxuICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGxpbmspLnRoZW4oKCkgPT4ge1xyXG4gICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkxpbmsgY29waWVkIHRvIGNsaXBib2FyZFwiKTtcclxuICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiQ29waWVkIGxpbmsgc3VjY2Vzc2Z1bGx5XCIsICdEaXNtaXNzJywgcXVpY2tTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgfSkuY2F0Y2goKCkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGNvcHkgTGluayB0byBjbGlwYm9hcmRcIik7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGNvcHlQYXRoKHJpZ2h0Q2xpY2tlZEZpbGU6IGFueSkge1xyXG4gICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQocmlnaHRDbGlja2VkRmlsZS5wYXRoKS50aGVuKCgpID0+IHtcclxuICAgICAgdGhpcy5sb2cuZGVidWcoXCJQYXRoIGNvcGllZCB0byBjbGlwYm9hcmRcIik7XHJcbiAgICB9KS5jYXRjaCgoKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gY29weSBwYXRoIHRvIGNsaXBib2FyZFwiKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgc2hvd1RhZ2dpbmdEaWFsb2cocmlnaHRDbGlja2VkRmlsZTogYW55KSB7XHJcbiAgICBjb25zdCBjb25maWcgPSBuZXcgTWF0RGlhbG9nQ29uZmlnKCk7XHJcbiAgICBjb25maWcuZGF0YSA9IHtcclxuICAgICAgbm9kZTogcmlnaHRDbGlja2VkRmlsZVxyXG4gICAgfVxyXG4gICAgY29uZmlnLm1heFdpZHRoID0gJzQ1MHB4JztcclxuICAgIGNvbnN0IGRpYWxvZ1JlZiA9IHRoaXMuZGlhbG9nLm9wZW4oRmlsZVRhZ2dpbmdNb2RhbCwgY29uZmlnKTtcclxuICAgIGRpYWxvZ1JlZi5hZnRlckNsb3NlZCgpLnN1YnNjcmliZSgocmVzPzogYm9vbGVhbikgPT4ge1xyXG4gICAgICBpZiAocmVzKSB7XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZChyaWdodENsaWNrZWRGaWxlLCB0cnVlKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB0b2dnbGVTZWFyY2goKSB7XHJcbiAgICB0aGlzLnNob3dTZWFyY2ggPSAhdGhpcy5zaG93U2VhcmNoO1xyXG4gICAgaWYgKHRoaXMuc2hvd1NlYXJjaCkge1xyXG4gICAgICB0aGlzLmZvY3VzU2VhcmNoSW5wdXQoKTtcclxuICAgICAgdGhpcy5kYXRhQ2FjaGVkID0gXy5jbG9uZURlZXAodGhpcy5kYXRhKTsgLy8gV2Ugd2FudCBhIGRlZXAgY2xvbmUgc28gd2UgY2FuIG1vZGlmeSB0aGlzLmRhdGEgdy9vIGNoYW5naW5nIHRoaXMuZGF0YUNhY2hlZFxyXG4gICAgICBpZiAodGhpcy5zZWFyY2hDdHJsLnZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5zZWFyY2hJbnB1dENoYW5nZWQodGhpcy5zZWFyY2hDdHJsLnZhbHVlKVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAodGhpcy5kYXRhQ2FjaGVkKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5kYXRhQ2FjaGVkOyAvLyBXZSBkb24ndCBjYXJlIGFib3V0IGRlZXAgY2xvbmUgYmVjYXVzZSB3ZSBqdXN0IHdhbnQgdG8gZ2V0IGRhdGFDYWNoZWQgYmFja1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBUT0RPOiBUaGVyZSdzIGFuIGFwcDJhcHAgb3Bwb3J0dW5pdHkgaGVyZSwgd2hlcmUgYW4gYXBwIHVzaW5nIHRoZSBGaWxlIFRyZWUgY291bGQgc3Bhd24gd2l0aCBhIHByZS1maWx0ZXJlZCBsaXN0IG9mIG5vZGVzXHJcbiAgZm9jdXNTZWFyY2hJbnB1dChhdHRlbXB0Q291bnQ/OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLnNlYXJjaFVTUykge1xyXG4gICAgICB0aGlzLnNlYXJjaFVTUy5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IG1heEF0dGVtcHRzID0gMTA7XHJcbiAgICBpZiAodHlwZW9mIGF0dGVtcHRDb3VudCAhPT0gJ251bWJlcicpIHtcclxuICAgICAgYXR0ZW1wdENvdW50ID0gbWF4QXR0ZW1wdHM7XHJcbiAgICB9XHJcbiAgICBpZiAoYXR0ZW1wdENvdW50ID4gMCkge1xyXG4gICAgICBhdHRlbXB0Q291bnQtLTtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmZvY3VzU2VhcmNoSW5wdXQoYXR0ZW1wdENvdW50KSwgMTAwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIG9uTmV3RmlsZUNsaWNrKCRldmVudDogYW55KTogdm9pZCB7XHJcbiAgLy8gICB0aGlzLm5ld0ZpbGVDbGljay5lbWl0KCRldmVudCk7XHJcbiAgLy8gfVxyXG5cclxuICBvbk5vZGVDbGljaygkZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgdGhpcy5wYXRoID0gdGhpcy5wYXRoLnJlcGxhY2UoL1xcLyQvLCAnJyk7XHJcbiAgICB0aGlzLnNlbGVjdGVkTm9kZSA9ICRldmVudC5ub2RlO1xyXG4gICAgaWYgKCRldmVudC5ub2RlLmRhdGEgPT09ICdGb2xkZXInKSB7XHJcbiAgICAgIGlmICh0aGlzLmNoZWNrSWZJbkRlbGV0aW9uUXVldWVBbmRNZXNzYWdlKCRldmVudC5ub2RlLnBhdGgsIFwiQ2Fubm90IG9wZW4gYSBkaXJlY3RvcnkgcXVldWVkIGZvciBkZWxldGlvbi5cIikgPT0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmFkZENoaWxkKCRldmVudC5ub2RlKTtcclxuICAgICAgdGhpcy5ub2RlQ2xpY2suZW1pdCgkZXZlbnQubm9kZSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMuY2hlY2tJZkluRGVsZXRpb25RdWV1ZUFuZE1lc3NhZ2UoJGV2ZW50Lm5vZGUucGF0aCwgXCJDYW5ub3Qgb3BlbiBhIGZpbGUgcXVldWVkIGZvciBkZWxldGlvbi5cIikgPT0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm5vZGVDbGljay5lbWl0KCRldmVudC5ub2RlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG9uTm9kZURibENsaWNrKCRldmVudDogYW55KTogdm9pZCB7XHJcbiAgICBsZXQgdXBkYXRlVHJlZSA9IGZhbHNlOyAvLyBBIGRvdWJsZSBjbGljayBkcmlsbHMgaW50byBhIGZvbGRlciwgc28gd2UgbWFrZSBhIGZyZXNoIHF1ZXJ5IGluc3RlYWQgb2YgdXBkYXRlXHJcbiAgICB0aGlzLmRpc3BsYXlUcmVlKCRldmVudC5ub2RlLnBhdGgsIHVwZGF0ZVRyZWUpO1xyXG4gICAgdGhpcy5ub2RlRGJsQ2xpY2suZW1pdCgkZXZlbnQubm9kZSk7XHJcbiAgICB0aGlzLnNlbGVjdGVkTm9kZSA9ICRldmVudC5ub2RlO1xyXG4gIH1cclxuXHJcbiAgb25Ob2RlUmlnaHRDbGljaygkZXZlbnQ6IGFueSkge1xyXG4gICAgbGV0IG5vZGUgPSAkZXZlbnQubm9kZTtcclxuICAgIGxldCByaWdodENsaWNrUHJvcGVydGllcztcclxuXHJcbiAgICBpZiAobm9kZS5kaXJlY3RvcnkpIHtcclxuICAgICAgcmlnaHRDbGlja1Byb3BlcnRpZXMgPSB0aGlzLnJpZ2h0Q2xpY2tQcm9wZXJ0aWVzRm9sZGVyO1xyXG4gICAgICB0aGlzLnNlbGVjdGVkTm9kZSA9IG5vZGU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByaWdodENsaWNrUHJvcGVydGllcyA9IHRoaXMucmlnaHRDbGlja1Byb3BlcnRpZXNGaWxlO1xyXG4gICAgICB0aGlzLnNlbGVjdGVkTm9kZSA9IG5vZGUucGFyZW50O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLndpbmRvd0FjdGlvbnMpIHtcclxuICAgICAgbGV0IGRpZENvbnRleHRNZW51U3Bhd24gPSB0aGlzLndpbmRvd0FjdGlvbnMuc3Bhd25Db250ZXh0TWVudSgkZXZlbnQub3JpZ2luYWxFdmVudC5jbGllbnRYLCAkZXZlbnQub3JpZ2luYWxFdmVudC5jbGllbnRZLCByaWdodENsaWNrUHJvcGVydGllcywgdHJ1ZSk7XHJcbiAgICAgIC8vIFRPRE86IEZpeCBab3dlJ3MgY29udGV4dCBtZW51IHN1Y2ggdGhhdCBpZiBpdCBkb2Vzbid0IGhhdmUgZW5vdWdoIHNwYWNlIHRvIHNwYXduLCBpdCBtb3ZlcyBpdHNlbGYgYWNjb3JkaW5nbHkgdG8gc3Bhd24uXHJcbiAgICAgIGlmICghZGlkQ29udGV4dE1lbnVTcGF3bikgeyAvLyBJZiBjb250ZXh0IG1lbnUgZmFpbGVkIHRvIHNwYXduLi4uXHJcbiAgICAgICAgbGV0IGhlaWdodEFkanVzdG1lbnQgPSAkZXZlbnQub3JpZ2luYWxFdmVudC5jbGllbnRZIC0gMjU7IC8vIEJ1bXAgaXQgdXAgMjVweFxyXG4gICAgICAgIGRpZENvbnRleHRNZW51U3Bhd24gPSB0aGlzLndpbmRvd0FjdGlvbnMuc3Bhd25Db250ZXh0TWVudSgkZXZlbnQub3JpZ2luYWxFdmVudC5jbGllbnRYLCBoZWlnaHRBZGp1c3RtZW50LCByaWdodENsaWNrUHJvcGVydGllcywgdHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUgPSBub2RlO1xyXG4gICAgdGhpcy5yaWdodENsaWNrZWRFdmVudCA9ICRldmVudDtcclxuICAgIHRoaXMucmlnaHRDbGljay5lbWl0KCRldmVudC5ub2RlKTtcclxuICAgICRldmVudC5vcmlnaW5hbEV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgfVxyXG5cclxuICBvblBhbmVsUmlnaHRDbGljaygkZXZlbnQ6IGFueSkge1xyXG4gICAgaWYgKHRoaXMud2luZG93QWN0aW9ucykge1xyXG4gICAgICBsZXQgZGlkQ29udGV4dE1lbnVTcGF3biA9IHRoaXMud2luZG93QWN0aW9ucy5zcGF3bkNvbnRleHRNZW51KCRldmVudC5jbGllbnRYLCAkZXZlbnQuY2xpZW50WSwgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc1BhbmVsLCB0cnVlKTtcclxuICAgICAgLy8gVE9ETzogRml4IFpvd2UncyBjb250ZXh0IG1lbnUgc3VjaCB0aGF0IGlmIGl0IGRvZXNuJ3QgaGF2ZSBlbm91Z2ggc3BhY2UgdG8gc3Bhd24sIGl0IG1vdmVzIGl0c2VsZiBhY2NvcmRpbmdseSB0byBzcGF3bi5cclxuICAgICAgaWYgKCFkaWRDb250ZXh0TWVudVNwYXduKSB7IC8vIElmIGNvbnRleHQgbWVudSBmYWlsZWQgdG8gc3Bhd24uLi5cclxuICAgICAgICBsZXQgaGVpZ2h0QWRqdXN0bWVudCA9ICRldmVudC5jbGllbnRZIC0gMjU7IC8vIEJ1bXAgaXQgdXAgMjVweFxyXG4gICAgICAgIGRpZENvbnRleHRNZW51U3Bhd24gPSB0aGlzLndpbmRvd0FjdGlvbnMuc3Bhd25Db250ZXh0TWVudSgkZXZlbnQuY2xpZW50WCwgaGVpZ2h0QWRqdXN0bWVudCwgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc1BhbmVsLCB0cnVlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5yaWdodENsaWNrZWRFdmVudCA9ICRldmVudDtcclxuICB9XHJcblxyXG4gIG9uUGF0aENoYW5nZWQoJGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMucGF0aENoYW5nZWQuZW1pdCgkZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgb25EYXRhQ2hhbmdlZCgkZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgdGhpcy5kYXRhQ2hhbmdlZC5lbWl0KCRldmVudCk7XHJcbiAgfVxyXG5cclxuICBzb3J0Rm4oYTogYW55LCBiOiBhbnkpIHtcclxuICAgIGlmIChhLmRpcmVjdG9yeSAhPT0gYi5kaXJlY3RvcnkpIHtcclxuICAgICAgaWYgKGEuZGlyZWN0b3J5ID09PSB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoYS5uYW1lLnRvTG93ZXJDYXNlKCkgPCBiLm5hbWUudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29sbGFwc2VUcmVlKCk6IHZvaWQge1xyXG4gICAgbGV0IGRhdGFBcnJheSA9IHRoaXMuZGF0YTtcclxuICAgIHRoaXMuc2VsZWN0ZWROb2RlID0gbnVsbDtcclxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBkYXRhQXJyYXkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKHRoaXMuZGF0YVtpXS5leHBhbmRlZCA9PSB0cnVlKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhW2ldLmV4cGFuZGVkID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMudHJlZUNvbXBvbmVudC51bnNlbGVjdE5vZGUoKTtcclxuICB9XHJcblxyXG4gIC8vRGlzcGxheXMgdGhlIHN0YXJ0aW5nIGZpbGUgc3RydWN0dXJlIG9mICdwYXRoJy4gV2hlbiB1cGRhdGUgPT0gdHJ1ZSwgdHJlZSB3aWxsIGJlIHVwZGF0ZWRcclxuICAvL2luc3RlYWQgb2YgcmVzZXQgdG8gJ3BhdGgnIChtZWFuaW5nIGN1cnJlbnRseSBvcGVuZWQgY2hpbGRyZW4gZG9uJ3QgZ2V0IHdpcGVkL2Nsb3NlZClcclxuICBwdWJsaWMgZGlzcGxheVRyZWUocGF0aDogc3RyaW5nLCB1cGRhdGU6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIC8vVG8gcmVkdWNlIHVuaW50ZW50aW9uYWwgYnVncyBieSBkZWZhdWx0aW5nIHRvIHJvb3QgZGlyZWN0b3J5IG9yIGRyb3BwaW5nIGlmIGNhbGxlciBzZW50IGFuIG9iamVjdCB3ZSdyZSBub3Qgc3VwcG9zZWQgdG8gYmUgdXNpbmdcclxuICAgIGlmIChwYXRoID09PSB1bmRlZmluZWQgfHwgcGF0aCA9PT0gJycpIHtcclxuICAgICAgcGF0aCA9IHRoaXMucm9vdDtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHBhdGggIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIHRoaXMubG9nLndhcm4oXCJUaGUgRlQgcmVjZWl2ZWQgYSBwYXRoIG9iamVjdCB0aGF0IHdhc24ndCBhIHN0cmluZyBzbyBpdCBjb3VsZG4ndCBjb250aW51ZSwgb2JqZWN0PVwiLCBwYXRoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWROb2RlID0gbnVsbDtcclxuICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgIGxldCB1c3NEYXRhID0gdGhpcy51c3NTcnYuZ2V0RmlsZUNvbnRlbnRzKHBhdGgpO1xyXG4gICAgdXNzRGF0YS5zdWJzY3JpYmUoe1xyXG4gICAgICBuZXh0OiAoZmlsZXMpID0+IHtcclxuICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIGlmICghZmlsZXMgfHwgIWZpbGVzPy5lbnRyaWVzKSB7IC8vIFJlZHVjZXMgY29uc29sZSBlcnJvcnMgYW5kIG90aGVyIGJ1Z3MgYnkgYWNjaWRlbnRhbGx5IHByb3ZpZGluZyBhIFVTUyBmaWxlIGFzIFVTUyBwYXRoXHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbGVzLmVudHJpZXMuc29ydCh0aGlzLnNvcnRGbik7XHJcbiAgICAgICAgdGhpcy5vbkRhdGFDaGFuZ2VkKGZpbGVzLmVudHJpZXMpO1xyXG4gICAgICAgIGNvbnN0IHRlbXBDaGlsZHJlbjogRmlsZVRyZWVOb2RlW10gPSBbXTtcclxuICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgZmlsZXMuZW50cmllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgaWYgKGZpbGVzLmVudHJpZXNbaV0uZGlyZWN0b3J5KSB7XHJcbiAgICAgICAgICAgIGZpbGVzLmVudHJpZXNbaV0uY2hpbGRyZW4gPSBbXTtcclxuICAgICAgICAgICAgZmlsZXMuZW50cmllc1tpXS5kYXRhID0gXCJGb2xkZXJcIjtcclxuICAgICAgICAgICAgZmlsZXMuZW50cmllc1tpXS5jb2xsYXBzZWRJY29uID0gXCJmYSBmYS1mb2xkZXJcIjtcclxuICAgICAgICAgICAgZmlsZXMuZW50cmllc1tpXS5leHBhbmRlZEljb24gPSBcImZhIGZhLWZvbGRlci1vcGVuXCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZmlsZXMuZW50cmllc1tpXS5pdGVtcyA9IHt9O1xyXG4gICAgICAgICAgICBmaWxlcy5lbnRyaWVzW2ldLmljb24gPSBcImZhIGZhLWZpbGVcIjtcclxuICAgICAgICAgICAgZmlsZXMuZW50cmllc1tpXS5kYXRhID0gXCJGaWxlXCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmaWxlcy5lbnRyaWVzW2ldLmxhYmVsID0gZmlsZXMuZW50cmllc1tpXS5uYW1lO1xyXG4gICAgICAgICAgZmlsZXMuZW50cmllc1tpXS5pZCA9IGk7XHJcbiAgICAgICAgICB0ZW1wQ2hpbGRyZW4ucHVzaChmaWxlcy5lbnRyaWVzW2ldKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBpZiAodXBkYXRlID09IHRydWUpIHsvL1RyZWUgaXMgZGlzcGxheWVkIHRvIHVwZGF0ZSBleGlzdGluZyBvcGVuZWQgbm9kZXMsIHdoaWxlIG1haW50YWluaW5nIGN1cnJlbnRseSBvcGVuZWQgdHJlZXMgXHJcblxyXG4gICAgICAgICAgbGV0IGluZGV4QXJyYXk6IG51bWJlcltdO1xyXG4gICAgICAgICAgbGV0IGRhdGFBcnJheTogRmlsZVRyZWVOb2RlW107Ly9yZXByZXNlbnRzIHRoZSB3b3JraW5nIEZpbGVUcmVlTm9kZVtdIHRoYXQgd2lsbCBldmVudHVhbGx5IGJlIGFkZGVkIHRvIHRlbXBDaGlsZHJlbiBhbmQgbWFrZSB1cCB0aGUgdHJlZVxyXG4gICAgICAgICAgbGV0IG5ldHdvcmtBcnJheTogRmlsZVRyZWVOb2RlW107Ly9yZXByZXNlbnRzIHRoZSBGaWxlVHJlZU5vZGVbXSBvYnRhaW5lZCBmcm9tIHRoZSB1c3Mgc2VydmVyLCB3aWxsIGl0ZXJhdGl2ZWx5IHJlcGxhY2UgZGF0YUFycmF5IGFzIG5lZWQgYmVcclxuICAgICAgICAgIGxldCBwYXJlbnROb2RlOiBGaWxlVHJlZU5vZGU7XHJcbiAgICAgICAgICBpbmRleEFycmF5ID0gWzBdO1xyXG4gICAgICAgICAgZGF0YUFycmF5ID0gdGhpcy5kYXRhO1xyXG4gICAgICAgICAgbmV0d29ya0FycmF5ID0gdGVtcENoaWxkcmVuO1xyXG4gICAgICAgICAgd2hpbGUgKGluZGV4QXJyYXlbaW5kZXhBcnJheS5sZW5ndGggLSAxXSA8PSBkYXRhQXJyYXkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIC8vR28gYmFjayB1cCBhIGxheWVyXHJcbiAgICAgICAgICAgIGlmIChpbmRleEFycmF5W2luZGV4QXJyYXkubGVuZ3RoIC0gMV0gPT0gZGF0YUFycmF5Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgIGluZGV4QXJyYXkucG9wKCk7XHJcblxyXG4gICAgICAgICAgICAgIGlmIChwYXJlbnROb2RlICE9PSB1bmRlZmluZWQgJiYgcGFyZW50Tm9kZS5wYXJlbnQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgcGFyZW50Tm9kZSA9IHBhcmVudE5vZGUucGFyZW50O1xyXG4gICAgICAgICAgICAgICAgZGF0YUFycmF5ID0gcGFyZW50Tm9kZS5jaGlsZHJlbjtcclxuICAgICAgICAgICAgICAgIG5ldHdvcmtBcnJheSA9IGRhdGFBcnJheTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGFyZW50Tm9kZSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0ZW1wQ2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocGFyZW50Tm9kZS5sYWJlbCA9PSB0ZW1wQ2hpbGRyZW5baV0ubGFiZWwgfHwgcGFyZW50Tm9kZS5jaGlsZHJlbiA9PSB0ZW1wQ2hpbGRyZW5baV0uY2hpbGRyZW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgIHRlbXBDaGlsZHJlbltpXSA9IHBhcmVudE5vZGU7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGRhdGFBcnJheSA9IHRoaXMuZGF0YTtcclxuICAgICAgICAgICAgICAgIG5ldHdvcmtBcnJheSA9IHRlbXBDaGlsZHJlbjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZGF0YUFycmF5W2luZGV4QXJyYXlbaW5kZXhBcnJheS5sZW5ndGggLSAxXV0gIT09IHVuZGVmaW5lZCAmJiBkYXRhQXJyYXlbaW5kZXhBcnJheVtpbmRleEFycmF5Lmxlbmd0aCAtIDFdXS5kYXRhID09ICdGb2xkZXInXHJcbiAgICAgICAgICAgICAgJiYgZGF0YUFycmF5W2luZGV4QXJyYXlbaW5kZXhBcnJheS5sZW5ndGggLSAxXV0uY2hpbGRyZW4gIT09IHVuZGVmaW5lZCAmJiBkYXRhQXJyYXlbaW5kZXhBcnJheVtpbmRleEFycmF5Lmxlbmd0aCAtIDFdXS5jaGlsZHJlbi5sZW5ndGggIT09IDApIHtcclxuICAgICAgICAgICAgICAvLy4uLiBpZiB0aGUgY2hpbGRyZW4gb2YgZGF0YUFycmF5IHdpdGggaW5kZXggaW4gbGFzdCBlbGVtZW50IG9mIGluZGV4QXJyYXkgYXJlIG5vdCBlbXB0eSwgZHJpbGwgaW50byB0aGVtIVxyXG4gICAgICAgICAgICAgIHBhcmVudE5vZGUgPSBkYXRhQXJyYXlbaW5kZXhBcnJheVtpbmRleEFycmF5Lmxlbmd0aCAtIDFdXTtcclxuICAgICAgICAgICAgICBkYXRhQXJyYXkgPSBwYXJlbnROb2RlLmNoaWxkcmVuO1xyXG4gICAgICAgICAgICAgIG5ldHdvcmtBcnJheSA9IGRhdGFBcnJheTtcclxuICAgICAgICAgICAgICBpbmRleEFycmF5W2luZGV4QXJyYXkubGVuZ3RoIC0gMV0rKztcclxuICAgICAgICAgICAgICBpbmRleEFycmF5LnB1c2goMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgZGF0YUFycmF5W2luZGV4QXJyYXlbaW5kZXhBcnJheS5sZW5ndGggLSAxXV0gPSBuZXR3b3JrQXJyYXlbaW5kZXhBcnJheVtpbmRleEFycmF5Lmxlbmd0aCAtIDFdXTtcclxuICAgICAgICAgICAgICBpbmRleEFycmF5W2luZGV4QXJyYXkubGVuZ3RoIC0gMV0rKzsvL2dvIHVwIGluZGV4IHRvIGNoZWNrIG5ldyBlbGVtZW50IGluIGRhdGEgYXJyYXlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJUcmVlIGhhcyBiZWVuIHVwZGF0ZWQuXCIpO1xyXG4gICAgICAgIHRoaXMubG9nLmRlYnVnKHRlbXBDaGlsZHJlbik7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gdGVtcENoaWxkcmVuO1xyXG4gICAgICAgIGlmICh0aGlzLnNob3dTZWFyY2gpIHtcclxuICAgICAgICAgIHRoaXMuZGF0YUNhY2hlZCA9IHRoaXMuZGF0YTsgLy8gVE9ETzogSW1wbGVtZW50IGxvZ2ljIHRvIHVwZGF0ZSB0cmVlIG9mIHNlYXJjaCBxdWVyaWVkIHJlc3VsdHMgKHNvIHJldmVydGluZyB0aGUgc2VhcmNoIGZpbHRlciBkb2Vzbid0IGZhaWwpXHJcbiAgICAgICAgICBpZiAoIXVwZGF0ZSkgeyAvLyBXaGVuIGEgZnJlc2ggdHJlZSBpcyByZXF1ZXN0ZWQsIGl0IHdpbGwgZ2V0IHJpZCBvZiB0aGlzLmRhdGEgc2VhcmNoIHF1ZXJpZWQgcmVzdWx0cywgc28gaGlkZSBzZWFyY2ggYmFyXHJcbiAgICAgICAgICAgIHRoaXMuc2hvd1NlYXJjaCA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnBhdGggPSBwYXRoO1xyXG5cclxuICAgICAgICB0aGlzLm9uUGF0aENoYW5nZWQodGhpcy5wYXRoKTtcclxuXHJcbiAgICAgICAgLy8gdGhpcy5wZXJzaXN0ZW50RGF0YVNlcnZpY2UuZ2V0RGF0YSgpXHJcbiAgICAgICAgLy8gICAgICAgLnN1YnNjcmliZShkYXRhID0+IHtcclxuICAgICAgICAvLyAgICAgICAgIHRoaXMuZGF0YU9iamVjdCA9IGRhdGEuY29udGVudHM7XHJcbiAgICAgICAgLy8gICAgICAgICB0aGlzLmRhdGFPYmplY3QudXNzSW5wdXQgPSB0aGlzLnBhdGg7XHJcbiAgICAgICAgLy8gICAgICAgICB0aGlzLmRhdGFPYmplY3QudXNzRGF0YSA9IHRoaXMuZGF0YTtcclxuICAgICAgICAvLyAgICAgICAgIHRoaXMucGVyc2lzdGVudERhdGFTZXJ2aWNlLnNldERhdGEodGhpcy5kYXRhT2JqZWN0KVxyXG4gICAgICAgIC8vICAgICAgICAgICAuc3Vic2NyaWJlKChyZXM6IGFueSkgPT4geyB9KTtcclxuICAgICAgICAvLyAgICAgICB9KVxyXG4gICAgICB9LFxyXG4gICAgICBlcnJvcjogKGVycm9yKSA9PiB7XHJcbiAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDMnKSB7IC8vUGVybWlzc2lvbiBkZW5pZWRcclxuICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbignRmFpbGVkIHRvIG9wZW46IFBlcm1pc3Npb24gZGVuaWVkLicsXHJcbiAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlcnJvci5zdGF0dXMgPT0gJzAnKSB7XHJcbiAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJGYWlsZWQgdG8gY29tbXVuaWNhdGUgd2l0aCB0aGUgQXBwIHNlcnZlcjogXCIgKyBlcnJvci5zdGF0dXMsXHJcbiAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChlcnJvci5zdGF0dXMgPT0gJzQwNCcpIHtcclxuICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkZpbGUvZm9sZGVyIG5vdCBmb3VuZC4gXCIgKyBlcnJvci5zdGF0dXMsXHJcbiAgICAgICAgICAgICdEaXNtaXNzJywgcXVpY2tTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJBbiB1bmtub3duIGVycm9yIG9jY3VycmVkOiBcIiArIGVycm9yLnN0YXR1cyxcclxuICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5sb2cuc2V2ZXJlKGVycm9yKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICB0aGlzLnJlZnJlc2hIaXN0b3J5KHRoaXMucGF0aCk7XHJcbiAgfVxyXG4gIHByaXZhdGUgcmVmcmVzaEhpc3RvcnkocGF0aDogc3RyaW5nKSB7XHJcbiAgICB0aGlzLnVzc1NlYXJjaEhpc3RvcnlTdWJzY3JpcHRpb24gPSB0aGlzLnVzc1NlYXJjaEhpc3RvcnlcclxuICAgICAgLnNhdmVTZWFyY2hIaXN0b3J5KHBhdGgpXHJcbiAgICAgIC5zdWJzY3JpYmUoKTtcclxuICB9XHJcblxyXG4gIGNsZWFyU2VhcmNoSGlzdG9yeSgpOiB2b2lkIHtcclxuICAgIHRoaXMudXNzU2VhcmNoSGlzdG9yeS5kZWxldGVTZWFyY2hIaXN0b3J5KCkuc3Vic2NyaWJlKCk7XHJcbiAgICB0aGlzLnVzc1NlYXJjaEhpc3Rvcnkub25Jbml0KFNFQVJDSF9JRCk7XHJcbiAgfVxyXG5cclxuICAvL0FkZHMgY2hpbGRyZW4gdG8gdGhlIGV4aXN0aW5nIG5vZGUgdG8gdXBkYXRlIHRoaXMuZGF0YSBhcnJheSwgXHJcbiAgLy9mZXRjaCAtIGZldGNoZXMgbmV3IGRhdGEsIGV4cGFuZCAtIGV4cGFuZHMgb3Igbm90IGZvbGRlciBub2RlIGFmdGVyIGZldGNoaW5nIG5ldyBkYXRhXHJcbiAgYWRkQ2hpbGQobm9kZTogYW55LCBmZXRjaD86IGJvb2xlYW4sIGV4cGFuZD86IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIGxldCBwYXRoID0gbm9kZS5wYXRoO1xyXG4gICAgaWYgKG5vZGUuY2hpbGRyZW4gJiYgbm9kZS5jaGlsZHJlbi5sZW5ndGggPiAwICYmICFmZXRjaCkge1xyXG4gICAgICAvL0lmIGFuIG9wZW5lZCBub2RlIGhhcyBjaGlsZHJlbiwgYW5kIHRoZSB1c2VyIGNsaWNrZWQgb24gaXQuLi5cclxuICAgICAgaWYgKG5vZGUuZXhwYW5kZWQpIHtcclxuICAgICAgICBub2RlLmV4cGFuZGVkID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgLy9JZiBhIGNsb3NlZCBub2RlIGhhcyBjaGlsZHJlbiwgYW5kIHRoZSB1c2VyIGNsaWNrZWQgb24gaXQuLi5cclxuICAgICAgZWxzZSB7XHJcbiAgICAgICAgbm9kZS5leHBhbmRlZCA9IHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRoaXMuc2hvd1NlYXJjaCkgeyAvLyBVcGRhdGUgbm9kZSBpbiBjYWNoZWQgZGF0YSBhcyB3ZWxsXHJcbiAgICAgICAgbGV0IG5vZGVDYWNoZWQgPSB0aGlzLmZpbmROb2RlQnlQYXRoKHRoaXMuZGF0YUNhY2hlZCwgcGF0aClbMF07XHJcbiAgICAgICAgaWYgKG5vZGVDYWNoZWQpIHtcclxuICAgICAgICAgIG5vZGVDYWNoZWQuZXhwYW5kZWQgPSBub2RlLmV4cGFuZGVkO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSAvL1doZW4gdGhlIHNlbGVjdGVkIG5vZGUgaGFzIG5vIGNoaWxkcmVuIG9yIHdlIHdhbnQgdG8gZmV0Y2ggbmV3IGRhdGFcclxuICAgIHtcclxuICAgICAgdGhpcy5yZWZyZXNoRmlsZU1ldGFkYXRhKG5vZGUpO1xyXG4gICAgICBub2RlLmV4cGFuZGVkID0gZXhwYW5kICE9PSB1bmRlZmluZWQgPyBleHBhbmQgOiB0cnVlO1xyXG4gICAgICBsZXQgdXNzRGF0YSA9IHRoaXMudXNzU3J2LmdldEZpbGVDb250ZW50cyhwYXRoKTtcclxuICAgICAgbGV0IHRlbXBDaGlsZHJlbjogRmlsZVRyZWVOb2RlW10gPSBbXTtcclxuICAgICAgdXNzRGF0YS5zdWJzY3JpYmUoXHJcbiAgICAgICAgZmlsZXMgPT4ge1xyXG4gICAgICAgICAgZmlsZXMuZW50cmllcy5zb3J0KHRoaXMuc29ydEZuKTtcclxuICAgICAgICAgIC8vVE9ETzogQ291bGQgYmUgdHVybmVkIGludG8gYSB1dGlsIHNlcnZpY2UuLi5cclxuICAgICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBmaWxlcy5lbnRyaWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChmaWxlcy5lbnRyaWVzW2ldLmRpcmVjdG9yeSkge1xyXG4gICAgICAgICAgICAgIGZpbGVzLmVudHJpZXNbaV0uY2hpbGRyZW4gPSBbXTtcclxuICAgICAgICAgICAgICBmaWxlcy5lbnRyaWVzW2ldLmRhdGEgPSBcIkZvbGRlclwiO1xyXG4gICAgICAgICAgICAgIGZpbGVzLmVudHJpZXNbaV0uY29sbGFwc2VkSWNvbiA9IFwiZmEgZmEtZm9sZGVyXCI7XHJcbiAgICAgICAgICAgICAgZmlsZXMuZW50cmllc1tpXS5leHBhbmRlZEljb24gPSBcImZhIGZhLWZvbGRlci1vcGVuXCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgZmlsZXMuZW50cmllc1tpXS5pdGVtcyA9IHt9O1xyXG4gICAgICAgICAgICAgIGZpbGVzLmVudHJpZXNbaV0uaWNvbiA9IFwiZmEgZmEtZmlsZVwiO1xyXG4gICAgICAgICAgICAgIGZpbGVzLmVudHJpZXNbaV0uZGF0YSA9IFwiRmlsZVwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZpbGVzLmVudHJpZXNbaV0ubGFiZWwgPSBmaWxlcy5lbnRyaWVzW2ldLm5hbWU7XHJcbiAgICAgICAgICAgIGZpbGVzLmVudHJpZXNbaV0uaWQgPSBpO1xyXG4gICAgICAgICAgICB0ZW1wQ2hpbGRyZW4ucHVzaChmaWxlcy5lbnRyaWVzW2ldKTtcclxuXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBub2RlLmNoaWxkcmVuID0gdGVtcENoaWxkcmVuO1xyXG4gICAgICAgICAgbm9kZS5leHBhbmRlZEljb24gPSBcImZhIGZhLWZvbGRlci1vcGVuXCI7IG5vZGUuY29sbGFwc2VkSWNvbiA9IFwiZmEgZmEtZm9sZGVyXCI7XHJcbiAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhwYXRoICsgXCIgd2FzIHBvcHVsYXRlZCB3aXRoIFwiICsgdGVtcENoaWxkcmVuLmxlbmd0aCArIFwiIGNoaWxkcmVuLlwiKTtcclxuXHJcbiAgICAgICAgICB3aGlsZSAobm9kZS5wYXJlbnQgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICBsZXQgbmV3Q2hpbGQgPSBub2RlLnBhcmVudDtcclxuICAgICAgICAgICAgbmV3Q2hpbGQuY2hpbGRyZW5bbm9kZS5pZF0gPSBub2RlO1xyXG4gICAgICAgICAgICBuZXdDaGlsZC5leHBhbmRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIG5ld0NoaWxkLmV4cGFuZGVkSWNvbiA9IFwiZmEgZmEtZm9sZGVyLW9wZW5cIjsgbmV3Q2hpbGQuY29sbGFwc2VkSWNvbiA9IFwiZmEgZmEtZm9sZGVyXCI7XHJcbiAgICAgICAgICAgIG5vZGUgPSBuZXdDaGlsZDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBsZXQgaW5kZXggPSAtMTtcclxuICAgICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLmRhdGEubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YVtpXS5sYWJlbCA9PSBub2RlLmxhYmVsKSB7XHJcbiAgICAgICAgICAgICAgaW5kZXggPSBpOyBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGluZGV4ICE9IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YVtpbmRleF0gPSBub2RlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zaG93U2VhcmNoKSB7IC8vIElmIHdlIHVwZGF0ZSBhIG5vZGUgaW4gdGhlIHdvcmtpbmcgZGlyZWN0b3J5LCB3ZSBuZWVkIHRvIGZpbmQgdGhhdCBzYW1lIG5vZGUgaW4gdGhlIGNhY2hlZCBkYXRhXHJcbiAgICAgICAgICAgICAgaW5kZXggPSAtMTsgLy8gd2hpY2ggbWF5IGJlIGluIGEgZGlmZmVyZW50IGluZGV4IGR1ZSB0byBmaWx0ZXJpbmcgYnkgc2VhcmNoIHF1ZXJ5XHJcbiAgICAgICAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRoaXMuZGF0YUNhY2hlZC5sZW5ndGg7IGkrKykgeyAvLyBXZSBjb3VsZCB1c2UgdGhpcy5maW5kTm9kZUJ5UGF0aCwgYnV0IHdlIG5lZWQgc2VhcmNoIG9ubHkgcGFyZW50IGxldmVsXHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXRhQ2FjaGVkW2ldLmxhYmVsID09IG5vZGUubGFiZWwpIHtcclxuICAgICAgICAgICAgICAgICAgaW5kZXggPSBpOyBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKGluZGV4ICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFDYWNoZWRbaW5kZXhdID0gbm9kZTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sb2cuZGVidWcoXCJUaG91Z2ggbm9kZSBhZGRlZCBpbiB3b3JraW5nIGRpcmVjdG9yeSwgZmFpbGVkIHRvIGZpbmQgaW5kZXggaW4gY2FjaGVkIGRhdGFcIik7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIHRoaXMucGVyc2lzdGVudERhdGFTZXJ2aWNlLmdldERhdGEoKVxyXG4gICAgICAgICAgICAvLyAgIC5zdWJzY3JpYmUoZGF0YSA9PiB7XHJcbiAgICAgICAgICAgIC8vICAgICB0aGlzLmRhdGFPYmplY3QgPSBkYXRhLmNvbnRlbnRzO1xyXG4gICAgICAgICAgICAvLyAgICAgdGhpcy5kYXRhT2JqZWN0LnVzc0lucHV0ID0gdGhpcy5wYXRoO1xyXG4gICAgICAgICAgICAvLyAgICAgdGhpcy5kYXRhT2JqZWN0LnVzc0RhdGEgPSB0aGlzLmRhdGE7XHJcbiAgICAgICAgICAgIC8vICAgICB0aGlzLnBlcnNpc3RlbnREYXRhU2VydmljZS5zZXREYXRhKHRoaXMuZGF0YU9iamVjdClcclxuICAgICAgICAgICAgLy8gICAgICAgLnN1YnNjcmliZSgocmVzOiBhbnkpID0+IHsgfSk7XHJcbiAgICAgICAgICAgIC8vICAgfSlcclxuXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIHRoaXMubG9nLmRlYnVnKFwiZmFpbGVkIHRvIGZpbmQgaW5kZXhcIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZWZyZXNoRmlsZU1ldGFkYXRhKG5vZGU6IGFueSkge1xyXG4gICAgbGV0IHBhdGggPSBub2RlLnBhdGg7XHJcbiAgICBsZXQgc29tZURhdGEgPSB0aGlzLnVzc1Nydi5nZXRGaWxlTWV0YWRhdGEocGF0aCk7XHJcbiAgICBzb21lRGF0YS5zdWJzY3JpYmUoe1xyXG4gICAgICBuZXh0OiAocmVzdWx0KSA9PiB7XHJcbiAgICAgICAgaWYgKHJlc3VsdC5kaXJlY3RvcnkpIHtcclxuICAgICAgICAgIG5vZGUuZGF0YSA9IFwiRm9sZGVyXCI7XHJcbiAgICAgICAgICBub2RlLmNvbGxhcHNlZEljb24gPSBcImZhIGZhLWZvbGRlclwiO1xyXG4gICAgICAgICAgbm9kZS5leHBhbmRlZEljb24gPSBcImZhIGZhLWZvbGRlci1vcGVuXCI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG5vZGUuaXRlbXMgPSB7fTtcclxuICAgICAgICAgIG5vZGUuaWNvbiA9IFwiZmEgZmEtZmlsZVwiO1xyXG4gICAgICAgICAgbm9kZS5kYXRhID0gXCJGaWxlXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG5vZGUuZGlyZWN0b3J5ID0gcmVzdWx0LmRpcmVjdG9yeTtcclxuICAgICAgICBub2RlLm1vZGUgPSByZXN1bHQubW9kZTtcclxuICAgICAgICBub2RlLm93bmVyID0gcmVzdWx0Lm93bmVyO1xyXG4gICAgICAgIG5vZGUuZ3JvdXAgPSByZXN1bHQuZ3JvdXA7XHJcbiAgICAgICAgbm9kZS5zaXplID0gcmVzdWx0LnNpemU7XHJcbiAgICAgICAgbm9kZS5jY3NpZCA9IHJlc3VsdC5jY3NpZDtcclxuICAgICAgICBub2RlLmNyZWF0ZWRBdCA9IHJlc3VsdC5jcmVhdGVkQXQ7XHJcbiAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICAgIH0sXHJcbiAgICAgIGVycm9yOiBlID0+IHtcclxuICAgICAgICBpZiAoZS5zdGF0dXMgPT0gNDA0KSB7XHJcbiAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJGYWlsZWQgdG8gcmVmcmVzaCAnXCIgKyBub2RlLm5hbWUgKyBcIicgTm8gbG9uZ2VyIGV4aXN0cyBvciBoYXMgYmVlbiByZW5hbWVkLlwiLFxyXG4gICAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVDaGlsZChub2RlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGUuc3RhdHVzID09IDQwMykge1xyXG4gICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiRmFpbGVkIHRvIHJlZnJlc2ggJ1wiICsgbm9kZS5uYW1lICsgXCInIFBlcm1pc3Npb24gZGVuaWVkLlwiLFxyXG4gICAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZS5zdGF0dXMgPT0gNTAwKSB7XHJcbiAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJGYWlsZWQgdG8gcmVmcmVzaCAnXCIgKyBub2RlLm5hbWUgKyBcIicgU2VydmVyIHJldHVybmVkIHdpdGg6IFwiICsgZS5fYm9keSxcclxuICAgICAgICAgICAgJ0Rpc21pc3MnLCBsb25nU25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcmVmcmVzaEZpbGVNZXRhZGF0ZGFVc2luZ1BhdGgocGF0aDogc3RyaW5nKSB7XHJcbiAgICBsZXQgZm91bmROb2RlID0gdGhpcy5maW5kTm9kZUJ5UGF0aCh0aGlzLmRhdGEsIHBhdGgpWzBdO1xyXG4gICAgaWYgKGZvdW5kTm9kZSkge1xyXG4gICAgICB0aGlzLnJlZnJlc2hGaWxlTWV0YWRhdGEoZm91bmROb2RlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNlYXJjaElucHV0Q2hhbmdlZChpbnB1dDogc3RyaW5nKSB7XHJcbiAgICBpZiAodGhpcy5kYXRhQ2FjaGVkKSB7XHJcbiAgICAgIHRoaXMuZGF0YSA9IF8uY2xvbmVEZWVwKHRoaXMuZGF0YUNhY2hlZCk7XHJcbiAgICB9XHJcbiAgICB0aGlzLmZpbHRlck5vZGVzQnlMYWJlbCh0aGlzLmRhdGEsIGlucHV0KTtcclxuICB9XHJcblxyXG4gIGZpbHRlck5vZGVzQnlMYWJlbChkYXRhOiBhbnksIGxhYmVsOiBzdHJpbmcpIHtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoIShkYXRhW2ldKS5sYWJlbC5pbmNsdWRlcyhsYWJlbCkpIHtcclxuICAgICAgICBpZiAoZGF0YVtpXS5jaGlsZHJlbiAmJiBkYXRhW2ldLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIHRoaXMuZmlsdGVyTm9kZXNCeUxhYmVsKGRhdGFbaV0uY2hpbGRyZW4sIGxhYmVsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEoZGF0YVtpXS5jaGlsZHJlbiAmJiBkYXRhW2ldLmNoaWxkcmVuLmxlbmd0aCA+IDApKSB7XHJcbiAgICAgICAgICBkYXRhLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgIGktLTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRhdGFbaV0uZGF0YSA9IFwiRm9sZGVyXCIpIHsgLy8gSWYgc29tZSBjaGlsZHJlbiBkaWRuJ3QgZ2V0IGZpbHRlcmVkIG91dCAoYWthIHdlIGdvdCBzb21lIG1hdGNoZXMpIGFuZCB3ZSBoYXZlIGEgZm9sZGVyXHJcbiAgICAgICAgICAvLyB0aGVuIHdlIHdhbnQgdG8gZXhwYW5kIHRoZSBub2RlIHNvIHRoZSB1c2VyIGNhbiBzZWUgdGhlaXIgcmVzdWx0cyBpbiB0aGUgc2VhcmNoIGJhclxyXG4gICAgICAgICAgZGF0YVtpXS5leHBhbmRlZCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBUT0RPOiBDb3VsZCBiZSBvcHRpbWl6ZWQgdG8gZG8gYnJlYWR0aCBmaXJzdCBzZWFyY2ggdnMgZGVwdGggZmlyc3Qgc2VhcmNoXHJcbiAgZmluZE5vZGVCeVBhdGgoZGF0YTogYW55LCBwYXRoOiBzdHJpbmcpIHtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICBpZiAoZGF0YVtpXS5wYXRoID09IHBhdGgpIHtcclxuICAgICAgICByZXR1cm4gW2RhdGFbaV0sIGldOyAvLyAwIC0gbm9kZSwgMSAtIGluZGV4XHJcbiAgICAgIH1cclxuICAgICAgaWYgKGRhdGFbaV0uY2hpbGRyZW4gJiYgZGF0YVtpXS5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgbGV0IGZvdW5kVmFsdWU6IGFueTtcclxuICAgICAgICBmb3VuZFZhbHVlID0gdGhpcy5maW5kTm9kZUJ5UGF0aChkYXRhW2ldLmNoaWxkcmVuLCBwYXRoKTtcclxuICAgICAgICAvLyBpZiBtYXRjaCBub3QgZm91bmQgaW4gdGhlIGNoaWxkZXJuIG5vZGVzIHRoZW4gY29udGluZSB3aXRoIHBlbmRpbmcgVG9wIGxldmVsIG5vZGVzXHJcbiAgICAgICAgaWYgKGZvdW5kVmFsdWVbMF0gPT0gbnVsbCAmJiBpICE9IGRhdGEubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiBmb3VuZFZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIFtudWxsLCBudWxsXTtcclxuICB9XHJcblxyXG4gIHVwZGF0ZVVzcyhwYXRoOiBzdHJpbmcpOiB2b2lkIHtcclxuICAgIHRoaXMuZGlzcGxheVRyZWUocGF0aCwgdHJ1ZSk7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVGaWxlKHBhdGhBbmROYW1lOiBzdHJpbmcsIG5vZGU6IGFueSwgdXBkYXRlOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICB0aGlzLnVzc1Nydi5tYWtlRmlsZShwYXRoQW5kTmFtZSkuc3Vic2NyaWJlKHtcclxuICAgICAgbmV4dDogKHJlczogYW55KSA9PiB7XHJcbiAgICAgICAgdGhpcy5sb2cuZGVidWcoJ0NyZWF0ZWQ6ICcgKyBwYXRoQW5kTmFtZSk7XHJcbiAgICAgICAgbGV0IHBhdGggPSB0aGlzLmdldFBhdGhGcm9tUGF0aEFuZE5hbWUocGF0aEFuZE5hbWUpO1xyXG4gICAgICAgIGxldCBzb21lRGF0YSA9IHRoaXMudXNzU3J2LmdldEZpbGVNZXRhZGF0YShwYXRoQW5kTmFtZSk7XHJcbiAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKGBTdWNjZXNzZnVsbHkgY3JlYXRlZCBmaWxlOiBcIiR7cGF0aEFuZE5hbWUuc3Vic3RyaW5nKHBhdGhBbmROYW1lLmxhc3RJbmRleE9mKCcvJykgKyAxKX1cImAsICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgc29tZURhdGEuc3Vic2NyaWJlKHtcclxuICAgICAgICAgIG5leHQ6IHJlc3VsdCA9PiB7XHJcbiAgICAgICAgICAgIC8vIElmIHRoZSByaWdodC1jbGlja2VkICdub2RlJyBpcyB0aGUgY29ycmVjdCwgdmFsaWQgbm9kZVxyXG4gICAgICAgICAgICBpZiAobm9kZS5jaGlsZHJlbiAmJiBub2RlLnBhdGggPT0gcGF0aCkge1xyXG4gICAgICAgICAgICAgIGxldCBub2RlVG9BZGQgPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogbm9kZS5jaGlsZHJlbi5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy5nZXROYW1lRnJvbVBhdGhBbmROYW1lKHBhdGhBbmROYW1lKSxcclxuICAgICAgICAgICAgICAgIG1vZGU6IHJlc3VsdC5tb2RlLFxyXG4gICAgICAgICAgICAgICAgb3duZXI6IHJlc3VsdC5vd25lcixcclxuICAgICAgICAgICAgICAgIGdyb3VwOiByZXN1bHQuZ3JvdXAsXHJcbiAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHJlc3VsdC5jcmVhdGVkQXQsXHJcbiAgICAgICAgICAgICAgICBkYXRhOiBcIkZpbGVcIixcclxuICAgICAgICAgICAgICAgIGRpcmVjdG9yeTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICBpY29uOiBcImZhIGZhLWZpbGVcIixcclxuICAgICAgICAgICAgICAgIGl0ZW1zOiB7fSxcclxuICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuZ2V0TmFtZUZyb21QYXRoQW5kTmFtZShwYXRoQW5kTmFtZSksXHJcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IG5vZGUsXHJcbiAgICAgICAgICAgICAgICBwYXRoOiBwYXRoQW5kTmFtZSxcclxuICAgICAgICAgICAgICAgIHNpemU6IHJlc3VsdC5zaXplXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIG5vZGUuY2hpbGRyZW4ucHVzaChub2RlVG9BZGQpOyAvL0FkZCBub2RlIHRvIHJpZ2h0IGNsaWNrZWQgbm9kZVxyXG4gICAgICAgICAgICAgIGlmICh0aGlzLnNob3dTZWFyY2gpIHsgLy8gSWYgd2UgdXBkYXRlIGEgbm9kZSBpbiB0aGUgd29ya2luZyBkaXJlY3RvcnksIHdlIG5lZWQgdG8gZmluZCB0aGF0IHNhbWUgbm9kZSBpbiB0aGUgY2FjaGVkIGRhdGFcclxuICAgICAgICAgICAgICAgIGxldCBub2RlQ2FjaGVkID0gdGhpcy5maW5kTm9kZUJ5UGF0aCh0aGlzLmRhdGFDYWNoZWQsIG5vZGUucGF0aClbMF07XHJcbiAgICAgICAgICAgICAgICBpZiAobm9kZUNhY2hlZCkge1xyXG4gICAgICAgICAgICAgICAgICBub2RlQ2FjaGVkLmNoaWxkcmVuLnB1c2gobm9kZVRvQWRkKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgbm9kZS5leHBhbmRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy8gLi5vdGhlcndpc2UgdHJlYXQgZm9sZGVyIGNyZWF0aW9uIHdpdGhvdXQgYW55IGNvbnRleHQuXHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgIGlmIChwYXRoID09IHRoaXMucGF0aCkgeyAvLyBJZiB3ZSBhcmUgY3JlYXRpbmcgYSBmb2xkZXIgYXQgdGhlIHBhcmVudCBsZXZlbFxyXG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5VHJlZShwYXRoLCB0cnVlKTtcclxuICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZSkgeyAvLyBJZiB3ZSB3YW50IHRvIHVwZGF0ZSB0aGUgdHJlZVxyXG4gICAgICAgICAgICAgICAgdGhpcy5hZGRDaGlsZChub2RlKTtcclxuICAgICAgICAgICAgICB9IGVsc2UgeyAvLyBJZiB3ZSBhcmUgY3JlYXRpbmcgYSBuZXcgZm9sZGVyIGluIGEgbG9jYXRpb24gd2UncmUgbm90IGxvb2tpbmcgYXRcclxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheVRyZWUocGF0aCwgZmFsc2UpOyAvLyAuLi5wbG9wIHRoZSBFeHBsb3JlciBpbnRvIHRoZSBuZXdseSBjcmVhdGVkIGxvY2F0aW9uLlxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LFxyXG4gICAgICBlcnJvcjogZXJyb3IgPT4ge1xyXG4gICAgICAgIHRoaXMudXNzU3J2LmdldEZpbGVNZXRhZGF0YShwYXRoQW5kTmFtZSkuc3Vic2NyaWJlKHtcclxuICAgICAgICAgIG5leHQ6IHJlc3BvbnNlID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiRmFpbGVkIHRvIGNyZWF0ZSBGaWxlLiAnXCIgKyBwYXRoQW5kTmFtZSArIFwiJyBhbHJlYWR5IGV4aXN0c1wiLCAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGVycm9yOiBlcnIgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJGYWlsZWQgdG8gY3JlYXRlIEZpbGU6ICdcIiArIHBhdGhBbmROYW1lICsgXCInXCIsICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIHRoaXMubG9nLnNldmVyZShlcnJvcik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGNyZWF0ZUZvbGRlcihwYXRoQW5kTmFtZTogc3RyaW5nLCBub2RlOiBhbnksIHVwZGF0ZTogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgdGhpcy51c3NTcnYubWFrZURpcmVjdG9yeShwYXRoQW5kTmFtZSlcclxuICAgICAgLnN1YnNjcmliZSh7XHJcbiAgICAgICAgbmV4dDogcmVzcCA9PiB7XHJcbiAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZygnQ3JlYXRlZDogJyArIHBhdGhBbmROYW1lKTtcclxuICAgICAgICAgIGxldCBwYXRoID0gdGhpcy5nZXRQYXRoRnJvbVBhdGhBbmROYW1lKHBhdGhBbmROYW1lKTtcclxuICAgICAgICAgIGxldCBzb21lRGF0YSA9IHRoaXMudXNzU3J2LmdldEZpbGVNZXRhZGF0YShwYXRoQW5kTmFtZSk7XHJcbiAgICAgICAgICBzb21lRGF0YS5zdWJzY3JpYmUoe1xyXG4gICAgICAgICAgICBuZXh0OiByZXN1bHQgPT4ge1xyXG4gICAgICAgICAgICAgIC8vIElmIHRoZSByaWdodC1jbGlja2VkICdub2RlJyBpcyB0aGUgY29ycmVjdCwgdmFsaWQgbm9kZVxyXG4gICAgICAgICAgICAgIGlmIChub2RlLmNoaWxkcmVuICYmIG5vZGUucGF0aCA9PSBwYXRoKSB7XHJcbiAgICAgICAgICAgICAgICBsZXQgbm9kZVRvQWRkID0ge1xyXG4gICAgICAgICAgICAgICAgICBpZDogbm9kZS5jaGlsZHJlbi5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgICAgIGNoaWxkcmVuOiBbXSxcclxuICAgICAgICAgICAgICAgICAgbGFiZWw6IHRoaXMuZ2V0TmFtZUZyb21QYXRoQW5kTmFtZShwYXRoQW5kTmFtZSksXHJcbiAgICAgICAgICAgICAgICAgIG1vZGU6IHJlc3VsdC5tb2RlLFxyXG4gICAgICAgICAgICAgICAgICBvd25lcjogcmVzdWx0Lm93bmVyLFxyXG4gICAgICAgICAgICAgICAgICBncm91cDogcmVzdWx0Lmdyb3VwLFxyXG4gICAgICAgICAgICAgICAgICBjcmVhdGVkQXQ6IHJlc3VsdC5jcmVhdGVkQXQsXHJcbiAgICAgICAgICAgICAgICAgIGRhdGE6IFwiRm9sZGVyXCIsXHJcbiAgICAgICAgICAgICAgICAgIGRpcmVjdG9yeTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgZXhwYW5kZWRJY29uOiBcImZhIGZhLWZvbGRlci1vcGVuXCIsXHJcbiAgICAgICAgICAgICAgICAgIGNvbGxhcHNlZEljb246IFwiZmEgZmEtZm9sZGVyXCIsXHJcbiAgICAgICAgICAgICAgICAgIG5hbWU6IHRoaXMuZ2V0TmFtZUZyb21QYXRoQW5kTmFtZShwYXRoQW5kTmFtZSksXHJcbiAgICAgICAgICAgICAgICAgIHBhcmVudDogbm9kZSxcclxuICAgICAgICAgICAgICAgICAgcGF0aDogcGF0aEFuZE5hbWUsXHJcbiAgICAgICAgICAgICAgICAgIHNpemU6IHJlc3VsdC5zaXplXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBub2RlLmNoaWxkcmVuLnB1c2gobm9kZVRvQWRkKTsgLy9BZGQgbm9kZSB0byByaWdodCBjbGlja2VkIG5vZGVcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob3dTZWFyY2gpIHsgLy8gSWYgd2UgdXBkYXRlIGEgbm9kZSBpbiB0aGUgd29ya2luZyBkaXJlY3RvcnksIHdlIG5lZWQgdG8gZmluZCB0aGF0IHNhbWUgbm9kZSBpbiB0aGUgY2FjaGVkIGRhdGFcclxuICAgICAgICAgICAgICAgICAgbGV0IG5vZGVDYWNoZWQgPSB0aGlzLmZpbmROb2RlQnlQYXRoKHRoaXMuZGF0YUNhY2hlZCwgbm9kZS5wYXRoKVswXTtcclxuICAgICAgICAgICAgICAgICAgaWYgKG5vZGVDYWNoZWQpIHtcclxuICAgICAgICAgICAgICAgICAgICBub2RlQ2FjaGVkLmNoaWxkcmVuLnB1c2gobm9kZVRvQWRkKTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgbm9kZS5leHBhbmRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIC8vIC4ub3RoZXJ3aXNlIHRyZWF0IGZvbGRlciBjcmVhdGlvbiB3aXRob3V0IGFueSBjb250ZXh0LlxyXG4gICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKHBhdGggPT0gdGhpcy5wYXRoKSB7IC8vIElmIHdlIGFyZSBjcmVhdGluZyBhIGZvbGRlciBhdCB0aGUgcGFyZW50IGxldmVsXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheVRyZWUocGF0aCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHVwZGF0ZSkgeyAvLyBJZiB3ZSB3YW50IHRvIHVwZGF0ZSB0aGUgdHJlZVxyXG4gICAgICAgICAgICAgICAgICB0aGlzLmFkZENoaWxkKG5vZGUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gSWYgd2UgYXJlIGNyZWF0aW5nIGEgbmV3IGZvbGRlciBpbiBhIGxvY2F0aW9uIHdlJ3JlIG5vdCBsb29raW5nIGF0XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheVRyZWUocGF0aEFuZE5hbWUsIGZhbHNlKTsgLy8gLi4ucGxvcCB0aGUgRXhwbG9yZXIgaW50byB0aGUgbmV3bHkgY3JlYXRlZCBsb2NhdGlvbi5cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXJyb3I6IGVycm9yID0+IHtcclxuICAgICAgICAgIGlmIChlcnJvci5zdGF0dXMgPT0gJzUwMCcpIHsgLy9JbnRlcm5hbCBTZXJ2ZXIgRXJyb3JcclxuICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiRmFpbGVkIHRvIGNyZWF0ZSBkaXJlY3Rvcnk6ICdcIiArIHBhdGhBbmROYW1lICsgXCInIFRoaXMgaXMgcHJvYmFibHkgZHVlIHRvIGEgc2VydmVyIGFnZW50IHByb2JsZW0uXCIsXHJcbiAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMubG9nLnNldmVyZShlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIGRlbGV0ZUZpbGVPckZvbGRlcihyaWdodENsaWNrZWRGaWxlOiBhbnkpOiB2b2lkIHtcclxuICAgIGxldCBwYXRoQW5kTmFtZSA9IHJpZ2h0Q2xpY2tlZEZpbGUucGF0aDtcclxuICAgIGxldCBuYW1lID0gdGhpcy5nZXROYW1lRnJvbVBhdGhBbmROYW1lKHBhdGhBbmROYW1lKTtcclxuICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgIHRoaXMuZGVsZXRpb25RdWV1ZS5zZXQocmlnaHRDbGlja2VkRmlsZS5wYXRoLCByaWdodENsaWNrZWRGaWxlKTtcclxuICAgIHJpZ2h0Q2xpY2tlZEZpbGUuc3R5bGVDbGFzcyA9IFwiZmlsZWJyb3dzZXJ1c3Mtbm9kZS1kZWxldGluZ1wiO1xyXG4gICAgbGV0IGRlbGV0ZVN1YnNjcmlwdGlvbiA9IHRoaXMudXNzU3J2LmRlbGV0ZUZpbGVPckZvbGRlcihwYXRoQW5kTmFtZSlcclxuICAgICAgLnN1YnNjcmliZSh7XHJcbiAgICAgICAgbmV4dDogcmVzcCA9PiB7XHJcbiAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiRGVsZXRlZCAnXCIgKyBuYW1lICsgXCInXCIsXHJcbiAgICAgICAgICAgICdEaXNtaXNzJywgcXVpY2tTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVDaGlsZChyaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICAgIHRoaXMuZGVsZXRpb25RdWV1ZS5kZWxldGUocmlnaHRDbGlja2VkRmlsZS5wYXRoKTtcclxuICAgICAgICAgIHJpZ2h0Q2xpY2tlZEZpbGUuc3R5bGVDbGFzcyA9IFwiXCI7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0ZUNsaWNrLmVtaXQodGhpcy5yaWdodENsaWNrZWRFdmVudC5ub2RlKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVycm9yOiBlcnJvciA9PiB7XHJcbiAgICAgICAgICBpZiAoZXJyb3Iuc3RhdHVzID09ICc1MDAnKSB7IC8vSW50ZXJuYWwgU2VydmVyIEVycm9yXHJcbiAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkZhaWxlZCB0byBkZWxldGUgJ1wiICsgcGF0aEFuZE5hbWUgKyBcIicgU2VydmVyIHJldHVybmVkIHdpdGg6IFwiICsgZXJyb3IuX2JvZHksXHJcbiAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBsb25nU25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDQnKSB7IC8vTm90IEZvdW5kXHJcbiAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkZhaWxlZCB0byBkZWxldGUgJ1wiICsgcGF0aEFuZE5hbWUgKyBcIicuIEFscmVhZHkgYmVlbiBkZWxldGVkIG9yIGRvZXMgbm90IGV4aXN0LlwiLFxyXG4gICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2hpbGQocmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnN0YXR1cyA9PSAnNDAwJyB8fCBlcnJvci5zdGF0dXMgPT0gJzQwMycpIHsgLy9CYWQgUmVxdWVzdFxyXG4gICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJGYWlsZWQgdG8gZGVsZXRlICdcIiArIHBhdGhBbmROYW1lICsgXCInIFRoaXMgaXMgcHJvYmFibHkgZHVlIHRvIGEgcGVybWlzc2lvbiBwcm9ibGVtLlwiLFxyXG4gICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICB9IGVsc2UgeyAvL1Vua25vd25cclxuICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiVW5rbm93biBlcnJvciAnXCIgKyBlcnJvci5zdGF0dXMgKyBcIicgb2NjdXJyZWQgZm9yICdcIiArIHBhdGhBbmROYW1lICsgXCInIFNlcnZlciByZXR1cm5lZCB3aXRoOiBcIiArIGVycm9yLl9ib2R5LFxyXG4gICAgICAgICAgICAgICdEaXNtaXNzJywgbG9uZ1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIC8vRXJyb3IgaW5mbyBnZXRzIHByaW50ZWQgaW4gdXNzLmNydWQuc2VydmljZS50c1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5kZWxldGlvblF1ZXVlLmRlbGV0ZShyaWdodENsaWNrZWRGaWxlLnBhdGgpO1xyXG4gICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIHJpZ2h0Q2xpY2tlZEZpbGUuc3R5bGVDbGFzcyA9IFwiXCI7XHJcbiAgICAgICAgICB0aGlzLmxvZy5zZXZlcmUoZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgIGlmIChkZWxldGVTdWJzY3JpcHRpb24uY2xvc2VkID09IGZhbHNlKSB7XHJcbiAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiRGVsZXRpbmcgJ1wiICsgcGF0aEFuZE5hbWUgKyBcIicuLi4gTGFyZ2VyIHBheWxvYWRzIG1heSB0YWtlIGxvbmdlci4gUGxlYXNlIGJlIHBhdGllbnQuXCIsXHJcbiAgICAgICAgICAnRGlzbWlzcycsIHF1aWNrU25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgfVxyXG4gICAgfSwgNDAwMCk7XHJcbiAgfVxyXG5cclxuICByZW1vdmVDaGlsZChub2RlOiBhbnkpIHtcclxuICAgIGxldCBwYXJlbnQ7XHJcbiAgICBsZXQgY2hpbGRyZW47XHJcbiAgICBpZiAobm9kZS5wYXJlbnQpIHsgLy8gSWYgdGhlIHNlbGVjdGVkIG5vZGUgaGFzIGEgcGFyZW50LFxyXG4gICAgICBwYXJlbnQgPSBub2RlLnBhcmVudDtcclxuICAgICAgY2hpbGRyZW4gPSBwYXJlbnQuY2hpbGRyZW47IC8vIC4uLmp1c3QgdXNlIHRoZSB0b3AtbW9zdCBjaGlsZHJlblxyXG4gICAgfSBlbHNlIHsgLy8gVGhlIHNlbGVjdGVkIG5vZGUgKmlzKiB0aGUgdG9wLW1vc3Qgbm9kZSxcclxuICAgICAgY2hpbGRyZW4gPSB0aGlzLmRhdGE7IC8vIC4uLmp1c3QgdXNlIHRoZSBVSSBub2RlcyBhcyBvdXIgY2hpbGRyZW5cclxuICAgIH1cclxuXHJcbiAgICBsZXQgbm9kZURhdGEgPSB0aGlzLmZpbmROb2RlQnlQYXRoKGNoaWxkcmVuLCBub2RlLnBhdGgpO1xyXG4gICAgaWYgKG5vZGVEYXRhKSB7IC8vIElmIHdlIGNhdGNoIHRoZSBub2RlIHdlIHdhbnRlZCB0byByZW1vdmUsXHJcbiAgICAgIGxldCBub2RlT2JqID0gbm9kZURhdGFbMF07XHJcbiAgICAgIGxldCBub2RlSW5kZXggPSBub2RlRGF0YVsxXTtcclxuICAgICAgY2hpbGRyZW4uc3BsaWNlKG5vZGVJbmRleCwgMSk7IC8vIC4uLnJlbW92ZSBpdFxyXG4gICAgICBpZiAobm9kZS5wYXJlbnQgJiYgbm9kZS5wYXJlbnQuY2hpbGRyZW4pIHsgLy8gVXBkYXRlIHRoZSBjaGlsZHJlbiB0byBubyBsb25nZXIgaW5jbHVkZSByZW1vdmVkIG5vZGVcclxuICAgICAgICBub2RlLnBhcmVudC5jaGlsZHJlbiA9IGNoaWxkcmVuO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuZGF0YSA9IGNoaWxkcmVuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuc2hvd1NlYXJjaCkgeyAvLyBJZiB3ZSB1cGRhdGUgYSBub2RlIGluIHRoZSB3b3JraW5nIGRpcmVjdG9yeSwgd2UgbmVlZCB0byBmaW5kIHRoYXQgc2FtZSBub2RlIGluIHRoZSBjYWNoZWQgZGF0YVxyXG4gICAgICBsZXQgbm9kZURhdGFDYWNoZWQgPSB0aGlzLmZpbmROb2RlQnlQYXRoKHRoaXMuZGF0YUNhY2hlZCwgbm9kZS5wYXRoKTtcclxuICAgICAgaWYgKG5vZGVEYXRhQ2FjaGVkKSB7XHJcbiAgICAgICAgbGV0IG5vZGVDYWNoZWQgPSBub2RlRGF0YUNhY2hlZFswXTtcclxuICAgICAgICBsZXQgaW5kZXhDYWNoZWQgPSBub2RlRGF0YUNhY2hlZFsxXTtcclxuICAgICAgICBpZiAobm9kZUNhY2hlZC5wYXJlbnQpIHtcclxuICAgICAgICAgIGlmIChpbmRleENhY2hlZCAhPSAtMSkge1xyXG4gICAgICAgICAgICBub2RlQ2FjaGVkLnBhcmVudC5jaGlsZHJlbi5zcGxpY2UoaW5kZXhDYWNoZWQsIDEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2VuZE5vdGlmaWNhdGlvbih0aXRsZTogc3RyaW5nLCBtZXNzYWdlOiBzdHJpbmcpOiBudW1iZXIge1xyXG4gICAgbGV0IHBsdWdpbklkID0gdGhpcy5wbHVnaW5EZWZpbml0aW9uLmdldEJhc2VQbHVnaW4oKS5nZXRJZGVudGlmaWVyKCk7XHJcbiAgICAvLyBXZSBjYW4gc3BlY2lmeSBhIGRpZmZlcmVudCBzdHlsZUNsYXNzIHRvIHRoZW1lIHRoZSBub3RpZmljYXRpb24gVUkgaS5lLiBbLi4uXSBtZXNzYWdlLCAxLCBwbHVnaW5JZCwgXCJvcmdfem93ZV96bHV4X2VkaXRvcl9zbmFja2JhclwiXHJcbiAgICBsZXQgbm90aWZpY2F0aW9uID0gWm93ZVpMVVgubm90aWZpY2F0aW9uTWFuYWdlci5jcmVhdGVOb3RpZmljYXRpb24odGl0bGUsIG1lc3NhZ2UsIDEsIHBsdWdpbklkKTtcclxuICAgIHJldHVybiBab3dlWkxVWC5ub3RpZmljYXRpb25NYW5hZ2VyLm5vdGlmeShub3RpZmljYXRpb24pO1xyXG4gIH1cclxuXHJcbiAgbGV2ZWxVcCgpOiB2b2lkIHtcclxuICAgIC8vVE9ETzogbWF5IHdhbnQgdG8gY2hhbmdlIHRoaXMgdG8gJ3Jvb3QnIGRlcGVuZGluZyBvbiBtYWluZnJhbWUgZmlsZSBhY2Nlc3Mgc2VjdXJpdHlcclxuICAgIC8vdG8gcHJldmVudCBwZW9wbGUgZnJvbSBhY2Nlc3NpbmcgZmlsZXMvZm9sZGVycyBvdXRzaWRlIHRoZWlyIHJvb3QgZGlyXHJcbiAgICBpZiAodGhpcy5wYXRoICE9PSBcIi9cIiAmJiB0aGlzLnBhdGggIT09ICcnKSB7XHJcbiAgICAgIHRoaXMucGF0aCA9IHRoaXMuZ2V0UGF0aEZyb21QYXRoQW5kTmFtZSh0aGlzLnBhdGgpO1xyXG4gICAgICBpZiAodGhpcy5wYXRoID09PSAnJyB8fCB0aGlzLnBhdGggPT0gJy8nKSB7XHJcbiAgICAgICAgdGhpcy5wYXRoID0gJy8nO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBsZXQgcGFyZW50aW5kZXggPSB0aGlzLnBhdGgubGVuZ3RoIC0gMTtcclxuICAgICAgd2hpbGUgKHRoaXMucGF0aC5jaGFyQXQocGFyZW50aW5kZXgpICE9ICcvJykgeyBwYXJlbnRpbmRleC0tOyB9XHJcbiAgICAgIGxldCBwYXJlbnQgPSB0aGlzLnBhdGguc2xpY2UocGFyZW50aW5kZXggKyAxLCB0aGlzLnBhdGgubGVuZ3RoKTtcclxuICAgICAgdGhpcy5sb2cuZGVidWcoXCJHb2luZyB1cCB0bzogXCIgKyBwYXJlbnQpO1xyXG5cclxuICAgICAgdGhpcy5kaXNwbGF5VHJlZSh0aGlzLnBhdGgsIGZhbHNlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMudXBkYXRlVXNzKHRoaXMucGF0aCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXRQYXRoRnJvbVBhdGhBbmROYW1lKHBhdGhBbmROYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgbGV0IHBhdGggPSBwYXRoQW5kTmFtZS5yZXBsYWNlKC9cXC8kLywgJycpLnJlcGxhY2UoL1xcL1teXFwvXSskLywgJycpO1xyXG4gICAgcmV0dXJuIHBhdGg7XHJcbiAgfVxyXG5cclxuICBnZXROYW1lRnJvbVBhdGhBbmROYW1lKHBhdGhBbmROYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgbGV0IG5hbWUgPSBwYXRoQW5kTmFtZS5yZXBsYWNlKC8oXi4qKShcXC8uKlxcLykvLCAnJyk7XHJcbiAgICByZXR1cm4gbmFtZTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY2hlY2tQYXRoKGlucHV0OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRoaXMudXRpbHMuZmlsZVBhdGhFbmRDaGVjayh0aGlzLnBhdGgpICsgaW5wdXQ7XHJcbiAgfVxyXG5cclxuICBjaGVja1BhdGhTbGFzaChldmVudDogYW55KSB7XHJcbiAgICBpZiAodGhpcy5wYXRoID09IFwiXCIpIHtcclxuICAgICAgdGhpcy5wYXRoID0gXCIvXCI7XHJcbiAgICAgIHRoaXMucGF0aElucHV0VVNTLm5hdGl2ZUVsZW1lbnQudmFsdWUgPSBcIi9cIjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGNoZWNrSWZJbkRlbGV0aW9uUXVldWVBbmRNZXNzYWdlKHBhdGhBbmROYW1lOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKHRoaXMuZGVsZXRpb25RdWV1ZS5oYXMocGF0aEFuZE5hbWUpKSB7XHJcbiAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkRlbGV0aW9uIGluIHByb2dyZXNzOiAnXCIgKyBwYXRoQW5kTmFtZSArIFwiJyBcIiArIG1lc3NhZ2UsXHJcbiAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG59XHJcblxyXG5cclxuLypcclxuICBUaGlzIHByb2dyYW0gYW5kIHRoZSBhY2NvbXBhbnlpbmcgbWF0ZXJpYWxzIGFyZVxyXG4gIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRWNsaXBzZSBQdWJsaWMgTGljZW5zZSB2Mi4wIHdoaWNoIGFjY29tcGFuaWVzXHJcbiAgdGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXHJcbiAgXHJcbiAgU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcclxuICBcclxuICBDb3B5cmlnaHQgQ29udHJpYnV0b3JzIHRvIHRoZSBab3dlIFByb2plY3QuXHJcbiovXHJcbiIsIjwhLS1cblRoaXMgcHJvZ3JhbSBhbmQgdGhlIGFjY29tcGFueWluZyBtYXRlcmlhbHMgYXJlXG5tYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEVjbGlwc2UgUHVibGljIExpY2Vuc2UgdjIuMCB3aGljaCBhY2NvbXBhbmllc1xudGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXG5cblNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBFUEwtMi4wXG5cbkNvcHlyaWdodCBDb250cmlidXRvcnMgdG8gdGhlIFpvd2UgUHJvamVjdC5cbi0tPlxuXG48ZGl2IHN0eWxlPVwiaGVpZ2h0OiAxMDAlO1wiPlxuXG4gIDwhLS0gVGFicywgc2VhcmNoYmFyLCBhbmQgbG9hZGluZyBpbmRpY2F0b3IgLS0+XG4gIEBpZiAoc2hvd1VwQXJyb3cpIHtcbiAgPGltZyBkYXRhLXRvZ2dsZT1cInRvb2x0aXBcIiBjbGFzcz1cImZpbGVicm93c2VydXNzLXBvaW50ZXItbG9nb1wiIHRpdGxlPVwiR28gdXAgdG8gdGhlIHBhcmVudCBsZXZlbFwiIChjbGljayk9XCJsZXZlbFVwKClcIlxuICAgIFtuZ1N0eWxlXT1cInRyZWVTdHlsZVwiIHRhYmluZGV4PVwiMFwiIChrZXlkb3duLmVudGVyKT1cImxldmVsVXAoKVwiPlxuICB9XG5cbiAgPGRpdiBjbGFzcz1cImZpbGVicm93c2VydXNzLXNlYXJjaFwiIFtuZ1N0eWxlXT1cInNlYXJjaFN0eWxlXCI+XG4gICAgPGlucHV0ICNwYXRoSW5wdXRVU1MgWyhuZ01vZGVsKV09XCJwYXRoXCIgbGlzdD1cInNlYXJjaFVTU0hpc3RvcnlcIiBwbGFjZWhvbGRlcj1cIkVudGVyIGFuIGFic29sdXRlIHBhdGguLi5cIlxuICAgICAgW25nU3R5bGVdPVwiaW5wdXRTdHlsZVwiIGNsYXNzPVwiZmlsZWJyb3dzZXJ1c3Mtc2VhcmNoLWlucHV0XCIgKGtleWRvd24uZW50ZXIpPVwiZGlzcGxheVRyZWUocGF0aCwgZmFsc2UpO1wiXG4gICAgICBbZGlzYWJsZWRdPVwiaXNMb2FkaW5nXCIgKG5nTW9kZWxDaGFuZ2UpPVwiY2hlY2tQYXRoU2xhc2goJGV2ZW50KVwiPlxuICAgIDwhLS0gVE9ETzogbWFrZSBzZWFyY2ggaGlzdG9yeSBhIGRpcmVjdGl2ZSB0byB1c2UgaW4gYm90aCB1c3MgYW5kIG12cy0tPlxuICAgIDxkYXRhbGlzdCBpZD1cInNlYXJjaFVTU0hpc3RvcnlcIj5cbiAgICAgIEBmb3IgKGl0ZW0gb2YgdXNzU2VhcmNoSGlzdG9yeS5zZWFyY2hIaXN0b3J5VmFsOyB0cmFjayBpdGVtKSB7XG4gICAgICA8b3B0aW9uIFt2YWx1ZV09XCJpdGVtXCI+PC9vcHRpb24+XG4gICAgICB9XG4gICAgPC9kYXRhbGlzdD5cbiAgPC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJmYSBmYS1zcGlubmVyIGZhLXNwaW4gZmlsZWJyb3dzZXJ1c3MtbG9hZGluZy1pY29uXCIgW2hpZGRlbl09XCIhaXNMb2FkaW5nXCIgc3R5bGU9XCJtYXJnaW4tbGVmdDogOXB4O1wiPjwvZGl2PlxuICA8ZGl2IGNsYXNzPVwiZmEgZmEtcmVmcmVzaCBmaWxlYnJvd3NlcnVzcy1sb2FkaW5nLWljb25cIiB0aXRsZT1cIlJlZnJlc2ggd2hvbGUgZGlyZWN0b3J5XCJcbiAgICAoY2xpY2spPVwiZGlzcGxheVRyZWUocGF0aCwgZmFsc2UpO1wiIFtoaWRkZW5dPVwiaXNMb2FkaW5nXCIgc3R5bGU9XCJtYXJnaW4tbGVmdDogOXB4OyBjdXJzb3I6IHBvaW50ZXI7XCI+PC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJmaWxlLXRyZWUtdXRpbGl0aWVzXCI+XG4gICAgPGRpdiBjbGFzcz1cImZhIGZhLW1pbnVzLXNxdWFyZS1vIGZpbGVicm93c2VyLWljb25cIiB0aXRsZT1cIkNvbGxhcHNlIEZvbGRlcnMgaW4gRXhwbG9yZXJcIiAoY2xpY2spPVwiY29sbGFwc2VUcmVlKCk7XCI+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImZhIGZhLXRyYXNoLW8gZmlsZWJyb3dzZXItaWNvblwiIHRpdGxlPVwiRGVsZXRlXCIgKGNsaWNrKT1cInNob3dEZWxldGVEaWFsb2coc2VsZWN0ZWROb2RlKTtcIj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwiZmEgZmEtZm9sZGVyLW8gZmlsZWJyb3dzZXItaWNvblwiIHRpdGxlPVwiQ3JlYXRlIE5ldyBGb2xkZXJcIlxuICAgICAgKGNsaWNrKT1cInNob3dDcmVhdGVGb2xkZXJEaWFsb2coIXNlbGVjdGVkTm9kZSB8fCAoIXNlbGVjdGVkTm9kZS5wYXJlbnQgJiYgIXNlbGVjdGVkTm9kZS5kaXJlY3RvcnkpID8geyAncGF0aCcgOiBwYXRoIH0gOiBzZWxlY3RlZE5vZGUuZGlyZWN0b3J5ID8gc2VsZWN0ZWROb2RlIDogc2VsZWN0ZWROb2RlLnBhcmVudCk7XCI+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImZhIGZhLWVyYXNlciBmaWxlYnJvd3Nlci1pY29uIHNwZWNpYWwtdXRpbGl0eVwiIHRpdGxlPVwiQ2xlYXIgU2VhcmNoIEhpc3RvcnlcIlxuICAgICAgKGNsaWNrKT1cImNsZWFyU2VhcmNoSGlzdG9yeSgpO1wiPjwvZGl2PlxuICA8L2Rpdj5cblxuICA8IS0tIE1haW4gdHJlZSAtLT5cbiAgPGRpdiBbaGlkZGVuXT1cImhpZGVFeHBsb3JlclwiIHN0eWxlPVwiaGVpZ2h0OiAxMDAlO1wiPlxuICAgIDx0cmVlLXJvb3QgW3RyZWVEYXRhXT1cImRhdGFcIiAoY2xpY2tFdmVudCk9XCJvbk5vZGVDbGljaygkZXZlbnQpXCIgKGRibENsaWNrRXZlbnQpPVwib25Ob2RlRGJsQ2xpY2soJGV2ZW50KVwiXG4gICAgICBbbmdTdHlsZV09XCJ0cmVlU3R5bGVcIiAocmlnaHRDbGlja0V2ZW50KT1cIm9uTm9kZVJpZ2h0Q2xpY2soJGV2ZW50KVwiXG4gICAgICAocGFuZWxSaWdodENsaWNrRXZlbnQpPVwib25QYW5lbFJpZ2h0Q2xpY2soJGV2ZW50KVwiIChkYXRhQ2hhbmdlZCk9XCJvbkRhdGFDaGFuZ2VkKCRldmVudClcIj48L3RyZWUtcm9vdD5cbiAgPC9kaXY+XG5cbiAgQGlmIChzaG93U2VhcmNoKSB7XG4gIDxkaXYgY2xhc3M9XCJ1aS1pbnB1dGdyb3VwIGZpbGVicm93c2VydXNzLXNlYXJjaC1ib3R0b20tZ3JvdXBcIj5cbiAgICA8c3BhbiBjbGFzcz1cInVpLWlucHV0Z3JvdXAtYWRkb25cIj48aSBjbGFzcz1cImZhIGZhLXNlYXJjaCBmaWxlYnJvd3NlcnVzcy1zZWFyY2gtYm90dG9tLWljb25cIj48L2k+PC9zcGFuPlxuICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIHBJbnB1dFRleHQgcGxhY2Vob2xkZXI9XCJTZWFyY2ggb3BlbmVkIGZpbGVzL2ZvbGRlcnMgYnkgbmFtZS4uLlwiXG4gICAgICBjbGFzcz1cImZpbGVicm93c2VydXNzLXNlYXJjaC1ib3R0b20taW5wdXRcIiBbZm9ybUNvbnRyb2xdPVwic2VhcmNoQ3RybFwiICNzZWFyY2hVU1M+XG4gIDwvZGl2PlxuICB9XG5cbjwvZGl2PlxuXG48IS0tXG4gICAgVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcbiAgICBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEVjbGlwc2UgUHVibGljIExpY2Vuc2UgdjIuMCB3aGljaCBhY2NvbXBhbmllc1xuICAgIHRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MjAuaHRtbFxuXG4gICAgU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcblxuICAgIENvcHlyaWdodCBDb250cmlidXRvcnMgdG8gdGhlIFpvd2UgUHJvamVjdC5cbiAgICAtLT4iXX0=