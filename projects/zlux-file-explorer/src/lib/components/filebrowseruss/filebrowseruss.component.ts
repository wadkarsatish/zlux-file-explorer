

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import {
  Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit,
  Output, ViewEncapsulation, Inject, Optional, ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms'
import { Observable, of, Subscription } from 'rxjs';
import { catchError, debounceTime, finalize, map, timeout } from 'rxjs/operators';
import { Angular2InjectionTokens, Angular2PluginWindowActions, ContextMenuItem } from '../../../pluginlib/inject-resources';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FilePropertiesModal } from '../file-properties-modal/file-properties-modal.component';
import { DeleteFileModal } from '../delete-file-modal/delete-file-modal.component';
import { CreateFolderModal } from '../create-folder-modal/create-folder-modal.component';
import { CreateFileModal } from '../create-file-modal/create-file-modal.component';
import { UploadModal } from '../upload-files-modal/upload-files-modal.component';
import { FilePermissionsModal } from '../file-permissions-modal/file-permissions-modal.component';
import { FileOwnershipModal } from '../file-ownership-modal/file-ownership-modal.component';
import { FileTaggingModal } from '../file-tagging-modal/file-tagging-modal.component';
import { quickSnackbarOptions, defaultSnackbarOptions, longSnackbarOptions } from '../../shared/snackbar-options';
import { incrementFileName } from '../../shared/fileActions'
import { FileTreeNode } from '../../structures/child-event';
import { TreeComponent } from '../tree/tree.component';
import * as _ from 'lodash';

/* Services */
import { UtilsService } from '../../services/utils.service';
import { UssCrudService } from '../../services/uss.crud.service';
import { DownloaderService } from '../../services/downloader.service';
import { SearchHistoryService } from '../../services/searchHistoryService';

/* TODO: re-implement to add fetching of previously opened tree view data
import { PersistentDataService } from '../../services/persistentData.service'; */

const SEARCH_ID = 'uss';

@Component({
  selector: 'file-browser-uss',
  templateUrl: './filebrowseruss.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./filebrowseruss.component.css'],
  providers: [UssCrudService, /*PersistentDataService,*/ SearchHistoryService]
})

export class FileBrowserUSSComponent implements OnInit, OnDestroy {

  /* TODO: Legacy, capabilities code (unused for now) */
  //IFileBrowserUSS,
  //componentClass: ComponentClass;
  //fileSelected: Subject<FileBrowserFileSelectedEvent>;
  //capabilities: Array<Capability>;

  /* TODO: Fetching updates for automatic refresh (disabled for now) */
  // private intervalId: any;
  // private updateInterval: number = 10000;// TODO: time represents in ms how fast tree updates changes from mainframe

  /* Data and navigation */
  public path: string;
  public selectedNode: any;
  public homePath: string; // If stays null after init, ZSS was unable to find a user home directory
  public root: string; // Default / directory (different from homePath)
  public rightClickedFile: any;
  //TODO: May not needed anymore? (may need replacing w/ rightClickedFile)
  private rightClickedEvent: any;
  private deletionQueue = new Map(); //multiple files deletion is async, so queue is used
  private fileToCopyOrCut: any;
  //TODO: Define interface types for uss-data/data
  public data: FileTreeNode[]; //Main data displayed in the visual tree as nodes
  private dataCached: FileTreeNode[]; // Used for filtering against quick search

  /* Quick search (Alt + P) stuff */
  public showSearch: boolean;
  public searchCtrl: any;
  public searchValueSubscription: Subscription;
  private ussSearchHistorySubscription: Subscription;

  /* Tree UI and modals */
  @ViewChild(TreeComponent) private treeComponent: TreeComponent;
  @ViewChild('pathInputUSS') public pathInputUSS: ElementRef;
  @ViewChild('searchUSS') public searchUSS: ElementRef;
  public hideExplorer: boolean;
  public isLoading: boolean;
  private rightClickPropertiesFile: ContextMenuItem[];
  private rightClickPropertiesFolder: ContextMenuItem[];
  private rightClickPropertiesPanel: ContextMenuItem[];

  constructor(private elementRef: ElementRef,
    private ussSrv: UssCrudService,
    private utils: UtilsService,
    public ussSearchHistory: SearchHistoryService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public downloadService: DownloaderService,
    @Inject(Angular2InjectionTokens.LOGGER) private log: ZLUX.ComponentLogger,
    @Inject(Angular2InjectionTokens.LAUNCH_METADATA) private launchMetadata: any,
    @Inject(Angular2InjectionTokens.PLUGIN_DEFINITION) private pluginDefinition: ZLUX.ContainerPluginDefinition,
    @Optional() @Inject(Angular2InjectionTokens.WINDOW_ACTIONS) private windowActions: Angular2PluginWindowActions) {
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
    this.searchValueSubscription = this.searchCtrl.valueChanges.pipe(
      debounceTime(500), // By default, 500 ms until user input, for quick search to update results
    ).subscribe((value) => { this.searchInputChanged(value) });
    this.selectedNode = null;
  }

