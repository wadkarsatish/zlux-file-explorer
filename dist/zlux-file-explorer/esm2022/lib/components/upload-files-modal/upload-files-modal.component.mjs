/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, Inject, EventEmitter, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { defaultSnackbarOptions } from '../../shared/snackbar-options';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import * as i0 from "@angular/core";
import * as i1 from "../../services/uploader.service";
import * as i2 from "@angular/material/snack-bar";
import * as i3 from "@angular/forms";
import * as i4 from "@angular/material/dialog";
import * as i5 from "@angular/material/form-field";
import * as i6 from "@angular/material/icon";
import * as i7 from "@angular/material/input";
import * as i8 from "@angular/material/button";
import * as i9 from "@angular/material/core";
import * as i10 from "@angular/material/autocomplete";
import * as i11 from "zlux-widgets";
/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher {
    isErrorState(control, form) {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
}
export class UploadModal {
    constructor(data, uploader, snackBar) {
        this.uploader = uploader;
        this.snackBar = snackBar;
        this.folderPath = "";
        this.onUpload = new EventEmitter();
        this.matcher = new MyErrorStateMatcher();
        this.encodings = [
            // { TODO: API Bug - Upload fails with Binary as target for now
            //     name: 'BINARY',
            //     value: 'BINARY',
            //     selected: true
            // },
            {
                name: 'UTF-8',
                value: 'UTF-8',
                selected: false
            },
            {
                name: 'ISO-8859-1',
                value: 'ISO-8859-1',
                selected: false
            },
            {
                name: 'International EBCDIC 1047',
                value: 'IBM-1047',
                selected: false
            },
            // { TODO: These encodings don't work yet in API
            //     name: 'German/Austrian EBCDIC 273',
            //     value: 'IBM-273',
            //     selected: false
            // },
            // {
            //     name: 'Danish/Norwegian EBCDIC 277',
            //     value: 'IBM-277',
            //     selected: false
            // },
            // {
            //     name: 'Finnish/Swedish EBCDIC 278',
            //     value: 'IBM-278',
            //     selected: false
            // },
            // {
            //     name: 'Italian EBCDIC 278',
            //     value: 'IBM-278',
            //     selected: false
            // },
            // {
            //     name: 'Japanese Katakana 290',
            //     value: 'IBM-290',
            //     selected: false
            // },
            // {
            //     name: 'French EBCDIC 297',
            //     value: 'IBM-297',
            //     selected: false
            // },
            // {
            //     name: 'Arabic (type 4) EBCDIC 420',
            //     value: 'IBM-420',
            //     selected: false
            // },
            // {
            //     name: 'Hebrew EBCDIC 424',
            //     value: 'IBM-424',
            //     selected: false
            // },
            // {
            //     name: 'International EBCDIC 500',
            //     value: 'IBM-500',
            //     selected: false
            // },
            // {
            //     name: 'Thai EBCDIC 838',
            //     value: 'IBM-838',
            //     selected: false
            // },
            // {
            //     name: 'Croat/Czech/Polish/Serbian/Slovak EBCDIC 870',
            //     value: 'IBM-870',
            //     selected: false
            // },
            // {
            //     name: 'Greek EBCDIC 875',
            //     value: 'IBM-875',
            //     selected: false
            // },
            // {
            //     name: 'Urdu EBCDIC 918',
            //     value: 'IBM-918',
            //     selected: false
            // },
            // {
            //     name: 'Cyrillic(Russian) EBCDIC 1025',
            //     value: 'IBM-1025',
            //     selected: false
            // },
            // {
            //     name: 'Turkish EBCDIC 1026',
            //     value: 'IBM-1026',
            //     selected: false
            // },
            // {
            //     name: 'Farsi Bilingual EBCDIC 1097',
            //     value: 'IBM-1097',
            //     selected: false
            // },
            // {
            //     name: 'Baltic Multilingual EBCDIC 1112',
            //     value: 'IBM-1112',
            //     selected: false
            // },
            // {
            //     name: 'Devanagari EBCDIC 1137',
            //     value: 'IBM-1137',
            //     selected: false
            // },
            // {
            //     name: 'Chinese Traditional EBCDIC 937',
            //     value: 'IBM-937',
            //     selected: false
            // },
            // {
            //     name: 'Chinese Simplified EBCDIC 935',
            //     value: 'IBM-935',
            //     selected: false
            // },
            // {
            //     name: 'Japanese EBCDIC 930',
            //     value: 'IBM-930',
            //     selected: false
            // },
            // {
            //     name: 'Japanese EBCDIC 931',
            //     value: 'IBM-931',
            //     selected: false
            // },
            // {
            //     name: 'Japanese EBCDIC 939',
            //     value: 'IBM-939',
            //     selected: false
            // },
            // {
            //     name: 'Japanese EBCDIC 1390',
            //     value: 'IBM-1390',
            //     selected: false
            // },
            // {
            //     name: 'Japanese EBCDIC 1399',
            //     value: 'IBM-1399',
            //     selected: false
            // },
            // {
            //     name: 'Korean EBCDIC 933',
            //     value: 'IBM-933',
            //     selected: false
            // }
        ];
        this.filteredOptions = [];
        this.selectedOption = "";
        this.selectedOptionValid = false;
        const node = data.event;
        if (node.data && node.data == "Folder") {
            this.folderPath = node.path;
        }
        else if (node.data) { // Takes folder name from folder name + path
            this.folderPath = node.path.replace(/\/$/, '').replace(/\/[^\/]+$/, '');
        }
        else {
            this.folderPath = node;
        }
        this.files = new Array();
        this.fileEncodings = new Array();
        this.filteredOptions = this.fileEncodings;
    }
    addFile() {
        if (this.fileUpload) {
            this.fileUpload.nativeElement.click();
        }
    }
    onFileUploaded(event) {
        if (this.files.length > 0) {
            this.files = new Array();
        }
        // TODO: This Array filter method is already set up for multi-file select. Now we just need to add a queue for multiple files upload
        const names = Array.from(this.files, file => file.name);
        for (let file of event.target.files) {
            if (!(names.includes(file.name))) {
                this.files.push(file);
                //this.fileEncodings.push('BINARY');
            }
        }
    }
    onValueChange(value) {
        if (value) {
            for (let i = 0; i < this.encodings.length; i++) {
                if (this.encodings[i].value == value) {
                    this.selectedOptionValid = true;
                    return;
                }
            }
        }
        this.selectedOptionValid = false;
    }
    displayFn(val) {
        return val;
    }
    uploadHandlerSetup() {
        // We should make a queue that holds the list of files we wish to upload
        // That queue should likely be stored in a service (probably the uploader service that exists)
        const filesCopy = this.files;
        const fileEncodingsCopy = this.fileEncodings;
        let fileIdx = 0;
        const uploadFiles = () => {
            if (fileIdx < filesCopy.length) {
                const file = filesCopy[fileIdx];
                this.uploader.chunkAndSendFile(file, this.folderPath, this.selectedOption)
                    .subscribe(value => {
                }, error => {
                }, () => {
                    this.onUpload.emit();
                    this.snackBar.open(file.name + ' has been successfully uploaded. ', 'Dismiss', defaultSnackbarOptions);
                });
            }
        };
        uploadFiles();
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: UploadModal, deps: [{ token: MAT_DIALOG_DATA }, { token: i1.UploaderService }, { token: i2.MatSnackBar }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: UploadModal, selector: "upload-files-modal", providers: [
            { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
        ], viewQueries: [{ propertyName: "fileUpload", first: true, predicate: ["fileUpload"], descendants: true }], ngImport: i0, template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"modal-icon-container\">\n      <!-- FA Icon is determined by class name, so we hardcode the style here -->\n      <mat-icon style=\"font-size: 30px; position: absolute;\">cloud_upload</mat-icon>\n    </div>\n    <div>\n      <!-- Intentional lazy recycling of \"create\" modal CSS, TODO: move to shared/modal css -->\n      <h2 mat-dialog-title class=\"modal-mat-header\">Upload Files in {{folderPath}}</h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n\n  </div>\n  <button mat-button class=\"modal-mat-button add\" (click)=\"addFile()\">Select File</button>\n\n  <div style=\"max-height: 400px; overflow-y:scroll;\">\n    <ul>\n      @for (file of files; track file; let i = $index) {\n      <li class=\"\">\n        <label>\n          {{ file.name }}\n        </label>\n        <mat-form-field appearance=\"fill\" style=\"margin-left: 36px;\">\n          <input matInput required type=\"text\" [(ngModel)]=\"selectedOption\" (ngModelChange)=\"onValueChange($event)\"\n            [matAutocomplete]=\"auto\" [errorStateMatcher]=\"matcher\" #encodingInput=\"ngModel\"\n            placeholder=\"Select target encoding\">\n          <mat-autocomplete autoActiveFirstOption #auto=\"matAutocomplete\" [displayWith]=\"displayFn\">\n            @for (option of encodings; track option) {\n            <mat-option [value]=\"option.value\">\n              {{ option.name }}\n            </mat-option>\n            }\n          </mat-autocomplete>\n          @if (encodingInput.hasError('required')) {\n          <mat-error>\n            Encoding is required\n          </mat-error>\n          }\n        </mat-form-field>\n        <a href=\"https://www.ibm.com/docs/en/zos/2.1.0?topic=ccsids-encoding-scheme\" target=\"_blank\">\n          <i class=\"fa fa-question-circle dataset-properties-question-circle\"></i>\n        </a>\n      </li>\n      }\n    </ul>\n  </div>\n\n  <mat-dialog-actions>\n    <button mat-button mat-dialog-close class=\"modal-mat-button create\" (click)=\"uploadHandlerSetup()\"\n      [disabled]=\"!selectedOptionValid\">Upload</button>\n    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->\n  </mat-dialog-actions>\n</div>\n<input type=\"file\" style=\"display: none\" #fileUpload (change)=\"onFileUploaded($event)\">\n\n<!--\n  This program and the accompanying materials are\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n  SPDX-License-Identifier: EPL-2.0\n\n  Copyright Contributors to the Zowe Project.\n  -->", styles: [".modal-mat-button.add{color:#000}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused{background-color:#fff!important}\n"], dependencies: [{ kind: "directive", type: i3.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i3.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i3.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i3.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i4.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i4.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i4.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "component", type: i5.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i5.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "component", type: i6.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "directive", type: i7.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly"], exportAs: ["matInput"] }, { kind: "component", type: i8.MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", exportAs: ["matButton"] }, { kind: "component", type: i9.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "component", type: i10.MatAutocomplete, selector: "mat-autocomplete", inputs: ["aria-label", "aria-labelledby", "displayWith", "autoActiveFirstOption", "autoSelectActiveOption", "requireSelection", "panelWidth", "disableRipple", "class", "hideSingleSelectionIndicator"], outputs: ["optionSelected", "opened", "closed", "optionActivated"], exportAs: ["matAutocomplete"] }, { kind: "directive", type: i10.MatAutocompleteTrigger, selector: "input[matAutocomplete], textarea[matAutocomplete]", inputs: ["matAutocomplete", "matAutocompletePosition", "matAutocompleteConnectedTo", "autocomplete", "matAutocompleteDisabled"], exportAs: ["matAutocompleteTrigger"] }, { kind: "component", type: i11.ZluxTabbingComponent, selector: "zlux-tab-trap", inputs: ["hiddenIds", "hiddenPos"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: UploadModal, decorators: [{
            type: Component,
            args: [{ selector: 'upload-files-modal', providers: [
                        { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
                    ], template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"modal-icon-container\">\n      <!-- FA Icon is determined by class name, so we hardcode the style here -->\n      <mat-icon style=\"font-size: 30px; position: absolute;\">cloud_upload</mat-icon>\n    </div>\n    <div>\n      <!-- Intentional lazy recycling of \"create\" modal CSS, TODO: move to shared/modal css -->\n      <h2 mat-dialog-title class=\"modal-mat-header\">Upload Files in {{folderPath}}</h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n\n  </div>\n  <button mat-button class=\"modal-mat-button add\" (click)=\"addFile()\">Select File</button>\n\n  <div style=\"max-height: 400px; overflow-y:scroll;\">\n    <ul>\n      @for (file of files; track file; let i = $index) {\n      <li class=\"\">\n        <label>\n          {{ file.name }}\n        </label>\n        <mat-form-field appearance=\"fill\" style=\"margin-left: 36px;\">\n          <input matInput required type=\"text\" [(ngModel)]=\"selectedOption\" (ngModelChange)=\"onValueChange($event)\"\n            [matAutocomplete]=\"auto\" [errorStateMatcher]=\"matcher\" #encodingInput=\"ngModel\"\n            placeholder=\"Select target encoding\">\n          <mat-autocomplete autoActiveFirstOption #auto=\"matAutocomplete\" [displayWith]=\"displayFn\">\n            @for (option of encodings; track option) {\n            <mat-option [value]=\"option.value\">\n              {{ option.name }}\n            </mat-option>\n            }\n          </mat-autocomplete>\n          @if (encodingInput.hasError('required')) {\n          <mat-error>\n            Encoding is required\n          </mat-error>\n          }\n        </mat-form-field>\n        <a href=\"https://www.ibm.com/docs/en/zos/2.1.0?topic=ccsids-encoding-scheme\" target=\"_blank\">\n          <i class=\"fa fa-question-circle dataset-properties-question-circle\"></i>\n        </a>\n      </li>\n      }\n    </ul>\n  </div>\n\n  <mat-dialog-actions>\n    <button mat-button mat-dialog-close class=\"modal-mat-button create\" (click)=\"uploadHandlerSetup()\"\n      [disabled]=\"!selectedOptionValid\">Upload</button>\n    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->\n  </mat-dialog-actions>\n</div>\n<input type=\"file\" style=\"display: none\" #fileUpload (change)=\"onFileUploaded($event)\">\n\n<!--\n  This program and the accompanying materials are\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n  SPDX-License-Identifier: EPL-2.0\n\n  Copyright Contributors to the Zowe Project.\n  -->", styles: [".modal-mat-button.add{color:#000}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused{background-color:#fff!important}\n"] }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DIALOG_DATA]
                }] }, { type: i1.UploaderService }, { type: i2.MatSnackBar }], propDecorators: { fileUpload: [{
                type: ViewChild,
                args: ['fileUpload']
            }] } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBsb2FkLWZpbGVzLW1vZGFsLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3psdXgtZmlsZS1leHBsb3Jlci9zcmMvbGliL2NvbXBvbmVudHMvdXBsb2FkLWZpbGVzLW1vZGFsL3VwbG9hZC1maWxlcy1tb2RhbC5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96bHV4LWZpbGUtZXhwbG9yZXIvc3JjL2xpYi9jb21wb25lbnRzL3VwbG9hZC1maWxlcy1tb2RhbC91cGxvYWQtZmlsZXMtbW9kYWwuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7Ozs7Ozs7O0VBUUU7QUFDRixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFjLE1BQU0sZUFBZSxDQUFDO0FBQ3ZGLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUczRCxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUN2RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsNEJBQTRCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQzs7Ozs7Ozs7Ozs7OztBQUd6RixrRUFBa0U7QUFDbEUsTUFBTSxPQUFPLG1CQUFtQjtJQUM5QixZQUFZLENBQUMsT0FBMkIsRUFBRSxJQUF3QztRQUNoRixNQUFNLFdBQVcsR0FBRyxJQUFJLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUMzQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxPQUFPLENBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxPQUFPLENBQUMsT0FBTyxJQUFJLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFDN0YsQ0FBQztDQUNGO0FBYUQsTUFBTSxPQUFPLFdBQVc7SUFvS3RCLFlBQzJCLElBQUksRUFBVSxRQUF5QixFQUFVLFFBQXFCO1FBQXhELGFBQVEsR0FBUixRQUFRLENBQWlCO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBYTtRQW5LMUYsZUFBVSxHQUFHLEVBQUUsQ0FBQztRQUNoQixhQUFRLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUlyQyxZQUFPLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1FBQ3BDLGNBQVMsR0FBRztZQUNWLCtEQUErRDtZQUMvRCxzQkFBc0I7WUFDdEIsdUJBQXVCO1lBQ3ZCLHFCQUFxQjtZQUNyQixLQUFLO1lBQ0w7Z0JBQ0UsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsS0FBSyxFQUFFLE9BQU87Z0JBQ2QsUUFBUSxFQUFFLEtBQUs7YUFDaEI7WUFDRDtnQkFDRSxJQUFJLEVBQUUsWUFBWTtnQkFDbEIsS0FBSyxFQUFFLFlBQVk7Z0JBQ25CLFFBQVEsRUFBRSxLQUFLO2FBQ2hCO1lBQ0Q7Z0JBQ0UsSUFBSSxFQUFFLDJCQUEyQjtnQkFDakMsS0FBSyxFQUFFLFVBQVU7Z0JBQ2pCLFFBQVEsRUFBRSxLQUFLO2FBQ2hCO1lBQ0QsZ0RBQWdEO1lBQ2hELDBDQUEwQztZQUMxQyx3QkFBd0I7WUFDeEIsc0JBQXNCO1lBQ3RCLEtBQUs7WUFDTCxJQUFJO1lBQ0osMkNBQTJDO1lBQzNDLHdCQUF3QjtZQUN4QixzQkFBc0I7WUFDdEIsS0FBSztZQUNMLElBQUk7WUFDSiwwQ0FBMEM7WUFDMUMsd0JBQXdCO1lBQ3hCLHNCQUFzQjtZQUN0QixLQUFLO1lBQ0wsSUFBSTtZQUNKLGtDQUFrQztZQUNsQyx3QkFBd0I7WUFDeEIsc0JBQXNCO1lBQ3RCLEtBQUs7WUFDTCxJQUFJO1lBQ0oscUNBQXFDO1lBQ3JDLHdCQUF3QjtZQUN4QixzQkFBc0I7WUFDdEIsS0FBSztZQUNMLElBQUk7WUFDSixpQ0FBaUM7WUFDakMsd0JBQXdCO1lBQ3hCLHNCQUFzQjtZQUN0QixLQUFLO1lBQ0wsSUFBSTtZQUNKLDBDQUEwQztZQUMxQyx3QkFBd0I7WUFDeEIsc0JBQXNCO1lBQ3RCLEtBQUs7WUFDTCxJQUFJO1lBQ0osaUNBQWlDO1lBQ2pDLHdCQUF3QjtZQUN4QixzQkFBc0I7WUFDdEIsS0FBSztZQUNMLElBQUk7WUFDSix3Q0FBd0M7WUFDeEMsd0JBQXdCO1lBQ3hCLHNCQUFzQjtZQUN0QixLQUFLO1lBQ0wsSUFBSTtZQUNKLCtCQUErQjtZQUMvQix3QkFBd0I7WUFDeEIsc0JBQXNCO1lBQ3RCLEtBQUs7WUFDTCxJQUFJO1lBQ0osNERBQTREO1lBQzVELHdCQUF3QjtZQUN4QixzQkFBc0I7WUFDdEIsS0FBSztZQUNMLElBQUk7WUFDSixnQ0FBZ0M7WUFDaEMsd0JBQXdCO1lBQ3hCLHNCQUFzQjtZQUN0QixLQUFLO1lBQ0wsSUFBSTtZQUNKLCtCQUErQjtZQUMvQix3QkFBd0I7WUFDeEIsc0JBQXNCO1lBQ3RCLEtBQUs7WUFDTCxJQUFJO1lBQ0osNkNBQTZDO1lBQzdDLHlCQUF5QjtZQUN6QixzQkFBc0I7WUFDdEIsS0FBSztZQUNMLElBQUk7WUFDSixtQ0FBbUM7WUFDbkMseUJBQXlCO1lBQ3pCLHNCQUFzQjtZQUN0QixLQUFLO1lBQ0wsSUFBSTtZQUNKLDJDQUEyQztZQUMzQyx5QkFBeUI7WUFDekIsc0JBQXNCO1lBQ3RCLEtBQUs7WUFDTCxJQUFJO1lBQ0osK0NBQStDO1lBQy9DLHlCQUF5QjtZQUN6QixzQkFBc0I7WUFDdEIsS0FBSztZQUNMLElBQUk7WUFDSixzQ0FBc0M7WUFDdEMseUJBQXlCO1lBQ3pCLHNCQUFzQjtZQUN0QixLQUFLO1lBQ0wsSUFBSTtZQUNKLDhDQUE4QztZQUM5Qyx3QkFBd0I7WUFDeEIsc0JBQXNCO1lBQ3RCLEtBQUs7WUFDTCxJQUFJO1lBQ0osNkNBQTZDO1lBQzdDLHdCQUF3QjtZQUN4QixzQkFBc0I7WUFDdEIsS0FBSztZQUNMLElBQUk7WUFDSixtQ0FBbUM7WUFDbkMsd0JBQXdCO1lBQ3hCLHNCQUFzQjtZQUN0QixLQUFLO1lBQ0wsSUFBSTtZQUNKLG1DQUFtQztZQUNuQyx3QkFBd0I7WUFDeEIsc0JBQXNCO1lBQ3RCLEtBQUs7WUFDTCxJQUFJO1lBQ0osbUNBQW1DO1lBQ25DLHdCQUF3QjtZQUN4QixzQkFBc0I7WUFDdEIsS0FBSztZQUNMLElBQUk7WUFDSixvQ0FBb0M7WUFDcEMseUJBQXlCO1lBQ3pCLHNCQUFzQjtZQUN0QixLQUFLO1lBQ0wsSUFBSTtZQUNKLG9DQUFvQztZQUNwQyx5QkFBeUI7WUFDekIsc0JBQXNCO1lBQ3RCLEtBQUs7WUFDTCxJQUFJO1lBQ0osaUNBQWlDO1lBQ2pDLHdCQUF3QjtZQUN4QixzQkFBc0I7WUFDdEIsSUFBSTtTQUNMLENBQUM7UUFDTSxvQkFBZSxHQUFHLEVBQUUsQ0FBQztRQUM3QixtQkFBYyxHQUFHLEVBQUUsQ0FBQztRQUNiLHdCQUFtQixHQUFHLEtBQUssQ0FBQztRQUtqQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3hCLElBQUksSUFBSSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ3ZDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUM5QixDQUFDO2FBQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyw0Q0FBNEM7WUFDbEUsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMxRSxDQUFDO2FBQU0sQ0FBQztZQUNOLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBQ3pCLENBQUM7UUFDRCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxFQUFRLENBQUM7UUFDL0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLEtBQUssRUFBVSxDQUFDO1FBQ3pDLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM1QyxDQUFDO0lBRUQsT0FBTztRQUNMLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3hDLENBQUM7SUFDSCxDQUFDO0lBRUQsY0FBYyxDQUFDLEtBQVU7UUFDdkIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztZQUMxQixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksS0FBSyxFQUFRLENBQUM7UUFDakMsQ0FBQztRQUNELG9JQUFvSTtRQUNwSSxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEQsS0FBSyxJQUFJLElBQUksSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ3BDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDakMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ3RCLG9DQUFvQztZQUN0QyxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxhQUFhLENBQUMsS0FBYztRQUMxQixJQUFJLEtBQUssRUFBRSxDQUFDO1lBQ1YsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQy9DLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksS0FBSyxFQUFFLENBQUM7b0JBQ3JDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxJQUFJLENBQUM7b0JBQ2hDLE9BQU87Z0JBQ1QsQ0FBQztZQUNILENBQUM7UUFDSCxDQUFDO1FBQ0QsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEtBQUssQ0FBQztJQUNuQyxDQUFDO0lBRUQsU0FBUyxDQUFDLEdBQVc7UUFDbkIsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDO0lBRUQsa0JBQWtCO1FBRWhCLHdFQUF3RTtRQUN4RSw4RkFBOEY7UUFFOUYsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUM3QixNQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDN0MsSUFBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDO1FBQ2hCLE1BQU0sV0FBVyxHQUFHLEdBQUcsRUFBRTtZQUN2QixJQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQy9CLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDO3FCQUN2RSxTQUFTLENBQ1IsS0FBSyxDQUFDLEVBQUU7Z0JBQ1IsQ0FBQyxFQUNELEtBQUssQ0FBQyxFQUFFO2dCQUNSLENBQUMsRUFDRCxHQUFHLEVBQUU7b0JBQ0gsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFDckIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxtQ0FBbUMsRUFDaEUsU0FBUyxFQUFFLHNCQUFzQixDQUFDLENBQUM7Z0JBQ3ZDLENBQUMsQ0FDRixDQUFDO1lBQ04sQ0FBQztRQUNILENBQUMsQ0FBQTtRQUNELFdBQVcsRUFBRSxDQUFDO0lBQ2hCLENBQUM7OEdBbFBVLFdBQVcsa0JBcUtaLGVBQWU7a0dBcktkLFdBQVcsNkNBSlg7WUFDVCxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsNEJBQTRCLEVBQUU7U0FDdkUsb0lDbkNILDRpR0EyRUs7OzJGRHRDUSxXQUFXO2tCQVh2QixTQUFTOytCQUNFLG9CQUFvQixhQU1uQjt3QkFDVCxFQUFFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxRQUFRLEVBQUUsNEJBQTRCLEVBQUU7cUJBQ3ZFOzswQkF1S0UsTUFBTTsyQkFBQyxlQUFlO2lHQWpLQSxVQUFVO3NCQUFsQyxTQUFTO3VCQUFDLFlBQVkiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuLypcclxuICBUaGlzIHByb2dyYW0gYW5kIHRoZSBhY2NvbXBhbnlpbmcgbWF0ZXJpYWxzIGFyZVxyXG4gIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRWNsaXBzZSBQdWJsaWMgTGljZW5zZSB2Mi4wIHdoaWNoIGFjY29tcGFuaWVzXHJcbiAgdGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXHJcbiAgXHJcbiAgU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcclxuICBcclxuICBDb3B5cmlnaHQgQ29udHJpYnV0b3JzIHRvIHRoZSBab3dlIFByb2plY3QuXHJcbiovXHJcbmltcG9ydCB7IENvbXBvbmVudCwgSW5qZWN0LCBFdmVudEVtaXR0ZXIsIFZpZXdDaGlsZCwgRWxlbWVudFJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBNQVRfRElBTE9HX0RBVEEgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xyXG5pbXBvcnQgeyBNYXRTbmFja0JhciB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3NuYWNrLWJhcic7XHJcbmltcG9ydCB7IFVwbG9hZGVyU2VydmljZSB9IGZyb20gJy4uLy4uL3NlcnZpY2VzL3VwbG9hZGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBkZWZhdWx0U25hY2tiYXJPcHRpb25zIH0gZnJvbSAnLi4vLi4vc2hhcmVkL3NuYWNrYmFyLW9wdGlvbnMnO1xyXG5pbXBvcnQgeyBFcnJvclN0YXRlTWF0Y2hlciwgU2hvd09uRGlydHlFcnJvclN0YXRlTWF0Y2hlciB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL2NvcmUnO1xyXG5pbXBvcnQgeyBGb3JtQ29udHJvbCwgRm9ybUdyb3VwRGlyZWN0aXZlLCBOZ0Zvcm0gfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XHJcblxyXG4vKiogRXJyb3Igd2hlbiBpbnZhbGlkIGNvbnRyb2wgaXMgZGlydHksIHRvdWNoZWQsIG9yIHN1Ym1pdHRlZC4gKi9cclxuZXhwb3J0IGNsYXNzIE15RXJyb3JTdGF0ZU1hdGNoZXIgaW1wbGVtZW50cyBFcnJvclN0YXRlTWF0Y2hlciB7XHJcbiAgaXNFcnJvclN0YXRlKGNvbnRyb2w6IEZvcm1Db250cm9sIHwgbnVsbCwgZm9ybTogRm9ybUdyb3VwRGlyZWN0aXZlIHwgTmdGb3JtIHwgbnVsbCk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3QgaXNTdWJtaXR0ZWQgPSBmb3JtICYmIGZvcm0uc3VibWl0dGVkO1xyXG4gICAgcmV0dXJuICEhKGNvbnRyb2wgJiYgY29udHJvbC5pbnZhbGlkICYmIChjb250cm9sLmRpcnR5IHx8IGNvbnRyb2wudG91Y2hlZCB8fCBpc1N1Ym1pdHRlZCkpO1xyXG4gIH1cclxufVxyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICd1cGxvYWQtZmlsZXMtbW9kYWwnLFxyXG4gIHRlbXBsYXRlVXJsOiAnLi91cGxvYWQtZmlsZXMtbW9kYWwuY29tcG9uZW50Lmh0bWwnLFxyXG4gIHN0eWxlVXJsczogW1xyXG4gICAgJy4vdXBsb2FkLWZpbGVzLW1vZGFsLmNvbXBvbmVudC5zY3NzJyxcclxuICAgICcuLi8uLi9zaGFyZWQvbW9kYWwuY29tcG9uZW50LnNjc3MnXHJcbiAgXSxcclxuICBwcm92aWRlcnM6IFtcclxuICAgIHsgcHJvdmlkZTogRXJyb3JTdGF0ZU1hdGNoZXIsIHVzZUNsYXNzOiBTaG93T25EaXJ0eUVycm9yU3RhdGVNYXRjaGVyIH1cclxuICBdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBVcGxvYWRNb2RhbCB7XHJcblxyXG4gIHB1YmxpYyBmb2xkZXJQYXRoID0gXCJcIjtcclxuICBwdWJsaWMgb25VcGxvYWQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XHJcbiAgQFZpZXdDaGlsZCgnZmlsZVVwbG9hZCcpIGZpbGVVcGxvYWQ6IEVsZW1lbnRSZWY7XHJcbiAgcHVibGljIGZpbGVzOiBBcnJheTxGaWxlPjtcclxuICBwcml2YXRlIGZpbGVFbmNvZGluZ3M6IEFycmF5PHN0cmluZz47XHJcbiAgbWF0Y2hlciA9IG5ldyBNeUVycm9yU3RhdGVNYXRjaGVyKCk7XHJcbiAgZW5jb2RpbmdzID0gW1xyXG4gICAgLy8geyBUT0RPOiBBUEkgQnVnIC0gVXBsb2FkIGZhaWxzIHdpdGggQmluYXJ5IGFzIHRhcmdldCBmb3Igbm93XHJcbiAgICAvLyAgICAgbmFtZTogJ0JJTkFSWScsXHJcbiAgICAvLyAgICAgdmFsdWU6ICdCSU5BUlknLFxyXG4gICAgLy8gICAgIHNlbGVjdGVkOiB0cnVlXHJcbiAgICAvLyB9LFxyXG4gICAge1xyXG4gICAgICBuYW1lOiAnVVRGLTgnLFxyXG4gICAgICB2YWx1ZTogJ1VURi04JyxcclxuICAgICAgc2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICB9LFxyXG4gICAge1xyXG4gICAgICBuYW1lOiAnSVNPLTg4NTktMScsXHJcbiAgICAgIHZhbHVlOiAnSVNPLTg4NTktMScsXHJcbiAgICAgIHNlbGVjdGVkOiBmYWxzZVxyXG4gICAgfSxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ0ludGVybmF0aW9uYWwgRUJDRElDIDEwNDcnLFxyXG4gICAgICB2YWx1ZTogJ0lCTS0xMDQ3JyxcclxuICAgICAgc2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICB9LFxyXG4gICAgLy8geyBUT0RPOiBUaGVzZSBlbmNvZGluZ3MgZG9uJ3Qgd29yayB5ZXQgaW4gQVBJXHJcbiAgICAvLyAgICAgbmFtZTogJ0dlcm1hbi9BdXN0cmlhbiBFQkNESUMgMjczJyxcclxuICAgIC8vICAgICB2YWx1ZTogJ0lCTS0yNzMnLFxyXG4gICAgLy8gICAgIHNlbGVjdGVkOiBmYWxzZVxyXG4gICAgLy8gfSxcclxuICAgIC8vIHtcclxuICAgIC8vICAgICBuYW1lOiAnRGFuaXNoL05vcndlZ2lhbiBFQkNESUMgMjc3JyxcclxuICAgIC8vICAgICB2YWx1ZTogJ0lCTS0yNzcnLFxyXG4gICAgLy8gICAgIHNlbGVjdGVkOiBmYWxzZVxyXG4gICAgLy8gfSxcclxuICAgIC8vIHtcclxuICAgIC8vICAgICBuYW1lOiAnRmlubmlzaC9Td2VkaXNoIEVCQ0RJQyAyNzgnLFxyXG4gICAgLy8gICAgIHZhbHVlOiAnSUJNLTI3OCcsXHJcbiAgICAvLyAgICAgc2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAvLyB9LFxyXG4gICAgLy8ge1xyXG4gICAgLy8gICAgIG5hbWU6ICdJdGFsaWFuIEVCQ0RJQyAyNzgnLFxyXG4gICAgLy8gICAgIHZhbHVlOiAnSUJNLTI3OCcsXHJcbiAgICAvLyAgICAgc2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAvLyB9LFxyXG4gICAgLy8ge1xyXG4gICAgLy8gICAgIG5hbWU6ICdKYXBhbmVzZSBLYXRha2FuYSAyOTAnLFxyXG4gICAgLy8gICAgIHZhbHVlOiAnSUJNLTI5MCcsXHJcbiAgICAvLyAgICAgc2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAvLyB9LFxyXG4gICAgLy8ge1xyXG4gICAgLy8gICAgIG5hbWU6ICdGcmVuY2ggRUJDRElDIDI5NycsXHJcbiAgICAvLyAgICAgdmFsdWU6ICdJQk0tMjk3JyxcclxuICAgIC8vICAgICBzZWxlY3RlZDogZmFsc2VcclxuICAgIC8vIH0sXHJcbiAgICAvLyB7XHJcbiAgICAvLyAgICAgbmFtZTogJ0FyYWJpYyAodHlwZSA0KSBFQkNESUMgNDIwJyxcclxuICAgIC8vICAgICB2YWx1ZTogJ0lCTS00MjAnLFxyXG4gICAgLy8gICAgIHNlbGVjdGVkOiBmYWxzZVxyXG4gICAgLy8gfSxcclxuICAgIC8vIHtcclxuICAgIC8vICAgICBuYW1lOiAnSGVicmV3IEVCQ0RJQyA0MjQnLFxyXG4gICAgLy8gICAgIHZhbHVlOiAnSUJNLTQyNCcsXHJcbiAgICAvLyAgICAgc2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAvLyB9LFxyXG4gICAgLy8ge1xyXG4gICAgLy8gICAgIG5hbWU6ICdJbnRlcm5hdGlvbmFsIEVCQ0RJQyA1MDAnLFxyXG4gICAgLy8gICAgIHZhbHVlOiAnSUJNLTUwMCcsXHJcbiAgICAvLyAgICAgc2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAvLyB9LFxyXG4gICAgLy8ge1xyXG4gICAgLy8gICAgIG5hbWU6ICdUaGFpIEVCQ0RJQyA4MzgnLFxyXG4gICAgLy8gICAgIHZhbHVlOiAnSUJNLTgzOCcsXHJcbiAgICAvLyAgICAgc2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAvLyB9LFxyXG4gICAgLy8ge1xyXG4gICAgLy8gICAgIG5hbWU6ICdDcm9hdC9DemVjaC9Qb2xpc2gvU2VyYmlhbi9TbG92YWsgRUJDRElDIDg3MCcsXHJcbiAgICAvLyAgICAgdmFsdWU6ICdJQk0tODcwJyxcclxuICAgIC8vICAgICBzZWxlY3RlZDogZmFsc2VcclxuICAgIC8vIH0sXHJcbiAgICAvLyB7XHJcbiAgICAvLyAgICAgbmFtZTogJ0dyZWVrIEVCQ0RJQyA4NzUnLFxyXG4gICAgLy8gICAgIHZhbHVlOiAnSUJNLTg3NScsXHJcbiAgICAvLyAgICAgc2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAvLyB9LFxyXG4gICAgLy8ge1xyXG4gICAgLy8gICAgIG5hbWU6ICdVcmR1IEVCQ0RJQyA5MTgnLFxyXG4gICAgLy8gICAgIHZhbHVlOiAnSUJNLTkxOCcsXHJcbiAgICAvLyAgICAgc2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAvLyB9LFxyXG4gICAgLy8ge1xyXG4gICAgLy8gICAgIG5hbWU6ICdDeXJpbGxpYyhSdXNzaWFuKSBFQkNESUMgMTAyNScsXHJcbiAgICAvLyAgICAgdmFsdWU6ICdJQk0tMTAyNScsXHJcbiAgICAvLyAgICAgc2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAvLyB9LFxyXG4gICAgLy8ge1xyXG4gICAgLy8gICAgIG5hbWU6ICdUdXJraXNoIEVCQ0RJQyAxMDI2JyxcclxuICAgIC8vICAgICB2YWx1ZTogJ0lCTS0xMDI2JyxcclxuICAgIC8vICAgICBzZWxlY3RlZDogZmFsc2VcclxuICAgIC8vIH0sXHJcbiAgICAvLyB7XHJcbiAgICAvLyAgICAgbmFtZTogJ0ZhcnNpIEJpbGluZ3VhbCBFQkNESUMgMTA5NycsXHJcbiAgICAvLyAgICAgdmFsdWU6ICdJQk0tMTA5NycsXHJcbiAgICAvLyAgICAgc2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAvLyB9LFxyXG4gICAgLy8ge1xyXG4gICAgLy8gICAgIG5hbWU6ICdCYWx0aWMgTXVsdGlsaW5ndWFsIEVCQ0RJQyAxMTEyJyxcclxuICAgIC8vICAgICB2YWx1ZTogJ0lCTS0xMTEyJyxcclxuICAgIC8vICAgICBzZWxlY3RlZDogZmFsc2VcclxuICAgIC8vIH0sXHJcbiAgICAvLyB7XHJcbiAgICAvLyAgICAgbmFtZTogJ0RldmFuYWdhcmkgRUJDRElDIDExMzcnLFxyXG4gICAgLy8gICAgIHZhbHVlOiAnSUJNLTExMzcnLFxyXG4gICAgLy8gICAgIHNlbGVjdGVkOiBmYWxzZVxyXG4gICAgLy8gfSxcclxuICAgIC8vIHtcclxuICAgIC8vICAgICBuYW1lOiAnQ2hpbmVzZSBUcmFkaXRpb25hbCBFQkNESUMgOTM3JyxcclxuICAgIC8vICAgICB2YWx1ZTogJ0lCTS05MzcnLFxyXG4gICAgLy8gICAgIHNlbGVjdGVkOiBmYWxzZVxyXG4gICAgLy8gfSxcclxuICAgIC8vIHtcclxuICAgIC8vICAgICBuYW1lOiAnQ2hpbmVzZSBTaW1wbGlmaWVkIEVCQ0RJQyA5MzUnLFxyXG4gICAgLy8gICAgIHZhbHVlOiAnSUJNLTkzNScsXHJcbiAgICAvLyAgICAgc2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAvLyB9LFxyXG4gICAgLy8ge1xyXG4gICAgLy8gICAgIG5hbWU6ICdKYXBhbmVzZSBFQkNESUMgOTMwJyxcclxuICAgIC8vICAgICB2YWx1ZTogJ0lCTS05MzAnLFxyXG4gICAgLy8gICAgIHNlbGVjdGVkOiBmYWxzZVxyXG4gICAgLy8gfSxcclxuICAgIC8vIHtcclxuICAgIC8vICAgICBuYW1lOiAnSmFwYW5lc2UgRUJDRElDIDkzMScsXHJcbiAgICAvLyAgICAgdmFsdWU6ICdJQk0tOTMxJyxcclxuICAgIC8vICAgICBzZWxlY3RlZDogZmFsc2VcclxuICAgIC8vIH0sXHJcbiAgICAvLyB7XHJcbiAgICAvLyAgICAgbmFtZTogJ0phcGFuZXNlIEVCQ0RJQyA5MzknLFxyXG4gICAgLy8gICAgIHZhbHVlOiAnSUJNLTkzOScsXHJcbiAgICAvLyAgICAgc2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAvLyB9LFxyXG4gICAgLy8ge1xyXG4gICAgLy8gICAgIG5hbWU6ICdKYXBhbmVzZSBFQkNESUMgMTM5MCcsXHJcbiAgICAvLyAgICAgdmFsdWU6ICdJQk0tMTM5MCcsXHJcbiAgICAvLyAgICAgc2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAvLyB9LFxyXG4gICAgLy8ge1xyXG4gICAgLy8gICAgIG5hbWU6ICdKYXBhbmVzZSBFQkNESUMgMTM5OScsXHJcbiAgICAvLyAgICAgdmFsdWU6ICdJQk0tMTM5OScsXHJcbiAgICAvLyAgICAgc2VsZWN0ZWQ6IGZhbHNlXHJcbiAgICAvLyB9LFxyXG4gICAgLy8ge1xyXG4gICAgLy8gICAgIG5hbWU6ICdLb3JlYW4gRUJDRElDIDkzMycsXHJcbiAgICAvLyAgICAgdmFsdWU6ICdJQk0tOTMzJyxcclxuICAgIC8vICAgICBzZWxlY3RlZDogZmFsc2VcclxuICAgIC8vIH1cclxuICBdO1xyXG4gIHByaXZhdGUgZmlsdGVyZWRPcHRpb25zID0gW107XHJcbiAgc2VsZWN0ZWRPcHRpb24gPSBcIlwiO1xyXG4gIHB1YmxpYyBzZWxlY3RlZE9wdGlvblZhbGlkID0gZmFsc2U7XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgQEluamVjdChNQVRfRElBTE9HX0RBVEEpIGRhdGEsIHByaXZhdGUgdXBsb2FkZXI6IFVwbG9hZGVyU2VydmljZSwgcHJpdmF0ZSBzbmFja0JhcjogTWF0U25hY2tCYXJcclxuICApIHtcclxuICAgIGNvbnN0IG5vZGUgPSBkYXRhLmV2ZW50O1xyXG4gICAgaWYgKG5vZGUuZGF0YSAmJiBub2RlLmRhdGEgPT0gXCJGb2xkZXJcIikge1xyXG4gICAgICB0aGlzLmZvbGRlclBhdGggPSBub2RlLnBhdGg7XHJcbiAgICB9IGVsc2UgaWYgKG5vZGUuZGF0YSkgeyAvLyBUYWtlcyBmb2xkZXIgbmFtZSBmcm9tIGZvbGRlciBuYW1lICsgcGF0aFxyXG4gICAgICB0aGlzLmZvbGRlclBhdGggPSBub2RlLnBhdGgucmVwbGFjZSgvXFwvJC8sICcnKS5yZXBsYWNlKC9cXC9bXlxcL10rJC8sICcnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZm9sZGVyUGF0aCA9IG5vZGU7XHJcbiAgICB9XHJcbiAgICB0aGlzLmZpbGVzID0gbmV3IEFycmF5PEZpbGU+KCk7XHJcbiAgICB0aGlzLmZpbGVFbmNvZGluZ3MgPSBuZXcgQXJyYXk8c3RyaW5nPigpO1xyXG4gICAgdGhpcy5maWx0ZXJlZE9wdGlvbnMgPSB0aGlzLmZpbGVFbmNvZGluZ3M7XHJcbiAgfVxyXG5cclxuICBhZGRGaWxlKCkge1xyXG4gICAgaWYgKHRoaXMuZmlsZVVwbG9hZCkge1xyXG4gICAgICB0aGlzLmZpbGVVcGxvYWQubmF0aXZlRWxlbWVudC5jbGljaygpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgb25GaWxlVXBsb2FkZWQoZXZlbnQ6IGFueSk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuZmlsZXMubGVuZ3RoID4gMCkge1xyXG4gICAgICB0aGlzLmZpbGVzID0gbmV3IEFycmF5PEZpbGU+KCk7XHJcbiAgICB9XHJcbiAgICAvLyBUT0RPOiBUaGlzIEFycmF5IGZpbHRlciBtZXRob2QgaXMgYWxyZWFkeSBzZXQgdXAgZm9yIG11bHRpLWZpbGUgc2VsZWN0LiBOb3cgd2UganVzdCBuZWVkIHRvIGFkZCBhIHF1ZXVlIGZvciBtdWx0aXBsZSBmaWxlcyB1cGxvYWRcclxuICAgIGNvbnN0IG5hbWVzID0gQXJyYXkuZnJvbSh0aGlzLmZpbGVzLCBmaWxlID0+IGZpbGUubmFtZSk7XHJcbiAgICBmb3IgKGxldCBmaWxlIG9mIGV2ZW50LnRhcmdldC5maWxlcykge1xyXG4gICAgICBpZiAoIShuYW1lcy5pbmNsdWRlcyhmaWxlLm5hbWUpKSkge1xyXG4gICAgICAgIHRoaXMuZmlsZXMucHVzaChmaWxlKTtcclxuICAgICAgICAvL3RoaXMuZmlsZUVuY29kaW5ncy5wdXNoKCdCSU5BUlknKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgb25WYWx1ZUNoYW5nZSh2YWx1ZT86IHN0cmluZyk6IHZvaWQge1xyXG4gICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5lbmNvZGluZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAodGhpcy5lbmNvZGluZ3NbaV0udmFsdWUgPT0gdmFsdWUpIHtcclxuICAgICAgICAgIHRoaXMuc2VsZWN0ZWRPcHRpb25WYWxpZCA9IHRydWU7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICB0aGlzLnNlbGVjdGVkT3B0aW9uVmFsaWQgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gIGRpc3BsYXlGbih2YWw6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gdmFsO1xyXG4gIH1cclxuXHJcbiAgdXBsb2FkSGFuZGxlclNldHVwKCk6IHZvaWQge1xyXG5cclxuICAgIC8vIFdlIHNob3VsZCBtYWtlIGEgcXVldWUgdGhhdCBob2xkcyB0aGUgbGlzdCBvZiBmaWxlcyB3ZSB3aXNoIHRvIHVwbG9hZFxyXG4gICAgLy8gVGhhdCBxdWV1ZSBzaG91bGQgbGlrZWx5IGJlIHN0b3JlZCBpbiBhIHNlcnZpY2UgKHByb2JhYmx5IHRoZSB1cGxvYWRlciBzZXJ2aWNlIHRoYXQgZXhpc3RzKVxyXG5cclxuICAgIGNvbnN0IGZpbGVzQ29weSA9IHRoaXMuZmlsZXM7XHJcbiAgICBjb25zdCBmaWxlRW5jb2RpbmdzQ29weSA9IHRoaXMuZmlsZUVuY29kaW5ncztcclxuICAgIGxldCBmaWxlSWR4ID0gMDtcclxuICAgIGNvbnN0IHVwbG9hZEZpbGVzID0gKCkgPT4ge1xyXG4gICAgICBpZiAoZmlsZUlkeCA8IGZpbGVzQ29weS5sZW5ndGgpIHtcclxuICAgICAgICBjb25zdCBmaWxlID0gZmlsZXNDb3B5W2ZpbGVJZHhdO1xyXG4gICAgICAgIHRoaXMudXBsb2FkZXIuY2h1bmtBbmRTZW5kRmlsZShmaWxlLCB0aGlzLmZvbGRlclBhdGgsIHRoaXMuc2VsZWN0ZWRPcHRpb24pXHJcbiAgICAgICAgICAuc3Vic2NyaWJlKFxyXG4gICAgICAgICAgICB2YWx1ZSA9PiB7IC8vIFRPRE86IEZ1dHVyZSB1cGxvYWQgcHJvZ3Jlc3MgYmFyXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yID0+IHsgLy8gRXJyb3IgY2F1Z2h0IHVwc3RyZWFtIGluIHNlcnZpY2VcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgKCkgPT4ge1xyXG4gICAgICAgICAgICAgIHRoaXMub25VcGxvYWQuZW1pdCgpO1xyXG4gICAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbihmaWxlLm5hbWUgKyAnIGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSB1cGxvYWRlZC4gJyxcclxuICAgICAgICAgICAgICAgICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIHVwbG9hZEZpbGVzKCk7XHJcbiAgfVxyXG5cclxufVxyXG5cclxuLypcclxuICBUaGlzIHByb2dyYW0gYW5kIHRoZSBhY2NvbXBhbnlpbmcgbWF0ZXJpYWxzIGFyZVxyXG4gIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRWNsaXBzZSBQdWJsaWMgTGljZW5zZSB2Mi4wIHdoaWNoIGFjY29tcGFuaWVzXHJcbiAgdGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXHJcbiAgXHJcbiAgU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcclxuICBcclxuICBDb3B5cmlnaHQgQ29udHJpYnV0b3JzIHRvIHRoZSBab3dlIFByb2plY3QuXHJcbiovXHJcbiIsIjwhLS1cblRoaXMgcHJvZ3JhbSBhbmQgdGhlIGFjY29tcGFueWluZyBtYXRlcmlhbHMgYXJlXG5tYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEVjbGlwc2UgUHVibGljIExpY2Vuc2UgdjIuMCB3aGljaCBhY2NvbXBhbmllc1xudGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXG5cblNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBFUEwtMi4wXG5cbkNvcHlyaWdodCBDb250cmlidXRvcnMgdG8gdGhlIFpvd2UgUHJvamVjdC5cbi0tPlxuPHpsdXgtdGFiLXRyYXA+PC96bHV4LXRhYi10cmFwPlxuPGRpdiBjbGFzcz1cInBhZGRpbmctMVwiPlxuICA8ZGl2IGNsYXNzPVwiZC1mbGV4XCI+XG4gICAgPGRpdiBjbGFzcz1cIm1vZGFsLWljb24tY29udGFpbmVyXCI+XG4gICAgICA8IS0tIEZBIEljb24gaXMgZGV0ZXJtaW5lZCBieSBjbGFzcyBuYW1lLCBzbyB3ZSBoYXJkY29kZSB0aGUgc3R5bGUgaGVyZSAtLT5cbiAgICAgIDxtYXQtaWNvbiBzdHlsZT1cImZvbnQtc2l6ZTogMzBweDsgcG9zaXRpb246IGFic29sdXRlO1wiPmNsb3VkX3VwbG9hZDwvbWF0LWljb24+XG4gICAgPC9kaXY+XG4gICAgPGRpdj5cbiAgICAgIDwhLS0gSW50ZW50aW9uYWwgbGF6eSByZWN5Y2xpbmcgb2YgXCJjcmVhdGVcIiBtb2RhbCBDU1MsIFRPRE86IG1vdmUgdG8gc2hhcmVkL21vZGFsIGNzcyAtLT5cbiAgICAgIDxoMiBtYXQtZGlhbG9nLXRpdGxlIGNsYXNzPVwibW9kYWwtbWF0LWhlYWRlclwiPlVwbG9hZCBGaWxlcyBpbiB7e2ZvbGRlclBhdGh9fTwvaDI+XG4gICAgPC9kaXY+XG4gICAgPGRpdj5cbiAgICAgIDxidXR0b24gbWF0LWRpYWxvZy1jbG9zZSBjbGFzcz1cImNsb3NlLWRpYWxvZy1idG5cIj48aSBjbGFzcz1cImZhIGZhLWNsb3NlXCI+PC9pPjwvYnV0dG9uPlxuICAgIDwvZGl2PlxuXG4gIDwvZGl2PlxuICA8YnV0dG9uIG1hdC1idXR0b24gY2xhc3M9XCJtb2RhbC1tYXQtYnV0dG9uIGFkZFwiIChjbGljayk9XCJhZGRGaWxlKClcIj5TZWxlY3QgRmlsZTwvYnV0dG9uPlxuXG4gIDxkaXYgc3R5bGU9XCJtYXgtaGVpZ2h0OiA0MDBweDsgb3ZlcmZsb3cteTpzY3JvbGw7XCI+XG4gICAgPHVsPlxuICAgICAgQGZvciAoZmlsZSBvZiBmaWxlczsgdHJhY2sgZmlsZTsgbGV0IGkgPSAkaW5kZXgpIHtcbiAgICAgIDxsaSBjbGFzcz1cIlwiPlxuICAgICAgICA8bGFiZWw+XG4gICAgICAgICAge3sgZmlsZS5uYW1lIH19XG4gICAgICAgIDwvbGFiZWw+XG4gICAgICAgIDxtYXQtZm9ybS1maWVsZCBhcHBlYXJhbmNlPVwiZmlsbFwiIHN0eWxlPVwibWFyZ2luLWxlZnQ6IDM2cHg7XCI+XG4gICAgICAgICAgPGlucHV0IG1hdElucHV0IHJlcXVpcmVkIHR5cGU9XCJ0ZXh0XCIgWyhuZ01vZGVsKV09XCJzZWxlY3RlZE9wdGlvblwiIChuZ01vZGVsQ2hhbmdlKT1cIm9uVmFsdWVDaGFuZ2UoJGV2ZW50KVwiXG4gICAgICAgICAgICBbbWF0QXV0b2NvbXBsZXRlXT1cImF1dG9cIiBbZXJyb3JTdGF0ZU1hdGNoZXJdPVwibWF0Y2hlclwiICNlbmNvZGluZ0lucHV0PVwibmdNb2RlbFwiXG4gICAgICAgICAgICBwbGFjZWhvbGRlcj1cIlNlbGVjdCB0YXJnZXQgZW5jb2RpbmdcIj5cbiAgICAgICAgICA8bWF0LWF1dG9jb21wbGV0ZSBhdXRvQWN0aXZlRmlyc3RPcHRpb24gI2F1dG89XCJtYXRBdXRvY29tcGxldGVcIiBbZGlzcGxheVdpdGhdPVwiZGlzcGxheUZuXCI+XG4gICAgICAgICAgICBAZm9yIChvcHRpb24gb2YgZW5jb2RpbmdzOyB0cmFjayBvcHRpb24pIHtcbiAgICAgICAgICAgIDxtYXQtb3B0aW9uIFt2YWx1ZV09XCJvcHRpb24udmFsdWVcIj5cbiAgICAgICAgICAgICAge3sgb3B0aW9uLm5hbWUgfX1cbiAgICAgICAgICAgIDwvbWF0LW9wdGlvbj5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICA8L21hdC1hdXRvY29tcGxldGU+XG4gICAgICAgICAgQGlmIChlbmNvZGluZ0lucHV0Lmhhc0Vycm9yKCdyZXF1aXJlZCcpKSB7XG4gICAgICAgICAgPG1hdC1lcnJvcj5cbiAgICAgICAgICAgIEVuY29kaW5nIGlzIHJlcXVpcmVkXG4gICAgICAgICAgPC9tYXQtZXJyb3I+XG4gICAgICAgICAgfVxuICAgICAgICA8L21hdC1mb3JtLWZpZWxkPlxuICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly93d3cuaWJtLmNvbS9kb2NzL2VuL3pvcy8yLjEuMD90b3BpYz1jY3NpZHMtZW5jb2Rpbmctc2NoZW1lXCIgdGFyZ2V0PVwiX2JsYW5rXCI+XG4gICAgICAgICAgPGkgY2xhc3M9XCJmYSBmYS1xdWVzdGlvbi1jaXJjbGUgZGF0YXNldC1wcm9wZXJ0aWVzLXF1ZXN0aW9uLWNpcmNsZVwiPjwvaT5cbiAgICAgICAgPC9hPlxuICAgICAgPC9saT5cbiAgICAgIH1cbiAgICA8L3VsPlxuICA8L2Rpdj5cblxuICA8bWF0LWRpYWxvZy1hY3Rpb25zPlxuICAgIDxidXR0b24gbWF0LWJ1dHRvbiBtYXQtZGlhbG9nLWNsb3NlIGNsYXNzPVwibW9kYWwtbWF0LWJ1dHRvbiBjcmVhdGVcIiAoY2xpY2spPVwidXBsb2FkSGFuZGxlclNldHVwKClcIlxuICAgICAgW2Rpc2FibGVkXT1cIiFzZWxlY3RlZE9wdGlvblZhbGlkXCI+VXBsb2FkPC9idXR0b24+XG4gICAgPCEtLSBUaGUgbWF0LWRpYWxvZy1jbG9zZSBkaXJlY3RpdmUgb3B0aW9uYWxseSBhY2NlcHRzIGEgdmFsdWUgYXMgYSByZXN1bHQgZm9yIHRoZSBkaWFsb2cuIC0tPlxuICA8L21hdC1kaWFsb2ctYWN0aW9ucz5cbjwvZGl2PlxuPGlucHV0IHR5cGU9XCJmaWxlXCIgc3R5bGU9XCJkaXNwbGF5OiBub25lXCIgI2ZpbGVVcGxvYWQgKGNoYW5nZSk9XCJvbkZpbGVVcGxvYWRlZCgkZXZlbnQpXCI+XG5cbjwhLS1cbiAgVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcbiAgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcbiAgdGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXG5cbiAgU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcblxuICBDb3B5cmlnaHQgQ29udHJpYnV0b3JzIHRvIHRoZSBab3dlIFByb2plY3QuXG4gIC0tPiJdfQ==