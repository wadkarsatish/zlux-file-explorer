
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, Inject, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import './create-folder-modal.component.scss';
import '../../../../src/app/shared/modal.component.scss';
@Component({
  selector: 'create-folder-modal',
  templateUrl: './create-folder-modal.component.html'
})
export class CreateFolderModal {
  public folderName = "";
  public folderPath = "";
  public folderPathObtainedFromNode = "";
  // Block unallowed characters and "." and ".." etc
  public folderPattern = /(([^\x00-\x1F!"$'\(\)*,\/:;<>\?\[\\\]\{\|\}\x7F\s]+)$)/;
  onCreate = new EventEmitter();

  constructor(
    @Inject(MAT_DIALOG_DATA) data,
  ) {
    const node = data.event;
    if (node.path) {
      this.folderPath = node.path;
    } else {
      this.folderPath = "";
    }
    this.folderPathObtainedFromNode = this.folderPath;
  }

  createFolder() {
    let onCreateResponse = new Map();

    onCreateResponse.set("pathAndName", this.folderPath + "/" + this.folderName);
    if (this.folderPath != this.folderPathObtainedFromNode) {
      //If the user changed the path obtained from the node or the node has never been opened...
      onCreateResponse.set("updateExistingTree", false); //then we can't update the tree.
    } else { //If the user kept the path obtained from the node...
      onCreateResponse.set("updateExistingTree", true); //then we can add that new folder into the existing node.
    }

    this.onCreate.emit(onCreateResponse); //then we can't update the tree.
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
