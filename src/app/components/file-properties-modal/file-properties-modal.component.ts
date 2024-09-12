
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { findFileTagByCodeset, FileTag } from '../../shared/file-tag';

import './file-properties-modal.component.scss';
import '../../../../src/app/shared/modal.component.scss';
@Component({
  selector: 'file-properties-modal',
  templateUrl: './file-properties-modal.component.html'
})
export class FilePropertiesModal implements OnInit {

  public fileName = '';
  public fileCreatedAt = '';
  public fileType = '';
  public filePath = '';
  public fileMode = 0;
  public fileSize = '';
  public fileIcon = '';
  public fileOwner = '';
  public fileGroup = '';
  public sizeType: string;
  tag?: FileTag;

  constructor(
    @Inject(MAT_DIALOG_DATA) data,
  ) {
    const node = data.event;
    this.fileName = node.name;
    this.fileCreatedAt = node.createdAt;
    this.fileType = node.data;
    this.filePath = node.path;
    this.fileMode = node.mode;
    this.fileOwner = node.owner;
    this.fileGroup = node.group;
    if (!node.directory) {
      this.tag = findFileTagByCodeset(node.ccsid);
    }

    if (node.size < 1024) { //Bytes
      this.fileSize = node.size;
      this.sizeType = "bytes";
    } else if (node.size < 1048576) {
      this.fileSize = (node.size / 1024).toFixed(3);
      this.sizeType = "KB";
    } else if (node.size < 1073741824) {
      this.fileSize = (node.size / 1048576).toFixed(3);
      this.sizeType = "MB";
    } else {
      this.fileSize = (node.size / 1073741824).toFixed(3);
      this.sizeType = "GB";
    }

    if (node.icon) {
      this.fileIcon = node.icon;
    } else if (node.collapsedIcon) {
      this.fileIcon = node.collapsedIcon;
    }
    this.fileCreatedAt = this.fileCreatedAt.replace('T', ' ');
  }

  ngOnInit() {
  }

  applyFilter(filterValue: string) {
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
