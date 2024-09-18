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
        metaData.subscribe(result => {
            if (result.ccsid == -1) {
                this.snackBar.open("Paste failed: '" + pathAndName + "' Operation not yet supported for this encoding.", 'Dismiss', defaultSnackbarOptions);
                return;
            }
            else {
                this.isLoading = true;
                let destinationMetadata = this.ussSrv.getFileContents(destinationPath);
                destinationMetadata.subscribe(result => {
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
                        .subscribe(resp => {
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
                                .subscribe(resp => {
                                this.isLoading = false;
                                this.removeChild(fileNode);
                                this.snackBar.open('Paste successful: ' + name, 'Dismiss', quickSnackbarOptions);
                            }, error => {
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
                            });
                        }
                        else {
                            this.isLoading = false;
                            this.snackBar.open('Paste successful: ' + name, 'Dismiss', quickSnackbarOptions);
                        }
                    }, error => {
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
                    });
                    setTimeout(() => {
                        if (copySubscription.closed == false) {
                            this.snackBar.open('Pasting ' + pathAndName + '... Larger payloads may take longer. Please be patient.', 'Dismiss', quickSnackbarOptions);
                        }
                    }, 4000);
                }, error => {
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
                });
            }
        }, error => {
            if (error.status == '404') { // This happens when user attempts to paste a file that's been deleted after copying
                this.snackBar.open("Paste failed: Original '" + pathAndName + "' no longer exists.", 'Dismiss', defaultSnackbarOptions);
            }
            this.isLoading = false;
            this.log.warn(error);
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
                this.ussSrv.renameFile(oldPath, newPath).subscribe(res => {
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
                }, error => {
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
        ussData.subscribe(files => {
            if (files.entries == undefined) { // Reduces console errors and other bugs by accidentally providing a USS file as USS path
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
        }, error => {
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
        });
        this.refreshHistory(this.path);
    }
    refreshHistory(path) {
        const sub = this.ussSearchHistory
            .saveSearchHistory(path)
            .subscribe(() => {
            if (sub)
                sub.unsubscribe();
        });
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
        someData.subscribe(result => {
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
        }, e => {
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
        this.ussSrv.makeFile(pathAndName).subscribe((res) => {
            this.log.debug('Created: ' + pathAndName);
            let path = this.getPathFromPathAndName(pathAndName);
            let someData = this.ussSrv.getFileMetadata(pathAndName);
            this.snackBar.open(`Successfully created file: "${pathAndName.substring(pathAndName.lastIndexOf('/') + 1)}"`, 'Dismiss', defaultSnackbarOptions);
            someData.subscribe(result => {
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
            });
        }, error => {
            this.ussSrv.getFileMetadata(pathAndName).subscribe(response => {
                this.snackBar.open("Failed to create File. '" + pathAndName + "' already exists", 'Dismiss', defaultSnackbarOptions);
            }, err => {
                this.snackBar.open("Failed to create File: '" + pathAndName + "'", 'Dismiss', defaultSnackbarOptions);
                this.log.severe(error);
            });
        });
    }
    createFolder(pathAndName, node, update) {
        this.ussSrv.makeDirectory(pathAndName)
            .subscribe(resp => {
            this.log.debug('Created: ' + pathAndName);
            let path = this.getPathFromPathAndName(pathAndName);
            let someData = this.ussSrv.getFileMetadata(pathAndName);
            someData.subscribe(result => {
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
            });
        }, error => {
            if (error.status == '500') { //Internal Server Error
                this.snackBar.open("Failed to create directory: '" + pathAndName + "' This is probably due to a server agent problem.", 'Dismiss', defaultSnackbarOptions);
            }
            this.log.severe(error);
        });
    }
    deleteFileOrFolder(rightClickedFile) {
        let pathAndName = rightClickedFile.path;
        let name = this.getNameFromPathAndName(pathAndName);
        this.isLoading = true;
        this.deletionQueue.set(rightClickedFile.path, rightClickedFile);
        rightClickedFile.styleClass = "filebrowseruss-node-deleting";
        let deleteSubscription = this.ussSrv.deleteFileOrFolder(pathAndName)
            .subscribe(resp => {
            this.isLoading = false;
            this.snackBar.open("Deleted '" + name + "'", 'Dismiss', quickSnackbarOptions);
            this.removeChild(rightClickedFile);
            this.deletionQueue.delete(rightClickedFile.path);
            rightClickedFile.styleClass = "";
            this.deleteClick.emit(this.rightClickedEvent.node);
        }, error => {
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
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: FileBrowserUSSComponent, selector: "file-browser-uss", inputs: { inputStyle: "inputStyle", searchStyle: "searchStyle", treeStyle: "treeStyle", showUpArrow: "showUpArrow" }, outputs: { pathChanged: "pathChanged", dataChanged: "dataChanged", nodeClick: "nodeClick", nodeDblClick: "nodeDblClick", nodeRightClick: "nodeRightClick", newFolderClick: "newFolderClick", newFileClick: "newFileClick", fileUploaded: "fileUploaded", copyClick: "copyClick", deleteClick: "deleteClick", ussRenameEvent: "ussRenameEvent", rightClick: "rightClick", openInNewTab: "openInNewTab" }, providers: [UssCrudService, /*PersistentDataService,*/ SearchHistoryService], viewQueries: [{ propertyName: "treeComponent", first: true, predicate: TreeComponent, descendants: true }, { propertyName: "pathInputUSS", first: true, predicate: ["pathInputUSS"], descendants: true }, { propertyName: "searchUSS", first: true, predicate: ["searchUSS"], descendants: true }], ngImport: i0, template: "\n<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n\n<div style=\"height: 100%;\">\n\n  <!-- Tabs, searchbar, and loading indicator -->\n  @if (showUpArrow) {\n    <img src=\"../../../assets/explorer-uparrow.png\"\n      data-toggle=\"tooltip\"\n      class=\"filebrowseruss-pointer-logo\"\n      title=\"Go up to the parent level\" (click)=\"levelUp()\"\n      [ngStyle]=\"treeStyle\" tabindex=\"0\" (keydown.enter)=\"levelUp()\"\n      >\n  }\n\n  <div class=\"filebrowseruss-search\" [ngStyle] = \"searchStyle\">\n    <input #pathInputUSS\n      [(ngModel)]=\"path\"\n      list=\"searchUSSHistory\"\n      placeholder=\"Enter an absolute path...\"\n      [ngStyle] = \"inputStyle\"\n      class=\"filebrowseruss-search-input\"\n      (keydown.enter)=\"displayTree(path, false);\"\n      [disabled]=\"isLoading\"\n      (ngModelChange)=\"checkPathSlash($event)\">\n      <!-- TODO: make search history a directive to use in both uss and mvs-->\n      <datalist id=\"searchUSSHistory\">\n        @for (item of ussSearchHistory.searchHistoryVal; track item) {\n          <option [value]=\"item\"></option>\n        }\n      </datalist>\n    </div>\n    <div class=\"fa fa-spinner fa-spin filebrowseruss-loading-icon\" [hidden]=\"!isLoading\" style=\"margin-left: 9px;\"></div>\n    <div class=\"fa fa-refresh filebrowseruss-loading-icon\" title=\"Refresh whole directory\" (click)=\"displayTree(path, false);\" [hidden]=\"isLoading\" style=\"margin-left: 9px; cursor: pointer;\"></div>\n    <div class=\"file-tree-utilities\">\n      <div class=\"fa fa-minus-square-o filebrowser-icon\" title=\"Collapse Folders in Explorer\" (click)=\"collapseTree();\"></div>\n      <div class=\"fa fa-trash-o filebrowser-icon\" title=\"Delete\" (click)=\"showDeleteDialog(selectedNode);\"></div>\n      <div class=\"fa fa-folder-o filebrowser-icon\" title=\"Create New Folder\" (click)=\"showCreateFolderDialog(!selectedNode || (!selectedNode.parent && !selectedNode.directory) ? { 'path' : path } : selectedNode.directory ? selectedNode : selectedNode.parent);\"></div>\n      <div class=\"fa fa-eraser filebrowser-icon special-utility\" title=\"Clear Search History\" (click)=\"clearSearchHistory();\"></div>\n    </div>\n\n    <!-- Main tree -->\n    <div [hidden]=\"hideExplorer\" style=\"height: 100%;\">\n      <tree-root [treeData]=\"data\"\n        (clickEvent)=\"onNodeClick($event)\"\n        (dblClickEvent)=\"onNodeDblClick($event)\"\n        [ngStyle]=\"treeStyle\"\n        (rightClickEvent)=\"onNodeRightClick($event)\"\n        (panelRightClickEvent)=\"onPanelRightClick($event)\"\n        (dataChanged)=\"onDataChanged($event)\"\n      ></tree-root>\n    </div>\n\n    @if (showSearch) {\n      <div class=\"ui-inputgroup filebrowseruss-search-bottom-group\">\n        <span class=\"ui-inputgroup-addon\"><i class=\"fa fa-search filebrowseruss-search-bottom-icon\"></i></span>\n        <input type=\"text\" pInputText\n          placeholder=\"Search opened files/folders by name...\"\n          class=\"filebrowseruss-search-bottom-input\"\n          [formControl]=\"searchCtrl\"\n          #searchUSS>\n        </div>\n      }\n\n    </div>\n\n    <!--\n    This program and the accompanying materials are\n    made available under the terms of the Eclipse Public License v2.0 which accompanies\n    this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n    SPDX-License-Identifier: EPL-2.0\n\n    Copyright Contributors to the Zowe Project.\n    -->", styles: [".filebrowseruss-search{width:fit-content;min-width:250px;margin-left:5px;display:inline-block;height:40px}.filebrowseruss-search-input{width:100%;min-height:30px;font-family:sans-serif;font-size:15px;height:35px;background-color:#464646;color:#fff;padding-left:5px;border:0px}.filebrowseruss-search-bottom-group{margin-top:-17px;position:relative}.filebrowseruss-search-bottom-icon{font-size:large;position:absolute;color:#d4d4d4;padding-left:5px}.filebrowseruss-search-bottom-input{padding-left:28px;width:calc(100% - 5px);min-height:30px;font-family:sans-serif;font-size:15px;height:35px;background-color:#313030;color:#fff;border:0px;margin-top:-10px}.filebrowseruss-search-bottom-input:focus{outline:none;border:1px solid rgb(161,160,160);border-radius:3px}.filebrowseruss-dialog-menu{background:#fff;padding:0;height:auto;width:auto}.filebrowseruss-pointer-logo{width:20px;height:20px;filter:brightness(3);cursor:pointer}.filebrowseruss-node-deleting{opacity:.5}.filebrowseruss-loading-icon{margin-left:8px!important;font-size:large!important}.file-tree-utilities{overflow:hidden;border:1px solid #464646}.filebrowser-icon{margin-right:9px;float:right;cursor:pointer}.special-utility{margin-left:9px}\n"], dependencies: [{ kind: "directive", type: i7.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "directive", type: i8.NgSelectOption, selector: "option", inputs: ["ngValue", "value"] }, { kind: "directive", type: i8.ɵNgSelectMultipleOption, selector: "option", inputs: ["ngValue", "value"] }, { kind: "directive", type: i8.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i8.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i8.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i9.InputText, selector: "[pInputText]", inputs: ["variant"] }, { kind: "directive", type: i8.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }, { kind: "component", type: i10.TreeComponent, selector: "tree-root", inputs: ["treeData", "treeId", "style", "treeStyle"], outputs: ["clickEvent", "dblClickEvent", "rightClickEvent", "panelRightClickEvent"] }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FileBrowserUSSComponent, decorators: [{
            type: Component,
            args: [{ selector: 'file-browser-uss', encapsulation: ViewEncapsulation.None, providers: [UssCrudService, /*PersistentDataService,*/ SearchHistoryService], template: "\n<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n\n<div style=\"height: 100%;\">\n\n  <!-- Tabs, searchbar, and loading indicator -->\n  @if (showUpArrow) {\n    <img src=\"../../../assets/explorer-uparrow.png\"\n      data-toggle=\"tooltip\"\n      class=\"filebrowseruss-pointer-logo\"\n      title=\"Go up to the parent level\" (click)=\"levelUp()\"\n      [ngStyle]=\"treeStyle\" tabindex=\"0\" (keydown.enter)=\"levelUp()\"\n      >\n  }\n\n  <div class=\"filebrowseruss-search\" [ngStyle] = \"searchStyle\">\n    <input #pathInputUSS\n      [(ngModel)]=\"path\"\n      list=\"searchUSSHistory\"\n      placeholder=\"Enter an absolute path...\"\n      [ngStyle] = \"inputStyle\"\n      class=\"filebrowseruss-search-input\"\n      (keydown.enter)=\"displayTree(path, false);\"\n      [disabled]=\"isLoading\"\n      (ngModelChange)=\"checkPathSlash($event)\">\n      <!-- TODO: make search history a directive to use in both uss and mvs-->\n      <datalist id=\"searchUSSHistory\">\n        @for (item of ussSearchHistory.searchHistoryVal; track item) {\n          <option [value]=\"item\"></option>\n        }\n      </datalist>\n    </div>\n    <div class=\"fa fa-spinner fa-spin filebrowseruss-loading-icon\" [hidden]=\"!isLoading\" style=\"margin-left: 9px;\"></div>\n    <div class=\"fa fa-refresh filebrowseruss-loading-icon\" title=\"Refresh whole directory\" (click)=\"displayTree(path, false);\" [hidden]=\"isLoading\" style=\"margin-left: 9px; cursor: pointer;\"></div>\n    <div class=\"file-tree-utilities\">\n      <div class=\"fa fa-minus-square-o filebrowser-icon\" title=\"Collapse Folders in Explorer\" (click)=\"collapseTree();\"></div>\n      <div class=\"fa fa-trash-o filebrowser-icon\" title=\"Delete\" (click)=\"showDeleteDialog(selectedNode);\"></div>\n      <div class=\"fa fa-folder-o filebrowser-icon\" title=\"Create New Folder\" (click)=\"showCreateFolderDialog(!selectedNode || (!selectedNode.parent && !selectedNode.directory) ? { 'path' : path } : selectedNode.directory ? selectedNode : selectedNode.parent);\"></div>\n      <div class=\"fa fa-eraser filebrowser-icon special-utility\" title=\"Clear Search History\" (click)=\"clearSearchHistory();\"></div>\n    </div>\n\n    <!-- Main tree -->\n    <div [hidden]=\"hideExplorer\" style=\"height: 100%;\">\n      <tree-root [treeData]=\"data\"\n        (clickEvent)=\"onNodeClick($event)\"\n        (dblClickEvent)=\"onNodeDblClick($event)\"\n        [ngStyle]=\"treeStyle\"\n        (rightClickEvent)=\"onNodeRightClick($event)\"\n        (panelRightClickEvent)=\"onPanelRightClick($event)\"\n        (dataChanged)=\"onDataChanged($event)\"\n      ></tree-root>\n    </div>\n\n    @if (showSearch) {\n      <div class=\"ui-inputgroup filebrowseruss-search-bottom-group\">\n        <span class=\"ui-inputgroup-addon\"><i class=\"fa fa-search filebrowseruss-search-bottom-icon\"></i></span>\n        <input type=\"text\" pInputText\n          placeholder=\"Search opened files/folders by name...\"\n          class=\"filebrowseruss-search-bottom-input\"\n          [formControl]=\"searchCtrl\"\n          #searchUSS>\n        </div>\n      }\n\n    </div>\n\n    <!--\n    This program and the accompanying materials are\n    made available under the terms of the Eclipse Public License v2.0 which accompanies\n    this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n    SPDX-License-Identifier: EPL-2.0\n\n    Copyright Contributors to the Zowe Project.\n    -->", styles: [".filebrowseruss-search{width:fit-content;min-width:250px;margin-left:5px;display:inline-block;height:40px}.filebrowseruss-search-input{width:100%;min-height:30px;font-family:sans-serif;font-size:15px;height:35px;background-color:#464646;color:#fff;padding-left:5px;border:0px}.filebrowseruss-search-bottom-group{margin-top:-17px;position:relative}.filebrowseruss-search-bottom-icon{font-size:large;position:absolute;color:#d4d4d4;padding-left:5px}.filebrowseruss-search-bottom-input{padding-left:28px;width:calc(100% - 5px);min-height:30px;font-family:sans-serif;font-size:15px;height:35px;background-color:#313030;color:#fff;border:0px;margin-top:-10px}.filebrowseruss-search-bottom-input:focus{outline:none;border:1px solid rgb(161,160,160);border-radius:3px}.filebrowseruss-dialog-menu{background:#fff;padding:0;height:auto;width:auto}.filebrowseruss-pointer-logo{width:20px;height:20px;filter:brightness(3);cursor:pointer}.filebrowseruss-node-deleting{opacity:.5}.filebrowseruss-loading-icon{margin-left:8px!important;font-size:large!important}.file-tree-utilities{overflow:hidden;border:1px solid #464646}.filebrowser-icon{margin-right:9px;float:right;cursor:pointer}.special-utility{margin-left:9px}\n"] }]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZWJyb3dzZXJ1c3MuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemx1eC1maWxlLWV4cGxvcmVyL3NyYy9saWIvY29tcG9uZW50cy9maWxlYnJvd3NlcnVzcy9maWxlYnJvd3NlcnVzcy5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96bHV4LWZpbGUtZXhwbG9yZXIvc3JjL2xpYi9jb21wb25lbnRzL2ZpbGVicm93c2VydXNzL2ZpbGVicm93c2VydXNzLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBOzs7Ozs7OztFQVFFO0FBRUYsT0FBTyxFQUNMLFNBQVMsRUFBYyxZQUFZLEVBQUUsS0FBSyxFQUMxQyxNQUFNLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQ3ZELE1BQU0sZUFBZSxDQUFDO0FBQ3ZCLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQTtBQUM1QyxPQUFPLEVBQWMsRUFBRSxFQUFnQixNQUFNLE1BQU0sQ0FBQztBQUNwRCxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ2xGLE9BQU8sRUFBRSx1QkFBdUIsRUFBZ0QsTUFBTSxxQ0FBcUMsQ0FBQztBQUM1SCxPQUFPLEVBQWEsZUFBZSxFQUFnQixNQUFNLDBCQUEwQixDQUFDO0FBRXBGLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBQy9GLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUNuRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzREFBc0QsQ0FBQztBQUN6RixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sa0RBQWtELENBQUM7QUFDbkYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBQ2pGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLDREQUE0RCxDQUFDO0FBQ2xHLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBQzVGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBQ3RGLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxzQkFBc0IsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2xILE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBRTVELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEtBQUssQ0FBQyxNQUFNLFFBQVEsQ0FBQztBQUk1QixPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFakUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0scUNBQXFDLENBQUM7Ozs7Ozs7Ozs7OztBQUUzRTtpRkFDaUY7QUFFakYsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDO0FBVXhCLE1BQU0sT0FBTyx1QkFBdUI7SUF5Q2xDLFlBQW9CLFVBQXNCLEVBQ2hDLE1BQXNCLEVBQ3RCLEtBQW1CLEVBQ3BCLGdCQUFzQyxFQUN0QyxNQUFpQixFQUNqQixRQUFxQixFQUNyQixlQUFrQyxFQUNPLEdBQXlCLEVBQ2hCLGNBQW1CLEVBQ2pCLGdCQUFnRCxFQUN2QyxhQUEwQztRQVY1RixlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQ2hDLFdBQU0sR0FBTixNQUFNLENBQWdCO1FBQ3RCLFVBQUssR0FBTCxLQUFLLENBQWM7UUFDcEIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFzQjtRQUN0QyxXQUFNLEdBQU4sTUFBTSxDQUFXO1FBQ2pCLGFBQVEsR0FBUixRQUFRLENBQWE7UUFDckIsb0JBQWUsR0FBZixlQUFlLENBQW1CO1FBQ08sUUFBRyxHQUFILEdBQUcsQ0FBc0I7UUFDaEIsbUJBQWMsR0FBZCxjQUFjLENBQUs7UUFDakIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFnQztRQUN2QyxrQkFBYSxHQUFiLGFBQWEsQ0FBNkI7UUEvQnhHLGtCQUFhLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLG9EQUFvRDtRQWlEdkYsMEJBQTBCO1FBQ2hCLGdCQUFXLEdBQXNCLElBQUksWUFBWSxFQUFPLENBQUM7UUFDekQsZ0JBQVcsR0FBc0IsSUFBSSxZQUFZLEVBQU8sQ0FBQztRQUN6RCxjQUFTLEdBQXNCLElBQUksWUFBWSxFQUFPLENBQUM7UUFDdkQsaUJBQVksR0FBc0IsSUFBSSxZQUFZLEVBQU8sQ0FBQztRQUMxRCxtQkFBYyxHQUFzQixJQUFJLFlBQVksRUFBTyxDQUFDO1FBQ3RFLHVFQUF1RTtRQUM3RCxtQkFBYyxHQUFzQixJQUFJLFlBQVksRUFBTyxDQUFDO1FBQzVELGlCQUFZLEdBQXNCLElBQUksWUFBWSxFQUFPLENBQUM7UUFDMUQsaUJBQVksR0FBc0IsSUFBSSxZQUFZLEVBQU8sQ0FBQztRQUMxRCxjQUFTLEdBQXNCLElBQUksWUFBWSxFQUFPLENBQUM7UUFDdkQsZ0JBQVcsR0FBc0IsSUFBSSxZQUFZLEVBQU8sQ0FBQztRQUN6RCxtQkFBYyxHQUFzQixJQUFJLFlBQVksRUFBTyxDQUFDO1FBQzVELGVBQVUsR0FBc0IsSUFBSSxZQUFZLEVBQU8sQ0FBQztRQUN4RCxpQkFBWSxHQUFzQixJQUFJLFlBQVksRUFBTyxDQUFDO1FBL0JsRSxzREFBc0Q7UUFDdEQsbURBQW1EO1FBQ25ELElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1FBQzdCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyw2RUFBNkU7UUFDOUYsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2YsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7UUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdkIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFDeEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDO1FBQ3BDLElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQzlELFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FDbEIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxLQUFLLENBQUMsQ0FBQSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNELElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDO0lBQzNCLENBQUM7SUF3QkQsUUFBUTtRQUNOLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLElBQUksQ0FDL0IsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2YsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZ0RBQWdELEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDckUsT0FBTyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQ0gsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDakIsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDbkIsSUFBSSxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO29CQUNyRixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztvQkFDMUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQzVCLENBQUM7cUJBQU0sQ0FBQztvQkFDTixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztvQkFDakIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDdkIsQ0FBQztnQkFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUN2QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsOEJBQThCLEVBQUUsQ0FBQztRQUN0Qyw2RkFBNkY7UUFDN0YsdUNBQXVDO1FBQ3ZDLHlCQUF5QjtRQUN6QixvQ0FBb0M7UUFDcEMsOENBQThDO1FBQzlDLCtDQUErQztRQUMvQyx1SkFBdUo7UUFDdkosV0FBVztRQUNYLDBDQUEwQztRQUMxQyxPQUFPO1FBQ1Asd0NBQXdDO1FBQ3hDLDhCQUE4QjtRQUM5QiwyQkFBMkI7SUFDN0IsQ0FBQztJQUVELFdBQVc7UUFDVCxxRUFBcUU7UUFDckUseUJBQXlCO1FBQ3pCLG9DQUFvQztRQUNwQyxJQUFJO1FBQ0osSUFBSSxJQUFJLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsdUJBQXVCLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDN0MsQ0FBQztJQUNILENBQUM7SUFFRCxhQUFhO1FBQ1gsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQztJQUN2QyxDQUFDO0lBRUQsZUFBZTtRQUNiLG1GQUFtRjtRQUNuRixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7SUFDbkIsQ0FBQztJQUVELHFCQUFxQjtRQUNuQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUN0QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxJQUFJLENBQ3pDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFDYixHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQzdCLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxDQUN2QyxDQUFDO0lBQ0osQ0FBQztJQUVELHFCQUFxQjtRQUNuQixtREFBbUQ7UUFDbkQsbUVBQW1FO1FBQ25FLHNFQUFzRTtJQUN4RSxDQUFDO0lBRUQsOEJBQThCO1FBQzVCLElBQUksQ0FBQyx3QkFBd0IsR0FBRztZQUM5QjtnQkFDRSxJQUFJLEVBQUUsaUNBQWlDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtvQkFDcEQsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ2hELENBQUM7YUFDRjtZQUNEO2dCQUNFLElBQUksRUFBRSxrQkFBa0IsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO29CQUNyQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ2xELENBQUM7YUFDRjtZQUNEO2dCQUNFLElBQUksRUFBRSw0QkFBNEIsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO29CQUMvQyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3BELENBQUM7YUFDRjtZQUNEO2dCQUNFLElBQUksRUFBRSxrQkFBa0IsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO29CQUNyQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDO2FBQ0Y7WUFDRDtnQkFDRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUU7b0JBQzNCLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDaEQsQ0FBQzthQUNGO1lBQ0Q7Z0JBQ0UsSUFBSSxFQUFFLFVBQVUsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO29CQUM3QixJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUM5QyxDQUFDO2FBQ0Y7WUFDRDtnQkFDRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUU7b0JBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3RDLENBQUM7YUFDRjtZQUNEO2dCQUNFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtvQkFDekIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDdkMsQ0FBQzthQUNGO1lBQ0Q7Z0JBQ0UsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO29CQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUN2QyxDQUFDO2FBQ0Y7WUFDRDtnQkFDRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUU7b0JBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7YUFDRjtZQUNEO2dCQUNFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtvQkFDM0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUMvQyxDQUFDO2FBQ0Y7WUFDRDtnQkFDRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUU7b0JBQzNCLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQzlDLENBQUM7YUFDRjtZQUNEO2dCQUNFLElBQUksRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtvQkFDL0IsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUNuRCxDQUFDO2FBQ0Y7U0FDRixDQUFDO1FBRUYsSUFBSSxDQUFDLDBCQUEwQixHQUFHO1lBQ2hDO2dCQUNFLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtvQkFDNUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLElBQUksS0FBSyxDQUFDLENBQUM7Z0JBQ3RGLENBQUM7YUFDRjtZQUNEO2dCQUNFLElBQUksRUFBRSw0QkFBNEIsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO29CQUMvQyxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUE7Z0JBQ25ELENBQUM7YUFDRjtZQUNEO2dCQUNFLElBQUksRUFBRSxrQkFBa0IsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO29CQUNyQyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO2dCQUM3QyxDQUFDO2FBQ0Y7WUFDRDtnQkFDRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtvQkFDckMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO2dCQUMvQyxDQUFDO2FBQ0Y7WUFDRDtnQkFDRSxJQUFJLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtvQkFDckMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUNuRCxDQUFDO2FBQ0Y7WUFDRDtnQkFDRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtvQkFDMUMsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUNyRCxDQUFDO2FBQ0Y7WUFDRDtnQkFDRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUU7b0JBQzlCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztnQkFDL0MsQ0FBQzthQUNGO1lBQ0Q7Z0JBQ0UsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO29CQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUN2QyxDQUFDO2FBQ0Y7WUFDRDtnQkFDRSxJQUFJLEVBQUUsV0FBVyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUU7b0JBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQ3ZDLENBQUM7YUFDRjtZQUNEO2dCQUNFLElBQUksRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtvQkFDM0IsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO2dCQUMvQyxDQUFDO2FBQ0Y7WUFDRDtnQkFDRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUU7b0JBQzNCLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUE7Z0JBQzdDLENBQUM7YUFDRjtZQUNEO2dCQUNFLElBQUksRUFBRSxZQUFZLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtvQkFDL0IsSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO2dCQUNsRCxDQUFDO2FBQ0Y7U0FDRixDQUFDO1FBRUYsSUFBSSxDQUFDLHlCQUF5QixHQUFHO1lBQy9CO2dCQUNFLElBQUksRUFBRSxrQkFBa0IsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO29CQUNyQyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7Z0JBRXRCLENBQUM7YUFDRjtZQUNEO2dCQUNFLElBQUksRUFBRSxrQkFBa0IsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO29CQUNyQyxJQUFJLFNBQVMsR0FBRzt3QkFDZCxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUk7cUJBQ2hCLENBQUE7b0JBQ0QsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxDQUFDO2dCQUN2QyxDQUFDO2FBQ0Y7WUFDRDtnQkFDRSxJQUFJLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRTtvQkFDMUMsSUFBSSxTQUFTLEdBQUc7d0JBQ2QsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJO3FCQUNoQixDQUFBO29CQUNELElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztnQkFFekMsQ0FBQzthQUNGO1lBQ0Q7Z0JBQ0UsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO29CQUM5QixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7Z0JBQy9DLENBQUM7YUFDRjtTQUNGLENBQUM7SUFDSixDQUFDO0lBRUQsUUFBUSxDQUFDLGdCQUFxQjtRQUM1QixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsSUFBSSxDQUFDLGVBQWUsS0FBSyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3JHLElBQUksSUFBSSxDQUFDLGVBQWUsSUFBSSxJQUFJLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsSUFBSSxDQUFFLHVDQUF1QztZQUMzRTtnQkFDRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUU7b0JBQzFCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFBO2dCQUN6RSxDQUFDO2FBQ0YsQ0FDRixDQUFDO1lBQ0YsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBRSxpREFBaUQ7WUFDcEY7Z0JBQ0UsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO29CQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQTtnQkFDeEQsQ0FBQzthQUNGLENBQ0YsQ0FBQztRQUNKLENBQUM7UUFDRCxJQUFJLENBQUMsZUFBZSxHQUFHLGdCQUFnQixDQUFDO1FBQ3hDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVELE9BQU8sQ0FBQyxnQkFBcUI7UUFDM0IsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuSCxJQUFJLENBQUMseUJBQXlCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ25ILENBQUM7UUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLGVBQWUsS0FBSyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3BHLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUUsdUNBQXVDO1FBQzNFO1lBQ0UsSUFBSSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO2dCQUMxQixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQTtZQUN4RSxDQUFDO1NBQ0YsQ0FDRixDQUFDO1FBQ0YsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBRSxpREFBaUQ7UUFDcEY7WUFDRSxJQUFJLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUU7Z0JBQzFCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFBO1lBQ3ZELENBQUM7U0FDRixDQUNGLENBQUM7UUFDRixJQUFJLENBQUMsZUFBZSxHQUFHLGdCQUFnQixDQUFDO1FBQ3hDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVELFNBQVMsQ0FBQyxRQUFhLEVBQUUsZUFBb0IsRUFBRSxLQUFjO1FBQzNELElBQUksV0FBVyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFDaEMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGFBQWEsSUFBSSxLQUFLLGVBQWUsYUFBYSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzFFLElBQUksV0FBVyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUNsQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxXQUFXLEdBQUcsMERBQTBELEVBQzdHLFNBQVMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1lBQ3JDLE9BQU87UUFDVCxDQUFDO1FBQ0QsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDeEQsUUFBUSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUMxQixJQUFJLE1BQU0sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsV0FBVyxHQUFHLGtEQUFrRCxFQUNyRyxTQUFTLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztnQkFDckMsT0FBTztZQUNULENBQUM7aUJBQU0sQ0FBQztnQkFDTixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztnQkFDdEIsSUFBSSxtQkFBbUIsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztnQkFDdkUsbUJBQW1CLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUNyQyx3RkFBd0Y7b0JBQ3hGLEtBQUssSUFBSSxDQUFDLEdBQVcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO3dCQUN2RCxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLENBQUM7NEJBQ25FLElBQUksS0FBSyxFQUFFLENBQUM7Z0NBQ1YsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLEdBQUcsV0FBVyxHQUFHLG9CQUFvQixHQUFHLGVBQWUsR0FBRyxJQUFJLEdBQUcsSUFBSSxHQUFHLGlDQUFpQyxFQUM1SSxTQUFTLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztnQ0FDbEMsT0FBTzs0QkFDVCxDQUFDOzRCQUNELENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQzs0QkFDUCxJQUFJLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ2pDLENBQUM7b0JBQ0gsQ0FBQztvQkFFRCxJQUFJLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxlQUFlLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQzt5QkFDbkYsU0FBUyxDQUNSLElBQUksQ0FBQyxFQUFFO3dCQUNMLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7NEJBQzFCLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQ0FDaEYsSUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQztnQ0FDOUM7aUdBQ2lFO2dDQUNqRSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztnQ0FDM0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7NEJBQzVDLENBQUM7aUNBQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLGVBQWUsRUFBRSxDQUFDO2dDQUN4Qzs0RkFDNEQ7Z0NBQzVELElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQzs0QkFDcEMsQ0FBQzt3QkFDSCxDQUFDO3dCQUNELElBQUksS0FBSyxFQUFFLENBQUM7NEJBQ1YsK0ZBQStGOzRCQUMvRixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQzs0QkFDdEIsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7NEJBQzVCLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7NEJBQ25ILElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7NEJBRWpILDBCQUEwQjs0QkFDMUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUM7aUNBQ3hDLFNBQVMsQ0FDUixJQUFJLENBQUMsRUFBRTtnQ0FDTCxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztnQ0FDdkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQ0FDM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxFQUFFLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDOzRCQUNuRixDQUFDLEVBQ0QsS0FBSyxDQUFDLEVBQUU7Z0NBQ04sSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUMsdUJBQXVCO29DQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQywwQ0FBMEMsR0FBRyxXQUFXLEdBQUcsMEJBQTBCLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFDcEgsU0FBUyxFQUFFLG1CQUFtQixDQUFDLENBQUM7Z0NBQ3BDLENBQUM7cUNBQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUMsV0FBVztvQ0FDN0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEdBQUcsV0FBVyxHQUFHLCtDQUErQyxFQUM3RyxTQUFTLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztvQ0FDckMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQ0FDN0IsQ0FBQztxQ0FBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQyxhQUFhO29DQUN4RSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyx5Q0FBeUMsR0FBRyxXQUFXLEdBQUcsaURBQWlELEVBQzVILFNBQVMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO2dDQUN2QyxDQUFDO3FDQUFNLENBQUMsQ0FBQyxTQUFTO29DQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxrREFBa0QsR0FBRyxLQUFLLENBQUMsTUFBTSxHQUFHLGtCQUFrQixHQUFHLFdBQVcsR0FBRywwQkFBMEIsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUNoSyxTQUFTLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztnQ0FDcEMsQ0FBQztnQ0FDRCxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztnQ0FDdkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7NEJBQ3pCLENBQUMsQ0FDRixDQUFDO3dCQUNOLENBQUM7NkJBQU0sQ0FBQzs0QkFDTixJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQzs0QkFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxFQUFFLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO3dCQUNuRixDQUFDO29CQUNILENBQUMsRUFDRCxLQUFLLENBQUMsRUFBRTt3QkFDTixJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQyx1QkFBdUI7NEJBQ2xELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGdFQUFnRSxHQUFHLFdBQVcsR0FBRywyQkFBMkIsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUMzSSxTQUFTLEVBQUUsbUJBQW1CLENBQUMsQ0FBQzt3QkFDcEMsQ0FBQzs2QkFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQyxXQUFXOzRCQUM3QyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxXQUFXLEdBQUcsbUJBQW1CLEVBQ3RFLFNBQVMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO3dCQUN2QyxDQUFDOzZCQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDLGFBQWE7NEJBQy9DLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLHVDQUF1QyxHQUFHLFdBQVcsR0FBRyw2REFBNkQsRUFDdEksU0FBUyxFQUFFLHNCQUFzQixDQUFDLENBQUM7d0JBQ3ZDLENBQUM7NkJBQU0sQ0FBQyxDQUFDLFNBQVM7NEJBQ2hCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQyxNQUFNLEdBQUcsa0JBQWtCLEdBQUcsV0FBVyxHQUFHLDBCQUEwQixHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQy9ILFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO3dCQUNwQyxDQUFDO3dCQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO3dCQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDekIsQ0FBQyxDQUNGLENBQUM7b0JBRUosVUFBVSxDQUFDLEdBQUcsRUFBRTt3QkFDZCxJQUFJLGdCQUFnQixDQUFDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQzs0QkFDckMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLFdBQVcsR0FBRyx5REFBeUQsRUFDckcsU0FBUyxFQUFFLG9CQUFvQixDQUFDLENBQUM7d0JBQ3JDLENBQUM7b0JBQ0gsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUNYLENBQUMsRUFDQyxLQUFLLENBQUMsRUFBRTtvQkFDTixJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQyxtQkFBbUI7d0JBQzlDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLHlEQUF5RCxFQUMxRSxTQUFTLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztvQkFDdkMsQ0FBQzt5QkFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksR0FBRyxFQUFFLENBQUM7d0JBQy9CLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLDZDQUE2QyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQzdFLFNBQVMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO29CQUN2QyxDQUFDO3lCQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQzt3QkFDakMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0NBQWdDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFDaEUsU0FBUyxFQUFFLG9CQUFvQixDQUFDLENBQUM7b0JBQ3JDLENBQUM7eUJBQU0sQ0FBQzt3QkFDTixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUM3RCxTQUFTLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztvQkFDdkMsQ0FBQztvQkFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztnQkFDekIsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDO1FBQ0gsQ0FBQyxFQUNDLEtBQUssQ0FBQyxFQUFFO1lBQ04sSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUMsb0ZBQW9GO2dCQUMvRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQywwQkFBMEIsR0FBRyxXQUFXLEdBQUcscUJBQXFCLEVBQ2pGLFNBQVMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7WUFDRCxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQztZQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxvQkFBb0IsQ0FBQyxnQkFBcUI7UUFDeEMsTUFBTSxjQUFjLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztRQUM3QyxjQUFjLENBQUMsSUFBSSxHQUFHO1lBQ3BCLEtBQUssRUFBRSxnQkFBZ0I7U0FDeEIsQ0FBQTtRQUNELGNBQWMsQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBRWxDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLG1CQUFtQixFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFRCxlQUFlLENBQUMsSUFBUztRQUN2QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQztRQUNyRSxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3hCLElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDeEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFFeEIsSUFBSSxRQUFRLEdBQUcsQ0FBQyxJQUFpQixFQUFFLEVBQUU7WUFDbkMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3ZELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1lBQ3ZCLElBQUksWUFBWSxHQUFHLFdBQVcsQ0FBQyxLQUFLLENBQUM7WUFDckMsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ3pELElBQUksT0FBTyxJQUFJLFlBQVksRUFBRSxDQUFDO2dCQUM1QixJQUFJLE9BQU8sR0FBRyxHQUFHLGFBQWEsSUFBSSxZQUFZLEVBQUUsQ0FBQztnQkFDakQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FDaEQsR0FBRyxDQUFDLEVBQUU7b0JBQ0osSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLE9BQU8sR0FBRyxRQUFRLEdBQUcsWUFBWSxHQUFHLEdBQUcsRUFDdEUsU0FBUyxFQUFFLG9CQUFvQixDQUFDLENBQUM7b0JBQ25DLDZIQUE2SDtvQkFDN0gseUNBQXlDO29CQUN6QyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3RELElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsbURBQW1EO3dCQUN4RSxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUNwRSxJQUFJLFVBQVUsRUFBRSxDQUFDOzRCQUNmLFVBQVUsQ0FBQyxLQUFLLEdBQUcsWUFBWSxDQUFDOzRCQUNoQyxVQUFVLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQzs0QkFDMUIsVUFBVSxDQUFDLElBQUksR0FBRyxZQUFZLENBQUM7d0JBQ2pDLENBQUM7b0JBQ0gsQ0FBQztvQkFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLFlBQVksQ0FBQztvQkFDMUIsSUFBSSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUM7b0JBQ3BCLElBQUksQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDO29CQUN6QixPQUFPO2dCQUNULENBQUMsRUFDRCxLQUFLLENBQUMsRUFBRTtvQkFDTixJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQyx1QkFBdUI7d0JBQ2xELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcscUJBQXFCLEVBQ3pFLFNBQVMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO29CQUN2QyxDQUFDO3lCQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDLFdBQVc7d0JBQzdDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLDBDQUEwQyxFQUM3RSxTQUFTLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztvQkFDdkMsQ0FBQzt5QkFBTSxDQUFDLENBQUMsU0FBUzt3QkFDaEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxZQUFZLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFDOUUsU0FBUyxFQUFFLG1CQUFtQixDQUFDLENBQUM7b0JBQ3BDLENBQUM7b0JBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3ZCLE9BQU87Z0JBQ1QsQ0FBQyxDQUNGLENBQUM7WUFDSixDQUFDO1FBQ0gsQ0FBQyxDQUFBO1FBQ0QsSUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRCxXQUFXLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSx3QkFBd0IsQ0FBQyxDQUFDO1FBQ3pELFdBQVcsQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDO1FBQzVCLFdBQVcsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFJLFlBQTRCLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztRQUNwRSxXQUFXLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBSSxZQUE0QixDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDdEUsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUNqQixJQUFJLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksT0FBTyxJQUFJLENBQUMsQ0FBQyxPQUFPLElBQUksRUFBRSxFQUFFLENBQUM7Z0JBQ3pELENBQUMsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO2dCQUM3QixDQUFDLENBQUMsZUFBZSxFQUFFLENBQUM7Z0JBQ3BCLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztnQkFDbkIsQ0FBQyxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7Z0JBQ3RCLFdBQVcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDbkIsT0FBTztZQUNULENBQUM7UUFDSCxDQUFDLENBQUE7UUFDRCxXQUFXLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ2hELFdBQVcsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDO1lBQzlCLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQTtRQUN4QixDQUFDLENBQUM7UUFDRixZQUFZLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFDaEUsV0FBVyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3BCLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN2QixDQUFDO0lBRUQscUJBQXFCLENBQUMsZ0JBQXFCO1FBQ3pDLE1BQU0sY0FBYyxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7UUFDN0MsY0FBYyxDQUFDLElBQUksR0FBRztZQUNwQixLQUFLLEVBQUUsZ0JBQWdCO1NBQ3hCLENBQUE7UUFDRCxjQUFjLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQztRQUUvQixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUN6RSxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBYSxFQUFFLEVBQUU7WUFDbEQsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDUixJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3hDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxlQUFlLENBQUMsZ0JBQXFCO1FBQ25DLE1BQU0sY0FBYyxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7UUFDN0MsY0FBYyxDQUFDLElBQUksR0FBRztZQUNwQixLQUFLLEVBQUUsZ0JBQWdCO1NBQ3hCLENBQUE7UUFDRCxjQUFjLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztRQUVsQyxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxjQUFjLENBQUMsQ0FBQztRQUN2RSxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBYSxFQUFFLEVBQUU7WUFDbEQsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDUixJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ3hDLENBQUM7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxnQkFBcUI7UUFDcEMsSUFBSSxJQUFJLENBQUMsZ0NBQWdDLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLGdDQUFnQyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7WUFDM0csT0FBTztRQUNULENBQUM7UUFFRCxNQUFNLGdCQUFnQixHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7UUFDL0MsZ0JBQWdCLENBQUMsSUFBSSxHQUFHO1lBQ3RCLEtBQUssRUFBRSxnQkFBZ0I7WUFDdkIsS0FBSyxFQUFFLE9BQU87U0FDZixDQUFBO1FBRUQsSUFBSSxhQUFhLEdBQWtDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3ZHLE1BQU0sa0JBQWtCLEdBQUcsYUFBYSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFO1lBQ2pGLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzVDLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELGVBQWUsQ0FBQyxnQkFBcUI7UUFDbkMsSUFBSSxVQUFVLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDO1FBQ3ZDLElBQUksUUFBUSxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQztRQUNyQyxJQUFJLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQztRQUN0QyxJQUFJLEdBQUcsR0FBVyxRQUFRLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFekUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsUUFBUSxFQUFFLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ2hGLDJEQUEyRDtRQUM3RCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxzQkFBc0IsQ0FBQyxnQkFBcUI7UUFDMUMsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLGtDQUFrQztZQUM3RCxJQUFJLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsbUVBQW1FLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDOUksT0FBTztZQUNULENBQUM7UUFDSCxDQUFDO2FBQU0sQ0FBQyxDQUFDLDRCQUE0QjtZQUNuQyxJQUFJLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxnQkFBZ0IsRUFBRSxtRUFBbUUsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDO2dCQUN6SSxPQUFPO1lBQ1QsQ0FBQztRQUNILENBQUM7UUFFRCxNQUFNLGtCQUFrQixHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7UUFDakQsa0JBQWtCLENBQUMsSUFBSSxHQUFHO1lBQ3hCLEtBQUssRUFBRSxnQkFBZ0I7WUFDdkIsS0FBSyxFQUFFLE9BQU87U0FDZixDQUFBO1FBRUQsSUFBSSxhQUFhLEdBQW9DLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDN0csTUFBTSxZQUFZLEdBQUcsYUFBYSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsRUFBRTtZQUN6RjtzRkFDMEU7WUFDMUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUNySCwyRkFBMkY7WUFDM0YsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0YsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsb0JBQW9CLENBQUMsZ0JBQXFCO1FBQ3hDLElBQUksZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxrQ0FBa0M7WUFDN0QsSUFBSSxJQUFJLENBQUMsZ0NBQWdDLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLDhEQUE4RCxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ3pJLE9BQU87WUFDVCxDQUFDO1FBQ0gsQ0FBQzthQUFNLENBQUMsQ0FBQyw0QkFBNEI7WUFDbkMsSUFBSSxJQUFJLENBQUMsZ0NBQWdDLENBQUMsZ0JBQWdCLEVBQUUsOERBQThELENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDcEksT0FBTztZQUNULENBQUM7UUFDSCxDQUFDO1FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO1FBQy9DLGdCQUFnQixDQUFDLElBQUksR0FBRztZQUN0QixLQUFLLEVBQUUsZ0JBQWdCO1lBQ3ZCLEtBQUssRUFBRSxPQUFPO1NBQ2YsQ0FBQTtRQUVELElBQUksYUFBYSxHQUFrQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztRQUN2RyxNQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsaUJBQWlCLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO1lBQy9GO3NGQUMwRTtZQUMxRSxJQUFJLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDO1lBQzNILDJGQUEyRjtZQUMzRixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN6RixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxnQkFBcUI7UUFDcEMsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO1FBQ2pELGtCQUFrQixDQUFDLElBQUksR0FBRztZQUN4QixLQUFLLEVBQUUsZ0JBQWdCLElBQUksSUFBSSxDQUFDLElBQUk7WUFDcEMsS0FBSyxFQUFFLE9BQU87U0FDZixDQUFBO1FBRUQsSUFBSSxhQUFhLEdBQThCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO1FBQ2pHLE1BQU0sTUFBTSxHQUFHLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7WUFDbkYsSUFBSSxnQkFBZ0IsSUFBSSxnQkFBZ0IsQ0FBQyxJQUFJLElBQUksZ0JBQWdCLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztnQkFDcEYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDdEMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMzRCxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNuQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEMsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELFFBQVEsQ0FBQyxnQkFBcUI7UUFDNUIsSUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsSUFBSSxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUMvQixJQUFJLEdBQUcsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLFFBQVEsYUFBYSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLENBQUMsYUFBYSxFQUFFLFNBQVMsa0JBQWtCLENBQUMsNkJBQTZCLGdCQUFnQixDQUFDLElBQUksdUJBQXVCLENBQUMsRUFBRSxDQUFDO1FBQ3hPLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLGFBQWEsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsRUFBRSxDQUFDLGFBQWEsRUFBRSxTQUFTLGtCQUFrQixDQUFDLDhCQUE4QixnQkFBZ0IsQ0FBQyxJQUFJLHNCQUFzQixDQUFDLEVBQUUsQ0FBQztRQUN4TyxDQUFDO1FBQ0QsU0FBUyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtZQUM1QyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1lBQzNDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1FBQ2xGLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUU7WUFDWixPQUFPLENBQUMsS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7UUFDcEQsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsUUFBUSxDQUFDLGdCQUFxQjtRQUM1QixTQUFTLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQzdELElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDN0MsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRTtZQUNaLE9BQU8sQ0FBQyxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQztRQUNwRCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRCxpQkFBaUIsQ0FBQyxnQkFBcUI7UUFDckMsTUFBTSxNQUFNLEdBQUcsSUFBSSxlQUFlLEVBQUUsQ0FBQztRQUNyQyxNQUFNLENBQUMsSUFBSSxHQUFHO1lBQ1osSUFBSSxFQUFFLGdCQUFnQjtTQUN2QixDQUFBO1FBQ0QsTUFBTSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDMUIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDN0QsU0FBUyxDQUFDLFdBQVcsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQWEsRUFBRSxFQUFFO1lBQ2xELElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN4QyxDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRUQsWUFBWTtRQUNWLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ25DLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQywrRUFBK0U7WUFDekgsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUMxQixJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQTtZQUNoRCxDQUFDO1FBQ0gsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsNkVBQTZFO1lBQzVHLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELDRIQUE0SDtJQUM1SCxnQkFBZ0IsQ0FBQyxZQUFxQjtRQUNwQyxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUNyQyxPQUFPO1FBQ1QsQ0FBQztRQUNELE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUN2QixJQUFJLE9BQU8sWUFBWSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ3JDLFlBQVksR0FBRyxXQUFXLENBQUM7UUFDN0IsQ0FBQztRQUNELElBQUksWUFBWSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3JCLFlBQVksRUFBRSxDQUFDO1lBQ2YsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM3RCxDQUFDO0lBQ0gsQ0FBQztJQUVELHNDQUFzQztJQUN0QyxvQ0FBb0M7SUFDcEMsSUFBSTtJQUVKLFdBQVcsQ0FBQyxNQUFXO1FBQ3JCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ3pDLElBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNoQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ2xDLElBQUksSUFBSSxDQUFDLGdDQUFnQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLDhDQUE4QyxDQUFDLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ3BILE9BQU87WUFDVCxDQUFDO1lBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ25DLENBQUM7YUFDSSxDQUFDO1lBQ0osSUFBSSxJQUFJLENBQUMsZ0NBQWdDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUseUNBQXlDLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDL0csT0FBTztZQUNULENBQUM7WUFDRCxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsQ0FBQztJQUNILENBQUM7SUFFRCxjQUFjLENBQUMsTUFBVztRQUN4QixJQUFJLFVBQVUsR0FBRyxLQUFLLENBQUMsQ0FBQyxrRkFBa0Y7UUFDMUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztRQUMvQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDcEMsSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2xDLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxNQUFXO1FBQzFCLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDdkIsSUFBSSxvQkFBb0IsQ0FBQztRQUV6QixJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNuQixvQkFBb0IsR0FBRyxJQUFJLENBQUMsMEJBQTBCLENBQUM7WUFDdkQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDM0IsQ0FBQzthQUFNLENBQUM7WUFDTixvQkFBb0IsR0FBRyxJQUFJLENBQUMsd0JBQXdCLENBQUM7WUFDckQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ2xDLENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN2QixJQUFJLG1CQUFtQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdEosMEhBQTBIO1lBQzFILElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUMscUNBQXFDO2dCQUMvRCxJQUFJLGdCQUFnQixHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxDQUFDLGtCQUFrQjtnQkFDNUUsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxvQkFBb0IsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN4SSxDQUFDO1FBQ0gsQ0FBQztRQUVELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUM7UUFDN0IsSUFBSSxDQUFDLGlCQUFpQixHQUFHLE1BQU0sQ0FBQztRQUNoQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbEMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUN4QyxDQUFDO0lBRUQsaUJBQWlCLENBQUMsTUFBVztRQUMzQixJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUN2QixJQUFJLG1CQUFtQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNwSSwwSEFBMEg7WUFDMUgsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxxQ0FBcUM7Z0JBQy9ELElBQUksZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQyxrQkFBa0I7Z0JBQzlELG1CQUFtQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxJQUFJLENBQUMseUJBQXlCLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDcEksQ0FBQztRQUNILENBQUM7UUFDRCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsTUFBTSxDQUFDO0lBQ2xDLENBQUM7SUFFRCxhQUFhLENBQUMsTUFBVztRQUN2QixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQsYUFBYSxDQUFDLE1BQVc7UUFDdkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEMsQ0FBQztJQUVELE1BQU0sQ0FBQyxDQUFNLEVBQUUsQ0FBTTtRQUNuQixJQUFJLENBQUMsQ0FBQyxTQUFTLEtBQUssQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxDQUFDLFNBQVMsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDekIsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUNaLENBQUM7aUJBQU0sQ0FBQztnQkFDTixPQUFPLENBQUMsQ0FBQztZQUNYLENBQUM7UUFDSCxDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7Z0JBQ2hELE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDWixDQUFDO2lCQUFNLENBQUM7Z0JBQ04sT0FBTyxDQUFDLENBQUM7WUFDWCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxZQUFZO1FBQ1YsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUMxQixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUN6QixLQUFLLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ2xELElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksSUFBSSxFQUFFLENBQUM7Z0JBQ2xDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQztZQUNoQyxDQUFDO1FBQ0gsQ0FBQztRQUNELElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDcEMsQ0FBQztJQUVELDJGQUEyRjtJQUMzRix1RkFBdUY7SUFDaEYsV0FBVyxDQUFDLElBQVksRUFBRSxNQUFlO1FBQzlDLGtJQUFrSTtRQUNsSSxJQUFJLElBQUksS0FBSyxTQUFTLElBQUksSUFBSSxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQ3RDLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ25CLENBQUM7YUFBTSxJQUFJLE9BQU8sSUFBSSxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLHFGQUFxRixFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzNHLE9BQU87UUFDVCxDQUFDO1FBRUQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUM7UUFDekIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDaEQsT0FBTyxDQUFDLFNBQVMsQ0FDZixLQUFLLENBQUMsRUFBRTtZQUNOLElBQUksS0FBSyxDQUFDLE9BQU8sSUFBSSxTQUFTLEVBQUUsQ0FBQyxDQUFDLHlGQUF5RjtnQkFDekgsT0FBTztZQUNULENBQUM7WUFDRCxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEMsTUFBTSxZQUFZLEdBQW1CLEVBQUUsQ0FBQztZQUN4QyxLQUFLLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztnQkFDdEQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUMvQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7b0JBQy9CLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQztvQkFDakMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEdBQUcsY0FBYyxDQUFDO29CQUNoRCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksR0FBRyxtQkFBbUIsQ0FBQztnQkFDdEQsQ0FBQztxQkFDSSxDQUFDO29CQUNKLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztvQkFDNUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDO29CQUNyQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUM7Z0JBQ2pDLENBQUM7Z0JBQ0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7Z0JBQy9DLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDeEIsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEMsQ0FBQztZQUNELElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLElBQUksTUFBTSxJQUFJLElBQUksRUFBRSxDQUFDLENBQUEsOEZBQThGO2dCQUVqSCxJQUFJLFVBQW9CLENBQUM7Z0JBQ3pCLElBQUksU0FBeUIsQ0FBQyxDQUFBLDBHQUEwRztnQkFDeEksSUFBSSxZQUE0QixDQUFDLENBQUEsMkdBQTJHO2dCQUM1SSxJQUFJLFVBQXdCLENBQUM7Z0JBQzdCLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNqQixTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDdEIsWUFBWSxHQUFHLFlBQVksQ0FBQztnQkFDNUIsT0FBTyxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQzdELG9CQUFvQjtvQkFDcEIsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7d0JBQzFELFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQzt3QkFFakIsSUFBSSxVQUFVLEtBQUssU0FBUyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7NEJBQ2hFLFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDOzRCQUMvQixTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQzs0QkFDaEMsWUFBWSxHQUFHLFNBQVMsQ0FBQzt3QkFDM0IsQ0FBQzs2QkFDSSxDQUFDOzRCQUNKLElBQUksVUFBVSxLQUFLLFNBQVMsRUFBRSxDQUFDO2dDQUM3QixLQUFLLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29DQUNyRCxJQUFJLFVBQVUsQ0FBQyxLQUFLLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxVQUFVLENBQUMsUUFBUSxJQUFJLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQzt3Q0FDakcsWUFBWSxDQUFDLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQzt3Q0FBQyxNQUFNO29DQUN0QyxDQUFDO2dDQUNILENBQUM7NEJBQ0gsQ0FBQzs0QkFFRCxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQzs0QkFDdEIsWUFBWSxHQUFHLFlBQVksQ0FBQzt3QkFDOUIsQ0FBQztvQkFDSCxDQUFDO3lCQUNJLElBQUksU0FBUyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxJQUFJLFNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxRQUFROzJCQUMvSCxTQUFTLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEtBQUssU0FBUyxJQUFJLFNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7d0JBQy9JLDJHQUEyRzt3QkFDM0csVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMxRCxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQzt3QkFDaEMsWUFBWSxHQUFHLFNBQVMsQ0FBQzt3QkFDekIsVUFBVSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQzt3QkFDcEMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDckIsQ0FBQzt5QkFDSSxDQUFDO3dCQUNKLFNBQVMsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO3dCQUMvRixVQUFVLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUEsZ0RBQWdEO29CQUN0RixDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDO1lBRUQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsd0JBQXdCLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM3QixJQUFJLENBQUMsSUFBSSxHQUFHLFlBQVksQ0FBQztZQUN6QixJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsK0dBQStHO2dCQUM1SSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQywwR0FBMEc7b0JBQ3ZILElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDO2dCQUMxQixDQUFDO1lBQ0gsQ0FBQztZQUNELElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1lBRWpCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRTlCLHVDQUF1QztZQUN2Qyw2QkFBNkI7WUFDN0IsMkNBQTJDO1lBQzNDLGdEQUFnRDtZQUNoRCwrQ0FBK0M7WUFDL0MsOERBQThEO1lBQzlELDJDQUEyQztZQUMzQyxXQUFXO1FBQ2IsQ0FBQyxFQUNELEtBQUssQ0FBQyxFQUFFO1lBQ04sSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDdkIsSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDLENBQUMsbUJBQW1CO2dCQUM5QyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxvQ0FBb0MsRUFDckQsU0FBUyxFQUFFLHNCQUFzQixDQUFDLENBQUM7WUFDdkMsQ0FBQztpQkFBTSxJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLDZDQUE2QyxHQUFHLEtBQUssQ0FBQyxNQUFNLEVBQzdFLFNBQVMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1lBQ3ZDLENBQUM7aUJBQU0sSUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLEtBQUssRUFBRSxDQUFDO2dCQUNqQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUN6RCxTQUFTLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUNyQyxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsNkJBQTZCLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFDN0QsU0FBUyxFQUFFLHNCQUFzQixDQUFDLENBQUM7WUFDdkMsQ0FBQztZQUNELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pCLENBQUMsQ0FDRixDQUFDO1FBQ0YsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUNPLGNBQWMsQ0FBQyxJQUFZO1FBQ2pDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxnQkFBZ0I7YUFDOUIsaUJBQWlCLENBQUMsSUFBSSxDQUFDO2FBQ3ZCLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDZCxJQUFJLEdBQUc7Z0JBQUUsR0FBRyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUN4RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFFRCxnRUFBZ0U7SUFDaEUsdUZBQXVGO0lBQ3ZGLFFBQVEsQ0FBQyxJQUFTLEVBQUUsS0FBZSxFQUFFLE1BQWdCO1FBQ25ELElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDckIsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3hELCtEQUErRDtZQUMvRCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztnQkFDbEIsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7WUFDeEIsQ0FBQztZQUNELDhEQUE4RDtpQkFDekQsQ0FBQztnQkFDSixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztZQUN2QixDQUFDO1lBQ0QsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxxQ0FBcUM7Z0JBQzFELElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDL0QsSUFBSSxVQUFVLEVBQUUsQ0FBQztvQkFDZixVQUFVLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7Z0JBQ3RDLENBQUM7WUFDSCxDQUFDO1FBQ0gsQ0FBQzthQUNJLHFFQUFxRTtTQUMxRSxDQUFDO1lBQ0MsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsTUFBTSxLQUFLLFNBQVMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7WUFDckQsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDaEQsSUFBSSxZQUFZLEdBQW1CLEVBQUUsQ0FBQztZQUN0QyxPQUFPLENBQUMsU0FBUyxDQUNmLEtBQUssQ0FBQyxFQUFFO2dCQUNOLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDaEMsOENBQThDO2dCQUM5QyxLQUFLLElBQUksQ0FBQyxHQUFXLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztvQkFDdEQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDO3dCQUMvQixLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7d0JBQy9CLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQzt3QkFDakMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEdBQUcsY0FBYyxDQUFDO3dCQUNoRCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksR0FBRyxtQkFBbUIsQ0FBQztvQkFDdEQsQ0FBQzt5QkFDSSxDQUFDO3dCQUNKLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQzt3QkFDNUIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDO3dCQUNyQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxNQUFNLENBQUM7b0JBQ2pDLENBQUM7b0JBQ0QsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7b0JBQy9DLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDeEIsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXRDLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLFFBQVEsR0FBRyxZQUFZLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxZQUFZLEdBQUcsbUJBQW1CLENBQUM7Z0JBQUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxjQUFjLENBQUM7Z0JBQzdFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxzQkFBc0IsR0FBRyxZQUFZLENBQUMsTUFBTSxHQUFHLFlBQVksQ0FBQyxDQUFDO2dCQUVuRixPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFLENBQUM7b0JBQ2pDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7b0JBQzNCLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztvQkFDbEMsUUFBUSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7b0JBQ3pCLFFBQVEsQ0FBQyxZQUFZLEdBQUcsbUJBQW1CLENBQUM7b0JBQUMsUUFBUSxDQUFDLGFBQWEsR0FBRyxjQUFjLENBQUM7b0JBQ3JGLElBQUksR0FBRyxRQUFRLENBQUM7Z0JBQ2xCLENBQUM7Z0JBRUQsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2YsS0FBSyxJQUFJLENBQUMsR0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7b0JBQ2xELElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO3dCQUNyQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO3dCQUFDLE1BQU07b0JBQ25CLENBQUM7Z0JBQ0gsQ0FBQztnQkFDRCxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO29CQUNoQixJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQztvQkFDeEIsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxrR0FBa0c7d0JBQ3ZILEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLHFFQUFxRTt3QkFDakYsS0FBSyxJQUFJLENBQUMsR0FBVyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyx5RUFBeUU7NEJBQ2xJLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2dDQUMzQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO2dDQUFDLE1BQU07NEJBQ25CLENBQUM7d0JBQ0gsQ0FBQzt3QkFDRCxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDOzRCQUNoQixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQzt3QkFDaEMsQ0FBQzs2QkFBTSxDQUFDOzRCQUNOLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLDZFQUE2RSxDQUFDLENBQUM7d0JBQ2hHLENBQUM7b0JBQ0gsQ0FBQztvQkFDRCx1Q0FBdUM7b0JBQ3ZDLHlCQUF5QjtvQkFDekIsdUNBQXVDO29CQUN2Qyw0Q0FBNEM7b0JBQzVDLDJDQUEyQztvQkFDM0MsMERBQTBEO29CQUMxRCx1Q0FBdUM7b0JBQ3ZDLE9BQU87Z0JBRVQsQ0FBQzs7b0JBRUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQztZQUMzQyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7SUFDSCxDQUFDO0lBRUQsbUJBQW1CLENBQUMsSUFBUztRQUMzQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQ3JCLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pELFFBQVEsQ0FBQyxTQUFTLENBQ2hCLE1BQU0sQ0FBQyxFQUFFO1lBQ1AsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ3JCLElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO2dCQUNyQixJQUFJLENBQUMsYUFBYSxHQUFHLGNBQWMsQ0FBQztnQkFDcEMsSUFBSSxDQUFDLFlBQVksR0FBRyxtQkFBbUIsQ0FBQztZQUMxQyxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sSUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7Z0JBQ2hCLElBQUksQ0FBQyxJQUFJLEdBQUcsWUFBWSxDQUFDO2dCQUN6QixJQUFJLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQztZQUNyQixDQUFDO1lBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztZQUN4QixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDMUIsSUFBSSxDQUFDLEtBQUssR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQzFCLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztZQUN4QixJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDO1lBQ2xDLE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQyxFQUNELENBQUMsQ0FBQyxFQUFFO1lBQ0YsSUFBSSxDQUFDLENBQUMsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDO2dCQUNwQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLENBQUMsSUFBSSxHQUFHLHlDQUF5QyxFQUM5RixTQUFTLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztnQkFDckMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6QixDQUFDO2lCQUFNLElBQUksQ0FBQyxDQUFDLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFDM0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMscUJBQXFCLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxzQkFBc0IsRUFDM0UsU0FBUyxFQUFFLHNCQUFzQixDQUFDLENBQUM7WUFDdkMsQ0FBQztpQkFBTSxJQUFJLENBQUMsQ0FBQyxNQUFNLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsMEJBQTBCLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFDekYsU0FBUyxFQUFFLG1CQUFtQixDQUFDLENBQUM7WUFDcEMsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFDO1FBQ2QsQ0FBQyxDQUNGLENBQUM7SUFDSixDQUFDO0lBRUQsNkJBQTZCLENBQUMsSUFBWTtRQUN4QyxJQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDeEQsSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN0QyxDQUFDO0lBQ0gsQ0FBQztJQUVELGtCQUFrQixDQUFDLEtBQWE7UUFDOUIsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMzQyxDQUFDO1FBQ0QsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELGtCQUFrQixDQUFDLElBQVMsRUFBRSxLQUFhO1FBQ3pDLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDckMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUNyQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ3BELElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNuRCxDQUFDO2dCQUNELElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztvQkFDdkQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ2xCLENBQUMsRUFBRSxDQUFDO2dCQUNOLENBQUM7cUJBQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxHQUFHLFFBQVEsRUFBRSxDQUFDLENBQUMsMEZBQTBGO29CQUM5SCxzRkFBc0Y7b0JBQ3RGLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO2dCQUMxQixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRUQsNEVBQTRFO0lBQzVFLGNBQWMsQ0FBQyxJQUFTLEVBQUUsSUFBWTtRQUNwQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3JDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQztnQkFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLHNCQUFzQjtZQUM3QyxDQUFDO1lBQ0QsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUNwRCxJQUFJLFVBQWUsQ0FBQztnQkFDcEIsVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDekQscUZBQXFGO2dCQUNyRixJQUFJLFVBQVUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7b0JBQ2xELFNBQVM7Z0JBQ1gsQ0FBQztxQkFBTSxDQUFDO29CQUNOLE9BQU8sVUFBVSxDQUFDO2dCQUNwQixDQUFDO1lBQ0gsQ0FBQztRQUNILENBQUM7UUFDRCxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RCLENBQUM7SUFFRCxTQUFTLENBQUMsSUFBWTtRQUNwQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQsVUFBVSxDQUFDLFdBQW1CLEVBQUUsSUFBUyxFQUFFLE1BQWU7UUFDeEQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBUSxFQUFFLEVBQUU7WUFDdkQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQyxDQUFDO1lBQzFDLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNwRCxJQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQywrQkFBK0IsV0FBVyxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxFQUFFLHNCQUFzQixDQUFDLENBQUM7WUFDakosUUFBUSxDQUFDLFNBQVMsQ0FDaEIsTUFBTSxDQUFDLEVBQUU7Z0JBQ1AseURBQXlEO2dCQUN6RCxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUUsQ0FBQztvQkFDdkMsSUFBSSxTQUFTLEdBQUc7d0JBQ2QsRUFBRSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTTt3QkFDeEIsS0FBSyxFQUFFLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxXQUFXLENBQUM7d0JBQy9DLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTt3QkFDakIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO3dCQUNuQixLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7d0JBQ25CLFNBQVMsRUFBRSxNQUFNLENBQUMsU0FBUzt3QkFDM0IsSUFBSSxFQUFFLE1BQU07d0JBQ1osU0FBUyxFQUFFLEtBQUs7d0JBQ2hCLElBQUksRUFBRSxZQUFZO3dCQUNsQixLQUFLLEVBQUUsRUFBRTt3QkFDVCxJQUFJLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQzt3QkFDOUMsTUFBTSxFQUFFLElBQUk7d0JBQ1osSUFBSSxFQUFFLFdBQVc7d0JBQ2pCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtxQkFDbEIsQ0FBQTtvQkFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGdDQUFnQztvQkFDL0QsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxrR0FBa0c7d0JBQ3ZILElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3BFLElBQUksVUFBVSxFQUFFLENBQUM7NEJBQ2YsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQ3RDLENBQUM7b0JBQ0gsQ0FBQztvQkFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDdkIsQ0FBQztnQkFDRCx5REFBeUQ7cUJBQ3BELENBQUM7b0JBQ0osSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsa0RBQWtEO3dCQUN6RSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDL0IsQ0FBQzt5QkFBTSxJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUMsZ0NBQWdDO3dCQUNuRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN0QixDQUFDO3lCQUFNLENBQUMsQ0FBQyxxRUFBcUU7d0JBQzVFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsd0RBQXdEO29CQUN6RixDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDLENBQ0YsQ0FBQztRQUNKLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRTtZQUNULElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDNUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLEdBQUcsV0FBVyxHQUFHLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1lBQ3ZILENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRTtnQkFDUCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQywwQkFBMEIsR0FBRyxXQUFXLEdBQUcsR0FBRyxFQUFFLFNBQVMsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO2dCQUN0RyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN6QixDQUFDLENBQUMsQ0FBQztRQUVMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELFlBQVksQ0FBQyxXQUFtQixFQUFFLElBQVMsRUFBRSxNQUFlO1FBQzFELElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQzthQUNuQyxTQUFTLENBQ1IsSUFBSSxDQUFDLEVBQUU7WUFDTCxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDLENBQUM7WUFDMUMsSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3BELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3hELFFBQVEsQ0FBQyxTQUFTLENBQ2hCLE1BQU0sQ0FBQyxFQUFFO2dCQUNQLHlEQUF5RDtnQkFDekQsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxFQUFFLENBQUM7b0JBQ3ZDLElBQUksU0FBUyxHQUFHO3dCQUNkLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU07d0JBQ3hCLFFBQVEsRUFBRSxFQUFFO3dCQUNaLEtBQUssRUFBRSxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDO3dCQUMvQyxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUk7d0JBQ2pCLEtBQUssRUFBRSxNQUFNLENBQUMsS0FBSzt3QkFDbkIsS0FBSyxFQUFFLE1BQU0sQ0FBQyxLQUFLO3dCQUNuQixTQUFTLEVBQUUsTUFBTSxDQUFDLFNBQVM7d0JBQzNCLElBQUksRUFBRSxRQUFRO3dCQUNkLFNBQVMsRUFBRSxJQUFJO3dCQUNmLFlBQVksRUFBRSxtQkFBbUI7d0JBQ2pDLGFBQWEsRUFBRSxjQUFjO3dCQUM3QixJQUFJLEVBQUUsSUFBSSxDQUFDLHNCQUFzQixDQUFDLFdBQVcsQ0FBQzt3QkFDOUMsTUFBTSxFQUFFLElBQUk7d0JBQ1osSUFBSSxFQUFFLFdBQVc7d0JBQ2pCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSTtxQkFDbEIsQ0FBQTtvQkFDRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLGdDQUFnQztvQkFDL0QsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxrR0FBa0c7d0JBQ3ZILElBQUksVUFBVSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3BFLElBQUksVUFBVSxFQUFFLENBQUM7NEJBQ2YsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQ3RDLENBQUM7b0JBQ0gsQ0FBQztvQkFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztnQkFDdkIsQ0FBQztnQkFDRCx5REFBeUQ7cUJBQ3BELENBQUM7b0JBQ0osSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsa0RBQWtEO3dCQUN6RSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDL0IsQ0FBQzt5QkFBTSxJQUFJLE1BQU0sRUFBRSxDQUFDLENBQUMsZ0NBQWdDO3dCQUNuRCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO29CQUN0QixDQUFDO3lCQUFNLENBQUMsQ0FBQyxxRUFBcUU7d0JBQzVFLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsd0RBQXdEO29CQUNoRyxDQUFDO2dCQUNILENBQUM7WUFDSCxDQUFDLENBQ0YsQ0FBQztRQUNKLENBQUMsRUFDRCxLQUFLLENBQUMsRUFBRTtZQUNOLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDLHVCQUF1QjtnQkFDbEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsK0JBQStCLEdBQUcsV0FBVyxHQUFHLG1EQUFtRCxFQUNwSCxTQUFTLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztZQUN2QyxDQUFDO1lBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekIsQ0FBQyxDQUNGLENBQUM7SUFDTixDQUFDO0lBRUQsa0JBQWtCLENBQUMsZ0JBQXFCO1FBQ3RDLElBQUksV0FBVyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQztRQUN4QyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDcEQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDaEUsZ0JBQWdCLENBQUMsVUFBVSxHQUFHLDhCQUE4QixDQUFDO1FBQzdELElBQUksa0JBQWtCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxXQUFXLENBQUM7YUFDakUsU0FBUyxDQUNSLElBQUksQ0FBQyxFQUFFO1lBQ0wsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDdkIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksR0FBRyxHQUFHLEVBQ3pDLFNBQVMsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQ25DLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNuQyxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNqRCxnQkFBZ0IsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1lBQ2pDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyRCxDQUFDLEVBQ0QsS0FBSyxDQUFDLEVBQUU7WUFDTixJQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQyx1QkFBdUI7Z0JBQ2xELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLFdBQVcsR0FBRywwQkFBMEIsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUM5RixTQUFTLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztZQUNwQyxDQUFDO2lCQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDLFdBQVc7Z0JBQzdDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLFdBQVcsR0FBRyw0Q0FBNEMsRUFDbEcsU0FBUyxFQUFFLHNCQUFzQixDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztZQUNyQyxDQUFDO2lCQUFNLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQyxDQUFDLGFBQWE7Z0JBQ3hFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLFdBQVcsR0FBRyxpREFBaUQsRUFDdkcsU0FBUyxFQUFFLHNCQUFzQixDQUFDLENBQUM7WUFDdkMsQ0FBQztpQkFBTSxDQUFDLENBQUMsU0FBUztnQkFDaEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEdBQUcsS0FBSyxDQUFDLE1BQU0sR0FBRyxrQkFBa0IsR0FBRyxXQUFXLEdBQUcsMEJBQTBCLEdBQUcsS0FBSyxDQUFDLEtBQUssRUFDL0gsU0FBUyxFQUFFLG1CQUFtQixDQUFDLENBQUM7Z0JBQ2xDLGdEQUFnRDtZQUNsRCxDQUFDO1lBQ0QsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDakQsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUM7WUFDdkIsZ0JBQWdCLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztZQUNqQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6QixDQUFDLENBQ0YsQ0FBQztRQUVKLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDZCxJQUFJLGtCQUFrQixDQUFDLE1BQU0sSUFBSSxLQUFLLEVBQUUsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsR0FBRywwREFBMEQsRUFDeEcsU0FBUyxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDckMsQ0FBQztRQUNILENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRCxXQUFXLENBQUMsSUFBUztRQUNuQixJQUFJLE1BQU0sQ0FBQztRQUNYLElBQUksUUFBUSxDQUFDO1FBQ2IsSUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxxQ0FBcUM7WUFDdEQsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDckIsUUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxvQ0FBb0M7UUFDbEUsQ0FBQzthQUFNLENBQUMsQ0FBQyw0Q0FBNEM7WUFDbkQsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQywyQ0FBMkM7UUFDbkUsQ0FBQztRQUVELElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4RCxJQUFJLFFBQVEsRUFBRSxDQUFDLENBQUMsNENBQTRDO1lBQzFELElBQUksT0FBTyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQixJQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUIsUUFBUSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlO1lBQzlDLElBQUksSUFBSSxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsd0RBQXdEO2dCQUNqRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7WUFDbEMsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLElBQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO1lBQ3ZCLENBQUM7UUFDSCxDQUFDO1FBRUQsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxrR0FBa0c7WUFDdkgsSUFBSSxjQUFjLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNyRSxJQUFJLGNBQWMsRUFBRSxDQUFDO2dCQUNuQixJQUFJLFVBQVUsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLElBQUksV0FBVyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBQ3RCLElBQUksV0FBVyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7d0JBQ3RCLFVBQVUsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQ3BELENBQUM7Z0JBQ0gsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVELGdCQUFnQixDQUFDLEtBQWEsRUFBRSxPQUFlO1FBQzdDLElBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUNyRSxzSUFBc0k7UUFDdEksSUFBSSxZQUFZLEdBQUcsUUFBUSxDQUFDLG1CQUFtQixDQUFDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2hHLE9BQU8sUUFBUSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUMzRCxDQUFDO0lBRUQsT0FBTztRQUNMLHFGQUFxRjtRQUNyRix1RUFBdUU7UUFDdkUsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQzFDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuRCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1lBQ2xCLENBQUM7WUFFRCxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDdkMsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztnQkFBQyxXQUFXLEVBQUUsQ0FBQztZQUFDLENBQUM7WUFDL0QsSUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2hFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUMsQ0FBQztZQUV6QyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDckMsQ0FBQzthQUFNLENBQUM7WUFDTixJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QixDQUFDO0lBQ0gsQ0FBQztJQUVELHNCQUFzQixDQUFDLFdBQW1CO1FBQ3hDLElBQUksSUFBSSxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbkUsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRUQsc0JBQXNCLENBQUMsV0FBbUI7UUFDeEMsSUFBSSxJQUFJLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBRU8sU0FBUyxDQUFDLEtBQWE7UUFDN0IsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUM7SUFDeEQsQ0FBQztJQUVELGNBQWMsQ0FBQyxLQUFVO1FBQ3ZCLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLEVBQUUsQ0FBQztZQUNwQixJQUFJLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQztZQUNoQixJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDO1FBQzlDLENBQUM7SUFDSCxDQUFDO0lBRUQsZ0NBQWdDLENBQUMsV0FBbUIsRUFBRSxPQUFlO1FBQ25FLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQztZQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyx5QkFBeUIsR0FBRyxXQUFXLEdBQUcsSUFBSSxHQUFHLE9BQU8sRUFDekUsU0FBUyxFQUFFLHNCQUFzQixDQUFDLENBQUM7WUFDckMsT0FBTyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDOzhHQTk4Q1UsdUJBQXVCLCtOQWdEeEIsdUJBQXVCLENBQUMsTUFBTSxhQUM5Qix1QkFBdUIsQ0FBQyxlQUFlLGFBQ3ZDLHVCQUF1QixDQUFDLGlCQUFpQixhQUM3Qix1QkFBdUIsQ0FBQyxjQUFjO2tHQW5EakQsdUJBQXVCLDBpQkFIdkIsQ0FBQyxjQUFjLEVBQUUsMEJBQTBCLENBQUMsb0JBQW9CLENBQUMseUVBbUNqRSxhQUFhLHdPQ3ZGMUIsc3FIQWtGTzs7MkZEM0JNLHVCQUF1QjtrQkFSbkMsU0FBUzsrQkFDRSxrQkFBa0IsaUJBRWIsaUJBQWlCLENBQUMsSUFBSSxhQUUxQixDQUFDLGNBQWMsRUFBRSwwQkFBMEIsQ0FBQyxvQkFBb0IsQ0FBQzs7MEJBbUR6RSxNQUFNOzJCQUFDLHVCQUF1QixDQUFDLE1BQU07OzBCQUNyQyxNQUFNOzJCQUFDLHVCQUF1QixDQUFDLGVBQWU7OzBCQUM5QyxNQUFNOzJCQUFDLHVCQUF1QixDQUFDLGlCQUFpQjs7MEJBQ2hELFFBQVE7OzBCQUFJLE1BQU07MkJBQUMsdUJBQXVCLENBQUMsY0FBYzt5Q0FuQjFCLGFBQWE7c0JBQTlDLFNBQVM7dUJBQUMsYUFBYTtnQkFDVSxZQUFZO3NCQUE3QyxTQUFTO3VCQUFDLGNBQWM7Z0JBQ00sU0FBUztzQkFBdkMsU0FBUzt1QkFBQyxXQUFXO2dCQW9DWixXQUFXO3NCQUFwQixNQUFNO2dCQUNHLFdBQVc7c0JBQXBCLE1BQU07Z0JBQ0csU0FBUztzQkFBbEIsTUFBTTtnQkFDRyxZQUFZO3NCQUFyQixNQUFNO2dCQUNHLGNBQWM7c0JBQXZCLE1BQU07Z0JBRUcsY0FBYztzQkFBdkIsTUFBTTtnQkFDRyxZQUFZO3NCQUFyQixNQUFNO2dCQUNHLFlBQVk7c0JBQXJCLE1BQU07Z0JBQ0csU0FBUztzQkFBbEIsTUFBTTtnQkFDRyxXQUFXO3NCQUFwQixNQUFNO2dCQUNHLGNBQWM7c0JBQXZCLE1BQU07Z0JBQ0csVUFBVTtzQkFBbkIsTUFBTTtnQkFDRyxZQUFZO3NCQUFyQixNQUFNO2dCQUdTLFVBQVU7c0JBQXpCLEtBQUs7Z0JBQ1UsV0FBVztzQkFBMUIsS0FBSztnQkFDVSxTQUFTO3NCQUF4QixLQUFLO2dCQUNVLFdBQVc7c0JBQTFCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuXHJcbi8qXHJcbiAgVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcclxuICBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEVjbGlwc2UgUHVibGljIExpY2Vuc2UgdjIuMCB3aGljaCBhY2NvbXBhbmllc1xyXG4gIHRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MjAuaHRtbFxyXG4gIFxyXG4gIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBFUEwtMi4wXHJcbiAgXHJcbiAgQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxyXG4qL1xyXG5cclxuaW1wb3J0IHtcclxuICBDb21wb25lbnQsIEVsZW1lbnRSZWYsIEV2ZW50RW1pdHRlciwgSW5wdXQsIE9uRGVzdHJveSwgT25Jbml0LFxyXG4gIE91dHB1dCwgVmlld0VuY2Fwc3VsYXRpb24sIEluamVjdCwgT3B0aW9uYWwsIFZpZXdDaGlsZFxyXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBGb3JtQ29udHJvbCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJ1xyXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBvZiwgU3Vic2NyaXB0aW9uIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IGNhdGNoRXJyb3IsIGRlYm91bmNlVGltZSwgZmluYWxpemUsIG1hcCwgdGltZW91dCB9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcclxuaW1wb3J0IHsgQW5ndWxhcjJJbmplY3Rpb25Ub2tlbnMsIEFuZ3VsYXIyUGx1Z2luV2luZG93QWN0aW9ucywgQ29udGV4dE1lbnVJdGVtIH0gZnJvbSAnLi4vLi4vLi4vcGx1Z2lubGliL2luamVjdC1yZXNvdXJjZXMnO1xyXG5pbXBvcnQgeyBNYXREaWFsb2csIE1hdERpYWxvZ0NvbmZpZywgTWF0RGlhbG9nUmVmIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGlhbG9nJztcclxuaW1wb3J0IHsgTWF0U25hY2tCYXIgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9zbmFjay1iYXInO1xyXG5pbXBvcnQgeyBGaWxlUHJvcGVydGllc01vZGFsIH0gZnJvbSAnLi4vZmlsZS1wcm9wZXJ0aWVzLW1vZGFsL2ZpbGUtcHJvcGVydGllcy1tb2RhbC5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBEZWxldGVGaWxlTW9kYWwgfSBmcm9tICcuLi9kZWxldGUtZmlsZS1tb2RhbC9kZWxldGUtZmlsZS1tb2RhbC5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBDcmVhdGVGb2xkZXJNb2RhbCB9IGZyb20gJy4uL2NyZWF0ZS1mb2xkZXItbW9kYWwvY3JlYXRlLWZvbGRlci1tb2RhbC5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBDcmVhdGVGaWxlTW9kYWwgfSBmcm9tICcuLi9jcmVhdGUtZmlsZS1tb2RhbC9jcmVhdGUtZmlsZS1tb2RhbC5jb21wb25lbnQnO1xyXG5pbXBvcnQgeyBVcGxvYWRNb2RhbCB9IGZyb20gJy4uL3VwbG9hZC1maWxlcy1tb2RhbC91cGxvYWQtZmlsZXMtbW9kYWwuY29tcG9uZW50JztcclxuaW1wb3J0IHsgRmlsZVBlcm1pc3Npb25zTW9kYWwgfSBmcm9tICcuLi9maWxlLXBlcm1pc3Npb25zLW1vZGFsL2ZpbGUtcGVybWlzc2lvbnMtbW9kYWwuY29tcG9uZW50JztcclxuaW1wb3J0IHsgRmlsZU93bmVyc2hpcE1vZGFsIH0gZnJvbSAnLi4vZmlsZS1vd25lcnNoaXAtbW9kYWwvZmlsZS1vd25lcnNoaXAtbW9kYWwuY29tcG9uZW50JztcclxuaW1wb3J0IHsgRmlsZVRhZ2dpbmdNb2RhbCB9IGZyb20gJy4uL2ZpbGUtdGFnZ2luZy1tb2RhbC9maWxlLXRhZ2dpbmctbW9kYWwuY29tcG9uZW50JztcclxuaW1wb3J0IHsgcXVpY2tTbmFja2Jhck9wdGlvbnMsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMsIGxvbmdTbmFja2Jhck9wdGlvbnMgfSBmcm9tICcuLi8uLi9zaGFyZWQvc25hY2tiYXItb3B0aW9ucyc7XHJcbmltcG9ydCB7IGluY3JlbWVudEZpbGVOYW1lIH0gZnJvbSAnLi4vLi4vc2hhcmVkL2ZpbGVBY3Rpb25zJ1xyXG5pbXBvcnQgeyBGaWxlVHJlZU5vZGUgfSBmcm9tICcuLi8uLi9zdHJ1Y3R1cmVzL2NoaWxkLWV2ZW50JztcclxuaW1wb3J0IHsgVHJlZUNvbXBvbmVudCB9IGZyb20gJy4uL3RyZWUvdHJlZS5jb21wb25lbnQnO1xyXG5pbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XHJcblxyXG4vKiBTZXJ2aWNlcyAqL1xyXG5pbXBvcnQgeyBVdGlsc1NlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy91dGlscy5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVXNzQ3J1ZFNlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy91c3MuY3J1ZC5zZXJ2aWNlJztcclxuaW1wb3J0IHsgRG93bmxvYWRlclNlcnZpY2UgfSBmcm9tICcuLi8uLi9zZXJ2aWNlcy9kb3dubG9hZGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTZWFyY2hIaXN0b3J5U2VydmljZSB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL3NlYXJjaEhpc3RvcnlTZXJ2aWNlJztcclxuXHJcbi8qIFRPRE86IHJlLWltcGxlbWVudCB0byBhZGQgZmV0Y2hpbmcgb2YgcHJldmlvdXNseSBvcGVuZWQgdHJlZSB2aWV3IGRhdGFcclxuaW1wb3J0IHsgUGVyc2lzdGVudERhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc2VydmljZXMvcGVyc2lzdGVudERhdGEuc2VydmljZSc7ICovXHJcblxyXG5jb25zdCBTRUFSQ0hfSUQgPSAndXNzJztcclxuXHJcbkBDb21wb25lbnQoe1xyXG4gIHNlbGVjdG9yOiAnZmlsZS1icm93c2VyLXVzcycsXHJcbiAgdGVtcGxhdGVVcmw6ICcuL2ZpbGVicm93c2VydXNzLmNvbXBvbmVudC5odG1sJyxcclxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxyXG4gIHN0eWxlVXJsczogWycuL2ZpbGVicm93c2VydXNzLmNvbXBvbmVudC5jc3MnXSxcclxuICBwcm92aWRlcnM6IFtVc3NDcnVkU2VydmljZSwgLypQZXJzaXN0ZW50RGF0YVNlcnZpY2UsKi8gU2VhcmNoSGlzdG9yeVNlcnZpY2VdXHJcbn0pXHJcblxyXG5leHBvcnQgY2xhc3MgRmlsZUJyb3dzZXJVU1NDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSB7XHJcblxyXG4gIC8qIFRPRE86IExlZ2FjeSwgY2FwYWJpbGl0aWVzIGNvZGUgKHVudXNlZCBmb3Igbm93KSAqL1xyXG4gIC8vSUZpbGVCcm93c2VyVVNTLFxyXG4gIC8vY29tcG9uZW50Q2xhc3M6IENvbXBvbmVudENsYXNzO1xyXG4gIC8vZmlsZVNlbGVjdGVkOiBTdWJqZWN0PEZpbGVCcm93c2VyRmlsZVNlbGVjdGVkRXZlbnQ+O1xyXG4gIC8vY2FwYWJpbGl0aWVzOiBBcnJheTxDYXBhYmlsaXR5PjtcclxuXHJcbiAgLyogVE9ETzogRmV0Y2hpbmcgdXBkYXRlcyBmb3IgYXV0b21hdGljIHJlZnJlc2ggKGRpc2FibGVkIGZvciBub3cpICovXHJcbiAgLy8gcHJpdmF0ZSBpbnRlcnZhbElkOiBhbnk7XHJcbiAgLy8gcHJpdmF0ZSB1cGRhdGVJbnRlcnZhbDogbnVtYmVyID0gMTAwMDA7Ly8gVE9ETzogdGltZSByZXByZXNlbnRzIGluIG1zIGhvdyBmYXN0IHRyZWUgdXBkYXRlcyBjaGFuZ2VzIGZyb20gbWFpbmZyYW1lXHJcblxyXG4gIC8qIERhdGEgYW5kIG5hdmlnYXRpb24gKi9cclxuICBwdWJsaWMgcGF0aDogc3RyaW5nO1xyXG4gIHB1YmxpYyBzZWxlY3RlZE5vZGU6IGFueTtcclxuICBwdWJsaWMgaG9tZVBhdGg6IHN0cmluZzsgLy8gSWYgc3RheXMgbnVsbCBhZnRlciBpbml0LCBaU1Mgd2FzIHVuYWJsZSB0byBmaW5kIGEgdXNlciBob21lIGRpcmVjdG9yeVxyXG4gIHB1YmxpYyByb290OiBzdHJpbmc7IC8vIERlZmF1bHQgLyBkaXJlY3RvcnkgKGRpZmZlcmVudCBmcm9tIGhvbWVQYXRoKVxyXG4gIHB1YmxpYyByaWdodENsaWNrZWRGaWxlOiBhbnk7XHJcbiAgLy9UT0RPOiBNYXkgbm90IG5lZWRlZCBhbnltb3JlPyAobWF5IG5lZWQgcmVwbGFjaW5nIHcvIHJpZ2h0Q2xpY2tlZEZpbGUpXHJcbiAgcHJpdmF0ZSByaWdodENsaWNrZWRFdmVudDogYW55O1xyXG4gIHByaXZhdGUgZGVsZXRpb25RdWV1ZSA9IG5ldyBNYXAoKTsgLy9tdWx0aXBsZSBmaWxlcyBkZWxldGlvbiBpcyBhc3luYywgc28gcXVldWUgaXMgdXNlZFxyXG4gIHByaXZhdGUgZmlsZVRvQ29weU9yQ3V0OiBhbnk7XHJcbiAgLy9UT0RPOiBEZWZpbmUgaW50ZXJmYWNlIHR5cGVzIGZvciB1c3MtZGF0YS9kYXRhXHJcbiAgcHVibGljIGRhdGE6IEZpbGVUcmVlTm9kZVtdOyAvL01haW4gZGF0YSBkaXNwbGF5ZWQgaW4gdGhlIHZpc3VhbCB0cmVlIGFzIG5vZGVzXHJcbiAgcHJpdmF0ZSBkYXRhQ2FjaGVkOiBGaWxlVHJlZU5vZGVbXTsgLy8gVXNlZCBmb3IgZmlsdGVyaW5nIGFnYWluc3QgcXVpY2sgc2VhcmNoXHJcblxyXG4gIC8qIFF1aWNrIHNlYXJjaCAoQWx0ICsgUCkgc3R1ZmYgKi9cclxuICBwdWJsaWMgc2hvd1NlYXJjaDogYm9vbGVhbjtcclxuICBwdWJsaWMgc2VhcmNoQ3RybDogYW55O1xyXG4gIHB1YmxpYyBzZWFyY2hWYWx1ZVN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uO1xyXG5cclxuICAvKiBUcmVlIFVJIGFuZCBtb2RhbHMgKi9cclxuICBAVmlld0NoaWxkKFRyZWVDb21wb25lbnQpIHByaXZhdGUgdHJlZUNvbXBvbmVudDogVHJlZUNvbXBvbmVudDtcclxuICBAVmlld0NoaWxkKCdwYXRoSW5wdXRVU1MnKSBwdWJsaWMgcGF0aElucHV0VVNTOiBFbGVtZW50UmVmO1xyXG4gIEBWaWV3Q2hpbGQoJ3NlYXJjaFVTUycpIHB1YmxpYyBzZWFyY2hVU1M6IEVsZW1lbnRSZWY7XHJcbiAgcHVibGljIGhpZGVFeHBsb3JlcjogYm9vbGVhbjtcclxuICBwdWJsaWMgaXNMb2FkaW5nOiBib29sZWFuO1xyXG4gIHByaXZhdGUgcmlnaHRDbGlja1Byb3BlcnRpZXNGaWxlOiBDb250ZXh0TWVudUl0ZW1bXTtcclxuICBwcml2YXRlIHJpZ2h0Q2xpY2tQcm9wZXJ0aWVzRm9sZGVyOiBDb250ZXh0TWVudUl0ZW1bXTtcclxuICBwcml2YXRlIHJpZ2h0Q2xpY2tQcm9wZXJ0aWVzUGFuZWw6IENvbnRleHRNZW51SXRlbVtdO1xyXG5cclxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsZW1lbnRSZWY6IEVsZW1lbnRSZWYsXHJcbiAgICBwcml2YXRlIHVzc1NydjogVXNzQ3J1ZFNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHV0aWxzOiBVdGlsc1NlcnZpY2UsXHJcbiAgICBwdWJsaWMgdXNzU2VhcmNoSGlzdG9yeTogU2VhcmNoSGlzdG9yeVNlcnZpY2UsXHJcbiAgICBwdWJsaWMgZGlhbG9nOiBNYXREaWFsb2csXHJcbiAgICBwdWJsaWMgc25hY2tCYXI6IE1hdFNuYWNrQmFyLFxyXG4gICAgcHVibGljIGRvd25sb2FkU2VydmljZTogRG93bmxvYWRlclNlcnZpY2UsXHJcbiAgICBASW5qZWN0KEFuZ3VsYXIySW5qZWN0aW9uVG9rZW5zLkxPR0dFUikgcHJpdmF0ZSBsb2c6IFpMVVguQ29tcG9uZW50TG9nZ2VyLFxyXG4gICAgQEluamVjdChBbmd1bGFyMkluamVjdGlvblRva2Vucy5MQVVOQ0hfTUVUQURBVEEpIHByaXZhdGUgbGF1bmNoTWV0YWRhdGE6IGFueSxcclxuICAgIEBJbmplY3QoQW5ndWxhcjJJbmplY3Rpb25Ub2tlbnMuUExVR0lOX0RFRklOSVRJT04pIHByaXZhdGUgcGx1Z2luRGVmaW5pdGlvbjogWkxVWC5Db250YWluZXJQbHVnaW5EZWZpbml0aW9uLFxyXG4gICAgQE9wdGlvbmFsKCkgQEluamVjdChBbmd1bGFyMkluamVjdGlvblRva2Vucy5XSU5ET1dfQUNUSU9OUykgcHJpdmF0ZSB3aW5kb3dBY3Rpb25zOiBBbmd1bGFyMlBsdWdpbldpbmRvd0FjdGlvbnMpIHtcclxuICAgIC8qIFRPRE86IExlZ2FjeSwgY2FwYWJpbGl0aWVzIGNvZGUgKHVudXNlZCBmb3Igbm93KSAqL1xyXG4gICAgLy90aGlzLmNvbXBvbmVudENsYXNzID0gQ29tcG9uZW50Q2xhc3MuRmlsZUJyb3dzZXI7XHJcbiAgICB0aGlzLmluaXRhbGl6ZUNhcGFiaWxpdGllcygpO1xyXG4gICAgdGhpcy51c3NTZWFyY2hIaXN0b3J5Lm9uSW5pdChTRUFSQ0hfSUQpO1xyXG4gICAgdGhpcy5yb290ID0gXCIvXCI7IC8vIERldiBwdXJwb3NlczogUmVwbGFjZSB3aXRoIGhvbWUgZGlyZWN0b3J5IHRvIHRlc3QgRXhwbG9yZXIgZnVuY3Rpb25hbGl0aWVzXHJcbiAgICB0aGlzLnBhdGggPSB0aGlzLnJvb3Q7XHJcbiAgICB0aGlzLmRhdGEgPSBbXTtcclxuICAgIHRoaXMuaGlkZUV4cGxvcmVyID0gZmFsc2U7XHJcbiAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgdGhpcy5zaG93U2VhcmNoID0gZmFsc2U7XHJcbiAgICB0aGlzLnNlYXJjaEN0cmwgPSBuZXcgRm9ybUNvbnRyb2woKTtcclxuICAgIHRoaXMuc2VhcmNoVmFsdWVTdWJzY3JpcHRpb24gPSB0aGlzLnNlYXJjaEN0cmwudmFsdWVDaGFuZ2VzLnBpcGUoXHJcbiAgICAgIGRlYm91bmNlVGltZSg1MDApLCAvLyBCeSBkZWZhdWx0LCA1MDAgbXMgdW50aWwgdXNlciBpbnB1dCwgZm9yIHF1aWNrIHNlYXJjaCB0byB1cGRhdGUgcmVzdWx0c1xyXG4gICAgKS5zdWJzY3JpYmUoKHZhbHVlKSA9PiB7IHRoaXMuc2VhcmNoSW5wdXRDaGFuZ2VkKHZhbHVlKSB9KTtcclxuICAgIHRoaXMuc2VsZWN0ZWROb2RlID0gbnVsbDtcclxuICB9XHJcblxyXG4gIC8qIFRyZWUgb3V0Z29pbmcgZXZlbnRzICovXHJcbiAgQE91dHB1dCgpIHBhdGhDaGFuZ2VkOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSBkYXRhQ2hhbmdlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgbm9kZUNsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSBub2RlRGJsQ2xpY2s6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIG5vZGVSaWdodENsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIC8vIEBPdXRwdXQoKSBuZXdGaWxlQ2xpY2s6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIG5ld0ZvbGRlckNsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSBuZXdGaWxlQ2xpY2s6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIGZpbGVVcGxvYWRlZDogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgY29weUNsaWNrOiBFdmVudEVtaXR0ZXI8YW55PiA9IG5ldyBFdmVudEVtaXR0ZXI8YW55PigpO1xyXG4gIEBPdXRwdXQoKSBkZWxldGVDbGljazogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuICBAT3V0cHV0KCkgdXNzUmVuYW1lRXZlbnQ6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIHJpZ2h0Q2xpY2s6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcjxhbnk+KCk7XHJcbiAgQE91dHB1dCgpIG9wZW5Jbk5ld1RhYjogRXZlbnRFbWl0dGVyPGFueT4gPSBuZXcgRXZlbnRFbWl0dGVyPGFueT4oKTtcclxuXHJcbiAgLyogQ3VzdG9taXplYWJsZSB0cmVlIHN0eWxlcyAqL1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBpbnB1dFN0eWxlOiBhbnk7XHJcbiAgQElucHV0KCkgcHVibGljIHNlYXJjaFN0eWxlOiBhbnk7XHJcbiAgQElucHV0KCkgcHVibGljIHRyZWVTdHlsZTogYW55O1xyXG4gIEBJbnB1dCgpIHB1YmxpYyBzaG93VXBBcnJvdzogYm9vbGVhbjtcclxuXHJcbiAgbmdPbkluaXQoKSB7XHJcbiAgICB0aGlzLmxvYWRVc2VySG9tZURpcmVjdG9yeSgpLnBpcGUoXHJcbiAgICAgIGNhdGNoRXJyb3IoZXJyID0+IHtcclxuICAgICAgICB0aGlzLmxvZy53YXJuKGBVbnN1Y2Nlc3NmdWwgaW4gbG9hZGluZyB1c2VyIGhvbWUgZGlyZWN0b3J5OiAke2Vycn1gKTtcclxuICAgICAgICByZXR1cm4gb2YoJy8nKTtcclxuICAgICAgfSksXHJcbiAgICApLnN1YnNjcmliZShob21lID0+IHtcclxuICAgICAgaWYgKCF0aGlzLmhvbWVQYXRoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubGF1bmNoTWV0YWRhdGEgJiYgdGhpcy5sYXVuY2hNZXRhZGF0YS5kYXRhICYmIHRoaXMubGF1bmNoTWV0YWRhdGEuZGF0YS5uYW1lKSB7XHJcbiAgICAgICAgICB0aGlzLnBhdGggPSB0aGlzLmxhdW5jaE1ldGFkYXRhLmRhdGEubmFtZTtcclxuICAgICAgICAgIHRoaXMudXBkYXRlVXNzKHRoaXMucGF0aCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMucGF0aCA9IGhvbWU7XHJcbiAgICAgICAgICB0aGlzLnVwZGF0ZVVzcyhob21lKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5ob21lUGF0aCA9IGhvbWU7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgdGhpcy5pbml0aWFsaXplUmlnaHRDbGlja1Byb3BlcnRpZXMoKTtcclxuICAgIC8vIFRPRE86IFVuY29tbWVudCAmIGZpeCBhdXRvLXVwZGF0ZSBvZiBub2RlIGRhdGEgYmFzZWQgb24gYW4gaW50ZXJ2YWwuIE1heWJlIGZ1dHVyZSBzZXR0aW5nP1xyXG4gICAgLy8gdGhpcy5wZXJzaXN0ZW50RGF0YVNlcnZpY2UuZ2V0RGF0YSgpXHJcbiAgICAvLyAgIC5zdWJzY3JpYmUoZGF0YSA9PiB7XHJcbiAgICAvLyAgICAgaWYgKGRhdGEuY29udGVudHMudXNzSW5wdXQpIHtcclxuICAgIC8vICAgICAgIHRoaXMucGF0aCA9IGRhdGEuY29udGVudHMudXNzSW5wdXQ7IH1cclxuICAgIC8vICAgICBpZiAoZGF0YS5jb250ZW50cy51c3NEYXRhICE9PSB1bmRlZmluZWQpXHJcbiAgICAvLyAgICAgZGF0YS5jb250ZW50cy51c3NEYXRhLmxlbmd0aCA9PSAwID8gdGhpcy5kaXNwbGF5VHJlZSh0aGlzLnBhdGgsIGZhbHNlKSA6ICh0aGlzLmRhdGEgPSBkYXRhLmNvbnRlbnRzLnVzc0RhdGEsIHRoaXMucGF0aCA9IGRhdGEuY29udGVudHMudXNzSW5wdXQpXHJcbiAgICAvLyAgICAgZWxzZVxyXG4gICAgLy8gICAgIHRoaXMuZGlzcGxheVRyZWUodGhpcy5yb290LCBmYWxzZSk7XHJcbiAgICAvLyAgIH0pXHJcbiAgICAvLyB0aGlzLmludGVydmFsSWQgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAvLyAgdGhpcy51cGRhdGVVc3ModGhpcy5wYXRoKTtcclxuICAgIC8vIH0sIHRoaXMudXBkYXRlSW50ZXJ2YWwpO1xyXG4gIH1cclxuXHJcbiAgbmdPbkRlc3Ryb3koKSB7XHJcbiAgICAvKiBUT0RPOiBGZXRjaGluZyB1cGRhdGVzIGZvciBhdXRvbWF0aWMgcmVmcmVzaCAoZGlzYWJsZWQgZm9yIG5vdykgKi9cclxuICAgIC8vIGlmICh0aGlzLmludGVydmFsSWQpIHtcclxuICAgIC8vICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSWQpO1xyXG4gICAgLy8gfVxyXG4gICAgaWYgKHRoaXMuc2VhcmNoVmFsdWVTdWJzY3JpcHRpb24pIHtcclxuICAgICAgdGhpcy5zZWFyY2hWYWx1ZVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZ2V0RE9NRWxlbWVudCgpOiBIVE1MRWxlbWVudCB7XHJcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50UmVmLm5hdGl2ZUVsZW1lbnQ7XHJcbiAgfVxyXG5cclxuICBnZXRTZWxlY3RlZFBhdGgoKTogc3RyaW5nIHtcclxuICAgIC8vVE9ETzpob3cgZG8gd2Ugd2FudCB0byB3YW50IHRvIGhhbmRsZSBjYWNoaW5nIHZzIG1lc3NhZ2UgdG8gYXBwIHRvIG9wZW4gc2FpZCBwYXRoXHJcbiAgICByZXR1cm4gdGhpcy5wYXRoO1xyXG4gIH1cclxuXHJcbiAgbG9hZFVzZXJIb21lRGlyZWN0b3J5KCk6IE9ic2VydmFibGU8c3RyaW5nPiB7XHJcbiAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XHJcbiAgICByZXR1cm4gdGhpcy51c3NTcnYuZ2V0VXNlckhvbWVGb2xkZXIoKS5waXBlKFxyXG4gICAgICB0aW1lb3V0KDIwMDApLFxyXG4gICAgICBtYXAocmVzcCA9PiByZXNwLmhvbWUudHJpbSgpKSxcclxuICAgICAgZmluYWxpemUoKCkgPT4gdGhpcy5pc0xvYWRpbmcgPSBmYWxzZSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBpbml0YWxpemVDYXBhYmlsaXRpZXMoKSB7XHJcbiAgICAvLyAgIC8vdGhpcy5jYXBhYmlsaXRpZXMgPSBuZXcgQXJyYXk8Q2FwYWJpbGl0eT4oKTtcclxuICAgIC8vICAgLy90aGlzLmNhcGFiaWxpdGllcy5wdXNoKEZpbGVCcm93c2VyQ2FwYWJpbGl0aWVzLkZpbGVCcm93c2VyKTtcclxuICAgIC8vICAgLy90aGlzLmNhcGFiaWxpdGllcy5wdXNoKEZpbGVCcm93c2VyQ2FwYWJpbGl0aWVzLkZpbGVCcm93c2VyVVNTKTtcclxuICB9XHJcblxyXG4gIGluaXRpYWxpemVSaWdodENsaWNrUHJvcGVydGllcygpIHtcclxuICAgIHRoaXMucmlnaHRDbGlja1Byb3BlcnRpZXNGaWxlID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJSZXF1ZXN0IE9wZW4gaW4gTmV3IEJyb3dzZXIgVGFiXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5vcGVuSW5OZXdUYWIuZW1pdCh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiUmVmcmVzaCBNZXRhZGF0YVwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMucmVmcmVzaEZpbGVNZXRhZGF0YSh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiQ2hhbmdlIE1vZGUvUGVybWlzc2lvbnMuLi5cIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNob3dQZXJtaXNzaW9uc0RpYWxvZyh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiQ2hhbmdlIE93bmVycy4uLlwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2hvd093bmVyRGlhbG9nKHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJUYWcuLi5cIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNob3dUYWdnaW5nRGlhbG9nKHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJEb3dubG9hZFwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuYXR0ZW1wdERvd25sb2FkKHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJDdXRcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmN1dEZpbGUodGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIkNvcHlcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmNvcHlGaWxlKHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJDb3B5IExpbmtcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmNvcHlMaW5rKHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJDb3B5IFBhdGhcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmNvcHlQYXRoKHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJEZWxldGVcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNob3dEZWxldGVEaWFsb2codGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIlJlbmFtZVwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2hvd1JlbmFtZUZpZWxkKHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJQcm9wZXJ0aWVzXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5zaG93UHJvcGVydGllc0RpYWxvZyh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIF07XHJcblxyXG4gICAgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc0ZvbGRlciA9IFtcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiUmVmcmVzaFwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuYWRkQ2hpbGQodGhpcy5yaWdodENsaWNrZWRGaWxlLCB0cnVlLCB0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUuZXhwYW5kZWQgfHwgZmFsc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiQ2hhbmdlIE1vZGUvUGVybWlzc2lvbnMuLi5cIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNob3dQZXJtaXNzaW9uc0RpYWxvZyh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJDaGFuZ2UgT3duZXJzLi4uXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5zaG93T3duZXJEaWFsb2codGhpcy5yaWdodENsaWNrZWRGaWxlKVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiVGFnIERpcmVjdG9yeS4uLlwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2hvd1RhZ2dpbmdEaWFsb2codGhpcy5yaWdodENsaWNrZWRGaWxlKVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiQ3JlYXRlIGEgRmlsZS4uLlwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2hvd0NyZWF0ZUZpbGVEaWFsb2codGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIkNyZWF0ZSBhIERpcmVjdG9yeS4uLlwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2hvd0NyZWF0ZUZvbGRlckRpYWxvZyh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiVXBsb2FkLi4uXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5zaG93VXBsb2FkRGlhbG9nKHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJDb3B5IExpbmtcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmNvcHlMaW5rKHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJDb3B5IFBhdGhcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLmNvcHlQYXRoKHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJEZWxldGVcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNob3dEZWxldGVEaWFsb2codGhpcy5yaWdodENsaWNrZWRGaWxlKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIlJlbmFtZVwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgIHRoaXMuc2hvd1JlbmFtZUZpZWxkKHRoaXMucmlnaHRDbGlja2VkRmlsZSlcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIlByb3BlcnRpZXNcIiwgYWN0aW9uOiAoKSA9PiB7XHJcbiAgICAgICAgICB0aGlzLnNob3dQcm9wZXJ0aWVzRGlhbG9nKHRoaXMucmlnaHRDbGlja2VkRmlsZSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIF07XHJcblxyXG4gICAgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc1BhbmVsID0gW1xyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJTaG93L0hpZGUgU2VhcmNoXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy50b2dnbGVTZWFyY2goKTtcclxuXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgdGV4dDogXCJDcmVhdGUgYSBGaWxlLi4uXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgbGV0IG5vZGVUb1VzZSA9IHtcclxuICAgICAgICAgICAgcGF0aDogdGhpcy5wYXRoLFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5zaG93Q3JlYXRlRmlsZURpYWxvZyhub2RlVG9Vc2UpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiQ3JlYXRlIGEgRGlyZWN0b3J5Li4uXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgbGV0IG5vZGVUb1VzZSA9IHtcclxuICAgICAgICAgICAgcGF0aDogdGhpcy5wYXRoLFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5zaG93Q3JlYXRlRm9sZGVyRGlhbG9nKG5vZGVUb1VzZSk7XHJcblxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIHRleHQ6IFwiVXBsb2FkLi4uXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5zaG93VXBsb2FkRGlhbG9nKHRoaXMucmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgXTtcclxuICB9XHJcblxyXG4gIGNvcHlGaWxlKHJpZ2h0Q2xpY2tlZEZpbGU6IGFueSkge1xyXG4gICAgdGhpcy5sb2cuZGVidWcoYGNvcHlmaWxlIGZvciAgJHt0aGlzLmZpbGVUb0NvcHlPckN1dH0sICR7dGhpcy5yaWdodENsaWNrZWRGaWxlLnBhdGh9LCAke3RoaXMucGF0aH1gKTtcclxuICAgIGlmICh0aGlzLmZpbGVUb0NvcHlPckN1dCA9PSBudWxsKSB7XHJcbiAgICAgIHRoaXMucmlnaHRDbGlja1Byb3BlcnRpZXNGb2xkZXIucHVzaCggLy8gQ3JlYXRlIGEgcGFzdGUgb3B0aW9uIGZvciB0aGUgZm9sZGVyXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGV4dDogXCJQYXN0ZVwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wYXN0ZUZpbGUodGhpcy5maWxlVG9Db3B5T3JDdXQsIHRoaXMucmlnaHRDbGlja2VkRmlsZS5wYXRoLCBmYWxzZSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICk7XHJcbiAgICAgIHRoaXMucmlnaHRDbGlja1Byb3BlcnRpZXNQYW5lbC5wdXNoKCAvLyBDcmVhdGUgYSBwYXN0ZSBvcHRpb24gZm9yIHRoZSBhY3RpdmUgZGlyZWN0b3J5XHJcbiAgICAgICAge1xyXG4gICAgICAgICAgdGV4dDogXCJQYXN0ZVwiLCBhY3Rpb246ICgpID0+IHtcclxuICAgICAgICAgICAgdGhpcy5wYXN0ZUZpbGUodGhpcy5maWxlVG9Db3B5T3JDdXQsIHRoaXMucGF0aCwgZmFsc2UpXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gICAgfVxyXG4gICAgdGhpcy5maWxlVG9Db3B5T3JDdXQgPSByaWdodENsaWNrZWRGaWxlO1xyXG4gICAgdGhpcy5jb3B5Q2xpY2suZW1pdChyaWdodENsaWNrZWRGaWxlKTtcclxuICB9XHJcblxyXG4gIGN1dEZpbGUocmlnaHRDbGlja2VkRmlsZTogYW55KSB7XHJcbiAgICBpZiAodGhpcy5maWxlVG9Db3B5T3JDdXQpIHtcclxuICAgICAgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc0ZvbGRlci5zcGxpY2UodGhpcy5yaWdodENsaWNrUHJvcGVydGllc0ZvbGRlci5tYXAoaXRlbSA9PiBpdGVtLnRleHQpLmluZGV4T2YoXCJQYXN0ZVwiKSwgMSk7XHJcbiAgICAgIHRoaXMucmlnaHRDbGlja1Byb3BlcnRpZXNQYW5lbC5zcGxpY2UodGhpcy5yaWdodENsaWNrUHJvcGVydGllc1BhbmVsLm1hcChpdGVtID0+IGl0ZW0udGV4dCkuaW5kZXhPZihcIlBhc3RlXCIpLCAxKTtcclxuICAgIH1cclxuICAgIHRoaXMubG9nLmRlYnVnKGBjdXRmaWxlIGZvciAgJHt0aGlzLmZpbGVUb0NvcHlPckN1dH0sICR7dGhpcy5yaWdodENsaWNrZWRGaWxlLnBhdGh9LCAke3RoaXMucGF0aH1gKTtcclxuICAgIHRoaXMucmlnaHRDbGlja1Byb3BlcnRpZXNGb2xkZXIucHVzaCggLy8gQ3JlYXRlIGEgcGFzdGUgb3B0aW9uIGZvciB0aGUgZm9sZGVyXHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIlBhc3RlXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5wYXN0ZUZpbGUodGhpcy5maWxlVG9Db3B5T3JDdXQsIHRoaXMucmlnaHRDbGlja2VkRmlsZS5wYXRoLCB0cnVlKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgKTtcclxuICAgIHRoaXMucmlnaHRDbGlja1Byb3BlcnRpZXNQYW5lbC5wdXNoKCAvLyBDcmVhdGUgYSBwYXN0ZSBvcHRpb24gZm9yIHRoZSBhY3RpdmUgZGlyZWN0b3J5XHJcbiAgICAgIHtcclxuICAgICAgICB0ZXh0OiBcIlBhc3RlXCIsIGFjdGlvbjogKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5wYXN0ZUZpbGUodGhpcy5maWxlVG9Db3B5T3JDdXQsIHRoaXMucGF0aCwgdHJ1ZSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgICB0aGlzLmZpbGVUb0NvcHlPckN1dCA9IHJpZ2h0Q2xpY2tlZEZpbGU7XHJcbiAgICB0aGlzLmNvcHlDbGljay5lbWl0KHJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gIH1cclxuXHJcbiAgcGFzdGVGaWxlKGZpbGVOb2RlOiBhbnksIGRlc3RpbmF0aW9uUGF0aDogYW55LCBpc0N1dDogYm9vbGVhbikge1xyXG4gICAgbGV0IHBhdGhBbmROYW1lID0gZmlsZU5vZGUucGF0aDtcclxuICAgIGxldCBuYW1lID0gdGhpcy5nZXROYW1lRnJvbVBhdGhBbmROYW1lKHBhdGhBbmROYW1lKTtcclxuICAgIHRoaXMubG9nLmRlYnVnKGBwYXN0ZSBmb3IgJHtuYW1lfSwgJHtkZXN0aW5hdGlvblBhdGh9LCBhbmQgY3V0PSR7aXNDdXR9YCk7XHJcbiAgICBpZiAocGF0aEFuZE5hbWUuaW5kZXhPZignICcpID49IDApIHtcclxuICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiUGFzdGUgZmFpbGVkOiAnXCIgKyBwYXRoQW5kTmFtZSArIFwiJyBPcGVyYXRpb24gbm90IHlldCBzdXBwb3J0ZWQgZm9yIGZpbGVuYW1lcyB3aXRoIHNwYWNlcy5cIixcclxuICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBsZXQgbWV0YURhdGEgPSB0aGlzLnVzc1Nydi5nZXRGaWxlTWV0YWRhdGEocGF0aEFuZE5hbWUpO1xyXG4gICAgbWV0YURhdGEuc3Vic2NyaWJlKHJlc3VsdCA9PiB7XHJcbiAgICAgIGlmIChyZXN1bHQuY2NzaWQgPT0gLTEpIHtcclxuICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJQYXN0ZSBmYWlsZWQ6ICdcIiArIHBhdGhBbmROYW1lICsgXCInIE9wZXJhdGlvbiBub3QgeWV0IHN1cHBvcnRlZCBmb3IgdGhpcyBlbmNvZGluZy5cIixcclxuICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICBsZXQgZGVzdGluYXRpb25NZXRhZGF0YSA9IHRoaXMudXNzU3J2LmdldEZpbGVDb250ZW50cyhkZXN0aW5hdGlvblBhdGgpO1xyXG4gICAgICAgIGRlc3RpbmF0aW9uTWV0YWRhdGEuc3Vic2NyaWJlKHJlc3VsdCA9PiB7XHJcbiAgICAgICAgICAvKnJlbmFtZSB0aGUgZmlsZSB3aGVuIGRvaW5nIHBhc3RlLCBpbiBjYXNlIHNhbWUgbmFtZWQgZmlsZSBleGlzdHMgaW4gdGhlIGRlc3RpbmF0aW9uLiovXHJcbiAgICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgcmVzdWx0LmVudHJpZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKCFyZXN1bHQuZW50cmllc1tpXS5kaXJlY3RvcnkgJiYgcmVzdWx0LmVudHJpZXNbaV0ubmFtZSA9PSBuYW1lKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGlzQ3V0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJVbmFibGUgdG8gbW92ZSAnXCIgKyBwYXRoQW5kTmFtZSArIFwiJyBiZWNhdXNlIHRhcmdldCAnXCIgKyBkZXN0aW5hdGlvblBhdGggKyAnXFwvJyArIG5hbWUgKyBcIidhbHJlYWR5IGV4aXN0cyBhdCBkZXN0aW5hdGlvbi5cIixcclxuICAgICAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBsb25nU25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaSA9IC0xO1xyXG4gICAgICAgICAgICAgIG5hbWUgPSBpbmNyZW1lbnRGaWxlTmFtZShuYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGxldCBjb3B5U3Vic2NyaXB0aW9uID0gdGhpcy51c3NTcnYuY29weUZpbGUocGF0aEFuZE5hbWUsIGRlc3RpbmF0aW9uUGF0aCArIFwiL1wiICsgbmFtZSlcclxuICAgICAgICAgICAgLnN1YnNjcmliZShcclxuICAgICAgICAgICAgICByZXNwID0+IHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUpIHtcclxuICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucmlnaHRDbGlja2VkRmlsZS5jaGlsZHJlbiAmJiB0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBleHBhbmRlZCA9IHRoaXMucmlnaHRDbGlja2VkRmlsZS5leHBhbmRlZDtcclxuICAgICAgICAgICAgICAgICAgICAvKiBXZSByZWN5Y2xlIHRoZSBzYW1lIG1ldGhvZCB1c2VkIGZvciBvcGVuaW5nIChjbGlja2luZyBvbikgYSBub2RlLiBCdXQgaW5zdGVhZCBvZiBleHBhbmRpbmcgaXQsIFxyXG4gICAgICAgICAgICAgICAgICAgIHdlIGtlZXAgdGhlIHNhbWUgZXhwYW5kZWQgc3RhdGUsIGFuZCBqdXN0IHVzZSBpdCB0byBhZGQgYSBub2RlICovXHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRDaGlsZCh0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUsIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmlnaHRDbGlja2VkRmlsZS5leHBhbmRlZCA9IGV4cGFuZGVkO1xyXG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMucGF0aCA9PSBkZXN0aW5hdGlvblBhdGgpIHtcclxuICAgICAgICAgICAgICAgICAgICAvKiBJbiB0aGUgY2FzZSB0aGF0IHdlIHJpZ2h0IGNsaWNrIHRvIHBhc3RlIG9uIHRoZSBhY3RpdmUgZGlyZWN0b3J5IGluc3RlYWQgb2YgYSBub2RlLCB3ZSB1cGRhdGUgb3VyIHRyZWVcclxuICAgICAgICAgICAgICAgICAgICAoYWN0aXZlIGRpcmVjdG9yeSkgaW5zdGVhZCBvZiBhZGRpbmcgb250byBhIHNwZWNpZmljIG5vZGUgKi9cclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlUcmVlKHRoaXMucGF0aCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChpc0N1dCkge1xyXG4gICAgICAgICAgICAgICAgICAvKiBDbGVhciB0aGUgcGFzdGUgb3B0aW9uLCBiZWNhdXNlIGV2ZW4gaWYgZGVsZXRlIGZhaWxzIGFmdGVyLCB3ZSBoYXZlIGFscmVhZHkgZG9uZSB0aGUgY29weSAqL1xyXG4gICAgICAgICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuZmlsZVRvQ29weU9yQ3V0ID0gbnVsbDtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc0ZvbGRlci5zcGxpY2UodGhpcy5yaWdodENsaWNrUHJvcGVydGllc0ZvbGRlci5tYXAoaXRlbSA9PiBpdGVtLnRleHQpLmluZGV4T2YoXCJQYXN0ZVwiKSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgIHRoaXMucmlnaHRDbGlja1Byb3BlcnRpZXNQYW5lbC5zcGxpY2UodGhpcy5yaWdodENsaWNrUHJvcGVydGllc1BhbmVsLm1hcChpdGVtID0+IGl0ZW0udGV4dCkuaW5kZXhPZihcIlBhc3RlXCIpLCAxKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgIC8qIERlbGV0ZSAoY3V0KSBwb3J0aW9uICovXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMudXNzU3J2LmRlbGV0ZUZpbGVPckZvbGRlcihwYXRoQW5kTmFtZSlcclxuICAgICAgICAgICAgICAgICAgICAuc3Vic2NyaWJlKFxyXG4gICAgICAgICAgICAgICAgICAgICAgcmVzcCA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2hpbGQoZmlsZU5vZGUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oJ1Bhc3RlIHN1Y2Nlc3NmdWw6ICcgKyBuYW1lLCAnRGlzbWlzcycsIHF1aWNrU25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgICBlcnJvciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnJvci5zdGF0dXMgPT0gJzUwMCcpIHsgLy9JbnRlcm5hbCBTZXJ2ZXIgRXJyb3JcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJDb3BpZWQgc3VjY2Vzc2Z1bGx5LCBidXQgZmFpbGVkIHRvIGN1dCAnXCIgKyBwYXRoQW5kTmFtZSArIFwiJyBTZXJ2ZXIgcmV0dXJuZWQgd2l0aDogXCIgKyBlcnJvci5fYm9keSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdEaXNtaXNzJywgbG9uZ1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDQnKSB7IC8vTm90IEZvdW5kXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiQ29waWVkIHN1Y2Nlc3NmdWxseSwgYnV0ICdcIiArIHBhdGhBbmROYW1lICsgXCInIGhhcyBhbHJlYWR5IGJlZW4gZGVsZXRlZCBvciBkb2VzIG5vdCBleGlzdC5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVDaGlsZChmaWxlTm9kZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDAnIHx8IGVycm9yLnN0YXR1cyA9PSAnNDAzJykgeyAvL0JhZCBSZXF1ZXN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiQ29waWVkIHN1Y2Nlc3NmdWxseSBidXQgZmFpbGVkIHRvIGN1dCAnXCIgKyBwYXRoQW5kTmFtZSArIFwiJyBUaGlzIGlzIHByb2JhYmx5IGR1ZSB0byBhIHBlcm1pc3Npb24gcHJvYmxlbS5cIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vVW5rbm93blxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkNvcGllZCBzdWNjZXNzZnVsbHksIGJ1dCB1bmtub3duIGVycm9yIGN1dHRpbmcgJ1wiICsgZXJyb3Iuc3RhdHVzICsgXCInIG9jY3VycmVkIGZvciAnXCIgKyBwYXRoQW5kTmFtZSArIFwiJyBTZXJ2ZXIgcmV0dXJuZWQgd2l0aDogXCIgKyBlcnJvci5fYm9keSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdEaXNtaXNzJywgbG9uZ1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cuc2V2ZXJlKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKCdQYXN0ZSBzdWNjZXNzZnVsOiAnICsgbmFtZSwgJ0Rpc21pc3MnLCBxdWlja1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICBlcnJvciA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3Iuc3RhdHVzID09ICc1MDAnKSB7IC8vSW50ZXJuYWwgU2VydmVyIEVycm9yXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIlBhc3RlIGZhaWxlZDogSFRUUCA1MDAgZnJvbSBhcHAtc2VydmVyIG9yIGFnZW50IG9jY3VycmVkIGZvciAnXCIgKyBwYXRoQW5kTmFtZSArIFwiJy4gU2VydmVyIHJldHVybmVkIHdpdGg6IFwiICsgZXJyb3IuX2JvZHksXHJcbiAgICAgICAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBsb25nU25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDQnKSB7IC8vTm90IEZvdW5kXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIlBhc3RlIGZhaWxlZDogJ1wiICsgcGF0aEFuZE5hbWUgKyBcIicgZG9lcyBub3QgZXhpc3QuXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDAnKSB7IC8vQmFkIFJlcXVlc3RcclxuICAgICAgICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiUGFzdGUgZmFpbGVkOiBIVFRQIDQwMCBvY2N1cnJlZCBmb3IgJ1wiICsgcGF0aEFuZE5hbWUgKyBcIicuIENoZWNrIHRoYXQgeW91IGhhdmUgY29ycmVjdCBwZXJtaXNzaW9ucyBmb3IgdGhpcyBhY3Rpb24uXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vVW5rbm93blxyXG4gICAgICAgICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJQYXN0ZSBmYWlsZWQ6ICdcIiArIGVycm9yLnN0YXR1cyArIFwiJyBvY2N1cnJlZCBmb3IgJ1wiICsgcGF0aEFuZE5hbWUgKyBcIicgU2VydmVyIHJldHVybmVkIHdpdGg6IFwiICsgZXJyb3IuX2JvZHksXHJcbiAgICAgICAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBsb25nU25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmxvZy5zZXZlcmUoZXJyb3IpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgaWYgKGNvcHlTdWJzY3JpcHRpb24uY2xvc2VkID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKCdQYXN0aW5nICcgKyBwYXRoQW5kTmFtZSArICcuLi4gTGFyZ2VyIHBheWxvYWRzIG1heSB0YWtlIGxvbmdlci4gUGxlYXNlIGJlIHBhdGllbnQuJyxcclxuICAgICAgICAgICAgICAgICdEaXNtaXNzJywgcXVpY2tTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCA0MDAwKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgICAgZXJyb3IgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDMnKSB7IC8vUGVybWlzc2lvbiBkZW5pZWRcclxuICAgICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oJ0ZhaWxlZCB0byBhY2Nlc3MgZGVzdGluYXRpb24gZm9sZGVyOiBQZXJtaXNzaW9uIGRlbmllZC4nLFxyXG4gICAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5zdGF0dXMgPT0gJzAnKSB7XHJcbiAgICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiRmFpbGVkIHRvIGNvbW11bmljYXRlIHdpdGggdGhlIEFwcCBzZXJ2ZXI6IFwiICsgZXJyb3Iuc3RhdHVzLFxyXG4gICAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvci5zdGF0dXMgPT0gJzQwNCcpIHtcclxuICAgICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJEZXN0aW5hdGlvbiBmb2xkZXIgbm90IGZvdW5kLiBcIiArIGVycm9yLnN0YXR1cyxcclxuICAgICAgICAgICAgICAgICdEaXNtaXNzJywgcXVpY2tTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkFuIHVua25vd24gZXJyb3Igb2NjdXJyZWQ6IFwiICsgZXJyb3Iuc3RhdHVzLFxyXG4gICAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmxvZy5zZXZlcmUoZXJyb3IpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICAgIGVycm9yID0+IHtcclxuICAgICAgICBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDQnKSB7IC8vIFRoaXMgaGFwcGVucyB3aGVuIHVzZXIgYXR0ZW1wdHMgdG8gcGFzdGUgYSBmaWxlIHRoYXQncyBiZWVuIGRlbGV0ZWQgYWZ0ZXIgY29weWluZ1xyXG4gICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiUGFzdGUgZmFpbGVkOiBPcmlnaW5hbCAnXCIgKyBwYXRoQW5kTmFtZSArIFwiJyBubyBsb25nZXIgZXhpc3RzLlwiLFxyXG4gICAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMubG9nLndhcm4oZXJyb3IpO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIHNob3dQcm9wZXJ0aWVzRGlhbG9nKHJpZ2h0Q2xpY2tlZEZpbGU6IGFueSkge1xyXG4gICAgY29uc3QgZmlsZVByb3BDb25maWcgPSBuZXcgTWF0RGlhbG9nQ29uZmlnKCk7XHJcbiAgICBmaWxlUHJvcENvbmZpZy5kYXRhID0ge1xyXG4gICAgICBldmVudDogcmlnaHRDbGlja2VkRmlsZVxyXG4gICAgfVxyXG4gICAgZmlsZVByb3BDb25maWcubWF4V2lkdGggPSAnMzUwcHgnO1xyXG5cclxuICAgIHRoaXMuZGlhbG9nLm9wZW4oRmlsZVByb3BlcnRpZXNNb2RhbCwgZmlsZVByb3BDb25maWcpO1xyXG4gIH1cclxuXHJcbiAgc2hvd1JlbmFtZUZpZWxkKGZpbGU6IGFueSkge1xyXG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlID0gdGhpcy5yaWdodENsaWNrZWRFdmVudC5vcmlnaW5hbEV2ZW50LnNyY0VsZW1lbnQ7XHJcbiAgICBsZXQgb2xkTmFtZSA9IGZpbGUubmFtZTtcclxuICAgIGxldCBvbGRQYXRoID0gZmlsZS5wYXRoO1xyXG4gICAgZmlsZS5zZWxlY3RhYmxlID0gZmFsc2U7XHJcblxyXG4gICAgbGV0IHJlbmFtZUZuID0gKG5vZGU6IEhUTUxFbGVtZW50KSA9PiB7XHJcbiAgICAgIHJlbmFtZUZpZWxkLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5vZGUsIHJlbmFtZUZpZWxkKTtcclxuICAgICAgZmlsZS5zZWxlY3RhYmxlID0gdHJ1ZTtcclxuICAgICAgbGV0IG5hbWVGcm9tTm9kZSA9IHJlbmFtZUZpZWxkLnZhbHVlO1xyXG4gICAgICBsZXQgcGF0aEZvclJlbmFtZSA9IHRoaXMuZ2V0UGF0aEZyb21QYXRoQW5kTmFtZShvbGRQYXRoKTtcclxuICAgICAgaWYgKG9sZE5hbWUgIT0gbmFtZUZyb21Ob2RlKSB7XHJcbiAgICAgICAgbGV0IG5ld1BhdGggPSBgJHtwYXRoRm9yUmVuYW1lfS8ke25hbWVGcm9tTm9kZX1gO1xyXG4gICAgICAgIHRoaXMudXNzU3J2LnJlbmFtZUZpbGUob2xkUGF0aCwgbmV3UGF0aCkuc3Vic2NyaWJlKFxyXG4gICAgICAgICAgcmVzID0+IHtcclxuICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiUmVuYW1lZCAnXCIgKyBvbGROYW1lICsgXCInIHRvICdcIiArIG5hbWVGcm9tTm9kZSArIFwiJ1wiLFxyXG4gICAgICAgICAgICAgICdEaXNtaXNzJywgcXVpY2tTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgICAvLyB0aGlzLnVwZGF0ZVVzcyh0aGlzLnBhdGgpOyAtIFdlIGRvbid0IG5lZWQgdG8gdXBkYXRlIHRoZSB3aG9sZSB0cmVlIGZvciAxIGNoYW5nZWQgbm9kZSAocmVuYW1lIHNob3VsZCBiZSBPKDEpIG9wZXJhdGlvbiksIFxyXG4gICAgICAgICAgICAvLyBidXQgaWYgcHJvYmxlbXMgY29tZSB1cCB1bmNvbW1lbnQgdGhpc1xyXG4gICAgICAgICAgICB0aGlzLnVzc1JlbmFtZUV2ZW50LmVtaXQodGhpcy5yaWdodENsaWNrZWRFdmVudC5ub2RlKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd1NlYXJjaCkgeyAvLyBVcGRhdGUgc2F2ZWQgY2FjaGUgaWYgd2UncmUgdXNpbmcgdGhlIHNlYXJjaCBiYXJcclxuICAgICAgICAgICAgICBsZXQgbm9kZUNhY2hlZCA9IHRoaXMuZmluZE5vZGVCeVBhdGgodGhpcy5kYXRhQ2FjaGVkLCBmaWxlLnBhdGgpWzBdO1xyXG4gICAgICAgICAgICAgIGlmIChub2RlQ2FjaGVkKSB7XHJcbiAgICAgICAgICAgICAgICBub2RlQ2FjaGVkLmxhYmVsID0gbmFtZUZyb21Ob2RlO1xyXG4gICAgICAgICAgICAgICAgbm9kZUNhY2hlZC5wYXRoID0gbmV3UGF0aDtcclxuICAgICAgICAgICAgICAgIG5vZGVDYWNoZWQubmFtZSA9IG5hbWVGcm9tTm9kZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZmlsZS5sYWJlbCA9IG5hbWVGcm9tTm9kZTtcclxuICAgICAgICAgICAgZmlsZS5wYXRoID0gbmV3UGF0aDtcclxuICAgICAgICAgICAgZmlsZS5uYW1lID0gbmFtZUZyb21Ob2RlO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9LFxyXG4gICAgICAgICAgZXJyb3IgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDMnKSB7IC8vSW50ZXJuYWwgU2VydmVyIEVycm9yXHJcbiAgICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiRmFpbGVkIHRvIHJlbmFtZSAnXCIgKyBmaWxlLnBhdGggKyBcIicuIEJhZCBwZXJtaXNzaW9ucy5cIixcclxuICAgICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDQnKSB7IC8vTm90IEZvdW5kXHJcbiAgICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiJ1wiICsgZmlsZS5wYXRoICsgXCInIGNvdWxkIG5vdCBiZSBvcGVuZWQgb3IgZG9lcyBub3QgZXhpc3QuXCIsXHJcbiAgICAgICAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9IGVsc2UgeyAvL1Vua25vd25cclxuICAgICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJGYWlsZWQgdG8gcmVuYW1lICdcIiArIGZpbGUucGF0aCArIFwiJy4gRXJyb3I6IFwiICsgZXJyb3IuX2JvZHksXHJcbiAgICAgICAgICAgICAgICAnRGlzbWlzcycsIGxvbmdTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMubG9nLnNldmVyZShlcnJvcik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB2YXIgcmVuYW1lRmllbGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XHJcbiAgICByZW5hbWVGaWVsZC5zZXRBdHRyaWJ1dGUoJ2lkJywgJ3JlbmFtZUhpZ2hsaWdodGVkRmllbGQnKTtcclxuICAgIHJlbmFtZUZpZWxkLnZhbHVlID0gb2xkTmFtZTtcclxuICAgIHJlbmFtZUZpZWxkLnN0eWxlLndpZHRoID0gKHNlbGVjdGVkTm9kZSBhcyBIVE1MRWxlbWVudCkuc3R5bGUud2lkdGg7XHJcbiAgICByZW5hbWVGaWVsZC5zdHlsZS5oZWlnaHQgPSAoc2VsZWN0ZWROb2RlIGFzIEhUTUxFbGVtZW50KS5zdHlsZS5oZWlnaHQ7XHJcbiAgICBsZXQgcm5Ob2RlID0gKGUpID0+IHtcclxuICAgICAgaWYgKGUud2hpY2ggPT0gMTMgfHwgZS5rZXkgPT0gXCJFbnRlclwiIHx8IGUua2V5Q29kZSA9PSAxMykge1xyXG4gICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgZS5jYW5jZWxCdWJibGUgPSB0cnVlO1xyXG4gICAgICAgIHJlbmFtZUZpZWxkLmJsdXIoKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHJlbmFtZUZpZWxkLmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBybk5vZGUpO1xyXG4gICAgcmVuYW1lRmllbGQub25ibHVyID0gZnVuY3Rpb24gKGUpIHtcclxuICAgICAgcmVuYW1lRm4oc2VsZWN0ZWROb2RlKVxyXG4gICAgfTtcclxuICAgIHNlbGVjdGVkTm9kZS5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChyZW5hbWVGaWVsZCwgc2VsZWN0ZWROb2RlKTtcclxuICAgIHJlbmFtZUZpZWxkLmZvY3VzKCk7XHJcbiAgICByZW5hbWVGaWVsZC5zZWxlY3QoKTtcclxuICB9XHJcblxyXG4gIHNob3dQZXJtaXNzaW9uc0RpYWxvZyhyaWdodENsaWNrZWRGaWxlOiBhbnkpIHtcclxuICAgIGNvbnN0IGZpbGVQcm9wQ29uZmlnID0gbmV3IE1hdERpYWxvZ0NvbmZpZygpO1xyXG4gICAgZmlsZVByb3BDb25maWcuZGF0YSA9IHtcclxuICAgICAgZXZlbnQ6IHJpZ2h0Q2xpY2tlZEZpbGVcclxuICAgIH1cclxuICAgIGZpbGVQcm9wQ29uZmlnLndpZHRoID0gJzQwMHB4JztcclxuXHJcbiAgICBjb25zdCBkaWFsb2dSZWYgPSB0aGlzLmRpYWxvZy5vcGVuKEZpbGVQZXJtaXNzaW9uc01vZGFsLCBmaWxlUHJvcENvbmZpZyk7XHJcbiAgICBkaWFsb2dSZWYuYWZ0ZXJDbG9zZWQoKS5zdWJzY3JpYmUoKHJlcz86IGJvb2xlYW4pID0+IHtcclxuICAgICAgaWYgKHJlcykge1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQocmlnaHRDbGlja2VkRmlsZSwgdHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgc2hvd093bmVyRGlhbG9nKHJpZ2h0Q2xpY2tlZEZpbGU6IGFueSkge1xyXG4gICAgY29uc3QgZmlsZVByb3BDb25maWcgPSBuZXcgTWF0RGlhbG9nQ29uZmlnKCk7XHJcbiAgICBmaWxlUHJvcENvbmZpZy5kYXRhID0ge1xyXG4gICAgICBldmVudDogcmlnaHRDbGlja2VkRmlsZVxyXG4gICAgfVxyXG4gICAgZmlsZVByb3BDb25maWcubWF4V2lkdGggPSAnNDAwcHgnO1xyXG5cclxuICAgIGNvbnN0IGRpYWxvZ1JlZiA9IHRoaXMuZGlhbG9nLm9wZW4oRmlsZU93bmVyc2hpcE1vZGFsLCBmaWxlUHJvcENvbmZpZyk7XHJcbiAgICBkaWFsb2dSZWYuYWZ0ZXJDbG9zZWQoKS5zdWJzY3JpYmUoKHJlcz86IGJvb2xlYW4pID0+IHtcclxuICAgICAgaWYgKHJlcykge1xyXG4gICAgICAgIHRoaXMuYWRkQ2hpbGQocmlnaHRDbGlja2VkRmlsZSwgdHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgc2hvd0RlbGV0ZURpYWxvZyhyaWdodENsaWNrZWRGaWxlOiBhbnkpIHtcclxuICAgIGlmICh0aGlzLmNoZWNrSWZJbkRlbGV0aW9uUXVldWVBbmRNZXNzYWdlKHJpZ2h0Q2xpY2tlZEZpbGUucGF0aCwgXCJUaGlzIGlzIGFscmVhZHkgYmVpbmcgZGVsZXRlZC5cIikgPT0gdHJ1ZSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZmlsZURlbGV0ZUNvbmZpZyA9IG5ldyBNYXREaWFsb2dDb25maWcoKTtcclxuICAgIGZpbGVEZWxldGVDb25maWcuZGF0YSA9IHtcclxuICAgICAgZXZlbnQ6IHJpZ2h0Q2xpY2tlZEZpbGUsXHJcbiAgICAgIHdpZHRoOiAnNjAwcHgnXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGZpbGVEZWxldGVSZWY6IE1hdERpYWxvZ1JlZjxEZWxldGVGaWxlTW9kYWw+ID0gdGhpcy5kaWFsb2cub3BlbihEZWxldGVGaWxlTW9kYWwsIGZpbGVEZWxldGVDb25maWcpO1xyXG4gICAgY29uc3QgZGVsZXRlRmlsZU9yRm9sZGVyID0gZmlsZURlbGV0ZVJlZi5jb21wb25lbnRJbnN0YW5jZS5vbkRlbGV0ZS5zdWJzY3JpYmUoKCkgPT4ge1xyXG4gICAgICB0aGlzLmRlbGV0ZUZpbGVPckZvbGRlcihyaWdodENsaWNrZWRGaWxlKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgYXR0ZW1wdERvd25sb2FkKHJpZ2h0Q2xpY2tlZEZpbGU6IGFueSkge1xyXG4gICAgbGV0IHJlbW90ZVBhdGggPSByaWdodENsaWNrZWRGaWxlLnBhdGg7XHJcbiAgICBsZXQgZmlsZW5hbWUgPSByaWdodENsaWNrZWRGaWxlLm5hbWU7XHJcbiAgICBsZXQgZG93bmxvYWRPYmplY3QgPSByaWdodENsaWNrZWRGaWxlO1xyXG4gICAgbGV0IHVybDogc3RyaW5nID0gWm93ZVpMVVgudXJpQnJva2VyLnVuaXhGaWxlVXJpKCdjb250ZW50cycsIHJlbW90ZVBhdGgpO1xyXG5cclxuICAgIHRoaXMuZG93bmxvYWRTZXJ2aWNlLmZldGNoRmlsZUhhbmRsZXIodXJsLCBmaWxlbmFtZSwgZG93bmxvYWRPYmplY3QpLnRoZW4oKHJlcykgPT4ge1xyXG4gICAgICAvLyBUT0RPOiBEb3dubG9hZCBxdWV1ZSBjb2RlIGZvciBwcm9ncmVzcyBiYXIgY291bGQgZ28gaGVyZVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBzaG93Q3JlYXRlRm9sZGVyRGlhbG9nKHJpZ2h0Q2xpY2tlZEZpbGU6IGFueSkge1xyXG4gICAgaWYgKHJpZ2h0Q2xpY2tlZEZpbGUucGF0aCkgeyAvLyBJZiB0aGlzIGNhbWUgZnJvbSBhIG5vZGUgb2JqZWN0XHJcbiAgICAgIGlmICh0aGlzLmNoZWNrSWZJbkRlbGV0aW9uUXVldWVBbmRNZXNzYWdlKHJpZ2h0Q2xpY2tlZEZpbGUucGF0aCwgXCJDYW5ub3QgY3JlYXRlIGEgZGlyZWN0b3J5IGluc2lkZSBhIGRpcmVjdG9yeSBxdWV1ZWQgZm9yIGRlbGV0aW9uLlwiKSA9PSB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgeyAvLyBPciBpZiB0aGlzIGlzIGp1c3QgYSBwYXRoXHJcbiAgICAgIGlmICh0aGlzLmNoZWNrSWZJbkRlbGV0aW9uUXVldWVBbmRNZXNzYWdlKHJpZ2h0Q2xpY2tlZEZpbGUsIFwiQ2Fubm90IGNyZWF0ZSBhIGRpcmVjdG9yeSBpbnNpZGUgYSBkaXJlY3RvcnkgcXVldWVkIGZvciBkZWxldGlvbi5cIikgPT0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGZvbGRlckNyZWF0ZUNvbmZpZyA9IG5ldyBNYXREaWFsb2dDb25maWcoKTtcclxuICAgIGZvbGRlckNyZWF0ZUNvbmZpZy5kYXRhID0ge1xyXG4gICAgICBldmVudDogcmlnaHRDbGlja2VkRmlsZSxcclxuICAgICAgd2lkdGg6ICc2MDBweCdcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZmlsZUNyZWF0ZVJlZjogTWF0RGlhbG9nUmVmPENyZWF0ZUZvbGRlck1vZGFsPiA9IHRoaXMuZGlhbG9nLm9wZW4oQ3JlYXRlRm9sZGVyTW9kYWwsIGZvbGRlckNyZWF0ZUNvbmZpZyk7XHJcbiAgICBjb25zdCBjcmVhdGVGb2xkZXIgPSBmaWxlQ3JlYXRlUmVmLmNvbXBvbmVudEluc3RhbmNlLm9uQ3JlYXRlLnN1YnNjcmliZShvbkNyZWF0ZVJlc3BvbnNlID0+IHtcclxuICAgICAgLyogcGF0aEFuZE5hbWUgLSBQYXRoIGFuZCBuYW1lIG9idGFpbmVkIGZyb20gY3JlYXRlIGZvbGRlciBwcm9tcHRcclxuICAgICAgdXBkYXRlRXhpc3RpbmdUcmVlIC0gU2hvdWxkIHRoZSBleGlzdGluZyB0cmVlIHVwZGF0ZSBvciBmZXRjaCBhIG5ldyBvbmUgKi9cclxuICAgICAgdGhpcy5jcmVhdGVGb2xkZXIob25DcmVhdGVSZXNwb25zZS5nZXQoXCJwYXRoQW5kTmFtZVwiKSwgcmlnaHRDbGlja2VkRmlsZSwgb25DcmVhdGVSZXNwb25zZS5nZXQoXCJ1cGRhdGVFeGlzdGluZ1RyZWVcIikpO1xyXG4gICAgICAvLyBlbWl0IHRoZSBldmVudCB3aXRoIG5vZGUgaW5mbyBvbmx5IHdoZW4gbm9kZSBpcyByaWdodCBjbGlja2VkIGFuZCBub3Qgb24gZmlsZSB0cmVlIHBhbmVsXHJcbiAgICAgIHRoaXMubmV3Rm9sZGVyQ2xpY2suZW1pdCh0aGlzLnJpZ2h0Q2xpY2tlZEV2ZW50Lm5vZGUgPyB0aGlzLnJpZ2h0Q2xpY2tlZEV2ZW50Lm5vZGUgOiAnJyk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHNob3dDcmVhdGVGaWxlRGlhbG9nKHJpZ2h0Q2xpY2tlZEZpbGU6IGFueSkge1xyXG4gICAgaWYgKHJpZ2h0Q2xpY2tlZEZpbGUucGF0aCkgeyAvLyBJZiB0aGlzIGNhbWUgZnJvbSBhIG5vZGUgb2JqZWN0XHJcbiAgICAgIGlmICh0aGlzLmNoZWNrSWZJbkRlbGV0aW9uUXVldWVBbmRNZXNzYWdlKHJpZ2h0Q2xpY2tlZEZpbGUucGF0aCwgXCJDYW5ub3QgY3JlYXRlIGEgZmlsZSBpbnNpZGUgYSBkaXJlY3RvcnkgcXVldWVkIGZvciBkZWxldGlvbi5cIikgPT0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHsgLy8gT3IgaWYgdGhpcyBpcyBqdXN0IGEgcGF0aFxyXG4gICAgICBpZiAodGhpcy5jaGVja0lmSW5EZWxldGlvblF1ZXVlQW5kTWVzc2FnZShyaWdodENsaWNrZWRGaWxlLCBcIkNhbm5vdCBjcmVhdGUgYSBmaWxlIGluc2lkZSBhIGRpcmVjdG9yeSBxdWV1ZWQgZm9yIGRlbGV0aW9uLlwiKSA9PSB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZmlsZUNyZWF0ZUNvbmZpZyA9IG5ldyBNYXREaWFsb2dDb25maWcoKTtcclxuICAgIGZpbGVDcmVhdGVDb25maWcuZGF0YSA9IHtcclxuICAgICAgZXZlbnQ6IHJpZ2h0Q2xpY2tlZEZpbGUsXHJcbiAgICAgIHdpZHRoOiAnNjAwcHgnXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGZpbGVDcmVhdGVSZWY6IE1hdERpYWxvZ1JlZjxDcmVhdGVGaWxlTW9kYWw+ID0gdGhpcy5kaWFsb2cub3BlbihDcmVhdGVGaWxlTW9kYWwsIGZpbGVDcmVhdGVDb25maWcpO1xyXG4gICAgY29uc3QgY3JlYXRlRmlsZSA9IGZpbGVDcmVhdGVSZWYuY29tcG9uZW50SW5zdGFuY2Uub25GaWxlQ3JlYXRlLnN1YnNjcmliZShvbkZpbGVDcmVhdGVSZXNwb25zZSA9PiB7XHJcbiAgICAgIC8qIHBhdGhBbmROYW1lIC0gUGF0aCBhbmQgbmFtZSBvYnRhaW5lZCBmcm9tIGNyZWF0ZSBmb2xkZXIgcHJvbXB0XHJcbiAgICAgIHVwZGF0ZUV4aXN0aW5nVHJlZSAtIFNob3VsZCB0aGUgZXhpc3RpbmcgdHJlZSB1cGRhdGUgb3IgZmV0Y2ggYSBuZXcgb25lICovXHJcbiAgICAgIHRoaXMuY3JlYXRlRmlsZShvbkZpbGVDcmVhdGVSZXNwb25zZS5nZXQoXCJwYXRoQW5kTmFtZVwiKSwgcmlnaHRDbGlja2VkRmlsZSwgb25GaWxlQ3JlYXRlUmVzcG9uc2UuZ2V0KFwidXBkYXRlRXhpc3RpbmdUcmVlXCIpKTtcclxuICAgICAgLy8gZW1pdCB0aGUgZXZlbnQgd2l0aCBub2RlIGluZm8gb25seSB3aGVuIG5vZGUgaXMgcmlnaHQgY2xpY2tlZCBhbmQgbm90IG9uIGZpbGUgdHJlZSBwYW5lbFxyXG4gICAgICB0aGlzLm5ld0ZpbGVDbGljay5lbWl0KHRoaXMucmlnaHRDbGlja2VkRXZlbnQubm9kZSA/IHRoaXMucmlnaHRDbGlja2VkRXZlbnQubm9kZSA6ICcnKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgc2hvd1VwbG9hZERpYWxvZyhyaWdodENsaWNrZWRGaWxlOiBhbnkpIHtcclxuICAgIGNvbnN0IGZvbGRlclVwbG9hZENvbmZpZyA9IG5ldyBNYXREaWFsb2dDb25maWcoKTtcclxuICAgIGZvbGRlclVwbG9hZENvbmZpZy5kYXRhID0ge1xyXG4gICAgICBldmVudDogcmlnaHRDbGlja2VkRmlsZSB8fCB0aGlzLnBhdGgsXHJcbiAgICAgIHdpZHRoOiAnNjAwcHgnXHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGZpbGVVcGxvYWRSZWY6IE1hdERpYWxvZ1JlZjxVcGxvYWRNb2RhbD4gPSB0aGlzLmRpYWxvZy5vcGVuKFVwbG9hZE1vZGFsLCBmb2xkZXJVcGxvYWRDb25maWcpO1xyXG4gICAgY29uc3QgdXBsb2FkID0gZmlsZVVwbG9hZFJlZi5jb21wb25lbnRJbnN0YW5jZS5vblVwbG9hZC5zdWJzY3JpYmUob25VcGxvYWRSZXNwb25zZSA9PiB7XHJcbiAgICAgIGlmIChyaWdodENsaWNrZWRGaWxlICYmIHJpZ2h0Q2xpY2tlZEZpbGUucGF0aCAmJiByaWdodENsaWNrZWRGaWxlLnBhdGggIT0gdGhpcy5wYXRoKSB7XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZChyaWdodENsaWNrZWRGaWxlLCB0cnVlKTtcclxuICAgICAgICB0aGlzLmZpbGVVcGxvYWRlZC5lbWl0KHRoaXMucmlnaHRDbGlja2VkRXZlbnQubm9kZS5wYXRoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLmRpc3BsYXlUcmVlKHRoaXMucGF0aCwgZmFsc2UpO1xyXG4gICAgICAgIHRoaXMuZmlsZVVwbG9hZGVkLmVtaXQodGhpcy5wYXRoKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBjb3B5TGluayhyaWdodENsaWNrZWRGaWxlOiBhbnkpIHtcclxuICAgIGxldCBsaW5rID0gJyc7XHJcbiAgICBpZiAocmlnaHRDbGlja2VkRmlsZS5kaXJlY3RvcnkpIHtcclxuICAgICAgbGluayA9IGAke3dpbmRvdy5sb2NhdGlvbi5vcmlnaW59JHt3aW5kb3cubG9jYXRpb24ucGF0aG5hbWV9P3BsdWdpbklkPSR7dGhpcy5wbHVnaW5EZWZpbml0aW9uLmdldEJhc2VQbHVnaW4oKS5nZXRJZGVudGlmaWVyKCl9OmRhdGE6JHtlbmNvZGVVUklDb21wb25lbnQoYHtcInR5cGVcIjpcIm9wZW5EaXJcIixcIm5hbWVcIjpcIiR7cmlnaHRDbGlja2VkRmlsZS5wYXRofVwiLFwidG9nZ2xlVHJlZVwiOmZhbHNlfWApfWA7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsaW5rID0gYCR7d2luZG93LmxvY2F0aW9uLm9yaWdpbn0ke3dpbmRvdy5sb2NhdGlvbi5wYXRobmFtZX0/cGx1Z2luSWQ9JHt0aGlzLnBsdWdpbkRlZmluaXRpb24uZ2V0QmFzZVBsdWdpbigpLmdldElkZW50aWZpZXIoKX06ZGF0YToke2VuY29kZVVSSUNvbXBvbmVudChge1widHlwZVwiOlwib3BlbkZpbGVcIixcIm5hbWVcIjpcIiR7cmlnaHRDbGlja2VkRmlsZS5wYXRofVwiLFwidG9nZ2xlVHJlZVwiOnRydWV9YCl9YDtcclxuICAgIH1cclxuICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGxpbmspLnRoZW4oKCkgPT4ge1xyXG4gICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkxpbmsgY29waWVkIHRvIGNsaXBib2FyZFwiKTtcclxuICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiQ29waWVkIGxpbmsgc3VjY2Vzc2Z1bGx5XCIsICdEaXNtaXNzJywgcXVpY2tTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgfSkuY2F0Y2goKCkgPT4ge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGNvcHkgTGluayB0byBjbGlwYm9hcmRcIik7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGNvcHlQYXRoKHJpZ2h0Q2xpY2tlZEZpbGU6IGFueSkge1xyXG4gICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQocmlnaHRDbGlja2VkRmlsZS5wYXRoKS50aGVuKCgpID0+IHtcclxuICAgICAgdGhpcy5sb2cuZGVidWcoXCJQYXRoIGNvcGllZCB0byBjbGlwYm9hcmRcIik7XHJcbiAgICB9KS5jYXRjaCgoKSA9PiB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gY29weSBwYXRoIHRvIGNsaXBib2FyZFwiKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgc2hvd1RhZ2dpbmdEaWFsb2cocmlnaHRDbGlja2VkRmlsZTogYW55KSB7XHJcbiAgICBjb25zdCBjb25maWcgPSBuZXcgTWF0RGlhbG9nQ29uZmlnKCk7XHJcbiAgICBjb25maWcuZGF0YSA9IHtcclxuICAgICAgbm9kZTogcmlnaHRDbGlja2VkRmlsZVxyXG4gICAgfVxyXG4gICAgY29uZmlnLm1heFdpZHRoID0gJzQ1MHB4JztcclxuICAgIGNvbnN0IGRpYWxvZ1JlZiA9IHRoaXMuZGlhbG9nLm9wZW4oRmlsZVRhZ2dpbmdNb2RhbCwgY29uZmlnKTtcclxuICAgIGRpYWxvZ1JlZi5hZnRlckNsb3NlZCgpLnN1YnNjcmliZSgocmVzPzogYm9vbGVhbikgPT4ge1xyXG4gICAgICBpZiAocmVzKSB7XHJcbiAgICAgICAgdGhpcy5hZGRDaGlsZChyaWdodENsaWNrZWRGaWxlLCB0cnVlKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICB0b2dnbGVTZWFyY2goKSB7XHJcbiAgICB0aGlzLnNob3dTZWFyY2ggPSAhdGhpcy5zaG93U2VhcmNoO1xyXG4gICAgaWYgKHRoaXMuc2hvd1NlYXJjaCkge1xyXG4gICAgICB0aGlzLmZvY3VzU2VhcmNoSW5wdXQoKTtcclxuICAgICAgdGhpcy5kYXRhQ2FjaGVkID0gXy5jbG9uZURlZXAodGhpcy5kYXRhKTsgLy8gV2Ugd2FudCBhIGRlZXAgY2xvbmUgc28gd2UgY2FuIG1vZGlmeSB0aGlzLmRhdGEgdy9vIGNoYW5naW5nIHRoaXMuZGF0YUNhY2hlZFxyXG4gICAgICBpZiAodGhpcy5zZWFyY2hDdHJsLnZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5zZWFyY2hJbnB1dENoYW5nZWQodGhpcy5zZWFyY2hDdHJsLnZhbHVlKVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAodGhpcy5kYXRhQ2FjaGVkKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gdGhpcy5kYXRhQ2FjaGVkOyAvLyBXZSBkb24ndCBjYXJlIGFib3V0IGRlZXAgY2xvbmUgYmVjYXVzZSB3ZSBqdXN0IHdhbnQgdG8gZ2V0IGRhdGFDYWNoZWQgYmFja1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvLyBUT0RPOiBUaGVyZSdzIGFuIGFwcDJhcHAgb3Bwb3J0dW5pdHkgaGVyZSwgd2hlcmUgYW4gYXBwIHVzaW5nIHRoZSBGaWxlIFRyZWUgY291bGQgc3Bhd24gd2l0aCBhIHByZS1maWx0ZXJlZCBsaXN0IG9mIG5vZGVzXHJcbiAgZm9jdXNTZWFyY2hJbnB1dChhdHRlbXB0Q291bnQ/OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLnNlYXJjaFVTUykge1xyXG4gICAgICB0aGlzLnNlYXJjaFVTUy5uYXRpdmVFbGVtZW50LmZvY3VzKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGNvbnN0IG1heEF0dGVtcHRzID0gMTA7XHJcbiAgICBpZiAodHlwZW9mIGF0dGVtcHRDb3VudCAhPT0gJ251bWJlcicpIHtcclxuICAgICAgYXR0ZW1wdENvdW50ID0gbWF4QXR0ZW1wdHM7XHJcbiAgICB9XHJcbiAgICBpZiAoYXR0ZW1wdENvdW50ID4gMCkge1xyXG4gICAgICBhdHRlbXB0Q291bnQtLTtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLmZvY3VzU2VhcmNoSW5wdXQoYXR0ZW1wdENvdW50KSwgMTAwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIG9uTmV3RmlsZUNsaWNrKCRldmVudDogYW55KTogdm9pZCB7XHJcbiAgLy8gICB0aGlzLm5ld0ZpbGVDbGljay5lbWl0KCRldmVudCk7XHJcbiAgLy8gfVxyXG5cclxuICBvbk5vZGVDbGljaygkZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgdGhpcy5wYXRoID0gdGhpcy5wYXRoLnJlcGxhY2UoL1xcLyQvLCAnJyk7XHJcbiAgICB0aGlzLnNlbGVjdGVkTm9kZSA9ICRldmVudC5ub2RlO1xyXG4gICAgaWYgKCRldmVudC5ub2RlLmRhdGEgPT09ICdGb2xkZXInKSB7XHJcbiAgICAgIGlmICh0aGlzLmNoZWNrSWZJbkRlbGV0aW9uUXVldWVBbmRNZXNzYWdlKCRldmVudC5ub2RlLnBhdGgsIFwiQ2Fubm90IG9wZW4gYSBkaXJlY3RvcnkgcXVldWVkIGZvciBkZWxldGlvbi5cIikgPT0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLmFkZENoaWxkKCRldmVudC5ub2RlKTtcclxuICAgICAgdGhpcy5ub2RlQ2xpY2suZW1pdCgkZXZlbnQubm9kZSk7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgaWYgKHRoaXMuY2hlY2tJZkluRGVsZXRpb25RdWV1ZUFuZE1lc3NhZ2UoJGV2ZW50Lm5vZGUucGF0aCwgXCJDYW5ub3Qgb3BlbiBhIGZpbGUgcXVldWVkIGZvciBkZWxldGlvbi5cIikgPT0gdHJ1ZSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICB0aGlzLm5vZGVDbGljay5lbWl0KCRldmVudC5ub2RlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIG9uTm9kZURibENsaWNrKCRldmVudDogYW55KTogdm9pZCB7XHJcbiAgICBsZXQgdXBkYXRlVHJlZSA9IGZhbHNlOyAvLyBBIGRvdWJsZSBjbGljayBkcmlsbHMgaW50byBhIGZvbGRlciwgc28gd2UgbWFrZSBhIGZyZXNoIHF1ZXJ5IGluc3RlYWQgb2YgdXBkYXRlXHJcbiAgICB0aGlzLmRpc3BsYXlUcmVlKCRldmVudC5ub2RlLnBhdGgsIHVwZGF0ZVRyZWUpO1xyXG4gICAgdGhpcy5ub2RlRGJsQ2xpY2suZW1pdCgkZXZlbnQubm9kZSk7XHJcbiAgICB0aGlzLnNlbGVjdGVkTm9kZSA9ICRldmVudC5ub2RlO1xyXG4gIH1cclxuXHJcbiAgb25Ob2RlUmlnaHRDbGljaygkZXZlbnQ6IGFueSkge1xyXG4gICAgbGV0IG5vZGUgPSAkZXZlbnQubm9kZTtcclxuICAgIGxldCByaWdodENsaWNrUHJvcGVydGllcztcclxuXHJcbiAgICBpZiAobm9kZS5kaXJlY3RvcnkpIHtcclxuICAgICAgcmlnaHRDbGlja1Byb3BlcnRpZXMgPSB0aGlzLnJpZ2h0Q2xpY2tQcm9wZXJ0aWVzRm9sZGVyO1xyXG4gICAgICB0aGlzLnNlbGVjdGVkTm9kZSA9IG5vZGU7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByaWdodENsaWNrUHJvcGVydGllcyA9IHRoaXMucmlnaHRDbGlja1Byb3BlcnRpZXNGaWxlO1xyXG4gICAgICB0aGlzLnNlbGVjdGVkTm9kZSA9IG5vZGUucGFyZW50O1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLndpbmRvd0FjdGlvbnMpIHtcclxuICAgICAgbGV0IGRpZENvbnRleHRNZW51U3Bhd24gPSB0aGlzLndpbmRvd0FjdGlvbnMuc3Bhd25Db250ZXh0TWVudSgkZXZlbnQub3JpZ2luYWxFdmVudC5jbGllbnRYLCAkZXZlbnQub3JpZ2luYWxFdmVudC5jbGllbnRZLCByaWdodENsaWNrUHJvcGVydGllcywgdHJ1ZSk7XHJcbiAgICAgIC8vIFRPRE86IEZpeCBab3dlJ3MgY29udGV4dCBtZW51IHN1Y2ggdGhhdCBpZiBpdCBkb2Vzbid0IGhhdmUgZW5vdWdoIHNwYWNlIHRvIHNwYXduLCBpdCBtb3ZlcyBpdHNlbGYgYWNjb3JkaW5nbHkgdG8gc3Bhd24uXHJcbiAgICAgIGlmICghZGlkQ29udGV4dE1lbnVTcGF3bikgeyAvLyBJZiBjb250ZXh0IG1lbnUgZmFpbGVkIHRvIHNwYXduLi4uXHJcbiAgICAgICAgbGV0IGhlaWdodEFkanVzdG1lbnQgPSAkZXZlbnQub3JpZ2luYWxFdmVudC5jbGllbnRZIC0gMjU7IC8vIEJ1bXAgaXQgdXAgMjVweFxyXG4gICAgICAgIGRpZENvbnRleHRNZW51U3Bhd24gPSB0aGlzLndpbmRvd0FjdGlvbnMuc3Bhd25Db250ZXh0TWVudSgkZXZlbnQub3JpZ2luYWxFdmVudC5jbGllbnRYLCBoZWlnaHRBZGp1c3RtZW50LCByaWdodENsaWNrUHJvcGVydGllcywgdHJ1ZSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnJpZ2h0Q2xpY2tlZEZpbGUgPSBub2RlO1xyXG4gICAgdGhpcy5yaWdodENsaWNrZWRFdmVudCA9ICRldmVudDtcclxuICAgIHRoaXMucmlnaHRDbGljay5lbWl0KCRldmVudC5ub2RlKTtcclxuICAgICRldmVudC5vcmlnaW5hbEV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcbiAgfVxyXG5cclxuICBvblBhbmVsUmlnaHRDbGljaygkZXZlbnQ6IGFueSkge1xyXG4gICAgaWYgKHRoaXMud2luZG93QWN0aW9ucykge1xyXG4gICAgICBsZXQgZGlkQ29udGV4dE1lbnVTcGF3biA9IHRoaXMud2luZG93QWN0aW9ucy5zcGF3bkNvbnRleHRNZW51KCRldmVudC5jbGllbnRYLCAkZXZlbnQuY2xpZW50WSwgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc1BhbmVsLCB0cnVlKTtcclxuICAgICAgLy8gVE9ETzogRml4IFpvd2UncyBjb250ZXh0IG1lbnUgc3VjaCB0aGF0IGlmIGl0IGRvZXNuJ3QgaGF2ZSBlbm91Z2ggc3BhY2UgdG8gc3Bhd24sIGl0IG1vdmVzIGl0c2VsZiBhY2NvcmRpbmdseSB0byBzcGF3bi5cclxuICAgICAgaWYgKCFkaWRDb250ZXh0TWVudVNwYXduKSB7IC8vIElmIGNvbnRleHQgbWVudSBmYWlsZWQgdG8gc3Bhd24uLi5cclxuICAgICAgICBsZXQgaGVpZ2h0QWRqdXN0bWVudCA9ICRldmVudC5jbGllbnRZIC0gMjU7IC8vIEJ1bXAgaXQgdXAgMjVweFxyXG4gICAgICAgIGRpZENvbnRleHRNZW51U3Bhd24gPSB0aGlzLndpbmRvd0FjdGlvbnMuc3Bhd25Db250ZXh0TWVudSgkZXZlbnQuY2xpZW50WCwgaGVpZ2h0QWRqdXN0bWVudCwgdGhpcy5yaWdodENsaWNrUHJvcGVydGllc1BhbmVsLCB0cnVlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5yaWdodENsaWNrZWRFdmVudCA9ICRldmVudDtcclxuICB9XHJcblxyXG4gIG9uUGF0aENoYW5nZWQoJGV2ZW50OiBhbnkpOiB2b2lkIHtcclxuICAgIHRoaXMucGF0aENoYW5nZWQuZW1pdCgkZXZlbnQpO1xyXG4gIH1cclxuXHJcbiAgb25EYXRhQ2hhbmdlZCgkZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgdGhpcy5kYXRhQ2hhbmdlZC5lbWl0KCRldmVudCk7XHJcbiAgfVxyXG5cclxuICBzb3J0Rm4oYTogYW55LCBiOiBhbnkpIHtcclxuICAgIGlmIChhLmRpcmVjdG9yeSAhPT0gYi5kaXJlY3RvcnkpIHtcclxuICAgICAgaWYgKGEuZGlyZWN0b3J5ID09PSB0cnVlKSB7XHJcbiAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoYS5uYW1lLnRvTG93ZXJDYXNlKCkgPCBiLm5hbWUudG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gMTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY29sbGFwc2VUcmVlKCk6IHZvaWQge1xyXG4gICAgbGV0IGRhdGFBcnJheSA9IHRoaXMuZGF0YTtcclxuICAgIHRoaXMuc2VsZWN0ZWROb2RlID0gbnVsbDtcclxuICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBkYXRhQXJyYXkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKHRoaXMuZGF0YVtpXS5leHBhbmRlZCA9PSB0cnVlKSB7XHJcbiAgICAgICAgdGhpcy5kYXRhW2ldLmV4cGFuZGVkID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHRoaXMudHJlZUNvbXBvbmVudC51bnNlbGVjdE5vZGUoKTtcclxuICB9XHJcblxyXG4gIC8vRGlzcGxheXMgdGhlIHN0YXJ0aW5nIGZpbGUgc3RydWN0dXJlIG9mICdwYXRoJy4gV2hlbiB1cGRhdGUgPT0gdHJ1ZSwgdHJlZSB3aWxsIGJlIHVwZGF0ZWRcclxuICAvL2luc3RlYWQgb2YgcmVzZXQgdG8gJ3BhdGgnIChtZWFuaW5nIGN1cnJlbnRseSBvcGVuZWQgY2hpbGRyZW4gZG9uJ3QgZ2V0IHdpcGVkL2Nsb3NlZClcclxuICBwdWJsaWMgZGlzcGxheVRyZWUocGF0aDogc3RyaW5nLCB1cGRhdGU6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIC8vVG8gcmVkdWNlIHVuaW50ZW50aW9uYWwgYnVncyBieSBkZWZhdWx0aW5nIHRvIHJvb3QgZGlyZWN0b3J5IG9yIGRyb3BwaW5nIGlmIGNhbGxlciBzZW50IGFuIG9iamVjdCB3ZSdyZSBub3Qgc3VwcG9zZWQgdG8gYmUgdXNpbmdcclxuICAgIGlmIChwYXRoID09PSB1bmRlZmluZWQgfHwgcGF0aCA9PT0gJycpIHtcclxuICAgICAgcGF0aCA9IHRoaXMucm9vdDtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHBhdGggIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIHRoaXMubG9nLndhcm4oXCJUaGUgRlQgcmVjZWl2ZWQgYSBwYXRoIG9iamVjdCB0aGF0IHdhc24ndCBhIHN0cmluZyBzbyBpdCBjb3VsZG4ndCBjb250aW51ZSwgb2JqZWN0PVwiLCBwYXRoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuc2VsZWN0ZWROb2RlID0gbnVsbDtcclxuICAgIHRoaXMuaXNMb2FkaW5nID0gdHJ1ZTtcclxuICAgIGxldCB1c3NEYXRhID0gdGhpcy51c3NTcnYuZ2V0RmlsZUNvbnRlbnRzKHBhdGgpO1xyXG4gICAgdXNzRGF0YS5zdWJzY3JpYmUoXHJcbiAgICAgIGZpbGVzID0+IHtcclxuICAgICAgICBpZiAoZmlsZXMuZW50cmllcyA9PSB1bmRlZmluZWQpIHsgLy8gUmVkdWNlcyBjb25zb2xlIGVycm9ycyBhbmQgb3RoZXIgYnVncyBieSBhY2NpZGVudGFsbHkgcHJvdmlkaW5nIGEgVVNTIGZpbGUgYXMgVVNTIHBhdGhcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZmlsZXMuZW50cmllcy5zb3J0KHRoaXMuc29ydEZuKTtcclxuICAgICAgICB0aGlzLm9uRGF0YUNoYW5nZWQoZmlsZXMuZW50cmllcyk7XHJcbiAgICAgICAgY29uc3QgdGVtcENoaWxkcmVuOiBGaWxlVHJlZU5vZGVbXSA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCBmaWxlcy5lbnRyaWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBpZiAoZmlsZXMuZW50cmllc1tpXS5kaXJlY3RvcnkpIHtcclxuICAgICAgICAgICAgZmlsZXMuZW50cmllc1tpXS5jaGlsZHJlbiA9IFtdO1xyXG4gICAgICAgICAgICBmaWxlcy5lbnRyaWVzW2ldLmRhdGEgPSBcIkZvbGRlclwiO1xyXG4gICAgICAgICAgICBmaWxlcy5lbnRyaWVzW2ldLmNvbGxhcHNlZEljb24gPSBcImZhIGZhLWZvbGRlclwiO1xyXG4gICAgICAgICAgICBmaWxlcy5lbnRyaWVzW2ldLmV4cGFuZGVkSWNvbiA9IFwiZmEgZmEtZm9sZGVyLW9wZW5cIjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBmaWxlcy5lbnRyaWVzW2ldLml0ZW1zID0ge307XHJcbiAgICAgICAgICAgIGZpbGVzLmVudHJpZXNbaV0uaWNvbiA9IFwiZmEgZmEtZmlsZVwiO1xyXG4gICAgICAgICAgICBmaWxlcy5lbnRyaWVzW2ldLmRhdGEgPSBcIkZpbGVcIjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGZpbGVzLmVudHJpZXNbaV0ubGFiZWwgPSBmaWxlcy5lbnRyaWVzW2ldLm5hbWU7XHJcbiAgICAgICAgICBmaWxlcy5lbnRyaWVzW2ldLmlkID0gaTtcclxuICAgICAgICAgIHRlbXBDaGlsZHJlbi5wdXNoKGZpbGVzLmVudHJpZXNbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh1cGRhdGUgPT0gdHJ1ZSkgey8vVHJlZSBpcyBkaXNwbGF5ZWQgdG8gdXBkYXRlIGV4aXN0aW5nIG9wZW5lZCBub2Rlcywgd2hpbGUgbWFpbnRhaW5pbmcgY3VycmVudGx5IG9wZW5lZCB0cmVlcyBcclxuXHJcbiAgICAgICAgICBsZXQgaW5kZXhBcnJheTogbnVtYmVyW107XHJcbiAgICAgICAgICBsZXQgZGF0YUFycmF5OiBGaWxlVHJlZU5vZGVbXTsvL3JlcHJlc2VudHMgdGhlIHdvcmtpbmcgRmlsZVRyZWVOb2RlW10gdGhhdCB3aWxsIGV2ZW50dWFsbHkgYmUgYWRkZWQgdG8gdGVtcENoaWxkcmVuIGFuZCBtYWtlIHVwIHRoZSB0cmVlXHJcbiAgICAgICAgICBsZXQgbmV0d29ya0FycmF5OiBGaWxlVHJlZU5vZGVbXTsvL3JlcHJlc2VudHMgdGhlIEZpbGVUcmVlTm9kZVtdIG9idGFpbmVkIGZyb20gdGhlIHVzcyBzZXJ2ZXIsIHdpbGwgaXRlcmF0aXZlbHkgcmVwbGFjZSBkYXRhQXJyYXkgYXMgbmVlZCBiZVxyXG4gICAgICAgICAgbGV0IHBhcmVudE5vZGU6IEZpbGVUcmVlTm9kZTtcclxuICAgICAgICAgIGluZGV4QXJyYXkgPSBbMF07XHJcbiAgICAgICAgICBkYXRhQXJyYXkgPSB0aGlzLmRhdGE7XHJcbiAgICAgICAgICBuZXR3b3JrQXJyYXkgPSB0ZW1wQ2hpbGRyZW47XHJcbiAgICAgICAgICB3aGlsZSAoaW5kZXhBcnJheVtpbmRleEFycmF5Lmxlbmd0aCAtIDFdIDw9IGRhdGFBcnJheS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgLy9HbyBiYWNrIHVwIGEgbGF5ZXJcclxuICAgICAgICAgICAgaWYgKGluZGV4QXJyYXlbaW5kZXhBcnJheS5sZW5ndGggLSAxXSA9PSBkYXRhQXJyYXkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgaW5kZXhBcnJheS5wb3AoKTtcclxuXHJcbiAgICAgICAgICAgICAgaWYgKHBhcmVudE5vZGUgIT09IHVuZGVmaW5lZCAmJiBwYXJlbnROb2RlLnBhcmVudCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJlbnROb2RlID0gcGFyZW50Tm9kZS5wYXJlbnQ7XHJcbiAgICAgICAgICAgICAgICBkYXRhQXJyYXkgPSBwYXJlbnROb2RlLmNoaWxkcmVuO1xyXG4gICAgICAgICAgICAgICAgbmV0d29ya0FycmF5ID0gZGF0YUFycmF5O1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChwYXJlbnROb2RlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgICAgZm9yIChsZXQgaTogbnVtYmVyID0gMDsgaSA8IHRlbXBDaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnROb2RlLmxhYmVsID09IHRlbXBDaGlsZHJlbltpXS5sYWJlbCB8fCBwYXJlbnROb2RlLmNoaWxkcmVuID09IHRlbXBDaGlsZHJlbltpXS5jaGlsZHJlbikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgdGVtcENoaWxkcmVuW2ldID0gcGFyZW50Tm9kZTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgZGF0YUFycmF5ID0gdGhpcy5kYXRhO1xyXG4gICAgICAgICAgICAgICAgbmV0d29ya0FycmF5ID0gdGVtcENoaWxkcmVuO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChkYXRhQXJyYXlbaW5kZXhBcnJheVtpbmRleEFycmF5Lmxlbmd0aCAtIDFdXSAhPT0gdW5kZWZpbmVkICYmIGRhdGFBcnJheVtpbmRleEFycmF5W2luZGV4QXJyYXkubGVuZ3RoIC0gMV1dLmRhdGEgPT0gJ0ZvbGRlcidcclxuICAgICAgICAgICAgICAmJiBkYXRhQXJyYXlbaW5kZXhBcnJheVtpbmRleEFycmF5Lmxlbmd0aCAtIDFdXS5jaGlsZHJlbiAhPT0gdW5kZWZpbmVkICYmIGRhdGFBcnJheVtpbmRleEFycmF5W2luZGV4QXJyYXkubGVuZ3RoIC0gMV1dLmNoaWxkcmVuLmxlbmd0aCAhPT0gMCkge1xyXG4gICAgICAgICAgICAgIC8vLi4uIGlmIHRoZSBjaGlsZHJlbiBvZiBkYXRhQXJyYXkgd2l0aCBpbmRleCBpbiBsYXN0IGVsZW1lbnQgb2YgaW5kZXhBcnJheSBhcmUgbm90IGVtcHR5LCBkcmlsbCBpbnRvIHRoZW0hXHJcbiAgICAgICAgICAgICAgcGFyZW50Tm9kZSA9IGRhdGFBcnJheVtpbmRleEFycmF5W2luZGV4QXJyYXkubGVuZ3RoIC0gMV1dO1xyXG4gICAgICAgICAgICAgIGRhdGFBcnJheSA9IHBhcmVudE5vZGUuY2hpbGRyZW47XHJcbiAgICAgICAgICAgICAgbmV0d29ya0FycmF5ID0gZGF0YUFycmF5O1xyXG4gICAgICAgICAgICAgIGluZGV4QXJyYXlbaW5kZXhBcnJheS5sZW5ndGggLSAxXSsrO1xyXG4gICAgICAgICAgICAgIGluZGV4QXJyYXkucHVzaCgwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICBkYXRhQXJyYXlbaW5kZXhBcnJheVtpbmRleEFycmF5Lmxlbmd0aCAtIDFdXSA9IG5ldHdvcmtBcnJheVtpbmRleEFycmF5W2luZGV4QXJyYXkubGVuZ3RoIC0gMV1dO1xyXG4gICAgICAgICAgICAgIGluZGV4QXJyYXlbaW5kZXhBcnJheS5sZW5ndGggLSAxXSsrOy8vZ28gdXAgaW5kZXggdG8gY2hlY2sgbmV3IGVsZW1lbnQgaW4gZGF0YSBhcnJheVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcIlRyZWUgaGFzIGJlZW4gdXBkYXRlZC5cIik7XHJcbiAgICAgICAgdGhpcy5sb2cuZGVidWcodGVtcENoaWxkcmVuKTtcclxuICAgICAgICB0aGlzLmRhdGEgPSB0ZW1wQ2hpbGRyZW47XHJcbiAgICAgICAgaWYgKHRoaXMuc2hvd1NlYXJjaCkge1xyXG4gICAgICAgICAgdGhpcy5kYXRhQ2FjaGVkID0gdGhpcy5kYXRhOyAvLyBUT0RPOiBJbXBsZW1lbnQgbG9naWMgdG8gdXBkYXRlIHRyZWUgb2Ygc2VhcmNoIHF1ZXJpZWQgcmVzdWx0cyAoc28gcmV2ZXJ0aW5nIHRoZSBzZWFyY2ggZmlsdGVyIGRvZXNuJ3QgZmFpbClcclxuICAgICAgICAgIGlmICghdXBkYXRlKSB7IC8vIFdoZW4gYSBmcmVzaCB0cmVlIGlzIHJlcXVlc3RlZCwgaXQgd2lsbCBnZXQgcmlkIG9mIHRoaXMuZGF0YSBzZWFyY2ggcXVlcmllZCByZXN1bHRzLCBzbyBoaWRlIHNlYXJjaCBiYXJcclxuICAgICAgICAgICAgdGhpcy5zaG93U2VhcmNoID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucGF0aCA9IHBhdGg7XHJcblxyXG4gICAgICAgIHRoaXMub25QYXRoQ2hhbmdlZCh0aGlzLnBhdGgpO1xyXG5cclxuICAgICAgICAvLyB0aGlzLnBlcnNpc3RlbnREYXRhU2VydmljZS5nZXREYXRhKClcclxuICAgICAgICAvLyAgICAgICAuc3Vic2NyaWJlKGRhdGEgPT4ge1xyXG4gICAgICAgIC8vICAgICAgICAgdGhpcy5kYXRhT2JqZWN0ID0gZGF0YS5jb250ZW50cztcclxuICAgICAgICAvLyAgICAgICAgIHRoaXMuZGF0YU9iamVjdC51c3NJbnB1dCA9IHRoaXMucGF0aDtcclxuICAgICAgICAvLyAgICAgICAgIHRoaXMuZGF0YU9iamVjdC51c3NEYXRhID0gdGhpcy5kYXRhO1xyXG4gICAgICAgIC8vICAgICAgICAgdGhpcy5wZXJzaXN0ZW50RGF0YVNlcnZpY2Uuc2V0RGF0YSh0aGlzLmRhdGFPYmplY3QpXHJcbiAgICAgICAgLy8gICAgICAgICAgIC5zdWJzY3JpYmUoKHJlczogYW55KSA9PiB7IH0pO1xyXG4gICAgICAgIC8vICAgICAgIH0pXHJcbiAgICAgIH0sXHJcbiAgICAgIGVycm9yID0+IHtcclxuICAgICAgICB0aGlzLmlzTG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIGlmIChlcnJvci5zdGF0dXMgPT0gJzQwMycpIHsgLy9QZXJtaXNzaW9uIGRlbmllZFxyXG4gICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKCdGYWlsZWQgdG8gb3BlbjogUGVybWlzc2lvbiBkZW5pZWQuJyxcclxuICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnN0YXR1cyA9PSAnMCcpIHtcclxuICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkZhaWxlZCB0byBjb21tdW5pY2F0ZSB3aXRoIHRoZSBBcHAgc2VydmVyOiBcIiArIGVycm9yLnN0YXR1cyxcclxuICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnN0YXR1cyA9PSAnNDA0Jykge1xyXG4gICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiRmlsZS9mb2xkZXIgbm90IGZvdW5kLiBcIiArIGVycm9yLnN0YXR1cyxcclxuICAgICAgICAgICAgJ0Rpc21pc3MnLCBxdWlja1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkFuIHVua25vd24gZXJyb3Igb2NjdXJyZWQ6IFwiICsgZXJyb3Iuc3RhdHVzLFxyXG4gICAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmxvZy5zZXZlcmUoZXJyb3IpO1xyXG4gICAgICB9XHJcbiAgICApO1xyXG4gICAgdGhpcy5yZWZyZXNoSGlzdG9yeSh0aGlzLnBhdGgpO1xyXG4gIH1cclxuICBwcml2YXRlIHJlZnJlc2hIaXN0b3J5KHBhdGg6IHN0cmluZykge1xyXG4gICAgY29uc3Qgc3ViID0gdGhpcy51c3NTZWFyY2hIaXN0b3J5XHJcbiAgICAgIC5zYXZlU2VhcmNoSGlzdG9yeShwYXRoKVxyXG4gICAgICAuc3Vic2NyaWJlKCgpID0+IHtcclxuICAgICAgICBpZiAoc3ViKSBzdWIudW5zdWJzY3JpYmUoKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBjbGVhclNlYXJjaEhpc3RvcnkoKTogdm9pZCB7XHJcbiAgICB0aGlzLnVzc1NlYXJjaEhpc3RvcnkuZGVsZXRlU2VhcmNoSGlzdG9yeSgpLnN1YnNjcmliZSgpO1xyXG4gICAgdGhpcy51c3NTZWFyY2hIaXN0b3J5Lm9uSW5pdChTRUFSQ0hfSUQpO1xyXG4gIH1cclxuXHJcbiAgLy9BZGRzIGNoaWxkcmVuIHRvIHRoZSBleGlzdGluZyBub2RlIHRvIHVwZGF0ZSB0aGlzLmRhdGEgYXJyYXksIFxyXG4gIC8vZmV0Y2ggLSBmZXRjaGVzIG5ldyBkYXRhLCBleHBhbmQgLSBleHBhbmRzIG9yIG5vdCBmb2xkZXIgbm9kZSBhZnRlciBmZXRjaGluZyBuZXcgZGF0YVxyXG4gIGFkZENoaWxkKG5vZGU6IGFueSwgZmV0Y2g/OiBib29sZWFuLCBleHBhbmQ/OiBib29sZWFuKTogdm9pZCB7XHJcbiAgICBsZXQgcGF0aCA9IG5vZGUucGF0aDtcclxuICAgIGlmIChub2RlLmNoaWxkcmVuICYmIG5vZGUuY2hpbGRyZW4ubGVuZ3RoID4gMCAmJiAhZmV0Y2gpIHtcclxuICAgICAgLy9JZiBhbiBvcGVuZWQgbm9kZSBoYXMgY2hpbGRyZW4sIGFuZCB0aGUgdXNlciBjbGlja2VkIG9uIGl0Li4uXHJcbiAgICAgIGlmIChub2RlLmV4cGFuZGVkKSB7XHJcbiAgICAgICAgbm9kZS5leHBhbmRlZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIC8vSWYgYSBjbG9zZWQgbm9kZSBoYXMgY2hpbGRyZW4sIGFuZCB0aGUgdXNlciBjbGlja2VkIG9uIGl0Li4uXHJcbiAgICAgIGVsc2Uge1xyXG4gICAgICAgIG5vZGUuZXhwYW5kZWQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICh0aGlzLnNob3dTZWFyY2gpIHsgLy8gVXBkYXRlIG5vZGUgaW4gY2FjaGVkIGRhdGEgYXMgd2VsbFxyXG4gICAgICAgIGxldCBub2RlQ2FjaGVkID0gdGhpcy5maW5kTm9kZUJ5UGF0aCh0aGlzLmRhdGFDYWNoZWQsIHBhdGgpWzBdO1xyXG4gICAgICAgIGlmIChub2RlQ2FjaGVkKSB7XHJcbiAgICAgICAgICBub2RlQ2FjaGVkLmV4cGFuZGVkID0gbm9kZS5leHBhbmRlZDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2UgLy9XaGVuIHRoZSBzZWxlY3RlZCBub2RlIGhhcyBubyBjaGlsZHJlbiBvciB3ZSB3YW50IHRvIGZldGNoIG5ldyBkYXRhXHJcbiAgICB7XHJcbiAgICAgIHRoaXMucmVmcmVzaEZpbGVNZXRhZGF0YShub2RlKTtcclxuICAgICAgbm9kZS5leHBhbmRlZCA9IGV4cGFuZCAhPT0gdW5kZWZpbmVkID8gZXhwYW5kIDogdHJ1ZTtcclxuICAgICAgbGV0IHVzc0RhdGEgPSB0aGlzLnVzc1Nydi5nZXRGaWxlQ29udGVudHMocGF0aCk7XHJcbiAgICAgIGxldCB0ZW1wQ2hpbGRyZW46IEZpbGVUcmVlTm9kZVtdID0gW107XHJcbiAgICAgIHVzc0RhdGEuc3Vic2NyaWJlKFxyXG4gICAgICAgIGZpbGVzID0+IHtcclxuICAgICAgICAgIGZpbGVzLmVudHJpZXMuc29ydCh0aGlzLnNvcnRGbik7XHJcbiAgICAgICAgICAvL1RPRE86IENvdWxkIGJlIHR1cm5lZCBpbnRvIGEgdXRpbCBzZXJ2aWNlLi4uXHJcbiAgICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgZmlsZXMuZW50cmllcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZmlsZXMuZW50cmllc1tpXS5kaXJlY3RvcnkpIHtcclxuICAgICAgICAgICAgICBmaWxlcy5lbnRyaWVzW2ldLmNoaWxkcmVuID0gW107XHJcbiAgICAgICAgICAgICAgZmlsZXMuZW50cmllc1tpXS5kYXRhID0gXCJGb2xkZXJcIjtcclxuICAgICAgICAgICAgICBmaWxlcy5lbnRyaWVzW2ldLmNvbGxhcHNlZEljb24gPSBcImZhIGZhLWZvbGRlclwiO1xyXG4gICAgICAgICAgICAgIGZpbGVzLmVudHJpZXNbaV0uZXhwYW5kZWRJY29uID0gXCJmYSBmYS1mb2xkZXItb3BlblwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgIGZpbGVzLmVudHJpZXNbaV0uaXRlbXMgPSB7fTtcclxuICAgICAgICAgICAgICBmaWxlcy5lbnRyaWVzW2ldLmljb24gPSBcImZhIGZhLWZpbGVcIjtcclxuICAgICAgICAgICAgICBmaWxlcy5lbnRyaWVzW2ldLmRhdGEgPSBcIkZpbGVcIjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmaWxlcy5lbnRyaWVzW2ldLmxhYmVsID0gZmlsZXMuZW50cmllc1tpXS5uYW1lO1xyXG4gICAgICAgICAgICBmaWxlcy5lbnRyaWVzW2ldLmlkID0gaTtcclxuICAgICAgICAgICAgdGVtcENoaWxkcmVuLnB1c2goZmlsZXMuZW50cmllc1tpXSk7XHJcblxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgbm9kZS5jaGlsZHJlbiA9IHRlbXBDaGlsZHJlbjtcclxuICAgICAgICAgIG5vZGUuZXhwYW5kZWRJY29uID0gXCJmYSBmYS1mb2xkZXItb3BlblwiOyBub2RlLmNvbGxhcHNlZEljb24gPSBcImZhIGZhLWZvbGRlclwiO1xyXG4gICAgICAgICAgdGhpcy5sb2cuZGVidWcocGF0aCArIFwiIHdhcyBwb3B1bGF0ZWQgd2l0aCBcIiArIHRlbXBDaGlsZHJlbi5sZW5ndGggKyBcIiBjaGlsZHJlbi5cIik7XHJcblxyXG4gICAgICAgICAgd2hpbGUgKG5vZGUucGFyZW50ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgbGV0IG5ld0NoaWxkID0gbm9kZS5wYXJlbnQ7XHJcbiAgICAgICAgICAgIG5ld0NoaWxkLmNoaWxkcmVuW25vZGUuaWRdID0gbm9kZTtcclxuICAgICAgICAgICAgbmV3Q2hpbGQuZXhwYW5kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBuZXdDaGlsZC5leHBhbmRlZEljb24gPSBcImZhIGZhLWZvbGRlci1vcGVuXCI7IG5ld0NoaWxkLmNvbGxhcHNlZEljb24gPSBcImZhIGZhLWZvbGRlclwiO1xyXG4gICAgICAgICAgICBub2RlID0gbmV3Q2hpbGQ7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgbGV0IGluZGV4ID0gLTE7XHJcbiAgICAgICAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGFbaV0ubGFiZWwgPT0gbm9kZS5sYWJlbCkge1xyXG4gICAgICAgICAgICAgIGluZGV4ID0gaTsgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChpbmRleCAhPSAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFbaW5kZXhdID0gbm9kZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd1NlYXJjaCkgeyAvLyBJZiB3ZSB1cGRhdGUgYSBub2RlIGluIHRoZSB3b3JraW5nIGRpcmVjdG9yeSwgd2UgbmVlZCB0byBmaW5kIHRoYXQgc2FtZSBub2RlIGluIHRoZSBjYWNoZWQgZGF0YVxyXG4gICAgICAgICAgICAgIGluZGV4ID0gLTE7IC8vIHdoaWNoIG1heSBiZSBpbiBhIGRpZmZlcmVudCBpbmRleCBkdWUgdG8gZmlsdGVyaW5nIGJ5IHNlYXJjaCBxdWVyeVxyXG4gICAgICAgICAgICAgIGZvciAobGV0IGk6IG51bWJlciA9IDA7IGkgPCB0aGlzLmRhdGFDYWNoZWQubGVuZ3RoOyBpKyspIHsgLy8gV2UgY291bGQgdXNlIHRoaXMuZmluZE5vZGVCeVBhdGgsIGJ1dCB3ZSBuZWVkIHNlYXJjaCBvbmx5IHBhcmVudCBsZXZlbFxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGF0YUNhY2hlZFtpXS5sYWJlbCA9PSBub2RlLmxhYmVsKSB7XHJcbiAgICAgICAgICAgICAgICAgIGluZGV4ID0gaTsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChpbmRleCAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhQ2FjaGVkW2luZGV4XSA9IG5vZGU7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubG9nLmRlYnVnKFwiVGhvdWdoIG5vZGUgYWRkZWQgaW4gd29ya2luZyBkaXJlY3RvcnksIGZhaWxlZCB0byBmaW5kIGluZGV4IGluIGNhY2hlZCBkYXRhXCIpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvLyB0aGlzLnBlcnNpc3RlbnREYXRhU2VydmljZS5nZXREYXRhKClcclxuICAgICAgICAgICAgLy8gICAuc3Vic2NyaWJlKGRhdGEgPT4ge1xyXG4gICAgICAgICAgICAvLyAgICAgdGhpcy5kYXRhT2JqZWN0ID0gZGF0YS5jb250ZW50cztcclxuICAgICAgICAgICAgLy8gICAgIHRoaXMuZGF0YU9iamVjdC51c3NJbnB1dCA9IHRoaXMucGF0aDtcclxuICAgICAgICAgICAgLy8gICAgIHRoaXMuZGF0YU9iamVjdC51c3NEYXRhID0gdGhpcy5kYXRhO1xyXG4gICAgICAgICAgICAvLyAgICAgdGhpcy5wZXJzaXN0ZW50RGF0YVNlcnZpY2Uuc2V0RGF0YSh0aGlzLmRhdGFPYmplY3QpXHJcbiAgICAgICAgICAgIC8vICAgICAgIC5zdWJzY3JpYmUoKHJlczogYW55KSA9PiB7IH0pO1xyXG4gICAgICAgICAgICAvLyAgIH0pXHJcblxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhcImZhaWxlZCB0byBmaW5kIGluZGV4XCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmVmcmVzaEZpbGVNZXRhZGF0YShub2RlOiBhbnkpIHtcclxuICAgIGxldCBwYXRoID0gbm9kZS5wYXRoO1xyXG4gICAgbGV0IHNvbWVEYXRhID0gdGhpcy51c3NTcnYuZ2V0RmlsZU1ldGFkYXRhKHBhdGgpO1xyXG4gICAgc29tZURhdGEuc3Vic2NyaWJlKFxyXG4gICAgICByZXN1bHQgPT4ge1xyXG4gICAgICAgIGlmIChyZXN1bHQuZGlyZWN0b3J5KSB7XHJcbiAgICAgICAgICBub2RlLmRhdGEgPSBcIkZvbGRlclwiO1xyXG4gICAgICAgICAgbm9kZS5jb2xsYXBzZWRJY29uID0gXCJmYSBmYS1mb2xkZXJcIjtcclxuICAgICAgICAgIG5vZGUuZXhwYW5kZWRJY29uID0gXCJmYSBmYS1mb2xkZXItb3BlblwiO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBub2RlLml0ZW1zID0ge307XHJcbiAgICAgICAgICBub2RlLmljb24gPSBcImZhIGZhLWZpbGVcIjtcclxuICAgICAgICAgIG5vZGUuZGF0YSA9IFwiRmlsZVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgICBub2RlLmRpcmVjdG9yeSA9IHJlc3VsdC5kaXJlY3Rvcnk7XHJcbiAgICAgICAgbm9kZS5tb2RlID0gcmVzdWx0Lm1vZGU7XHJcbiAgICAgICAgbm9kZS5vd25lciA9IHJlc3VsdC5vd25lcjtcclxuICAgICAgICBub2RlLmdyb3VwID0gcmVzdWx0Lmdyb3VwO1xyXG4gICAgICAgIG5vZGUuc2l6ZSA9IHJlc3VsdC5zaXplO1xyXG4gICAgICAgIG5vZGUuY2NzaWQgPSByZXN1bHQuY2NzaWQ7XHJcbiAgICAgICAgbm9kZS5jcmVhdGVkQXQgPSByZXN1bHQuY3JlYXRlZEF0O1xyXG4gICAgICAgIHJldHVybiBub2RlO1xyXG4gICAgICB9LFxyXG4gICAgICBlID0+IHtcclxuICAgICAgICBpZiAoZS5zdGF0dXMgPT0gNDA0KSB7XHJcbiAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJGYWlsZWQgdG8gcmVmcmVzaCAnXCIgKyBub2RlLm5hbWUgKyBcIicgTm8gbG9uZ2VyIGV4aXN0cyBvciBoYXMgYmVlbiByZW5hbWVkLlwiLFxyXG4gICAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgdGhpcy5yZW1vdmVDaGlsZChub2RlKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGUuc3RhdHVzID09IDQwMykge1xyXG4gICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiRmFpbGVkIHRvIHJlZnJlc2ggJ1wiICsgbm9kZS5uYW1lICsgXCInIFBlcm1pc3Npb24gZGVuaWVkLlwiLFxyXG4gICAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZS5zdGF0dXMgPT0gNTAwKSB7XHJcbiAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJGYWlsZWQgdG8gcmVmcmVzaCAnXCIgKyBub2RlLm5hbWUgKyBcIicgU2VydmVyIHJldHVybmVkIHdpdGg6IFwiICsgZS5fYm9keSxcclxuICAgICAgICAgICAgJ0Rpc21pc3MnLCBsb25nU25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICAgIH1cclxuICAgICk7XHJcbiAgfVxyXG5cclxuICByZWZyZXNoRmlsZU1ldGFkYXRkYVVzaW5nUGF0aChwYXRoOiBzdHJpbmcpIHtcclxuICAgIGxldCBmb3VuZE5vZGUgPSB0aGlzLmZpbmROb2RlQnlQYXRoKHRoaXMuZGF0YSwgcGF0aClbMF07XHJcbiAgICBpZiAoZm91bmROb2RlKSB7XHJcbiAgICAgIHRoaXMucmVmcmVzaEZpbGVNZXRhZGF0YShmb3VuZE5vZGUpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgc2VhcmNoSW5wdXRDaGFuZ2VkKGlucHV0OiBzdHJpbmcpIHtcclxuICAgIGlmICh0aGlzLmRhdGFDYWNoZWQpIHtcclxuICAgICAgdGhpcy5kYXRhID0gXy5jbG9uZURlZXAodGhpcy5kYXRhQ2FjaGVkKTtcclxuICAgIH1cclxuICAgIHRoaXMuZmlsdGVyTm9kZXNCeUxhYmVsKHRoaXMuZGF0YSwgaW5wdXQpO1xyXG4gIH1cclxuXHJcbiAgZmlsdGVyTm9kZXNCeUxhYmVsKGRhdGE6IGFueSwgbGFiZWw6IHN0cmluZykge1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmICghKGRhdGFbaV0pLmxhYmVsLmluY2x1ZGVzKGxhYmVsKSkge1xyXG4gICAgICAgIGlmIChkYXRhW2ldLmNoaWxkcmVuICYmIGRhdGFbaV0uY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgdGhpcy5maWx0ZXJOb2Rlc0J5TGFiZWwoZGF0YVtpXS5jaGlsZHJlbiwgbGFiZWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIShkYXRhW2ldLmNoaWxkcmVuICYmIGRhdGFbaV0uY2hpbGRyZW4ubGVuZ3RoID4gMCkpIHtcclxuICAgICAgICAgIGRhdGEuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgaS0tO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZGF0YVtpXS5kYXRhID0gXCJGb2xkZXJcIikgeyAvLyBJZiBzb21lIGNoaWxkcmVuIGRpZG4ndCBnZXQgZmlsdGVyZWQgb3V0IChha2Egd2UgZ290IHNvbWUgbWF0Y2hlcykgYW5kIHdlIGhhdmUgYSBmb2xkZXJcclxuICAgICAgICAgIC8vIHRoZW4gd2Ugd2FudCB0byBleHBhbmQgdGhlIG5vZGUgc28gdGhlIHVzZXIgY2FuIHNlZSB0aGVpciByZXN1bHRzIGluIHRoZSBzZWFyY2ggYmFyXHJcbiAgICAgICAgICBkYXRhW2ldLmV4cGFuZGVkID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFRPRE86IENvdWxkIGJlIG9wdGltaXplZCB0byBkbyBicmVhZHRoIGZpcnN0IHNlYXJjaCB2cyBkZXB0aCBmaXJzdCBzZWFyY2hcclxuICBmaW5kTm9kZUJ5UGF0aChkYXRhOiBhbnksIHBhdGg6IHN0cmluZykge1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgIGlmIChkYXRhW2ldLnBhdGggPT0gcGF0aCkge1xyXG4gICAgICAgIHJldHVybiBbZGF0YVtpXSwgaV07IC8vIDAgLSBub2RlLCAxIC0gaW5kZXhcclxuICAgICAgfVxyXG4gICAgICBpZiAoZGF0YVtpXS5jaGlsZHJlbiAmJiBkYXRhW2ldLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcclxuICAgICAgICBsZXQgZm91bmRWYWx1ZTogYW55O1xyXG4gICAgICAgIGZvdW5kVmFsdWUgPSB0aGlzLmZpbmROb2RlQnlQYXRoKGRhdGFbaV0uY2hpbGRyZW4sIHBhdGgpO1xyXG4gICAgICAgIC8vIGlmIG1hdGNoIG5vdCBmb3VuZCBpbiB0aGUgY2hpbGRlcm4gbm9kZXMgdGhlbiBjb250aW5lIHdpdGggcGVuZGluZyBUb3AgbGV2ZWwgbm9kZXNcclxuICAgICAgICBpZiAoZm91bmRWYWx1ZVswXSA9PSBudWxsICYmIGkgIT0gZGF0YS5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuIGZvdW5kVmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gW251bGwsIG51bGxdO1xyXG4gIH1cclxuXHJcbiAgdXBkYXRlVXNzKHBhdGg6IHN0cmluZyk6IHZvaWQge1xyXG4gICAgdGhpcy5kaXNwbGF5VHJlZShwYXRoLCB0cnVlKTtcclxuICB9XHJcblxyXG4gIGNyZWF0ZUZpbGUocGF0aEFuZE5hbWU6IHN0cmluZywgbm9kZTogYW55LCB1cGRhdGU6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIHRoaXMudXNzU3J2Lm1ha2VGaWxlKHBhdGhBbmROYW1lKS5zdWJzY3JpYmUoKHJlczogYW55KSA9PiB7XHJcbiAgICAgIHRoaXMubG9nLmRlYnVnKCdDcmVhdGVkOiAnICsgcGF0aEFuZE5hbWUpO1xyXG4gICAgICBsZXQgcGF0aCA9IHRoaXMuZ2V0UGF0aEZyb21QYXRoQW5kTmFtZShwYXRoQW5kTmFtZSk7XHJcbiAgICAgIGxldCBzb21lRGF0YSA9IHRoaXMudXNzU3J2LmdldEZpbGVNZXRhZGF0YShwYXRoQW5kTmFtZSk7XHJcbiAgICAgIHRoaXMuc25hY2tCYXIub3BlbihgU3VjY2Vzc2Z1bGx5IGNyZWF0ZWQgZmlsZTogXCIke3BhdGhBbmROYW1lLnN1YnN0cmluZyhwYXRoQW5kTmFtZS5sYXN0SW5kZXhPZignLycpICsgMSl9XCJgLCAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICBzb21lRGF0YS5zdWJzY3JpYmUoXHJcbiAgICAgICAgcmVzdWx0ID0+IHtcclxuICAgICAgICAgIC8vIElmIHRoZSByaWdodC1jbGlja2VkICdub2RlJyBpcyB0aGUgY29ycmVjdCwgdmFsaWQgbm9kZVxyXG4gICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW4gJiYgbm9kZS5wYXRoID09IHBhdGgpIHtcclxuICAgICAgICAgICAgbGV0IG5vZGVUb0FkZCA9IHtcclxuICAgICAgICAgICAgICBpZDogbm9kZS5jaGlsZHJlbi5sZW5ndGgsXHJcbiAgICAgICAgICAgICAgbGFiZWw6IHRoaXMuZ2V0TmFtZUZyb21QYXRoQW5kTmFtZShwYXRoQW5kTmFtZSksXHJcbiAgICAgICAgICAgICAgbW9kZTogcmVzdWx0Lm1vZGUsXHJcbiAgICAgICAgICAgICAgb3duZXI6IHJlc3VsdC5vd25lcixcclxuICAgICAgICAgICAgICBncm91cDogcmVzdWx0Lmdyb3VwLFxyXG4gICAgICAgICAgICAgIGNyZWF0ZWRBdDogcmVzdWx0LmNyZWF0ZWRBdCxcclxuICAgICAgICAgICAgICBkYXRhOiBcIkZpbGVcIixcclxuICAgICAgICAgICAgICBkaXJlY3Rvcnk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgIGljb246IFwiZmEgZmEtZmlsZVwiLFxyXG4gICAgICAgICAgICAgIGl0ZW1zOiB7fSxcclxuICAgICAgICAgICAgICBuYW1lOiB0aGlzLmdldE5hbWVGcm9tUGF0aEFuZE5hbWUocGF0aEFuZE5hbWUpLFxyXG4gICAgICAgICAgICAgIHBhcmVudDogbm9kZSxcclxuICAgICAgICAgICAgICBwYXRoOiBwYXRoQW5kTmFtZSxcclxuICAgICAgICAgICAgICBzaXplOiByZXN1bHQuc2l6ZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5vZGUuY2hpbGRyZW4ucHVzaChub2RlVG9BZGQpOyAvL0FkZCBub2RlIHRvIHJpZ2h0IGNsaWNrZWQgbm9kZVxyXG4gICAgICAgICAgICBpZiAodGhpcy5zaG93U2VhcmNoKSB7IC8vIElmIHdlIHVwZGF0ZSBhIG5vZGUgaW4gdGhlIHdvcmtpbmcgZGlyZWN0b3J5LCB3ZSBuZWVkIHRvIGZpbmQgdGhhdCBzYW1lIG5vZGUgaW4gdGhlIGNhY2hlZCBkYXRhXHJcbiAgICAgICAgICAgICAgbGV0IG5vZGVDYWNoZWQgPSB0aGlzLmZpbmROb2RlQnlQYXRoKHRoaXMuZGF0YUNhY2hlZCwgbm9kZS5wYXRoKVswXTtcclxuICAgICAgICAgICAgICBpZiAobm9kZUNhY2hlZCkge1xyXG4gICAgICAgICAgICAgICAgbm9kZUNhY2hlZC5jaGlsZHJlbi5wdXNoKG5vZGVUb0FkZCk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5vZGUuZXhwYW5kZWQgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gLi5vdGhlcndpc2UgdHJlYXQgZm9sZGVyIGNyZWF0aW9uIHdpdGhvdXQgYW55IGNvbnRleHQuXHJcbiAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHBhdGggPT0gdGhpcy5wYXRoKSB7IC8vIElmIHdlIGFyZSBjcmVhdGluZyBhIGZvbGRlciBhdCB0aGUgcGFyZW50IGxldmVsXHJcbiAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5VHJlZShwYXRoLCB0cnVlKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh1cGRhdGUpIHsgLy8gSWYgd2Ugd2FudCB0byB1cGRhdGUgdGhlIHRyZWVcclxuICAgICAgICAgICAgICB0aGlzLmFkZENoaWxkKG5vZGUpO1xyXG4gICAgICAgICAgICB9IGVsc2UgeyAvLyBJZiB3ZSBhcmUgY3JlYXRpbmcgYSBuZXcgZm9sZGVyIGluIGEgbG9jYXRpb24gd2UncmUgbm90IGxvb2tpbmcgYXRcclxuICAgICAgICAgICAgICB0aGlzLmRpc3BsYXlUcmVlKHBhdGgsIGZhbHNlKTsgLy8gLi4ucGxvcCB0aGUgRXhwbG9yZXIgaW50byB0aGUgbmV3bHkgY3JlYXRlZCBsb2NhdGlvbi5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuICAgIH0sIGVycm9yID0+IHtcclxuICAgICAgdGhpcy51c3NTcnYuZ2V0RmlsZU1ldGFkYXRhKHBhdGhBbmROYW1lKS5zdWJzY3JpYmUocmVzcG9uc2UgPT4ge1xyXG4gICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkZhaWxlZCB0byBjcmVhdGUgRmlsZS4gJ1wiICsgcGF0aEFuZE5hbWUgKyBcIicgYWxyZWFkeSBleGlzdHNcIiwgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgfSwgZXJyID0+IHtcclxuICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJGYWlsZWQgdG8gY3JlYXRlIEZpbGU6ICdcIiArIHBhdGhBbmROYW1lICsgXCInXCIsICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgdGhpcy5sb2cuc2V2ZXJlKGVycm9yKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVGb2xkZXIocGF0aEFuZE5hbWU6IHN0cmluZywgbm9kZTogYW55LCB1cGRhdGU6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgIHRoaXMudXNzU3J2Lm1ha2VEaXJlY3RvcnkocGF0aEFuZE5hbWUpXHJcbiAgICAgIC5zdWJzY3JpYmUoXHJcbiAgICAgICAgcmVzcCA9PiB7XHJcbiAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZygnQ3JlYXRlZDogJyArIHBhdGhBbmROYW1lKTtcclxuICAgICAgICAgIGxldCBwYXRoID0gdGhpcy5nZXRQYXRoRnJvbVBhdGhBbmROYW1lKHBhdGhBbmROYW1lKTtcclxuICAgICAgICAgIGxldCBzb21lRGF0YSA9IHRoaXMudXNzU3J2LmdldEZpbGVNZXRhZGF0YShwYXRoQW5kTmFtZSk7XHJcbiAgICAgICAgICBzb21lRGF0YS5zdWJzY3JpYmUoXHJcbiAgICAgICAgICAgIHJlc3VsdCA9PiB7XHJcbiAgICAgICAgICAgICAgLy8gSWYgdGhlIHJpZ2h0LWNsaWNrZWQgJ25vZGUnIGlzIHRoZSBjb3JyZWN0LCB2YWxpZCBub2RlXHJcbiAgICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW4gJiYgbm9kZS5wYXRoID09IHBhdGgpIHtcclxuICAgICAgICAgICAgICAgIGxldCBub2RlVG9BZGQgPSB7XHJcbiAgICAgICAgICAgICAgICAgIGlkOiBub2RlLmNoaWxkcmVuLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxyXG4gICAgICAgICAgICAgICAgICBsYWJlbDogdGhpcy5nZXROYW1lRnJvbVBhdGhBbmROYW1lKHBhdGhBbmROYW1lKSxcclxuICAgICAgICAgICAgICAgICAgbW9kZTogcmVzdWx0Lm1vZGUsXHJcbiAgICAgICAgICAgICAgICAgIG93bmVyOiByZXN1bHQub3duZXIsXHJcbiAgICAgICAgICAgICAgICAgIGdyb3VwOiByZXN1bHQuZ3JvdXAsXHJcbiAgICAgICAgICAgICAgICAgIGNyZWF0ZWRBdDogcmVzdWx0LmNyZWF0ZWRBdCxcclxuICAgICAgICAgICAgICAgICAgZGF0YTogXCJGb2xkZXJcIixcclxuICAgICAgICAgICAgICAgICAgZGlyZWN0b3J5OiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICBleHBhbmRlZEljb246IFwiZmEgZmEtZm9sZGVyLW9wZW5cIixcclxuICAgICAgICAgICAgICAgICAgY29sbGFwc2VkSWNvbjogXCJmYSBmYS1mb2xkZXJcIixcclxuICAgICAgICAgICAgICAgICAgbmFtZTogdGhpcy5nZXROYW1lRnJvbVBhdGhBbmROYW1lKHBhdGhBbmROYW1lKSxcclxuICAgICAgICAgICAgICAgICAgcGFyZW50OiBub2RlLFxyXG4gICAgICAgICAgICAgICAgICBwYXRoOiBwYXRoQW5kTmFtZSxcclxuICAgICAgICAgICAgICAgICAgc2l6ZTogcmVzdWx0LnNpemVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIG5vZGUuY2hpbGRyZW4ucHVzaChub2RlVG9BZGQpOyAvL0FkZCBub2RlIHRvIHJpZ2h0IGNsaWNrZWQgbm9kZVxyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hvd1NlYXJjaCkgeyAvLyBJZiB3ZSB1cGRhdGUgYSBub2RlIGluIHRoZSB3b3JraW5nIGRpcmVjdG9yeSwgd2UgbmVlZCB0byBmaW5kIHRoYXQgc2FtZSBub2RlIGluIHRoZSBjYWNoZWQgZGF0YVxyXG4gICAgICAgICAgICAgICAgICBsZXQgbm9kZUNhY2hlZCA9IHRoaXMuZmluZE5vZGVCeVBhdGgodGhpcy5kYXRhQ2FjaGVkLCBub2RlLnBhdGgpWzBdO1xyXG4gICAgICAgICAgICAgICAgICBpZiAobm9kZUNhY2hlZCkge1xyXG4gICAgICAgICAgICAgICAgICAgIG5vZGVDYWNoZWQuY2hpbGRyZW4ucHVzaChub2RlVG9BZGQpO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBub2RlLmV4cGFuZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgLy8gLi5vdGhlcndpc2UgdHJlYXQgZm9sZGVyIGNyZWF0aW9uIHdpdGhvdXQgYW55IGNvbnRleHQuXHJcbiAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocGF0aCA9PSB0aGlzLnBhdGgpIHsgLy8gSWYgd2UgYXJlIGNyZWF0aW5nIGEgZm9sZGVyIGF0IHRoZSBwYXJlbnQgbGV2ZWxcclxuICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5VHJlZShwYXRoLCB0cnVlKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodXBkYXRlKSB7IC8vIElmIHdlIHdhbnQgdG8gdXBkYXRlIHRoZSB0cmVlXHJcbiAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGQobm9kZSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyBJZiB3ZSBhcmUgY3JlYXRpbmcgYSBuZXcgZm9sZGVyIGluIGEgbG9jYXRpb24gd2UncmUgbm90IGxvb2tpbmcgYXRcclxuICAgICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5VHJlZShwYXRoQW5kTmFtZSwgZmFsc2UpOyAvLyAuLi5wbG9wIHRoZSBFeHBsb3JlciBpbnRvIHRoZSBuZXdseSBjcmVhdGVkIGxvY2F0aW9uLlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVycm9yID0+IHtcclxuICAgICAgICAgIGlmIChlcnJvci5zdGF0dXMgPT0gJzUwMCcpIHsgLy9JbnRlcm5hbCBTZXJ2ZXIgRXJyb3JcclxuICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiRmFpbGVkIHRvIGNyZWF0ZSBkaXJlY3Rvcnk6ICdcIiArIHBhdGhBbmROYW1lICsgXCInIFRoaXMgaXMgcHJvYmFibHkgZHVlIHRvIGEgc2VydmVyIGFnZW50IHByb2JsZW0uXCIsXHJcbiAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMubG9nLnNldmVyZShlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICApO1xyXG4gIH1cclxuXHJcbiAgZGVsZXRlRmlsZU9yRm9sZGVyKHJpZ2h0Q2xpY2tlZEZpbGU6IGFueSk6IHZvaWQge1xyXG4gICAgbGV0IHBhdGhBbmROYW1lID0gcmlnaHRDbGlja2VkRmlsZS5wYXRoO1xyXG4gICAgbGV0IG5hbWUgPSB0aGlzLmdldE5hbWVGcm9tUGF0aEFuZE5hbWUocGF0aEFuZE5hbWUpO1xyXG4gICAgdGhpcy5pc0xvYWRpbmcgPSB0cnVlO1xyXG4gICAgdGhpcy5kZWxldGlvblF1ZXVlLnNldChyaWdodENsaWNrZWRGaWxlLnBhdGgsIHJpZ2h0Q2xpY2tlZEZpbGUpO1xyXG4gICAgcmlnaHRDbGlja2VkRmlsZS5zdHlsZUNsYXNzID0gXCJmaWxlYnJvd3NlcnVzcy1ub2RlLWRlbGV0aW5nXCI7XHJcbiAgICBsZXQgZGVsZXRlU3Vic2NyaXB0aW9uID0gdGhpcy51c3NTcnYuZGVsZXRlRmlsZU9yRm9sZGVyKHBhdGhBbmROYW1lKVxyXG4gICAgICAuc3Vic2NyaWJlKFxyXG4gICAgICAgIHJlc3AgPT4ge1xyXG4gICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkRlbGV0ZWQgJ1wiICsgbmFtZSArIFwiJ1wiLFxyXG4gICAgICAgICAgICAnRGlzbWlzcycsIHF1aWNrU25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgIHRoaXMucmVtb3ZlQ2hpbGQocmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgICB0aGlzLmRlbGV0aW9uUXVldWUuZGVsZXRlKHJpZ2h0Q2xpY2tlZEZpbGUucGF0aCk7XHJcbiAgICAgICAgICByaWdodENsaWNrZWRGaWxlLnN0eWxlQ2xhc3MgPSBcIlwiO1xyXG4gICAgICAgICAgdGhpcy5kZWxldGVDbGljay5lbWl0KHRoaXMucmlnaHRDbGlja2VkRXZlbnQubm9kZSk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBlcnJvciA9PiB7XHJcbiAgICAgICAgICBpZiAoZXJyb3Iuc3RhdHVzID09ICc1MDAnKSB7IC8vSW50ZXJuYWwgU2VydmVyIEVycm9yXHJcbiAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkZhaWxlZCB0byBkZWxldGUgJ1wiICsgcGF0aEFuZE5hbWUgKyBcIicgU2VydmVyIHJldHVybmVkIHdpdGg6IFwiICsgZXJyb3IuX2JvZHksXHJcbiAgICAgICAgICAgICAgJ0Rpc21pc3MnLCBsb25nU25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgIH0gZWxzZSBpZiAoZXJyb3Iuc3RhdHVzID09ICc0MDQnKSB7IC8vTm90IEZvdW5kXHJcbiAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihcIkZhaWxlZCB0byBkZWxldGUgJ1wiICsgcGF0aEFuZE5hbWUgKyBcIicuIEFscmVhZHkgYmVlbiBkZWxldGVkIG9yIGRvZXMgbm90IGV4aXN0LlwiLFxyXG4gICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQ2hpbGQocmlnaHRDbGlja2VkRmlsZSk7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGVycm9yLnN0YXR1cyA9PSAnNDAwJyB8fCBlcnJvci5zdGF0dXMgPT0gJzQwMycpIHsgLy9CYWQgUmVxdWVzdFxyXG4gICAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJGYWlsZWQgdG8gZGVsZXRlICdcIiArIHBhdGhBbmROYW1lICsgXCInIFRoaXMgaXMgcHJvYmFibHkgZHVlIHRvIGEgcGVybWlzc2lvbiBwcm9ibGVtLlwiLFxyXG4gICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICB9IGVsc2UgeyAvL1Vua25vd25cclxuICAgICAgICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiVW5rbm93biBlcnJvciAnXCIgKyBlcnJvci5zdGF0dXMgKyBcIicgb2NjdXJyZWQgZm9yICdcIiArIHBhdGhBbmROYW1lICsgXCInIFNlcnZlciByZXR1cm5lZCB3aXRoOiBcIiArIGVycm9yLl9ib2R5LFxyXG4gICAgICAgICAgICAgICdEaXNtaXNzJywgbG9uZ1NuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIC8vRXJyb3IgaW5mbyBnZXRzIHByaW50ZWQgaW4gdXNzLmNydWQuc2VydmljZS50c1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5kZWxldGlvblF1ZXVlLmRlbGV0ZShyaWdodENsaWNrZWRGaWxlLnBhdGgpO1xyXG4gICAgICAgICAgdGhpcy5pc0xvYWRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIHJpZ2h0Q2xpY2tlZEZpbGUuc3R5bGVDbGFzcyA9IFwiXCI7XHJcbiAgICAgICAgICB0aGlzLmxvZy5zZXZlcmUoZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgKTtcclxuXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgaWYgKGRlbGV0ZVN1YnNjcmlwdGlvbi5jbG9zZWQgPT0gZmFsc2UpIHtcclxuICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4oXCJEZWxldGluZyAnXCIgKyBwYXRoQW5kTmFtZSArIFwiJy4uLiBMYXJnZXIgcGF5bG9hZHMgbWF5IHRha2UgbG9uZ2VyLiBQbGVhc2UgYmUgcGF0aWVudC5cIixcclxuICAgICAgICAgICdEaXNtaXNzJywgcXVpY2tTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICB9XHJcbiAgICB9LCA0MDAwKTtcclxuICB9XHJcblxyXG4gIHJlbW92ZUNoaWxkKG5vZGU6IGFueSkge1xyXG4gICAgbGV0IHBhcmVudDtcclxuICAgIGxldCBjaGlsZHJlbjtcclxuICAgIGlmIChub2RlLnBhcmVudCkgeyAvLyBJZiB0aGUgc2VsZWN0ZWQgbm9kZSBoYXMgYSBwYXJlbnQsXHJcbiAgICAgIHBhcmVudCA9IG5vZGUucGFyZW50O1xyXG4gICAgICBjaGlsZHJlbiA9IHBhcmVudC5jaGlsZHJlbjsgLy8gLi4uanVzdCB1c2UgdGhlIHRvcC1tb3N0IGNoaWxkcmVuXHJcbiAgICB9IGVsc2UgeyAvLyBUaGUgc2VsZWN0ZWQgbm9kZSAqaXMqIHRoZSB0b3AtbW9zdCBub2RlLFxyXG4gICAgICBjaGlsZHJlbiA9IHRoaXMuZGF0YTsgLy8gLi4uanVzdCB1c2UgdGhlIFVJIG5vZGVzIGFzIG91ciBjaGlsZHJlblxyXG4gICAgfVxyXG5cclxuICAgIGxldCBub2RlRGF0YSA9IHRoaXMuZmluZE5vZGVCeVBhdGgoY2hpbGRyZW4sIG5vZGUucGF0aCk7XHJcbiAgICBpZiAobm9kZURhdGEpIHsgLy8gSWYgd2UgY2F0Y2ggdGhlIG5vZGUgd2Ugd2FudGVkIHRvIHJlbW92ZSxcclxuICAgICAgbGV0IG5vZGVPYmogPSBub2RlRGF0YVswXTtcclxuICAgICAgbGV0IG5vZGVJbmRleCA9IG5vZGVEYXRhWzFdO1xyXG4gICAgICBjaGlsZHJlbi5zcGxpY2Uobm9kZUluZGV4LCAxKTsgLy8gLi4ucmVtb3ZlIGl0XHJcbiAgICAgIGlmIChub2RlLnBhcmVudCAmJiBub2RlLnBhcmVudC5jaGlsZHJlbikgeyAvLyBVcGRhdGUgdGhlIGNoaWxkcmVuIHRvIG5vIGxvbmdlciBpbmNsdWRlIHJlbW92ZWQgbm9kZVxyXG4gICAgICAgIG5vZGUucGFyZW50LmNoaWxkcmVuID0gY2hpbGRyZW47XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy5kYXRhID0gY2hpbGRyZW47XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5zaG93U2VhcmNoKSB7IC8vIElmIHdlIHVwZGF0ZSBhIG5vZGUgaW4gdGhlIHdvcmtpbmcgZGlyZWN0b3J5LCB3ZSBuZWVkIHRvIGZpbmQgdGhhdCBzYW1lIG5vZGUgaW4gdGhlIGNhY2hlZCBkYXRhXHJcbiAgICAgIGxldCBub2RlRGF0YUNhY2hlZCA9IHRoaXMuZmluZE5vZGVCeVBhdGgodGhpcy5kYXRhQ2FjaGVkLCBub2RlLnBhdGgpO1xyXG4gICAgICBpZiAobm9kZURhdGFDYWNoZWQpIHtcclxuICAgICAgICBsZXQgbm9kZUNhY2hlZCA9IG5vZGVEYXRhQ2FjaGVkWzBdO1xyXG4gICAgICAgIGxldCBpbmRleENhY2hlZCA9IG5vZGVEYXRhQ2FjaGVkWzFdO1xyXG4gICAgICAgIGlmIChub2RlQ2FjaGVkLnBhcmVudCkge1xyXG4gICAgICAgICAgaWYgKGluZGV4Q2FjaGVkICE9IC0xKSB7XHJcbiAgICAgICAgICAgIG5vZGVDYWNoZWQucGFyZW50LmNoaWxkcmVuLnNwbGljZShpbmRleENhY2hlZCwgMSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBzZW5kTm90aWZpY2F0aW9uKHRpdGxlOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZyk6IG51bWJlciB7XHJcbiAgICBsZXQgcGx1Z2luSWQgPSB0aGlzLnBsdWdpbkRlZmluaXRpb24uZ2V0QmFzZVBsdWdpbigpLmdldElkZW50aWZpZXIoKTtcclxuICAgIC8vIFdlIGNhbiBzcGVjaWZ5IGEgZGlmZmVyZW50IHN0eWxlQ2xhc3MgdG8gdGhlbWUgdGhlIG5vdGlmaWNhdGlvbiBVSSBpLmUuIFsuLi5dIG1lc3NhZ2UsIDEsIHBsdWdpbklkLCBcIm9yZ196b3dlX3psdXhfZWRpdG9yX3NuYWNrYmFyXCJcclxuICAgIGxldCBub3RpZmljYXRpb24gPSBab3dlWkxVWC5ub3RpZmljYXRpb25NYW5hZ2VyLmNyZWF0ZU5vdGlmaWNhdGlvbih0aXRsZSwgbWVzc2FnZSwgMSwgcGx1Z2luSWQpO1xyXG4gICAgcmV0dXJuIFpvd2VaTFVYLm5vdGlmaWNhdGlvbk1hbmFnZXIubm90aWZ5KG5vdGlmaWNhdGlvbik7XHJcbiAgfVxyXG5cclxuICBsZXZlbFVwKCk6IHZvaWQge1xyXG4gICAgLy9UT0RPOiBtYXkgd2FudCB0byBjaGFuZ2UgdGhpcyB0byAncm9vdCcgZGVwZW5kaW5nIG9uIG1haW5mcmFtZSBmaWxlIGFjY2VzcyBzZWN1cml0eVxyXG4gICAgLy90byBwcmV2ZW50IHBlb3BsZSBmcm9tIGFjY2Vzc2luZyBmaWxlcy9mb2xkZXJzIG91dHNpZGUgdGhlaXIgcm9vdCBkaXJcclxuICAgIGlmICh0aGlzLnBhdGggIT09IFwiL1wiICYmIHRoaXMucGF0aCAhPT0gJycpIHtcclxuICAgICAgdGhpcy5wYXRoID0gdGhpcy5nZXRQYXRoRnJvbVBhdGhBbmROYW1lKHRoaXMucGF0aCk7XHJcbiAgICAgIGlmICh0aGlzLnBhdGggPT09ICcnIHx8IHRoaXMucGF0aCA9PSAnLycpIHtcclxuICAgICAgICB0aGlzLnBhdGggPSAnLyc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGxldCBwYXJlbnRpbmRleCA9IHRoaXMucGF0aC5sZW5ndGggLSAxO1xyXG4gICAgICB3aGlsZSAodGhpcy5wYXRoLmNoYXJBdChwYXJlbnRpbmRleCkgIT0gJy8nKSB7IHBhcmVudGluZGV4LS07IH1cclxuICAgICAgbGV0IHBhcmVudCA9IHRoaXMucGF0aC5zbGljZShwYXJlbnRpbmRleCArIDEsIHRoaXMucGF0aC5sZW5ndGgpO1xyXG4gICAgICB0aGlzLmxvZy5kZWJ1ZyhcIkdvaW5nIHVwIHRvOiBcIiArIHBhcmVudCk7XHJcblxyXG4gICAgICB0aGlzLmRpc3BsYXlUcmVlKHRoaXMucGF0aCwgZmFsc2UpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy51cGRhdGVVc3ModGhpcy5wYXRoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGdldFBhdGhGcm9tUGF0aEFuZE5hbWUocGF0aEFuZE5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBsZXQgcGF0aCA9IHBhdGhBbmROYW1lLnJlcGxhY2UoL1xcLyQvLCAnJykucmVwbGFjZSgvXFwvW15cXC9dKyQvLCAnJyk7XHJcbiAgICByZXR1cm4gcGF0aDtcclxuICB9XHJcblxyXG4gIGdldE5hbWVGcm9tUGF0aEFuZE5hbWUocGF0aEFuZE5hbWU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBsZXQgbmFtZSA9IHBhdGhBbmROYW1lLnJlcGxhY2UoLyheLiopKFxcLy4qXFwvKS8sICcnKTtcclxuICAgIHJldHVybiBuYW1lO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjaGVja1BhdGgoaW5wdXQ6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdGhpcy51dGlscy5maWxlUGF0aEVuZENoZWNrKHRoaXMucGF0aCkgKyBpbnB1dDtcclxuICB9XHJcblxyXG4gIGNoZWNrUGF0aFNsYXNoKGV2ZW50OiBhbnkpIHtcclxuICAgIGlmICh0aGlzLnBhdGggPT0gXCJcIikge1xyXG4gICAgICB0aGlzLnBhdGggPSBcIi9cIjtcclxuICAgICAgdGhpcy5wYXRoSW5wdXRVU1MubmF0aXZlRWxlbWVudC52YWx1ZSA9IFwiL1wiO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgY2hlY2tJZkluRGVsZXRpb25RdWV1ZUFuZE1lc3NhZ2UocGF0aEFuZE5hbWU6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICBpZiAodGhpcy5kZWxldGlvblF1ZXVlLmhhcyhwYXRoQW5kTmFtZSkpIHtcclxuICAgICAgdGhpcy5zbmFja0Jhci5vcGVuKFwiRGVsZXRpb24gaW4gcHJvZ3Jlc3M6ICdcIiArIHBhdGhBbmROYW1lICsgXCInIFwiICsgbWVzc2FnZSxcclxuICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn1cclxuXHJcblxyXG4vKlxyXG4gIFRoaXMgcHJvZ3JhbSBhbmQgdGhlIGFjY29tcGFueWluZyBtYXRlcmlhbHMgYXJlXHJcbiAgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcclxuICB0aGlzIGRpc3RyaWJ1dGlvbiwgYW5kIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5lY2xpcHNlLm9yZy9sZWdhbC9lcGwtdjIwLmh0bWxcclxuICBcclxuICBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxyXG4gIFxyXG4gIENvcHlyaWdodCBDb250cmlidXRvcnMgdG8gdGhlIFpvd2UgUHJvamVjdC5cclxuKi9cclxuIiwiXG48IS0tXG5UaGlzIHByb2dyYW0gYW5kIHRoZSBhY2NvbXBhbnlpbmcgbWF0ZXJpYWxzIGFyZVxubWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcbnRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MjAuaHRtbFxuXG5TUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxuXG5Db3B5cmlnaHQgQ29udHJpYnV0b3JzIHRvIHRoZSBab3dlIFByb2plY3QuXG4tLT5cblxuPGRpdiBzdHlsZT1cImhlaWdodDogMTAwJTtcIj5cblxuICA8IS0tIFRhYnMsIHNlYXJjaGJhciwgYW5kIGxvYWRpbmcgaW5kaWNhdG9yIC0tPlxuICBAaWYgKHNob3dVcEFycm93KSB7XG4gICAgPGltZyBzcmM9XCIuLi8uLi8uLi9hc3NldHMvZXhwbG9yZXItdXBhcnJvdy5wbmdcIlxuICAgICAgZGF0YS10b2dnbGU9XCJ0b29sdGlwXCJcbiAgICAgIGNsYXNzPVwiZmlsZWJyb3dzZXJ1c3MtcG9pbnRlci1sb2dvXCJcbiAgICAgIHRpdGxlPVwiR28gdXAgdG8gdGhlIHBhcmVudCBsZXZlbFwiIChjbGljayk9XCJsZXZlbFVwKClcIlxuICAgICAgW25nU3R5bGVdPVwidHJlZVN0eWxlXCIgdGFiaW5kZXg9XCIwXCIgKGtleWRvd24uZW50ZXIpPVwibGV2ZWxVcCgpXCJcbiAgICAgID5cbiAgfVxuXG4gIDxkaXYgY2xhc3M9XCJmaWxlYnJvd3NlcnVzcy1zZWFyY2hcIiBbbmdTdHlsZV0gPSBcInNlYXJjaFN0eWxlXCI+XG4gICAgPGlucHV0ICNwYXRoSW5wdXRVU1NcbiAgICAgIFsobmdNb2RlbCldPVwicGF0aFwiXG4gICAgICBsaXN0PVwic2VhcmNoVVNTSGlzdG9yeVwiXG4gICAgICBwbGFjZWhvbGRlcj1cIkVudGVyIGFuIGFic29sdXRlIHBhdGguLi5cIlxuICAgICAgW25nU3R5bGVdID0gXCJpbnB1dFN0eWxlXCJcbiAgICAgIGNsYXNzPVwiZmlsZWJyb3dzZXJ1c3Mtc2VhcmNoLWlucHV0XCJcbiAgICAgIChrZXlkb3duLmVudGVyKT1cImRpc3BsYXlUcmVlKHBhdGgsIGZhbHNlKTtcIlxuICAgICAgW2Rpc2FibGVkXT1cImlzTG9hZGluZ1wiXG4gICAgICAobmdNb2RlbENoYW5nZSk9XCJjaGVja1BhdGhTbGFzaCgkZXZlbnQpXCI+XG4gICAgICA8IS0tIFRPRE86IG1ha2Ugc2VhcmNoIGhpc3RvcnkgYSBkaXJlY3RpdmUgdG8gdXNlIGluIGJvdGggdXNzIGFuZCBtdnMtLT5cbiAgICAgIDxkYXRhbGlzdCBpZD1cInNlYXJjaFVTU0hpc3RvcnlcIj5cbiAgICAgICAgQGZvciAoaXRlbSBvZiB1c3NTZWFyY2hIaXN0b3J5LnNlYXJjaEhpc3RvcnlWYWw7IHRyYWNrIGl0ZW0pIHtcbiAgICAgICAgICA8b3B0aW9uIFt2YWx1ZV09XCJpdGVtXCI+PC9vcHRpb24+XG4gICAgICAgIH1cbiAgICAgIDwvZGF0YWxpc3Q+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImZhIGZhLXNwaW5uZXIgZmEtc3BpbiBmaWxlYnJvd3NlcnVzcy1sb2FkaW5nLWljb25cIiBbaGlkZGVuXT1cIiFpc0xvYWRpbmdcIiBzdHlsZT1cIm1hcmdpbi1sZWZ0OiA5cHg7XCI+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cImZhIGZhLXJlZnJlc2ggZmlsZWJyb3dzZXJ1c3MtbG9hZGluZy1pY29uXCIgdGl0bGU9XCJSZWZyZXNoIHdob2xlIGRpcmVjdG9yeVwiIChjbGljayk9XCJkaXNwbGF5VHJlZShwYXRoLCBmYWxzZSk7XCIgW2hpZGRlbl09XCJpc0xvYWRpbmdcIiBzdHlsZT1cIm1hcmdpbi1sZWZ0OiA5cHg7IGN1cnNvcjogcG9pbnRlcjtcIj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwiZmlsZS10cmVlLXV0aWxpdGllc1wiPlxuICAgICAgPGRpdiBjbGFzcz1cImZhIGZhLW1pbnVzLXNxdWFyZS1vIGZpbGVicm93c2VyLWljb25cIiB0aXRsZT1cIkNvbGxhcHNlIEZvbGRlcnMgaW4gRXhwbG9yZXJcIiAoY2xpY2spPVwiY29sbGFwc2VUcmVlKCk7XCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiZmEgZmEtdHJhc2gtbyBmaWxlYnJvd3Nlci1pY29uXCIgdGl0bGU9XCJEZWxldGVcIiAoY2xpY2spPVwic2hvd0RlbGV0ZURpYWxvZyhzZWxlY3RlZE5vZGUpO1wiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImZhIGZhLWZvbGRlci1vIGZpbGVicm93c2VyLWljb25cIiB0aXRsZT1cIkNyZWF0ZSBOZXcgRm9sZGVyXCIgKGNsaWNrKT1cInNob3dDcmVhdGVGb2xkZXJEaWFsb2coIXNlbGVjdGVkTm9kZSB8fCAoIXNlbGVjdGVkTm9kZS5wYXJlbnQgJiYgIXNlbGVjdGVkTm9kZS5kaXJlY3RvcnkpID8geyAncGF0aCcgOiBwYXRoIH0gOiBzZWxlY3RlZE5vZGUuZGlyZWN0b3J5ID8gc2VsZWN0ZWROb2RlIDogc2VsZWN0ZWROb2RlLnBhcmVudCk7XCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwiZmEgZmEtZXJhc2VyIGZpbGVicm93c2VyLWljb24gc3BlY2lhbC11dGlsaXR5XCIgdGl0bGU9XCJDbGVhciBTZWFyY2ggSGlzdG9yeVwiIChjbGljayk9XCJjbGVhclNlYXJjaEhpc3RvcnkoKTtcIj48L2Rpdj5cbiAgICA8L2Rpdj5cblxuICAgIDwhLS0gTWFpbiB0cmVlIC0tPlxuICAgIDxkaXYgW2hpZGRlbl09XCJoaWRlRXhwbG9yZXJcIiBzdHlsZT1cImhlaWdodDogMTAwJTtcIj5cbiAgICAgIDx0cmVlLXJvb3QgW3RyZWVEYXRhXT1cImRhdGFcIlxuICAgICAgICAoY2xpY2tFdmVudCk9XCJvbk5vZGVDbGljaygkZXZlbnQpXCJcbiAgICAgICAgKGRibENsaWNrRXZlbnQpPVwib25Ob2RlRGJsQ2xpY2soJGV2ZW50KVwiXG4gICAgICAgIFtuZ1N0eWxlXT1cInRyZWVTdHlsZVwiXG4gICAgICAgIChyaWdodENsaWNrRXZlbnQpPVwib25Ob2RlUmlnaHRDbGljaygkZXZlbnQpXCJcbiAgICAgICAgKHBhbmVsUmlnaHRDbGlja0V2ZW50KT1cIm9uUGFuZWxSaWdodENsaWNrKCRldmVudClcIlxuICAgICAgICAoZGF0YUNoYW5nZWQpPVwib25EYXRhQ2hhbmdlZCgkZXZlbnQpXCJcbiAgICAgID48L3RyZWUtcm9vdD5cbiAgICA8L2Rpdj5cblxuICAgIEBpZiAoc2hvd1NlYXJjaCkge1xuICAgICAgPGRpdiBjbGFzcz1cInVpLWlucHV0Z3JvdXAgZmlsZWJyb3dzZXJ1c3Mtc2VhcmNoLWJvdHRvbS1ncm91cFwiPlxuICAgICAgICA8c3BhbiBjbGFzcz1cInVpLWlucHV0Z3JvdXAtYWRkb25cIj48aSBjbGFzcz1cImZhIGZhLXNlYXJjaCBmaWxlYnJvd3NlcnVzcy1zZWFyY2gtYm90dG9tLWljb25cIj48L2k+PC9zcGFuPlxuICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBwSW5wdXRUZXh0XG4gICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWFyY2ggb3BlbmVkIGZpbGVzL2ZvbGRlcnMgYnkgbmFtZS4uLlwiXG4gICAgICAgICAgY2xhc3M9XCJmaWxlYnJvd3NlcnVzcy1zZWFyY2gtYm90dG9tLWlucHV0XCJcbiAgICAgICAgICBbZm9ybUNvbnRyb2xdPVwic2VhcmNoQ3RybFwiXG4gICAgICAgICAgI3NlYXJjaFVTUz5cbiAgICAgICAgPC9kaXY+XG4gICAgICB9XG5cbiAgICA8L2Rpdj5cblxuICAgIDwhLS1cbiAgICBUaGlzIHByb2dyYW0gYW5kIHRoZSBhY2NvbXBhbnlpbmcgbWF0ZXJpYWxzIGFyZVxuICAgIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRWNsaXBzZSBQdWJsaWMgTGljZW5zZSB2Mi4wIHdoaWNoIGFjY29tcGFuaWVzXG4gICAgdGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXG5cbiAgICBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxuXG4gICAgQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxuICAgIC0tPiJdfQ==