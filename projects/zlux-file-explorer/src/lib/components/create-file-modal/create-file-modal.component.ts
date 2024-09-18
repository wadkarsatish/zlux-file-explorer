
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, Inject, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { defaultSnackbarOptions } from '../../shared/snackbar-options';

@Component({
  selector: 'create-file-modal',
  templateUrl: './create-file-modal.component.html',
  styleUrls: ['./create-file-modal.component.scss',
    '../../shared/modal.component.scss'],
})
export class CreateFileModal {
  public fileName: string;
  public dirPath: string;
  public folderPathObtainedFromNode = "";
  // Block unallowed characters and "." and ".." etc
  public filePattern = /(([^\x00-\x1F!"$'\(\)*,\/:;<>\?\[\\\]\{\|\}\x7F\s]+)$)/;
  onFileCreate = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {
    const node = data.event;
    if (node.path) {
      this.dirPath = node.path;
    } else {
      this.dirPath = "";
    }
    this.fileName = "";
    this.folderPathObtainedFromNode = this.dirPath;

  }

  createFile() {
    const directoryPath: string = this.dirPath;
    const path = directoryPath + '/' + this.fileName;
    let onFileCreateResponse = new Map();
    onFileCreateResponse.set("pathAndName", this.dirPath + "/" + this.fileName);
    if (this.dirPath != this.folderPathObtainedFromNode) {
      //If the user changed the path obtained from the node or the node has never been opened...
      onFileCreateResponse.set("updateExistingTree", false); //then we can't update the tree.
    } else { //If the user kept the path obtained from the node...
      onFileCreateResponse.set("updateExistingTree", true); //then we can add that new folder into the existing node.
    }
    this.onFileCreate.emit(onFileCreateResponse); //then we can't update the tree.
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
