/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomErrorStateMatcher } from '../../shared/error-state-matcher';
import { fileTagList, findFileTagByCodeset } from '../../shared/file-tag';
import { defaultSnackbarOptions } from '../../shared/snackbar-options';
import { finalize } from 'rxjs/operators';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
import * as i2 from "@angular/common/http";
import * as i3 from "@angular/material/snack-bar";
import * as i4 from "@angular/forms";
import * as i5 from "@angular/material/form-field";
import * as i6 from "@angular/material/input";
import * as i7 from "@angular/material/list";
import * as i8 from "@angular/material/button";
import * as i9 from "@angular/material/core";
import * as i10 from "@angular/material/autocomplete";
import * as i11 from "zlux-widgets";
import * as i12 from "@angular/material/slide-toggle";
export class FileTaggingModal {
    constructor(data, dialogRef, http, snackBar) {
        this.dialogRef = dialogRef;
        this.http = http;
        this.snackBar = snackBar;
        this.matcher = new CustomErrorStateMatcher();
        this.recursive = false;
        this.tagOptions = fileTagList;
        this.node = data.node;
        this.name = this.node.name;
        this.isDirectory = this.node.directory;
        this.icon = this.node.icon ? this.node.icon : this.node.collapsedIcon;
        this.title = this.isDirectory ? 'Tag files' : 'Tag file';
        const codeset = this.isDirectory ? 0 : this.node.ccsid;
        this.selectedOption = findFileTagByCodeset(codeset);
        this.filteredOptions = this.tagOptions;
    }
    changeTag() {
        const path = this.node.path;
        const recursive = this.recursive;
        const option = this.selectedOption;
        const type = option.type;
        const codeset = (type === 'text') ? option.codeset : undefined;
        const options = {
            recursive,
            type,
            codeset
        };
        const url = ZoweZLUX.uriBroker.unixFileUri('chtag', path, options);
        const action = (type === 'delete') ? this.http.delete(url) : this.http.post(url, null);
        action.pipe(finalize(() => this.closeDialog())).
            subscribe(_res => this.onTaggingSuccess(path, type, option), err => this.onTaggingFailure(err));
    }
    closeDialog() {
        const needUpdate = this.isDirectory;
        this.dialogRef.close(needUpdate);
    }
    onTaggingSuccess(path, type, option) {
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
    onTaggingFailure(err) {
        let message = 'Failed to change tag(s)';
        if (typeof err.error === 'object' && typeof err.error.error === 'string') {
            message = err.error.error;
        }
        this.snackBar.open(`Error: ${message}.`, 'Dismiss', defaultSnackbarOptions);
    }
    displayFn(option) {
        return option ? option.name : undefined;
    }
    onValueChange(value) {
        if (value) {
            const encoding = (typeof value === 'string') ? value : value.name;
            this.filteredOptions = this.filter(this.tagOptions, encoding);
        }
        else {
            this.filteredOptions = this.tagOptions;
        }
    }
    get isOptionSelected() {
        return typeof this.selectedOption === 'object';
    }
    filter(options, value) {
        const filterValue = value.toLowerCase();
        return options.filter(option => option.name.toLowerCase().includes(filterValue));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FileTaggingModal, deps: [{ token: MAT_DIALOG_DATA }, { token: i1.MatDialogRef }, { token: i2.HttpClient }, { token: i3.MatSnackBar }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: FileTaggingModal, selector: "file-tagging-modal", ngImport: i0, template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"modal-icon-container\">\n      <i class=\"{{icon}} modal-icon\"></i>\n    </div>\n    <div>\n      <h2 mat-dialog-title class=\"modal-mat-header\">{{name}} - File Tagging</h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n  </div>\n  <div class=\"modal-row\">\n    <div class=\"modal-column-full-width\">\n      <mat-list-item>\n        @if (isDirectory) {\n        Tag all files as\n        } @else {\n        Tag file as\n        }\n        <ng-template #file>Tag file as</ng-template>\n        <mat-form-field appearance=\"fill\" style=\"margin-left: 36px;\">\n          <input matInput required type=\"text\" [(ngModel)]=\"selectedOption\" (ngModelChange)=\"onValueChange($event)\"\n            [matAutocomplete]=\"auto\" [errorStateMatcher]=\"matcher\" #encodingInput=\"ngModel\">\n          <mat-autocomplete autoActiveFirstOption #auto=\"matAutocomplete\" [displayWith]=\"displayFn\">\n            @for (option of filteredOptions; track option) {\n            <mat-option [value]=\"option\">\n              {{ option.name }}\n            </mat-option>\n            }\n          </mat-autocomplete>\n          @if (encodingInput.hasError('required')) {\n          <mat-error>\n            Encoding is required\n          </mat-error>\n          }\n        </mat-form-field>\n      </mat-list-item>\n    </div>\n  </div>\n\n  @if (isDirectory) {\n  <div class=\"modal-row\">\n    <div class=\"modal-column\" style=\"width: 40%;\">\n      <mat-list-item>\n        <mat-slide-toggle color=\"primary\" [(ngModel)]=\"recursive\"></mat-slide-toggle>\n      </mat-list-item>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list-item>\n        <div class=\"selectable-text\">Process subdirectories</div>\n      </mat-list-item>\n    </div>\n  </div>\n  }\n\n  <mat-dialog-actions>\n    <button mat-button class=\"modal-mat-button\" (click)=\"changeTag()\" [disabled]=\"!isOptionSelected\">Save</button>\n  </mat-dialog-actions>\n</div>\n<!--\n  This program and the accompanying materials are\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n  SPDX-License-Identifier: EPL-2.0\n\n  Copyright Contributors to the Zowe Project.\n  -->", styles: [".file-tagging-container{padding:1rem}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused{background-color:#fff!important}\n"], dependencies: [{ kind: "directive", type: i4.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i4.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i4.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i4.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "component", type: i5.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i5.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "directive", type: i6.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly"], exportAs: ["matInput"] }, { kind: "component", type: i7.MatListItem, selector: "mat-list-item, a[mat-list-item], button[mat-list-item]", inputs: ["activated"], exportAs: ["matListItem"] }, { kind: "component", type: i8.MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", exportAs: ["matButton"] }, { kind: "component", type: i9.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "component", type: i10.MatAutocomplete, selector: "mat-autocomplete", inputs: ["aria-label", "aria-labelledby", "displayWith", "autoActiveFirstOption", "autoSelectActiveOption", "requireSelection", "panelWidth", "disableRipple", "class", "hideSingleSelectionIndicator"], outputs: ["optionSelected", "opened", "closed", "optionActivated"], exportAs: ["matAutocomplete"] }, { kind: "directive", type: i10.MatAutocompleteTrigger, selector: "input[matAutocomplete], textarea[matAutocomplete]", inputs: ["matAutocomplete", "matAutocompletePosition", "matAutocompleteConnectedTo", "autocomplete", "matAutocompleteDisabled"], exportAs: ["matAutocompleteTrigger"] }, { kind: "component", type: i11.ZluxTabbingComponent, selector: "zlux-tab-trap", inputs: ["hiddenIds", "hiddenPos"] }, { kind: "component", type: i12.MatSlideToggle, selector: "mat-slide-toggle", inputs: ["name", "id", "labelPosition", "aria-label", "aria-labelledby", "aria-describedby", "required", "color", "disabled", "disableRipple", "tabIndex", "checked", "hideIcon"], outputs: ["change", "toggleChange"], exportAs: ["matSlideToggle"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FileTaggingModal, decorators: [{
            type: Component,
            args: [{ selector: 'file-tagging-modal', template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"modal-icon-container\">\n      <i class=\"{{icon}} modal-icon\"></i>\n    </div>\n    <div>\n      <h2 mat-dialog-title class=\"modal-mat-header\">{{name}} - File Tagging</h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n  </div>\n  <div class=\"modal-row\">\n    <div class=\"modal-column-full-width\">\n      <mat-list-item>\n        @if (isDirectory) {\n        Tag all files as\n        } @else {\n        Tag file as\n        }\n        <ng-template #file>Tag file as</ng-template>\n        <mat-form-field appearance=\"fill\" style=\"margin-left: 36px;\">\n          <input matInput required type=\"text\" [(ngModel)]=\"selectedOption\" (ngModelChange)=\"onValueChange($event)\"\n            [matAutocomplete]=\"auto\" [errorStateMatcher]=\"matcher\" #encodingInput=\"ngModel\">\n          <mat-autocomplete autoActiveFirstOption #auto=\"matAutocomplete\" [displayWith]=\"displayFn\">\n            @for (option of filteredOptions; track option) {\n            <mat-option [value]=\"option\">\n              {{ option.name }}\n            </mat-option>\n            }\n          </mat-autocomplete>\n          @if (encodingInput.hasError('required')) {\n          <mat-error>\n            Encoding is required\n          </mat-error>\n          }\n        </mat-form-field>\n      </mat-list-item>\n    </div>\n  </div>\n\n  @if (isDirectory) {\n  <div class=\"modal-row\">\n    <div class=\"modal-column\" style=\"width: 40%;\">\n      <mat-list-item>\n        <mat-slide-toggle color=\"primary\" [(ngModel)]=\"recursive\"></mat-slide-toggle>\n      </mat-list-item>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list-item>\n        <div class=\"selectable-text\">Process subdirectories</div>\n      </mat-list-item>\n    </div>\n  </div>\n  }\n\n  <mat-dialog-actions>\n    <button mat-button class=\"modal-mat-button\" (click)=\"changeTag()\" [disabled]=\"!isOptionSelected\">Save</button>\n  </mat-dialog-actions>\n</div>\n<!--\n  This program and the accompanying materials are\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n  SPDX-License-Identifier: EPL-2.0\n\n  Copyright Contributors to the Zowe Project.\n  -->", styles: [".file-tagging-container{padding:1rem}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused{background-color:#fff!important}\n"] }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DIALOG_DATA]
                }] }, { type: i1.MatDialogRef }, { type: i2.HttpClient }, { type: i3.MatSnackBar }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsZS10YWdnaW5nLW1vZGFsLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3psdXgtZmlsZS1leHBsb3Jlci9zcmMvbGliL2NvbXBvbmVudHMvZmlsZS10YWdnaW5nLW1vZGFsL2ZpbGUtdGFnZ2luZy1tb2RhbC5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96bHV4LWZpbGUtZXhwbG9yZXIvc3JjL2xpYi9jb21wb25lbnRzL2ZpbGUtdGFnZ2luZy1tb2RhbC9maWxlLXRhZ2dpbmctbW9kYWwuY29tcG9uZW50Lmh0bWwiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7Ozs7Ozs7O0VBUUU7QUFDRixPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNsRCxPQUFPLEVBQUUsZUFBZSxFQUFnQixNQUFNLDBCQUEwQixDQUFDO0FBR3pFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQzNFLE9BQU8sRUFBRSxXQUFXLEVBQUUsb0JBQW9CLEVBQVcsTUFBTSx1QkFBdUIsQ0FBQztBQUNuRixPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUN2RSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FBVTFDLE1BQU0sT0FBTyxnQkFBZ0I7SUFZM0IsWUFDMkIsSUFBSSxFQUNyQixTQUF5QyxFQUN6QyxJQUFnQixFQUNoQixRQUFxQjtRQUZyQixjQUFTLEdBQVQsU0FBUyxDQUFnQztRQUN6QyxTQUFJLEdBQUosSUFBSSxDQUFZO1FBQ2hCLGFBQVEsR0FBUixRQUFRLENBQWE7UUFWL0IsWUFBTyxHQUFHLElBQUksdUJBQXVCLEVBQUUsQ0FBQztRQUN4QyxjQUFTLEdBQVksS0FBSyxDQUFDO1FBQzNCLGVBQVUsR0FBRyxXQUFXLENBQUM7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O1lBQ2xFLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ2hFLENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3pDLENBQUM7SUFDSCxDQUFDO0lBRUQsSUFBSSxnQkFBZ0I7UUFDbEIsT0FBTyxPQUFPLElBQUksQ0FBQyxjQUFjLEtBQUssUUFBUSxDQUFDO0lBQ2pELENBQUM7SUFFTyxNQUFNLENBQUMsT0FBa0IsRUFBRSxLQUFhO1FBQzlDLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN4QyxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ25GLENBQUM7OEdBaEdVLGdCQUFnQixrQkFhakIsZUFBZTtrR0FiZCxnQkFBZ0IsMERDM0I3QixrdEZBOEVLOzsyRkRuRFEsZ0JBQWdCO2tCQVI1QixTQUFTOytCQUNFLG9CQUFvQjs7MEJBb0IzQixNQUFNOzJCQUFDLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuLypcclxuICBUaGlzIHByb2dyYW0gYW5kIHRoZSBhY2NvbXBhbnlpbmcgbWF0ZXJpYWxzIGFyZVxyXG4gIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRWNsaXBzZSBQdWJsaWMgTGljZW5zZSB2Mi4wIHdoaWNoIGFjY29tcGFuaWVzXHJcbiAgdGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXHJcblxyXG4gIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBFUEwtMi4wXHJcblxyXG4gIENvcHlyaWdodCBDb250cmlidXRvcnMgdG8gdGhlIFpvd2UgUHJvamVjdC5cclxuKi9cclxuaW1wb3J0IHsgQ29tcG9uZW50LCBJbmplY3QgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgTUFUX0RJQUxPR19EQVRBLCBNYXREaWFsb2dSZWYgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xyXG5pbXBvcnQgeyBNYXRTbmFja0JhciB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3NuYWNrLWJhcic7XHJcbmltcG9ydCB7IEh0dHBDbGllbnQsIEh0dHBFcnJvclJlc3BvbnNlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xyXG5pbXBvcnQgeyBDdXN0b21FcnJvclN0YXRlTWF0Y2hlciB9IGZyb20gJy4uLy4uL3NoYXJlZC9lcnJvci1zdGF0ZS1tYXRjaGVyJztcclxuaW1wb3J0IHsgZmlsZVRhZ0xpc3QsIGZpbmRGaWxlVGFnQnlDb2Rlc2V0LCBGaWxlVGFnIH0gZnJvbSAnLi4vLi4vc2hhcmVkL2ZpbGUtdGFnJztcclxuaW1wb3J0IHsgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyB9IGZyb20gJy4uLy4uL3NoYXJlZC9zbmFja2Jhci1vcHRpb25zJztcclxuaW1wb3J0IHsgZmluYWxpemUgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcblxyXG5AQ29tcG9uZW50KHtcclxuICBzZWxlY3RvcjogJ2ZpbGUtdGFnZ2luZy1tb2RhbCcsXHJcbiAgdGVtcGxhdGVVcmw6ICcuL2ZpbGUtdGFnZ2luZy1tb2RhbC5jb21wb25lbnQuaHRtbCcsXHJcbiAgc3R5bGVVcmxzOiBbXHJcbiAgICAnLi9maWxlLXRhZ2dpbmctbW9kYWwuY29tcG9uZW50LnNjc3MnLFxyXG4gICAgJy4uLy4uL3NoYXJlZC9tb2RhbC5jb21wb25lbnQuc2NzcydcclxuICBdLFxyXG59KVxyXG5leHBvcnQgY2xhc3MgRmlsZVRhZ2dpbmdNb2RhbCB7XHJcbiAgbm9kZTogYW55O1xyXG4gIGlzRGlyZWN0b3J5OiBib29sZWFuO1xyXG4gIGljb246IHN0cmluZztcclxuICBuYW1lOiBzdHJpbmc7XHJcbiAgdGl0bGU6IHN0cmluZztcclxuICBtYXRjaGVyID0gbmV3IEN1c3RvbUVycm9yU3RhdGVNYXRjaGVyKCk7XHJcbiAgcmVjdXJzaXZlOiBib29sZWFuID0gZmFsc2U7XHJcbiAgdGFnT3B0aW9ucyA9IGZpbGVUYWdMaXN0O1xyXG4gIGZpbHRlcmVkT3B0aW9uczogRmlsZVRhZ1tdO1xyXG4gIHNlbGVjdGVkT3B0aW9uOiBGaWxlVGFnIHwgc3RyaW5nO1xyXG5cclxuICBjb25zdHJ1Y3RvcihcclxuICAgIEBJbmplY3QoTUFUX0RJQUxPR19EQVRBKSBkYXRhLFxyXG4gICAgcHJpdmF0ZSBkaWFsb2dSZWY6IE1hdERpYWxvZ1JlZjxGaWxlVGFnZ2luZ01vZGFsPixcclxuICAgIHByaXZhdGUgaHR0cDogSHR0cENsaWVudCxcclxuICAgIHByaXZhdGUgc25hY2tCYXI6IE1hdFNuYWNrQmFyLFxyXG4gICkge1xyXG4gICAgdGhpcy5ub2RlID0gZGF0YS5ub2RlO1xyXG4gICAgdGhpcy5uYW1lID0gdGhpcy5ub2RlLm5hbWU7XHJcbiAgICB0aGlzLmlzRGlyZWN0b3J5ID0gdGhpcy5ub2RlLmRpcmVjdG9yeTtcclxuICAgIHRoaXMuaWNvbiA9IHRoaXMubm9kZS5pY29uID8gdGhpcy5ub2RlLmljb24gOiB0aGlzLm5vZGUuY29sbGFwc2VkSWNvbjtcclxuICAgIHRoaXMudGl0bGUgPSB0aGlzLmlzRGlyZWN0b3J5ID8gJ1RhZyBmaWxlcycgOiAnVGFnIGZpbGUnO1xyXG4gICAgY29uc3QgY29kZXNldCA9IHRoaXMuaXNEaXJlY3RvcnkgPyAwIDogdGhpcy5ub2RlLmNjc2lkO1xyXG4gICAgdGhpcy5zZWxlY3RlZE9wdGlvbiA9IGZpbmRGaWxlVGFnQnlDb2Rlc2V0KGNvZGVzZXQpO1xyXG4gICAgdGhpcy5maWx0ZXJlZE9wdGlvbnMgPSB0aGlzLnRhZ09wdGlvbnM7XHJcbiAgfVxyXG5cclxuICBjaGFuZ2VUYWcoKTogdm9pZCB7XHJcbiAgICBjb25zdCBwYXRoOiBzdHJpbmcgPSB0aGlzLm5vZGUucGF0aDtcclxuICAgIGNvbnN0IHJlY3Vyc2l2ZSA9IHRoaXMucmVjdXJzaXZlO1xyXG4gICAgY29uc3Qgb3B0aW9uID0gdGhpcy5zZWxlY3RlZE9wdGlvbiBhcyBGaWxlVGFnO1xyXG4gICAgY29uc3QgdHlwZSA9IG9wdGlvbi50eXBlO1xyXG4gICAgY29uc3QgY29kZXNldCA9ICh0eXBlID09PSAndGV4dCcpID8gb3B0aW9uLmNvZGVzZXQgOiB1bmRlZmluZWQ7XHJcbiAgICBjb25zdCBvcHRpb25zOiBaTFVYLlVuaXhGaWxlVXJpT3B0aW9ucyA9IHtcclxuICAgICAgcmVjdXJzaXZlLFxyXG4gICAgICB0eXBlLFxyXG4gICAgICBjb2Rlc2V0XHJcbiAgICB9O1xyXG4gICAgY29uc3QgdXJsID0gWm93ZVpMVVgudXJpQnJva2VyLnVuaXhGaWxlVXJpKCdjaHRhZycsIHBhdGgsIG9wdGlvbnMpO1xyXG4gICAgY29uc3QgYWN0aW9uID0gKHR5cGUgPT09ICdkZWxldGUnKSA/IHRoaXMuaHR0cC5kZWxldGUodXJsKSA6IHRoaXMuaHR0cC5wb3N0KHVybCwgbnVsbCk7XHJcbiAgICBhY3Rpb24ucGlwZShcclxuICAgICAgZmluYWxpemUoKCkgPT4gdGhpcy5jbG9zZURpYWxvZygpKVxyXG4gICAgKS5cclxuICAgIHN1YnNjcmliZShcclxuICAgICAgX3JlcyA9PiB0aGlzLm9uVGFnZ2luZ1N1Y2Nlc3MocGF0aCwgdHlwZSwgb3B0aW9uKSxcclxuICAgICAgZXJyID0+IHRoaXMub25UYWdnaW5nRmFpbHVyZShlcnIpLFxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGNsb3NlRGlhbG9nKCkge1xyXG4gICAgY29uc3QgbmVlZFVwZGF0ZSA9IHRoaXMuaXNEaXJlY3Rvcnk7XHJcbiAgICB0aGlzLmRpYWxvZ1JlZi5jbG9zZShuZWVkVXBkYXRlKTtcclxuICB9XHJcblxyXG4gIG9uVGFnZ2luZ1N1Y2Nlc3MocGF0aDogc3RyaW5nLCB0eXBlOiBaTFVYLlRhZ1R5cGUsIG9wdGlvbjogRmlsZVRhZyk6IHZvaWQge1xyXG4gICAgaWYgKCF0aGlzLmlzRGlyZWN0b3J5KSB7XHJcbiAgICAgIHRoaXMubm9kZS5jY3NpZCA9IG9wdGlvbi5jb2Rlc2V0O1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHZlcmIgPSAodHlwZSA9PT0gJ2RlbGV0ZScpID8gJ3VudGFnZ2VkJyA6ICd0YWdnZWQnO1xyXG4gICAgY29uc3QgYXNDb2Rlc2V0T3JFbXB0eSA9ICh0eXBlID09PSAnZGVsZXRlJykgPyAnJyA6IGBhcyAke29wdGlvbi5uYW1lfWA7XHJcbiAgICBjb25zdCBtZXNzYWdlID0gdGhpcy5pc0RpcmVjdG9yeSA/XHJcbiAgICAgIGBGaWxlcyBpbiAke3BhdGh9IGhhdmUgYmVlbiBzdWNjZXNzZnVsbHkgJHt2ZXJifSAke2FzQ29kZXNldE9yRW1wdHl9YCA6XHJcbiAgICAgIGBGaWxlICR7cGF0aH0gaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5ICR7dmVyYn0gJHthc0NvZGVzZXRPckVtcHR5fWA7XHJcbiAgICB0aGlzLnNuYWNrQmFyLm9wZW4obWVzc2FnZSwgJ0Rpc21pc3MnLCBkZWZhdWx0U25hY2tiYXJPcHRpb25zKTtcclxuICB9XHJcblxyXG4gIG9uVGFnZ2luZ0ZhaWx1cmUoZXJyOiBIdHRwRXJyb3JSZXNwb25zZSk6IHZvaWQge1xyXG4gICAgbGV0IG1lc3NhZ2UgPSAnRmFpbGVkIHRvIGNoYW5nZSB0YWcocyknO1xyXG4gICAgaWYgKHR5cGVvZiBlcnIuZXJyb3IgPT09ICdvYmplY3QnICYmIHR5cGVvZiBlcnIuZXJyb3IuZXJyb3IgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIG1lc3NhZ2UgPSBlcnIuZXJyb3IuZXJyb3I7XHJcbiAgICB9XHJcbiAgICB0aGlzLnNuYWNrQmFyLm9wZW4oYEVycm9yOiAke21lc3NhZ2V9LmAsICdEaXNtaXNzJywgZGVmYXVsdFNuYWNrYmFyT3B0aW9ucyk7XHJcbiAgfVxyXG5cclxuICBkaXNwbGF5Rm4ob3B0aW9uPzogRmlsZVRhZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XHJcbiAgICByZXR1cm4gb3B0aW9uID8gb3B0aW9uLm5hbWUgOiB1bmRlZmluZWQ7XHJcbiAgfVxyXG5cclxuICBvblZhbHVlQ2hhbmdlKHZhbHVlPzogc3RyaW5nIHwgRmlsZVRhZyk6IHZvaWQge1xyXG4gICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgIGNvbnN0IGVuY29kaW5nID0gKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpID8gdmFsdWUgOiB2YWx1ZS5uYW1lO1xyXG4gICAgICB0aGlzLmZpbHRlcmVkT3B0aW9ucyA9IHRoaXMuZmlsdGVyKHRoaXMudGFnT3B0aW9ucywgZW5jb2RpbmcpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhpcy5maWx0ZXJlZE9wdGlvbnMgPSB0aGlzLnRhZ09wdGlvbnM7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBnZXQgaXNPcHRpb25TZWxlY3RlZCgpOiBib29sZWFuIHtcclxuICAgIHJldHVybiB0eXBlb2YgdGhpcy5zZWxlY3RlZE9wdGlvbiA9PT0gJ29iamVjdCc7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGZpbHRlcihvcHRpb25zOiBGaWxlVGFnW10sIHZhbHVlOiBzdHJpbmcpOiBGaWxlVGFnW10ge1xyXG4gICAgY29uc3QgZmlsdGVyVmFsdWUgPSB2YWx1ZS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgcmV0dXJuIG9wdGlvbnMuZmlsdGVyKG9wdGlvbiA9PiBvcHRpb24ubmFtZS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGZpbHRlclZhbHVlKSk7XHJcbiAgfVxyXG59XHJcblxyXG4vKlxyXG4gIFRoaXMgcHJvZ3JhbSBhbmQgdGhlIGFjY29tcGFueWluZyBtYXRlcmlhbHMgYXJlXHJcbiAgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcclxuICB0aGlzIGRpc3RyaWJ1dGlvbiwgYW5kIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5lY2xpcHNlLm9yZy9sZWdhbC9lcGwtdjIwLmh0bWxcclxuXHJcbiAgU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcclxuXHJcbiAgQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxyXG4qL1xyXG4iLCI8IS0tXG5UaGlzIHByb2dyYW0gYW5kIHRoZSBhY2NvbXBhbnlpbmcgbWF0ZXJpYWxzIGFyZVxubWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcbnRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MjAuaHRtbFxuXG5TUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxuXG5Db3B5cmlnaHQgQ29udHJpYnV0b3JzIHRvIHRoZSBab3dlIFByb2plY3QuXG4tLT5cbjx6bHV4LXRhYi10cmFwPjwvemx1eC10YWItdHJhcD5cbjxkaXYgY2xhc3M9XCJwYWRkaW5nLTFcIj5cbiAgPGRpdiBjbGFzcz1cImQtZmxleFwiPlxuICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1pY29uLWNvbnRhaW5lclwiPlxuICAgICAgPGkgY2xhc3M9XCJ7e2ljb259fSBtb2RhbC1pY29uXCI+PC9pPlxuICAgIDwvZGl2PlxuICAgIDxkaXY+XG4gICAgICA8aDIgbWF0LWRpYWxvZy10aXRsZSBjbGFzcz1cIm1vZGFsLW1hdC1oZWFkZXJcIj57e25hbWV9fSAtIEZpbGUgVGFnZ2luZzwvaDI+XG4gICAgPC9kaXY+XG4gICAgPGRpdj5cbiAgICAgIDxidXR0b24gbWF0LWRpYWxvZy1jbG9zZSBjbGFzcz1cImNsb3NlLWRpYWxvZy1idG5cIj48aSBjbGFzcz1cImZhIGZhLWNsb3NlXCI+PC9pPjwvYnV0dG9uPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbiAgPGRpdiBjbGFzcz1cIm1vZGFsLXJvd1wiPlxuICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1jb2x1bW4tZnVsbC13aWR0aFwiPlxuICAgICAgPG1hdC1saXN0LWl0ZW0+XG4gICAgICAgIEBpZiAoaXNEaXJlY3RvcnkpIHtcbiAgICAgICAgVGFnIGFsbCBmaWxlcyBhc1xuICAgICAgICB9IEBlbHNlIHtcbiAgICAgICAgVGFnIGZpbGUgYXNcbiAgICAgICAgfVxuICAgICAgICA8bmctdGVtcGxhdGUgI2ZpbGU+VGFnIGZpbGUgYXM8L25nLXRlbXBsYXRlPlxuICAgICAgICA8bWF0LWZvcm0tZmllbGQgYXBwZWFyYW5jZT1cImZpbGxcIiBzdHlsZT1cIm1hcmdpbi1sZWZ0OiAzNnB4O1wiPlxuICAgICAgICAgIDxpbnB1dCBtYXRJbnB1dCByZXF1aXJlZCB0eXBlPVwidGV4dFwiIFsobmdNb2RlbCldPVwic2VsZWN0ZWRPcHRpb25cIiAobmdNb2RlbENoYW5nZSk9XCJvblZhbHVlQ2hhbmdlKCRldmVudClcIlxuICAgICAgICAgICAgW21hdEF1dG9jb21wbGV0ZV09XCJhdXRvXCIgW2Vycm9yU3RhdGVNYXRjaGVyXT1cIm1hdGNoZXJcIiAjZW5jb2RpbmdJbnB1dD1cIm5nTW9kZWxcIj5cbiAgICAgICAgICA8bWF0LWF1dG9jb21wbGV0ZSBhdXRvQWN0aXZlRmlyc3RPcHRpb24gI2F1dG89XCJtYXRBdXRvY29tcGxldGVcIiBbZGlzcGxheVdpdGhdPVwiZGlzcGxheUZuXCI+XG4gICAgICAgICAgICBAZm9yIChvcHRpb24gb2YgZmlsdGVyZWRPcHRpb25zOyB0cmFjayBvcHRpb24pIHtcbiAgICAgICAgICAgIDxtYXQtb3B0aW9uIFt2YWx1ZV09XCJvcHRpb25cIj5cbiAgICAgICAgICAgICAge3sgb3B0aW9uLm5hbWUgfX1cbiAgICAgICAgICAgIDwvbWF0LW9wdGlvbj5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICA8L21hdC1hdXRvY29tcGxldGU+XG4gICAgICAgICAgQGlmIChlbmNvZGluZ0lucHV0Lmhhc0Vycm9yKCdyZXF1aXJlZCcpKSB7XG4gICAgICAgICAgPG1hdC1lcnJvcj5cbiAgICAgICAgICAgIEVuY29kaW5nIGlzIHJlcXVpcmVkXG4gICAgICAgICAgPC9tYXQtZXJyb3I+XG4gICAgICAgICAgfVxuICAgICAgICA8L21hdC1mb3JtLWZpZWxkPlxuICAgICAgPC9tYXQtbGlzdC1pdGVtPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cblxuICBAaWYgKGlzRGlyZWN0b3J5KSB7XG4gIDxkaXYgY2xhc3M9XCJtb2RhbC1yb3dcIj5cbiAgICA8ZGl2IGNsYXNzPVwibW9kYWwtY29sdW1uXCIgc3R5bGU9XCJ3aWR0aDogNDAlO1wiPlxuICAgICAgPG1hdC1saXN0LWl0ZW0+XG4gICAgICAgIDxtYXQtc2xpZGUtdG9nZ2xlIGNvbG9yPVwicHJpbWFyeVwiIFsobmdNb2RlbCldPVwicmVjdXJzaXZlXCI+PC9tYXQtc2xpZGUtdG9nZ2xlPlxuICAgICAgPC9tYXQtbGlzdC1pdGVtPlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJtb2RhbC1jb2x1bW5cIj5cbiAgICAgIDxtYXQtbGlzdC1pdGVtPlxuICAgICAgICA8ZGl2IGNsYXNzPVwic2VsZWN0YWJsZS10ZXh0XCI+UHJvY2VzcyBzdWJkaXJlY3RvcmllczwvZGl2PlxuICAgICAgPC9tYXQtbGlzdC1pdGVtPlxuICAgIDwvZGl2PlxuICA8L2Rpdj5cbiAgfVxuXG4gIDxtYXQtZGlhbG9nLWFjdGlvbnM+XG4gICAgPGJ1dHRvbiBtYXQtYnV0dG9uIGNsYXNzPVwibW9kYWwtbWF0LWJ1dHRvblwiIChjbGljayk9XCJjaGFuZ2VUYWcoKVwiIFtkaXNhYmxlZF09XCIhaXNPcHRpb25TZWxlY3RlZFwiPlNhdmU8L2J1dHRvbj5cbiAgPC9tYXQtZGlhbG9nLWFjdGlvbnM+XG48L2Rpdj5cbjwhLS1cbiAgVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcbiAgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcbiAgdGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXG5cbiAgU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcblxuICBDb3B5cmlnaHQgQ29udHJpYnV0b3JzIHRvIHRoZSBab3dlIFByb2plY3QuXG4gIC0tPiJdfQ==