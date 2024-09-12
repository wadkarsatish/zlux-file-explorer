
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, Inject, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import './delete-file-modal.component.scss'
import '../../../../src/app/shared/modal.component.scss';

@Component({
  selector: 'delete-file-modal',
  templateUrl: './delete-file-modal.component.html'
})
export class DeleteFileModal {

  public fileName = '';
  public fileIcon = '';
  onDelete = new EventEmitter();
  private node: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) data,
  ) {
    const node = data.event;
    this.node = data.event;
    this.fileName = node.name;
    this.fileIcon = "fa fa-ban";
  }

  deleteFileOrFolder() {
    this.onDelete.emit();
  }

  getFileName() {
    if (this.node.data.path) {
      return this.node.data.path;
    } else {
      return this.node.path;
    }
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
