
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CustomErrorStateMatcher } from '../../shared/error-state-matcher';
import { fileTagList, findFileTagByCodeset, FileTag } from '../../shared/file-tag';
import { defaultSnackbarOptions } from '../../shared/snackbar-options';
import { finalize } from 'rxjs/operators';

import './file-tagging-modal.component.scss';
import '../../../../src/app/shared/modal.component.scss';
@Component({
  selector: 'file-tagging-modal',
  templateUrl: './file-tagging-modal.component.html'
})
export class FileTaggingModal {
  node: any;
  isDirectory: boolean;
  icon: string;
  name: string;
  title: string;
  matcher = new CustomErrorStateMatcher();
  recursive: boolean = false;
  tagOptions = fileTagList;
  filteredOptions: FileTag[];
  selectedOption: FileTag | string;

  constructor(
    @Inject(MAT_DIALOG_DATA) data,
    private dialogRef: MatDialogRef<FileTaggingModal>,
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {
    this.node = data.node;
    this.name = this.node.name;
    this.isDirectory = this.node.directory;
    this.icon = this.node.icon ? this.node.icon : this.node.collapsedIcon;
    this.title = this.isDirectory ? 'Tag files' : 'Tag file';
    const codeset = this.isDirectory ? 0 : this.node.ccsid;
    this.selectedOption = findFileTagByCodeset(codeset);
    this.filteredOptions = this.tagOptions;
  }

  changeTag(): void {
    const path: string = this.node.path;
    const recursive = this.recursive;
    const option = this.selectedOption as FileTag;
    const type = option.type;
    const codeset = (type === 'text') ? option.codeset : undefined;
    const options: ZLUX.UnixFileUriOptions = {
      recursive,
      type,
      codeset
    };
    const url = ZoweZLUX.uriBroker.unixFileUri('chtag', path, options);
    const action = (type === 'delete') ? this.http.delete(url) : this.http.post(url, null);
    action.pipe(
      finalize(() => this.closeDialog())
    ).
      subscribe(
        _res => this.onTaggingSuccess(path, type, option),
        err => this.onTaggingFailure(err),
      );
  }

  closeDialog() {
    const needUpdate = this.isDirectory;
    this.dialogRef.close(needUpdate);
  }

  onTaggingSuccess(path: string, type: ZLUX.TagType, option: FileTag): void {
    if (!this.isDirectory) {
      this.node.ccsid = option.codeset;
    }

    const verb = (type === 'delete') ? 'untagged' : 'tagged';
    const asCodesetOrEmpty = (type === 'delete') ? '' : `as ${option.name}`;
    const message = this.isDirectory ?
      `Files in ${path} have been successfully ${verb} ${asCodesetOrEmpty}` :
      `File ${path} has been successfully ${verb} ${asCodesetOrEmpty}`;
    this.snackBar.open(message, 'Dismiss', defaultSnackbarOptions);
  }

  onTaggingFailure(err: HttpErrorResponse): void {
    let message = 'Failed to change tag(s)';
    if (typeof err.error === 'object' && typeof err.error.error === 'string') {
      message = err.error.error;
    }
    this.snackBar.open(`Error: ${message}.`, 'Dismiss', defaultSnackbarOptions);
  }

  displayFn(option?: FileTag): string | undefined {
    return option ? option.name : undefined;
  }

  onValueChange(value?: string | FileTag): void {
    if (value) {
      const encoding = (typeof value === 'string') ? value : value.name;
      this.filteredOptions = this.filter(this.tagOptions, encoding);
    } else {
      this.filteredOptions = this.tagOptions;
    }
  }

  get isOptionSelected(): boolean {
    return typeof this.selectedOption === 'object';
  }

  private filter(options: FileTag[], value: string): FileTag[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.name.toLowerCase().includes(filterValue));
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
