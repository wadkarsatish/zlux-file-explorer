
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
import { CustomErrorStateMatcher } from '../../shared/error-state-matcher';
import { FormControl } from '@angular/forms';
import { defaultSnackbarOptions } from '../../shared/snackbar-options';
import { finalize, catchError, map } from "rxjs/operators";

@Component({
  selector: 'file-permissions-modal',
  templateUrl: './file-permissions-modal.component.html',
  styleUrls: ['./file-permissions-modal.component.scss',
    '../../shared/modal.component.scss'],
})
export class FilePermissionsModal {

  public name = '';
  public path = '';
  public modeSym = '';
  public icon = '';
  public userRead = false;
  public groupRead = false;
  public publicRead = false;
  public userWrite = false;
  public groupWrite = false;
  public publicWrite = false;
  public userExecute = false;
  public groupExecute = false;
  public publicExecute = false;
  public isDirectory = false;
  public recursive = false;
  public node = null;
  public owner: string;
  public group: string;
  public octalMode: string; // 3-chars string e.g. "077"
  public octalModePattern = "^[0-7]{3}$";
  matcher = new CustomErrorStateMatcher();
  private readonly navigationKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'Home',
    'End',
    'ArrowLeft',
    'ArrowRight',
    'Clear',
    'Copy',
    'Paste'
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) data,
    private dialogRef: MatDialogRef<FilePermissionsModal>,
    private http: HttpClient,
    private snackBar: MatSnackBar,
  ) {
    this.node = data.event;
    this.name = this.node.name;
    this.path = this.node.path;
    this.owner = this.node.owner;
    this.group = this.node.group;
    this.octalMode = this.makeOctalModeString(this.node.mode);

    if (this.node.icon) {
      this.icon = this.node.icon;
    } else if (this.node.collapsedIcon) {
      this.icon = this.node.collapsedIcon;
    }

    if (this.node.directory) {
      this.isDirectory = true;
    }

    this.formatPermissions();
  }

  makeOctalModeString(mode: number): string {
    const withZeros = '000' + mode;
    return withZeros.substring(withZeros.length - 3);
  }

  applyFilter(filterValue: string) {
  }

  formatPermissions() {
    const modeString = this.octalMode;
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
    let modeStringChar;

    modeStringChar = modeStringSym.charAt(0);
    modeStringSym = modeStringSym.substring(1);
    this.userRead = this.calcBooleanFromMode(modeStringChar);

    modeStringChar = modeStringSym.charAt(0);
    modeStringSym = modeStringSym.substring(1);
    this.userWrite = this.calcBooleanFromMode(modeStringChar);

    modeStringChar = modeStringSym.charAt(0);
    modeStringSym = modeStringSym.substring(1);
    this.userExecute = this.calcBooleanFromMode(modeStringChar);

    modeStringChar = modeStringSym.charAt(0);
    modeStringSym = modeStringSym.substring(1);
    this.groupRead = this.calcBooleanFromMode(modeStringChar);

    modeStringChar = modeStringSym.charAt(0);
    modeStringSym = modeStringSym.substring(1);
    this.groupWrite = this.calcBooleanFromMode(modeStringChar);

    modeStringChar = modeStringSym.charAt(0);
    modeStringSym = modeStringSym.substring(1);
    this.groupExecute = this.calcBooleanFromMode(modeStringChar);

    modeStringChar = modeStringSym.charAt(0);
    modeStringSym = modeStringSym.substring(1);
    this.publicRead = this.calcBooleanFromMode(modeStringChar);

    modeStringChar = modeStringSym.charAt(0);
    modeStringSym = modeStringSym.substring(1);
    this.publicWrite = this.calcBooleanFromMode(modeStringChar);

    modeStringChar = modeStringSym.charAt(0);
    modeStringSym = modeStringSym.substring(1);
    this.publicExecute = this.calcBooleanFromMode(modeStringChar);
  }

  calcBooleanFromMode(char: string): boolean {
    if (char == '-') {
      return false;
    } else {
      return true;
    }
  }

  updateUI() {

    let modeStringSym = "";

    if (this.userExecute) { //1, 3, 5, or 7
      if (this.userWrite) { //3 or 7
        if (this.userRead) {
          modeStringSym += "7";
        } else {
          modeStringSym += "3";
        }
      } else { // 1 or 5
        if (this.userRead) {
          modeStringSym += "5";
        } else {
          modeStringSym += "1";
        }
      }
    } else { // 0, 2, 4, or 6
      if (this.userWrite) { // 2 or 6
        if (this.userRead) {
          modeStringSym += "6";
        } else {
          modeStringSym += "2";
        }
      } else { //0 or 4
        if (this.userRead) {
          modeStringSym += "4";
        } else {
          modeStringSym += "0";
        }
      }
    }

    if (this.groupExecute) { //1, 3, 5, or 7
      if (this.groupWrite) { //3 or 7
        if (this.groupRead) {
          modeStringSym += "7";
        } else {
          modeStringSym += "3";
        }
      } else { // 1 or 5
        if (this.groupRead) {
          modeStringSym += "5";
        } else {
          modeStringSym += "1";
        }
      }
    } else { // 0, 2, 4, or 6
      if (this.groupWrite) { // 2 or 6
        if (this.groupRead) {
          modeStringSym += "6";
        } else {
          modeStringSym += "2";
        }
      } else { //0 or 4
        if (this.groupRead) {
          modeStringSym += "4";
        } else {
          modeStringSym += "0";
        }
      }
    }

    if (this.publicExecute) { //1, 3, 5, or 7
      if (this.publicWrite) { //3 or 7
        if (this.publicRead) {
          modeStringSym += "7";
        } else {
          modeStringSym += "3";
        }
      } else { // 1 or 5
        if (this.publicRead) {
          modeStringSym += "5";
        } else {
          modeStringSym += "1";
        }
      }
    } else { // 0, 2, 4, or 6
      if (this.publicWrite) { // 2 or 6
        if (this.publicRead) {
          modeStringSym += "6";
        } else {
          modeStringSym += "2";
        }
      } else { //0 or 4
        if (this.publicRead) {
          modeStringSym += "4";
        } else {
          modeStringSym += "0";
        }
      }
    }

    this.octalMode = modeStringSym;
    this.formatPermissions();
  }

  savePermissions() {
    let url: string = ZoweZLUX.uriBroker.unixFileUri('chmod', this.path, undefined, undefined, undefined, false, undefined, undefined, undefined, this.octalMode, this.recursive);
    this.http.post(url, null, { observe: 'response' }).pipe(
      finalize(() => this.closeDialog()),
    ).subscribe(
      (res: any) => {
        if (res.status == 200) {
          this.snackBar.open(this.path + ' has been successfully changed to ' + this.octalMode + ".",
            'Dismiss', defaultSnackbarOptions);
          this.node.mode = parseInt(this.octalMode, 10);
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

  onOctalModeChange(newOctalMode: string, octalModeInputIsValid: boolean): void {
    if (octalModeInputIsValid) {
      this.octalMode = newOctalMode;
      this.formatPermissions();
    }
  }

  onOctalModeKeyDown(e: KeyboardEvent): void {
    if (this.navigationKeys.indexOf(e.key) !== -1) {
      return;
    }
    // Ctrl(or Meta) + A,C,V,X
    if ((e.ctrlKey || e.metaKey) && 'acvx'.indexOf(e.key) !== -1) {
      return;
    }
    if (('01234567').indexOf(e.key) === -1) {
      e.preventDefault();
    }
  }

  private handleErrorObservable(error: Response | any) {
    console.error(error.message || error);
    this.snackBar.open(error.status + " - A problem was encountered: " + error._body,
      'Dismiss', defaultSnackbarOptions);
    return throwError(error.message || error);
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