  /* Tree outgoing events */
  @Output() pathChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() dataChanged: EventEmitter<any> = new EventEmitter<any>();
  @Output() nodeClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() nodeDblClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() nodeRightClick: EventEmitter<any> = new EventEmitter<any>();
  // @Output() newFileClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() newFolderClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() newFileClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() fileUploaded: EventEmitter<any> = new EventEmitter<any>();
  @Output() copyClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() ussRenameEvent: EventEmitter<any> = new EventEmitter<any>();
  @Output() rightClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() openInNewTab: EventEmitter<any> = new EventEmitter<any>();

  /* Customizeable tree styles */
  @Input() public inputStyle: any;
  @Input() public searchStyle: any;
  @Input() public treeStyle: any;
  @Input() public showUpArrow: boolean;

  ngOnInit() {
    this.loadUserHomeDirectory().pipe(
      catchError(err => {
        this.log.warn(`Unsuccessful in loading user home directory: ${err}`);
        return of('/');
      }),
    ).subscribe(home => {
      if (!this.homePath) {
        if (this.launchMetadata && this.launchMetadata.data && this.launchMetadata.data.name) {
          this.path = this.launchMetadata.data.name;
          this.updateUss(this.path);
        } else {
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

  getDOMElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  getSelectedPath(): string {
    //TODO:how do we want to want to handle caching vs message to app to open said path
    return this.path;
  }

  loadUserHomeDirectory(): Observable<string> {
    this.isLoading = true;
    return this.ussSrv.getUserHomeFolder().pipe(
      timeout(2000),
      map(resp => resp.home.trim()),
      finalize(() => this.isLoading = false)
    );
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
          this.showPermissionsDialog(this.rightClickedFile)
        }
      },
      {
        text: "Change Owners...", action: () => {
          this.showOwnerDialog(this.rightClickedFile)
        }
      },
      {
        text: "Tag Directory...", action: () => {
          this.showTaggingDialog(this.rightClickedFile)
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
          this.showRenameField(this.rightClickedFile)
        }
      },
      {
        text: "Properties", action: () => {
          this.showPropertiesDialog(this.rightClickedFile)
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
          }
          this.showCreateFileDialog(nodeToUse);
        }
      },
      {
        text: "Create a Directory...", action: () => {
          let nodeToUse = {
            path: this.path,
          }
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

  copyFile(rightClickedFile: any) {
    this.log.debug(`copyfile for  ${this.fileToCopyOrCut}, ${this.rightClickedFile.path}, ${this.path}`);
    if (this.fileToCopyOrCut == null) {
      this.rightClickPropertiesFolder.push( // Create a paste option for the folder
        {
          text: "Paste", action: () => {
            this.pasteFile(this.fileToCopyOrCut, this.rightClickedFile.path, false)
          }
        }
      );
      this.rightClickPropertiesPanel.push( // Create a paste option for the active directory
        {
          text: "Paste", action: () => {
            this.pasteFile(this.fileToCopyOrCut, this.path, false)
          }
        }
      );
    }
    this.fileToCopyOrCut = rightClickedFile;
    this.copyClick.emit(rightClickedFile);
  }

  cutFile(rightClickedFile: any) {
    if (this.fileToCopyOrCut) {
      this.rightClickPropertiesFolder.splice(this.rightClickPropertiesFolder.map(item => item.text).indexOf("Paste"), 1);
      this.rightClickPropertiesPanel.splice(this.rightClickPropertiesPanel.map(item => item.text).indexOf("Paste"), 1);
    }
    this.log.debug(`cutfile for  ${this.fileToCopyOrCut}, ${this.rightClickedFile.path}, ${this.path}`);
    this.rightClickPropertiesFolder.push( // Create a paste option for the folder
      {
        text: "Paste", action: () => {
          this.pasteFile(this.fileToCopyOrCut, this.rightClickedFile.path, true)
        }
      }
    );
    this.rightClickPropertiesPanel.push( // Create a paste option for the active directory
      {
        text: "Paste", action: () => {
          this.pasteFile(this.fileToCopyOrCut, this.path, true)
        }
      }
    );
    this.fileToCopyOrCut = rightClickedFile;
    this.copyClick.emit(rightClickedFile);
  }

  pasteFile(fileNode: any, destinationPath: any, isCut: boolean) {
    let pathAndName = fileNode.path;
    let name = this.getNameFromPathAndName(pathAndName);
    this.log.debug(`paste for ${name}, ${destinationPath}, and cut=${isCut}`);
    if (pathAndName.indexOf(' ') >= 0) {
      this.snackBar.open("Paste failed: '" + pathAndName + "' Operation not yet supported for filenames with spaces.",
        'Dismiss', defaultSnackbarOptions);
      return;
    }
    let metaData = this.ussSrv.getFileMetadata(pathAndName);
    metaData.subscribe({
      next: (result) => {
        if (result.ccsid == -1) {
          this.snackBar.open("Paste failed: '" + pathAndName + "' Operation not yet supported for this encoding.",
            'Dismiss', defaultSnackbarOptions);
          return;
        } else {
          this.isLoading = true;
          let destinationMetadata = this.ussSrv.getFileContents(destinationPath);
          destinationMetadata.subscribe({
            next: (result) => {
              /*rename the file when doing paste, in case same named file exists in the destination.*/
              for (let i: number = 0; i < result.entries.length; i++) {
                if (!result.entries[i].directory && result.entries[i].name == name) {
                  if (isCut) {
                    this.snackBar.open("Unable to move '" + pathAndName + "' because target '" + destinationPath + '\/' + name + "'already exists at destination.",
                      'Dismiss', longSnackbarOptions);
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
                      } else if (this.path == destinationPath) {
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
                              this.snackBar.open("Copied successfully, but failed to cut '" + pathAndName + "' Server returned with: " + error._body,
                                'Dismiss', longSnackbarOptions);
                            } else if (error.status == '404') { //Not Found
                              this.snackBar.open("Copied successfully, but '" + pathAndName + "' has already been deleted or does not exist.",
                                'Dismiss', defaultSnackbarOptions);
                              this.removeChild(fileNode);
                            } else if (error.status == '400' || error.status == '403') { //Bad Request
                              this.snackBar.open("Copied successfully but failed to cut '" + pathAndName + "' This is probably due to a permission problem.",
                                'Dismiss', defaultSnackbarOptions);
                            } else { //Unknown
                              this.snackBar.open("Copied successfully, but unknown error cutting '" + error.status + "' occurred for '" + pathAndName + "' Server returned with: " + error._body,
                                'Dismiss', longSnackbarOptions);
                            }
                            this.isLoading = false;
                            this.log.severe(error);
                          }
                        });
                    } else {
                      this.isLoading = false;
                      this.snackBar.open('Paste successful: ' + name, 'Dismiss', quickSnackbarOptions);
                    }
                  },
                  error: (error) => {
                    if (error.status == '500') { //Internal Server Error
                      this.snackBar.open("Paste failed: HTTP 500 from app-server or agent occurred for '" + pathAndName + "'. Server returned with: " + error._body,
                        'Dismiss', longSnackbarOptions);
                    } else if (error.status == '404') { //Not Found
                      this.snackBar.open("Paste failed: '" + pathAndName + "' does not exist.",
                        'Dismiss', defaultSnackbarOptions);
                    } else if (error.status == '400') { //Bad Request
                      this.snackBar.open("Paste failed: HTTP 400 occurred for '" + pathAndName + "'. Check that you have correct permissions for this action.",
                        'Dismiss', defaultSnackbarOptions);
                    } else { //Unknown
                      this.snackBar.open("Paste failed: '" + error.status + "' occurred for '" + pathAndName + "' Server returned with: " + error._body,
                        'Dismiss', longSnackbarOptions);
                    }
                    this.isLoading = false;
                    this.log.severe(error);
                  }
                });

              setTimeout(() => {
                if (copySubscription.closed == false) {
                  this.snackBar.open('Pasting ' + pathAndName + '... Larger payloads may take longer. Please be patient.',
                    'Dismiss', quickSnackbarOptions);
                }
              }, 4000);
            },
            error: (error) => {
              if (error.status == '403') { //Permission denied
                this.snackBar.open('Failed to access destination folder: Permission denied.',
                  'Dismiss', defaultSnackbarOptions);
              } else if (error.status == '0') {
                this.snackBar.open("Failed to communicate with the App server: " + error.status,
                  'Dismiss', defaultSnackbarOptions);
              } else if (error.status == '404') {
                this.snackBar.open("Destination folder not found. " + error.status,
                  'Dismiss', quickSnackbarOptions);
              } else {
                this.snackBar.open("An unknown error occurred: " + error.status,
                  'Dismiss', defaultSnackbarOptions);
              }
              this.log.severe(error);
            }
          });
        }
      },
      error: (error) => {
        if (error.status == '404') { // This happens when user attempts to paste a file that's been deleted after copying
          this.snackBar.open("Paste failed: Original '" + pathAndName + "' no longer exists.",
            'Dismiss', defaultSnackbarOptions);
        }
        this.isLoading = false;
        this.log.warn(error);
      }
    });
  }

