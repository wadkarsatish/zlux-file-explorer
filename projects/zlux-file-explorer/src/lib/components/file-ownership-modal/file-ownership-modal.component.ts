
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
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { defaultSnackbarOptions } from '../../shared/snackbar-options';
import { finalize, catchError, map } from "rxjs/operators";

@Component({
  selector: 'file-ownership-modal',
  templateUrl: './file-ownership-modal.component.html',
  styleUrls: ['./file-ownership-modal.component.scss',
    '../../shared/modal.component.scss'],
})
export class FileOwnershipModal {

  public name = '';
  public path = '';
  public mode = 0;
  public modeSym = '';
  public icon = '';
  public owner = '';
  public group = '';
  public isDirectory = false;
  public recursive = false;
  public node = null;
  public folderName = '';
  public folderPath = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) data,
    private dialogRef: MatDialogRef<FileOwnershipModal>,
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {
    this.node = data.event;
    this.name = this.node.name;
    this.path = this.node.path;
    this.mode = this.node.mode;
    this.owner = this.node.owner;
    this.group = this.node.group;
    this.isDirectory = this.node.directory;

    if (this.node.icon) {
      this.icon = this.node.icon;
    } else if (this.node.collapsedIcon) {
      this.icon = this.node.collapsedIcon;
    }

    this.formatPermissions();
  }

  formatPermissions() {
    let modeString = String(this.mode);
    if (modeString.length == 2) { // In case the mode is not properly formatted as "000" instead of "0", "20" etc
      modeString = "0" + modeString;
    } else if (modeString.length == 1) {
      modeString = "00" + modeString;
    }
    let modeStringSym = "";

    for (let i = 0; i < 3; i++) {
      let value = modeString.charAt(i);
      switch (value) {
        case "0":
          modeStringSym += "---";
          break;
        case "1":
          modeStringSym += "--x";
          break;
        case "2":
          modeStringSym += "-w-";
          break;
        case "3":
          modeStringSym += "-wx";
          break;
        case "4":
          modeStringSym += "r--";
          break;
        case "5":
          modeStringSym += "r-x";
          break;
        case "6":
          modeStringSym += "rw-";
          break;
        case "7":
          modeStringSym += "rwx";
          break;
      }
    }
    this.modeSym = modeStringSym;
  }

  saveOwnerInfo() {
    let url: string = ZoweZLUX.uriBroker.unixFileUri('chown', this.path, undefined, undefined, undefined, false, undefined, undefined, undefined, undefined, this.recursive, this.owner, this.group);
    this.http.post(url, null, { observe: 'response' }).pipe(
      finalize(() => this.closeDialog()),
    ).subscribe(
      (res: any) => {
        if (res.status == 200) {
          this.snackBar.open(this.path + ' has been successfully changed to Owner: ' + this.owner + " Group: " + this.group + ".",
            'Dismiss', defaultSnackbarOptions);
          this.node.owner = this.owner;
          this.node.group = this.group;
        } else {
          this.snackBar.open(res.status + " - A problem was encountered: " + res.statusText,
            'Dismiss', defaultSnackbarOptions);
        }
      },
      err => {
        this.handleErrorObservable(err);
      }
    );
  }


  closeDialog() {
    const needUpdate = this.isDirectory;
    this.dialogRef.close(needUpdate);
  }

  private handleErrorObservable(error: Response | any) {
    console.error(error.message || error);
    this.snackBar.open(error.status + " - A problem was encountered: " + error._body,
      'Dismiss', defaultSnackbarOptions);
    return throwError(() => error.message || error);
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
