/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { CustomErrorStateMatcher } from '../../shared/error-state-matcher';
import { defaultSnackbarOptions } from '../../shared/snackbar-options';
import { finalize } from "rxjs/operators";
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
import * as i2 from "@angular/common/http";
import * as i3 from "@angular/material/snack-bar";
import * as i4 from "@angular/forms";
import * as i5 from "@angular/material/form-field";
import * as i6 from "@angular/material/input";
import * as i7 from "@angular/material/list";
import * as i8 from "@angular/material/checkbox";
import * as i9 from "@angular/material/button";
import * as i10 from "zlux-widgets";
import * as i11 from "@angular/material/slide-toggle";
export class FilePermissionsModal {
    constructor(data, dialogRef, http, snackBar) {
        this.dialogRef = dialogRef;
        this.http = http;
        this.snackBar = snackBar;
        this.name = '';
        this.path = '';
        this.modeSym = '';
        this.icon = '';
        this.userRead = false;
        this.groupRead = false;
        this.publicRead = false;
        this.userWrite = false;
        this.groupWrite = false;
        this.publicWrite = false;
        this.userExecute = false;
        this.groupExecute = false;
        this.publicExecute = false;
        this.isDirectory = false;
        this.recursive = false;
        this.node = null;
        this.octalModePattern = "^[0-7]{3}$";
        this.matcher = new CustomErrorStateMatcher();
        this.navigationKeys = [
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
        this.node = data.event;
        this.name = this.node.name;
        this.path = this.node.path;
        this.owner = this.node.owner;
        this.group = this.node.group;
        this.octalMode = this.makeOctalModeString(this.node.mode);
        if (this.node.icon) {
            this.icon = this.node.icon;
        }
        else if (this.node.collapsedIcon) {
            this.icon = this.node.collapsedIcon;
        }
        if (this.node.directory) {
            this.isDirectory = true;
        }
        this.formatPermissions();
    }
    makeOctalModeString(mode) {
        const withZeros = '000' + mode;
        return withZeros.substring(withZeros.length - 3);
    }
    applyFilter(filterValue) {
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
    calcBooleanFromMode(char) {
        if (char == '-') {
            return false;
        }
        else {
            return true;
        }
    }
    updateUI() {
        let modeStringSym = "";
        if (this.userExecute) { //1, 3, 5, or 7
            if (this.userWrite) { //3 or 7
                if (this.userRead) {
                    modeStringSym += "7";
                }
                else {
                    modeStringSym += "3";
                }
            }
            else { // 1 or 5
                if (this.userRead) {
                    modeStringSym += "5";
                }
                else {
                    modeStringSym += "1";
                }
            }
        }
        else { // 0, 2, 4, or 6
            if (this.userWrite) { // 2 or 6
                if (this.userRead) {
                    modeStringSym += "6";
                }
                else {
                    modeStringSym += "2";
                }
            }
            else { //0 or 4
                if (this.userRead) {
                    modeStringSym += "4";
                }
                else {
                    modeStringSym += "0";
                }
            }
        }
        if (this.groupExecute) { //1, 3, 5, or 7
            if (this.groupWrite) { //3 or 7
                if (this.groupRead) {
                    modeStringSym += "7";
                }
                else {
                    modeStringSym += "3";
                }
            }
            else { // 1 or 5
                if (this.groupRead) {
                    modeStringSym += "5";
                }
                else {
                    modeStringSym += "1";
                }
            }
        }
        else { // 0, 2, 4, or 6
            if (this.groupWrite) { // 2 or 6
                if (this.groupRead) {
                    modeStringSym += "6";
                }
                else {
                    modeStringSym += "2";
                }
            }
            else { //0 or 4
                if (this.groupRead) {
                    modeStringSym += "4";
                }
                else {
                    modeStringSym += "0";
                }
            }
        }
        if (this.publicExecute) { //1, 3, 5, or 7
            if (this.publicWrite) { //3 or 7
                if (this.publicRead) {
                    modeStringSym += "7";
                }
                else {
                    modeStringSym += "3";
                }
            }
            else { // 1 or 5
                if (this.publicRead) {
                    modeStringSym += "5";
                }
                else {
                    modeStringSym += "1";
                }
            }
        }
        else { // 0, 2, 4, or 6
            if (this.publicWrite) { // 2 or 6
                if (this.publicRead) {
                    modeStringSym += "6";
                }
                else {
                    modeStringSym += "2";
                }
            }
            else { //0 or 4
                if (this.publicRead) {
                    modeStringSym += "4";
                }
                else {
                    modeStringSym += "0";
                }
            }
        }
        this.octalMode = modeStringSym;
        this.formatPermissions();
    }
    savePermissions() {
        let url = ZoweZLUX.uriBroker.unixFileUri('chmod', this.path, undefined, undefined, undefined, false, undefined, undefined, undefined, this.octalMode, this.recursive);
        this.http.post(url, null, { observe: 'response' }).pipe(finalize(() => this.closeDialog())).subscribe({
            next: (res) => {
                if (res.status == 200) {
                    this.snackBar.open(this.path + ' has been successfully changed to ' + this.octalMode + ".", 'Dismiss', defaultSnackbarOptions);
                    this.node.mode = parseInt(this.octalMode, 10);
                }
                else {
                    this.snackBar.open(res.status + " - A problem was encountered: " + res.statusText, 'Dismiss', defaultSnackbarOptions);
                }
            },
            error: err => {
                this.handleErrorObservable(err);
            }
        });
    }
    closeDialog() {
        const needUpdate = this.isDirectory;
        this.dialogRef.close(needUpdate);
    }
    onOctalModeChange(newOctalMode, octalModeInputIsValid) {
        if (octalModeInputIsValid) {
            this.octalMode = newOctalMode;
            this.formatPermissions();
        }
    }
    onOctalModeKeyDown(e) {
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
    handleErrorObservable(error) {
        console.error(error.message || error);
        this.snackBar.open(error.status + " - A problem was encountered: " + error._body, 'Dismiss', defaultSnackbarOptions);
        return throwError(error.message || error);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FilePermissionsModal, deps: [{ token: MAT_DIALOG_DATA }, { token: i1.MatDialogRef }, { token: i2.HttpClient }, { token: i3.MatSnackBar }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: FilePermissionsModal, selector: "file-permissions-modal", ngImport: i0, template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<!-- FA Icon is determined by class name, so we hardcode the style here -->\n<i class=\"{{icon}}\" style=\"font-size:24px; position: absolute; margin-top: 4px; margin-left: 3px;\"></i>\n<button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n<h2 mat-dialog-title class=\"file-permissions-header\">{{name}} - Change Permissions</h2>\n\n\n<!-- Possible future filter code -->\n<!-- <mat-form-field>\n<input matInput (keyup)=\"applyFilter($event.target.value)\" placeholder=\"Filter\">\n</mat-form-field> -->\n\n<div class=\"file-permissions-row\">\n  <mat-list-item>\n    <div class=\"modal-column\">\n      <span class=\"file-permissions-subtitle\">Owner: {{ owner }}</span>\n    </div>\n    <div class=\"modal-column\">\n      <span class=\"file-permissions-subtitle\">Group: {{ group }}</span>\n    </div>\n  </mat-list-item>\n</div>\n<div class=\"file-permissions-row\">\n  <div class=\"modal-column-full-width\">\n    <mat-list-item>\n      <span class=\"file-permissions-subtitle\">Mode:</span>\n      <mat-form-field class=\"mode-form-field\">\n        <input class=\"mode-input\" matInput required type=\"text\" maxlength=\"3\" minlength=\"3\" [pattern]=\"octalModePattern\"\n          [ngModel]=\"octalMode\" (ngModelChange)=\"onOctalModeChange($event, octalModeInput.valid)\"\n          #octalModeInput=\"ngModel\" (keydown)=\"onOctalModeKeyDown($event)\" [errorStateMatcher]=\"matcher\">\n        @if (octalModeInput.hasError('pattern') && !octalModeInput.hasError(\"required\")) {\n        <mat-error>\n          Invalid mode\n        </mat-error>\n        }\n        @if (octalModeInput.hasError(\"required\")) {\n        <mat-error>\n          Mode is required\n        </mat-error>\n        }\n      </mat-form-field>\n      <span class=\"mode-sym\">{{modeSym}}</span>\n    </mat-list-item>\n  </div>\n</div>\n\n<div class=\"container\">\n\n  <span class=\"file-permissions-subtitle user\">Owner</span>\n  <section class=\"example-section user\">\n    <mat-checkbox color=\"primary\" class=\"example-margin\" [(ngModel)]=\"userRead\"\n      (change)=\"updateUI()\">Read</mat-checkbox>\n    <mat-checkbox color=\"primary\" class=\"example-margin\" [(ngModel)]=\"userWrite\"\n      (change)=\"updateUI()\">Write</mat-checkbox>\n    <mat-checkbox color=\"primary\" class=\"example-margin\" [(ngModel)]=\"userExecute\"\n      (change)=\"updateUI()\">Execute</mat-checkbox>\n  </section>\n\n  <span class=\"file-permissions-subtitle group\">Group</span>\n  <section class=\"example-section group\">\n    <mat-checkbox color=\"primary\" class=\"example-margin\" [(ngModel)]=\"groupRead\"\n      (change)=\"updateUI()\">Read</mat-checkbox>\n    <mat-checkbox color=\"primary\" class=\"example-margin\" [(ngModel)]=\"groupWrite\"\n      (change)=\"updateUI()\">Write</mat-checkbox>\n    <mat-checkbox color=\"primary\" class=\"example-margin\" [(ngModel)]=\"groupExecute\"\n      (change)=\"updateUI()\">Execute</mat-checkbox>\n  </section>\n\n  <span class=\"file-permissions-subtitle public\">Other</span>\n  <section class=\"example-section public\">\n    <mat-checkbox color=\"primary\" class=\"example-margin\" [(ngModel)]=\"publicRead\"\n      (change)=\"updateUI()\">Read</mat-checkbox>\n    <mat-checkbox color=\"primary\" class=\"example-margin\" [(ngModel)]=\"publicWrite\"\n      (change)=\"updateUI()\">Write</mat-checkbox>\n    <mat-checkbox color=\"primary\" class=\"example-margin\" [(ngModel)]=\"publicExecute\"\n      (change)=\"updateUI()\">Execute</mat-checkbox>\n  </section>\n</div>\n\n@if (isDirectory) {\n<div class=\"file-permissions-row\">\n  <div class=\"modal-column\" style=\"width: 30%;\">\n    <mat-list-item>\n      <mat-slide-toggle color=\"primary\" class=\"selectable-text\" [(ngModel)]=\"recursive\"></mat-slide-toggle>\n    </mat-list-item>\n  </div>\n  <div class=\"modal-column\">\n    <mat-list-item>\n      <div class=\"selectable-text\">Recursive?</div>\n    </mat-list-item>\n  </div>\n</div>\n}\n\n<mat-dialog-actions>\n  <button mat-button class=\"modal-mat-button\" (click)=\"savePermissions()\"\n    [disabled]=\"octalModeInput.invalid\">Save</button>\n  <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->\n</mat-dialog-actions>\n\n<!--\n  This program and the accompanying materials are\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n  SPDX-License-Identifier: EPL-2.0\n\n  Copyright Contributors to the Zowe Project.\n  -->", styles: [".file-permissions-row:after{content:\"\";display:table;clear:both}.file-permissions-row{font-size:medium;padding-left:15px;padding-bottom:15px;padding-top:15px}.file-permissions-title{vertical-align:middle;float:left}.file-permissions-header{margin-left:33px;margin-bottom:15px}.example-section{display:flex}.example-margin{margin:0 10px}.file-permissions-subtitle{font-size:large;font-weight:500}.container{display:grid;grid-template-columns:75px 200px;grid-template-rows:75px 75px 75px;align-content:center;align-items:center}.file-permissions-subtitle.user{grid-column-start:1;grid-column-end:2;grid-row-start:1;grid-row-end:2}.example-section.user{grid-column-start:2;grid-column-end:3;grid-row-start:1;grid-row-end:2}.mode-form-field{width:6rem;margin-left:2rem}.mode-input{text-align:center;padding:0 1rem}.mode-sym{font-family:monospace;font-size:16px;margin-left:1rem;letter-spacing:1px;font-weight:600}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{padding:6px;width:85px;border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:33px;margin-bottom:15px;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}\n"], dependencies: [{ kind: "directive", type: i4.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i4.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i4.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i4.MinLengthValidator, selector: "[minlength][formControlName],[minlength][formControl],[minlength][ngModel]", inputs: ["minlength"] }, { kind: "directive", type: i4.MaxLengthValidator, selector: "[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]", inputs: ["maxlength"] }, { kind: "directive", type: i4.PatternValidator, selector: "[pattern][formControlName],[pattern][formControl],[pattern][ngModel]", inputs: ["pattern"] }, { kind: "directive", type: i4.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "component", type: i5.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i5.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "directive", type: i6.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly"], exportAs: ["matInput"] }, { kind: "component", type: i7.MatListItem, selector: "mat-list-item, a[mat-list-item], button[mat-list-item]", inputs: ["activated"], exportAs: ["matListItem"] }, { kind: "component", type: i8.MatCheckbox, selector: "mat-checkbox", inputs: ["aria-label", "aria-labelledby", "aria-describedby", "id", "required", "labelPosition", "name", "value", "disableRipple", "tabIndex", "color", "checked", "disabled", "indeterminate"], outputs: ["change", "indeterminateChange"], exportAs: ["matCheckbox"] }, { kind: "component", type: i9.MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", exportAs: ["matButton"] }, { kind: "component", type: i10.ZluxTabbingComponent, selector: "zlux-tab-trap", inputs: ["hiddenIds", "hiddenPos"] }, { kind: "component", type: i11.MatSlideToggle, selector: "mat-slide-toggle", inputs: ["name", "id", "labelPosition", "aria-label", "aria-labelledby", "aria-describedby", "required", "color", "disabled", "disableRipple", "tabIndex", "checked", "hideIcon"], outputs: ["change", "toggleChange"], exportAs: ["matSlideToggle"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FilePermissionsModal, decorators: [{
            type: Component,
            args: [{ selector: 'file-permissions-modal', template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<!-- FA Icon is determined by class name, so we hardcode the style here -->\n<i class=\"{{icon}}\" style=\"font-size:24px; position: absolute; margin-top: 4px; margin-left: 3px;\"></i>\n<button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n<h2 mat-dialog-title class=\"file-permissions-header\">{{name}} - Change Permissions</h2>\n\n\n<!-- Possible future filter code -->\n<!-- <mat-form-field>\n<input matInput (keyup)=\"applyFilter($event.target.value)\" placeholder=\"Filter\">\n</mat-form-field> -->\n\n<div class=\"file-permissions-row\">\n  <mat-list-item>\n    <div class=\"modal-column\">\n      <span class=\"file-permissions-subtitle\">Owner: {{ owner }}</span>\n    </div>\n    <div class=\"modal-column\">\n      <span class=\"file-permissions-subtitle\">Group: {{ group }}</span>\n    </div>\n  </mat-list-item>\n</div>\n<div class=\"file-permissions-row\">\n  <div class=\"modal-column-full-width\">\n    <mat-list-item>\n      <span class=\"file-permissions-subtitle\">Mode:</span>\n      <mat-form-field class=\"mode-form-field\">\n        <input class=\"mode-input\" matInput required type=\"text\" maxlength=\"3\" minlength=\"3\" [pattern]=\"octalModePattern\"\n          [ngModel]=\"octalMode\" (ngModelChange)=\"onOctalModeChange($event, octalModeInput.valid)\"\n          #octalModeInput=\"ngModel\" (keydown)=\"onOctalModeKeyDown($event)\" [errorStateMatcher]=\"matcher\">\n        @if (octalModeInput.hasError('pattern') && !octalModeInput.hasError(\"required\")) {\n        <mat-error>\n          Invalid mode\n        </mat-error>\n        }\n        @if (octalModeInput.hasError(\"required\")) {\n        <mat-error>\n          Mode is required\n        </mat-error>\n        }\n      </mat-form-field>\n      <span class=\"mode-sym\">{{modeSym}}</span>\n    </mat-list-item>\n  </div>\n</div>\n\n<div class=\"container\">\n\n  <span class=\"file-permissions-subtitle user\">Owner</span>\n  <section class=\"example-section user\">\n    <mat-checkbox color=\"primary\" class=\"example-margin\" [(ngModel)]=\"userRead\"\n      (change)=\"updateUI()\">Read</mat-checkbox>\n    <mat-checkbox color=\"primary\" class=\"example-margin\" [(ngModel)]=\"userWrite\"\n      (change)=\"updateUI()\">Write</mat-checkbox>\n    <mat-checkbox color=\"primary\" class=\"example-margin\" [(ngModel)]=\"userExecute\"\n      (change)=\"updateUI()\">Execute</mat-checkbox>\n  </section>\n\n  <span class=\"file-permissions-subtitle group\">Group</span>\n  <section class=\"example-section group\">\n    <mat-checkbox color=\"primary\" class=\"example-margin\" [(ngModel)]=\"groupRead\"\n      (change)=\"updateUI()\">Read</mat-checkbox>\n    <mat-checkbox color=\"primary\" class=\"example-margin\" [(ngModel)]=\"groupWrite\"\n      (change)=\"updateUI()\">Write</mat-checkbox>\n    <mat-checkbox color=\"primary\" class=\"example-margin\" [(ngModel)]=\"groupExecute\"\n      (change)=\"updateUI()\">Execute</mat-checkbox>\n  </section>\n\n  <span class=\"file-permissions-subtitle public\">Other</span>\n  <section class=\"example-section public\">\n    <mat-checkbox color=\"primary\" class=\"example-margin\" [(ngModel)]=\"publicRead\"\n      (change)=\"updateUI()\">Read</mat-checkbox>\n    <mat-checkbox color=\"primary\" class=\"example-margin\" [(ngModel)]=\"publicWrite\"\n      (change)=\"updateUI()\">Write</mat-checkbox>\n    <mat-checkbox color=\"primary\" class=\"example-margin\" [(ngModel)]=\"publicExecute\"\n      (change)=\"updateUI()\">Execute</mat-checkbox>\n  </section>\n</div>\n\n@if (isDirectory) {\n<div class=\"file-permissions-row\">\n  <div class=\"modal-column\" style=\"width: 30%;\">\n    <mat-list-item>\n      <mat-slide-toggle color=\"primary\" class=\"selectable-text\" [(ngModel)]=\"recursive\"></mat-slide-toggle>\n    </mat-list-item>\n  </div>\n  <div class=\"modal-column\">\n    <mat-list-item>\n      <div class=\"selectable-text\">Recursive?</div>\n    </mat-list-item>\n  </div>\n</div>\n}\n\n<mat-dialog-actions>\n  <button mat-button class=\"modal-mat-button\" (click)=\"savePermissions()\"\n    [disabled]=\"octalModeInput.invalid\">Save</button>\n  <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->\n</mat-dialog-actions>\n\n<!--\n  This program and the accompanying materials are\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n  SPDX-License-Identifier: EPL-2.0\n\n  Copyright Contributors to the Zowe Project.\n  -->", styles: [".file-permissions-row:after{content:\"\";display:table;clear:both}.file-permissions-row{font-size:medium;padding-left:15px;padding-bottom:15px;padding-top:15px}.file-permissions-title{vertical-align:middle;float:left}.file-permissions-header{margin-left:33px;margin-bottom:15px}.example-section{display:flex}.example-margin{margin:0 10px}.file-permissions-subtitle{font-size:large;font-weight:500}.container{display:grid;grid-template-columns:75px 200px;grid-template-rows:75px 75px 75px;align-content:center;align-items:center}.file-permissions-subtitle.user{grid-column-start:1;grid-column-end:2;grid-row-start:1;grid-row-end:2}.example-section.user{grid-column-start:2;grid-column-end:3;grid-row-start:1;grid-row-end:2}.mode-form-field{width:6rem;margin-left:2rem}.mode-input{text-align:center;padding:0 1rem}.mode-sym{font-family:monospace;font-size:16px;margin-left:1rem;letter-spacing:1px;font-weight:600}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{padding:6px;width:85px;border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:33px;margin-bottom:15px;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}\n"] }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DIALOG_DATA]
                }] }, { type: i1.MatDialogRef }, { type: i2.HttpClient }, { type: i3.MatSnackBar }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS1wZXJtaXNzaW9ucy1tb2RhbC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96bHV4LWZpbGUtZXhwbG9yZXIvc3JjL2xpYi9jb21wb25lbnRzL2ZpbGUtcGVybWlzc2lvbnMtbW9kYWwvZmlsZS1wZXJtaXNzaW9ucy1tb2RhbC5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96bHV4LWZpbGUtZXhwbG9yZXIvc3JjL2xpYi9jb21wb25lbnRzL2ZpbGUtcGVybWlzc2lvbnMtbW9kYWwvZmlsZS1wZXJtaXNzaW9ucy1tb2RhbC5jb21wb25lbnQuaHRtbCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTs7Ozs7Ozs7RUFRRTtBQUNGLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2xELE9BQU8sRUFBRSxlQUFlLEVBQWdCLE1BQU0sMEJBQTBCLENBQUM7QUFFekUsT0FBTyxFQUFjLFVBQVUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUU5QyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUUzRSxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUN2RSxPQUFPLEVBQUUsUUFBUSxFQUFtQixNQUFNLGdCQUFnQixDQUFDOzs7Ozs7Ozs7Ozs7O0FBUTNELE1BQU0sT0FBTyxvQkFBb0I7SUFzQy9CLFlBQzJCLElBQUksRUFDckIsU0FBNkMsRUFDN0MsSUFBZ0IsRUFDaEIsUUFBcUI7UUFGckIsY0FBUyxHQUFULFNBQVMsQ0FBb0M7UUFDN0MsU0FBSSxHQUFKLElBQUksQ0FBWTtRQUNoQixhQUFRLEdBQVIsUUFBUSxDQUFhO1FBeEN4QixTQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ1YsU0FBSSxHQUFHLEVBQUUsQ0FBQztRQUNWLFlBQU8sR0FBRyxFQUFFLENBQUM7UUFDYixT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QyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFMUQsY0FBYyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFM0QsY0FBYyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFN0QsY0FBYyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFM0QsY0FBYyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFNUQsY0FBYyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekMsYUFBYSxHQUFHLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENB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QztJQUM1QyxDQUFDOzhHQTdTVSxvQkFBb0Isa0JBdUNyQixlQUFlO2tHQXZDZCxvQkFBb0IsOERDMUJqQyxrMEpBcUhLOzsyRkQzRlEsb0JBQW9CO2tCQU5oQyxTQUFTOytCQUNFLHdCQUF3Qjs7MEJBNEMvQixNQUFNOzJCQUFDLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuLypcclxuICBUaGlzIHByb2dyYW0gYW5kIHRoZSBhY2NvbXBhbnlpbmcgbWF0ZXJpYWxzIGFyZVxyXG4gIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRWNsaXBzZSBQdWJsaWMgTGljZW5zZSB2Mi4wIHdoaWNoIGFjY29tcGFuaWVzXHJcbiAgdGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXHJcbiAgXHJcbiAgU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcclxuICBcclxuICBDb3B5cmlnaHQgQ29udHJpYnV0b3JzIHRvIHRoZSBab3dlIFByb2plY3QuXHJcbiovXHJcbmltcG9ydCB7IENvbXBvbmVudCwgSW5qZWN0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE1BVF9ESUFMT0dfREFUQSwgTWF0RGlhbG9nUmVmIH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvZGlhbG9nJztcclxuaW1wb3J0IHsgTWF0U25hY2tCYXIgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9zbmFjay1iYXInO1xyXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCB0aHJvd0Vycm9yIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IEh0dHBDbGllbnQgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XHJcbmltcG9ydCB7IEN1c3RvbUVycm9yU3RhdGVNYXRjaGVyIH0gZnJvbSAnLi4vLi4vc2hhcmVkL2Vycm9yLXN0YXRlLW1hdGNoZXInO1xyXG5pbXBvcnQgeyBGb3JtQ29udHJvbCB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcclxuaW1wb3J0IHsgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyB9IGZyb20gJy4uLy4uL3NoYXJlZC9zbmFja2Jhci1vcHRpb25zJztcclxuaW1wb3J0IHsgZmluYWxpemUsIGNhdGNoRXJyb3IsIG1hcCB9IGZyb20gXCJyeGpzL29wZXJhdG9yc1wiO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICdmaWxlLXBlcm1pc3Npb25zLW1vZGFsJyxcclxuICB0ZW1wbGF0ZVVybDogJy4vZmlsZS1wZXJtaXNzaW9ucy1tb2RhbC5jb21wb25lbnQuaHRtbCcsXHJcbiAgc3R5bGVVcmxzOiBbJy4vZmlsZS1wZXJtaXNzaW9ucy1tb2RhbC5jb21wb25lbnQuc2NzcycsXHJcbiAgICAnLi4vLi4vc2hhcmVkL21vZGFsLmNvbXBvbmVudC5zY3NzJ10sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBGaWxlUGVybWlzc2lvbnNNb2RhbCB7XHJcblxyXG4gIHB1YmxpYyBuYW1lID0gJyc7XHJcbiAgcHVibGljIHBhdGggPSAnJztcclxuICBwdWJsaWMgbW9kZVN5bSA9ICcnO1xyXG4gIHB1YmxpYyBpY29uID0gJyc7XHJcbiAgcHVibGljIHVzZXJSZWFkID0gZmFsc2U7XHJcbiAgcHVibGljIGdyb3VwUmVhZCA9IGZhbHNlO1xyXG4gIHB1YmxpYyBwdWJsaWNSZWFkID0gZmFsc2U7XHJcbiAgcHVibGljIHVzZXJXcml0ZSA9IGZhbHNlO1xyXG4gIHB1YmxpYyBncm91cFdyaXRlID0gZmFsc2U7XHJcbiAgcHVibGljIHB1YmxpY1dyaXRlID0gZmFsc2U7XHJcbiAgcHVibGljIHVzZXJFeGVjdXRlID0gZmFsc2U7XHJcbiAgcHVibGljIGdyb3VwRXhlY3V0ZSA9IGZhbHNlO1xyXG4gIHB1YmxpYyBwdWJsaWNFeGVjdXRlID0gZmFsc2U7XHJcbiAgcHVibGljIGlzRGlyZWN0b3J5ID0gZmFsc2U7XHJcbiAgcHVibGljIHJlY3Vyc2l2ZSA9IGZhbHNlO1xyXG4gIHB1YmxpYyBub2RlID0gbnVsbDtcclxuICBwdWJsaWMgb3duZXI6IHN0cmluZztcclxuICBwdWJsaWMgZ3JvdXA6IHN0cmluZztcclxuICBwdWJsaWMgb2N0YWxNb2RlOiBzdHJpbmc7IC8vIDMtY2hhcnMgc3RyaW5nIGUuZy4gXCIwNzdcIlxyXG4gIHB1YmxpYyBvY3RhbE1vZGVQYXR0ZXJuID0gXCJeWzAtN117M30kXCI7XHJcbiAgbWF0Y2hlciA9IG5ldyBDdXN0b21FcnJvclN0YXRlTWF0Y2hlcigpO1xyXG4gIHByaXZhdGUgcmVhZG9ubHkgbmF2aWdhdGlvbktleXMgPSBbXHJcbiAgICAnQmFja3NwYWNlJyxcclxuICAgICdEZWxldGUnLFxyXG4gICAgJ1RhYicsXHJcbiAgICAnRXNjYXBlJyxcclxuICAgICdFbnRlcicsXHJcbiAgICAnSG9tZScsXHJcbiAgICAnRW5kJyxcclxuICAgICdBcnJvd0xlZnQnLFxyXG4gICAgJ0Fycm93UmlnaHQnLFxyXG4gICAgJ0NsZWFyJyxcclxuICAgICdDb3B5JyxcclxuICAgICdQYXN0ZSdcclxuICBdO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIEBJbmplY3QoTUFUX0RJQUxPR19EQVRBKSBkYXRhLFxyXG4gICAgcHJpdmF0ZSBkaWFsb2dSZWY6IE1hdERpYWxvZ1JlZjxGaWxlUGVybWlzc2lvbnNNb2RhbD4sXHJcbiAgICBwcml2YXRlIGh0dHA6IEh0dHBDbGllbnQsXHJcbiAgICBwcml2YXRlIHNuYWNrQmFyOiBNYXRTbmFja0JhcixcclxuICApIHtcclxuICAgIHRoaXMubm9kZSA9IGRhdGEuZXZlbnQ7XHJcbiAgICB0aGlzLm5hbWUgPSB0aGlzLm5vZGUubmFtZTtcclxuICAgIHRoaXMucGF0aCA9IHRoaXMubm9kZS5wYXRoO1xyXG4gICAgdGhpcy5vd25lciA9IHRoaXMubm9kZS5vd25lcjtcclxuICAgIHRoaXMuZ3JvdXAgPSB0aGlzLm5vZGUuZ3JvdXA7XHJcbiAgICB0aGlzLm9jdGFsTW9kZSA9IHRoaXMubWFrZU9jdGFsTW9kZVN0cmluZyh0aGlzLm5vZGUubW9kZSk7XHJcblxyXG4gICAgaWYgKHRoaXMubm9kZS5pY29uKSB7XHJcbiAgICAgIHRoaXMuaWNvbiA9IHRoaXMubm9kZS5pY29uO1xyXG4gICAgfSBlbHNlIGlmICh0aGlzLm5vZGUuY29sbGFwc2VkSWNvbikge1xyXG4gICAgICB0aGlzLmljb24gPSB0aGlzLm5vZGUuY29sbGFwc2VkSWNvbjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAodGhpcy5ub2RlLmRpcmVjdG9yeSkge1xyXG4gICAgICB0aGlzLmlzRGlyZWN0b3J5ID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmZvcm1hdFBlcm1pc3Npb25zKCk7XHJcbiAgfVxyXG5cclxuICBtYWtlT2N0YWxNb2RlU3RyaW5nKG1vZGU6IG51bWJlcik6IHN0cmluZyB7XHJcbiAgICBjb25zdCB3aXRoWmVyb3MgPSAnMDAwJyArIG1vZGU7XHJcbiAgICByZXR1cm4gd2l0aFplcm9zLnN1YnN0cmluZyh3aXRoWmVyb3MubGVuZ3RoIC0gMyk7XHJcbiAgfVxyXG5cclxuICBhcHBseUZpbHRlcihmaWx0ZXJWYWx1ZTogc3RyaW5nKSB7XHJcbiAgfVxyXG5cclxuICBmb3JtYXRQZXJtaXNzaW9ucygpIHtcclxuICAgIGNvbnN0IG1vZGVTdHJpbmcgPSB0aGlzLm9jdGFsTW9kZTtcclxuICAgIGxldCBtb2RlU3RyaW5nU3ltID0gXCJcIjtcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgMzsgaSsrKSB7XHJcbiAgICAgIGxldCB2YWx1ZSA9IG1vZGVTdHJpbmcuY2hhckF0KGkpO1xyXG4gICAgICBzd2l0Y2ggKHZhbHVlKSB7XHJcbiAgICAgICAgY2FzZSBcIjBcIjpcclxuICAgICAgICAgIG1vZGVTdHJpbmdTeW0gKz0gXCItLS1cIjtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCIxXCI6XHJcbiAgICAgICAgICBtb2RlU3RyaW5nU3ltICs9IFwiLS14XCI7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiMlwiOlxyXG4gICAgICAgICAgbW9kZVN0cmluZ1N5bSArPSBcIi13LVwiO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcIjNcIjpcclxuICAgICAgICAgIG1vZGVTdHJpbmdTeW0gKz0gXCItd3hcIjtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCI0XCI6XHJcbiAgICAgICAgICBtb2RlU3RyaW5nU3ltICs9IFwici0tXCI7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiNVwiOlxyXG4gICAgICAgICAgbW9kZVN0cmluZ1N5bSArPSBcInIteFwiO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcIjZcIjpcclxuICAgICAgICAgIG1vZGVTdHJpbmdTeW0gKz0gXCJydy1cIjtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCI3XCI6XHJcbiAgICAgICAgICBtb2RlU3RyaW5nU3ltICs9IFwicnd4XCI7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdGhpcy5tb2RlU3ltID0gbW9kZVN0cmluZ1N5bTtcclxuICAgIGxldCBtb2RlU3RyaW5nQ2hhcjtcclxuXHJcbiAgICBtb2RlU3RyaW5nQ2hhciA9IG1vZGVTdHJpbmdTeW0uY2hhckF0KDApO1xyXG4gICAgbW9kZVN0cmluZ1N5bSA9IG1vZGVTdHJpbmdTeW0uc3Vic3RyaW5nKDEpO1xyXG4gICAgdGhpcy51c2VyUmVhZCA9IHRoaXMuY2FsY0Jvb2xlYW5Gcm9tTW9kZShtb2RlU3RyaW5nQ2hhcik7XHJcblxyXG4gICAgbW9kZVN0cmluZ0NoYXIgPSBtb2RlU3RyaW5nU3ltLmNoYXJBdCgwKTtcclxuICAgIG1vZGVTdHJpbmdTeW0gPSBtb2RlU3RyaW5nU3ltLnN1YnN0cmluZygxKTtcclxuICAgIHRoaXMudXNlcldyaXRlID0gdGhpcy5jYWxjQm9vbGVhbkZyb21Nb2RlKG1vZGVTdHJpbmdDaGFyKTtcclxuXHJcbiAgICBtb2RlU3RyaW5nQ2hhciA9IG1vZGVTdHJpbmdTeW0uY2hhckF0KDApO1xyXG4gICAgbW9kZVN0cmluZ1N5bSA9IG1vZGVTdHJpbmdTeW0uc3Vic3RyaW5nKDEpO1xyXG4gICAgdGhpcy51c2VyRXhlY3V0ZSA9IHRoaXMuY2FsY0Jvb2xlYW5Gcm9tTW9kZShtb2RlU3RyaW5nQ2hhcik7XHJcblxyXG4gICAgbW9kZVN0cmluZ0NoYXIgPSBtb2RlU3RyaW5nU3ltLmNoYXJBdCgwKTtcclxuICAgIG1vZGVTdHJpbmdTeW0gPSBtb2RlU3RyaW5nU3ltLnN1YnN0cmluZygxKTtcclxuICAgIHRoaXMuZ3JvdXBSZWFkID0gdGhpcy5jYWxjQm9vbGVhbkZyb21Nb2RlKG1vZGVTdHJpbmdDaGFyKTtcclxuXHJcbiAgICBtb2RlU3RyaW5nQ2hhciA9IG1vZGVTdHJpbmdTeW0uY2hhckF0KDApO1xyXG4gICAgbW9kZVN0cmluZ1N5bSA9IG1vZGVTdHJpbmdTeW0uc3Vic3RyaW5nKDEpO1xyXG4gICAgdGhpcy5ncm91cFdyaXRlID0gdGhpcy5jYWxjQm9vbGVhbkZyb21Nb2RlKG1vZGVTdHJpbmdDaGFyKTtcclxuXHJcbiAgICBtb2RlU3RyaW5nQ2hhciA9IG1vZGVTdHJpbmdTeW0uY2hhckF0KDApO1xyXG4gICAgbW9kZVN0cmluZ1N5bSA9IG1vZGVTdHJpbmdTeW0uc3Vic3RyaW5nKDEpO1xyXG4gICAgdGhpcy5ncm91cEV4ZWN1dGUgPSB0aGlzLmNhbGNCb29sZWFuRnJvbU1vZGUobW9kZVN0cmluZ0NoYXIpO1xyXG5cclxuICAgIG1vZGVTdHJpbmdDaGFyID0gbW9kZVN0cmluZ1N5bS5jaGFyQXQoMCk7XHJcbiAgICBtb2RlU3RyaW5nU3ltID0gbW9kZVN0cmluZ1N5bS5zdWJzdHJpbmcoMSk7XHJcbiAgICB0aGlzLnB1YmxpY1JlYWQgPSB0aGlzLmNhbGNCb29sZWFuRnJvbU1vZGUobW9kZVN0cmluZ0NoYXIpO1xyXG5cclxuICAgIG1vZGVTdHJpbmdDaGFyID0gbW9kZVN0cmluZ1N5bS5jaGFyQXQoMCk7XHJcbiAgICBtb2RlU3RyaW5nU3ltID0gbW9kZVN0cmluZ1N5bS5zdWJzdHJpbmcoMSk7XHJcbiAgICB0aGlzLnB1YmxpY1dyaXRlID0gdGhpcy5jYWxjQm9vbGVhbkZyb21Nb2RlKG1vZGVTdHJpbmdDaGFyKTtcclxuXHJcbiAgICBtb2RlU3RyaW5nQ2hhciA9IG1vZGVTdHJpbmdTeW0uY2hhckF0KDApO1xyXG4gICAgbW9kZVN0cmluZ1N5bSA9IG1vZGVTdHJpbmdTeW0uc3Vic3RyaW5nKDEpO1xyXG4gICAgdGhpcy5wdWJsaWNFeGVjdXRlID0gdGhpcy5jYWxjQm9vbGVhbkZyb21Nb2RlKG1vZGVTdHJpbmdDaGFyKTtcclxuICB9XHJcblxyXG4gIGNhbGNCb29sZWFuRnJvbU1vZGUoY2hhcjogc3RyaW5nKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoY2hhciA9PSAnLScpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICB1cGRhdGVVSSgpIHtcclxuXHJcbiAgICBsZXQgbW9kZVN0cmluZ1N5bSA9IFwiXCI7XHJcblxyXG4gICAgaWYgKHRoaXMudXNlckV4ZWN1dGUpIHsgLy8xLCAzLCA1LCBvciA3XHJcbiAgICAgIGlmICh0aGlzLnVzZXJXcml0ZSkgeyAvLzMgb3IgN1xyXG4gICAgICAgIGlmICh0aGlzLnVzZXJSZWFkKSB7XHJcbiAgICAgICAgICBtb2RlU3RyaW5nU3ltICs9IFwiN1wiO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBtb2RlU3RyaW5nU3ltICs9IFwiM1wiO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHsgLy8gMSBvciA1XHJcbiAgICAgICAgaWYgKHRoaXMudXNlclJlYWQpIHtcclxuICAgICAgICAgIG1vZGVTdHJpbmdTeW0gKz0gXCI1XCI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1vZGVTdHJpbmdTeW0gKz0gXCIxXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgeyAvLyAwLCAyLCA0LCBvciA2XHJcbiAgICAgIGlmICh0aGlzLnVzZXJXcml0ZSkgeyAvLyAyIG9yIDZcclxuICAgICAgICBpZiAodGhpcy51c2VyUmVhZCkge1xyXG4gICAgICAgICAgbW9kZVN0cmluZ1N5bSArPSBcIjZcIjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbW9kZVN0cmluZ1N5bSArPSBcIjJcIjtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7IC8vMCBvciA0XHJcbiAgICAgICAgaWYgKHRoaXMudXNlclJlYWQpIHtcclxuICAgICAgICAgIG1vZGVTdHJpbmdTeW0gKz0gXCI0XCI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1vZGVTdHJpbmdTeW0gKz0gXCIwXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuZ3JvdXBFeGVjdXRlKSB7IC8vMSwgMywgNSwgb3IgN1xyXG4gICAgICBpZiAodGhpcy5ncm91cFdyaXRlKSB7IC8vMyBvciA3XHJcbiAgICAgICAgaWYgKHRoaXMuZ3JvdXBSZWFkKSB7XHJcbiAgICAgICAgICBtb2RlU3RyaW5nU3ltICs9IFwiN1wiO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBtb2RlU3RyaW5nU3ltICs9IFwiM1wiO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHsgLy8gMSBvciA1XHJcbiAgICAgICAgaWYgKHRoaXMuZ3JvdXBSZWFkKSB7XHJcbiAgICAgICAgICBtb2RlU3RyaW5nU3ltICs9IFwiNVwiO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBtb2RlU3RyaW5nU3ltICs9IFwiMVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHsgLy8gMCwgMiwgNCwgb3IgNlxyXG4gICAgICBpZiAodGhpcy5ncm91cFdyaXRlKSB7IC8vIDIgb3IgNlxyXG4gICAgICAgIGlmICh0aGlzLmdyb3VwUmVhZCkge1xyXG4gICAgICAgICAgbW9kZVN0cmluZ1N5bSArPSBcIjZcIjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbW9kZVN0cmluZ1N5bSArPSBcIjJcIjtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7IC8vMCBvciA0XHJcbiAgICAgICAgaWYgKHRoaXMuZ3JvdXBSZWFkKSB7XHJcbiAgICAgICAgICBtb2RlU3RyaW5nU3ltICs9IFwiNFwiO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBtb2RlU3RyaW5nU3ltICs9IFwiMFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLnB1YmxpY0V4ZWN1dGUpIHsgLy8xLCAzLCA1LCBvciA3XHJcbiAgICAgIGlmICh0aGlzLnB1YmxpY1dyaXRlKSB7IC8vMyBvciA3XHJcbiAgICAgICAgaWYgKHRoaXMucHVibGljUmVhZCkge1xyXG4gICAgICAgICAgbW9kZVN0cmluZ1N5bSArPSBcIjdcIjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbW9kZVN0cmluZ1N5bSArPSBcIjNcIjtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7IC8vIDEgb3IgNVxyXG4gICAgICAgIGlmICh0aGlzLnB1YmxpY1JlYWQpIHtcclxuICAgICAgICAgIG1vZGVTdHJpbmdTeW0gKz0gXCI1XCI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1vZGVTdHJpbmdTeW0gKz0gXCIxXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgeyAvLyAwLCAyLCA0LCBvciA2XHJcbiAgICAgIGlmICh0aGlzLnB1YmxpY1dyaXRlKSB7IC8vIDIgb3IgNlxyXG4gICAgICAgIGlmICh0aGlzLnB1YmxpY1JlYWQpIHtcclxuICAgICAgICAgIG1vZGVTdHJpbmdTeW0gKz0gXCI2XCI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1vZGVTdHJpbmdTeW0gKz0gXCIyXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgeyAvLzAgb3IgNFxyXG4gICAgICAgIGlmICh0aGlzLnB1YmxpY1JlYWQpIHtcclxuICAgICAgICAgIG1vZGVTdHJpbmdTeW0gKz0gXCI0XCI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG1vZGVTdHJpbmdTeW0gKz0gXCIwXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5vY3RhbE1vZGUgPSBtb2RlU3RyaW5nU3ltO1xyXG4gICAgdGhpcy5mb3JtYXRQZXJtaXNzaW9ucygpO1xyXG4gIH1cclxuXHJcbiAgc2F2ZVBlcm1pc3Npb25zKCkge1xyXG4gICAgbGV0IHVybDogc3RyaW5nID0gWm93ZVpMVVgudXJpQnJva2VyLnVuaXhGaWxlVXJpKCdjaG1vZCcsIHRoaXMucGF0aCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgZmFsc2UsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIHRoaXMub2N0YWxNb2RlLCB0aGlzLnJlY3Vyc2l2ZSk7XHJcbiAgICB0aGlzLmh0dHAucG9zdCh1cmwsIG51bGwsIHsgb2JzZXJ2ZTogJ3Jlc3BvbnNlJyB9KS5waXBlKFxyXG4gICAgICBmaW5hbGl6ZSgoKSA9PiB0aGlzLmNsb3NlRGlhbG9nKCkpLFxyXG4gICAgKS5zdWJzY3JpYmUoe1xyXG4gICAgICBuZXh0OiAocmVzOiBhbnkpID0+IHtcclxuICAgICAgICBpZiAocmVzLnN0YXR1cyA9PSAyMDApIHtcclxuICAgICAgICAgIHRoaXMuc25hY2tCYXIub3Blbih0aGlzLnBhdGggKyAnIGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBjaGFuZ2VkIHRvICcgKyB0aGlzLm9jdGFsTW9kZSArIFwiLlwiLFxyXG4gICAgICAgICAgICAnRGlzbWlzcycsIGRlZmF1bHRTbmFja2Jhck9wdGlvbnMpO1xyXG4gICAgICAgICAgdGhpcy5ub2RlLm1vZGUgPSBwYXJzZUludCh0aGlzLm9jdGFsTW9kZSwgMTApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0aGlzLnNuYWNrQmFyLm9wZW4ocmVzLnN0YXR1cyArIFwiIC0gQSBwcm9ibGVtIHdhcyBlbmNvdW50ZXJlZDogXCIgKyByZXMuc3RhdHVzVGV4dCxcclxuICAgICAgICAgICAgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIGVycm9yOiBlcnIgPT4ge1xyXG4gICAgICAgIHRoaXMuaGFuZGxlRXJyb3JPYnNlcnZhYmxlKGVycik7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgY2xvc2VEaWFsb2coKSB7XHJcbiAgICBjb25zdCBuZWVkVXBkYXRlID0gdGhpcy5pc0RpcmVjdG9yeTtcclxuICAgIHRoaXMuZGlhbG9nUmVmLmNsb3NlKG5lZWRVcGRhdGUpO1xyXG4gIH1cclxuXHJcbiAgb25PY3RhbE1vZGVDaGFuZ2UobmV3T2N0YWxNb2RlOiBzdHJpbmcsIG9jdGFsTW9kZUlucHV0SXNWYWxpZDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgaWYgKG9jdGFsTW9kZUlucHV0SXNWYWxpZCkge1xyXG4gICAgICB0aGlzLm9jdGFsTW9kZSA9IG5ld09jdGFsTW9kZTtcclxuICAgICAgdGhpcy5mb3JtYXRQZXJtaXNzaW9ucygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgb25PY3RhbE1vZGVLZXlEb3duKGU6IEtleWJvYXJkRXZlbnQpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLm5hdmlnYXRpb25LZXlzLmluZGV4T2YoZS5rZXkpICE9PSAtMSkge1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICAvLyBDdHJsKG9yIE1ldGEpICsgQSxDLFYsWFxyXG4gICAgaWYgKChlLmN0cmxLZXkgfHwgZS5tZXRhS2V5KSAmJiAnYWN2eCcuaW5kZXhPZihlLmtleSkgIT09IC0xKSB7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIGlmICgoJzAxMjM0NTY3JykuaW5kZXhPZihlLmtleSkgPT09IC0xKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHByaXZhdGUgaGFuZGxlRXJyb3JPYnNlcnZhYmxlKGVycm9yOiBSZXNwb25zZSB8IGFueSkge1xyXG4gICAgY29uc29sZS5lcnJvcihlcnJvci5tZXNzYWdlIHx8IGVycm9yKTtcclxuICAgIHRoaXMuc25hY2tCYXIub3BlbihlcnJvci5zdGF0dXMgKyBcIiAtIEEgcHJvYmxlbSB3YXMgZW5jb3VudGVyZWQ6IFwiICsgZXJyb3IuX2JvZHksXHJcbiAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICByZXR1cm4gdGhyb3dFcnJvcihlcnJvci5tZXNzYWdlIHx8IGVycm9yKTtcclxuICB9XHJcbn1cclxuXHJcbi8qXHJcbiAgVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcclxuICBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEVjbGlwc2UgUHVibGljIExpY2Vuc2UgdjIuMCB3aGljaCBhY2NvbXBhbmllc1xyXG4gIHRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MjAuaHRtbFxyXG4gIFxyXG4gIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBFUEwtMi4wXHJcbiAgXHJcbiAgQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxyXG4qL1xyXG4iLCI8IS0tXG5UaGlzIHByb2dyYW0gYW5kIHRoZSBhY2NvbXBhbnlpbmcgbWF0ZXJpYWxzIGFyZVxubWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcbnRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MjAuaHRtbFxuXG5TUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxuXG5Db3B5cmlnaHQgQ29udHJpYnV0b3JzIHRvIHRoZSBab3dlIFByb2plY3QuXG4tLT5cbjx6bHV4LXRhYi10cmFwPjwvemx1eC10YWItdHJhcD5cbjwhLS0gRkEgSWNvbiBpcyBkZXRlcm1pbmVkIGJ5IGNsYXNzIG5hbWUsIHNvIHdlIGhhcmRjb2RlIHRoZSBzdHlsZSBoZXJlIC0tPlxuPGkgY2xhc3M9XCJ7e2ljb259fVwiIHN0eWxlPVwiZm9udC1zaXplOjI0cHg7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgbWFyZ2luLXRvcDogNHB4OyBtYXJnaW4tbGVmdDogM3B4O1wiPjwvaT5cbjxidXR0b24gbWF0LWRpYWxvZy1jbG9zZSBjbGFzcz1cImNsb3NlLWRpYWxvZy1idG5cIj48aSBjbGFzcz1cImZhIGZhLWNsb3NlXCI+PC9pPjwvYnV0dG9uPlxuPGgyIG1hdC1kaWFsb2ctdGl0bGUgY2xhc3M9XCJmaWxlLXBlcm1pc3Npb25zLWhlYWRlclwiPnt7bmFtZX19IC0gQ2hhbmdlIFBlcm1pc3Npb25zPC9oMj5cblxuXG48IS0tIFBvc3NpYmxlIGZ1dHVyZSBmaWx0ZXIgY29kZSAtLT5cbjwhLS0gPG1hdC1mb3JtLWZpZWxkPlxuPGlucHV0IG1hdElucHV0IChrZXl1cCk9XCJhcHBseUZpbHRlcigkZXZlbnQudGFyZ2V0LnZhbHVlKVwiIHBsYWNlaG9sZGVyPVwiRmlsdGVyXCI+XG48L21hdC1mb3JtLWZpZWxkPiAtLT5cblxuPGRpdiBjbGFzcz1cImZpbGUtcGVybWlzc2lvbnMtcm93XCI+XG4gIDxtYXQtbGlzdC1pdGVtPlxuICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1jb2x1bW5cIj5cbiAgICAgIDxzcGFuIGNsYXNzPVwiZmlsZS1wZXJtaXNzaW9ucy1zdWJ0aXRsZVwiPk93bmVyOiB7eyBvd25lciB9fTwvc3Bhbj5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY29sdW1uXCI+XG4gICAgICA8c3BhbiBjbGFzcz1cImZpbGUtcGVybWlzc2lvbnMtc3VidGl0bGVcIj5Hcm91cDoge3sgZ3JvdXAgfX08L3NwYW4+XG4gICAgPC9kaXY+XG4gIDwvbWF0LWxpc3QtaXRlbT5cbjwvZGl2PlxuPGRpdiBjbGFzcz1cImZpbGUtcGVybWlzc2lvbnMtcm93XCI+XG4gIDxkaXYgY2xhc3M9XCJtb2RhbC1jb2x1bW4tZnVsbC13aWR0aFwiPlxuICAgIDxtYXQtbGlzdC1pdGVtPlxuICAgICAgPHNwYW4gY2xhc3M9XCJmaWxlLXBlcm1pc3Npb25zLXN1YnRpdGxlXCI+TW9kZTo8L3NwYW4+XG4gICAgICA8bWF0LWZvcm0tZmllbGQgY2xhc3M9XCJtb2RlLWZvcm0tZmllbGRcIj5cbiAgICAgICAgPGlucHV0IGNsYXNzPVwibW9kZS1pbnB1dFwiIG1hdElucHV0IHJlcXVpcmVkIHR5cGU9XCJ0ZXh0XCIgbWF4bGVuZ3RoPVwiM1wiIG1pbmxlbmd0aD1cIjNcIiBbcGF0dGVybl09XCJvY3RhbE1vZGVQYXR0ZXJuXCJcbiAgICAgICAgICBbbmdNb2RlbF09XCJvY3RhbE1vZGVcIiAobmdNb2RlbENoYW5nZSk9XCJvbk9jdGFsTW9kZUNoYW5nZSgkZXZlbnQsIG9jdGFsTW9kZUlucHV0LnZhbGlkKVwiXG4gICAgICAgICAgI29jdGFsTW9kZUlucHV0PVwibmdNb2RlbFwiIChrZXlkb3duKT1cIm9uT2N0YWxNb2RlS2V5RG93bigkZXZlbnQpXCIgW2Vycm9yU3RhdGVNYXRjaGVyXT1cIm1hdGNoZXJcIj5cbiAgICAgICAgQGlmIChvY3RhbE1vZGVJbnB1dC5oYXNFcnJvcigncGF0dGVybicpICYmICFvY3RhbE1vZGVJbnB1dC5oYXNFcnJvcihcInJlcXVpcmVkXCIpKSB7XG4gICAgICAgIDxtYXQtZXJyb3I+XG4gICAgICAgICAgSW52YWxpZCBtb2RlXG4gICAgICAgIDwvbWF0LWVycm9yPlxuICAgICAgICB9XG4gICAgICAgIEBpZiAob2N0YWxNb2RlSW5wdXQuaGFzRXJyb3IoXCJyZXF1aXJlZFwiKSkge1xuICAgICAgICA8bWF0LWVycm9yPlxuICAgICAgICAgIE1vZGUgaXMgcmVxdWlyZWRcbiAgICAgICAgPC9tYXQtZXJyb3I+XG4gICAgICAgIH1cbiAgICAgIDwvbWF0LWZvcm0tZmllbGQ+XG4gICAgICA8c3BhbiBjbGFzcz1cIm1vZGUtc3ltXCI+e3ttb2RlU3ltfX08L3NwYW4+XG4gICAgPC9tYXQtbGlzdC1pdGVtPlxuICA8L2Rpdj5cbjwvZGl2PlxuXG48ZGl2IGNsYXNzPVwiY29udGFpbmVyXCI+XG5cbiAgPHNwYW4gY2xhc3M9XCJmaWxlLXBlcm1pc3Npb25zLXN1YnRpdGxlIHVzZXJcIj5Pd25lcjwvc3Bhbj5cbiAgPHNlY3Rpb24gY2xhc3M9XCJleGFtcGxlLXNlY3Rpb24gdXNlclwiPlxuICAgIDxtYXQtY2hlY2tib3ggY29sb3I9XCJwcmltYXJ5XCIgY2xhc3M9XCJleGFtcGxlLW1hcmdpblwiIFsobmdNb2RlbCldPVwidXNlclJlYWRcIlxuICAgICAgKGNoYW5nZSk9XCJ1cGRhdGVVSSgpXCI+UmVhZDwvbWF0LWNoZWNrYm94PlxuICAgIDxtYXQtY2hlY2tib3ggY29sb3I9XCJwcmltYXJ5XCIgY2xhc3M9XCJleGFtcGxlLW1hcmdpblwiIFsobmdNb2RlbCldPVwidXNlcldyaXRlXCJcbiAgICAgIChjaGFuZ2UpPVwidXBkYXRlVUkoKVwiPldyaXRlPC9tYXQtY2hlY2tib3g+XG4gICAgPG1hdC1jaGVja2JveCBjb2xvcj1cInByaW1hcnlcIiBjbGFzcz1cImV4YW1wbGUtbWFyZ2luXCIgWyhuZ01vZGVsKV09XCJ1c2VyRXhlY3V0ZVwiXG4gICAgICAoY2hhbmdlKT1cInVwZGF0ZVVJKClcIj5FeGVjdXRlPC9tYXQtY2hlY2tib3g+XG4gIDwvc2VjdGlvbj5cblxuICA8c3BhbiBjbGFzcz1cImZpbGUtcGVybWlzc2lvbnMtc3VidGl0bGUgZ3JvdXBcIj5Hcm91cDwvc3Bhbj5cbiAgPHNlY3Rpb24gY2xhc3M9XCJleGFtcGxlLXNlY3Rpb24gZ3JvdXBcIj5cbiAgICA8bWF0LWNoZWNrYm94IGNvbG9yPVwicHJpbWFyeVwiIGNsYXNzPVwiZXhhbXBsZS1tYXJnaW5cIiBbKG5nTW9kZWwpXT1cImdyb3VwUmVhZFwiXG4gICAgICAoY2hhbmdlKT1cInVwZGF0ZVVJKClcIj5SZWFkPC9tYXQtY2hlY2tib3g+XG4gICAgPG1hdC1jaGVja2JveCBjb2xvcj1cInByaW1hcnlcIiBjbGFzcz1cImV4YW1wbGUtbWFyZ2luXCIgWyhuZ01vZGVsKV09XCJncm91cFdyaXRlXCJcbiAgICAgIChjaGFuZ2UpPVwidXBkYXRlVUkoKVwiPldyaXRlPC9tYXQtY2hlY2tib3g+XG4gICAgPG1hdC1jaGVja2JveCBjb2xvcj1cInByaW1hcnlcIiBjbGFzcz1cImV4YW1wbGUtbWFyZ2luXCIgWyhuZ01vZGVsKV09XCJncm91cEV4ZWN1dGVcIlxuICAgICAgKGNoYW5nZSk9XCJ1cGRhdGVVSSgpXCI+RXhlY3V0ZTwvbWF0LWNoZWNrYm94PlxuICA8L3NlY3Rpb24+XG5cbiAgPHNwYW4gY2xhc3M9XCJmaWxlLXBlcm1pc3Npb25zLXN1YnRpdGxlIHB1YmxpY1wiPk90aGVyPC9zcGFuPlxuICA8c2VjdGlvbiBjbGFzcz1cImV4YW1wbGUtc2VjdGlvbiBwdWJsaWNcIj5cbiAgICA8bWF0LWNoZWNrYm94IGNvbG9yPVwicHJpbWFyeVwiIGNsYXNzPVwiZXhhbXBsZS1tYXJnaW5cIiBbKG5nTW9kZWwpXT1cInB1YmxpY1JlYWRcIlxuICAgICAgKGNoYW5nZSk9XCJ1cGRhdGVVSSgpXCI+UmVhZDwvbWF0LWNoZWNrYm94PlxuICAgIDxtYXQtY2hlY2tib3ggY29sb3I9XCJwcmltYXJ5XCIgY2xhc3M9XCJleGFtcGxlLW1hcmdpblwiIFsobmdNb2RlbCldPVwicHVibGljV3JpdGVcIlxuICAgICAgKGNoYW5nZSk9XCJ1cGRhdGVVSSgpXCI+V3JpdGU8L21hdC1jaGVja2JveD5cbiAgICA8bWF0LWNoZWNrYm94IGNvbG9yPVwicHJpbWFyeVwiIGNsYXNzPVwiZXhhbXBsZS1tYXJnaW5cIiBbKG5nTW9kZWwpXT1cInB1YmxpY0V4ZWN1dGVcIlxuICAgICAgKGNoYW5nZSk9XCJ1cGRhdGVVSSgpXCI+RXhlY3V0ZTwvbWF0LWNoZWNrYm94PlxuICA8L3NlY3Rpb24+XG48L2Rpdj5cblxuQGlmIChpc0RpcmVjdG9yeSkge1xuPGRpdiBjbGFzcz1cImZpbGUtcGVybWlzc2lvbnMtcm93XCI+XG4gIDxkaXYgY2xhc3M9XCJtb2RhbC1jb2x1bW5cIiBzdHlsZT1cIndpZHRoOiAzMCU7XCI+XG4gICAgPG1hdC1saXN0LWl0ZW0+XG4gICAgICA8bWF0LXNsaWRlLXRvZ2dsZSBjb2xvcj1cInByaW1hcnlcIiBjbGFzcz1cInNlbGVjdGFibGUtdGV4dFwiIFsobmdNb2RlbCldPVwicmVjdXJzaXZlXCI+PC9tYXQtc2xpZGUtdG9nZ2xlPlxuICAgIDwvbWF0LWxpc3QtaXRlbT5cbiAgPC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJtb2RhbC1jb2x1bW5cIj5cbiAgICA8bWF0LWxpc3QtaXRlbT5cbiAgICAgIDxkaXYgY2xhc3M9XCJzZWxlY3RhYmxlLXRleHRcIj5SZWN1cnNpdmU/PC9kaXY+XG4gICAgPC9tYXQtbGlzdC1pdGVtPlxuICA8L2Rpdj5cbjwvZGl2PlxufVxuXG48bWF0LWRpYWxvZy1hY3Rpb25zPlxuICA8YnV0dG9uIG1hdC1idXR0b24gY2xhc3M9XCJtb2RhbC1tYXQtYnV0dG9uXCIgKGNsaWNrKT1cInNhdmVQZXJtaXNzaW9ucygpXCJcbiAgICBbZGlzYWJsZWRdPVwib2N0YWxNb2RlSW5wdXQuaW52YWxpZFwiPlNhdmU8L2J1dHRvbj5cbiAgPCEtLSBUaGUgbWF0LWRpYWxvZy1jbG9zZSBkaXJlY3RpdmUgb3B0aW9uYWxseSBhY2NlcHRzIGEgdmFsdWUgYXMgYSByZXN1bHQgZm9yIHRoZSBkaWFsb2cuIC0tPlxuPC9tYXQtZGlhbG9nLWFjdGlvbnM+XG5cbjwhLS1cbiAgVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcbiAgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcbiAgdGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXG5cbiAgU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcblxuICBDb3B5cmlnaHQgQ29udHJpYnV0b3JzIHRvIHRoZSBab3dlIFByb2plY3QuXG4gIC0tPiJdfQ==