  showPropertiesDialog(rightClickedFile: any) {
    const filePropConfig = new MatDialogConfig();
    filePropConfig.data = {
      event: rightClickedFile
    }
    filePropConfig.maxWidth = '350px';

    this.dialog.open(FilePropertiesModal, filePropConfig);
  }

  showRenameField(file: any) {
    const selectedNode = this.rightClickedEvent.originalEvent.srcElement;
    let oldName = file.name;
    let oldPath = file.path;
    file.selectable = false;

    let renameFn = (node: HTMLElement) => {
      renameField.parentNode.replaceChild(node, renameField);
      file.selectable = true;
      let nameFromNode = renameField.value;
      let pathForRename = this.getPathFromPathAndName(oldPath);
      if (oldName != nameFromNode) {
        let newPath = `${pathForRename}/${nameFromNode}`;
        this.ussSrv.renameFile(oldPath, newPath).subscribe({
          next: (res) => {
            this.snackBar.open("Renamed '" + oldName + "' to '" + nameFromNode + "'",
              'Dismiss', quickSnackbarOptions);
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
              this.snackBar.open("Failed to rename '" + file.path + "'. Bad permissions.",
                'Dismiss', defaultSnackbarOptions);
            } else if (error.status == '404') { //Not Found
              this.snackBar.open("'" + file.path + "' could not be opened or does not exist.",
                'Dismiss', defaultSnackbarOptions);
            } else { //Unknown
              this.snackBar.open("Failed to rename '" + file.path + "'. Error: " + error._body,
                'Dismiss', longSnackbarOptions);
            }
            this.log.severe(error);
            return;
          }
        });
      }
    }
    var renameField = document.createElement("input");
    renameField.setAttribute('id', 'renameHighlightedField');
    renameField.value = oldName;
    renameField.style.width = (selectedNode as HTMLElement).style.width;
    renameField.style.height = (selectedNode as HTMLElement).style.height;
    let rnNode = (e) => {
      if (e.which == 13 || e.key == "Enter" || e.keyCode == 13) {
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
        e.cancelBubble = true;
        renameField.blur();
        return;
      }
    }
    renameField.addEventListener('keydown', rnNode);
    renameField.onblur = function (e) {
      renameFn(selectedNode)
    };
    selectedNode.parentNode.replaceChild(renameField, selectedNode);
    renameField.focus();
    renameField.select();
  }

  showPermissionsDialog(rightClickedFile: any) {
    const filePropConfig = new MatDialogConfig();
    filePropConfig.data = {
      event: rightClickedFile
    }
    filePropConfig.width = '400px';

    const dialogRef = this.dialog.open(FilePermissionsModal, filePropConfig);
    dialogRef.afterClosed().subscribe((res?: boolean) => {
      if (res) {
        this.addChild(rightClickedFile, true);
      }
    });
  }

  showOwnerDialog(rightClickedFile: any) {
    const filePropConfig = new MatDialogConfig();
    filePropConfig.data = {
      event: rightClickedFile
    }
    filePropConfig.maxWidth = '400px';

    const dialogRef = this.dialog.open(FileOwnershipModal, filePropConfig);
    dialogRef.afterClosed().subscribe((res?: boolean) => {
      if (res) {
        this.addChild(rightClickedFile, true);
      }
    });
  }

  showDeleteDialog(rightClickedFile: any) {
    if (this.checkIfInDeletionQueueAndMessage(rightClickedFile.path, "This is already being deleted.") == true) {
      return;
    }

    const fileDeleteConfig = new MatDialogConfig();
    fileDeleteConfig.data = {
      event: rightClickedFile,
      width: '600px'
    }

    let fileDeleteRef: MatDialogRef<DeleteFileModal> = this.dialog.open(DeleteFileModal, fileDeleteConfig);
    const deleteFileOrFolder = fileDeleteRef.componentInstance.onDelete.subscribe(() => {
      this.deleteFileOrFolder(rightClickedFile);
    });
  }

  attemptDownload(rightClickedFile: any) {
    let remotePath = rightClickedFile.path;
    let filename = rightClickedFile.name;
    let downloadObject = rightClickedFile;
    let url: string = ZoweZLUX.uriBroker.unixFileUri('contents', remotePath);

    this.downloadService.fetchFileHandler(url, filename, downloadObject).then((res) => {
      // TODO: Download queue code for progress bar could go here
    });
  }

  showCreateFolderDialog(rightClickedFile: any) {
    if (rightClickedFile.path) { // If this came from a node object
      if (this.checkIfInDeletionQueueAndMessage(rightClickedFile.path, "Cannot create a directory inside a directory queued for deletion.") == true) {
        return;
      }
    } else { // Or if this is just a path
      if (this.checkIfInDeletionQueueAndMessage(rightClickedFile, "Cannot create a directory inside a directory queued for deletion.") == true) {
        return;
      }
    }

    const folderCreateConfig = new MatDialogConfig();
    folderCreateConfig.data = {
      event: rightClickedFile,
      width: '600px'
    }

    let fileCreateRef: MatDialogRef<CreateFolderModal> = this.dialog.open(CreateFolderModal, folderCreateConfig);
    const createFolder = fileCreateRef.componentInstance.onCreate.subscribe(onCreateResponse => {
      /* pathAndName - Path and name obtained from create folder prompt
      updateExistingTree - Should the existing tree update or fetch a new one */
      this.createFolder(onCreateResponse.get("pathAndName"), rightClickedFile, onCreateResponse.get("updateExistingTree"));
      // emit the event with node info only when node is right clicked and not on file tree panel
      this.newFolderClick.emit(this.rightClickedEvent.node ? this.rightClickedEvent.node : '');
    });
  }

  showCreateFileDialog(rightClickedFile: any) {
    if (rightClickedFile.path) { // If this came from a node object
      if (this.checkIfInDeletionQueueAndMessage(rightClickedFile.path, "Cannot create a file inside a directory queued for deletion.") == true) {
        return;
      }
    } else { // Or if this is just a path
      if (this.checkIfInDeletionQueueAndMessage(rightClickedFile, "Cannot create a file inside a directory queued for deletion.") == true) {
        return;
      }
    }

    const fileCreateConfig = new MatDialogConfig();
    fileCreateConfig.data = {
      event: rightClickedFile,
      width: '600px'
    }

    let fileCreateRef: MatDialogRef<CreateFileModal> = this.dialog.open(CreateFileModal, fileCreateConfig);
    const createFile = fileCreateRef.componentInstance.onFileCreate.subscribe(onFileCreateResponse => {
      /* pathAndName - Path and name obtained from create folder prompt
      updateExistingTree - Should the existing tree update or fetch a new one */
      this.createFile(onFileCreateResponse.get("pathAndName"), rightClickedFile, onFileCreateResponse.get("updateExistingTree"));
      // emit the event with node info only when node is right clicked and not on file tree panel
      this.newFileClick.emit(this.rightClickedEvent.node ? this.rightClickedEvent.node : '');
    });
  }

  showUploadDialog(rightClickedFile: any) {
    const folderUploadConfig = new MatDialogConfig();
    folderUploadConfig.data = {
      event: rightClickedFile || this.path,
      width: '600px'
    }

    let fileUploadRef: MatDialogRef<UploadModal> = this.dialog.open(UploadModal, folderUploadConfig);
    const upload = fileUploadRef.componentInstance.onUpload.subscribe(onUploadResponse => {
      if (rightClickedFile && rightClickedFile.path && rightClickedFile.path != this.path) {
        this.addChild(rightClickedFile, true);
        this.fileUploaded.emit(this.rightClickedEvent.node.path);
      } else {
        this.displayTree(this.path, false);
        this.fileUploaded.emit(this.path);
      }
    });
  }

  copyLink(rightClickedFile: any) {
    let link = '';
    if (rightClickedFile.directory) {
      link = `${window.location.origin}${window.location.pathname}?pluginId=${this.pluginDefinition.getBasePlugin().getIdentifier()}:data:${encodeURIComponent(`{"type":"openDir","name":"${rightClickedFile.path}","toggleTree":false}`)}`;
    } else {
      link = `${window.location.origin}${window.location.pathname}?pluginId=${this.pluginDefinition.getBasePlugin().getIdentifier()}:data:${encodeURIComponent(`{"type":"openFile","name":"${rightClickedFile.path}","toggleTree":true}`)}`;
    }
    navigator.clipboard.writeText(link).then(() => {
      this.log.debug("Link copied to clipboard");
      this.snackBar.open("Copied link successfully", 'Dismiss', quickSnackbarOptions);
    }).catch(() => {
      console.error("Failed to copy Link to clipboard");
    });
  }

  copyPath(rightClickedFile: any) {
    navigator.clipboard.writeText(rightClickedFile.path).then(() => {
      this.log.debug("Path copied to clipboard");
    }).catch(() => {
      console.error("Failed to copy path to clipboard");
    });
  }

  showTaggingDialog(rightClickedFile: any) {
    const config = new MatDialogConfig();
    config.data = {
      node: rightClickedFile
    }
    config.maxWidth = '450px';
    const dialogRef = this.dialog.open(FileTaggingModal, config);
    dialogRef.afterClosed().subscribe((res?: boolean) => {
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
        this.searchInputChanged(this.searchCtrl.value)
      }
    } else {
      if (this.dataCached) {
        this.data = this.dataCached; // We don't care about deep clone because we just want to get dataCached back
      }
    }
  }

  // TODO: There's an app2app opportunity here, where an app using the File Tree could spawn with a pre-filtered list of nodes
  focusSearchInput(attemptCount?: number): void {
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

  onNodeClick($event: any): void {
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

  onNodeDblClick($event: any): void {
    let updateTree = false; // A double click drills into a folder, so we make a fresh query instead of update
    this.displayTree($event.node.path, updateTree);
    this.nodeDblClick.emit($event.node);
    this.selectedNode = $event.node;
  }

  onNodeRightClick($event: any) {
    let node = $event.node;
    let rightClickProperties;

    if (node.directory) {
      rightClickProperties = this.rightClickPropertiesFolder;
      this.selectedNode = node;
    } else {
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

  onPanelRightClick($event: any) {
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

  onPathChanged($event: any): void {
    this.pathChanged.emit($event);
  }

  onDataChanged($event: any): void {
    this.dataChanged.emit($event);
  }

  sortFn(a: any, b: any) {
    if (a.directory !== b.directory) {
      if (a.directory === true) {
        return -1;
      } else {
        return 1;
      }
    } else {
      if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      } else {
        return 1;
      }
    }
  }

  collapseTree(): void {
    let dataArray = this.data;
    this.selectedNode = null;
    for (let i: number = 0; i < dataArray.length; i++) {
      if (this.data[i].expanded == true) {
        this.data[i].expanded = false;
      }
    }
    this.treeComponent.unselectNode();
  }

  //Displays the starting file structure of 'path'. When update == true, tree will be updated
  //instead of reset to 'path' (meaning currently opened children don't get wiped/closed)
  public displayTree(path: string, update: boolean): void {
    //To reduce unintentional bugs by defaulting to root directory or dropping if caller sent an object we're not supposed to be using
    if (path === undefined || path === '') {
      path = this.root;
    } else if (typeof path !== 'string') {
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
        const tempChildren: FileTreeNode[] = [];
        for (let i: number = 0; i < files.entries.length; i++) {
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
        if (update == true) {//Tree is displayed to update existing opened nodes, while maintaining currently opened trees 

          let indexArray: number[];
          let dataArray: FileTreeNode[];//represents the working FileTreeNode[] that will eventually be added to tempChildren and make up the tree
          let networkArray: FileTreeNode[];//represents the FileTreeNode[] obtained from the uss server, will iteratively replace dataArray as need be
          let parentNode: FileTreeNode;
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
                  for (let i: number = 0; i < tempChildren.length; i++) {
                    if (parentNode.label == tempChildren[i].label || parentNode.children == tempChildren[i].children) {
                      tempChildren[i] = parentNode; break;
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
              indexArray[indexArray.length - 1]++;//go up index to check new element in data array
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
          this.snackBar.open('Failed to open: Permission denied.',
            'Dismiss', defaultSnackbarOptions);
        } else if (error.status == '0') {
          this.snackBar.open("Failed to communicate with the App server: " + error.status,
            'Dismiss', defaultSnackbarOptions);
        } else if (error.status == '404') {
          this.snackBar.open("File/folder not found. " + error.status,
            'Dismiss', quickSnackbarOptions);
        } else {
          this.snackBar.open("An unknown error occurred: " + error.status,
            'Dismiss', defaultSnackbarOptions);
        }
        this.log.severe(error);
      }
    });
    this.refreshHistory(this.path);
  }
  private refreshHistory(path: string) {
    this.ussSearchHistorySubscription = this.ussSearchHistory
      .saveSearchHistory(path)
      .subscribe();
  }

  clearSearchHistory(): void {
    this.ussSearchHistory.deleteSearchHistory().subscribe();
    this.ussSearchHistory.onInit(SEARCH_ID);
  }

  //Adds children to the existing node to update this.data array, 
  //fetch - fetches new data, expand - expands or not folder node after fetching new data
  addChild(node: any, fetch?: boolean, expand?: boolean): void {
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
      let tempChildren: FileTreeNode[] = [];
      ussData.subscribe(
        files => {
          files.entries.sort(this.sortFn);
          //TODO: Could be turned into a util service...
          for (let i: number = 0; i < files.entries.length; i++) {
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
          node.expandedIcon = "fa fa-folder-open"; node.collapsedIcon = "fa fa-folder";
          this.log.debug(path + " was populated with " + tempChildren.length + " children.");

          while (node.parent !== undefined) {
            let newChild = node.parent;
            newChild.children[node.id] = node;
            newChild.expanded = true;
            newChild.expandedIcon = "fa fa-folder-open"; newChild.collapsedIcon = "fa fa-folder";
            node = newChild;
          }

          let index = -1;
          for (let i: number = 0; i < this.data.length; i++) {
            if (this.data[i].label == node.label) {
              index = i; break;
            }
          }
          if (index != -1) {
            this.data[index] = node;
            if (this.showSearch) { // If we update a node in the working directory, we need to find that same node in the cached data
              index = -1; // which may be in a different index due to filtering by search query
              for (let i: number = 0; i < this.dataCached.length; i++) { // We could use this.findNodeByPath, but we need search only parent level
                if (this.dataCached[i].label == node.label) {
                  index = i; break;
                }
              }
              if (index != -1) {
                this.dataCached[index] = node;
              } else {
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

  refreshFileMetadata(node: any) {
    let path = node.path;
    let someData = this.ussSrv.getFileMetadata(path);
    someData.subscribe({
      next: (result) => {
        if (result.directory) {
          node.data = "Folder";
          node.collapsedIcon = "fa fa-folder";
          node.expandedIcon = "fa fa-folder-open";
        } else {
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
          this.snackBar.open("Failed to refresh '" + node.name + "' No longer exists or has been renamed.",
            'Dismiss', defaultSnackbarOptions);
          this.removeChild(node);
        } else if (e.status == 403) {
          this.snackBar.open("Failed to refresh '" + node.name + "' Permission denied.",
            'Dismiss', defaultSnackbarOptions);
        } else if (e.status == 500) {
          this.snackBar.open("Failed to refresh '" + node.name + "' Server returned with: " + e._body,
            'Dismiss', longSnackbarOptions);
        }
        return node;
      }
    });
  }

  refreshFileMetadatdaUsingPath(path: string) {
    let foundNode = this.findNodeByPath(this.data, path)[0];
    if (foundNode) {
      this.refreshFileMetadata(foundNode);
    }
  }

  searchInputChanged(input: string) {
    if (this.dataCached) {
      this.data = _.cloneDeep(this.dataCached);
    }
    this.filterNodesByLabel(this.data, input);
  }

  filterNodesByLabel(data: any, label: string) {
    for (let i = 0; i < data.length; i++) {
      if (!(data[i]).label.includes(label)) {
        if (data[i].children && data[i].children.length > 0) {
          this.filterNodesByLabel(data[i].children, label);
        }
        if (!(data[i].children && data[i].children.length > 0)) {
          data.splice(i, 1);
          i--;
        } else if (data[i].data = "Folder") { // If some children didn't get filtered out (aka we got some matches) and we have a folder
          // then we want to expand the node so the user can see their results in the search bar
          data[i].expanded = true;
        }
      }
    }
  }

  // TODO: Could be optimized to do breadth first search vs depth first search
  findNodeByPath(data: any, path: string) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].path == path) {
        return [data[i], i]; // 0 - node, 1 - index
      }
      if (data[i].children && data[i].children.length > 0) {
        let foundValue: any;
        foundValue = this.findNodeByPath(data[i].children, path);
        // if match not found in the childern nodes then contine with pending Top level nodes
        if (foundValue[0] == null && i != data.length - 1) {
          continue;
        } else {
          return foundValue;
        }
      }
    }
    return [null, null];
  }

  updateUss(path: string): void {
    this.displayTree(path, true);
  }

  createFile(pathAndName: string, node: any, update: boolean): void {
    this.ussSrv.makeFile(pathAndName).subscribe({
      next: (res: any) => {
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
              }
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
              } else if (update) { // If we want to update the tree
                this.addChild(node);
              } else { // If we are creating a new folder in a location we're not looking at
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

  createFolder(pathAndName: string, node: any, update: boolean): void {
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
                }
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
                } else if (update) { // If we want to update the tree
                  this.addChild(node);
                } else { // If we are creating a new folder in a location we're not looking at
                  this.displayTree(pathAndName, false); // ...plop the Explorer into the newly created location.
                }
              }
            }
          });
        },
        error: error => {
          if (error.status == '500') { //Internal Server Error
            this.snackBar.open("Failed to create directory: '" + pathAndName + "' This is probably due to a server agent problem.",
              'Dismiss', defaultSnackbarOptions);
          }
          this.log.severe(error);
        }
      });
  }

  deleteFileOrFolder(rightClickedFile: any): void {
    let pathAndName = rightClickedFile.path;
    let name = this.getNameFromPathAndName(pathAndName);
    this.isLoading = true;
    this.deletionQueue.set(rightClickedFile.path, rightClickedFile);
    rightClickedFile.styleClass = "filebrowseruss-node-deleting";
    let deleteSubscription = this.ussSrv.deleteFileOrFolder(pathAndName)
      .subscribe({
        next: resp => {
          this.isLoading = false;
          this.snackBar.open("Deleted '" + name + "'",
            'Dismiss', quickSnackbarOptions);
          this.removeChild(rightClickedFile);
          this.deletionQueue.delete(rightClickedFile.path);
          rightClickedFile.styleClass = "";
          this.deleteClick.emit(this.rightClickedEvent.node);
        },
        error: error => {
          if (error.status == '500') { //Internal Server Error
            this.snackBar.open("Failed to delete '" + pathAndName + "' Server returned with: " + error._body,
              'Dismiss', longSnackbarOptions);
          } else if (error.status == '404') { //Not Found
            this.snackBar.open("Failed to delete '" + pathAndName + "'. Already been deleted or does not exist.",
              'Dismiss', defaultSnackbarOptions);
            this.removeChild(rightClickedFile);
          } else if (error.status == '400' || error.status == '403') { //Bad Request
            this.snackBar.open("Failed to delete '" + pathAndName + "' This is probably due to a permission problem.",
              'Dismiss', defaultSnackbarOptions);
          } else { //Unknown
            this.snackBar.open("Unknown error '" + error.status + "' occurred for '" + pathAndName + "' Server returned with: " + error._body,
              'Dismiss', longSnackbarOptions);
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
        this.snackBar.open("Deleting '" + pathAndName + "'... Larger payloads may take longer. Please be patient.",
          'Dismiss', quickSnackbarOptions);
      }
    }, 4000);
  }

  removeChild(node: any) {
    let parent;
    let children;
    if (node.parent) { // If the selected node has a parent,
      parent = node.parent;
      children = parent.children; // ...just use the top-most children
    } else { // The selected node *is* the top-most node,
      children = this.data; // ...just use the UI nodes as our children
    }

    let nodeData = this.findNodeByPath(children, node.path);
    if (nodeData) { // If we catch the node we wanted to remove,
      let nodeObj = nodeData[0];
      let nodeIndex = nodeData[1];
      children.splice(nodeIndex, 1); // ...remove it
      if (node.parent && node.parent.children) { // Update the children to no longer include removed node
        node.parent.children = children;
      } else {
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

  sendNotification(title: string, message: string): number {
    let pluginId = this.pluginDefinition.getBasePlugin().getIdentifier();
    // We can specify a different styleClass to theme the notification UI i.e. [...] message, 1, pluginId, "org_zowe_zlux_editor_snackbar"
    let notification = ZoweZLUX.notificationManager.createNotification(title, message, 1, pluginId);
    return ZoweZLUX.notificationManager.notify(notification);
  }

  levelUp(): void {
    //TODO: may want to change this to 'root' depending on mainframe file access security
    //to prevent people from accessing files/folders outside their root dir
    if (this.path !== "/" && this.path !== '') {
      this.path = this.getPathFromPathAndName(this.path);
      if (this.path === '' || this.path == '/') {
        this.path = '/';
      }

      let parentindex = this.path.length - 1;
      while (this.path.charAt(parentindex) != '/') { parentindex--; }
      let parent = this.path.slice(parentindex + 1, this.path.length);
      this.log.debug("Going up to: " + parent);

      this.displayTree(this.path, false);
    } else {
      this.updateUss(this.path);
    }
  }

  getPathFromPathAndName(pathAndName: string): string {
    let path = pathAndName.replace(/\/$/, '').replace(/\/[^\/]+$/, '');
    return path;
  }

  getNameFromPathAndName(pathAndName: string): string {
    let name = pathAndName.replace(/(^.*)(\/.*\/)/, '');
    return name;
  }

  private checkPath(input: string): string {
    return this.utils.filePathEndCheck(this.path) + input;
  }

  checkPathSlash(event: any) {
    if (this.path == "") {
      this.path = "/";
      this.pathInputUSS.nativeElement.value = "/";
    }
  }

  checkIfInDeletionQueueAndMessage(pathAndName: string, message: string): boolean {
    if (this.deletionQueue.has(pathAndName)) {
      this.snackBar.open("Deletion in progress: '" + pathAndName + "' " + message,
        'Dismiss', defaultSnackbarOptions);
      return true;
    }
    return false;
  }
}


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
