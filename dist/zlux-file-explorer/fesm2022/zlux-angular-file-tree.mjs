import * as i0 from '@angular/core';
import { Component, Inject, ViewChild, EventEmitter, ViewEncapsulation, Input, Output, Injectable, Optional, NgModule } from '@angular/core';
import * as i1 from '@angular/material/dialog';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import * as i4 from '@angular/forms';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import * as i5 from '@angular/material/form-field';
import { MatFormFieldModule } from '@angular/material/form-field';
import * as i7 from '@angular/material/input';
import { MatInputModule } from '@angular/material/input';
import * as i8 from '@angular/material/button';
import { MatButtonModule } from '@angular/material/button';
import * as i6 from '@angular/material/select';
import { MatSelectModule } from '@angular/material/select';
import * as i9 from '@angular/material/core';
import { ErrorStateMatcher, ShowOnDirtyErrorStateMatcher } from '@angular/material/core';
import * as i3 from 'zlux-widgets';
import { ZluxTabbingModule } from 'zlux-widgets';
import * as i1$1 from '@angular/common/http';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import * as i3$1 from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import * as i6$1 from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import * as i2 from '@angular/material/list';
import { MatListModule } from '@angular/material/list';
import { throwError, of, Observable, Subject, fromEvent, Subscription } from 'rxjs';
import { finalize, catchError, switchMap, map, debounceTime, take, timeout, filter } from 'rxjs/operators';
import * as i11 from '@angular/material/slide-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import * as i8$1 from '@angular/material/checkbox';
import { MatCheckboxModule } from '@angular/material/checkbox';
import * as i10 from '@angular/material/autocomplete';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import * as i7$1 from '@angular/common';
import { CommonModule } from '@angular/common';
import * as i2$1 from 'primeng/tree';
import { TreeModule } from 'primeng/tree';
import * as i3$2 from 'primeng/contextmenu';
import { ContextMenuModule } from 'primeng/contextmenu';
import * as _ from 'lodash';
import * as streamSaver from 'streamsaver';
import { CountQueuingStrategy, WritableStream, ReadableStream } from 'web-streams-polyfill';
import * as i9$1 from '@angular/material/button-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import * as i10$1 from 'primeng/inputtext';
import { InputTextModule } from 'primeng/inputtext';
import * as i10$2 from 'primeng/inputgroup';
import { InputGroupModule } from 'primeng/inputgroup';
import * as i11$1 from 'primeng/inputgroupaddon';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
/*
  By default, the error messages associated with matInput inside <mat-form-field>
  are shown when the control is invalid and either the element lost focus or the parent form has been submitted.
  This error state matcher overrides this behavior to show the error as soon as the invalid control is dirty.
*/
class CustomErrorStateMatcher {
    isErrorState(control, form) {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
}
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
const TEMPLATE = new Map([
    ['JCL', {
            allocationUnit: 'TRK',
            primarySpace: '300',
            secondarySpace: '100',
            directoryBlocks: '20',
            recordFormat: 'FB',
            recordLength: '80',
        }],
    ['COBOL', {
            allocationUnit: 'TRK',
            primarySpace: '300',
            secondarySpace: '150',
            directoryBlocks: '20',
            recordFormat: 'FB',
            recordLength: '133',
        }],
    ['PLX', {
            allocationUnit: 'TRK',
            primarySpace: '300',
            secondarySpace: '150',
            directoryBlocks: '20',
            recordFormat: 'VBA',
            recordLength: '132',
        }],
    ['XML', {
            allocationUnit: 'TRK',
            primarySpace: '200',
            secondarySpace: '100',
            directoryBlocks: '20',
            recordFormat: 'VBA',
            recordLength: '16383',
        }],
]);
const DATASETNAMETYPE = new Map([
    ['PDS', {
            organization: 'PO',
        }],
    ['LIBRARY', {
            organization: 'PO',
        }],
    ['BASIC', {
            organization: 'PS',
        }],
    ['LARGE', {
            organization: 'PS',
        }]
]);
class CreateDatasetModal {
    constructor(el, data) {
        this.el = el;
        this.properties = {
            template: '',
            name: '',
            allocationUnit: '',
            averageRecordUnit: '',
            primarySpace: '',
            secondarySpace: '',
            directoryBlocks: '',
            recordFormat: '',
            recordLength: '',
            blockSize: '',
            datasetNameType: '',
            organization: ''
        };
        this.matcher = new CustomErrorStateMatcher();
        this.isDirBlockValid = true;
        this.dirBlockTouched = false;
        this.isPrimeSpaceValid = true;
        this.isSecondSpaceValid = true;
        this.isRecLengthValid = true;
        this.isBlockSizeValid = true;
        this.primarySpaceError = "Primary space value cannot be more than '16777215' ";
        this.secondarySpaceError = "Secondary space value cannot be more than '16777215' ";
        this.recordLengthError = "Record length cannot be more than '32760' bytes";
        this.blockSizeError = "Block size cannot be more than '32760' bytes";
        this.isRecordFormatValid = true;
        this.blockSizeTouched = false;
        this.isAllocUnitValid = true;
        this.allocUnitErrorMessage = "If allocation unit is 'BLK' then record format must be blocked type: FB, VB, VBA";
        this.isRecFormatTouched = false;
        if (data && data.data) {
            this.properties.name = data.data.dsName;
            this.properties.datasetNameType = data.data.dsNameType;
            this.properties.organization = data.data.dsOrg;
        }
        else {
            this.properties.datasetNameType = 'PDS';
            this.properties.organization = 'PO';
        }
        this.numericPattern = "^[0-9]*$";
        this.numericPatternExZero = "^[1-9][0-9]*$";
        this.datasetNamePattern = "^[a-zA-Z#$@][a-zA-Z0-9#$@-]{0,7}([.][a-zA-Z#$@][a-zA-Z0-9#$@-]{0,7}){0,21}$";
        this.alphaNumericPattern = "^[a-zA-Z0-9]*$";
        this.templateOptions = ['JCL', 'COBOL', 'PLX', 'XML'];
        this.allocationUnitOptions = ['BLK', 'TRK', 'CYL', 'KB', 'MB', 'BYTE', 'RECORD'];
        this.recordFormatOptions = ['F', 'FB', 'V', 'VB', 'VBA', 'U'];
        this.datasetNameTypeOptions = ['PDS', 'LIBRARY', 'BASIC', 'LARGE'];
        this.organizationOptions = ['PS', 'PO'];
        this.recordUnitOptions = ['U', 'K', 'M',];
        this.properties.template = '';
        this.properties.averageRecordUnit = '';
    }
    onTemplateChange(value) {
        this.setTemplateProperties(value);
    }
    setDatasetNameTypeProperties(datasetNameType) {
        this.dsorg.nativeElement.setAttribute('style', 'padding-bottom: 4px; margin-bottom: -7px; border-bottom: 2px solid #000099');
        setTimeout(() => {
            this.dsorg.nativeElement.setAttribute('style', 'margin-bottom: 0px; border-bottom: 0px');
        }, 3000);
        if (!datasetNameType) {
            this.properties.organization = 'PS';
        }
        else {
            this.properties.organization = DATASETNAMETYPE.get(datasetNameType)?.organization;
        }
        if (this.dirBlockTouched) {
            this.checkForValidDirBlockCombination();
        }
    }
    setTemplateProperties(template) {
        this.dirblocks.nativeElement.setAttribute('style', 'margin-bottom: -7px; border-bottom: 2px solid #000099');
        this.allocUnit._elementRef.nativeElement.setAttribute('style', 'padding-bottom: 5px; margin-bottom: -7px; border-bottom: 2px solid #000099');
        this.primeSpace.nativeElement.setAttribute('style', 'margin-bottom: -6px; border-bottom: 2px solid #000099');
        this.secondSpace.nativeElement.setAttribute('style', 'margin-bottom: -7px; border-bottom: 2px solid #000099');
        this.recordLength.nativeElement.setAttribute('style', 'margin-bottom: -6px; border-bottom: 2px solid #000099');
        this.recordFormat._elementRef.nativeElement.setAttribute('style', 'padding-bottom: 5px; margin-bottom: -6px; border-bottom: 2px solid #000099');
        setTimeout(() => {
            this.dirblocks.nativeElement.setAttribute('style', 'margin-bottom: 0px; border-bottom: 0px');
            this.allocUnit._elementRef.nativeElement.setAttribute('style', 'padding-bottom: 0px; margin-bottom: 0px; border-bottom: 0px');
            this.primeSpace.nativeElement.setAttribute('style', 'margin-bottom: 0px; border-bottom: 0px');
            this.secondSpace.nativeElement.setAttribute('style', 'margin-bottom: 0px; border-bottom: 0px');
            this.recordLength.nativeElement.setAttribute('style', 'margin-bottom: 0px; border-bottom: 0px');
            this.recordFormat._elementRef.nativeElement.setAttribute('style', 'padding-bottom: 0px; margin-bottom: 0px; border-bottom: 0px');
        }, 3000);
        this.dirBlockTouched = true;
        if (!template) {
            this.properties.allocationUnit = '';
            this.properties.primarySpace = '';
            this.properties.secondarySpace = '';
            this.properties.directoryBlocks = '';
            this.properties.recordFormat = '';
            this.properties.recordLength = '';
        }
        this.properties.allocationUnit = TEMPLATE?.get(template)?.allocationUnit;
        this.properties.primarySpace = TEMPLATE.get(template).primarySpace;
        this.properties.secondarySpace = TEMPLATE.get(template).secondarySpace;
        if (this.properties.organization == 'PS') {
            this.properties.directoryBlocks = '0';
        }
        else {
            this.properties.directoryBlocks = TEMPLATE.get(template).directoryBlocks;
        }
        this.isDirBlockValid = true;
        this.properties.recordFormat = TEMPLATE.get(template).recordFormat;
        this.properties.recordLength = TEMPLATE.get(template).recordLength;
        this.checkForValidDirBlockCombination();
        if (this.blockSizeTouched) {
            this.checkForValidRecordFormatCombination();
        }
    }
    onDirBlockChange(value) {
        this.dirBlockTouched = true;
        if (parseInt(this.properties.directoryBlocks) > 16777215) {
            this.isDirBlockValid = false;
            this.dirBlockError = 'Directory blocks cannot be more than 16777215';
        }
        else {
            this.checkForValidDirBlockCombination();
        }
    }
    checkForValidDirBlockCombination() {
        if (this.properties.organization == 'PS') {
            if (this.properties.directoryBlocks == '') {
                this.isDirBlockValid = true;
            }
            else if (parseInt(this.properties.directoryBlocks) > 0) {
                this.isDirBlockValid = false;
                this.dirBlockError = 'Directory blocks must be 0 for the sequential dataset';
            }
            else {
                this.isDirBlockValid = true;
            }
        }
        if (this.properties.organization == 'PO') {
            if (this.properties.directoryBlocks == '') {
                this.isDirBlockValid = true;
            }
            else if (parseInt(this.properties.directoryBlocks) < 1) {
                this.isDirBlockValid = false;
                this.dirBlockError = 'Directory blocks must be greater than 0 for the partitioned dataset';
            }
            else {
                this.isDirBlockValid = true;
            }
        }
    }
    checkForValidRecordFormatCombination() {
        if (this.properties.recordFormat == 'F') {
            if (this.properties.blockSize !== '' && this.properties.recordLength !== this.properties.blockSize) {
                this.isRecordFormatValid = false;
                this.recordFormatErrorMessage = 'Block size must be equal to the record length for fixed record format';
            }
            else {
                this.isRecordFormatValid = true;
            }
        }
        if (this.properties.recordFormat == 'FB') {
            if (this.properties.blockSize !== '' && (parseInt(this.properties.blockSize) % parseInt(this.properties.recordLength)) != 0) {
                this.isRecordFormatValid = false;
                this.recordFormatErrorMessage = 'Block size must be a multiple of the record length for fixed blocked record format';
            }
            else {
                this.isRecordFormatValid = true;
            }
        }
        if (this.properties.recordFormat == 'V' || this.properties.recordFormat == 'VB') {
            if (this.properties.blockSize !== '' && parseInt(this.properties.blockSize) < (parseInt(this.properties.recordLength) + 4)) {
                this.isRecordFormatValid = false;
                this.recordFormatErrorMessage = 'Block size must be atleast 4 more than the record length for V, VB, VBA record format';
            }
            else {
                this.isRecordFormatValid = true;
            }
        }
        if (this.properties.recordFormat == 'VBA') {
            if (parseInt(this.properties.recordLength) < 5) {
                this.isRecordFormatValid = false;
                this.recordFormatErrorMessage = 'Record length must be atleast 5 for VBA record format';
            }
            else if (this.properties.blockSize !== '' && parseInt(this.properties.blockSize) < (parseInt(this.properties.recordLength) + 4)) {
                this.isRecordFormatValid = false;
                this.recordFormatErrorMessage = 'Block size must be atleast 4 more than the record length for V, VB, VBA record format';
            }
            else {
                this.isRecordFormatValid = true;
            }
        }
        if (this.properties.recordFormat == 'U') {
            if (parseInt(this.properties.recordLength) > 0) {
                this.isRecordFormatValid = false;
                this.recordFormatErrorMessage = 'Record length must be equal to 0 for undefined record format';
            }
            else {
                this.isRecordFormatValid = true;
            }
        }
    }
    checkForValidAllocUnitCombination() {
        if (this.properties.allocationUnit == 'BLK') {
            if (this.properties.recordFormat !== 'FB' && this.properties.recordFormat !== 'VB' && this.properties.recordFormat !== 'VBA') {
                this.isAllocUnitValid = false;
            }
            else {
                this.isAllocUnitValid = true;
            }
        }
        else {
            this.isAllocUnitValid = true;
        }
    }
    onPrimeSpaceChange(primarySpace) {
        if (parseInt(primarySpace) > 16777215) {
            this.isPrimeSpaceValid = false;
        }
        else {
            this.isPrimeSpaceValid = true;
        }
    }
    onSecondSpaceChange(SecondarySpace) {
        if (parseInt(SecondarySpace) > 16777215) {
            this.isSecondSpaceValid = false;
        }
        else {
            this.isSecondSpaceValid = true;
        }
    }
    onRecLengthChange(recordLength) {
        if (parseInt(recordLength) > 32760) {
            this.isRecLengthValid = false;
        }
        else {
            this.isRecLengthValid = true;
        }
        if (this.blockSizeTouched || this.properties.recordFormat == 'U' || this.properties.recordFormat == 'VBA') {
            this.checkForValidRecordFormatCombination();
        }
    }
    onBlockSizeChange(blockSize) {
        this.blockSizeTouched = true;
        if (parseInt(blockSize) > 32760) {
            this.isBlockSizeValid = false;
        }
        else {
            this.isBlockSizeValid = true;
        }
        this.checkForValidRecordFormatCombination();
    }
    onRecordFormatChange(value) {
        this.isRecFormatTouched = true;
        if (this.blockSizeTouched || this.properties.recordFormat == 'U') {
            this.checkForValidRecordFormatCombination();
        }
        this.checkForValidAllocUnitCombination();
    }
    onAllocUnitChange(value) {
        if (this.isRecFormatTouched) {
            this.checkForValidAllocUnitCombination();
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: CreateDatasetModal, deps: [{ token: i0.ElementRef }, { token: MAT_DIALOG_DATA }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: CreateDatasetModal, selector: "create-dataset-modal", viewQueries: [{ propertyName: "dirblocks", first: true, predicate: ["dirblocks"], descendants: true }, { propertyName: "primeSpace", first: true, predicate: ["primeSpace"], descendants: true }, { propertyName: "allocUnit", first: true, predicate: ["allocUnit"], descendants: true }, { propertyName: "secondSpace", first: true, predicate: ["secondSpace"], descendants: true }, { propertyName: "recordLength", first: true, predicate: ["recordLength"], descendants: true }, { propertyName: "recordFormat", first: true, predicate: ["recordFormat"], descendants: true }, { propertyName: "dsorg", first: true, predicate: ["dsorg"], descendants: true }], ngImport: i0, template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"header\">\n      <h2 mat-dialog-title>\n        <span class=\"title-design\">ALLOCATE NEW DATA SET</span>\n      </h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n  </div>\n  <p class=\"mandatory\">Mandatory fields are marked with an asterisk</p>\n  <mat-dialog-content>\n    <label class=\"required\" style=\"margin-left: 6px\">Data Set Name:</label>\n    <mat-form-field floatLabel=\"auto\" [style.width.px]=300>\n      <input matInput type=\"text\" maxlength=\"44\" placeholder=\"High-level qualifier must start with a TSO ID\"\n        [pattern]=\"datasetNamePattern\" [(ngModel)]=\"properties.name\" #nameInput=\"ngModel\" [errorStateMatcher]=\"matcher\"\n        oninput=\"this.value = this.value.toUpperCase()\">\n      <mat-error>Invalid Name</mat-error>\n    </mat-form-field>\n    <div class=\"row\">\n      <div class=\"column1\">\n        <label class=\"required\">Data Set Name Type:</label>\n        <mat-form-field floatLabel=\"auto\">\n          <mat-select class=\"select-encoding\" tabindex=\"0\" placeholder=\"Blank for PS Dataset\"\n            [(ngModel)]=\"properties.datasetNameType\" #datasetNameType\n            (selectionChange)=\"setDatasetNameTypeProperties(datasetNameType.value)\">\n            <mat-option>Blank</mat-option>\n            @for (datasetNameType of datasetNameTypeOptions; track datasetNameType) {\n            <mat-option [value]=\"datasetNameType\">\n              {{datasetNameType}}</mat-option>\n            }\n          </mat-select>\n        </mat-form-field>\n      </div>\n      <div class=\"column2\">\n        <label>Data Set Organization:</label>\n        <mat-form-field>\n          <input matInput [(ngModel)]=\"properties.organization\" readonly #dsorg>\n        </mat-form-field>\n      </div>\n    </div>\n    <p></p>\n    <label style=\"margin-left: 310px; width: 148px; font-size: larger; font-weight: bold;\">TEMPLATE:</label>\n    <mat-form-field style=\"width: 150px; font-weight: bold; margin-top: 3px;\" floatLabel=\"auto\">\n      <mat-select class=\"select-encoding\" tabindex=\"0\" placeholder=\"Select\" [(ngModel)]=\"properties.template\"\n        #templateInput (selectionChange)=\"onTemplateChange(templateInput.value)\">\n        <mat-option>None</mat-option>\n        @for (template of templateOptions; track template) {\n        <mat-option [value]=\"template\">\n          {{template}}</mat-option>\n        }\n      </mat-select>\n    </mat-form-field>\n    <div class=\"row\">\n      <div class=\"column1\">\n        <label class=\"required\">Allocation Unit:</label>\n        <mat-form-field floatLabel=\"auto\">\n          <mat-select class=\"select-encoding\" tabindex=\"0\" placeholder=\"Select\" [(ngModel)]=\"properties.allocationUnit\"\n            #allocUnit (selectionChange)=\"onAllocUnitChange(allocUnit.value)\">\n            @for (allocationUnit of allocationUnitOptions; track allocationUnit) {\n            <mat-option [value]=\"allocationUnit\">\n              {{allocationUnit}}</mat-option>\n            }\n          </mat-select>\n        </mat-form-field>\n        <label class=\"required\">Primary Space:</label>\n        <mat-form-field>\n          <input matInput [pattern]=\"numericPatternExZero\" [(ngModel)]=\"properties.primarySpace\"\n            #primarySpaceInput=\"ngModel\" [errorStateMatcher]=\"matcher\"\n            (ngModelChange)=\"onPrimeSpaceChange(primarySpaceInput.value)\" #primeSpace>\n          <mat-error>Invalid Primary Space</mat-error>\n        </mat-form-field>\n        <label class=\"required\">Record Length:</label>\n        <mat-form-field>\n          <input matInput [pattern]=\"numericPattern\" [(ngModel)]=\"properties.recordLength\" #recLengthInput=\"ngModel\"\n            [errorStateMatcher]=\"matcher\" (ngModelChange)=\"onRecLengthChange(recLengthInput.value)\" #recordLength>\n          <mat-error>Invalid Record Length</mat-error>\n        </mat-form-field>\n        <label class=\"required\">Directory Blocks:</label>\n        <mat-form-field floatLabel=\"auto\">\n          <input matInput [pattern]=\"numericPattern\" placeholder=\"0 for PS Data Set\"\n            [(ngModel)]=\"properties.directoryBlocks\" #dirBlockInput=\"ngModel\" [errorStateMatcher]=\"matcher\"\n            (ngModelChange)=\"onDirBlockChange(dirBlockInput.value)\" #dirblocks>\n          <mat-error>Invalid Directory Blocks</mat-error>\n        </mat-form-field>\n      </div>\n      <div class=\"column2\">\n        <label>Average Record Unit:</label>\n        <mat-form-field floatLabel=\"auto\">\n          <mat-select class=\"select-encoding\" tabindex=\"0\" placeholder=\"Select\"\n            [(ngModel)]=\"properties.averageRecordUnit\">\n            @for (averageRecordUnit of recordUnitOptions; track averageRecordUnit) {\n            <mat-option [value]=\"averageRecordUnit\">\n              {{averageRecordUnit}}</mat-option>\n            }\n          </mat-select>\n        </mat-form-field>\n        <label class=\"required\">Secondary Space:</label>\n        <mat-form-field>\n          <input matInput [pattern]=\"numericPatternExZero\" [(ngModel)]=\"properties.secondarySpace\"\n            #secSpaceInput=\"ngModel\" [errorStateMatcher]=\"matcher\"\n            (ngModelChange)=\"onSecondSpaceChange(secSpaceInput.value)\" #secondSpace>\n          <mat-error>Invalid Secondary Space</mat-error>\n        </mat-form-field>\n        <label class=\"required\">Record Format:</label>\n        <mat-form-field floatLabel=\"auto\">\n          <mat-select class=\"select-encoding\" tabindex=\"0\" placeholder=\"Select\" [(ngModel)]=\"properties.recordFormat\"\n            #recordFormat (selectionChange)=\"onRecordFormatChange(recordFormat.value)\">\n            @for (recordFormat of recordFormatOptions; track recordFormat) {\n            <mat-option [value]=\"recordFormat\">\n              {{recordFormat}}</mat-option>\n            }\n          </mat-select>\n        </mat-form-field>\n        <label>Block Size :</label>\n        <mat-form-field>\n          <input matInput [pattern]=\"numericPatternExZero\" [(ngModel)]=\"properties.blockSize\" #blockSize=\"ngModel\"\n            [errorStateMatcher]=\"matcher\" (ngModelChange)=\"onBlockSizeChange(blockSize.value)\">\n          <mat-error>Invalid Block Size</mat-error>\n        </mat-form-field>\n      </div>\n    </div>\n  </mat-dialog-content>\n  <div [hidden]=\"isDirBlockValid\" class=\"errorClass\">{{dirBlockError}}</div>\n  <div [hidden]=\"isPrimeSpaceValid\" class=\"errorClass\">{{primarySpaceError}}</div>\n  <div [hidden]=\"isSecondSpaceValid\" class=\"errorClass\">{{secondarySpaceError}}</div>\n  <div [hidden]=\"isRecLengthValid\" class=\"errorClass\">{{recordLengthError}}</div>\n  <div [hidden]=\"isBlockSizeValid\" class=\"errorClass\">{{blockSizeError}}</div>\n  <div [hidden]=\"isRecordFormatValid\" class=\"errorClass\">{{recordFormatErrorMessage}}</div>\n  <div [hidden]=\"isAllocUnitValid\" class=\"errorClass\">{{allocUnitErrorMessage}}</div>\n  <mat-dialog-actions>\n    <button mat-button mat-stroked-button class=\"right\" color=\"primary\" [mat-dialog-close]=\"properties\"\n      [disabled]=\"!properties.name || !properties.allocationUnit || !properties.primarySpace || !properties.secondarySpace || !properties.directoryBlocks || !properties.recordFormat || !properties.recordLength || nameInput.invalid || primarySpaceInput.invalid || secSpaceInput.invalid || dirBlockInput.invalid || recLengthInput.invalid || blockSize.invalid || !isDirBlockValid || !isPrimeSpaceValid || !isSecondSpaceValid || !isRecLengthValid || !isBlockSizeValid || !isRecordFormatValid || !isAllocUnitValid\">\n      Save\n    </button>\n  </mat-dialog-actions>\n</div>\n<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->", styles: [".mat-mdc-dialog-title{font:500 20px/32px Roboto,Helvetica Neue,sans-serif;text-align:center}.header{flex-grow:1;text-align:center}.title-design{padding:2px;border-bottom:2px solid}.mat-mdc-dialog-container{width:1000px!important}.row:after{content:\"\";display:table;clear:both}.column1{float:left;margin-left:12px;width:45%;padding:10px}.column2{float:right;margin-left:30px;width:45%;padding:10px}.mat-mdc-dialog-content{box-sizing:border-box;padding:5px 0 5px 35px;width:940px;overflow:hidden}.mat-mdc-dialog-content label{float:left;width:175px;padding-top:10px;font-weight:500}.mat-mdc-form-field{font-size:inherit;font-weight:400;line-height:1.125;font-family:Roboto,Helvetica Neue,sans-serif;width:200px}.mat-mdc-select{font-family:Roboto,Helvetica Neue,sans-serif}.mat-mdc-option{background:#fff}.mat-mdc-option.mat-mdc-active{background:#dad9d9!important}.mat-mdc-option:hover{background:#efeeee}::ng-deep .mat-mdc-select-panel{box-shadow:0 0 5px 1px gray;margin-top:10px}.mat-mdc-dialog-actions{justify-content:flex-end}.required:before{content:\"* \";color:#000}.mandatory{font-style:Roboto,\"Helvetica Neue\",sans-serif;text-align:left;margin-left:20px}.errorClass{margin-left:20px;color:red;position:relative}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"], dependencies: [{ kind: "directive", type: i4.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i4.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i4.MaxLengthValidator, selector: "[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]", inputs: ["maxlength"] }, { kind: "directive", type: i4.PatternValidator, selector: "[pattern][formControlName],[pattern][formControl],[pattern][ngModel]", inputs: ["pattern"] }, { kind: "directive", type: i4.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: i1.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "component", type: i5.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i5.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "directive", type: i7.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly"], exportAs: ["matInput"] }, { kind: "component", type: i8.MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", exportAs: ["matButton"] }, { kind: "component", type: i6.MatSelect, selector: "mat-select", inputs: ["aria-describedby", "panelClass", "disabled", "disableRipple", "tabIndex", "hideSingleSelectionIndicator", "placeholder", "required", "multiple", "disableOptionCentering", "compareWith", "value", "aria-label", "aria-labelledby", "errorStateMatcher", "typeaheadDebounceInterval", "sortComparator", "id", "panelWidth"], outputs: ["openedChange", "opened", "closed", "selectionChange", "valueChange"], exportAs: ["matSelect"] }, { kind: "component", type: i9.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "component", type: i3.ZluxTabbingComponent, selector: "zlux-tab-trap", inputs: ["hiddenIds", "hiddenPos"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: CreateDatasetModal, decorators: [{
            type: Component,
            args: [{ selector: 'create-dataset-modal', template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"header\">\n      <h2 mat-dialog-title>\n        <span class=\"title-design\">ALLOCATE NEW DATA SET</span>\n      </h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n  </div>\n  <p class=\"mandatory\">Mandatory fields are marked with an asterisk</p>\n  <mat-dialog-content>\n    <label class=\"required\" style=\"margin-left: 6px\">Data Set Name:</label>\n    <mat-form-field floatLabel=\"auto\" [style.width.px]=300>\n      <input matInput type=\"text\" maxlength=\"44\" placeholder=\"High-level qualifier must start with a TSO ID\"\n        [pattern]=\"datasetNamePattern\" [(ngModel)]=\"properties.name\" #nameInput=\"ngModel\" [errorStateMatcher]=\"matcher\"\n        oninput=\"this.value = this.value.toUpperCase()\">\n      <mat-error>Invalid Name</mat-error>\n    </mat-form-field>\n    <div class=\"row\">\n      <div class=\"column1\">\n        <label class=\"required\">Data Set Name Type:</label>\n        <mat-form-field floatLabel=\"auto\">\n          <mat-select class=\"select-encoding\" tabindex=\"0\" placeholder=\"Blank for PS Dataset\"\n            [(ngModel)]=\"properties.datasetNameType\" #datasetNameType\n            (selectionChange)=\"setDatasetNameTypeProperties(datasetNameType.value)\">\n            <mat-option>Blank</mat-option>\n            @for (datasetNameType of datasetNameTypeOptions; track datasetNameType) {\n            <mat-option [value]=\"datasetNameType\">\n              {{datasetNameType}}</mat-option>\n            }\n          </mat-select>\n        </mat-form-field>\n      </div>\n      <div class=\"column2\">\n        <label>Data Set Organization:</label>\n        <mat-form-field>\n          <input matInput [(ngModel)]=\"properties.organization\" readonly #dsorg>\n        </mat-form-field>\n      </div>\n    </div>\n    <p></p>\n    <label style=\"margin-left: 310px; width: 148px; font-size: larger; font-weight: bold;\">TEMPLATE:</label>\n    <mat-form-field style=\"width: 150px; font-weight: bold; margin-top: 3px;\" floatLabel=\"auto\">\n      <mat-select class=\"select-encoding\" tabindex=\"0\" placeholder=\"Select\" [(ngModel)]=\"properties.template\"\n        #templateInput (selectionChange)=\"onTemplateChange(templateInput.value)\">\n        <mat-option>None</mat-option>\n        @for (template of templateOptions; track template) {\n        <mat-option [value]=\"template\">\n          {{template}}</mat-option>\n        }\n      </mat-select>\n    </mat-form-field>\n    <div class=\"row\">\n      <div class=\"column1\">\n        <label class=\"required\">Allocation Unit:</label>\n        <mat-form-field floatLabel=\"auto\">\n          <mat-select class=\"select-encoding\" tabindex=\"0\" placeholder=\"Select\" [(ngModel)]=\"properties.allocationUnit\"\n            #allocUnit (selectionChange)=\"onAllocUnitChange(allocUnit.value)\">\n            @for (allocationUnit of allocationUnitOptions; track allocationUnit) {\n            <mat-option [value]=\"allocationUnit\">\n              {{allocationUnit}}</mat-option>\n            }\n          </mat-select>\n        </mat-form-field>\n        <label class=\"required\">Primary Space:</label>\n        <mat-form-field>\n          <input matInput [pattern]=\"numericPatternExZero\" [(ngModel)]=\"properties.primarySpace\"\n            #primarySpaceInput=\"ngModel\" [errorStateMatcher]=\"matcher\"\n            (ngModelChange)=\"onPrimeSpaceChange(primarySpaceInput.value)\" #primeSpace>\n          <mat-error>Invalid Primary Space</mat-error>\n        </mat-form-field>\n        <label class=\"required\">Record Length:</label>\n        <mat-form-field>\n          <input matInput [pattern]=\"numericPattern\" [(ngModel)]=\"properties.recordLength\" #recLengthInput=\"ngModel\"\n            [errorStateMatcher]=\"matcher\" (ngModelChange)=\"onRecLengthChange(recLengthInput.value)\" #recordLength>\n          <mat-error>Invalid Record Length</mat-error>\n        </mat-form-field>\n        <label class=\"required\">Directory Blocks:</label>\n        <mat-form-field floatLabel=\"auto\">\n          <input matInput [pattern]=\"numericPattern\" placeholder=\"0 for PS Data Set\"\n            [(ngModel)]=\"properties.directoryBlocks\" #dirBlockInput=\"ngModel\" [errorStateMatcher]=\"matcher\"\n            (ngModelChange)=\"onDirBlockChange(dirBlockInput.value)\" #dirblocks>\n          <mat-error>Invalid Directory Blocks</mat-error>\n        </mat-form-field>\n      </div>\n      <div class=\"column2\">\n        <label>Average Record Unit:</label>\n        <mat-form-field floatLabel=\"auto\">\n          <mat-select class=\"select-encoding\" tabindex=\"0\" placeholder=\"Select\"\n            [(ngModel)]=\"properties.averageRecordUnit\">\n            @for (averageRecordUnit of recordUnitOptions; track averageRecordUnit) {\n            <mat-option [value]=\"averageRecordUnit\">\n              {{averageRecordUnit}}</mat-option>\n            }\n          </mat-select>\n        </mat-form-field>\n        <label class=\"required\">Secondary Space:</label>\n        <mat-form-field>\n          <input matInput [pattern]=\"numericPatternExZero\" [(ngModel)]=\"properties.secondarySpace\"\n            #secSpaceInput=\"ngModel\" [errorStateMatcher]=\"matcher\"\n            (ngModelChange)=\"onSecondSpaceChange(secSpaceInput.value)\" #secondSpace>\n          <mat-error>Invalid Secondary Space</mat-error>\n        </mat-form-field>\n        <label class=\"required\">Record Format:</label>\n        <mat-form-field floatLabel=\"auto\">\n          <mat-select class=\"select-encoding\" tabindex=\"0\" placeholder=\"Select\" [(ngModel)]=\"properties.recordFormat\"\n            #recordFormat (selectionChange)=\"onRecordFormatChange(recordFormat.value)\">\n            @for (recordFormat of recordFormatOptions; track recordFormat) {\n            <mat-option [value]=\"recordFormat\">\n              {{recordFormat}}</mat-option>\n            }\n          </mat-select>\n        </mat-form-field>\n        <label>Block Size :</label>\n        <mat-form-field>\n          <input matInput [pattern]=\"numericPatternExZero\" [(ngModel)]=\"properties.blockSize\" #blockSize=\"ngModel\"\n            [errorStateMatcher]=\"matcher\" (ngModelChange)=\"onBlockSizeChange(blockSize.value)\">\n          <mat-error>Invalid Block Size</mat-error>\n        </mat-form-field>\n      </div>\n    </div>\n  </mat-dialog-content>\n  <div [hidden]=\"isDirBlockValid\" class=\"errorClass\">{{dirBlockError}}</div>\n  <div [hidden]=\"isPrimeSpaceValid\" class=\"errorClass\">{{primarySpaceError}}</div>\n  <div [hidden]=\"isSecondSpaceValid\" class=\"errorClass\">{{secondarySpaceError}}</div>\n  <div [hidden]=\"isRecLengthValid\" class=\"errorClass\">{{recordLengthError}}</div>\n  <div [hidden]=\"isBlockSizeValid\" class=\"errorClass\">{{blockSizeError}}</div>\n  <div [hidden]=\"isRecordFormatValid\" class=\"errorClass\">{{recordFormatErrorMessage}}</div>\n  <div [hidden]=\"isAllocUnitValid\" class=\"errorClass\">{{allocUnitErrorMessage}}</div>\n  <mat-dialog-actions>\n    <button mat-button mat-stroked-button class=\"right\" color=\"primary\" [mat-dialog-close]=\"properties\"\n      [disabled]=\"!properties.name || !properties.allocationUnit || !properties.primarySpace || !properties.secondarySpace || !properties.directoryBlocks || !properties.recordFormat || !properties.recordLength || nameInput.invalid || primarySpaceInput.invalid || secSpaceInput.invalid || dirBlockInput.invalid || recLengthInput.invalid || blockSize.invalid || !isDirBlockValid || !isPrimeSpaceValid || !isSecondSpaceValid || !isRecLengthValid || !isBlockSizeValid || !isRecordFormatValid || !isAllocUnitValid\">\n      Save\n    </button>\n  </mat-dialog-actions>\n</div>\n<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->", styles: [".mat-mdc-dialog-title{font:500 20px/32px Roboto,Helvetica Neue,sans-serif;text-align:center}.header{flex-grow:1;text-align:center}.title-design{padding:2px;border-bottom:2px solid}.mat-mdc-dialog-container{width:1000px!important}.row:after{content:\"\";display:table;clear:both}.column1{float:left;margin-left:12px;width:45%;padding:10px}.column2{float:right;margin-left:30px;width:45%;padding:10px}.mat-mdc-dialog-content{box-sizing:border-box;padding:5px 0 5px 35px;width:940px;overflow:hidden}.mat-mdc-dialog-content label{float:left;width:175px;padding-top:10px;font-weight:500}.mat-mdc-form-field{font-size:inherit;font-weight:400;line-height:1.125;font-family:Roboto,Helvetica Neue,sans-serif;width:200px}.mat-mdc-select{font-family:Roboto,Helvetica Neue,sans-serif}.mat-mdc-option{background:#fff}.mat-mdc-option.mat-mdc-active{background:#dad9d9!important}.mat-mdc-option:hover{background:#efeeee}::ng-deep .mat-mdc-select-panel{box-shadow:0 0 5px 1px gray;margin-top:10px}.mat-mdc-dialog-actions{justify-content:flex-end}.required:before{content:\"* \";color:#000}.mandatory{font-style:Roboto,\"Helvetica Neue\",sans-serif;text-align:left;margin-left:20px}.errorClass{margin-left:20px;color:red;position:relative}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DIALOG_DATA]
                }] }], propDecorators: { dirblocks: [{
                type: ViewChild,
                args: ['dirblocks']
            }], primeSpace: [{
                type: ViewChild,
                args: ['primeSpace']
            }], allocUnit: [{
                type: ViewChild,
                args: ['allocUnit']
            }], secondSpace: [{
                type: ViewChild,
                args: ['secondSpace']
            }], recordLength: [{
                type: ViewChild,
                args: ['recordLength']
            }], recordFormat: [{
                type: ViewChild,
                args: ['recordFormat']
            }], dsorg: [{
                type: ViewChild,
                args: ['dsorg']
            }] } });

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
class CreateFileModal {
    constructor(data, http, snackBar) {
        this.http = http;
        this.snackBar = snackBar;
        this.folderPathObtainedFromNode = "";
        // Block unallowed characters and "." and ".." etc
        this.filePattern = /(([^\x00-\x1F!"$'\(\)*,\/:;<>\?\[\\\]\{\|\}\x7F\s]+)$)/;
        this.onFileCreate = new EventEmitter();
        const node = data.event;
        if (node.path) {
            this.dirPath = node.path;
        }
        else {
            this.dirPath = "";
        }
        this.fileName = "";
        this.folderPathObtainedFromNode = this.dirPath;
    }
    createFile() {
        const directoryPath = this.dirPath;
        const path = directoryPath + '/' + this.fileName;
        let onFileCreateResponse = new Map();
        onFileCreateResponse.set("pathAndName", this.dirPath + "/" + this.fileName);
        if (this.dirPath != this.folderPathObtainedFromNode) {
            //If the user changed the path obtained from the node or the node has never been opened...
            onFileCreateResponse.set("updateExistingTree", false); //then we can't update the tree.
        }
        else { //If the user kept the path obtained from the node...
            onFileCreateResponse.set("updateExistingTree", true); //then we can add that new folder into the existing node.
        }
        this.onFileCreate.emit(onFileCreateResponse); //then we can't update the tree.
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: CreateFileModal, deps: [{ token: MAT_DIALOG_DATA }, { token: i1$1.HttpClient }, { token: i3$1.MatSnackBar }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: CreateFileModal, selector: "create-file-modal", ngImport: i0, template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap hiddenIds=\"createfileclearicon1,createfileclearicon2\" hiddenPos=\"2,4\"></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"modal-icon-container\">\n      <!-- FA Icon is determined by class name, so we hardcode the style here -->\n      <mat-icon style=\"font-size: 30px; position: absolute;\">create_new_file</mat-icon>\n    </div>\n    <!-- <i class=\"{{fileIcon}}\" style=\"font-size: 30px;position: absolute;margin-top: 2px;margin-left: 3px;color: #000000;\"></i> -->\n    <div>\n      <h2 mat-dialog-title class=\"modal-content-body\">Create a File</h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n  </div>\n  <mat-dialog-content>\n    <label>File name:</label>\n    <mat-form-field style=\"margin-left: 15px;\">\n      <input id=\"create-file-input\" name=\"name\" [pattern]=\"filePattern\" matInput type=\"text\" [(ngModel)]=\"fileName\">\n      @if (fileName) {\n      <button class=\"modal-clear-button\" mat-button matSuffix mat-icon-button tabindex=\"-1\" aria-label=\"Clear\"\n        (click)=\"fileName=''\">\n        <mat-icon class=\"create-file-clear-icon\">close</mat-icon>\n      </button>\n      }\n    </mat-form-field>\n  </mat-dialog-content>\n\n  <mat-dialog-content>\n    <label>Path:</label>\n    <mat-form-field style=\"margin-left: 45px;\">\n      <input id=\"create-path-input\" [pattern]=\"\" matInput type=\"text\" [(ngModel)]=\"dirPath\">\n      @if (dirPath) {\n      <button class=\"modal-clear-button\" mat-button matSuffix mat-icon-button tabindex=\"-1\" aria-label=\"Clear\"\n        (click)=\"dirPath=''\">\n        <mat-icon class=\"create-file-clear-icon\">close</mat-icon>\n      </button>\n      }\n    </mat-form-field>\n  </mat-dialog-content>\n  <mat-dialog-actions>\n    <button mat-button mat-dialog-close class=\"modal-mat-button create\" (click)=\"createFile()\"\n      [disabled]=\"!fileName || !dirPath\">Create</button>\n    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->\n  </mat-dialog-actions>\n</div>\n<!--\n    This program and the accompanying materials are\n    made available under the terms of the Eclipse Public License v2.0 which accompanies\n    this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n    SPDX-License-Identifier: EPL-2.0\n\n    Copyright Contributors to the Zowe Project.\n    -->", styles: [".create-file-clear-icon{font-size:14px;height:5px}.mat-mdc-dialog-content{padding-top:0!important;padding-bottom:0!important}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"], dependencies: [{ kind: "directive", type: i4.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i4.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i4.PatternValidator, selector: "[pattern][formControlName],[pattern][formControl],[pattern][ngModel]", inputs: ["pattern"] }, { kind: "directive", type: i4.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: i1.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "component", type: i5.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i5.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "component", type: i6$1.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "directive", type: i7.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly"], exportAs: ["matInput"] }, { kind: "component", type: i8.MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", exportAs: ["matButton"] }, { kind: "component", type: i8.MatIconButton, selector: "button[mat-icon-button]", exportAs: ["matButton"] }, { kind: "component", type: i3.ZluxTabbingComponent, selector: "zlux-tab-trap", inputs: ["hiddenIds", "hiddenPos"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: CreateFileModal, decorators: [{
            type: Component,
            args: [{ selector: 'create-file-modal', template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap hiddenIds=\"createfileclearicon1,createfileclearicon2\" hiddenPos=\"2,4\"></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"modal-icon-container\">\n      <!-- FA Icon is determined by class name, so we hardcode the style here -->\n      <mat-icon style=\"font-size: 30px; position: absolute;\">create_new_file</mat-icon>\n    </div>\n    <!-- <i class=\"{{fileIcon}}\" style=\"font-size: 30px;position: absolute;margin-top: 2px;margin-left: 3px;color: #000000;\"></i> -->\n    <div>\n      <h2 mat-dialog-title class=\"modal-content-body\">Create a File</h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n  </div>\n  <mat-dialog-content>\n    <label>File name:</label>\n    <mat-form-field style=\"margin-left: 15px;\">\n      <input id=\"create-file-input\" name=\"name\" [pattern]=\"filePattern\" matInput type=\"text\" [(ngModel)]=\"fileName\">\n      @if (fileName) {\n      <button class=\"modal-clear-button\" mat-button matSuffix mat-icon-button tabindex=\"-1\" aria-label=\"Clear\"\n        (click)=\"fileName=''\">\n        <mat-icon class=\"create-file-clear-icon\">close</mat-icon>\n      </button>\n      }\n    </mat-form-field>\n  </mat-dialog-content>\n\n  <mat-dialog-content>\n    <label>Path:</label>\n    <mat-form-field style=\"margin-left: 45px;\">\n      <input id=\"create-path-input\" [pattern]=\"\" matInput type=\"text\" [(ngModel)]=\"dirPath\">\n      @if (dirPath) {\n      <button class=\"modal-clear-button\" mat-button matSuffix mat-icon-button tabindex=\"-1\" aria-label=\"Clear\"\n        (click)=\"dirPath=''\">\n        <mat-icon class=\"create-file-clear-icon\">close</mat-icon>\n      </button>\n      }\n    </mat-form-field>\n  </mat-dialog-content>\n  <mat-dialog-actions>\n    <button mat-button mat-dialog-close class=\"modal-mat-button create\" (click)=\"createFile()\"\n      [disabled]=\"!fileName || !dirPath\">Create</button>\n    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->\n  </mat-dialog-actions>\n</div>\n<!--\n    This program and the accompanying materials are\n    made available under the terms of the Eclipse Public License v2.0 which accompanies\n    this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n    SPDX-License-Identifier: EPL-2.0\n\n    Copyright Contributors to the Zowe Project.\n    -->", styles: [".create-file-clear-icon{font-size:14px;height:5px}.mat-mdc-dialog-content{padding-top:0!important;padding-bottom:0!important}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"] }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DIALOG_DATA]
                }] }, { type: i1$1.HttpClient }, { type: i3$1.MatSnackBar }] });

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
class CreateFolderModal {
    constructor(data) {
        this.folderName = "";
        this.folderPath = "";
        this.folderPathObtainedFromNode = "";
        // Block unallowed characters and "." and ".." etc
        this.folderPattern = /(([^\x00-\x1F!"$'\(\)*,\/:;<>\?\[\\\]\{\|\}\x7F\s]+)$)/;
        this.onCreate = new EventEmitter();
        const node = data.event;
        if (node.path) {
            this.folderPath = node.path;
        }
        else {
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
        }
        else { //If the user kept the path obtained from the node...
            onCreateResponse.set("updateExistingTree", true); //then we can add that new folder into the existing node.
        }
        this.onCreate.emit(onCreateResponse); //then we can't update the tree.
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: CreateFolderModal, deps: [{ token: MAT_DIALOG_DATA }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: CreateFolderModal, selector: "create-folder-modal", ngImport: i0, template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap hiddenIds=\"createfolderclearicon1,createfolderclearicon2\" hiddenPos=\"2,4\"></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"modal-icon-container\">\n      <!-- FA Icon is determined by class name, so we hardcode the style here -->\n      <mat-icon style=\"font-size: 30px; position: absolute;\">create_new_folder</mat-icon>\n    </div>\n    <div>\n      <h2 mat-dialog-title class=\"modal-content-body\">Create a Directory</h2>\n    </div>\n    <!-- <i class=\"{{fileIcon}}\" style=\"font-size: 30px;position: absolute;margin-top: 2px;margin-left: 3px;color: #000000;\"></i> -->\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n  </div>\n  <mat-dialog-content>\n    <label>Directory name:</label>\n    <mat-form-field style=\"margin-left: 15px;\">\n      <input id=\"create-directory-input\" name=\"name\" [pattern]=\"folderPattern\" matInput type=\"text\"\n        [(ngModel)]=\"folderName\">\n      @if (folderName) {\n      <button class=\"modal-clear-button\" mat-button matSuffix mat-icon-button tabindex=\"-1\" aria-label=\"Clear\"\n        (click)=\"folderName=''\">\n        <mat-icon class=\"create-folder-clear-icon\">close</mat-icon>\n      </button>\n      }\n    </mat-form-field>\n  </mat-dialog-content>\n\n  <mat-dialog-content>\n    <label>Path:</label>\n    <mat-form-field style=\"margin-left: 80px;\">\n      <input id=\"create-path-input\" [pattern]=\"\" matInput type=\"text\" [(ngModel)]=\"folderPath\">\n      @if (folderPath) {\n      <button class=\"modal-clear-button\" mat-button matSuffix mat-icon-button tabindex=\"-1\" aria-label=\"Clear\"\n        (click)=\"folderPath=''\">\n        <mat-icon class=\"create-folder-clear-icon\">close</mat-icon>\n      </button>\n      }\n    </mat-form-field>\n  </mat-dialog-content>\n\n  <mat-dialog-actions>\n    <button mat-button mat-dialog-close class=\"modal-mat-button create\" (click)=\"createFolder()\">Create</button>\n    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->\n  </mat-dialog-actions>\n</div>\n<!--\n    This program and the accompanying materials are\n    made available under the terms of the Eclipse Public License v2.0 which accompanies\n    this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n    SPDX-License-Identifier: EPL-2.0\n\n    Copyright Contributors to the Zowe Project.\n    -->", styles: [".create-folder-clear-icon{font-size:14px;height:5px}.mat-mdc-dialog-content{padding-top:0!important;padding-bottom:0!important}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"], dependencies: [{ kind: "directive", type: i4.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i4.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i4.PatternValidator, selector: "[pattern][formControlName],[pattern][formControl],[pattern][ngModel]", inputs: ["pattern"] }, { kind: "directive", type: i4.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "directive", type: i1.MatDialogContent, selector: "[mat-dialog-content], mat-dialog-content, [matDialogContent]" }, { kind: "component", type: i5.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i5.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "component", type: i6$1.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "directive", type: i7.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly"], exportAs: ["matInput"] }, { kind: "component", type: i8.MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", exportAs: ["matButton"] }, { kind: "component", type: i8.MatIconButton, selector: "button[mat-icon-button]", exportAs: ["matButton"] }, { kind: "component", type: i3.ZluxTabbingComponent, selector: "zlux-tab-trap", inputs: ["hiddenIds", "hiddenPos"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: CreateFolderModal, decorators: [{
            type: Component,
            args: [{ selector: 'create-folder-modal', template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap hiddenIds=\"createfolderclearicon1,createfolderclearicon2\" hiddenPos=\"2,4\"></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"modal-icon-container\">\n      <!-- FA Icon is determined by class name, so we hardcode the style here -->\n      <mat-icon style=\"font-size: 30px; position: absolute;\">create_new_folder</mat-icon>\n    </div>\n    <div>\n      <h2 mat-dialog-title class=\"modal-content-body\">Create a Directory</h2>\n    </div>\n    <!-- <i class=\"{{fileIcon}}\" style=\"font-size: 30px;position: absolute;margin-top: 2px;margin-left: 3px;color: #000000;\"></i> -->\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n  </div>\n  <mat-dialog-content>\n    <label>Directory name:</label>\n    <mat-form-field style=\"margin-left: 15px;\">\n      <input id=\"create-directory-input\" name=\"name\" [pattern]=\"folderPattern\" matInput type=\"text\"\n        [(ngModel)]=\"folderName\">\n      @if (folderName) {\n      <button class=\"modal-clear-button\" mat-button matSuffix mat-icon-button tabindex=\"-1\" aria-label=\"Clear\"\n        (click)=\"folderName=''\">\n        <mat-icon class=\"create-folder-clear-icon\">close</mat-icon>\n      </button>\n      }\n    </mat-form-field>\n  </mat-dialog-content>\n\n  <mat-dialog-content>\n    <label>Path:</label>\n    <mat-form-field style=\"margin-left: 80px;\">\n      <input id=\"create-path-input\" [pattern]=\"\" matInput type=\"text\" [(ngModel)]=\"folderPath\">\n      @if (folderPath) {\n      <button class=\"modal-clear-button\" mat-button matSuffix mat-icon-button tabindex=\"-1\" aria-label=\"Clear\"\n        (click)=\"folderPath=''\">\n        <mat-icon class=\"create-folder-clear-icon\">close</mat-icon>\n      </button>\n      }\n    </mat-form-field>\n  </mat-dialog-content>\n\n  <mat-dialog-actions>\n    <button mat-button mat-dialog-close class=\"modal-mat-button create\" (click)=\"createFolder()\">Create</button>\n    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->\n  </mat-dialog-actions>\n</div>\n<!--\n    This program and the accompanying materials are\n    made available under the terms of the Eclipse Public License v2.0 which accompanies\n    this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n    SPDX-License-Identifier: EPL-2.0\n\n    Copyright Contributors to the Zowe Project.\n    -->", styles: [".create-folder-clear-icon{font-size:14px;height:5px}.mat-mdc-dialog-content{padding-top:0!important;padding-bottom:0!important}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"] }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DIALOG_DATA]
                }] }] });

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
class DatasetPropertiesModal {
    constructor(data) {
        this.datasetName = '';
        this.datasetCSIEntryType = '';
        this.datasetIsPDS = '';
        this.datasetMaxRecordLen = 0;
        this.datasetOrganization = '';
        this.datasetBlockSize = 0;
        this.datasetCarriageControl = '';
        this.datasetIsBlocked = '';
        this.datasetIsSpanned = '';
        this.datasetIsStandard = '';
        this.datasetRecordFormat = '';
        this.datasetVolser = '';
        this.datasetIcon = '';
        this.datasetSummary = '';
        const node = data.event;
        if (node.data) {
            const data = node.data;
            this.datasetName = data.fileName;
            this.datasetCSIEntryType = this.formatCSIEntryType(data.datasetAttrs.csiEntryType);
            if (data.datasetAttrs.dsorg) {
                if (data.datasetAttrs.dsorg.isPDSDir) {
                    if (data.datasetAttrs.dsorg.isPDSE) {
                        this.datasetIsPDS = "✓ (PDS/E)";
                    }
                    else {
                        this.datasetIsPDS = "✓";
                    }
                }
                this.datasetOrganization = this.formatOrganization(data.datasetAttrs.dsorg.organization);
                this.datasetBlockSize = data.datasetAttrs.dsorg.totalBlockSize;
                this.datasetCarriageControl = data.datasetAttrs.recfm.carriageControl;
                if (data.datasetAttrs.recfm.isBlocked) {
                    this.datasetIsBlocked = "✓";
                }
                else {
                    this.datasetIsBlocked = "No";
                }
                if (data.datasetAttrs.recfm.isSpanned) {
                    this.datasetIsSpanned = "✓";
                }
                if (data.datasetAttrs.recfm.isStandard) {
                    this.datasetIsStandard = "✓";
                }
                this.datasetRecordFormat = this.formatRecordFormat(data.datasetAttrs.recfm.recordLength);
                this.datasetMaxRecordLen = data.datasetAttrs.dsorg.maxRecordLen;
            }
            this.datasetVolser = data.datasetAttrs.volser;
        }
        if (node.icon) {
            this.datasetIcon = node.icon;
        }
        else if (node.collapsedIcon) {
            this.datasetIcon = node.collapsedIcon;
        }
        this.datasetSummary = this.formatSummary(this.datasetOrganization, this.datasetRecordFormat, this.datasetMaxRecordLen);
    }
    ngOnInit() {
    }
    formatRecordFormat(recordFormat) {
        switch (recordFormat) {
            case "U":
                recordFormat = "U - Undefined";
                break;
            case "F":
                recordFormat = "F - Fixed";
                break;
            case "V":
                recordFormat = "V - Variable";
                break;
        }
        return recordFormat;
    }
    formatSummary(org, recfm, reclen) {
        let summary = "N/A";
        if (org.substring(0, 2) == "PS") {
            if (recfm[0] == 'F') {
                if (reclen > 0) {
                    summary = "FB" + reclen;
                }
                else {
                    summary = "FB";
                }
            }
            else if (recfm[0] == 'V') {
                if (reclen > 0) {
                    summary = "VB" + reclen;
                }
                else {
                    summary = "VB";
                }
            }
        }
        else if (org.substring(0, 2) == "PO") {
            if (this.datasetIsPDS.length == 0) { //PDS is false
                if (reclen > 0) {
                    summary = "HFS" + reclen;
                }
                else {
                    summary = "HFS";
                }
            }
            else if (this.datasetIsPDS.length == 1) { //PDS is true
                if (reclen > 0) {
                    summary = "PDS" + reclen;
                }
                else {
                    summary = "PDS";
                }
            }
            else { // PDS/E is true
                if (reclen > 0) {
                    summary = "PDSE" + reclen;
                }
                else {
                    summary = "PDSE";
                }
            }
        }
        else if (org.substring(0, 2) == "VS") {
            if (reclen > 0) {
                summary = "VSAM" + reclen;
            }
            else {
                summary = "VSAM";
            }
        }
        else if (org.substring(0, 2) == "DA") {
            if (reclen > 0) {
                summary = "DA" + reclen;
            }
            else {
                summary = "DA";
            }
        }
        return summary;
    }
    formatOrganization(organization) {
        if (organization) {
            switch (organization) {
                case "sequential":
                    organization = "PS - Sequential";
                    break;
                case "hfs":
                    organization = "PO - Partitioned";
                    break;
                case "partitioned":
                    organization = "PO - Partitioned";
                    break;
                case "vsam":
                    organization = "VS - VSAM";
                    break;
            }
        }
        else {
            organization = "DA - Direct Access";
        }
        return organization;
    }
    formatCSIEntryType(CSIEntryType) {
        switch (CSIEntryType) {
            case "A":
                CSIEntryType = "A - non-VSAM data set";
                break;
            case "B":
                CSIEntryType = "B - Generation data group";
                break;
            case "C":
                CSIEntryType = "C - VSAM Cluster";
                break;
            case "D":
                CSIEntryType = "D - VSAM Data";
                break;
            case "G":
                CSIEntryType = "G - Alternate index";
                break;
            case "H":
                CSIEntryType = "H - Generation data set";
                break;
            case "I":
                CSIEntryType = "I - VSAM Index";
                break;
            case "L":
                CSIEntryType = "L - Tape volume catalog library";
                break;
            case "R":
                CSIEntryType = "R - VSAM Path";
                break;
            case "U":
                CSIEntryType = "U - User catalog connector";
                break;
            case "W":
                CSIEntryType = "W - Tape volume catalog volume";
                break;
            case "X":
                CSIEntryType = "X - Alias";
                break;
        }
        return CSIEntryType;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: DatasetPropertiesModal, deps: [{ token: MAT_DIALOG_DATA }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: DatasetPropertiesModal, selector: "dataset-properties-modal", ngImport: i0, template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"modal-icon-container\">\n      <!-- FA Icon is determined by class name, so we hardcode the style here -->\n      <i class=\"{{datasetIcon}}\" style=\"font-size:24px; position: absolute; margin-top: 4px; margin-left: 3px;\"></i>\n    </div>\n    <div>\n      <h2 mat-dialog-title class=\"modal-mat-header\">{{datasetName}} - Properties</h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n  </div>\n  <!-- Main properties (non X type, non C (VSAM) type, non MIGRAT/ARCIVE status) -->\n  @if (datasetCSIEntryType[0] != 'X' && datasetCSIEntryType[0] != 'C' && datasetVolser != 'MIGRAT' && datasetVolser !=\n  'ARCIVE') {\n  <div class=\"modal-row\">\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">Summary: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">CSI Entry Type: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">Organization: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">Record Format: </div>\n        </mat-list-item>\n        @if (datasetRecordFormat) {\n        <mat-list-item>\n          <div class=\"selectable-text\">Record Length: </div>\n        </mat-list-item>\n        }\n      </mat-list>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetSummary}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetCSIEntryType}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetOrganization}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetRecordFormat}}</div>\n        </mat-list-item>\n        @if (datasetRecordFormat) {\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetMaxRecordLen}}</div>\n        </mat-list-item>\n        }\n      </mat-list>\n    </div>\n  </div>\n  }\n\n  <!-- If the dataset is an Alias (X) type -->\n  @if (datasetCSIEntryType[0] == 'X' && datasetVolser != 'MIGRAT' && datasetVolser != 'ARCIVE') {\n  <div class=\"modal-row\">\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">Dataset Name: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">CSI Entry Type: </div>\n        </mat-list-item>\n      </mat-list>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\" style=\"color: #c6c6c6;\">Not implemented yet</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetCSIEntryType}}</div>\n        </mat-list-item>\n      </mat-list>\n    </div>\n  </div>\n  }\n\n  <!-- If the dataset is Migrate/Archive status -->\n  @if (datasetVolser == 'MIGRAT' || datasetVolser == 'ARCIVE') {\n  <div class=\"modal-row\">\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">CSI Entry Type: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">Volume Serial: </div>\n        </mat-list-item>\n      </mat-list>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetCSIEntryType}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetVolser}}</div>\n        </mat-list-item>\n      </mat-list>\n    </div>\n  </div>\n  }\n\n  <!-- If the dataset is a C type (VSAM) -->\n  <!-- TODO: Enhance ZSS API to allow for greater VSAM property support -->\n  @if (datasetCSIEntryType[0] == 'C' && datasetVolser != 'MIGRAT' && datasetVolser != 'ARCIVE') {\n  <div class=\"modal-row\">\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">CSI Entry Type: </div>\n        </mat-list-item>\n      </mat-list>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetCSIEntryType}}</div>\n        </mat-list-item>\n      </mat-list>\n    </div>\n  </div>\n  }\n\n  <hr style=\"margin-top: 5px; margin-bottom: 5px;\">\n\n  <!-- Other properties (non X type, non C (VSAM) type, non MIGRAT/ARCIVE status) -->\n  @if (datasetCSIEntryType[0] != 'X' && datasetCSIEntryType[0] != 'C' && datasetVolser != 'MIGRAT' && datasetVolser !=\n  'ARCIVE') {\n  <div class=\"modal-row\">\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">Block Size: </div>\n        </mat-list-item>\n        @if (datasetIsPDS.length > 0) {\n        <mat-list-item>\n          <div class=\"selectable-text\">PDS: </div>\n        </mat-list-item>\n        }\n        <mat-list-item>\n          <div class=\"selectable-text\">Blocked: </div>\n        </mat-list-item>\n        @if (datasetRecordFormat == 'variable') {\n        <mat-list-item>\n          <div class=\"selectable-text\">Spanned: </div>\n        </mat-list-item>\n        }\n        @if (datasetRecordFormat == 'fixed') {\n        <mat-list-item>\n          <div class=\"selectable-text\">Standard: </div>\n        </mat-list-item>\n        }\n        <mat-list-item>\n          <div class=\"selectable-text\">Carriage Control: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">Volume Serial: </div>\n        </mat-list-item>\n      </mat-list>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetBlockSize}}</div>\n        </mat-list-item>\n        @if (datasetIsPDS.length > 0) {\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetIsPDS}}</div>\n        </mat-list-item>\n        }\n        <!-- We use target=\"_blank\" here to redirect links to a new blank tab -->\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetIsBlocked}} <a\n              href=\"https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.1.0/com.ibm.zos.v2r1.idad400/da.htm\"\n              target=\"_blank\">\n              <i class=\"fa fa-question-circle dataset-properties-question-circle\"></i>\n            </a></div>\n        </mat-list-item>\n        @if (datasetRecordFormat == 'variable') {\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetIsSpanned}} <a\n              href=\"https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.2.0/com.ibm.zos.v2r2.idad400/span.htm\"\n              target=\"_blank\">\n              <i class=\"fa fa-question-circle dataset-properties-question-circle\"></i>\n            </a></div>\n        </mat-list-item>\n        }\n        @if (datasetRecordFormat == 'fixed') {\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetIsStandard}} <a\n              href=\"https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.1.0/com.ibm.zos.v2r1.idad400/fixstan.htm\"\n              target=\"_blank\">\n              <i class=\"fa fa-question-circle dataset-properties-question-circle\"></i>\n            </a></div>\n        </mat-list-item>\n        }\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetCarriageControl}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetVolser}}</div>\n        </mat-list-item>\n      </mat-list>\n    </div>\n  </div>\n  }\n</div>\n\n<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->", styles: [".dataset-properties-header{min-width:375px;white-space:nowrap;margin-top:-28px;margin-left:40px}.dataset-properties-question-circle{font-size:24px;color:#5e9cff;margin-left:8px;margin-top:-1px;position:absolute}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"], dependencies: [{ kind: "directive", type: i1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "component", type: i2.MatList, selector: "mat-list", exportAs: ["matList"] }, { kind: "component", type: i2.MatListItem, selector: "mat-list-item, a[mat-list-item], button[mat-list-item]", inputs: ["activated"], exportAs: ["matListItem"] }, { kind: "component", type: i3.ZluxTabbingComponent, selector: "zlux-tab-trap", inputs: ["hiddenIds", "hiddenPos"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: DatasetPropertiesModal, decorators: [{
            type: Component,
            args: [{ selector: 'dataset-properties-modal', template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"modal-icon-container\">\n      <!-- FA Icon is determined by class name, so we hardcode the style here -->\n      <i class=\"{{datasetIcon}}\" style=\"font-size:24px; position: absolute; margin-top: 4px; margin-left: 3px;\"></i>\n    </div>\n    <div>\n      <h2 mat-dialog-title class=\"modal-mat-header\">{{datasetName}} - Properties</h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n  </div>\n  <!-- Main properties (non X type, non C (VSAM) type, non MIGRAT/ARCIVE status) -->\n  @if (datasetCSIEntryType[0] != 'X' && datasetCSIEntryType[0] != 'C' && datasetVolser != 'MIGRAT' && datasetVolser !=\n  'ARCIVE') {\n  <div class=\"modal-row\">\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">Summary: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">CSI Entry Type: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">Organization: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">Record Format: </div>\n        </mat-list-item>\n        @if (datasetRecordFormat) {\n        <mat-list-item>\n          <div class=\"selectable-text\">Record Length: </div>\n        </mat-list-item>\n        }\n      </mat-list>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetSummary}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetCSIEntryType}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetOrganization}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetRecordFormat}}</div>\n        </mat-list-item>\n        @if (datasetRecordFormat) {\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetMaxRecordLen}}</div>\n        </mat-list-item>\n        }\n      </mat-list>\n    </div>\n  </div>\n  }\n\n  <!-- If the dataset is an Alias (X) type -->\n  @if (datasetCSIEntryType[0] == 'X' && datasetVolser != 'MIGRAT' && datasetVolser != 'ARCIVE') {\n  <div class=\"modal-row\">\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">Dataset Name: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">CSI Entry Type: </div>\n        </mat-list-item>\n      </mat-list>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\" style=\"color: #c6c6c6;\">Not implemented yet</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetCSIEntryType}}</div>\n        </mat-list-item>\n      </mat-list>\n    </div>\n  </div>\n  }\n\n  <!-- If the dataset is Migrate/Archive status -->\n  @if (datasetVolser == 'MIGRAT' || datasetVolser == 'ARCIVE') {\n  <div class=\"modal-row\">\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">CSI Entry Type: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">Volume Serial: </div>\n        </mat-list-item>\n      </mat-list>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetCSIEntryType}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetVolser}}</div>\n        </mat-list-item>\n      </mat-list>\n    </div>\n  </div>\n  }\n\n  <!-- If the dataset is a C type (VSAM) -->\n  <!-- TODO: Enhance ZSS API to allow for greater VSAM property support -->\n  @if (datasetCSIEntryType[0] == 'C' && datasetVolser != 'MIGRAT' && datasetVolser != 'ARCIVE') {\n  <div class=\"modal-row\">\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">CSI Entry Type: </div>\n        </mat-list-item>\n      </mat-list>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetCSIEntryType}}</div>\n        </mat-list-item>\n      </mat-list>\n    </div>\n  </div>\n  }\n\n  <hr style=\"margin-top: 5px; margin-bottom: 5px;\">\n\n  <!-- Other properties (non X type, non C (VSAM) type, non MIGRAT/ARCIVE status) -->\n  @if (datasetCSIEntryType[0] != 'X' && datasetCSIEntryType[0] != 'C' && datasetVolser != 'MIGRAT' && datasetVolser !=\n  'ARCIVE') {\n  <div class=\"modal-row\">\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">Block Size: </div>\n        </mat-list-item>\n        @if (datasetIsPDS.length > 0) {\n        <mat-list-item>\n          <div class=\"selectable-text\">PDS: </div>\n        </mat-list-item>\n        }\n        <mat-list-item>\n          <div class=\"selectable-text\">Blocked: </div>\n        </mat-list-item>\n        @if (datasetRecordFormat == 'variable') {\n        <mat-list-item>\n          <div class=\"selectable-text\">Spanned: </div>\n        </mat-list-item>\n        }\n        @if (datasetRecordFormat == 'fixed') {\n        <mat-list-item>\n          <div class=\"selectable-text\">Standard: </div>\n        </mat-list-item>\n        }\n        <mat-list-item>\n          <div class=\"selectable-text\">Carriage Control: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">Volume Serial: </div>\n        </mat-list-item>\n      </mat-list>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetBlockSize}}</div>\n        </mat-list-item>\n        @if (datasetIsPDS.length > 0) {\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetIsPDS}}</div>\n        </mat-list-item>\n        }\n        <!-- We use target=\"_blank\" here to redirect links to a new blank tab -->\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetIsBlocked}} <a\n              href=\"https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.1.0/com.ibm.zos.v2r1.idad400/da.htm\"\n              target=\"_blank\">\n              <i class=\"fa fa-question-circle dataset-properties-question-circle\"></i>\n            </a></div>\n        </mat-list-item>\n        @if (datasetRecordFormat == 'variable') {\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetIsSpanned}} <a\n              href=\"https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.2.0/com.ibm.zos.v2r2.idad400/span.htm\"\n              target=\"_blank\">\n              <i class=\"fa fa-question-circle dataset-properties-question-circle\"></i>\n            </a></div>\n        </mat-list-item>\n        }\n        @if (datasetRecordFormat == 'fixed') {\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetIsStandard}} <a\n              href=\"https://www.ibm.com/support/knowledgecenter/en/SSLTBW_2.1.0/com.ibm.zos.v2r1.idad400/fixstan.htm\"\n              target=\"_blank\">\n              <i class=\"fa fa-question-circle dataset-properties-question-circle\"></i>\n            </a></div>\n        </mat-list-item>\n        }\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetCarriageControl}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{datasetVolser}}</div>\n        </mat-list-item>\n      </mat-list>\n    </div>\n  </div>\n  }\n</div>\n\n<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->", styles: [".dataset-properties-header{min-width:375px;white-space:nowrap;margin-top:-28px;margin-left:40px}.dataset-properties-question-circle{font-size:24px;color:#5e9cff;margin-left:8px;margin-top:-1px;position:absolute}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"] }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DIALOG_DATA]
                }] }] });

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
class DeleteFileModal {
    constructor(data) {
        this.fileName = '';
        this.fileIcon = '';
        this.onDelete = new EventEmitter();
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
        }
        else {
            return this.node.path;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: DeleteFileModal, deps: [{ token: MAT_DIALOG_DATA }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.0.7", type: DeleteFileModal, selector: "delete-file-modal", ngImport: i0, template: "<!-- \r\n  This program and the accompanying materials are\r\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\r\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n  \r\n  SPDX-License-Identifier: EPL-2.0\r\n  \r\n  Copyright Contributors to the Zowe Project.\r\n-->\r\n<zlux-tab-trap></zlux-tab-trap>\r\n<!-- FA Icon is determined by class name, so we hardcode the style here -->\r\n<div class=\"padding-1\">\r\n  <div class=\"d-flex\">\r\n    <div class=\"modal-icon-container\">\r\n      <i class=\"{{fileIcon}}\"\r\n        style=\"font-size: 30px; position: absolute; margin-top: 2px; margin-left: 3px; color: #e64242;padding: 1rem;\"></i>\r\n    </div>\r\n    <div>\r\n      <h2 mat-dialog-title class=\"delete-content-body\">Are you sure you wish to delete</h2>\r\n    </div>\r\n    <div>\r\n      <button mat-dialog-close class=\"close-dialog-btn padding-1\"><i class=\"fa fa-close\"></i></button>\r\n    </div>\r\n  </div>\r\n  <h2 mat-dialog-title class=\"delete-content-body\">{{getFileName()}}?</h2>\r\n  <mat-dialog-actions>\r\n    <button mat-button mat-dialog-close class=\"modal-mat-button-delete\" (click)=\"deleteFileOrFolder()\">Delete</button>\r\n    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->\r\n  </mat-dialog-actions>\r\n</div>\r\n\r\n<!-- \r\n  This program and the accompanying materials are\r\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\r\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n  \r\n  SPDX-License-Identifier: EPL-2.0\r\n  \r\n  Copyright Contributors to the Zowe Project.\r\n-->", styles: [".delete-content-body{margin-left:40px;margin-bottom:-5px;font-size:larger;min-width:400px}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"], dependencies: [{ kind: "directive", type: i1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "component", type: i8.MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", exportAs: ["matButton"] }, { kind: "component", type: i3.ZluxTabbingComponent, selector: "zlux-tab-trap", inputs: ["hiddenIds", "hiddenPos"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: DeleteFileModal, decorators: [{
            type: Component,
            args: [{ selector: 'delete-file-modal', template: "<!-- \r\n  This program and the accompanying materials are\r\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\r\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n  \r\n  SPDX-License-Identifier: EPL-2.0\r\n  \r\n  Copyright Contributors to the Zowe Project.\r\n-->\r\n<zlux-tab-trap></zlux-tab-trap>\r\n<!-- FA Icon is determined by class name, so we hardcode the style here -->\r\n<div class=\"padding-1\">\r\n  <div class=\"d-flex\">\r\n    <div class=\"modal-icon-container\">\r\n      <i class=\"{{fileIcon}}\"\r\n        style=\"font-size: 30px; position: absolute; margin-top: 2px; margin-left: 3px; color: #e64242;padding: 1rem;\"></i>\r\n    </div>\r\n    <div>\r\n      <h2 mat-dialog-title class=\"delete-content-body\">Are you sure you wish to delete</h2>\r\n    </div>\r\n    <div>\r\n      <button mat-dialog-close class=\"close-dialog-btn padding-1\"><i class=\"fa fa-close\"></i></button>\r\n    </div>\r\n  </div>\r\n  <h2 mat-dialog-title class=\"delete-content-body\">{{getFileName()}}?</h2>\r\n  <mat-dialog-actions>\r\n    <button mat-button mat-dialog-close class=\"modal-mat-button-delete\" (click)=\"deleteFileOrFolder()\">Delete</button>\r\n    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->\r\n  </mat-dialog-actions>\r\n</div>\r\n\r\n<!-- \r\n  This program and the accompanying materials are\r\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\r\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n  \r\n  SPDX-License-Identifier: EPL-2.0\r\n  \r\n  Copyright Contributors to the Zowe Project.\r\n-->", styles: [".delete-content-body{margin-left:40px;margin-bottom:-5px;font-size:larger;min-width:400px}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"] }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DIALOG_DATA]
                }] }] });

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
const quickSnackbarOptions = { duration: 3500, panelClass: 'center' };
const defaultSnackbarOptions = { duration: 5000, panelClass: 'center' };
const longSnackbarOptions = { duration: 8000, panelClass: 'center' };
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
class FileOwnershipModal {
    constructor(data, dialogRef, http, snackBar) {
        this.dialogRef = dialogRef;
        this.http = http;
        this.snackBar = snackBar;
        this.name = '';
        this.path = '';
        this.mode = 0;
        this.modeSym = '';
        this.icon = '';
        this.owner = '';
        this.group = '';
        this.isDirectory = false;
        this.recursive = false;
        this.node = null;
        this.folderName = '';
        this.folderPath = '';
        this.node = data.event;
        this.name = this.node.name;
        this.path = this.node.path;
        this.mode = this.node.mode;
        this.owner = this.node.owner;
        this.group = this.node.group;
        this.isDirectory = this.node.directory;
        if (this.node.icon) {
            this.icon = this.node.icon;
        }
        else if (this.node.collapsedIcon) {
            this.icon = this.node.collapsedIcon;
        }
        this.formatPermissions();
    }
    formatPermissions() {
        let modeString = String(this.mode);
        if (modeString.length == 2) { // In case the mode is not properly formatted as "000" instead of "0", "20" etc
            modeString = "0" + modeString;
        }
        else if (modeString.length == 1) {
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
        let url = ZoweZLUX.uriBroker.unixFileUri('chown', this.path, undefined, undefined, undefined, false, undefined, undefined, undefined, undefined, this.recursive, this.owner, this.group);
        this.http.post(url, null, { observe: 'response' }).pipe(finalize(() => this.closeDialog())).subscribe({
            next: (res) => {
                if (res.status == 200) {
                    this.snackBar.open(this.path + ' has been successfully changed to Owner: ' + this.owner + " Group: " + this.group + ".", 'Dismiss', defaultSnackbarOptions);
                    this.node.owner = this.owner;
                    this.node.group = this.group;
                }
                else {
                    this.snackBar.open(res.status + " - A problem was encountered: " + res.statusText, 'Dismiss', defaultSnackbarOptions);
                }
            },
            error: (err) => {
                this.handleErrorObservable(err);
            }
        });
    }
    closeDialog() {
        const needUpdate = this.isDirectory;
        this.dialogRef.close(needUpdate);
    }
    handleErrorObservable(error) {
        console.error(error.message || error);
        this.snackBar.open(error.status + " - A problem was encountered: " + error._body, 'Dismiss', defaultSnackbarOptions);
        return throwError(() => error.message || error);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FileOwnershipModal, deps: [{ token: MAT_DIALOG_DATA }, { token: i1.MatDialogRef }, { token: i1$1.HttpClient }, { token: i3$1.MatSnackBar }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: FileOwnershipModal, selector: "file-ownership-modal", ngImport: i0, template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"modal-icon-container\">\n      <!-- FA Icon is determined by class name, so we hardcode the style here -->\n      <i class=\"{{icon}}\" style=\"font-size:24px; position: absolute; margin-top: 4px; margin-left: 3px;\"></i>\n    </div>\n    <div>\n      <h2 mat-dialog-title class=\"modal-mat-header\">{{name}} - Change Owners</h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n  </div>\n\n  <!-- Possible future filter code -->\n  <!-- <mat-form-field>\n<input matInput (keyup)=\"applyFilter($event.target.value)\" placeholder=\"Filter\">\n</mat-form-field> -->\n\n  <div class=\"modal-row\">\n    <div class=\"modal-column-ownership\" style=\"width: 30%;\">\n      <mat-list-item>\n        <div class=\"selectable-text\">Mode:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{mode}} ({{modeSym}})</div>\n      </mat-list-item>\n    </div>\n  </div>\n\n  <div class=\"modal-row\">\n    <div class=\"modal-column-ownership\">\n      <mat-list-item>\n        <label>Owner:</label>\n        <mat-form-field style=\"margin-left: 15px;\">\n          <input id=\"owner-input\" name=\"name\" matInput type=\"text\" [ngModel]=\"owner\"\n            (ngModelChange)=\"owner=$event.toUpperCase()\">\n          @if (folderName) {\n          <button class=\"modal-clear-button\" mat-button matSuffix mat-icon-button aria-label=\"Clear\"\n            (click)=\"folderName=''\">\n            <mat-icon class=\"create-folder-clear-icon\">close</mat-icon>\n          </button>\n          }\n        </mat-form-field>\n      </mat-list-item>\n    </div>\n  </div>\n\n  <div class=\"modal-row\">\n    <div class=\"modal-column-ownership\">\n      <mat-list-item>\n        <label>Group:</label>\n        <mat-form-field style=\"margin-left: 15px;\">\n          <input id=\"group-input\" matInput type=\"text\" [ngModel]=\"group\" (ngModelChange)=\"group=$event.toUpperCase()\">\n          @if (folderPath) {\n          <button class=\"modal-clear-button\" mat-button matSuffix mat-icon-button aria-label=\"Clear\"\n            (click)=\"folderPath=''\">\n            <mat-icon class=\"create-folder-clear-icon\">close</mat-icon>\n          </button>\n          }\n        </mat-form-field>\n      </mat-list-item>\n    </div>\n  </div>\n\n  @if (isDirectory) {\n  <div class=\"modal-row\">\n    <div class=\"modal-column-ownership\" style=\"width: 30%;\">\n      <mat-list-item>\n        <mat-slide-toggle color=\"primary\" class=\"selectable-text\" [(ngModel)]=\"recursive\"></mat-slide-toggle>\n      </mat-list-item>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list-item>\n        <div class=\"selectable-text\">Recursive?</div>\n      </mat-list-item>\n    </div>\n  </div>\n  }\n\n  <mat-dialog-actions>\n    <button mat-button class=\"modal-mat-button\" (click)=\"saveOwnerInfo()\">Save</button>\n    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->\n  </mat-dialog-actions>\n</div>\n<!--\n    This program and the accompanying materials are\n    made available under the terms of the Eclipse Public License v2.0 which accompanies\n    this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n    SPDX-License-Identifier: EPL-2.0\n\n    Copyright Contributors to the Zowe Project.\n    -->", styles: [".modal-column-ownership{float:left;width:100%}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"], dependencies: [{ kind: "directive", type: i4.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i4.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i4.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "component", type: i5.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i5.MatSuffix, selector: "[matSuffix], [matIconSuffix], [matTextSuffix]", inputs: ["matTextSuffix"] }, { kind: "component", type: i6$1.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "directive", type: i7.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly"], exportAs: ["matInput"] }, { kind: "component", type: i2.MatListItem, selector: "mat-list-item, a[mat-list-item], button[mat-list-item]", inputs: ["activated"], exportAs: ["matListItem"] }, { kind: "component", type: i8.MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", exportAs: ["matButton"] }, { kind: "component", type: i8.MatIconButton, selector: "button[mat-icon-button]", exportAs: ["matButton"] }, { kind: "component", type: i3.ZluxTabbingComponent, selector: "zlux-tab-trap", inputs: ["hiddenIds", "hiddenPos"] }, { kind: "component", type: i11.MatSlideToggle, selector: "mat-slide-toggle", inputs: ["name", "id", "labelPosition", "aria-label", "aria-labelledby", "aria-describedby", "required", "color", "disabled", "disableRipple", "tabIndex", "checked", "hideIcon"], outputs: ["change", "toggleChange"], exportAs: ["matSlideToggle"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FileOwnershipModal, decorators: [{
            type: Component,
            args: [{ selector: 'file-ownership-modal', template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"modal-icon-container\">\n      <!-- FA Icon is determined by class name, so we hardcode the style here -->\n      <i class=\"{{icon}}\" style=\"font-size:24px; position: absolute; margin-top: 4px; margin-left: 3px;\"></i>\n    </div>\n    <div>\n      <h2 mat-dialog-title class=\"modal-mat-header\">{{name}} - Change Owners</h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n  </div>\n\n  <!-- Possible future filter code -->\n  <!-- <mat-form-field>\n<input matInput (keyup)=\"applyFilter($event.target.value)\" placeholder=\"Filter\">\n</mat-form-field> -->\n\n  <div class=\"modal-row\">\n    <div class=\"modal-column-ownership\" style=\"width: 30%;\">\n      <mat-list-item>\n        <div class=\"selectable-text\">Mode:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{mode}} ({{modeSym}})</div>\n      </mat-list-item>\n    </div>\n  </div>\n\n  <div class=\"modal-row\">\n    <div class=\"modal-column-ownership\">\n      <mat-list-item>\n        <label>Owner:</label>\n        <mat-form-field style=\"margin-left: 15px;\">\n          <input id=\"owner-input\" name=\"name\" matInput type=\"text\" [ngModel]=\"owner\"\n            (ngModelChange)=\"owner=$event.toUpperCase()\">\n          @if (folderName) {\n          <button class=\"modal-clear-button\" mat-button matSuffix mat-icon-button aria-label=\"Clear\"\n            (click)=\"folderName=''\">\n            <mat-icon class=\"create-folder-clear-icon\">close</mat-icon>\n          </button>\n          }\n        </mat-form-field>\n      </mat-list-item>\n    </div>\n  </div>\n\n  <div class=\"modal-row\">\n    <div class=\"modal-column-ownership\">\n      <mat-list-item>\n        <label>Group:</label>\n        <mat-form-field style=\"margin-left: 15px;\">\n          <input id=\"group-input\" matInput type=\"text\" [ngModel]=\"group\" (ngModelChange)=\"group=$event.toUpperCase()\">\n          @if (folderPath) {\n          <button class=\"modal-clear-button\" mat-button matSuffix mat-icon-button aria-label=\"Clear\"\n            (click)=\"folderPath=''\">\n            <mat-icon class=\"create-folder-clear-icon\">close</mat-icon>\n          </button>\n          }\n        </mat-form-field>\n      </mat-list-item>\n    </div>\n  </div>\n\n  @if (isDirectory) {\n  <div class=\"modal-row\">\n    <div class=\"modal-column-ownership\" style=\"width: 30%;\">\n      <mat-list-item>\n        <mat-slide-toggle color=\"primary\" class=\"selectable-text\" [(ngModel)]=\"recursive\"></mat-slide-toggle>\n      </mat-list-item>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list-item>\n        <div class=\"selectable-text\">Recursive?</div>\n      </mat-list-item>\n    </div>\n  </div>\n  }\n\n  <mat-dialog-actions>\n    <button mat-button class=\"modal-mat-button\" (click)=\"saveOwnerInfo()\">Save</button>\n    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->\n  </mat-dialog-actions>\n</div>\n<!--\n    This program and the accompanying materials are\n    made available under the terms of the Eclipse Public License v2.0 which accompanies\n    this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n    SPDX-License-Identifier: EPL-2.0\n\n    Copyright Contributors to the Zowe Project.\n    -->", styles: [".modal-column-ownership{float:left;width:100%}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"] }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DIALOG_DATA]
                }] }, { type: i1.MatDialogRef }, { type: i1$1.HttpClient }, { type: i3$1.MatSnackBar }] });

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
class FilePermissionsModal {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FilePermissionsModal, deps: [{ token: MAT_DIALOG_DATA }, { token: i1.MatDialogRef }, { token: i1$1.HttpClient }, { token: i3$1.MatSnackBar }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: FilePermissionsModal, selector: "file-permissions-modal", ngImport: i0, template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"modal-icon-container\">\n      <!-- FA Icon is determined by class name, so we hardcode the style here -->\n      <i class=\"{{icon}}\" style=\"font-size:24px; position: absolute; margin-top: 4px; margin-left: 3px;\"></i>\n    </div>\n    <div>\n      <h2 mat-dialog-title class=\"file-permissions-header\">{{name}} - Change Permissions</h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n  </div>\n  <!-- Possible future filter code -->\n  <!-- <mat-form-field>\n<input matInput (keyup)=\"applyFilter($event.target.value)\" placeholder=\"Filter\">\n</mat-form-field> -->\n\n  <div class=\"file-permissions-row\">\n    <mat-list-item>\n      <div class=\"modal-column\">\n        <span class=\"file-permissions-subtitle\">Owner: {{ owner }}</span>\n      </div>\n      <div class=\"modal-column\">\n        <span class=\"file-permissions-subtitle\">Group: {{ group }}</span>\n      </div>\n    </mat-list-item>\n  </div>\n  <div class=\"file-permissions-row\">\n    <div class=\"modal-column-full-width\">\n      <mat-list-item>\n        <span class=\"file-permissions-subtitle\">Mode:</span>\n        <mat-form-field class=\"mode-form-field\">\n          <input class=\"mode-input\" matInput required type=\"text\" maxlength=\"3\" minlength=\"3\"\n            [pattern]=\"octalModePattern\" [ngModel]=\"octalMode\"\n            (ngModelChange)=\"onOctalModeChange($event, octalModeInput.valid)\" #octalModeInput=\"ngModel\"\n            (keydown)=\"onOctalModeKeyDown($event)\" [errorStateMatcher]=\"matcher\">\n          @if (octalModeInput.hasError('pattern') && !octalModeInput.hasError(\"required\")) {\n          <mat-error>\n            Invalid mode\n          </mat-error>\n          }\n          @if (octalModeInput.hasError(\"required\")) {\n          <mat-error>\n            Mode is required\n          </mat-error>\n          }\n        </mat-form-field>\n        <span class=\"mode-sym\">{{modeSym}}</span>\n      </mat-list-item>\n    </div>\n  </div>\n\n  <div class=\"container\">\n\n    <span class=\"file-permissions-subtitle user\">Owner</span>\n    <section class=\"example-section user\">\n      <mat-checkbox color=\"primary\" [(ngModel)]=\"userRead\" (change)=\"updateUI()\">Read</mat-checkbox>\n      <mat-checkbox color=\"primary\" [(ngModel)]=\"userWrite\" (change)=\"updateUI()\">Write</mat-checkbox>\n      <mat-checkbox color=\"primary\" [(ngModel)]=\"userExecute\" (change)=\"updateUI()\">Execute</mat-checkbox>\n    </section>\n\n    <span class=\"file-permissions-subtitle group\">Group</span>\n    <section class=\"example-section group\">\n      <mat-checkbox color=\"primary\" [(ngModel)]=\"groupRead\" (change)=\"updateUI()\">Read</mat-checkbox>\n      <mat-checkbox color=\"primary\" [(ngModel)]=\"groupWrite\" (change)=\"updateUI()\">Write</mat-checkbox>\n      <mat-checkbox color=\"primary\" [(ngModel)]=\"groupExecute\" (change)=\"updateUI()\">Execute</mat-checkbox>\n    </section>\n\n    <span class=\"file-permissions-subtitle public\">Other</span>\n    <section class=\"example-section public\">\n      <mat-checkbox color=\"primary\" [(ngModel)]=\"publicRead\" (change)=\"updateUI()\">Read</mat-checkbox>\n      <mat-checkbox color=\"primary\" [(ngModel)]=\"publicWrite\" (change)=\"updateUI()\">Write</mat-checkbox>\n      <mat-checkbox color=\"primary\" [(ngModel)]=\"publicExecute\" (change)=\"updateUI()\">Execute</mat-checkbox>\n    </section>\n  </div>\n\n  @if (isDirectory) {\n  <div class=\"file-permissions-row\">\n    <div class=\"modal-column\" style=\"width: 30%;\">\n      <mat-list-item>\n        <mat-slide-toggle color=\"primary\" class=\"selectable-text\" [(ngModel)]=\"recursive\"></mat-slide-toggle>\n      </mat-list-item>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list-item>\n        <div class=\"selectable-text\">Recursive?</div>\n      </mat-list-item>\n    </div>\n  </div>\n  }\n\n  <mat-dialog-actions>\n    <button mat-button class=\"modal-mat-button\" (click)=\"savePermissions()\"\n      [disabled]=\"octalModeInput.invalid\">Save</button>\n    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->\n  </mat-dialog-actions>\n</div>\n<!--\n  This program and the accompanying materials are\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n  SPDX-License-Identifier: EPL-2.0\n\n  Copyright Contributors to the Zowe Project.\n  -->", styles: [".file-permissions-row:after{content:\"\";display:table;clear:both}.file-permissions-row{font-size:medium;padding-left:15px;padding-bottom:15px;padding-top:15px}.file-permissions-title{vertical-align:middle;float:left}.file-permissions-header{margin-left:1rem}.example-section{display:flex}.file-permissions-subtitle{font-size:large;font-weight:500}.container{display:grid;grid-template-columns:75px 200px;grid-template-rows:75px 75px 75px;align-content:center;align-items:center}.file-permissions-subtitle.user{grid-column-start:1;grid-column-end:2;grid-row-start:1;grid-row-end:2}.example-section.user{grid-column-start:2;grid-column-end:3;grid-row-start:1;grid-row-end:2}.mode-form-field{width:6rem;margin-left:2rem}.mode-input{text-align:center;padding:0 1rem}.mode-sym{font-family:monospace;font-size:16px;margin-left:1rem;letter-spacing:1px;font-weight:600}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"], dependencies: [{ kind: "directive", type: i4.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i4.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i4.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i4.MinLengthValidator, selector: "[minlength][formControlName],[minlength][formControl],[minlength][ngModel]", inputs: ["minlength"] }, { kind: "directive", type: i4.MaxLengthValidator, selector: "[maxlength][formControlName],[maxlength][formControl],[maxlength][ngModel]", inputs: ["maxlength"] }, { kind: "directive", type: i4.PatternValidator, selector: "[pattern][formControlName],[pattern][formControl],[pattern][ngModel]", inputs: ["pattern"] }, { kind: "directive", type: i4.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "component", type: i5.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i5.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "directive", type: i7.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly"], exportAs: ["matInput"] }, { kind: "component", type: i2.MatListItem, selector: "mat-list-item, a[mat-list-item], button[mat-list-item]", inputs: ["activated"], exportAs: ["matListItem"] }, { kind: "component", type: i8$1.MatCheckbox, selector: "mat-checkbox", inputs: ["aria-label", "aria-labelledby", "aria-describedby", "id", "required", "labelPosition", "name", "value", "disableRipple", "tabIndex", "color", "checked", "disabled", "indeterminate"], outputs: ["change", "indeterminateChange"], exportAs: ["matCheckbox"] }, { kind: "component", type: i8.MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", exportAs: ["matButton"] }, { kind: "component", type: i3.ZluxTabbingComponent, selector: "zlux-tab-trap", inputs: ["hiddenIds", "hiddenPos"] }, { kind: "component", type: i11.MatSlideToggle, selector: "mat-slide-toggle", inputs: ["name", "id", "labelPosition", "aria-label", "aria-labelledby", "aria-describedby", "required", "color", "disabled", "disableRipple", "tabIndex", "checked", "hideIcon"], outputs: ["change", "toggleChange"], exportAs: ["matSlideToggle"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FilePermissionsModal, decorators: [{
            type: Component,
            args: [{ selector: 'file-permissions-modal', template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"modal-icon-container\">\n      <!-- FA Icon is determined by class name, so we hardcode the style here -->\n      <i class=\"{{icon}}\" style=\"font-size:24px; position: absolute; margin-top: 4px; margin-left: 3px;\"></i>\n    </div>\n    <div>\n      <h2 mat-dialog-title class=\"file-permissions-header\">{{name}} - Change Permissions</h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n  </div>\n  <!-- Possible future filter code -->\n  <!-- <mat-form-field>\n<input matInput (keyup)=\"applyFilter($event.target.value)\" placeholder=\"Filter\">\n</mat-form-field> -->\n\n  <div class=\"file-permissions-row\">\n    <mat-list-item>\n      <div class=\"modal-column\">\n        <span class=\"file-permissions-subtitle\">Owner: {{ owner }}</span>\n      </div>\n      <div class=\"modal-column\">\n        <span class=\"file-permissions-subtitle\">Group: {{ group }}</span>\n      </div>\n    </mat-list-item>\n  </div>\n  <div class=\"file-permissions-row\">\n    <div class=\"modal-column-full-width\">\n      <mat-list-item>\n        <span class=\"file-permissions-subtitle\">Mode:</span>\n        <mat-form-field class=\"mode-form-field\">\n          <input class=\"mode-input\" matInput required type=\"text\" maxlength=\"3\" minlength=\"3\"\n            [pattern]=\"octalModePattern\" [ngModel]=\"octalMode\"\n            (ngModelChange)=\"onOctalModeChange($event, octalModeInput.valid)\" #octalModeInput=\"ngModel\"\n            (keydown)=\"onOctalModeKeyDown($event)\" [errorStateMatcher]=\"matcher\">\n          @if (octalModeInput.hasError('pattern') && !octalModeInput.hasError(\"required\")) {\n          <mat-error>\n            Invalid mode\n          </mat-error>\n          }\n          @if (octalModeInput.hasError(\"required\")) {\n          <mat-error>\n            Mode is required\n          </mat-error>\n          }\n        </mat-form-field>\n        <span class=\"mode-sym\">{{modeSym}}</span>\n      </mat-list-item>\n    </div>\n  </div>\n\n  <div class=\"container\">\n\n    <span class=\"file-permissions-subtitle user\">Owner</span>\n    <section class=\"example-section user\">\n      <mat-checkbox color=\"primary\" [(ngModel)]=\"userRead\" (change)=\"updateUI()\">Read</mat-checkbox>\n      <mat-checkbox color=\"primary\" [(ngModel)]=\"userWrite\" (change)=\"updateUI()\">Write</mat-checkbox>\n      <mat-checkbox color=\"primary\" [(ngModel)]=\"userExecute\" (change)=\"updateUI()\">Execute</mat-checkbox>\n    </section>\n\n    <span class=\"file-permissions-subtitle group\">Group</span>\n    <section class=\"example-section group\">\n      <mat-checkbox color=\"primary\" [(ngModel)]=\"groupRead\" (change)=\"updateUI()\">Read</mat-checkbox>\n      <mat-checkbox color=\"primary\" [(ngModel)]=\"groupWrite\" (change)=\"updateUI()\">Write</mat-checkbox>\n      <mat-checkbox color=\"primary\" [(ngModel)]=\"groupExecute\" (change)=\"updateUI()\">Execute</mat-checkbox>\n    </section>\n\n    <span class=\"file-permissions-subtitle public\">Other</span>\n    <section class=\"example-section public\">\n      <mat-checkbox color=\"primary\" [(ngModel)]=\"publicRead\" (change)=\"updateUI()\">Read</mat-checkbox>\n      <mat-checkbox color=\"primary\" [(ngModel)]=\"publicWrite\" (change)=\"updateUI()\">Write</mat-checkbox>\n      <mat-checkbox color=\"primary\" [(ngModel)]=\"publicExecute\" (change)=\"updateUI()\">Execute</mat-checkbox>\n    </section>\n  </div>\n\n  @if (isDirectory) {\n  <div class=\"file-permissions-row\">\n    <div class=\"modal-column\" style=\"width: 30%;\">\n      <mat-list-item>\n        <mat-slide-toggle color=\"primary\" class=\"selectable-text\" [(ngModel)]=\"recursive\"></mat-slide-toggle>\n      </mat-list-item>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list-item>\n        <div class=\"selectable-text\">Recursive?</div>\n      </mat-list-item>\n    </div>\n  </div>\n  }\n\n  <mat-dialog-actions>\n    <button mat-button class=\"modal-mat-button\" (click)=\"savePermissions()\"\n      [disabled]=\"octalModeInput.invalid\">Save</button>\n    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->\n  </mat-dialog-actions>\n</div>\n<!--\n  This program and the accompanying materials are\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n  SPDX-License-Identifier: EPL-2.0\n\n  Copyright Contributors to the Zowe Project.\n  -->", styles: [".file-permissions-row:after{content:\"\";display:table;clear:both}.file-permissions-row{font-size:medium;padding-left:15px;padding-bottom:15px;padding-top:15px}.file-permissions-title{vertical-align:middle;float:left}.file-permissions-header{margin-left:1rem}.example-section{display:flex}.file-permissions-subtitle{font-size:large;font-weight:500}.container{display:grid;grid-template-columns:75px 200px;grid-template-rows:75px 75px 75px;align-content:center;align-items:center}.file-permissions-subtitle.user{grid-column-start:1;grid-column-end:2;grid-row-start:1;grid-row-end:2}.example-section.user{grid-column-start:2;grid-column-end:3;grid-row-start:1;grid-row-end:2}.mode-form-field{width:6rem;margin-left:2rem}.mode-input{text-align:center;padding:0 1rem}.mode-sym{font-family:monospace;font-size:16px;margin-left:1rem;letter-spacing:1px;font-weight:600}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"] }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DIALOG_DATA]
                }] }, { type: i1.MatDialogRef }, { type: i1$1.HttpClient }, { type: i3$1.MatSnackBar }] });

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
function findFileTagByCodeset(codeset) {
    return fileTagList.find(option => option.codeset === codeset);
}
const fileTagList = [
    { codeset: 0, name: 'Untagged', type: 'delete' },
    { codeset: -1, name: 'Binary', type: 'binary' },
    { codeset: 1047, name: "IBM-1047", type: 'text' },
    { codeset: 819, name: "ISO8859-1", type: 'text' },
    { codeset: 1208, name: "UTF-8", type: 'text' },
    { codeset: 37, name: "IBM-037", type: 'text' },
    { codeset: 273, name: "IBM-273", type: 'text' },
    { codeset: 274, name: "IBM-274", type: 'text' },
    { codeset: 275, name: "IBM-275", type: 'text' },
    { codeset: 277, name: "IBM-277", type: 'text' },
    { codeset: 278, name: "IBM-278", type: 'text' },
    { codeset: 280, name: "IBM-280", type: 'text' },
    { codeset: 281, name: "IBM-281", type: 'text' },
    { codeset: 282, name: "IBM-282", type: 'text' },
    { codeset: 284, name: "IBM-284", type: 'text' },
    { codeset: 285, name: "IBM-285", type: 'text' },
    { codeset: 290, name: "IBM-290", type: 'text' },
    { codeset: 297, name: "IBM-297", type: 'text' },
    { codeset: 300, name: "IBM-300", type: 'text' },
    { codeset: 301, name: "IBM-301", type: 'text' },
    { codeset: 420, name: "IBM-420", type: 'text' },
    { codeset: 424, name: "IBM-424", type: 'text' },
    { codeset: 425, name: "IBM-425", type: 'text' },
    { codeset: 437, name: "IBM-437", type: 'text' },
    { codeset: 500, name: "IBM-500", type: 'text' },
    { codeset: 808, name: "IBM-808", type: 'text' },
    { codeset: 813, name: "ISO8859-7", type: 'text' },
    { codeset: 833, name: "IBM-833", type: 'text' },
    { codeset: 834, name: "IBM-834", type: 'text' },
    { codeset: 835, name: "IBM-835", type: 'text' },
    { codeset: 836, name: "IBM-836", type: 'text' },
    { codeset: 837, name: "IBM-837", type: 'text' },
    { codeset: 838, name: "IBM-838", type: 'text' },
    { codeset: 848, name: "IBM-848", type: 'text' },
    { codeset: 850, name: "IBM-850", type: 'text' },
    { codeset: 852, name: "IBM-852", type: 'text' },
    { codeset: 855, name: "IBM-855", type: 'text' },
    { codeset: 856, name: "IBM-856", type: 'text' },
    { codeset: 858, name: "IBM-858", type: 'text' },
    { codeset: 859, name: "IBM-859", type: 'text' },
    { codeset: 861, name: "IBM-861", type: 'text' },
    { codeset: 862, name: "IBM-862", type: 'text' },
    { codeset: 864, name: "IBM-864", type: 'text' },
    { codeset: 866, name: "IBM-866", type: 'text' },
    { codeset: 867, name: "IBM-867", type: 'text' },
    { codeset: 869, name: "IBM-869", type: 'text' },
    { codeset: 870, name: "IBM-870", type: 'text' },
    { codeset: 871, name: "IBM-871", type: 'text' },
    { codeset: 872, name: "IBM-872", type: 'text' },
    { codeset: 874, name: "TIS-620", type: 'text' },
    { codeset: 875, name: "IBM-875", type: 'text' },
    { codeset: 880, name: "IBM-880", type: 'text' },
    { codeset: 901, name: "IBM-901", type: 'text' },
    { codeset: 902, name: "IBM-902", type: 'text' },
    { codeset: 904, name: "IBM-904", type: 'text' },
    { codeset: 912, name: "ISO8859-2", type: 'text' },
    { codeset: 914, name: "ISO8859-4", type: 'text' },
    { codeset: 915, name: "ISO8859-5", type: 'text' },
    { codeset: 916, name: "ISO8859-8", type: 'text' },
    { codeset: 920, name: "ISO8859-9", type: 'text' },
    { codeset: 921, name: "ISO8859-13", type: 'text' },
    { codeset: 922, name: "IBM-922", type: 'text' },
    { codeset: 923, name: "ISO8859-15", type: 'text' },
    { codeset: 924, name: "IBM-924", type: 'text' },
    { codeset: 927, name: "IBM-927", type: 'text' },
    { codeset: 928, name: "IBM-928", type: 'text' },
    { codeset: 930, name: "IBM-930", type: 'text' },
    { codeset: 932, name: "IBM-eucJC", type: 'text' },
    { codeset: 933, name: "IBM-933", type: 'text' },
    { codeset: 935, name: "IBM-935", type: 'text' },
    { codeset: 936, name: "IBM-936", type: 'text' },
    { codeset: 937, name: "IBM-937", type: 'text' },
    { codeset: 938, name: "IBM-938", type: 'text' },
    { codeset: 939, name: "IBM-939", type: 'text' },
    { codeset: 942, name: "IBM-942", type: 'text' },
    { codeset: 943, name: "IBM-943", type: 'text' },
    { codeset: 946, name: "IBM-946", type: 'text' },
    { codeset: 947, name: "IBM-947", type: 'text' },
    { codeset: 948, name: "IBM-948", type: 'text' },
    { codeset: 949, name: "IBM-949", type: 'text' },
    { codeset: 950, name: "BIG5", type: 'text' },
    { codeset: 951, name: "IBM-951", type: 'text' },
    { codeset: 956, name: "IBM-956", type: 'text' },
    { codeset: 957, name: "IBM-957", type: 'text' },
    { codeset: 958, name: "IBM-958", type: 'text' },
    { codeset: 959, name: "IBM-959", type: 'text' },
    { codeset: 964, name: "IBM-eucTW", type: 'text' },
    { codeset: 970, name: "IBM-eucKR", type: 'text' },
    { codeset: 1025, name: "IBM-1025", type: 'text' },
    { codeset: 1026, name: "IBM-1026", type: 'text' },
    { codeset: 1027, name: "IBM-1027", type: 'text' },
    { codeset: 1046, name: "IBM-1046", type: 'text' },
    { codeset: 1088, name: "IBM-1088", type: 'text' },
    { codeset: 1089, name: "ISO8859-6", type: 'text' },
    { codeset: 1112, name: "IBM-1112", type: 'text' },
    { codeset: 1115, name: "IBM-1115", type: 'text' },
    { codeset: 1122, name: "IBM-1122", type: 'text' },
    { codeset: 1123, name: "IBM-1123", type: 'text' },
    { codeset: 1124, name: "IBM-1124", type: 'text' },
    { codeset: 1125, name: "IBM-1125", type: 'text' },
    { codeset: 1126, name: "IBM-1126", type: 'text' },
    { codeset: 1140, name: "IBM-1140", type: 'text' },
    { codeset: 1141, name: "IBM-1141", type: 'text' },
    { codeset: 1142, name: "IBM-1142", type: 'text' },
    { codeset: 1143, name: "IBM-1143", type: 'text' },
    { codeset: 1144, name: "IBM-1144", type: 'text' },
    { codeset: 1145, name: "IBM-1145", type: 'text' },
    { codeset: 1146, name: "IBM-1146", type: 'text' },
    { codeset: 1147, name: "IBM-1147", type: 'text' },
    { codeset: 1148, name: "IBM-1148", type: 'text' },
    { codeset: 1149, name: "IBM-1149", type: 'text' },
    { codeset: 1153, name: "IBM-1153", type: 'text' },
    { codeset: 1154, name: "IBM-1154", type: 'text' },
    { codeset: 1155, name: "IBM-1155", type: 'text' },
    { codeset: 1156, name: "IBM-1156", type: 'text' },
    { codeset: 1157, name: "IBM-1157", type: 'text' },
    { codeset: 1158, name: "IBM-1158", type: 'text' },
    { codeset: 1159, name: "IBM-1159", type: 'text' },
    { codeset: 1160, name: "IBM-1160", type: 'text' },
    { codeset: 1161, name: "IBM-1161", type: 'text' },
    { codeset: 1165, name: "IBM-1165", type: 'text' },
    { codeset: 1250, name: "IBM-1250", type: 'text' },
    { codeset: 1251, name: "IBM-1251", type: 'text' },
    { codeset: 1252, name: "IBM-1252", type: 'text' },
    { codeset: 1253, name: "IBM-1253", type: 'text' },
    { codeset: 1254, name: "IBM-1254", type: 'text' },
    { codeset: 1255, name: "IBM-1255", type: 'text' },
    { codeset: 1256, name: "IBM-1256", type: 'text' },
    { codeset: 1362, name: "IBM-1362", type: 'text' },
    { codeset: 1363, name: "IBM-1363", type: 'text' },
    { codeset: 1364, name: "IBM-1364", type: 'text' },
    { codeset: 1370, name: "IBM-1370", type: 'text' },
    { codeset: 1371, name: "IBM-1371", type: 'text' },
    { codeset: 1380, name: "IBM-1380", type: 'text' },
    { codeset: 1381, name: "IBM-1381", type: 'text' },
    { codeset: 1383, name: "IBM-eucCN", type: 'text' },
    { codeset: 1386, name: "IBM-1386", type: 'text' },
    { codeset: 1388, name: "IBM-1388", type: 'text' },
    { codeset: 1390, name: "IBM-1390", type: 'text' },
    { codeset: 1399, name: "IBM-1399", type: 'text' },
    { codeset: 4396, name: "IBM-4396", type: 'text' },
    { codeset: 4909, name: "IBM-4909", type: 'text' },
    { codeset: 4930, name: "IBM-4930", type: 'text' },
    { codeset: 4933, name: "IBM-4933", type: 'text' },
    { codeset: 4946, name: "IBM-4946", type: 'text' },
    { codeset: 4971, name: "IBM-4971", type: 'text' },
    { codeset: 5026, name: "IBM-5026", type: 'text' },
    { codeset: 5031, name: "IBM-5031", type: 'text' },
    { codeset: 5035, name: "IBM-5035", type: 'text' },
    { codeset: 5052, name: "ISO-2022-JP", type: 'text' },
    { codeset: 5053, name: "IBM-5053", type: 'text' },
    { codeset: 5054, name: "IBM-5054", type: 'text' },
    { codeset: 5055, name: "IBM-5055", type: 'text' },
    { codeset: 5123, name: "IBM-5123", type: 'text' },
    { codeset: 5346, name: "IBM-5346", type: 'text' },
    { codeset: 5347, name: "IBM-5347", type: 'text' },
    { codeset: 5348, name: "IBM-5348", type: 'text' },
    { codeset: 5349, name: "IBM-5349", type: 'text' },
    { codeset: 5350, name: "IBM-5350", type: 'text' },
    { codeset: 5351, name: "IBM-5351", type: 'text' },
    { codeset: 5352, name: "IBM-5352", type: 'text' },
    { codeset: 5488, name: "IBM-5488", type: 'text' },
    { codeset: 8482, name: "IBM-8482", type: 'text' },
    { codeset: 9027, name: "IBM-9027", type: 'text' },
    { codeset: 9044, name: "IBM-9044", type: 'text' },
    { codeset: 9061, name: "IBM-9061", type: 'text' },
    { codeset: 9238, name: "IBM-9238", type: 'text' },
    { codeset: 12712, name: "IBM-12712", type: 'text' },
    { codeset: 13121, name: "IBM-13121", type: 'text' },
    { codeset: 13124, name: "IBM-13124", type: 'text' },
    { codeset: 13488, name: "UCS-2", type: 'text' },
    { codeset: 16684, name: "IBM-16684", type: 'text' },
    { codeset: 16804, name: "IBM-16804", type: 'text' },
    { codeset: 17248, name: "IBM-17248", type: 'text' },
    { codeset: 28709, name: "IBM-28709", type: 'text' },
    { codeset: 53668, name: "IBM-53668", type: 'text' },
    { codeset: 54191, name: "IBM-54191", type: 'text' },
    { codeset: 62383, name: "IBM-62383", type: 'text' },
];
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
class FilePropertiesModal {
    constructor(data) {
        this.fileName = '';
        this.fileCreatedAt = '';
        this.fileType = '';
        this.filePath = '';
        this.fileMode = 0;
        this.fileSize = '';
        this.fileIcon = '';
        this.fileOwner = '';
        this.fileGroup = '';
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
        }
        else if (node.size < 1048576) {
            this.fileSize = (node.size / 1024).toFixed(3);
            this.sizeType = "KB";
        }
        else if (node.size < 1073741824) {
            this.fileSize = (node.size / 1048576).toFixed(3);
            this.sizeType = "MB";
        }
        else {
            this.fileSize = (node.size / 1073741824).toFixed(3);
            this.sizeType = "GB";
        }
        if (node.icon) {
            this.fileIcon = node.icon;
        }
        else if (node.collapsedIcon) {
            this.fileIcon = node.collapsedIcon;
        }
        this.fileCreatedAt = this.fileCreatedAt.replace('T', ' ');
    }
    ngOnInit() {
    }
    applyFilter(filterValue) {
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FilePropertiesModal, deps: [{ token: MAT_DIALOG_DATA }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: FilePropertiesModal, selector: "file-properties-modal", ngImport: i0, template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <!-- FA Icon is determined by class name, so we hardcode the style here -->\n    <div class=\"modal-icon-container\">\n      <i class=\"{{fileIcon}}\" style=\"font-size:24px; position: absolute; margin-top: 4px; margin-left: 3px;\"></i>\n    </div>\n    <div>\n      <h2 mat-dialog-title class=\"modal-mat-header\">{{fileName}} - Properties</h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n  </div>\n\n  <!-- Possible future filter code -->\n  <!-- <mat-form-field>\n<input matInput (keyup)=\"applyFilter($event.target.value)\" placeholder=\"Filter\">\n</mat-form-field> -->\n\n  <div class=\"modal-row\">\n    <div class=\"modal-column\" style=\"width: 30%;\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">Created: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">Type: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">Path: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">Mode: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">Owner: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">Group: </div>\n        </mat-list-item>\n        @if (fileType != 'Folder') {\n        <mat-list-item>\n          <div class=\"selectable-text\">Size: </div>\n        </mat-list-item>\n        }\n        @if (fileType != 'Folder') {\n        <mat-list-item>\n          <div class=\"selectable-text\">Tag: </div>\n        </mat-list-item>\n        }\n      </mat-list>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{fileCreatedAt}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{fileType}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{filePath}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{fileMode}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{fileOwner}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{fileGroup}}</div>\n        </mat-list-item>\n        @if (fileType != 'Folder') {\n        <mat-list-item>\n          <div class=\"selectable-text\">{{fileSize}} {{sizeType}}</div>\n        </mat-list-item>\n        }\n        @if (fileType != 'Folder') {\n        <mat-list-item>\n          <div class=\"selectable-text\">{{ tag?.name }}</div>\n        </mat-list-item>\n        }\n      </mat-list>\n    </div>\n  </div>\n</div>\n<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->", styles: ["", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"], dependencies: [{ kind: "directive", type: i1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "component", type: i2.MatList, selector: "mat-list", exportAs: ["matList"] }, { kind: "component", type: i2.MatListItem, selector: "mat-list-item, a[mat-list-item], button[mat-list-item]", inputs: ["activated"], exportAs: ["matListItem"] }, { kind: "component", type: i3.ZluxTabbingComponent, selector: "zlux-tab-trap", inputs: ["hiddenIds", "hiddenPos"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FilePropertiesModal, decorators: [{
            type: Component,
            args: [{ selector: 'file-properties-modal', template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <!-- FA Icon is determined by class name, so we hardcode the style here -->\n    <div class=\"modal-icon-container\">\n      <i class=\"{{fileIcon}}\" style=\"font-size:24px; position: absolute; margin-top: 4px; margin-left: 3px;\"></i>\n    </div>\n    <div>\n      <h2 mat-dialog-title class=\"modal-mat-header\">{{fileName}} - Properties</h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n  </div>\n\n  <!-- Possible future filter code -->\n  <!-- <mat-form-field>\n<input matInput (keyup)=\"applyFilter($event.target.value)\" placeholder=\"Filter\">\n</mat-form-field> -->\n\n  <div class=\"modal-row\">\n    <div class=\"modal-column\" style=\"width: 30%;\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">Created: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">Type: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">Path: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">Mode: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">Owner: </div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">Group: </div>\n        </mat-list-item>\n        @if (fileType != 'Folder') {\n        <mat-list-item>\n          <div class=\"selectable-text\">Size: </div>\n        </mat-list-item>\n        }\n        @if (fileType != 'Folder') {\n        <mat-list-item>\n          <div class=\"selectable-text\">Tag: </div>\n        </mat-list-item>\n        }\n      </mat-list>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{fileCreatedAt}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{fileType}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{filePath}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{fileMode}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{fileOwner}}</div>\n        </mat-list-item>\n        <mat-list-item>\n          <div class=\"selectable-text\">{{fileGroup}}</div>\n        </mat-list-item>\n        @if (fileType != 'Folder') {\n        <mat-list-item>\n          <div class=\"selectable-text\">{{fileSize}} {{sizeType}}</div>\n        </mat-list-item>\n        }\n        @if (fileType != 'Folder') {\n        <mat-list-item>\n          <div class=\"selectable-text\">{{ tag?.name }}</div>\n        </mat-list-item>\n        }\n      </mat-list>\n    </div>\n  </div>\n</div>\n<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->", styles: ["mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"] }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DIALOG_DATA]
                }] }] });

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
class FileTaggingModal {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FileTaggingModal, deps: [{ token: MAT_DIALOG_DATA }, { token: i1.MatDialogRef }, { token: i1$1.HttpClient }, { token: i3$1.MatSnackBar }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: FileTaggingModal, selector: "file-tagging-modal", ngImport: i0, template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"modal-icon-container\">\n      <i class=\"{{icon}} modal-icon\"></i>\n    </div>\n    <div>\n      <h2 mat-dialog-title class=\"modal-mat-header\">{{name}} - File Tagging</h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n  </div>\n  <div class=\"modal-row\">\n    <div class=\"modal-column-full-width\">\n      <mat-list-item>\n        @if (isDirectory) {\n        Tag all files as\n        } @else {\n        Tag file as\n        }\n        <ng-template #file>Tag file as</ng-template>\n        <mat-form-field appearance=\"fill\" style=\"margin-left: 36px;\">\n          <input matInput required type=\"text\" [(ngModel)]=\"selectedOption\" (ngModelChange)=\"onValueChange($event)\"\n            [matAutocomplete]=\"auto\" [errorStateMatcher]=\"matcher\" #encodingInput=\"ngModel\">\n          <mat-autocomplete autoActiveFirstOption #auto=\"matAutocomplete\" [displayWith]=\"displayFn\">\n            @for (option of filteredOptions; track option) {\n            <mat-option [value]=\"option\">\n              {{ option.name }}\n            </mat-option>\n            }\n          </mat-autocomplete>\n          @if (encodingInput.hasError('required')) {\n          <mat-error>\n            Encoding is required\n          </mat-error>\n          }\n        </mat-form-field>\n      </mat-list-item>\n    </div>\n  </div>\n\n  @if (isDirectory) {\n  <div class=\"modal-row\">\n    <div class=\"modal-column\" style=\"width: 40%;\">\n      <mat-list-item>\n        <mat-slide-toggle color=\"primary\" [(ngModel)]=\"recursive\"></mat-slide-toggle>\n      </mat-list-item>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list-item>\n        <div class=\"selectable-text\">Process subdirectories</div>\n      </mat-list-item>\n    </div>\n  </div>\n  }\n\n  <mat-dialog-actions>\n    <button mat-button class=\"modal-mat-button\" (click)=\"changeTag()\" [disabled]=\"!isOptionSelected\">Save</button>\n  </mat-dialog-actions>\n</div>\n<!--\n  This program and the accompanying materials are\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n  SPDX-License-Identifier: EPL-2.0\n\n  Copyright Contributors to the Zowe Project.\n  -->", styles: [".file-tagging-container{padding:1rem}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"], dependencies: [{ kind: "directive", type: i4.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i4.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i4.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i4.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "component", type: i5.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i5.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "directive", type: i7.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly"], exportAs: ["matInput"] }, { kind: "component", type: i2.MatListItem, selector: "mat-list-item, a[mat-list-item], button[mat-list-item]", inputs: ["activated"], exportAs: ["matListItem"] }, { kind: "component", type: i8.MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", exportAs: ["matButton"] }, { kind: "component", type: i9.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "component", type: i10.MatAutocomplete, selector: "mat-autocomplete", inputs: ["aria-label", "aria-labelledby", "displayWith", "autoActiveFirstOption", "autoSelectActiveOption", "requireSelection", "panelWidth", "disableRipple", "class", "hideSingleSelectionIndicator"], outputs: ["optionSelected", "opened", "closed", "optionActivated"], exportAs: ["matAutocomplete"] }, { kind: "directive", type: i10.MatAutocompleteTrigger, selector: "input[matAutocomplete], textarea[matAutocomplete]", inputs: ["matAutocomplete", "matAutocompletePosition", "matAutocompleteConnectedTo", "autocomplete", "matAutocompleteDisabled"], exportAs: ["matAutocompleteTrigger"] }, { kind: "component", type: i3.ZluxTabbingComponent, selector: "zlux-tab-trap", inputs: ["hiddenIds", "hiddenPos"] }, { kind: "component", type: i11.MatSlideToggle, selector: "mat-slide-toggle", inputs: ["name", "id", "labelPosition", "aria-label", "aria-labelledby", "aria-describedby", "required", "color", "disabled", "disableRipple", "tabIndex", "checked", "hideIcon"], outputs: ["change", "toggleChange"], exportAs: ["matSlideToggle"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FileTaggingModal, decorators: [{
            type: Component,
            args: [{ selector: 'file-tagging-modal', template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"modal-icon-container\">\n      <i class=\"{{icon}} modal-icon\"></i>\n    </div>\n    <div>\n      <h2 mat-dialog-title class=\"modal-mat-header\">{{name}} - File Tagging</h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n  </div>\n  <div class=\"modal-row\">\n    <div class=\"modal-column-full-width\">\n      <mat-list-item>\n        @if (isDirectory) {\n        Tag all files as\n        } @else {\n        Tag file as\n        }\n        <ng-template #file>Tag file as</ng-template>\n        <mat-form-field appearance=\"fill\" style=\"margin-left: 36px;\">\n          <input matInput required type=\"text\" [(ngModel)]=\"selectedOption\" (ngModelChange)=\"onValueChange($event)\"\n            [matAutocomplete]=\"auto\" [errorStateMatcher]=\"matcher\" #encodingInput=\"ngModel\">\n          <mat-autocomplete autoActiveFirstOption #auto=\"matAutocomplete\" [displayWith]=\"displayFn\">\n            @for (option of filteredOptions; track option) {\n            <mat-option [value]=\"option\">\n              {{ option.name }}\n            </mat-option>\n            }\n          </mat-autocomplete>\n          @if (encodingInput.hasError('required')) {\n          <mat-error>\n            Encoding is required\n          </mat-error>\n          }\n        </mat-form-field>\n      </mat-list-item>\n    </div>\n  </div>\n\n  @if (isDirectory) {\n  <div class=\"modal-row\">\n    <div class=\"modal-column\" style=\"width: 40%;\">\n      <mat-list-item>\n        <mat-slide-toggle color=\"primary\" [(ngModel)]=\"recursive\"></mat-slide-toggle>\n      </mat-list-item>\n    </div>\n    <div class=\"modal-column\">\n      <mat-list-item>\n        <div class=\"selectable-text\">Process subdirectories</div>\n      </mat-list-item>\n    </div>\n  </div>\n  }\n\n  <mat-dialog-actions>\n    <button mat-button class=\"modal-mat-button\" (click)=\"changeTag()\" [disabled]=\"!isOptionSelected\">Save</button>\n  </mat-dialog-actions>\n</div>\n<!--\n  This program and the accompanying materials are\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n  SPDX-License-Identifier: EPL-2.0\n\n  Copyright Contributors to the Zowe Project.\n  -->", styles: [".file-tagging-container{padding:1rem}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"] }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DIALOG_DATA]
                }] }, { type: i1.MatDialogRef }, { type: i1$1.HttpClient }, { type: i3$1.MatSnackBar }] });

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/
const Angular2InjectionTokens = {
    /* Module level resources */
    LOGGER: 'virtualdesktop-ng2.0-0-0.logger',
    PLUGIN_DEFINITION: 'virtualdesktop-ng2.0-0-0.plugin-definition',
    LAUNCH_METADATA: 'virtualdesktop-ng2.0-0-0.launch-metadata',
    INSTANCE_ID: 'virtualdesktop-ng2.0-0-0.instance-id',
    /* Component Level Resources */
    PLUGIN_EMBED_ACTIONS: 'virtualdesktop-ng2.0-0-0.plugin-embed-actions',
    VIEWPORT_EVENTS: 'virtualdesktop-ng2.0-0-0.viewport-events',
    /* Window manager unique */
    MAIN_WINDOW_ID: 'virtualdesktop-ng2.0-0-0.window-id', /* optional */
    WINDOW_ACTIONS: 'virtualdesktop-ng2.0-0-0.window-actions', /* optional */
    WINDOW_EVENTS: 'virtualdesktop-ng2.0-0-0.window-events', /* optional */
    SESSION_EVENTS: 'virtualdesktop-ng2.0-0-0.session-events', /* optional */
    THEME_EVENTS: 'virtualdesktop-ng2.0-0-0.theme-events', /* optional */
};
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

  SPDX-License-Identifier: EPL-2.0

  Copyright Contributors to the Zowe Project.
*/

/**
 * [The tree component serves collapse/expansion of file/datasets]
 * @param  selector     [tree-root]
 * @param  templateUrl   [./tree.component.html]
 * @param  styleUrls     [./tree.component.css]
 * @param  providers     [None]
 * @return               [description]
 */
/**
 * [Input treeData supplies the tree structure]
 * [Input treeId supplies which tree is currently clicked]
  [Output  clickEvent supplies the folder click events]
 *
 * @return [description]
 */
class TreeComponent {
    constructor() {
        this.clickEvent = new EventEmitter();
        this.dblClickEvent = new EventEmitter();
        this.rightClickEvent = new EventEmitter();
        this.panelRightClickEvent = new EventEmitter();
        this.lastClickedNodeTimeout = 500; // < 500 ms becomes a double click
        this.lastClickedNodeName = null;
    }
    /**
     * [nodeSelect provides the child folder click event to the parent file/folder tree tab]
     * @param  _event [click event]
     * @return        [void]
     */
    nodeSelect(_event) {
        if (_event) {
            if (this.lastClickedNodeName == null || this.lastClickedNodeName != (_event.node.name || _event.node.data.name)) {
                this.lastClickedNodeName = _event.node.name || _event.node.data.name;
                this.clickEvent.emit(_event);
                setTimeout(() => (this.lastClickedNodeName = null), this.lastClickedNodeTimeout);
            }
            else {
                this.dblClickEvent.emit(_event);
            }
        }
    }
    nodeRightClickSelect(_event) {
        if (_event) {
            this.rightClickEvent.emit(_event);
            _event.originalEvent.stopPropagation();
        }
    }
    panelRightClickSelect(_event) {
        if (_event) {
            _event.preventDefault();
            this.panelRightClickEvent.emit(_event);
        }
    }
    ngAfterContentInit() {
        this.fileExplorerTree.nativeElement.addEventListener('contextmenu', this.panelRightClickSelect.bind(this));
    }
    unselectNode() {
        this.selectedNode = null;
    }
    ngOnDestroy() {
        this.fileExplorerTree.nativeElement.removeEventListener('contextmenu', this.panelRightClickSelect.bind(this));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: TreeComponent, deps: [], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.0.7", type: TreeComponent, selector: "tree-root", inputs: { treeData: "treeData", treeId: "treeId", style: "style", treeStyle: "treeStyle" }, outputs: { clickEvent: "clickEvent", dblClickEvent: "dblClickEvent", rightClickEvent: "rightClickEvent", panelRightClickEvent: "panelRightClickEvent" }, providers: [], viewQueries: [{ propertyName: "fileExplorerTree", first: true, predicate: ["fileExplorerPTree"], descendants: true, static: true }], ngImport: i0, template: "\r\n<!-- \r\n  This program and the accompanying materials are\r\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\r\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n  \r\n  SPDX-License-Identifier: EPL-2.0\r\n  \r\n  Copyright Contributors to the Zowe Project.\r\n-->\r\n\r\n<div class=\"fileexplorer-tree-panel\" #fileExplorerPTree [ngStyle]=\"treeStyle\">\r\n  <!-- {{treeData | json}} -->\r\n  <!-- <p-tree\r\n    styleClass=\"rs-com-css-file-navigator\"\r\n    [value]=\"treeData\"\r\n    <!- - selectionMode=\"single\"\r\n    [(selection)]=\"selectedNode\"\r\n    (onNodeSelect)=\"nodeSelect($event)\"\r\n    (onNodeExpand)=\"nodeExpand($event)\" - ->\r\n  >\r\n  </p-tree> -->\r\n  <p-tree\r\n    class=\"fileexplorer-p-tree\"\r\n    [value]=\"treeData\" \r\n    [id]=\"treeId\"\r\n    selectionMode=\"single\"\r\n    [(selection)]=\"selectedNode\"\r\n    (onNodeSelect)=\"nodeSelect($event)\"\r\n    (onNodeContextMenuSelect)=\"nodeRightClickSelect($event)\"\r\n    [ngStyle]=\"treeStyle\"\r\n    [contextMenu]=\"dummy\"\r\n    emptyMessage=\"\"\r\n  >\r\n  <!-- add [filter]=\"true\" with latest prime version (new feature March 2019) -->\r\n  </p-tree>\r\n  <!-- To properly use Prime's right click, we need a dummy context menu -->\r\n  <p-contextMenu #dummy></p-contextMenu>\r\n\r\n  <!-- <p-treeTable [value]=\"fileFolders\">\r\n      <p-column field=\"name\" header=\"Name\"></p-column>\r\n      <p-column field=\"type\" header=\"Type\"></p-column>\r\n  </p-treeTable> -->\r\n  <!-- <h1>{{treeData}}</h1> -->\r\n</div>\r\n\r\n<!-- \r\n  This program and the accompanying materials are\r\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\r\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n  \r\n  SPDX-License-Identifier: EPL-2.0\r\n  \r\n  Copyright Contributors to the Zowe Project.\r\n-->", styles: [".fileexplorer-tree-panel{flex:1 1 0px!important;background:transparent!important;height:100%!important;width:100%!important;margin-right:10px!important;color:inherit!important}.p-tree{width:100%!important;height:100%!important;min-width:300px!important;background:transparent!important;border:0px!important;border:none!important}.p-tree .p-tree-container{padding:15px 15px 9px!important;font-size:medium!important;color:inherit!important;overflow:auto!important;background-color:inherit!important;height:100%!important}.p-tree .p-widget .p-widget-content{background:transparent!important;border:0px!important;background-color:inherit!important}.p-treenode-label.p-state-highlight{background-color:#e0e0e0;border-radius:4px!important;padding-left:5px!important;padding-right:5px!important}.p-tree .p-treenode-label.p-state-highlight{color:#000}.p-treenode{width:fit-content!important;padding:1px!important;cursor:pointer!important}.p-treenode-content{display:table}.p-treenode-label{padding-left:3px;display:table-cell}.p-treenode-icon{padding-right:3px;display:table-cell}.p-tree-empty-message{color:#fff!important}.p-tree .p-treenode-children{margin:0!important;padding:0 0 0 1em!important}::-webkit-scrollbar-corner{background:#0000}*{list-style-type:none}.p-tree-wrapper{display:contents!important}.p-tree-toggler{display:none!important}\n", ".p-overflow-hidden{overflow:hidden;padding-right:var(--scrollbar-width)}@layer primeng{.p-component,.p-component *{box-sizing:border-box}.p-hidden{display:none}.p-hidden-space{visibility:hidden}.p-hidden-accessible{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.p-hidden-accessible input,.p-hidden-accessible select{transform:scale(0)}.p-reset{margin:0;padding:0;border:0;outline:0;text-decoration:none;font-size:100%;list-style:none}.p-disabled,.p-disabled *{cursor:default!important;pointer-events:none}.p-component-overlay{position:fixed;top:0;left:0;width:100%;height:100%}.p-unselectable-text{-webkit-user-select:none;user-select:none}.p-scrollbar-measure{width:100px;height:100px;overflow:scroll;position:absolute;top:-9999px}@-webkit-keyframes p-fadein{0%{opacity:0}to{opacity:1}}@keyframes p-fadein{0%{opacity:0}to{opacity:1}}input[type=button],input[type=submit],input[type=reset],input[type=file]::-webkit-file-upload-button,button{border-radius:0}.p-link{text-align:left;background-color:transparent;margin:0;padding:0;border:0;cursor:pointer;-webkit-user-select:none;user-select:none}.p-link:disabled{cursor:default}.p-sr-only{border:0;clip:rect(1px,1px,1px,1px);clip-path:inset(50%);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;word-wrap:normal!important}.p-connected-overlay{opacity:0;transform:scaleY(.8);transition:transform .12s cubic-bezier(0,0,.2,1),opacity .12s cubic-bezier(0,0,.2,1)}.p-connected-overlay-visible{opacity:1;transform:scaleY(1)}.p-connected-overlay-hidden{opacity:0;transform:scaleY(1);transition:opacity .1s linear}.p-toggleable-content.ng-animating{overflow:hidden}.p-icon-wrapper{display:inline-flex}.p-icon{display:inline-block}.p-icon-spin{-webkit-animation:p-icon-spin 2s infinite linear;animation:p-icon-spin 2s infinite linear}}@-webkit-keyframes p-icon-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@keyframes p-icon-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@layer primeng{.p-badge{display:inline-block;border-radius:10px;text-align:center;padding:0 .5rem}.p-overlay-badge{position:relative}.p-overlay-badge .p-badge{position:absolute;top:0;right:0;transform:translate(50%,-50%);transform-origin:100% 0;margin:0}.p-badge-dot{width:.5rem;min-width:.5rem;height:.5rem;border-radius:50%;padding:0}.p-badge-no-gutter{padding:0;border-radius:50%}}@layer primeng{.p-button{margin:0;display:inline-flex;cursor:pointer;-webkit-user-select:none;user-select:none;align-items:center;vertical-align:bottom;text-align:center;overflow:hidden;position:relative}.p-button-label{flex:1 1 auto}.p-button-icon-right{order:1}.p-button:disabled{cursor:default;pointer-events:none}.p-button-icon-only{justify-content:center}.p-button-icon-only:after{content:\"p\";visibility:hidden;clip:rect(0 0 0 0);width:0}.p-button-vertical{flex-direction:column}.p-button-icon-bottom{order:2}.p-button-group .p-button{margin:0}.p-button-group .p-button:focus,.p-button-group p-button:focus .p-button,.p-buttonset .p-button:focus,.p-buttonset p-button:focus .p-button{position:relative;z-index:1}.p-button-group .p-button:not(:last-child),.p-button-group .p-button:not(:last-child):hover,.p-button-group p-button:not(:last-child) .p-button,.p-button-group p-button:not(:last-child) .p-button:hover,.p-buttonset .p-button:not(:last-child),.p-buttonset .p-button:not(:last-child):hover,.p-buttonset p-button:not(:last-child) .p-button,.p-buttonset p-button:not(:last-child) .p-button:hover{border-right:0 none}.p-button-group .p-button:not(:first-of-type):not(:last-of-type),.p-button-group p-button:not(:first-of-type):not(:last-of-type) .p-button,.p-buttonset .p-button:not(:first-of-type):not(:last-of-type),.p-buttonset p-button:not(:first-of-type):not(:last-of-type) .p-button{border-radius:0}.p-button-group .p-button:first-of-type:not(:only-of-type),.p-button-group p-button:first-of-type:not(:only-of-type) .p-button,.p-buttonset .p-button:first-of-type:not(:only-of-type),.p-buttonset p-button:first-of-type:not(:only-of-type) .p-button{border-top-right-radius:0;border-bottom-right-radius:0}.p-button-group .p-button:last-of-type:not(:only-of-type),.p-button-group p-button:last-of-type:not(:only-of-type) .p-button,.p-buttonset .p-button:last-of-type:not(:only-of-type),.p-buttonset p-button:last-of-type:not(:only-of-type) .p-button{border-top-left-radius:0;border-bottom-left-radius:0}p-button[iconpos=right] spinnericon{order:1}}@layer primeng{.p-checkbox{display:inline-flex;cursor:pointer;-webkit-user-select:none;user-select:none;vertical-align:bottom;position:relative}.p-checkbox-disabled{cursor:default!important;pointer-events:none}.p-checkbox-box{display:flex;justify-content:center;align-items:center}p-checkbox{display:inline-flex;vertical-align:bottom;align-items:center}.p-checkbox-label{line-height:1}}.p-colorpicker-panel .p-colorpicker-color{background:transparent url(data:image/png;base64,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) no-repeat left top}.p-colorpicker-panel .p-colorpicker-hue{background:transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAACWCAIAAAC3uvTNAAAA7ElEQVRYw+2YUQqDQAxEh9GWuqV6Be9/JT88RN0VRUuv0ElBwhKY3yF5m90kLKd+mF/975r6geNyjm9Fy0kgqTJ6nqoIdGKczjmPJU5tZxA8wWPL7YOHKhZAlcmTAVVcxSCrMbfgqY/H6JEOoASPe56tgSrqLR7U2zWojwWjJ3jq47HEiZoGTwJxP1RRXw8y9RZfCMhbhTHOVTxXnUFtPJ5rGjzu35y2KfKGQxWT2K4TQL1d2zz6KAH1kRU8wfOXx+37qY3Hct+aDaqot2u7R/wMuDS3qnj0z0HqK4X/+kRNHdfUwFP2Nisqe/sFuUZiVjC9HCUAAAAASUVORK5CYII=) no-repeat left top}@layer primeng{.p-inputtext{margin:0}.p-fluid .p-inputtext{width:100%}.p-inputgroup{display:flex;align-items:stretch;width:100%}.p-inputgroup-addon{display:flex;align-items:center;justify-content:center}.p-inputgroup .p-float-label{display:flex;align-items:stretch;width:100%}.p-inputgroup .p-inputtext,.p-fluid .p-inputgroup .p-inputtext,.p-inputgroup .p-inputwrapper,.p-inputgroup .p-inputwrapper>.p-component{flex:1 1 auto;width:1%}.p-float-label{display:block;position:relative}.p-float-label label{position:absolute;pointer-events:none;top:50%;margin-top:-.5rem;transition-property:all;transition-timing-function:ease;line-height:1}.p-float-label textarea~label{top:1rem}.p-float-label input:focus~label,.p-float-label input.p-filled~label,.p-float-label textarea:focus~label,.p-float-label textarea.p-filled~label,.p-float-label .p-inputwrapper-focus~label,.p-float-label .p-inputwrapper-filled~label{top:-.75rem;font-size:12px}.p-float-label .input:-webkit-autofill~label{top:-20px;font-size:12px}.p-float-label .p-placeholder,.p-float-label input::placeholder,.p-float-label .p-inputtext::placeholder{opacity:0;transition-property:all;transition-timing-function:ease}.p-float-label .p-focus .p-placeholder,.p-float-label input:focus::placeholder,.p-float-label .p-inputtext:focus::placeholder{opacity:1;transition-property:all;transition-timing-function:ease}.p-input-icon-left,.p-input-icon-right{position:relative;display:inline-block}.p-input-icon-left>i,.p-input-icon-left>.p-icon-wrapper,.p-input-icon-right>i,.p-input-icon-right>.p-icon-wrapper{position:absolute;top:50%;margin-top:-.5rem}.p-fluid .p-input-icon-left,.p-fluid .p-input-icon-right{display:block;width:100%}}@layer primeng{.p-inputtextarea-resizable{overflow:hidden;resize:none}.p-fluid .p-inputtextarea{width:100%}}@layer primeng{.p-password{position:relative;display:inline-flex}.p-password-panel{position:absolute;top:0;left:0}.p-password .p-password-panel{min-width:100%}.p-password-meter{height:10px}.p-password-strength{height:100%;width:0;transition:width 1s ease-in-out}.p-fluid .p-password{display:flex}.p-password-input::-ms-reveal,.p-password-input::-ms-clear{display:none}.p-password-clear-icon{position:absolute;top:50%;margin-top:-.5rem;cursor:pointer}.p-password .p-icon{cursor:pointer}.p-password-clearable.p-password-mask .p-password-clear-icon{margin-top:unset}.p-password-clearable{position:relative}}@layer primeng{.p-radiobutton{display:inline-flex;cursor:pointer;-webkit-user-select:none;user-select:none;vertical-align:bottom;position:relative}.p-radiobutton-box{display:flex;justify-content:center;align-items:center}.p-radiobutton-icon{-webkit-backface-visibility:hidden;backface-visibility:hidden;transform:translateZ(0) scale(.1);border-radius:50%;visibility:hidden}.p-radiobutton-box.p-highlight .p-radiobutton-icon{transform:translateZ(0) scale(1);visibility:visible}p-radiobutton{display:inline-flex;vertical-align:bottom;align-items:center}.p-radiobutton-label{line-height:1}}@layer primeng{.p-ripple{overflow:hidden;position:relative}.p-ink{display:block;position:absolute;background:#ffffff80;border-radius:100%;transform:scale(0)}.p-ink-active{animation:ripple .4s linear}.p-ripple-disabled .p-ink{display:none!important}}@keyframes ripple{to{opacity:0;transform:scale(2.5)}}@layer primeng{.p-tooltip{position:absolute;display:none;padding:.25em .5rem;max-width:12.5rem;pointer-events:none}.p-tooltip.p-tooltip-right,.p-tooltip.p-tooltip-left{padding:0 .25rem}.p-tooltip.p-tooltip-top,.p-tooltip.p-tooltip-bottom{padding:.25em 0}.p-tooltip .p-tooltip-text{white-space:pre-line;word-break:break-word}.p-tooltip-arrow{scale:2;position:absolute;width:0;height:0;border-color:transparent;border-style:solid}.p-tooltip-right .p-tooltip-arrow{top:50%;left:0;margin-top:-.25rem;border-width:.25em .25em .25em 0}.p-tooltip-left .p-tooltip-arrow{top:50%;right:0;margin-top:-.25rem;border-width:.25em 0 .25em .25rem}.p-tooltip.p-tooltip-top{padding:.25em 0}.p-tooltip-top .p-tooltip-arrow{bottom:0;left:50%;margin-left:-.25rem;border-width:.25em .25em 0}.p-tooltip-bottom .p-tooltip-arrow{top:0;left:50%;margin-left:-.25rem;border-width:0 .25em .25rem}}\n"], dependencies: [{ kind: "directive", type: i7$1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "component", type: i2$1.Tree, selector: "p-tree", inputs: ["value", "selectionMode", "loadingMode", "selection", "style", "styleClass", "contextMenu", "layout", "draggableScope", "droppableScope", "draggableNodes", "droppableNodes", "metaKeySelection", "propagateSelectionUp", "propagateSelectionDown", "loading", "loadingIcon", "emptyMessage", "ariaLabel", "togglerAriaLabel", "ariaLabelledBy", "validateDrop", "filter", "filterBy", "filterMode", "filterPlaceholder", "filteredNodes", "filterLocale", "scrollHeight", "lazy", "virtualScroll", "virtualScrollItemSize", "virtualScrollOptions", "indentation", "_templateMap", "trackBy", "virtualNodeHeight"], outputs: ["selectionChange", "onNodeSelect", "onNodeUnselect", "onNodeExpand", "onNodeCollapse", "onNodeContextMenuSelect", "onNodeDrop", "onLazyLoad", "onScroll", "onScrollIndexChange", "onFilter"] }, { kind: "component", type: i3$2.ContextMenu, selector: "p-contextMenu", inputs: ["model", "triggerEvent", "target", "global", "style", "styleClass", "appendTo", "autoZIndex", "baseZIndex", "id", "ariaLabel", "ariaLabelledBy", "pressDelay"], outputs: ["onShow", "onHide"] }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: TreeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'tree-root', encapsulation: ViewEncapsulation.None, providers: [], template: "\r\n<!-- \r\n  This program and the accompanying materials are\r\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\r\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n  \r\n  SPDX-License-Identifier: EPL-2.0\r\n  \r\n  Copyright Contributors to the Zowe Project.\r\n-->\r\n\r\n<div class=\"fileexplorer-tree-panel\" #fileExplorerPTree [ngStyle]=\"treeStyle\">\r\n  <!-- {{treeData | json}} -->\r\n  <!-- <p-tree\r\n    styleClass=\"rs-com-css-file-navigator\"\r\n    [value]=\"treeData\"\r\n    <!- - selectionMode=\"single\"\r\n    [(selection)]=\"selectedNode\"\r\n    (onNodeSelect)=\"nodeSelect($event)\"\r\n    (onNodeExpand)=\"nodeExpand($event)\" - ->\r\n  >\r\n  </p-tree> -->\r\n  <p-tree\r\n    class=\"fileexplorer-p-tree\"\r\n    [value]=\"treeData\" \r\n    [id]=\"treeId\"\r\n    selectionMode=\"single\"\r\n    [(selection)]=\"selectedNode\"\r\n    (onNodeSelect)=\"nodeSelect($event)\"\r\n    (onNodeContextMenuSelect)=\"nodeRightClickSelect($event)\"\r\n    [ngStyle]=\"treeStyle\"\r\n    [contextMenu]=\"dummy\"\r\n    emptyMessage=\"\"\r\n  >\r\n  <!-- add [filter]=\"true\" with latest prime version (new feature March 2019) -->\r\n  </p-tree>\r\n  <!-- To properly use Prime's right click, we need a dummy context menu -->\r\n  <p-contextMenu #dummy></p-contextMenu>\r\n\r\n  <!-- <p-treeTable [value]=\"fileFolders\">\r\n      <p-column field=\"name\" header=\"Name\"></p-column>\r\n      <p-column field=\"type\" header=\"Type\"></p-column>\r\n  </p-treeTable> -->\r\n  <!-- <h1>{{treeData}}</h1> -->\r\n</div>\r\n\r\n<!-- \r\n  This program and the accompanying materials are\r\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\r\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n  \r\n  SPDX-License-Identifier: EPL-2.0\r\n  \r\n  Copyright Contributors to the Zowe Project.\r\n-->", styles: [".fileexplorer-tree-panel{flex:1 1 0px!important;background:transparent!important;height:100%!important;width:100%!important;margin-right:10px!important;color:inherit!important}.p-tree{width:100%!important;height:100%!important;min-width:300px!important;background:transparent!important;border:0px!important;border:none!important}.p-tree .p-tree-container{padding:15px 15px 9px!important;font-size:medium!important;color:inherit!important;overflow:auto!important;background-color:inherit!important;height:100%!important}.p-tree .p-widget .p-widget-content{background:transparent!important;border:0px!important;background-color:inherit!important}.p-treenode-label.p-state-highlight{background-color:#e0e0e0;border-radius:4px!important;padding-left:5px!important;padding-right:5px!important}.p-tree .p-treenode-label.p-state-highlight{color:#000}.p-treenode{width:fit-content!important;padding:1px!important;cursor:pointer!important}.p-treenode-content{display:table}.p-treenode-label{padding-left:3px;display:table-cell}.p-treenode-icon{padding-right:3px;display:table-cell}.p-tree-empty-message{color:#fff!important}.p-tree .p-treenode-children{margin:0!important;padding:0 0 0 1em!important}::-webkit-scrollbar-corner{background:#0000}*{list-style-type:none}.p-tree-wrapper{display:contents!important}.p-tree-toggler{display:none!important}\n", ".p-overflow-hidden{overflow:hidden;padding-right:var(--scrollbar-width)}@layer primeng{.p-component,.p-component *{box-sizing:border-box}.p-hidden{display:none}.p-hidden-space{visibility:hidden}.p-hidden-accessible{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.p-hidden-accessible input,.p-hidden-accessible select{transform:scale(0)}.p-reset{margin:0;padding:0;border:0;outline:0;text-decoration:none;font-size:100%;list-style:none}.p-disabled,.p-disabled *{cursor:default!important;pointer-events:none}.p-component-overlay{position:fixed;top:0;left:0;width:100%;height:100%}.p-unselectable-text{-webkit-user-select:none;user-select:none}.p-scrollbar-measure{width:100px;height:100px;overflow:scroll;position:absolute;top:-9999px}@-webkit-keyframes p-fadein{0%{opacity:0}to{opacity:1}}@keyframes p-fadein{0%{opacity:0}to{opacity:1}}input[type=button],input[type=submit],input[type=reset],input[type=file]::-webkit-file-upload-button,button{border-radius:0}.p-link{text-align:left;background-color:transparent;margin:0;padding:0;border:0;cursor:pointer;-webkit-user-select:none;user-select:none}.p-link:disabled{cursor:default}.p-sr-only{border:0;clip:rect(1px,1px,1px,1px);clip-path:inset(50%);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;word-wrap:normal!important}.p-connected-overlay{opacity:0;transform:scaleY(.8);transition:transform .12s cubic-bezier(0,0,.2,1),opacity .12s cubic-bezier(0,0,.2,1)}.p-connected-overlay-visible{opacity:1;transform:scaleY(1)}.p-connected-overlay-hidden{opacity:0;transform:scaleY(1);transition:opacity .1s linear}.p-toggleable-content.ng-animating{overflow:hidden}.p-icon-wrapper{display:inline-flex}.p-icon{display:inline-block}.p-icon-spin{-webkit-animation:p-icon-spin 2s infinite linear;animation:p-icon-spin 2s infinite linear}}@-webkit-keyframes p-icon-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@keyframes p-icon-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@layer primeng{.p-badge{display:inline-block;border-radius:10px;text-align:center;padding:0 .5rem}.p-overlay-badge{position:relative}.p-overlay-badge .p-badge{position:absolute;top:0;right:0;transform:translate(50%,-50%);transform-origin:100% 0;margin:0}.p-badge-dot{width:.5rem;min-width:.5rem;height:.5rem;border-radius:50%;padding:0}.p-badge-no-gutter{padding:0;border-radius:50%}}@layer primeng{.p-button{margin:0;display:inline-flex;cursor:pointer;-webkit-user-select:none;user-select:none;align-items:center;vertical-align:bottom;text-align:center;overflow:hidden;position:relative}.p-button-label{flex:1 1 auto}.p-button-icon-right{order:1}.p-button:disabled{cursor:default;pointer-events:none}.p-button-icon-only{justify-content:center}.p-button-icon-only:after{content:\"p\";visibility:hidden;clip:rect(0 0 0 0);width:0}.p-button-vertical{flex-direction:column}.p-button-icon-bottom{order:2}.p-button-group .p-button{margin:0}.p-button-group .p-button:focus,.p-button-group p-button:focus .p-button,.p-buttonset .p-button:focus,.p-buttonset p-button:focus .p-button{position:relative;z-index:1}.p-button-group .p-button:not(:last-child),.p-button-group .p-button:not(:last-child):hover,.p-button-group p-button:not(:last-child) .p-button,.p-button-group p-button:not(:last-child) .p-button:hover,.p-buttonset .p-button:not(:last-child),.p-buttonset .p-button:not(:last-child):hover,.p-buttonset p-button:not(:last-child) .p-button,.p-buttonset p-button:not(:last-child) .p-button:hover{border-right:0 none}.p-button-group .p-button:not(:first-of-type):not(:last-of-type),.p-button-group p-button:not(:first-of-type):not(:last-of-type) .p-button,.p-buttonset .p-button:not(:first-of-type):not(:last-of-type),.p-buttonset p-button:not(:first-of-type):not(:last-of-type) .p-button{border-radius:0}.p-button-group .p-button:first-of-type:not(:only-of-type),.p-button-group p-button:first-of-type:not(:only-of-type) .p-button,.p-buttonset .p-button:first-of-type:not(:only-of-type),.p-buttonset p-button:first-of-type:not(:only-of-type) .p-button{border-top-right-radius:0;border-bottom-right-radius:0}.p-button-group .p-button:last-of-type:not(:only-of-type),.p-button-group p-button:last-of-type:not(:only-of-type) .p-button,.p-buttonset .p-button:last-of-type:not(:only-of-type),.p-buttonset p-button:last-of-type:not(:only-of-type) .p-button{border-top-left-radius:0;border-bottom-left-radius:0}p-button[iconpos=right] spinnericon{order:1}}@layer primeng{.p-checkbox{display:inline-flex;cursor:pointer;-webkit-user-select:none;user-select:none;vertical-align:bottom;position:relative}.p-checkbox-disabled{cursor:default!important;pointer-events:none}.p-checkbox-box{display:flex;justify-content:center;align-items:center}p-checkbox{display:inline-flex;vertical-align:bottom;align-items:center}.p-checkbox-label{line-height:1}}.p-colorpicker-panel .p-colorpicker-color{background:transparent url(data:image/png;base64,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) no-repeat left top}.p-colorpicker-panel .p-colorpicker-hue{background:transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAACWCAIAAAC3uvTNAAAA7ElEQVRYw+2YUQqDQAxEh9GWuqV6Be9/JT88RN0VRUuv0ElBwhKY3yF5m90kLKd+mF/975r6geNyjm9Fy0kgqTJ6nqoIdGKczjmPJU5tZxA8wWPL7YOHKhZAlcmTAVVcxSCrMbfgqY/H6JEOoASPe56tgSrqLR7U2zWojwWjJ3jq47HEiZoGTwJxP1RRXw8y9RZfCMhbhTHOVTxXnUFtPJ5rGjzu35y2KfKGQxWT2K4TQL1d2zz6KAH1kRU8wfOXx+37qY3Hct+aDaqot2u7R/wMuDS3qnj0z0HqK4X/+kRNHdfUwFP2Nisqe/sFuUZiVjC9HCUAAAAASUVORK5CYII=) no-repeat left top}@layer primeng{.p-inputtext{margin:0}.p-fluid .p-inputtext{width:100%}.p-inputgroup{display:flex;align-items:stretch;width:100%}.p-inputgroup-addon{display:flex;align-items:center;justify-content:center}.p-inputgroup .p-float-label{display:flex;align-items:stretch;width:100%}.p-inputgroup .p-inputtext,.p-fluid .p-inputgroup .p-inputtext,.p-inputgroup .p-inputwrapper,.p-inputgroup .p-inputwrapper>.p-component{flex:1 1 auto;width:1%}.p-float-label{display:block;position:relative}.p-float-label label{position:absolute;pointer-events:none;top:50%;margin-top:-.5rem;transition-property:all;transition-timing-function:ease;line-height:1}.p-float-label textarea~label{top:1rem}.p-float-label input:focus~label,.p-float-label input.p-filled~label,.p-float-label textarea:focus~label,.p-float-label textarea.p-filled~label,.p-float-label .p-inputwrapper-focus~label,.p-float-label .p-inputwrapper-filled~label{top:-.75rem;font-size:12px}.p-float-label .input:-webkit-autofill~label{top:-20px;font-size:12px}.p-float-label .p-placeholder,.p-float-label input::placeholder,.p-float-label .p-inputtext::placeholder{opacity:0;transition-property:all;transition-timing-function:ease}.p-float-label .p-focus .p-placeholder,.p-float-label input:focus::placeholder,.p-float-label .p-inputtext:focus::placeholder{opacity:1;transition-property:all;transition-timing-function:ease}.p-input-icon-left,.p-input-icon-right{position:relative;display:inline-block}.p-input-icon-left>i,.p-input-icon-left>.p-icon-wrapper,.p-input-icon-right>i,.p-input-icon-right>.p-icon-wrapper{position:absolute;top:50%;margin-top:-.5rem}.p-fluid .p-input-icon-left,.p-fluid .p-input-icon-right{display:block;width:100%}}@layer primeng{.p-inputtextarea-resizable{overflow:hidden;resize:none}.p-fluid .p-inputtextarea{width:100%}}@layer primeng{.p-password{position:relative;display:inline-flex}.p-password-panel{position:absolute;top:0;left:0}.p-password .p-password-panel{min-width:100%}.p-password-meter{height:10px}.p-password-strength{height:100%;width:0;transition:width 1s ease-in-out}.p-fluid .p-password{display:flex}.p-password-input::-ms-reveal,.p-password-input::-ms-clear{display:none}.p-password-clear-icon{position:absolute;top:50%;margin-top:-.5rem;cursor:pointer}.p-password .p-icon{cursor:pointer}.p-password-clearable.p-password-mask .p-password-clear-icon{margin-top:unset}.p-password-clearable{position:relative}}@layer primeng{.p-radiobutton{display:inline-flex;cursor:pointer;-webkit-user-select:none;user-select:none;vertical-align:bottom;position:relative}.p-radiobutton-box{display:flex;justify-content:center;align-items:center}.p-radiobutton-icon{-webkit-backface-visibility:hidden;backface-visibility:hidden;transform:translateZ(0) scale(.1);border-radius:50%;visibility:hidden}.p-radiobutton-box.p-highlight .p-radiobutton-icon{transform:translateZ(0) scale(1);visibility:visible}p-radiobutton{display:inline-flex;vertical-align:bottom;align-items:center}.p-radiobutton-label{line-height:1}}@layer primeng{.p-ripple{overflow:hidden;position:relative}.p-ink{display:block;position:absolute;background:#ffffff80;border-radius:100%;transform:scale(0)}.p-ink-active{animation:ripple .4s linear}.p-ripple-disabled .p-ink{display:none!important}}@keyframes ripple{to{opacity:0;transform:scale(2.5)}}@layer primeng{.p-tooltip{position:absolute;display:none;padding:.25em .5rem;max-width:12.5rem;pointer-events:none}.p-tooltip.p-tooltip-right,.p-tooltip.p-tooltip-left{padding:0 .25rem}.p-tooltip.p-tooltip-top,.p-tooltip.p-tooltip-bottom{padding:.25em 0}.p-tooltip .p-tooltip-text{white-space:pre-line;word-break:break-word}.p-tooltip-arrow{scale:2;position:absolute;width:0;height:0;border-color:transparent;border-style:solid}.p-tooltip-right .p-tooltip-arrow{top:50%;left:0;margin-top:-.25rem;border-width:.25em .25em .25em 0}.p-tooltip-left .p-tooltip-arrow{top:50%;right:0;margin-top:-.25rem;border-width:.25em 0 .25em .25rem}.p-tooltip.p-tooltip-top{padding:.25em 0}.p-tooltip-top .p-tooltip-arrow{bottom:0;left:50%;margin-left:-.25rem;border-width:.25em .25em 0}.p-tooltip-bottom .p-tooltip-arrow{top:0;left:50%;margin-left:-.25rem;border-width:0 .25em .25rem}}\n"] }]
        }], ctorParameters: () => [], propDecorators: { treeData: [{
                type: Input
            }], treeId: [{
                type: Input
            }], style: [{
                type: Input
            }], treeStyle: [{
                type: Input
            }], clickEvent: [{
                type: Output
            }], dblClickEvent: [{
                type: Output
            }], rightClickEvent: [{
                type: Output
            }], panelRightClickEvent: [{
                type: Output
            }], fileExplorerTree: [{
                type: ViewChild,
                args: ['fileExplorerPTree', { static: true }]
            }] } });

class SearchHistoryService {
    constructor(pluginDefinition, http) {
        this.pluginDefinition = pluginDefinition;
        this.http = http;
        this.scope = 'user';
        this.resourcePath = 'ui/history';
    }
    onInit(type) {
        this.type = type;
        this.basePlugin = this.pluginDefinition.getBasePlugin();
        this.resourceName = `${type}Search.json`;
        this.uri = ZoweZLUX.uriBroker.pluginConfigForScopeUri(this.basePlugin, this.scope, this.resourcePath, this.resourceName);
        this.searchHistory = [];
        this.getData();
    }
    getData() {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        let options = { headers: headers };
        const getRequest = this.http
            .get(this.uri, options).pipe(catchError((err => {
            let type = this.type;
            console.log(err);
            return null;
        })));
        const sub = getRequest.subscribe((data) => {
            if (data && data.contents && data.contents.history) {
                this.searchHistory = Array.from(new Set(this.searchHistory.concat(data.contents.history)));
            }
            ;
            this.initHistory = true;
            sub.unsubscribe();
        });
    }
    saveData(history) {
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        let options = { headers: headers };
        let params = {
            "history": history
        };
        return this.http
            .put(this.uri, params, options).pipe(catchError((err => {
            let type = this.type;
            console.log(`save${type}SearchHistory error`, err);
            return null;
        })));
    }
    saveSearchHistory(path) {
        if (path && path.trim() != '' && !this.searchHistory.includes(path)) {
            this.searchHistory.push(path);
            if (this.initHistory) {
                //setTimeout(()=> {
                return this.saveData(this.searchHistory);
                //}, 100); 
            }
            else {
                return of(this.searchHistory);
            }
        }
        return of(this.searchHistory);
    }
    get searchHistoryVal() {
        return this.searchHistory;
    }
    deleteSearchHistory() {
        return this.http.delete(this.uri).pipe(catchError((err => {
            let type = this.type;
            console.log(`delete${type}SearchHistory error`, err);
            return null;
        })));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: SearchHistoryService, deps: [{ token: Angular2InjectionTokens.PLUGIN_DEFINITION }, { token: i1$1.HttpClient }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: SearchHistoryService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: SearchHistoryService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.PLUGIN_DEFINITION]
                }] }, { type: i1$1.HttpClient }] });

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
class UtilsService {
    constructor() { }
    filePathCheck(path) {
        if (path.charAt(0) === '/') {
            return path.substring(1);
        }
        return path;
    }
    filePathEndCheck(path) {
        if (path.slice(-1) !== '/') {
            return path + "/";
        }
        return path;
    }
    isDatasetMigrated(attrs) {
        return attrs.volser === 'MIGRAT' || attrs.volser === 'ARCIVE';
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: UtilsService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: UtilsService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: UtilsService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
class DatasetCrudService {
    constructor(http, utils) {
        this.http = http;
        this.utils = utils;
    }
    handleErrorObservable(error) {
        console.error(error.message || error);
        return throwError(error.message || error);
    }
    //addfolder
    addfolder() {
    }
    //removefolder
    removefolder() {
    }
    //copyfolder
    copyfolder() {
    }
    //deletefolder
    deletefolder() {
    }
    //renamefolder
    renamefolder() {
    }
    //addfile
    addfile() {
    }
    //removefile
    removefile() {
    }
    //copyfile
    copyfile() {
    }
    //deletefile
    deletefile() {
    }
    //renamefile
    renamefile() {
    }
    deleteNonVsamDatasetOrMember(rightClickedFile) {
        let url = ZoweZLUX.uriBroker.datasetContentsUri(rightClickedFile.data.path);
        return this.http.delete(url).pipe(catchError(this.handleErrorObservable));
    }
    deleteVsamDataset(rightClickedFile) {
        let url = ZoweZLUX.uriBroker.VSAMdatasetContentsUri(rightClickedFile.data.path);
        return this.http.delete(url).pipe(catchError(this.handleErrorObservable));
    }
    queryDatasets(query, detail, includeAdditionalQualifiers) {
        let url;
        url = ZoweZLUX.uriBroker.datasetMetadataUri(encodeURIComponent(query.toUpperCase().replace(/\.$/, '')), detail.toString(), undefined, true, undefined, undefined, undefined, undefined, undefined, includeAdditionalQualifiers.toString());
        return this.http.get(url).pipe(catchError(this.handleErrorObservable));
    }
    getDataset(path) {
        let url = ZoweZLUX.uriBroker.datasetContentsUri(path.trim().toUpperCase());
        return this.http.get(url).pipe(catchError(this.handleErrorObservable));
    }
    recallDataset(path) {
        const datasetName = path.trim().toUpperCase();
        const contentsURI = ZoweZLUX.uriBroker.datasetContentsUri(datasetName);
        const detail = String(true);
        const types = undefined;
        const listMembers = true;
        const workAreaSize = undefined;
        const includeMigrated = true;
        const metadataURI = ZoweZLUX.uriBroker.datasetMetadataUri(datasetName, detail, types, listMembers, workAreaSize, includeMigrated);
        return this.http.get(contentsURI)
            .pipe(
        // dataset contents service may return an error, e.g. if dataset has RECFM=U
        // recall should happen inspite of the error
        catchError(_err => of('')), 
        // get metadata to ensure that the dataset has successfully recalled
        switchMap(() => this.http.get(metadataURI)), 
        // map(res => res.json()),
        map((data) => data.datasets[0]), switchMap(
        // ensure that dataset is recalled, otherwise throw an error
        datasetAttrs => this.utils.isDatasetMigrated(datasetAttrs) ?
            throwError(new Error('Unable to recall dataset')) : of(datasetAttrs)));
    }
    createDataset(datasetAttributes, name) {
        const contentsURI = ZoweZLUX.uriBroker.datasetContentsUri(name);
        return this.http.put(contentsURI, datasetAttributes)
            .pipe(catchError(error => throwError(error)), map((res) => res));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: DatasetCrudService, deps: [{ token: i1$1.HttpClient }, { token: UtilsService }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: DatasetCrudService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: DatasetCrudService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1$1.HttpClient }, { type: UtilsService }] });

// /*
//   This program and the accompanying materials are
//   made available under the terms of the Eclipse Public License v2.0 which accompanies
//   this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
//   SPDX-License-Identifier: EPL-2.0
//   Copyright Contributors to the Zowe Project.
// */
var ConfigVariables;
(function (ConfigVariables) {
    ConfigVariables["ASCII"] = "819";
    ConfigVariables["EBCDIC"] = "1047";
    ConfigVariables["UTF8"] = "1208";
})(ConfigVariables || (ConfigVariables = {}));
class DownloaderService {
    constructor(log) {
        this.log = log;
        this.totalSize = 1;
        this.startTime = 0;
    }
    async fetchFileHandler(fetchPath, fileName, downloadObject) {
        this.abortController = new AbortController();
        this.abortSignal = this.abortController.signal;
        this.totalSize = downloadObject.size;
        // Define the endcoding type.(in case of USS file download)
        if (downloadObject.sourceEncoding != undefined && downloadObject.targetEncoding != undefined) {
            let queriesObject = {
                "source": downloadObject.sourceEncoding,
                "target": downloadObject.targetEncoding
            };
            fetchPath = fetchPath + "?" + await this.getQueryString(queriesObject);
        }
        this.startTime = new Date().getTime();
        const response = await fetch(fetchPath, { signal: this.abortSignal });
        // Mock size for now
        // this.totalSize =  Number(response.headers.get('X-zowe-filesize'));
        // TODO: The following core download logic is from the FTA & may require refactoring or future bug-proofing
        // get the stream from the resposnse body.
        const readbleStream = response.body != null ? response.body : Promise.reject("Cannot receive data from the host machine");
        // queueing strategy.
        const queuingStrategy = new CountQueuingStrategy({ highWaterMark: 5 });
        // for browsers not supporting writablestram make sure to assign the polyfil writablestream.
        streamSaver.WritableStream = WritableStream;
        // create the write stream.
        const fileStream = streamSaver.createWriteStream(fileName, {
            writableStrategy: queuingStrategy,
            readableStrategy: queuingStrategy
        });
        const writer = fileStream.getWriter();
        this.currentWriter = writer;
        const context = this;
        await new Promise((resolve, reject) => {
            new ReadableStream({
                start(controller) {
                    let reader = null;
                    if (downloadObject.data.isDataset) {
                        response.json().then(json => {
                            reader = json.records.filter(function (record) { return record.length > 0; }).map(function (record) { return record.trim(); }).join("\n");
                            const blob = new Blob([reader], { type: 'text/plain' });
                            createAndDownloadElement(blob, downloadObject.data.path);
                            resolve();
                        })
                            .catch(error => {
                            context.log.severe("An error occurred downloading " + fileName);
                            controller.error(error);
                            reject(error);
                        });
                    }
                    else {
                        reader = response.body.getReader();
                        read();
                    }
                    function read() {
                        reader.read().then(({ done, value }) => {
                            if (done) { // If download completes...
                                writer.close();
                                controller.close();
                                context.log.debug("Finished writing the content to the target file " + fileName + " in host machine. Cleaning up...");
                                resolve();
                            }
                            if (value != undefined) {
                                writer.write(value);
                                read();
                            }
                        }).catch(error => {
                            context.log.severe("An error occurred downloading " + fileName);
                            controller.error(error);
                            reject(error);
                        });
                    }
                }
            }, queuingStrategy);
        });
    }
    // Create query strings to append in the request.
    getQueryString(queries) {
        return Object.keys(queries).reduce((result, key) => {
            if (ConfigVariables[queries[key]]) {
                return [...result, `${encodeURIComponent(key)}=${encodeURIComponent(ConfigVariables[queries[key]])}`];
            }
            else {
                return [];
            }
        }, []).join('&');
    }
    ;
    // Cancel current download.
    cancelDownload() {
        if (this.currentWriter) {
            this.currentWriter.abort();
            this.currentWriter.releaseLock();
            this.abortController.abort();
            this.totalSize = 1;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: DownloaderService, deps: [{ token: Angular2InjectionTokens.LOGGER }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: DownloaderService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: DownloaderService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.LOGGER]
                }] }] });
function createAndDownloadElement(blob, fileName) {
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = fileName;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
/* TODO: re-implement to add fetching of previously opened tree view data
import { PersistentDataService } from '../../services/persistentData.service'; */
// Used for DS async deletion UX
const CSS_NODE_DELETING = "filebrowsermvs-node-deleting";
const SEARCH_ID$1 = 'mvs';
class FileBrowserMVSComponent {
    constructor(elementRef, utils, mvsSearchHistory, snackBar, datasetService, downloadService, dialog, log, pluginDefinition, windowActions) {
        this.elementRef = elementRef;
        this.utils = utils;
        this.mvsSearchHistory = mvsSearchHistory;
        this.snackBar = snackBar;
        this.datasetService = datasetService;
        this.downloadService = downloadService;
        this.dialog = dialog;
        this.log = log;
        this.pluginDefinition = pluginDefinition;
        this.windowActions = windowActions;
        this.deletionQueue = new Map(); //DS deletion is async, so queue is used
        /* Tree outgoing events */
        this.pathChanged = new EventEmitter();
        this.dataChanged = new EventEmitter();
        this.nodeClick = new EventEmitter();
        this.nodeDblClick = new EventEmitter();
        this.rightClick = new EventEmitter();
        this.deleteClick = new EventEmitter();
        this.openInNewTab = new EventEmitter();
        this.createDataset = new EventEmitter();
        /* TODO: Legacy, capabilities code (unused for now) */
        //this.componentClass = ComponentClass.FileBrowser;
        //this.initalizeCapabilities();
        this.mvsSearchHistory.onInit(SEARCH_ID$1);
        this.path = "";
        this.hideExplorer = false;
        this.isLoading = false;
        this.additionalQualifiers = true;
        this.showSearch = false;
        this.searchCtrl = new FormControl();
        this.searchValueSubscription = this.searchCtrl.valueChanges.pipe(debounceTime(500)).subscribe((value) => { this.searchInputChanged(value); });
        this.selectedNode = null;
    }
    ngOnInit() {
        // TODO: Fetching updates for automatic refresh (disabled for now)
        // this.intervalId = setInterval(() => {
        //   if(this.data){
        //     this.getTreeForQueryAsync(this.path).then((response: any) => {
        //       let newData = response;
        //       this.updateTreeData(this.data, newData);
        //       if (this.showSearch) {
        //         if (this.dataCached) {
        //           this.updateTreeData(this.dataCached, newData);
        //         }
        //       }
        //       /* We don't update search history, nor emit path changed event, because this method is meant
        //       to be a fetched update, not a user action new path */
        //     });
        //   }
        // }, this.updateInterval);
        this.initializeRightClickProperties();
    }
    ngOnDestroy() {
        if (this.searchValueSubscription) {
            this.searchValueSubscription.unsubscribe();
        }
        if (this.deleteSubscription) {
            this.deleteSubscription.unsubscribe();
        }
        if (this.deleteNonVsamSubscription) {
            this.deleteNonVsamSubscription.unsubscribe();
        }
        if (this.deleteVsamSubscription) {
            this.deleteVsamSubscription.unsubscribe();
        }
        if (this.saveHistorySubscription) {
            this.saveHistorySubscription.unsubscribe();
        }
        // TODO: Fetching updates for automatic refresh (disabled for now)
        // if (this.intervalId) {
        //   clearInterval(this.intervalId);
        // }
    }
    // Updates the 'data' array with new data, preserving existing expanded datasets
    updateTreeData(destinationData, newData) {
        //Only update if data sets are added/removed
        // TODO: Add a more in-depth check for DS updates (check DS properties too?)
        if (destinationData.length != newData.length) {
            this.log.debug("Change in dataset count detected. Updating tree...");
            let expandedFolders = destinationData.filter(dataObj => dataObj.expanded);
            //checks if the query response contains the same PDS' that are currently expanded
            let newDataHasExpanded = newData.filter(dataObj => expandedFolders.some(expanded => expanded.label === dataObj.label));
            //Keep currently expanded datasets expanded after update
            if (newDataHasExpanded.length > 0) {
                let expandedNewData = newData.map((obj) => {
                    let retObj = {};
                    newDataHasExpanded.forEach((expandedObj) => {
                        if (obj.label == expandedObj.label) {
                            obj.expanded = true;
                        }
                        retObj = obj;
                    });
                    return retObj;
                });
                destinationData = expandedNewData;
            }
            else {
                destinationData = newData;
            }
        }
    }
    /* TODO: Legacy, capabilities code (unused for now) */
    /*initalizeCapabilities(){
      this.capabilities = new Array<Capability>();
      this.capabilities.push(FileBrowserCapabilities.FileBrowser);
      this.capabilities.push(FileBrowserCapabilities.FileBrowserMVS);
    }*/
    initializeRightClickProperties() {
        this.rightClickPropertiesDatasetFile = [
            {
                text: "Request Open in New Browser Tab", action: () => {
                    this.openInNewTab.emit(this.rightClickedFile);
                }
            },
            {
                text: "Copy Link", action: () => {
                    this.copyLink(this.rightClickedFile);
                }
            },
            {
                text: "Properties", action: () => {
                    this.showPropertiesDialog(this.rightClickedFile);
                }
            },
            {
                text: "Delete", action: () => {
                    this.showDeleteDialog(this.rightClickedFile);
                }
            },
            {
                text: "Download", action: () => {
                    this.attemptDownload(this.rightClickedFile);
                }
            }
        ];
        this.rightClickPropertiesDatasetFolder = [
            {
                text: "Copy Link", action: () => {
                    this.copyLink(this.rightClickedFile);
                }
            },
            {
                text: "Properties", action: () => {
                    this.showPropertiesDialog(this.rightClickedFile);
                }
            },
            {
                text: "Delete", action: () => {
                    this.showDeleteDialog(this.rightClickedFile);
                }
            }
        ];
        this.rightClickPropertiesPanel = [
            {
                text: "Show/Hide Search", action: () => {
                    this.toggleSearch();
                }
            }
        ];
    }
    showDeleteDialog(rightClickedFile) {
        if (this.checkIfInDeletionQueueAndMessage(rightClickedFile.data.path, "This is already being deleted.") == true) {
            return;
        }
        const fileDeleteConfig = new MatDialogConfig();
        fileDeleteConfig.data = {
            event: rightClickedFile,
            width: '600px'
        };
        let fileDeleteRef = this.dialog.open(DeleteFileModal, fileDeleteConfig);
        this.deleteSubscription = fileDeleteRef.componentInstance.onDelete.subscribe(() => {
            let vsamCSITypes = ['R', 'D', 'G', 'I', 'C'];
            if (vsamCSITypes.indexOf(rightClickedFile.data.datasetAttrs.csiEntryType) != -1) {
                this.deleteVsamDataset(rightClickedFile);
            }
            else {
                this.deleteNonVsamDataset(rightClickedFile);
            }
        });
    }
    deleteNonVsamDataset(rightClickedFile) {
        this.isLoading = true;
        this.deletionQueue.set(rightClickedFile.data.path, rightClickedFile);
        rightClickedFile.styleClass = CSS_NODE_DELETING;
        this.deleteNonVsamSubscription = this.datasetService.deleteNonVsamDatasetOrMember(rightClickedFile)
            .subscribe({
            next: resp => {
                this.isLoading = false;
                this.snackBar.open(resp.msg, 'Dismiss', defaultSnackbarOptions);
                this.removeChild(rightClickedFile);
                this.deletionQueue.delete(rightClickedFile.data.path);
                rightClickedFile.styleClass = "";
                this.deleteClick.emit(this.rightClickedEvent.node);
            },
            error: error => {
                if (error.status == '500') { //Internal Server Error
                    this.snackBar.open("Failed to delete: '" + rightClickedFile.data.path + "' This is probably due to a server agent problem.", 'Dismiss', defaultSnackbarOptions);
                }
                else if (error.status == '404') { //Not Found
                    this.snackBar.open(rightClickedFile.data.path + ' has already been deleted or does not exist.', 'Dismiss', defaultSnackbarOptions);
                    this.removeChild(rightClickedFile);
                }
                else if (error.status == '400') { //Bad Request
                    this.snackBar.open("Failed to delete '" + rightClickedFile.data.path + "' This is probably due to a permission problem.", 'Dismiss', defaultSnackbarOptions);
                }
                else { //Unknown
                    this.snackBar.open("Unknown error '" + error.status + "' occurred for: " + rightClickedFile.data.path, 'Dismiss', longSnackbarOptions);
                    // Error info gets printed in uss.crud.service.ts
                }
                this.deletionQueue.delete(rightClickedFile.data.path);
                this.isLoading = false;
                rightClickedFile.styleClass = "";
                this.log.severe(error);
            }
        });
        setTimeout(() => {
            if (this.deleteNonVsamSubscription.closed == false) {
                this.snackBar.open('Deleting ' + rightClickedFile.data.path + '... Larger payloads may take longer. Please be patient.', 'Dismiss', quickSnackbarOptions);
            }
        }, 4000);
    }
    deleteVsamDataset(rightClickedFile) {
        this.isLoading = true;
        this.deletionQueue.set(rightClickedFile.data.path, rightClickedFile);
        rightClickedFile.styleClass = CSS_NODE_DELETING;
        this.deleteVsamSubscription = this.datasetService.deleteVsamDataset(rightClickedFile)
            .subscribe({
            next: resp => {
                this.isLoading = false;
                this.snackBar.open(resp.msg, 'Dismiss', defaultSnackbarOptions);
                //Update vs removing node since symbolicly linked data/index of vsam can be named anything
                this.updateTreeView(this.path);
                this.deletionQueue.delete(rightClickedFile.data.path);
                rightClickedFile.styleClass = "";
                this.deleteClick.emit(this.rightClickedEvent.node);
            },
            error: error => {
                if (error.status == '500') { //Internal Server Error
                    this.snackBar.open("Failed to delete: '" + rightClickedFile.data.path + "' This is probably due to a server agent problem.", 'Dismiss', defaultSnackbarOptions);
                }
                else if (error.status == '404') { //Not Found
                    this.snackBar.open(rightClickedFile.data.path + ' has already been deleted or does not exist.', 'Dismiss', defaultSnackbarOptions);
                    this.updateTreeView(this.path);
                }
                else if (error.status == '400') { //Bad Request
                    this.snackBar.open("Failed to delete '" + rightClickedFile.data.path + "' This is probably due to a permission problem.", 'Dismiss', defaultSnackbarOptions);
                }
                else if (error.status == '403') { //Bad Request
                    this.snackBar.open("Failed to delete '" + rightClickedFile.data.path + "'" + ". " + JSON.parse(error._body)['msg'], 'Dismiss', defaultSnackbarOptions);
                }
                else { //Unknown
                    this.snackBar.open("Unknown error '" + error.status + "' occurred for: " + rightClickedFile.data.path, 'Dismiss', longSnackbarOptions);
                    //Error info gets printed in uss.crud.service.ts
                }
                this.deletionQueue.delete(rightClickedFile.data.path);
                this.isLoading = false;
                rightClickedFile.styleClass = "";
                this.log.severe(error);
            }
        });
        setTimeout(() => {
            if (this.deleteVsamSubscription.closed == false) {
                this.snackBar.open('Deleting ' + rightClickedFile.data.path + '... Larger payloads may take longer. Please be patient.', 'Dismiss', quickSnackbarOptions);
            }
        }, 4000);
    }
    removeChild(node) {
        let nodes = this.data;
        if (node.parent) {
            let parent = node.parent;
            let index = parent.children.indexOf(node);
            if (index == -1) {
                return;
            }
            else {
                parent.children.splice(index, 1);
                nodes[nodes.indexOf(node.parent)] = parent;
                this.data = nodes;
            }
        }
        else {
            let index = nodes.indexOf(node);
            if (index == -1) {
                return;
            }
            else {
                nodes.splice(nodes.indexOf(node), 1);
                this.data = nodes;
            }
        }
        if (this.showSearch) { // If we remove a node, we need to update it in search bar cache
            let nodeDataCached = this.findNodeByPath(this.dataCached, node.data.path);
            if (nodeDataCached) {
                let nodeCached = nodeDataCached[0];
                let indexCached = nodeDataCached[1];
                if (indexCached != -1) {
                    if (nodeCached.parent) {
                        nodeCached.parent.children.splice(indexCached, 1);
                        let parentDataCached = this.findNodeByPath(this.dataCached, node.parent.data.path);
                        if (parentDataCached) {
                            let parentIndexCached = parentDataCached[1];
                            this.dataCached[parentIndexCached] = nodeCached.parent;
                        }
                    }
                    else {
                        this.dataCached.splice(indexCached, 1);
                    }
                }
            }
        }
    }
    // TODO: Could be optimized to do breadth first search vs depth first search
    findNodeByPath(data, path) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].data.path == path) {
                return [data[i], i]; // 0 - node, 1 - index
            }
            if (data[i].children && data[i].children.length > 0) {
                this.findNodeByPath(data[i].children, path);
            }
        }
        return [null, null];
    }
    attemptDownload(rightClickedFile) {
        let dataset = rightClickedFile.data.path;
        let filename = rightClickedFile.label;
        let downloadObject = rightClickedFile;
        let url = ZoweZLUX.uriBroker.datasetContentsUri(dataset);
        this.downloadService.fetchFileHandler(url, filename, downloadObject).then((res) => {
            // TODO: Download queue code for progress bar could go here
        });
    }
    copyLink(rightClickedFile) {
        let link = '';
        if (rightClickedFile.type == 'file') {
            link = `${window.location.origin}${window.location.pathname}?pluginId=${this.pluginDefinition.getBasePlugin().getIdentifier()}:data:${encodeURIComponent(`{"type":"openDataset","name":"${rightClickedFile.data.path}","toggleTree":true}`)}`;
        }
        else {
            link = `${window.location.origin}${window.location.pathname}?pluginId=${this.pluginDefinition.getBasePlugin().getIdentifier()}:data:${encodeURIComponent(`{"type":"openDSList","name":"${rightClickedFile.data.path}","toggleTree":false}`)}`;
        }
        navigator.clipboard.writeText(link).then(() => {
            this.log.debug("Link copied to clipboard");
            this.snackBar.open("Copied link successfully", 'Dismiss', quickSnackbarOptions);
        }).catch(() => {
            console.error("Failed to copy link to clipboard");
        });
    }
    showPropertiesDialog(rightClickedFile) {
        const filePropConfig = new MatDialogConfig();
        filePropConfig.data = {
            event: rightClickedFile,
            width: 'fit-content',
            maxWidth: '1100px',
            height: '475px'
        };
        this.dialog.open(DatasetPropertiesModal, filePropConfig);
    }
    toggleSearch() {
        this.showSearch = !this.showSearch;
        if (this.showSearch) {
            this.focusSearchInput();
            this.dataCached = _.cloneDeep(this.data); // We want a deep clone so we can modify this.data w/o changing this.dataCached
        }
        else {
            if (this.dataCached) {
                this.data = this.dataCached; // We don't care about deep clone because we just want to get dataCached back
            }
        }
    }
    focusSearchInput(attemptCount) {
        if (this.searchMVS) {
            this.searchMVS.nativeElement.focus();
            return;
        }
        const maxAttempts = 10;
        if (typeof attemptCount !== 'number') {
            attemptCount = maxAttempts;
        }
        if (attemptCount > 0) {
            attemptCount--;
            setTimeout(() => this.focusSearchInput(attemptCount), 100);
        }
    }
    searchInputChanged(input) {
        input = input.toUpperCase(); // Client-side the DS are uppercase
        if (this.dataCached) {
            this.data = _.cloneDeep(this.dataCached);
        }
        this.filterNodesByLabel(this.data, input);
    }
    filterNodesByLabel(data, label) {
        for (let i = 0; i < data.length; i++) {
            if (!(data[i]).label.includes(label)) {
                if (data[i].children && data[i].children.length > 0) {
                    this.filterNodesByLabel(data[i].children, label);
                }
                if (!(data[i].children && data[i].children.length > 0)) {
                    data.splice(i, 1);
                    i--;
                } // TODO: Refactor ".data" of USS node and ".type" of DS node to be the same thing 
                else if (data[i].type = "folder") { // If some children didn't get filtered out (aka we got some matches) and we have a folder
                    // then we want to expand the node so the user can see their results in the search bar
                    data[i].expanded = true;
                }
            }
        }
    }
    getDOMElement() {
        return this.elementRef.nativeElement;
    }
    getSelectedPath() {
        //TODO:how do we want to want to handle caching vs message to app to open said path
        return this.path;
    }
    onNodeClick($event) {
        this.selectedNode = $event.node;
        if ($event.node.type == 'folder') {
            $event.node.expanded = !$event.node.expanded;
            if (this.showSearch) { // Update search bar cached data
                let nodeCached = this.findNodeByPath(this.dataCached, $event.node.data.path)[0];
                if (nodeCached) {
                    nodeCached.expanded = $event.node.expanded;
                }
            }
        }
        if (this.utils.isDatasetMigrated($event.node.data.datasetAttrs)) {
            const path = $event.node.data.path;
            const snackBarRef = this.snackBar.open(`Recalling dataset '${path}'`, undefined, { panelClass: 'center' });
            this.datasetService.recallDataset($event.node.data.path)
                .pipe(finalize(() => snackBarRef.dismiss()))
                .subscribe({
                next: attrs => {
                    this.updateRecalledDatasetNode($event.node, attrs);
                    if (this.showSearch) { // Update search bar cached data
                        let nodeCached = this.findNodeByPath(this.dataCached, $event.node.data.path)[0];
                        if (nodeCached) {
                            this.updateRecalledDatasetNode(nodeCached, attrs);
                        }
                    }
                    this.nodeClick.emit($event.node);
                },
                error: _err => this.snackBar.open(`Failed to recall dataset '${path}'`, 'Dismiss', defaultSnackbarOptions)
            });
            return;
        }
        this.nodeClick.emit($event.node);
    }
    onNodeDblClick($event) {
        this.selectedNode = $event.node;
        if (this.selectedNode.data?.hasChildren && this.selectedNode.children?.length > 0) {
            this.path = $event.node.data.path;
            if (this.path) {
                this.getTreeForQueryAsync(this.path).then((res) => {
                    this.data = res[0].children;
                    this.onPathChanged(this.path);
                    this.refreshHistory(this.path);
                });
            }
            else {
                this.log.debug("A DS node double click event was received to open, but no path was found");
            }
        }
        this.nodeDblClick.emit($event.node);
    }
    onNodeRightClick(event) {
        let node = event.node;
        let rightClickProperties;
        if (node.type === 'file') {
            rightClickProperties = this.rightClickPropertiesDatasetFile;
        }
        else {
            rightClickProperties = this.rightClickPropertiesDatasetFolder;
        }
        if (this.windowActions) {
            let didContextMenuSpawn = this.windowActions.spawnContextMenu(event.originalEvent.clientX, event.originalEvent.clientY, rightClickProperties, true);
            // TODO: Fix Zowe's context menu such that if it doesn't have enough space to spawn, it moves itself accordingly to spawn.
            if (!didContextMenuSpawn) { // If context menu failed to spawn...
                let heightAdjustment = event.originalEvent.clientY - 25; // Bump it up 25px
                didContextMenuSpawn = this.windowActions.spawnContextMenu(event.originalEvent.clientX, heightAdjustment, rightClickProperties, true);
            }
        }
        this.rightClickedFile = node;
        this.rightClickedEvent = event;
        this.rightClick.emit(event.node);
        event.originalEvent.preventDefault();
    }
    onPanelRightClick($event) {
        if (this.windowActions) {
            let didContextMenuSpawn = this.windowActions.spawnContextMenu($event.clientX, $event.clientY, this.rightClickPropertiesPanel, true);
            // TODO: Fix Zowe's context menu such that if it doesn't have enough space to spawn, it moves itself accordingly to spawn.
            if (!didContextMenuSpawn) { // If context menu failed to spawn...
                let heightAdjustment = $event.clientY - 25; // Bump it up 25px
                didContextMenuSpawn = this.windowActions.spawnContextMenu($event.clientX, heightAdjustment, this.rightClickPropertiesPanel, true);
            }
        }
    }
    collapseTree() {
        let dataArray = this.data;
        for (let i = 0; i < dataArray.length; i++) {
            if (this.data[i].expanded == true) {
                this.data[i].expanded = false;
            }
        }
        this.treeComponent.unselectNode();
    }
    updateTreeView(path) {
        this.getTreeForQueryAsync(path).then((res) => {
            this.data = res;
            if (this.showSearch) {
                this.dataCached = this.data;
                this.showSearch = false;
            }
        }, (error) => {
            if (error.status == '0') {
                this.snackBar.open("Failed to communicate with the App server: " + error.status, 'Dismiss', defaultSnackbarOptions);
            }
            else if (error.status == '400' && path == '') {
                this.snackBar.open("No dataset name specified: " + error.status, 'Dismiss', defaultSnackbarOptions);
            }
            else if (error.status == '400') {
                this.snackBar.open("Bad request: " + error.status, 'Dismiss', defaultSnackbarOptions);
            }
            else {
                this.snackBar.open("An unknown error occurred: " + error.status, 'Dismiss', defaultSnackbarOptions);
            }
            this.log.severe(error);
        });
        this.onPathChanged(path);
        this.refreshHistory(path);
    }
    onPathChanged($event) {
        this.pathChanged.emit($event);
    }
    onDataChanged($event) {
        this.dataChanged.emit($event);
    }
    setPath(path) {
        this.path = path;
    }
    getTreeForQueryAsync(path) {
        return new Promise((resolve, reject) => {
            this.isLoading = true;
            this.datasetService.queryDatasets(path, true, this.additionalQualifiers).pipe(take(1)).subscribe({
                next: (res) => {
                    this.onDataChanged(res);
                    let parents = [];
                    let parentMap = {};
                    if (res.datasets.length > 0) {
                        for (let i = 0; i < res.datasets.length; i++) {
                            let currentNode = {};
                            currentNode.children = [];
                            currentNode.label = res.datasets[i].name.replace(/^\s+|\s+$/, '');
                            //data.id attribute is not used by either parent or child, but required as part of the ProjectStructure interface
                            let resAttr = res.datasets[i];
                            let currentNodeData = {
                                id: String(i),
                                name: currentNode.label,
                                fileName: currentNode.label,
                                path: currentNode.label,
                                hasChildren: false,
                                isDataset: true,
                                datasetAttrs: {
                                    csiEntryType: resAttr.csiEntryType,
                                    dsorg: resAttr.dsorg,
                                    recfm: resAttr.recfm,
                                    volser: resAttr.volser
                                }
                            };
                            currentNode.data = currentNodeData;
                            let migrated = this.utils.isDatasetMigrated(currentNode.data.datasetAttrs);
                            if (currentNode.data.datasetAttrs.dsorg
                                && currentNode.data.datasetAttrs.dsorg.organization === 'partitioned') {
                                currentNode.type = 'folder';
                                currentNode.expanded = false;
                                if (migrated) {
                                    currentNode.icon = 'fa fa-clock-o';
                                }
                                else {
                                    currentNode.expandedIcon = 'fa fa-folder-open';
                                    currentNode.collapsedIcon = 'fa fa-folder';
                                }
                                if (res.datasets[i].members) {
                                    currentNode.data.hasChildren = true;
                                    this.addChildren(currentNode, res.datasets[i].members);
                                }
                            }
                            else {
                                currentNode.icon = (migrated) ? 'fa fa-clock-o' : 'fa fa-file';
                                currentNode.type = 'file';
                            }
                            parents.push(currentNode);
                            parentMap[currentNode.label] = currentNode;
                        }
                        this.isLoading = false;
                    }
                    else {
                        this.snackBar.open("No datasets were found for '" + path + "'", 'Dismiss', quickSnackbarOptions);
                        //data set probably doesnt exist
                        this.isLoading = false;
                    }
                    resolve(parents);
                },
                error: (err) => {
                    this.isLoading = false;
                    reject(err);
                }
            });
        });
    }
    addChildren(parentNode, members) {
        for (let i = 0; i < members.length; i++) {
            let childNode = {};
            childNode.type = 'file';
            childNode.icon = 'fa fa-file';
            childNode.label = members[i].name.replace(/^\s+|\s+$/, '');
            childNode.parent = parentNode;
            let childNodeData = {
                id: parentNode.data.id,
                name: childNode.label,
                hasChildren: false,
                isDataset: true,
                datasetAttrs: parentNode.data.datasetAttrs
            };
            childNodeData.path = childNodeData.fileName = `${parentNode.label}(${childNode.label})`;
            childNode.data = childNodeData;
            parentNode.children.push(childNode);
        }
    }
    updateRecalledDatasetNode(node, datasetAttrs) {
        const showAsFolder = Array.isArray(datasetAttrs.members);
        node.data.datasetAttrs = datasetAttrs;
        if (showAsFolder) {
            node.data.hasChildren = true;
            this.addChildren(node, datasetAttrs.members);
            node.expandedIcon = 'fa fa-folder-open';
            node.collapsedIcon = 'fa fa-folder';
            node.expanded = true;
            node.icon = undefined;
            node.type = 'folder';
        }
        else {
            node.icon = 'fa fa-file';
            node.type = 'file';
        }
    }
    refreshHistory(path) {
        this.saveHistorySubscription = this.mvsSearchHistory
            .saveSearchHistory(path)
            .subscribe();
    }
    clearSearchHistory() {
        this.mvsSearchHistory.deleteSearchHistory().subscribe();
        this.mvsSearchHistory.onInit(SEARCH_ID$1);
    }
    /**
    * [levelUp: function to ascend up a level in the file/folder tree]
    * @param index [tree index where the 'folder' parent is accessed]
    */
    levelUp() {
        if (!this.path.includes('.')) {
            this.path = '';
        }
        let regex = new RegExp(/\.[^\.]+$/);
        if (this.path.substr(this.path.length - 2, 2) == '.*') {
            this.path = this.path.replace(regex, '').replace(regex, '.*');
        }
        else {
            this.path = this.path.replace(regex, '.*');
        }
        this.updateTreeView(this.path);
    }
    checkIfInDeletionQueueAndMessage(pathAndName, message) {
        if (this.deletionQueue.has(pathAndName)) {
            this.snackBar.open('Deletion in progress: ' + pathAndName + "' " + message, 'Dismiss', defaultSnackbarOptions);
            return true;
        }
        return false;
    }
    createDatasetDialog(data) {
        const dsCreateConfig = new MatDialogConfig();
        dsCreateConfig.data = {
            data
        };
        dsCreateConfig.maxWidth = '1000px';
        dsCreateConfig.disableClose = true;
        let saveRef = this.dialog.open(CreateDatasetModal, dsCreateConfig);
        saveRef.afterClosed().subscribe(attributes => {
            if (attributes.datasetNameType == 'LIBRARY') {
                attributes.datasetNameType = 'PDSE';
            }
            if (attributes) {
                const datasetAttributes = {
                    ndisp: 'CATALOG',
                    status: 'NEW',
                    space: attributes.allocationUnit,
                    dsorg: attributes.organization,
                    lrecl: parseInt(attributes.recordLength),
                    recfm: attributes.recordFormat,
                    dir: parseInt(attributes.directoryBlocks),
                    prime: parseInt(attributes.primarySpace),
                    secnd: parseInt(attributes.secondarySpace),
                    dsnt: attributes.datasetNameType,
                    close: 'true'
                };
                if (attributes.averageRecordUnit) {
                    datasetAttributes['avgr'] = attributes.averageRecordUnit;
                }
                if (attributes.blockSize) {
                    datasetAttributes['blksz'] = parseInt(attributes.blockSize);
                }
                this.datasetService.createDataset(datasetAttributes, attributes.name).subscribe({
                    next: resp => {
                        this.snackBar.open(`Dataset: ${attributes.name} created successfully.`, 'Dismiss', quickSnackbarOptions);
                        this.createDataset.emit({ status: 'success', name: attributes.name, org: attributes.organization, initData: dsCreateConfig.data.data });
                    },
                    error: error => {
                        this.snackBar.open(`Failed to create the dataset: ${error.error}`, 'Dismiss', longSnackbarOptions);
                        this.createDataset.emit({ status: 'error', error: error.error, name: attributes.name });
                    }
                });
            }
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FileBrowserMVSComponent, deps: [{ token: i0.ElementRef }, { token: UtilsService }, { token: SearchHistoryService }, { token: i3$1.MatSnackBar }, { token: DatasetCrudService }, { token: DownloaderService }, { token: i1.MatDialog }, { token: Angular2InjectionTokens.LOGGER }, { token: Angular2InjectionTokens.PLUGIN_DEFINITION }, { token: Angular2InjectionTokens.WINDOW_ACTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: FileBrowserMVSComponent, selector: "file-browser-mvs", inputs: { inputStyle: "inputStyle", searchStyle: "searchStyle", treeStyle: "treeStyle", style: "style", showUpArrow: "showUpArrow" }, outputs: { pathChanged: "pathChanged", dataChanged: "dataChanged", nodeClick: "nodeClick", nodeDblClick: "nodeDblClick", rightClick: "rightClick", deleteClick: "deleteClick", openInNewTab: "openInNewTab", createDataset: "createDataset" }, providers: [DatasetCrudService, /*PersistentDataService,*/ SearchHistoryService], viewQueries: [{ propertyName: "treeComponent", first: true, predicate: TreeComponent, descendants: true }, { propertyName: "searchMVS", first: true, predicate: ["searchMVS"], descendants: true }], ngImport: i0, template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n\n<div style=\"height: 100%\">\n\n  <!-- Tabs, searchbar, and loading indicator -->\n  @if (showUpArrow) {\n  <img data-toggle=\"tooltip\" class=\"filebrowsermvs-pointer-logo\" title=\"Go up to the parent level\" (click)=\"levelUp()\"\n    [ngStyle]=\"treeStyle\" tabindex=\"0\" (keydown.enter)=\"levelUp()\" />\n  }\n\n  <div class=\"filebrowsermvs-search\" [ngStyle]=\"searchStyle\">\n    <div class=\"searchRowFlex\">\n      <input [(ngModel)]=\"path\" list=\"searchMVSHistory\" placeholder=\"Enter a dataset query...\"\n        class=\"filebrowsermvs-search-input\" (keydown.enter)=\"updateTreeView(path);\" [ngStyle]=\"inputStyle\">\n      <!-- TODO: make search history a directive to use in both uss and mvs-->\n      <mat-button-toggle-group id=\"qualGroup\" name=\"qualGroup\"  #group=\"matButtonToggleGroup\" [hideSingleSelectionIndicator]=\"true\">\n        <mat-button-toggle [checked]=\"additionalQualifiers\" class=\"qualButton\"\n          (click)=\"additionalQualifiers = !additionalQualifiers\" aria-label=\"Include additional qualifiers\"\n          title=\"Include Additional Qualifiers\">\n          <strong>.**</strong>\n        </mat-button-toggle>\n      </mat-button-toggle-group>\n      <datalist id=\"searchMVSHistory\">\n        @for (item of mvsSearchHistory.searchHistoryVal; track item) {\n        <option [value]=\"item\"></option>\n        }\n      </datalist>\n    </div>\n  </div>\n\n  <div class=\"fa fa-spinner fa-spin filebrowsermvs-loading-icon\" [hidden]=\"!isLoading\"></div>\n  <div class=\"fa fa-refresh filebrowsermvs-loading-icon\" title=\"Refresh dataset list\" (click)=\"updateTreeView(path);\"\n    [hidden]=\"isLoading\" style=\"margin-left: 9px; cursor: pointer;\"></div>\n  <div class=\"file-tree-utilities\">\n    <div class=\"fa fa-minus-square-o filebrowseruss-collapse-icon\" title=\"Collapse Folders in Explorer\"\n      (click)=\"collapseTree();\" style=\"margin-right: 9px; float:right; cursor: pointer;\"></div>\n    <div class=\"fa fa-trash-o filebrowseruss-delete-icon\" title=\"Delete\" (click)=\"showDeleteDialog(selectedNode);\"\n      style=\"margin-right: 9px; float:right; cursor: pointer;\"></div>\n    <div class=\"fa fa-plus\" title=\"Create new dataset\" (click)=\"createDatasetDialog()\"\n      style=\"margin-right: 9px; float:right; cursor: pointer;\"></div>\n    <div class=\"fa fa-eraser filebrowser-icon special-utility\" title=\"Clear Search History\"\n      (click)=\"clearSearchHistory();\"></div>\n  </div>\n  <!-- Main tree -->\n  <div [hidden]=\"hideExplorer\" style=\"height: 100%;\">\n    <tree-root [treeData]=\"data\" (clickEvent)=\"onNodeClick($event)\" (dblClickEvent)=\"onNodeDblClick($event)\"\n      [style]=\"style\" (rightClickEvent)=\"onNodeRightClick($event)\" (panelRightClickEvent)=\"onPanelRightClick($event)\"\n      (dataChanged)=\"onDataChanged($event)\">\n    </tree-root>\n  </div>\n\n  @if (showSearch) {\n  <div class=\"p-inputgroup filebrowseruss-search-bottom-group\">\n    <span class=\"p-inputgroup-addon\"><i class=\"fa fa-search filebrowseruss-search-bottom-icon\"></i></span>\n    <input type=\"text\" pInputText placeholder=\"Search datasets/members by name...\"\n      class=\"filebrowseruss-search-bottom-input\" [formControl]=\"searchCtrl\" #searchMVS>\n  </div>\n  }\n</div>\n<!--\n    This program and the accompanying materials are\n    made available under the terms of the Eclipse Public License v2.0 which accompanies\n    this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n    SPDX-License-Identifier: EPL-2.0\n\n    Copyright Contributors to the Zowe Project.\n    -->", styles: [".searchRowFlex{display:flex;flex-direction:row}.filebrowsermvs-search{width:fit-content;min-width:250px;margin-left:5px;display:inline-block;height:40px}.filebrowsermvs-search-input{width:100%;min-height:30px;font-family:sans-serif;font-size:15px;height:35px;background-color:#464646;color:#fff;padding-left:5px;border:0px;flex-grow:2}.filebrowsermvs-pointer-logo{content:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsSAAALEgHS3X78AAAA2UlEQVQ4y7XRwUkEQRSE4c9xDcAEFCYFYzCFCaGDavQgeDOEWTQBA1AQ9KCgpxUEQVh3vLyBgdnuw4APGprqqp96NP85KaU2pdTWPE0tjB73NUhTCd+ixTHuSpCmEO5xil2cE/T7IE0h3OIBWwx4Cm0GaQrhNS5xEIDr0GaQaYNx3zU6fAegiXs3gZzNADnnMdjlnDch76LBEFqH85zzzZhbTfcJyL4VD+N9Ey3q3xjzO/FsS6ZVBTDECpYCPvATDd6XAF7xEp63JYBnXOAIj0sAn7iK+1fJ9AcOn0qIhbHEXwAAAABJRU5ErkJggg==);width:20px;height:20px;filter:brightness(3);cursor:pointer}.p-tree-empty-message{color:transparent;height:0px}.filebrowsermvs-node-deleting{opacity:.5}#qualGroup{max-height:35px;min-height:30px}.qualButton:not(.mat-button-toggle-checked){background-color:#464646;color:#757575}.file-tree-utilities{overflow:hidden;border:1px solid #464646}.filebrowsermvs-loading-icon{margin-left:8px!important;font-size:large!important}.filebrowser-icon{margin-right:9px;float:right;cursor:pointer}.special-utility{margin-left:9px}\n"], dependencies: [{ kind: "directive", type: i7$1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "directive", type: i4.NgSelectOption, selector: "option", inputs: ["ngValue", "value"] }, { kind: "directive", type: i4.ɵNgSelectMultipleOption, selector: "option", inputs: ["ngValue", "value"] }, { kind: "directive", type: i4.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i4.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i4.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i9$1.MatButtonToggleGroup, selector: "mat-button-toggle-group", inputs: ["appearance", "name", "vertical", "value", "multiple", "disabled", "hideSingleSelectionIndicator", "hideMultipleSelectionIndicator"], outputs: ["valueChange", "change"], exportAs: ["matButtonToggleGroup"] }, { kind: "component", type: i9$1.MatButtonToggle, selector: "mat-button-toggle", inputs: ["aria-label", "aria-labelledby", "id", "name", "value", "tabIndex", "disableRipple", "appearance", "checked", "disabled"], outputs: ["change"], exportAs: ["matButtonToggle"] }, { kind: "directive", type: i10$1.InputText, selector: "[pInputText]", inputs: ["variant"] }, { kind: "directive", type: i4.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }, { kind: "component", type: TreeComponent, selector: "tree-root", inputs: ["treeData", "treeId", "style", "treeStyle"], outputs: ["clickEvent", "dblClickEvent", "rightClickEvent", "panelRightClickEvent"] }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FileBrowserMVSComponent, decorators: [{
            type: Component,
            args: [{ selector: 'file-browser-mvs', encapsulation: ViewEncapsulation.None, providers: [DatasetCrudService, /*PersistentDataService,*/ SearchHistoryService], template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n\n<div style=\"height: 100%\">\n\n  <!-- Tabs, searchbar, and loading indicator -->\n  @if (showUpArrow) {\n  <img data-toggle=\"tooltip\" class=\"filebrowsermvs-pointer-logo\" title=\"Go up to the parent level\" (click)=\"levelUp()\"\n    [ngStyle]=\"treeStyle\" tabindex=\"0\" (keydown.enter)=\"levelUp()\" />\n  }\n\n  <div class=\"filebrowsermvs-search\" [ngStyle]=\"searchStyle\">\n    <div class=\"searchRowFlex\">\n      <input [(ngModel)]=\"path\" list=\"searchMVSHistory\" placeholder=\"Enter a dataset query...\"\n        class=\"filebrowsermvs-search-input\" (keydown.enter)=\"updateTreeView(path);\" [ngStyle]=\"inputStyle\">\n      <!-- TODO: make search history a directive to use in both uss and mvs-->\n      <mat-button-toggle-group id=\"qualGroup\" name=\"qualGroup\"  #group=\"matButtonToggleGroup\" [hideSingleSelectionIndicator]=\"true\">\n        <mat-button-toggle [checked]=\"additionalQualifiers\" class=\"qualButton\"\n          (click)=\"additionalQualifiers = !additionalQualifiers\" aria-label=\"Include additional qualifiers\"\n          title=\"Include Additional Qualifiers\">\n          <strong>.**</strong>\n        </mat-button-toggle>\n      </mat-button-toggle-group>\n      <datalist id=\"searchMVSHistory\">\n        @for (item of mvsSearchHistory.searchHistoryVal; track item) {\n        <option [value]=\"item\"></option>\n        }\n      </datalist>\n    </div>\n  </div>\n\n  <div class=\"fa fa-spinner fa-spin filebrowsermvs-loading-icon\" [hidden]=\"!isLoading\"></div>\n  <div class=\"fa fa-refresh filebrowsermvs-loading-icon\" title=\"Refresh dataset list\" (click)=\"updateTreeView(path);\"\n    [hidden]=\"isLoading\" style=\"margin-left: 9px; cursor: pointer;\"></div>\n  <div class=\"file-tree-utilities\">\n    <div class=\"fa fa-minus-square-o filebrowseruss-collapse-icon\" title=\"Collapse Folders in Explorer\"\n      (click)=\"collapseTree();\" style=\"margin-right: 9px; float:right; cursor: pointer;\"></div>\n    <div class=\"fa fa-trash-o filebrowseruss-delete-icon\" title=\"Delete\" (click)=\"showDeleteDialog(selectedNode);\"\n      style=\"margin-right: 9px; float:right; cursor: pointer;\"></div>\n    <div class=\"fa fa-plus\" title=\"Create new dataset\" (click)=\"createDatasetDialog()\"\n      style=\"margin-right: 9px; float:right; cursor: pointer;\"></div>\n    <div class=\"fa fa-eraser filebrowser-icon special-utility\" title=\"Clear Search History\"\n      (click)=\"clearSearchHistory();\"></div>\n  </div>\n  <!-- Main tree -->\n  <div [hidden]=\"hideExplorer\" style=\"height: 100%;\">\n    <tree-root [treeData]=\"data\" (clickEvent)=\"onNodeClick($event)\" (dblClickEvent)=\"onNodeDblClick($event)\"\n      [style]=\"style\" (rightClickEvent)=\"onNodeRightClick($event)\" (panelRightClickEvent)=\"onPanelRightClick($event)\"\n      (dataChanged)=\"onDataChanged($event)\">\n    </tree-root>\n  </div>\n\n  @if (showSearch) {\n  <div class=\"p-inputgroup filebrowseruss-search-bottom-group\">\n    <span class=\"p-inputgroup-addon\"><i class=\"fa fa-search filebrowseruss-search-bottom-icon\"></i></span>\n    <input type=\"text\" pInputText placeholder=\"Search datasets/members by name...\"\n      class=\"filebrowseruss-search-bottom-input\" [formControl]=\"searchCtrl\" #searchMVS>\n  </div>\n  }\n</div>\n<!--\n    This program and the accompanying materials are\n    made available under the terms of the Eclipse Public License v2.0 which accompanies\n    this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n    SPDX-License-Identifier: EPL-2.0\n\n    Copyright Contributors to the Zowe Project.\n    -->", styles: [".searchRowFlex{display:flex;flex-direction:row}.filebrowsermvs-search{width:fit-content;min-width:250px;margin-left:5px;display:inline-block;height:40px}.filebrowsermvs-search-input{width:100%;min-height:30px;font-family:sans-serif;font-size:15px;height:35px;background-color:#464646;color:#fff;padding-left:5px;border:0px;flex-grow:2}.filebrowsermvs-pointer-logo{content:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsSAAALEgHS3X78AAAA2UlEQVQ4y7XRwUkEQRSE4c9xDcAEFCYFYzCFCaGDavQgeDOEWTQBA1AQ9KCgpxUEQVh3vLyBgdnuw4APGprqqp96NP85KaU2pdTWPE0tjB73NUhTCd+ixTHuSpCmEO5xil2cE/T7IE0h3OIBWwx4Cm0GaQrhNS5xEIDr0GaQaYNx3zU6fAegiXs3gZzNADnnMdjlnDch76LBEFqH85zzzZhbTfcJyL4VD+N9Ey3q3xjzO/FsS6ZVBTDECpYCPvATDd6XAF7xEp63JYBnXOAIj0sAn7iK+1fJ9AcOn0qIhbHEXwAAAABJRU5ErkJggg==);width:20px;height:20px;filter:brightness(3);cursor:pointer}.p-tree-empty-message{color:transparent;height:0px}.filebrowsermvs-node-deleting{opacity:.5}#qualGroup{max-height:35px;min-height:30px}.qualButton:not(.mat-button-toggle-checked){background-color:#464646;color:#757575}.file-tree-utilities{overflow:hidden;border:1px solid #464646}.filebrowsermvs-loading-icon{margin-left:8px!important;font-size:large!important}.filebrowser-icon{margin-right:9px;float:right;cursor:pointer}.special-utility{margin-left:9px}\n"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: UtilsService }, { type: SearchHistoryService }, { type: i3$1.MatSnackBar }, { type: DatasetCrudService }, { type: DownloaderService }, { type: i1.MatDialog }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.LOGGER]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.PLUGIN_DEFINITION]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [Angular2InjectionTokens.WINDOW_ACTIONS]
                }] }], propDecorators: { treeComponent: [{
                type: ViewChild,
                args: [TreeComponent]
            }], searchMVS: [{
                type: ViewChild,
                args: ['searchMVS']
            }], inputStyle: [{
                type: Input
            }], searchStyle: [{
                type: Input
            }], treeStyle: [{
                type: Input
            }], style: [{
                type: Input
            }], showUpArrow: [{
                type: Input
            }], pathChanged: [{
                type: Output
            }], dataChanged: [{
                type: Output
            }], nodeClick: [{
                type: Output
            }], nodeDblClick: [{
                type: Output
            }], rightClick: [{
                type: Output
            }], deleteClick: [{
                type: Output
            }], openInNewTab: [{
                type: Output
            }], createDataset: [{
                type: Output
            }] } });

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
class UploaderService {
    constructor(http, log, snackBar) {
        this.http = http;
        this.log = log;
        this.snackBar = snackBar;
    }
    // uploadDirPath should be a directory on the remote server without a / at the end.
    // Example: '/u/ts6531'
    chunkAndSendFile(file, uploadDirPath, targetEncoding) {
        return new Observable(observer => {
            const fileSize = file.size;
            const chunkSize = 3 * 1024 * 1024; // bytes
            let sourceEncoding;
            targetEncoding === 'BINARY' ? sourceEncoding = 'BINARY' : sourceEncoding = 'UTF-8';
            let chunkIdx = 0;
            let offset = 0;
            let sessionID;
            const uri = ZoweZLUX.uriBroker.unixFileUri('contents', uploadDirPath.slice(1) + '/' + file.name, sourceEncoding, targetEncoding, undefined, true);
            //console.table({'URI': uri, 'File Name': file.name, 'File Size': fileSize, 'Chunk Size': chunkSize}); - easy to see, useful for dev
            // Initiate connection with the zssServer
            const getSessionID = () => {
                return this.http.put(uri, '');
            };
            // Generate the HTTP PUT request and return an Observable for the response
            const sendChunk = (blob, lastChunk, sessionID) => {
                let parameters = new HttpParams();
                parameters = parameters.append('chunkIndex', chunkIdx.toString());
                if (sessionID) {
                    parameters = parameters.append('sessionID', sessionID.toString());
                }
                if (lastChunk) {
                    parameters = parameters.append('lastChunk', 'true');
                }
                else {
                    parameters = parameters.append('lastChunk', 'false');
                }
                const options = {
                    params: parameters
                };
                return this.http.put(uri, blob, options);
            };
            // Once the chunk is read we must package it in an HTTP request and send it to the zss Server
            const readEventHandler = (event) => {
                if (event.target.error === null) {
                    offset += chunkSize;
                    let lastChunk = false;
                    if (offset >= fileSize) {
                        offset = fileSize;
                        lastChunk = true;
                        this.log.debug('Sending last chunk');
                    }
                    // console.table({'offset': offset, 'fileSize': fileSize, 'progress': offset / fileSize}); - easy to see, useful for dev
                    observer.next(offset / fileSize);
                    const commaIdx = event.target.result.indexOf(',');
                    sendChunk(event.target.result.slice(commaIdx + 1), lastChunk, sessionID)
                        .subscribe((response) => {
                        this.log.debug('Chunk sent - chunkIdx:', chunkIdx, ', offset:', offset);
                        if (offset < fileSize) {
                            chunkReaderBlock(offset, chunkSize, file);
                            chunkIdx++;
                        }
                        else {
                            observer.complete();
                        }
                    }, (error) => {
                        this.log.debug(error);
                        observer.error();
                    });
                }
                else {
                    this.log.debug('Read Error: ' + event.target.error);
                    return;
                }
            };
            // Read slice of file, then run the readEventHandler
            const chunkReaderBlock = (_offset, length, _file) => {
                const reader = new FileReader();
                const blob = _file.slice(_offset, length + _offset);
                reader.onload = readEventHandler;
                reader.readAsDataURL(blob); // Base 64
            };
            getSessionID()
                .subscribe((response) => {
                sessionID = response['sessionID'];
                chunkReaderBlock(offset, chunkSize, file);
            }, (error) => {
                this.snackBar.open(("An error occurred while uploading " + file.name + " - " + error.error.error), 'Dismiss', longSnackbarOptions);
                this.log.debug(error);
            });
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: UploaderService, deps: [{ token: i1$1.HttpClient }, { token: Angular2InjectionTokens.LOGGER }, { token: i3$1.MatSnackBar }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: UploaderService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: UploaderService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1$1.HttpClient }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.LOGGER]
                }] }, { type: i3$1.MatSnackBar }] });

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
/** Error when invalid control is dirty, touched, or submitted. */
class MyErrorStateMatcher {
    isErrorState(control, form) {
        const isSubmitted = form && form.submitted;
        return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
}
class UploadModal {
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: UploadModal, deps: [{ token: MAT_DIALOG_DATA }, { token: UploaderService }, { token: i3$1.MatSnackBar }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: UploadModal, selector: "upload-files-modal", providers: [
            { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
        ], viewQueries: [{ propertyName: "fileUpload", first: true, predicate: ["fileUpload"], descendants: true }], ngImport: i0, template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"modal-icon-container\">\n      <!-- FA Icon is determined by class name, so we hardcode the style here -->\n      <mat-icon style=\"font-size: 30px; position: absolute;\">cloud_upload</mat-icon>\n    </div>\n    <div>\n      <!-- Intentional lazy recycling of \"create\" modal CSS, TODO: move to shared/modal css -->\n      <h2 mat-dialog-title class=\"modal-mat-header\">Upload Files in {{folderPath}}</h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n\n  </div>\n  <button mat-button class=\"modal-mat-button add\" (click)=\"addFile()\">Select File</button>\n\n  <div style=\"max-height: 400px; overflow-y:scroll;\">\n    <ul>\n      @for (file of files; track file; let i = $index) {\n      <li class=\"\">\n        <label>\n          {{ file.name }}\n        </label>\n        <mat-form-field appearance=\"fill\" style=\"margin-left: 36px;\">\n          <input matInput required type=\"text\" [(ngModel)]=\"selectedOption\" (ngModelChange)=\"onValueChange($event)\"\n            [matAutocomplete]=\"auto\" [errorStateMatcher]=\"matcher\" #encodingInput=\"ngModel\"\n            placeholder=\"Select target encoding\">\n          <mat-autocomplete autoActiveFirstOption #auto=\"matAutocomplete\" [displayWith]=\"displayFn\">\n            @for (option of encodings; track option) {\n            <mat-option [value]=\"option.value\">\n              {{ option.name }}\n            </mat-option>\n            }\n          </mat-autocomplete>\n          @if (encodingInput.hasError('required')) {\n          <mat-error>\n            Encoding is required\n          </mat-error>\n          }\n        </mat-form-field>\n        <a href=\"https://www.ibm.com/docs/en/zos/2.1.0?topic=ccsids-encoding-scheme\" target=\"_blank\">\n          <i class=\"fa fa-question-circle dataset-properties-question-circle\"></i>\n        </a>\n      </li>\n      }\n    </ul>\n  </div>\n\n  <mat-dialog-actions>\n    <button mat-button mat-dialog-close class=\"modal-mat-button create\" (click)=\"uploadHandlerSetup()\"\n      [disabled]=\"!selectedOptionValid\">Upload</button>\n    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->\n  </mat-dialog-actions>\n</div>\n<input type=\"file\" style=\"display: none\" #fileUpload (change)=\"onFileUploaded($event)\">\n\n<!--\n  This program and the accompanying materials are\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n  SPDX-License-Identifier: EPL-2.0\n\n  Copyright Contributors to the Zowe Project.\n  -->", styles: [".modal-mat-button.add{color:#000}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"], dependencies: [{ kind: "directive", type: i4.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i4.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i4.RequiredValidator, selector: ":not([type=checkbox])[required][formControlName],:not([type=checkbox])[required][formControl],:not([type=checkbox])[required][ngModel]", inputs: ["required"] }, { kind: "directive", type: i4.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "component", type: i5.MatFormField, selector: "mat-form-field", inputs: ["hideRequiredMarker", "color", "floatLabel", "appearance", "subscriptSizing", "hintLabel"], exportAs: ["matFormField"] }, { kind: "directive", type: i5.MatError, selector: "mat-error, [matError]", inputs: ["id"] }, { kind: "component", type: i6$1.MatIcon, selector: "mat-icon", inputs: ["color", "inline", "svgIcon", "fontSet", "fontIcon"], exportAs: ["matIcon"] }, { kind: "directive", type: i7.MatInput, selector: "input[matInput], textarea[matInput], select[matNativeControl],      input[matNativeControl], textarea[matNativeControl]", inputs: ["disabled", "id", "placeholder", "name", "required", "type", "errorStateMatcher", "aria-describedby", "value", "readonly"], exportAs: ["matInput"] }, { kind: "component", type: i8.MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", exportAs: ["matButton"] }, { kind: "component", type: i9.MatOption, selector: "mat-option", inputs: ["value", "id", "disabled"], outputs: ["onSelectionChange"], exportAs: ["matOption"] }, { kind: "component", type: i10.MatAutocomplete, selector: "mat-autocomplete", inputs: ["aria-label", "aria-labelledby", "displayWith", "autoActiveFirstOption", "autoSelectActiveOption", "requireSelection", "panelWidth", "disableRipple", "class", "hideSingleSelectionIndicator"], outputs: ["optionSelected", "opened", "closed", "optionActivated"], exportAs: ["matAutocomplete"] }, { kind: "directive", type: i10.MatAutocompleteTrigger, selector: "input[matAutocomplete], textarea[matAutocomplete]", inputs: ["matAutocomplete", "matAutocompletePosition", "matAutocompleteConnectedTo", "autocomplete", "matAutocompleteDisabled"], exportAs: ["matAutocompleteTrigger"] }, { kind: "component", type: i3.ZluxTabbingComponent, selector: "zlux-tab-trap", inputs: ["hiddenIds", "hiddenPos"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: UploadModal, decorators: [{
            type: Component,
            args: [{ selector: 'upload-files-modal', providers: [
                        { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher }
                    ], template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n<zlux-tab-trap></zlux-tab-trap>\n<div class=\"padding-1\">\n  <div class=\"d-flex\">\n    <div class=\"modal-icon-container\">\n      <!-- FA Icon is determined by class name, so we hardcode the style here -->\n      <mat-icon style=\"font-size: 30px; position: absolute;\">cloud_upload</mat-icon>\n    </div>\n    <div>\n      <!-- Intentional lazy recycling of \"create\" modal CSS, TODO: move to shared/modal css -->\n      <h2 mat-dialog-title class=\"modal-mat-header\">Upload Files in {{folderPath}}</h2>\n    </div>\n    <div>\n      <button mat-dialog-close class=\"close-dialog-btn\"><i class=\"fa fa-close\"></i></button>\n    </div>\n\n  </div>\n  <button mat-button class=\"modal-mat-button add\" (click)=\"addFile()\">Select File</button>\n\n  <div style=\"max-height: 400px; overflow-y:scroll;\">\n    <ul>\n      @for (file of files; track file; let i = $index) {\n      <li class=\"\">\n        <label>\n          {{ file.name }}\n        </label>\n        <mat-form-field appearance=\"fill\" style=\"margin-left: 36px;\">\n          <input matInput required type=\"text\" [(ngModel)]=\"selectedOption\" (ngModelChange)=\"onValueChange($event)\"\n            [matAutocomplete]=\"auto\" [errorStateMatcher]=\"matcher\" #encodingInput=\"ngModel\"\n            placeholder=\"Select target encoding\">\n          <mat-autocomplete autoActiveFirstOption #auto=\"matAutocomplete\" [displayWith]=\"displayFn\">\n            @for (option of encodings; track option) {\n            <mat-option [value]=\"option.value\">\n              {{ option.name }}\n            </mat-option>\n            }\n          </mat-autocomplete>\n          @if (encodingInput.hasError('required')) {\n          <mat-error>\n            Encoding is required\n          </mat-error>\n          }\n        </mat-form-field>\n        <a href=\"https://www.ibm.com/docs/en/zos/2.1.0?topic=ccsids-encoding-scheme\" target=\"_blank\">\n          <i class=\"fa fa-question-circle dataset-properties-question-circle\"></i>\n        </a>\n      </li>\n      }\n    </ul>\n  </div>\n\n  <mat-dialog-actions>\n    <button mat-button mat-dialog-close class=\"modal-mat-button create\" (click)=\"uploadHandlerSetup()\"\n      [disabled]=\"!selectedOptionValid\">Upload</button>\n    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->\n  </mat-dialog-actions>\n</div>\n<input type=\"file\" style=\"display: none\" #fileUpload (change)=\"onFileUploaded($event)\">\n\n<!--\n  This program and the accompanying materials are\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n  SPDX-License-Identifier: EPL-2.0\n\n  Copyright Contributors to the Zowe Project.\n  -->", styles: [".modal-mat-button.add{color:#000}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"] }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DIALOG_DATA]
                }] }, { type: UploaderService }, { type: i3$1.MatSnackBar }], propDecorators: { fileUpload: [{
                type: ViewChild,
                args: ['fileUpload']
            }] } });

/*
This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.
*/
function getExtension(name) {
    if (name.split('.').length > 1) {
        let extension = name.split('.')[name.split('.').length - 1];
        let index = name.lastIndexOf('.');
        return name.slice(index);
    }
    return '';
}
function getBaseName(name) {
    if (name.split('.').length > 1) {
        let extension = name.split('.')[name.split('.').length - 1];
        let index = name.lastIndexOf('.');
        return name.slice(0, index);
    }
    return name;
}
function incrementFileName(name) {
    let extSuffix = this.getExtension(name);
    let namePrefix = this.getBaseName(name);
    // name copy 5(.txt) => name copy 6(.txt)
    // name copy(.txt) => name copy 2(.txt)
    const suffixRegex = /^(.+ copy)( \d+)?$/;
    if (suffixRegex.test(namePrefix)) {
        return namePrefix.replace(suffixRegex, (match, g1, g2) => {
            let number = (g2 ? parseInt(g2) : 1);
            return number === 0
                ? `${g1}`
                : (number < 888
                    ? `${g1} ${number + 1}`
                    : `${g1}${g2} copy`);
        }) + extSuffix;
    }
    // name(.txt) => name copy(.txt)
    return `${namePrefix} copy${extSuffix}`;
}
/*
This program and the accompanying materials are
made available under the terms of the Eclipse Public License v2.0 which accompanies
this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html

SPDX-License-Identifier: EPL-2.0

Copyright Contributors to the Zowe Project.
*/

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
const mockResponse = {
    '/unixfile/contents/?responseType=raw': {
        "entries": [
            {
                "name": ".sh_history",
                "path": "/proj/nwtqa/.sh_history",
                "directory": false,
                "size": 105467,
                "ccsid": 0,
                "createdAt": "2024-10-11T01:50:06",
                "mode": 600,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d206",
                "path": "/proj/nwtqa/d206",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-07T17:11:35",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d200",
                "path": "/proj/nwtqa/d200",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-07T04:36:48",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".bash_history",
                "path": "/proj/nwtqa/.bash_history",
                "directory": false,
                "size": 5595,
                "ccsid": 819,
                "createdAt": "2024-10-10T15:31:54",
                "mode": 600,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d304",
                "path": "/proj/nwtqa/d304",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-09-30T06:16:22",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d285",
                "path": "/proj/nwtqa/d285",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-08-06T21:10:22",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "csmvdqe",
                "path": "/proj/nwtqa/csmvdqe",
                "directory": false,
                "size": 1766,
                "ccsid": 0,
                "createdAt": "2020-09-30T14:23:53",
                "mode": 711,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "priyaranjan",
                "path": "/proj/nwtqa/priyaranjan",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2022-07-18T07:50:44",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d307",
                "path": "/proj/nwtqa/d307",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-09-30T12:52:57",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d207",
                "path": "/proj/nwtqa/d207",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-09T06:37:18",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d204",
                "path": "/proj/nwtqa/d204",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-09T10:43:07",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ":",
                "path": "/proj/nwtqa/:",
                "directory": false,
                "size": 0,
                "ccsid": 0,
                "createdAt": "2023-12-21T05:42:25",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "qa_doeserver21",
                "path": "/proj/nwtqa/qa_doeserver21",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-11-19T10:34:53",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "d314",
                "path": "/proj/nwtqa/d314",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-02-01T10:05:30",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d407",
                "path": "/proj/nwtqa/d407",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-11T04:05:37",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d310",
                "path": "/proj/nwtqa/d310",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-09-26T08:17:38",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "doeserver",
                "path": "/proj/nwtqa/doeserver",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-11-28T06:42:04",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "d313",
                "path": "/proj/nwtqa/d313",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-09T05:56:31",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d203",
                "path": "/proj/nwtqa/d203",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-07-25T08:43:43",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d178",
                "path": "/proj/nwtqa/d178",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-10T06:20:27",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d305",
                "path": "/proj/nwtqa/d305",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-07T06:48:23",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d100",
                "path": "/proj/nwtqa/d100",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-08T01:00:55",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d213",
                "path": "/proj/nwtqa/d213",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-07T16:35:51",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".bash_profile",
                "path": "/proj/nwtqa/.bash_profile",
                "directory": false,
                "size": 1192,
                "ccsid": 819,
                "createdAt": "2019-09-06T18:12:21",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "d411",
                "path": "/proj/nwtqa/d411",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-09-18T04:56:45",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".Xauthority",
                "path": "/proj/nwtqa/.Xauthority",
                "directory": false,
                "size": 1500,
                "ccsid": 0,
                "createdAt": "2024-10-09T10:16:15",
                "mode": 600,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d283",
                "path": "/proj/nwtqa/d283",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-06-25T23:39:44",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d201",
                "path": "/proj/nwtqa/d201",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-10T05:34:54",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".zowe_profile",
                "path": "/proj/nwtqa/.zowe_profile",
                "directory": false,
                "size": 334,
                "ccsid": 1047,
                "createdAt": "2019-10-01T12:19:39",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "zowe",
                "path": "/proj/nwtqa/zowe",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-03-25T17:14:56",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": ".ssh",
                "path": "/proj/nwtqa/.ssh",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-03-18T09:05:35",
                "mode": 700,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": ".bashrc",
                "path": "/proj/nwtqa/.bashrc",
                "directory": false,
                "size": 366,
                "ccsid": 819,
                "createdAt": "2019-09-12T11:55:01",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "d378",
                "path": "/proj/nwtqa/d378",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-04T08:16:50",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d284",
                "path": "/proj/nwtqa/d284",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-04-09T19:20:14",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d311",
                "path": "/proj/nwtqa/d311",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-03T06:12:41",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "ZOWE_PAX_STORAGE",
                "path": "/proj/nwtqa/ZOWE_PAX_STORAGE",
                "directory": false,
                "size": 21,
                "ccsid": 0,
                "createdAt": "2023-02-02T09:45:17",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".npm",
                "path": "/proj/nwtqa/.npm",
                "directory": true,
                "size": 32768,
                "ccsid": 0,
                "createdAt": "2019-05-09T16:19:45",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "d209",
                "path": "/proj/nwtqa/d209",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-09T05:26:42",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d303",
                "path": "/proj/nwtqa/d303",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-09-26T07:45:18",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d208",
                "path": "/proj/nwtqa/d208",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-09-24T05:30:00",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "naxqa",
                "path": "/proj/nwtqa/naxqa",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-05-02T08:38:02",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "d878",
                "path": "/proj/nwtqa/d878",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-02-01T10:56:24",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "qa_scripts",
                "path": "/proj/nwtqa/qa_scripts",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-04-15T21:06:55",
                "mode": 775,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "fresh_readonly",
                "path": "/proj/nwtqa/fresh_readonly",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-08-21T11:51:43",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "d312",
                "path": "/proj/nwtqa/d312",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-09-18T16:41:38",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d220",
                "path": "/proj/nwtqa/d220",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-09-24T11:42:33",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d308",
                "path": "/proj/nwtqa/d308",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-06-10T10:51:18",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d309",
                "path": "/proj/nwtqa/d309",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-09T07:31:24",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "nax-pax-creation",
                "path": "/proj/nwtqa/nax-pax-creation",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-10-31T05:27:33",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "tmp",
                "path": "/proj/nwtqa/tmp",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2022-11-07T03:11:41",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d205",
                "path": "/proj/nwtqa/d205",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-06T10:33:08",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d306",
                "path": "/proj/nwtqa/d306",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-08T10:34:26",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d210",
                "path": "/proj/nwtqa/d210",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-09-23T15:08:42",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d202",
                "path": "/proj/nwtqa/d202",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-01T10:23:57",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d401",
                "path": "/proj/nwtqa/d401",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2023-11-09T13:03:00",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d478",
                "path": "/proj/nwtqa/d478",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-04T07:57:56",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "DELETE_ME",
                "path": "/proj/nwtqa/DELETE_ME",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2021-12-09T10:29:19",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "certs",
                "path": "/proj/nwtqa/certs",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-10-01T16:05:43",
                "mode": 775,
                "owner": "CSIZPA",
                "group": "IZPUSS"
            },
            {
                "name": "qa_doeserver25",
                "path": "/proj/nwtqa/qa_doeserver25",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-12-02T09:16:54",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "qa_doeui25",
                "path": "/proj/nwtqa/qa_doeui25",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-12-02T09:16:55",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "d408",
                "path": "/proj/nwtqa/d408",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-04T01:24:28",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "csmvdqe.pub",
                "path": "/proj/nwtqa/csmvdqe.pub",
                "directory": false,
                "size": 394,
                "ccsid": 0,
                "createdAt": "2020-09-30T14:23:53",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "kkamada",
                "path": "/proj/nwtqa/kkamada",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2022-03-25T08:14:56",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".viminfo",
                "path": "/proj/nwtqa/.viminfo",
                "directory": false,
                "size": 29983,
                "ccsid": 819,
                "createdAt": "2023-12-07T07:50:32",
                "mode": 600,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": ".saves-67305800-RS23~",
                "path": "/proj/nwtqa/.saves-67305800-RS23~",
                "directory": false,
                "size": 398,
                "ccsid": 0,
                "createdAt": "2024-04-16T18:26:25",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d278",
                "path": "/proj/nwtqa/d278",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-10T13:46:14",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "install_script",
                "path": "/proj/nwtqa/install_script",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-06-18T06:54:00",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "amruta_imp",
                "path": "/proj/nwtqa/amruta_imp",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-08-15T09:17:55",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "muthu",
                "path": "/proj/nwtqa/muthu",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2022-05-11T09:06:32",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "test.txt",
                "path": "/proj/nwtqa/test.txt",
                "directory": false,
                "size": 0,
                "ccsid": 0,
                "createdAt": "2022-11-16T11:11:03",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".lesshst",
                "path": "/proj/nwtqa/.lesshst",
                "directory": false,
                "size": 41,
                "ccsid": 819,
                "createdAt": "2024-09-10T07:22:32",
                "mode": 600,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "d299",
                "path": "/proj/nwtqa/d299",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-07-09T12:53:08",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "yduj",
                "path": "/proj/nwtqa/yduj",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-07-08T16:17:10",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "doe_perf_test_data",
                "path": "/proj/nwtqa/doe_perf_test_data",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-04-27T00:44:13",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "symlink",
                "path": "/proj/nwtqa/symlink",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2022-11-25T09:20:10",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "tmp1.crT",
                "path": "/proj/nwtqa/tmp1.crT",
                "directory": false,
                "size": 2354,
                "ccsid": 819,
                "createdAt": "2022-07-21T14:04:39",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "tmp1.crt",
                "path": "/proj/nwtqa/tmp1.crt",
                "directory": false,
                "size": 2354,
                "ccsid": 819,
                "createdAt": "2022-07-21T14:05:14",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "ts4898                    x",
                "path": "/proj/nwtqa/ts4898                    x",
                "directory": true,
                "size": 0,
                "ccsid": 0,
                "createdAt": "2023-05-03T12:02:04",
                "mode": 600,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".ffi",
                "path": "/proj/nwtqa/.ffi",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-11-23T10:40:12",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "zowe_smpe",
                "path": "/proj/nwtqa/zowe_smpe",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-06-04T16:06:03",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "psmvdqe                   x",
                "path": "/proj/nwtqa/psmvdqe                   x",
                "directory": true,
                "size": 0,
                "ccsid": 0,
                "createdAt": "2023-05-03T12:02:10",
                "mode": 600,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "preeti",
                "path": "/proj/nwtqa/preeti",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2023-05-03T14:35:00",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".tmp",
                "path": "/proj/nwtqa/.tmp",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-08-03T17:41:55",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "Query_tuning_Apr2024",
                "path": "/proj/nwtqa/Query_tuning_Apr2024",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-04-16T05:17:30",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "nims",
                "path": "/proj/nwtqa/nims",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-01-08T01:53:09",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "d212",
                "path": "/proj/nwtqa/d212",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-07-16T12:38:39",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "dead.letter",
                "path": "/proj/nwtqa/dead.letter",
                "directory": false,
                "size": 294,
                "ccsid": 1047,
                "createdAt": "2022-07-18T10:42:43",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "zTEAM-please-delete-me",
                "path": "/proj/nwtqa/zTEAM-please-delete-me",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-04-09T17:03:14",
                "mode": 777,
                "owner": "NWTN01",
                "group": "PDUSER"
            },
            {
                "name": "preti",
                "path": "/proj/nwtqa/preti",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2023-05-03T14:53:14",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".saves-67503996-RS27~",
                "path": "/proj/nwtqa/.saves-67503996-RS27~",
                "directory": false,
                "size": 184,
                "ccsid": 0,
                "createdAt": "2023-05-05T14:29:25",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "prit",
                "path": "/proj/nwtqa/prit",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2023-08-08T10:26:15",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "scripts",
                "path": "/proj/nwtqa/scripts",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-10-29T16:27:45",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "jch",
                "path": "/proj/nwtqa/jch",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-09-09T03:07:38",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": ".emacs",
                "path": "/proj/nwtqa/.emacs",
                "directory": false,
                "size": 1030,
                "ccsid": 0,
                "createdAt": "2020-07-05T23:50:21",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "srv_merge",
                "path": "/proj/nwtqa/srv_merge",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-03-01T06:02:40",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "pdpenn",
                "path": "/proj/nwtqa/pdpenn",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-06-04T14:44:13",
                "mode": 755,
                "owner": "CSIZPA",
                "group": "IZPUSS"
            },
            {
                "name": ".bin",
                "path": "/proj/nwtqa/.bin",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-08-03T17:42:09",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "nax_admin_qa",
                "path": "/proj/nwtqa/nax_admin_qa",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-09-09T06:54:27",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": ".zowe",
                "path": "/proj/nwtqa/.zowe",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-08-03T17:43:45",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "zowe_certificates_keyring",
                "path": "/proj/nwtqa/zowe_certificates_keyring",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2022-03-01T21:46:44",
                "mode": 550,
                "owner": "CSIZPA",
                "group": "IZPUSS"
            },
            {
                "name": "leanid",
                "path": "/proj/nwtqa/leanid",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-08-03T18:12:23",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "nax_admin_qa1",
                "path": "/proj/nwtqa/nax_admin_qa1",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-09-11T14:15:13",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "tmp.crt",
                "path": "/proj/nwtqa/tmp.crt",
                "directory": false,
                "size": 2354,
                "ccsid": 819,
                "createdAt": "2022-05-08T20:25:25",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "nax-pax",
                "path": "/proj/nwtqa/nax-pax",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-09-11T14:22:22",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "Atharva",
                "path": "/proj/nwtqa/Atharva",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2023-05-12T09:49:02",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "ums-1.1",
                "path": "/proj/nwtqa/ums-1.1",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2022-10-19T08:28:21",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".condarc",
                "path": "/proj/nwtqa/.condarc",
                "directory": false,
                "size": 106,
                "ccsid": 1047,
                "createdAt": "2020-11-23T10:37:05",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "test.yaml",
                "path": "/proj/nwtqa/test.yaml",
                "directory": false,
                "size": 5987,
                "ccsid": 819,
                "createdAt": "2023-08-08T10:28:23",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "testn",
                "path": "/proj/nwtqa/testn",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-03-01T16:45:12",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "divya22",
                "path": "/proj/nwtqa/divya22",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2023-08-25T10:19:36",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".conda",
                "path": "/proj/nwtqa/.conda",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-11-23T10:38:37",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".python_history",
                "path": "/proj/nwtqa/.python_history",
                "directory": false,
                "size": 267,
                "ccsid": 0,
                "createdAt": "2021-01-21T09:48:57",
                "mode": 600,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "jitesh_zowe",
                "path": "/proj/nwtqa/jitesh_zowe",
                "directory": true,
                "size": 0,
                "ccsid": 0,
                "createdAt": "2024-05-16T05:28:23",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "senthillog_1649750035667.txt",
                "path": "/proj/nwtqa/senthillog_1649750035667.txt",
                "directory": false,
                "size": 310,
                "ccsid": 0,
                "createdAt": "2022-04-12T07:53:56",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "policy-backup-ga",
                "path": "/proj/nwtqa/policy-backup-ga",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-11-24T18:21:39",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".saves-84084373-RS23~",
                "path": "/proj/nwtqa/.saves-84084373-RS23~",
                "directory": false,
                "size": 1420,
                "ccsid": 0,
                "createdAt": "2023-08-09T18:42:05",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "tmp.ptktdata",
                "path": "/proj/nwtqa/tmp.ptktdata",
                "directory": false,
                "size": 25,
                "ccsid": 0,
                "createdAt": "2022-05-23T15:38:09",
                "mode": 666,
                "owner": "NWTSTC",
                "group": "IZPUSS"
            },
            {
                "name": "santosh",
                "path": "/proj/nwtqa/santosh",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-11-20T12:03:18",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "ivp_test",
                "path": "/proj/nwtqa/ivp_test",
                "directory": true,
                "size": 0,
                "ccsid": 0,
                "createdAt": "2020-12-01T06:58:31",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "qa_doeserver27",
                "path": "/proj/nwtqa/qa_doeserver27",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-12-05T13:00:47",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "qa_doeui27",
                "path": "/proj/nwtqa/qa_doeui27",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-12-05T13:00:48",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "configmgr-rexx",
                "path": "/proj/nwtqa/configmgr-rexx",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2022-08-04T17:38:39",
                "mode": 755,
                "owner": "CSIZPA",
                "group": "IZPUSS"
            },
            {
                "name": ".gitconfig",
                "path": "/proj/nwtqa/.gitconfig",
                "directory": false,
                "size": 1170,
                "ccsid": 819,
                "createdAt": "2024-04-01T09:47:47",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "products_testing",
                "path": "/proj/nwtqa/products_testing",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2022-08-09T13:52:20",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "archive.zip",
                "path": "/proj/nwtqa/archive.zip",
                "directory": false,
                "size": 1663314740,
                "ccsid": -1,
                "createdAt": "2022-09-16T10:33:51",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".saves-84018230-RS22~",
                "path": "/proj/nwtqa/.saves-84018230-RS22~",
                "directory": false,
                "size": 194,
                "ccsid": 0,
                "createdAt": "2024-06-24T18:54:20",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "prateek_cust",
                "path": "/proj/nwtqa/prateek_cust",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-12-06T09:48:10",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "smpetest",
                "path": "/proj/nwtqa/smpetest",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2019-12-07T05:37:51",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "users",
                "path": "/proj/nwtqa/users",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-05-18T22:22:40",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "ndoe_pune",
                "path": "/proj/nwtqa/ndoe_pune",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-03-21T18:08:23",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".saves-50725802-RS27~",
                "path": "/proj/nwtqa/.saves-50725802-RS27~",
                "directory": false,
                "size": 430,
                "ccsid": 0,
                "createdAt": "2023-09-11T17:56:02",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".ansible",
                "path": "/proj/nwtqa/.ansible",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-12-03T03:30:02",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "idaa_server_new",
                "path": "/proj/nwtqa/idaa_server_new",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2022-05-24T13:51:53",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "ZOWE_YAML_STORAGE",
                "path": "/proj/nwtqa/ZOWE_YAML_STORAGE",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2022-09-10T12:33:56",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "UsageCPU",
                "path": "/proj/nwtqa/UsageCPU",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-12-05T11:19:14",
                "mode": 751,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".profile",
                "path": "/proj/nwtqa/.profile",
                "directory": false,
                "size": 15164,
                "ccsid": 1047,
                "createdAt": "2019-05-22T07:15:40",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "PDUSER"
            },
            {
                "name": "policy_bk_senthil",
                "path": "/proj/nwtqa/policy_bk_senthil",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2023-07-20T12:44:18",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".saves-16975168-RS23~",
                "path": "/proj/nwtqa/.saves-16975168-RS23~",
                "directory": false,
                "size": 400,
                "ccsid": 0,
                "createdAt": "2023-09-12T13:36:13",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".mc",
                "path": "/proj/nwtqa/.mc",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-02-24T10:55:51",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "rinky",
                "path": "/proj/nwtqa/rinky",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2023-12-04T11:44:41",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "unified-ui",
                "path": "/proj/nwtqa/unified-ui",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-12-08T11:44:33",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".saves-83952737-RS22~",
                "path": "/proj/nwtqa/.saves-83952737-RS22~",
                "directory": false,
                "size": 452,
                "ccsid": 0,
                "createdAt": "2023-09-13T15:11:37",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "pax_extract",
                "path": "/proj/nwtqa/pax_extract",
                "directory": true,
                "size": 0,
                "ccsid": 0,
                "createdAt": "2021-05-06T14:39:41",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "pax_ext",
                "path": "/proj/nwtqa/pax_ext",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2021-05-06T14:40:27",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".vim",
                "path": "/proj/nwtqa/.vim",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-03-26T18:24:16",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "inpax",
                "path": "/proj/nwtqa/inpax",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2021-05-12T17:29:33",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "db2devops",
                "path": "/proj/nwtqa/db2devops",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-04-04T19:32:02",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "zowe-user-dir",
                "path": "/proj/nwtqa/zowe-user-dir",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-04-06T11:06:48",
                "mode": 771,
                "owner": "IZUSVR",
                "group": "IZPUSS"
            },
            {
                "name": ".saves-33752091-RS23~",
                "path": "/proj/nwtqa/.saves-33752091-RS23~",
                "directory": false,
                "size": 194,
                "ccsid": 0,
                "createdAt": "2023-09-13T17:43:01",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "{directory}",
                "path": "/proj/nwtqa/{directory}",
                "directory": true,
                "size": 0,
                "ccsid": 0,
                "createdAt": "2023-09-21T11:10:55",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "zosmf-auth",
                "path": "/proj/nwtqa/zosmf-auth",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-04-09T20:23:35",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "zss-auth",
                "path": "/proj/nwtqa/zss-auth",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2020-04-09T20:23:35",
                "mode": 771,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".cache",
                "path": "/proj/nwtqa/.cache",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2023-10-10T07:07:04",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".node_repl_history",
                "path": "/proj/nwtqa/.node_repl_history",
                "directory": false,
                "size": 17,
                "ccsid": 0,
                "createdAt": "2020-04-15T15:44:33",
                "mode": 600,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "test_sh",
                "path": "/proj/nwtqa/test_sh",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2021-05-13T10:26:24",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "idaa_server",
                "path": "/proj/nwtqa/idaa_server",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2022-01-27T09:26:38",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "zowe.yaml",
                "path": "/proj/nwtqa/zowe.yaml",
                "directory": false,
                "size": 2619,
                "ccsid": 1047,
                "createdAt": "2022-01-27T21:27:25",
                "mode": 644,
                "owner": "CSIZPA",
                "group": "IZPUSS"
            },
            {
                "name": ".keystore",
                "path": "/proj/nwtqa/.keystore",
                "directory": false,
                "size": 3488,
                "ccsid": 0,
                "createdAt": "2020-04-17T20:29:35",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "ManagedPromotions.ddl",
                "path": "/proj/nwtqa/ManagedPromotions.ddl",
                "directory": false,
                "size": 57073,
                "ccsid": 819,
                "createdAt": "2022-12-20T06:37:38",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".saves-50529488-RS23~",
                "path": "/proj/nwtqa/.saves-50529488-RS23~",
                "directory": false,
                "size": 140,
                "ccsid": 0,
                "createdAt": "2023-09-22T18:24:24",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".local",
                "path": "/proj/nwtqa/.local",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2023-10-10T07:27:21",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "idaa_copy",
                "path": "/proj/nwtqa/idaa_copy",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2022-02-07T10:09:32",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "CEEDUMP.20231011.200431.394841",
                "path": "/proj/nwtqa/CEEDUMP.20231011.200431.394841",
                "directory": false,
                "size": 179152,
                "ccsid": 0,
                "createdAt": "2023-10-12T00:04:31",
                "mode": 640,
                "owner": "OMVSKERN",
                "group": "IZPUSS"
            },
            {
                "name": ".saves-84148858-RS25~",
                "path": "/proj/nwtqa/.saves-84148858-RS25~",
                "directory": false,
                "size": 302,
                "ccsid": 0,
                "createdAt": "2023-11-22T17:06:24",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "AdityaR",
                "path": "/proj/nwtqa/AdityaR",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2021-05-18T11:03:48",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "RS22DC1A.der",
                "path": "/proj/nwtqa/RS22DC1A.der",
                "directory": false,
                "size": 0,
                "ccsid": 819,
                "createdAt": "2021-09-29T04:27:47",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "Satish",
                "path": "/proj/nwtqa/Satish",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2021-06-28T14:11:30",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "JES Explorer",
                "path": "/proj/nwtqa/JES Explorer",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2021-04-08T03:17:03",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "test_af",
                "path": "/proj/nwtqa/test_af",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2021-05-28T10:55:26",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "AFDSMP",
                "path": "/proj/nwtqa/AFDSMP",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2021-04-21T08:56:35",
                "mode": 751,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "java.security",
                "path": "/proj/nwtqa/java.security",
                "directory": false,
                "size": 57290,
                "ccsid": 0,
                "createdAt": "2021-04-15T10:18:09",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "tuningServer",
                "path": "/proj/nwtqa/tuningServer",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2021-08-13T12:40:27",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "amruta",
                "path": "/proj/nwtqa/amruta",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2021-08-18T12:48:31",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "Query_Tuning",
                "path": "/proj/nwtqa/Query_Tuning",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2021-08-19T07:46:10",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "RS27QB1X.der",
                "path": "/proj/nwtqa/RS27QB1X.der",
                "directory": false,
                "size": 870,
                "ccsid": 819,
                "createdAt": "2021-09-29T04:43:49",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "demo",
                "path": "/proj/nwtqa/demo",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2021-09-10T17:08:29",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "ivp-asaraf_feature-latest.pax",
                "path": "/proj/nwtqa/ivp-asaraf_feature-latest.pax",
                "directory": false,
                "size": 483840,
                "ccsid": 819,
                "createdAt": "2021-09-17T18:27:27",
                "mode": 644,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "senthil",
                "path": "/proj/nwtqa/senthil",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2021-09-20T11:50:37",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "Query_Tuning_Server",
                "path": "/proj/nwtqa/Query_Tuning_Server",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2021-09-24T10:50:34",
                "mode": 775,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "mvscmd",
                "path": "/proj/nwtqa/mvscmd",
                "directory": false,
                "size": 271,
                "ccsid": 1047,
                "createdAt": "2021-10-04T02:52:20",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "Senthil",
                "path": "/proj/nwtqa/Senthil",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2021-10-27T17:43:24",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "proj",
                "path": "/proj/nwtqa/proj",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2021-11-01T08:23:37",
                "mode": 750,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "amaan",
                "path": "/proj/nwtqa/amaan",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2021-11-25T05:23:35",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "idaa",
                "path": "/proj/nwtqa/idaa",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2021-11-25T10:52:51",
                "mode": 777,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": ".rnd",
                "path": "/proj/nwtqa/.rnd",
                "directory": false,
                "size": 1024,
                "ccsid": 0,
                "createdAt": "2021-11-25T11:04:47",
                "mode": 600,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            }
        ]
    },
    '/unixfile/metadata/proj/nwtqa/d305?responseType=raw': {
        "path": "/proj/nwtqa/d305",
        "directory": true,
        "size": 8192,
        "ccsid": 0,
        "createdAt": "2024-10-07T06:48:23",
        "mode": 777,
        "owner": "CSMVDQA",
        "group": "IZPUSS"
    },
    '/unixfile/contents/proj/nwtqa/d305?responseType=raw': {
        "entries": [
            {
                "name": "zowe_runtime",
                "path": "/proj/nwtqa/d305/zowe_runtime",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-07T06:48:23",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "zowe-2.17.0.yaml",
                "path": "/proj/nwtqa/d305/zowe-2.17.0.yaml",
                "directory": false,
                "size": 3767,
                "ccsid": 0,
                "createdAt": "2024-10-07T06:48:54",
                "mode": 664,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "zowe_certificates",
                "path": "/proj/nwtqa/d305/zowe_certificates",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-07T06:49:19",
                "mode": 775,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "zowe_logs",
                "path": "/proj/nwtqa/d305/zowe_logs",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-07T06:49:41",
                "mode": 775,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "zowe_workspace",
                "path": "/proj/nwtqa/d305/zowe_workspace",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-07T06:49:49",
                "mode": 770,
                "owner": "NWTSTC",
                "group": "IZPUSS"
            },
            {
                "name": "izp",
                "path": "/proj/nwtqa/d305/izp",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-07T06:50:00",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "izp-admin-fdn-db2",
                "path": "/proj/nwtqa/d305/izp-admin-fdn-db2",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-07T06:50:40",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "izp-devops-db2",
                "path": "/proj/nwtqa/d305/izp-devops-db2",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-07T06:50:41",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "izp.yaml",
                "path": "/proj/nwtqa/d305/izp.yaml",
                "directory": false,
                "size": 2239,
                "ccsid": 1047,
                "createdAt": "2024-10-07T06:52:14",
                "mode": 640,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "zowe_extensions",
                "path": "/proj/nwtqa/d305/zowe_extensions",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-07T06:53:19",
                "mode": 755,
                "owner": "CSMVDQA",
                "group": "IZPUSS"
            },
            {
                "name": "vdata2",
                "path": "/proj/nwtqa/d305/vdata2",
                "directory": true,
                "size": 8192,
                "ccsid": 0,
                "createdAt": "2024-10-07T06:54:03",
                "mode": 775,
                "owner": "NWTSTC",
                "group": "IZPUSS"
            }
        ]
    },
    '/unixfile/contents/proj/nwtqa/d305/izp.yaml?responseType=b64': 'Y29tcG9uZW50czoKICBpenA6CiAgICBlbmFibGVkOiB0cnVlCiAgICBkZWJ1Z1NoZWxsU2NyaXB0czogZmFsc2UKICAgIGV4cGVyaWVuY2VzOgogICAgLSAvcHJvai9ud3RxYS9kMzA1L2l6cC1hZG1pbi1mZG4tZGIyCiAgICAtIC9wcm9qL253dHFhL2QzMDUvaXpwLWRldm9wcy1kYjIKICAgIGpvYkNhcmQ6IFtdCiAgICBydW50aW1lRGlyZWN0b3J5OiAvcHJvai9ud3RxYS9kMzA1L2l6cAogICAgd29ya3NwYWNlRGlyZWN0b3J5OiAvcHJvai9ud3RxYS9kMzA1L3ZkYXRhMgogICAgbWlncmF0aW9uRGlyZWN0b3J5OiAnJwogICAgc2VjdXJpdHk6CiAgICAgIHVzZVNBRk9ubHk6IHRydWUKICAgICAgZGJhOgogICAgICAgIGRlZmF1bHRBdXRoZW50aWNhdGlvbk1lY2hhbmlzbTogUEFTU1dPUkQKICAgICAgICBkZWZhdWx0RGJhVXNlckNlcnRpZmljYXRlTGFiZWw6IFJTUExFWDAxX0NTSVpQS19DUwogICAgICAgIGRlZmF1bHREYmFVc2VyQ2VydGlmaWNhdGVMb2NhdGlvbjogc2Fma2V5cmluZzovL0NTSVpQSy9DU0laUEtSaW5nCiAgICAgICAgZGVmYXVsdERiYVVzZXJDZXJ0aWZpY2F0ZUtleXN0b3JlVHlwZTogSkNFUkFDRktTCiAgICAgIHByb2ZpbGVRdWFsaWZpZXI6ICcnCiAgICAgIHBrY3MxMToKICAgICAgICBkYmFVc2VyOiBDU01WRFFPCiAgICAgICAgdG9rZW46IE5XVE5PSwogICAgICAgIGxpYnJhcnk6IC91c3IvbHBwL3BrY3MxMS9saWIvY3NucGNhNjQuc28KICAgICAgY2VydGlmaWNhdGU6CiAgICAgICAgYWxsb3dTZWxmU2lnbmVkOiBmYWxzZQogICAgICAgIHRydXN0c3RvcmU6CiAgICAgICAgICBsb2NhdGlvbjogL3Byb2ovbnd0cWEvZDMwNS92ZGF0YTIvY29uZi9jYWNlcnRzCiAgICAgICAgICB0eXBlOiBKS1MKICAgICAgICBrZXlzdG9yZToKICAgICAgICAgIGxvY2F0aW9uOiAnJwogICAgICAgICAgdHlwZTogJycKICAgICAgICAgIGFsaWFzOiAnJwogICAgICBwcm9maWxlUHJlZml4OgogICAgICAgIHN1cGVyOiBJWlAuU1VQRVIKICAgICAgICBhZG1pbjogSVpQLkFETUlOCiAgICAgIHN1cnJvZ2F0ZVVzZXI6CiAgICAgICAgc3VwZXI6IElaUFNSR1NQCiAgICAgICAgYWRtaW46IElaUFNSR0FECiAgICAgIHN1cnJvZ2F0ZUdyb3VwOiBJWlBTUkdSUAogICAgc2VydmVyOgogICAgICB0bHNWZXJzaW9uTGlzdDogVExTdjEuMixUTFN2MS4zCiAgICAgIGF1dGhUeXBlOiBTVEFOREFSRF9KV1QKICAgICAgcG9ydDoKICAgICAgICBodHRwOiA1OTMwNQogICAgICAgIGFnZW50OiAzNDQ0CiAgICAgICAgZ3JlbWxpbjogODE4MgogICAgICBob3N0OiAnJwogICAgICBsb2c6CiAgICAgICAgZGVzdGluYXRpb246IEJPVEgKICAgICAgICBwcm9wZXJ0aWVzOiBbXQogICAgICBhcGlSYXRlQ2FwYWNpdHlCeVVzZXI6IDYwMDAKICAgICAgbWVtb3J5U2l6ZTogNDA5NgogICAgICBqb2JQcmVmaXg6IE5XVAogICAgICBmYWlsc2FmZVRpbWVvdXQ6IDEwMAogICAgICBncmFwaFFMVGltZW91dDogMzAwCiAgICAgIHN1YnN5c3RlbURpc2NvdmVyeToKICAgICAgICBpbnRlcnZhbDogMzAKICAgICAgb2JqZWN0RGlzY292ZXJ5SW50ZXJ2YWw6IDI0CiAgICAgIGFsbFN5c25hbWVzOiBSUzIyIFJTMjgKICAgICAgamF2YUFyZ3M6IFtdCiAgICBzeXNwbGV4OgogICAgICBsb2NhbDoKICAgICAgICBhY3R1YWxOYW1lOgogICAgICAgIHVuaXF1ZU5hbWU6CiAgICBkYXRhc2V0OgogICAgICBydW50aW1lSGxxOiBSU1FBLklaUC5EMzA1CiAgICAgIGhscTogUlNRQS5JWlAuRDMwNQogICAgICBwYXJtbGliOiBSU1FBLklaUC5EMzA1LlBBUk1MSUIKICAgICAgamNsbGliOiBSU1FBLklaUC5EMzA1LkpDTExJQgogICAgICBsb2FkTGlicmFyeToKICAgICAgICBkYjI6IERTTi5WQzEwLlNEU05MT0FECiAgICAgICAgaXpwOiAnJwogICAgICBkYmFFbmNyeXB0aW9uOiBSU1FBLklaUC5EMzA1LkNSWVBUCiAgICAgIHVzZXJMaXN0OiBSU1FBLklaUC5VU0VSTElTVC5EMzA1CiAgICAgIHRlYW1MaXN0OiBSU1FBLklaUC5URUFNTElTVC5EMzA1CiAgICB0b29sc0Rpc2NvdmVyeToKICAgICAgZW5hYmxlZDogdHJ1ZQogICAgICBkaXNjb3ZlcnlTZWFyY2hQYXRoczogW10KICAgIHpvd2U6CiAgICAgIGpvYjoKICAgICAgICBzdWZmaXg6IElaUAogICAgamF2YToKICAgICAgaG9tZTogJycKem93ZToKICBzZXR1cDoKICAgIHppczoKICAgICAgcGFybWxpYjoKICAgICAgICBrZXlzOgogICAgICAgICAgSVpQLlpTU1AuUkVHOiBsaXN0CiAgdXNlQ29uZmlnbWdyOiB0cnVlCg==',
};
class UssCrudService {
    handleErrorObservable(error) {
        console.error(error.message || error);
        return throwError(error.message || error);
    }
    constructor(http, utils) {
        this.http = http;
        this.utils = utils;
    }
    makeDirectory(path, forceOverwrite) {
        let url = ZoweZLUX.uriBroker.unixFileUri('mkdir', path, undefined, undefined, undefined, forceOverwrite);
        return this.http.post(url, null).pipe(catchError(this.handleErrorObservable));
    }
    makeFile(path) {
        let url = ZoweZLUX.uriBroker.unixFileUri('touch', path);
        return this.http.post(url, null).pipe(catchError(this.handleErrorObservable));
    }
    getFileContents(path) {
        let filePath = this.utils.filePathCheck(path);
        let url = ZoweZLUX.uriBroker.unixFileUri('contents', filePath);
        if (mockResponse[url]) {
            return of(mockResponse[url]);
        }
        else {
            return this.http.get(url).pipe(catchError(this.handleErrorObservable));
        }
    }
    getFileMetadata(path) {
        let filePath = this.utils.filePathCheck(path);
        let url = ZoweZLUX.uriBroker.unixFileUri('metadata', filePath);
        //TODO: Fix ZSS bug where "%2F" is not properly processed as a "/" character
        url = url.split("%2F").join("/");
        if (mockResponse[url]) {
            return of(mockResponse[url]);
        }
        else {
            return this.http.get(url).pipe(catchError(this.handleErrorObservable));
        }
    }
    copyFile(oldPath, newPath, forceOverwrite) {
        let url = ZoweZLUX.uriBroker.unixFileUri('copy', oldPath, undefined, undefined, newPath, forceOverwrite, undefined, true);
        return this.http.post(url, null).pipe(catchError(this.handleErrorObservable));
    }
    deleteFileOrFolder(path) {
        let filePath = this.utils.filePathCheck(path);
        let url = ZoweZLUX.uriBroker.unixFileUri('contents', filePath);
        return this.http.delete(url).pipe(catchError(this.handleErrorObservable));
    }
    renameFile(oldPath, newPath, forceOverwrite) {
        let url = ZoweZLUX.uriBroker.unixFileUri('rename', oldPath, undefined, undefined, newPath, forceOverwrite);
        return this.http.post(url, null).pipe(catchError(this.handleErrorObservable));
    }
    saveFile(path, fileContents, targetEncoding, forceOverwrite) {
        let url = ZoweZLUX.uriBroker.unixFileUri('contents', path, "UTF-8", targetEncoding, undefined, forceOverwrite, undefined, true);
        return this.http.put(url, fileContents).pipe(catchError(this.handleErrorObservable));
    }
    getUserHomeFolder() {
        let url = ZoweZLUX.uriBroker.userInfoUri();
        return this.http.get(url).pipe(map((res) => res), catchError(this.handleErrorObservable));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: UssCrudService, deps: [{ token: i1$1.HttpClient }, { token: UtilsService }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: UssCrudService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: UssCrudService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1$1.HttpClient }, { type: UtilsService }] });

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
/* TODO: re-implement to add fetching of previously opened tree view data
import { PersistentDataService } from '../../services/persistentData.service'; */
const SEARCH_ID = 'uss';
class FileBrowserUSSComponent {
    constructor(elementRef, ussSrv, utils, ussSearchHistory, dialog, snackBar, downloadService, log, launchMetadata, pluginDefinition, windowActions) {
        this.elementRef = elementRef;
        this.ussSrv = ussSrv;
        this.utils = utils;
        this.ussSearchHistory = ussSearchHistory;
        this.dialog = dialog;
        this.snackBar = snackBar;
        this.downloadService = downloadService;
        this.log = log;
        this.launchMetadata = launchMetadata;
        this.pluginDefinition = pluginDefinition;
        this.windowActions = windowActions;
        this.deletionQueue = new Map(); //multiple files deletion is async, so queue is used
        /* Tree outgoing events */
        this.pathChanged = new EventEmitter();
        this.dataChanged = new EventEmitter();
        this.nodeClick = new EventEmitter();
        this.nodeDblClick = new EventEmitter();
        this.nodeRightClick = new EventEmitter();
        // @Output() newFileClick: EventEmitter<any> = new EventEmitter<any>();
        this.newFolderClick = new EventEmitter();
        this.newFileClick = new EventEmitter();
        this.fileUploaded = new EventEmitter();
        this.copyClick = new EventEmitter();
        this.deleteClick = new EventEmitter();
        this.ussRenameEvent = new EventEmitter();
        this.rightClick = new EventEmitter();
        this.openInNewTab = new EventEmitter();
        /* TODO: Legacy, capabilities code (unused for now) */
        //this.componentClass = ComponentClass.FileBrowser;
        this.initalizeCapabilities();
        this.ussSearchHistory.onInit(SEARCH_ID);
        this.root = "/"; // Dev purposes: Replace with home directory to test Explorer functionalities
        this.path = this.root;
        this.data = [];
        this.hideExplorer = false;
        this.isLoading = false;
        this.showSearch = false;
        this.searchCtrl = new FormControl();
        this.searchValueSubscription = this.searchCtrl.valueChanges.pipe(debounceTime(500)).subscribe((value) => { this.searchInputChanged(value); });
        this.selectedNode = null;
    }
    ngOnInit() {
        this.loadUserHomeDirectory().pipe(catchError(err => {
            this.log.warn(`Unsuccessful in loading user home directory: ${err}`);
            return of('/');
        })).subscribe(home => {
            if (!this.homePath) {
                if (this.launchMetadata && this.launchMetadata.data && this.launchMetadata.data.name) {
                    this.path = this.launchMetadata.data.name;
                    this.updateUss(this.path);
                }
                else {
                    this.path = home;
                    this.updateUss(home);
                }
                this.homePath = home;
            }
        });
        this.initializeRightClickProperties();
        // TODO: Uncomment & fix auto-update of node data based on an interval. Maybe future setting?
        // this.persistentDataService.getData()
        //   .subscribe(data => {
        //     if (data.contents.ussInput) {
        //       this.path = data.contents.ussInput; }
        //     if (data.contents.ussData !== undefined)
        //     data.contents.ussData.length == 0 ? this.displayTree(this.path, false) : (this.data = data.contents.ussData, this.path = data.contents.ussInput)
        //     else
        //     this.displayTree(this.root, false);
        //   })
        // this.intervalId = setInterval(() => {
        //  this.updateUss(this.path);
        // }, this.updateInterval);
    }
    ngOnDestroy() {
        /* TODO: Fetching updates for automatic refresh (disabled for now) */
        // if (this.intervalId) {
        //   clearInterval(this.intervalId);
        // }
        if (this.searchValueSubscription) {
            this.searchValueSubscription.unsubscribe();
        }
        if (this.ussSearchHistorySubscription) {
            this.ussSearchHistorySubscription.unsubscribe();
        }
    }
    getDOMElement() {
        return this.elementRef.nativeElement;
    }
    getSelectedPath() {
        //TODO:how do we want to want to handle caching vs message to app to open said path
        return this.path;
    }
    loadUserHomeDirectory() {
        this.isLoading = true;
        return this.ussSrv.getUserHomeFolder().pipe(timeout(2000), map(resp => resp.home.trim()), finalize(() => this.isLoading = false));
    }
    initalizeCapabilities() {
        //   //this.capabilities = new Array<Capability>();
        //   //this.capabilities.push(FileBrowserCapabilities.FileBrowser);
        //   //this.capabilities.push(FileBrowserCapabilities.FileBrowserUSS);
    }
    initializeRightClickProperties() {
        this.rightClickPropertiesFile = [
            {
                text: "Request Open in New Browser Tab", action: () => {
                    this.openInNewTab.emit(this.rightClickedFile);
                }
            },
            {
                text: "Refresh Metadata", action: () => {
                    this.refreshFileMetadata(this.rightClickedFile);
                }
            },
            {
                text: "Change Mode/Permissions...", action: () => {
                    this.showPermissionsDialog(this.rightClickedFile);
                }
            },
            {
                text: "Change Owners...", action: () => {
                    this.showOwnerDialog(this.rightClickedFile);
                }
            },
            {
                text: "Tag...", action: () => {
                    this.showTaggingDialog(this.rightClickedFile);
                }
            },
            {
                text: "Download", action: () => {
                    this.attemptDownload(this.rightClickedFile);
                }
            },
            {
                text: "Cut", action: () => {
                    this.cutFile(this.rightClickedFile);
                }
            },
            {
                text: "Copy", action: () => {
                    this.copyFile(this.rightClickedFile);
                }
            },
            {
                text: "Copy Link", action: () => {
                    this.copyLink(this.rightClickedFile);
                }
            },
            {
                text: "Copy Path", action: () => {
                    this.copyPath(this.rightClickedFile);
                }
            },
            {
                text: "Delete", action: () => {
                    this.showDeleteDialog(this.rightClickedFile);
                }
            },
            {
                text: "Rename", action: () => {
                    this.showRenameField(this.rightClickedFile);
                }
            },
            {
                text: "Properties", action: () => {
                    this.showPropertiesDialog(this.rightClickedFile);
                }
            },
        ];
        this.rightClickPropertiesFolder = [
            {
                text: "Refresh", action: () => {
                    this.addChild(this.rightClickedFile, true, this.rightClickedFile.expanded || false);
                }
            },
            {
                text: "Change Mode/Permissions...", action: () => {
                    this.showPermissionsDialog(this.rightClickedFile);
                }
            },
            {
                text: "Change Owners...", action: () => {
                    this.showOwnerDialog(this.rightClickedFile);
                }
            },
            {
                text: "Tag Directory...", action: () => {
                    this.showTaggingDialog(this.rightClickedFile);
                }
            },
            {
                text: "Create a File...", action: () => {
                    this.showCreateFileDialog(this.rightClickedFile);
                }
            },
            {
                text: "Create a Directory...", action: () => {
                    this.showCreateFolderDialog(this.rightClickedFile);
                }
            },
            {
                text: "Upload...", action: () => {
                    this.showUploadDialog(this.rightClickedFile);
                }
            },
            {
                text: "Copy Link", action: () => {
                    this.copyLink(this.rightClickedFile);
                }
            },
            {
                text: "Copy Path", action: () => {
                    this.copyPath(this.rightClickedFile);
                }
            },
            {
                text: "Delete", action: () => {
                    this.showDeleteDialog(this.rightClickedFile);
                }
            },
            {
                text: "Rename", action: () => {
                    this.showRenameField(this.rightClickedFile);
                }
            },
            {
                text: "Properties", action: () => {
                    this.showPropertiesDialog(this.rightClickedFile);
                }
            }
        ];
        this.rightClickPropertiesPanel = [
            {
                text: "Show/Hide Search", action: () => {
                    this.toggleSearch();
                }
            },
            {
                text: "Create a File...", action: () => {
                    let nodeToUse = {
                        path: this.path,
                    };
                    this.showCreateFileDialog(nodeToUse);
                }
            },
            {
                text: "Create a Directory...", action: () => {
                    let nodeToUse = {
                        path: this.path,
                    };
                    this.showCreateFolderDialog(nodeToUse);
                }
            },
            {
                text: "Upload...", action: () => {
                    this.showUploadDialog(this.rightClickedFile);
                }
            },
        ];
    }
    copyFile(rightClickedFile) {
        this.log.debug(`copyfile for  ${this.fileToCopyOrCut}, ${this.rightClickedFile.path}, ${this.path}`);
        if (this.fileToCopyOrCut == null) {
            this.rightClickPropertiesFolder.push(// Create a paste option for the folder
            {
                text: "Paste", action: () => {
                    this.pasteFile(this.fileToCopyOrCut, this.rightClickedFile.path, false);
                }
            });
            this.rightClickPropertiesPanel.push(// Create a paste option for the active directory
            {
                text: "Paste", action: () => {
                    this.pasteFile(this.fileToCopyOrCut, this.path, false);
                }
            });
        }
        this.fileToCopyOrCut = rightClickedFile;
        this.copyClick.emit(rightClickedFile);
    }
    cutFile(rightClickedFile) {
        if (this.fileToCopyOrCut) {
            this.rightClickPropertiesFolder.splice(this.rightClickPropertiesFolder.map(item => item.text).indexOf("Paste"), 1);
            this.rightClickPropertiesPanel.splice(this.rightClickPropertiesPanel.map(item => item.text).indexOf("Paste"), 1);
        }
        this.log.debug(`cutfile for  ${this.fileToCopyOrCut}, ${this.rightClickedFile.path}, ${this.path}`);
        this.rightClickPropertiesFolder.push(// Create a paste option for the folder
        {
            text: "Paste", action: () => {
                this.pasteFile(this.fileToCopyOrCut, this.rightClickedFile.path, true);
            }
        });
        this.rightClickPropertiesPanel.push(// Create a paste option for the active directory
        {
            text: "Paste", action: () => {
                this.pasteFile(this.fileToCopyOrCut, this.path, true);
            }
        });
        this.fileToCopyOrCut = rightClickedFile;
        this.copyClick.emit(rightClickedFile);
    }
    pasteFile(fileNode, destinationPath, isCut) {
        let pathAndName = fileNode.path;
        let name = this.getNameFromPathAndName(pathAndName);
        this.log.debug(`paste for ${name}, ${destinationPath}, and cut=${isCut}`);
        if (pathAndName.indexOf(' ') >= 0) {
            this.snackBar.open("Paste failed: '" + pathAndName + "' Operation not yet supported for filenames with spaces.", 'Dismiss', defaultSnackbarOptions);
            return;
        }
        let metaData = this.ussSrv.getFileMetadata(pathAndName);
        metaData.subscribe({
            next: (result) => {
                if (result.ccsid == -1) {
                    this.snackBar.open("Paste failed: '" + pathAndName + "' Operation not yet supported for this encoding.", 'Dismiss', defaultSnackbarOptions);
                    return;
                }
                else {
                    this.isLoading = true;
                    let destinationMetadata = this.ussSrv.getFileContents(destinationPath);
                    destinationMetadata.subscribe({
                        next: (result) => {
                            /*rename the file when doing paste, in case same named file exists in the destination.*/
                            for (let i = 0; i < result.entries.length; i++) {
                                if (!result.entries[i].directory && result.entries[i].name == name) {
                                    if (isCut) {
                                        this.snackBar.open("Unable to move '" + pathAndName + "' because target '" + destinationPath + '\/' + name + "'already exists at destination.", 'Dismiss', longSnackbarOptions);
                                        return;
                                    }
                                    i = -1;
                                    name = incrementFileName(name);
                                }
                            }
                            let copySubscription = this.ussSrv.copyFile(pathAndName, destinationPath + "/" + name)
                                .subscribe({
                                next: (resp) => {
                                    if (this.rightClickedFile) {
                                        if (this.rightClickedFile.children && this.rightClickedFile.children.length > 0) {
                                            let expanded = this.rightClickedFile.expanded;
                                            /* We recycle the same method used for opening (clicking on) a node. But instead of expanding it,
                                            we keep the same expanded state, and just use it to add a node */
                                            this.addChild(this.rightClickedFile, true);
                                            this.rightClickedFile.expanded = expanded;
                                        }
                                        else if (this.path == destinationPath) {
                                            /* In the case that we right click to paste on the active directory instead of a node, we update our tree
                                            (active directory) instead of adding onto a specific node */
                                            this.displayTree(this.path, true);
                                        }
                                    }
                                    if (isCut) {
                                        /* Clear the paste option, because even if delete fails after, we have already done the copy */
                                        this.isLoading = true;
                                        this.fileToCopyOrCut = null;
                                        this.rightClickPropertiesFolder.splice(this.rightClickPropertiesFolder.map(item => item.text).indexOf("Paste"), 1);
                                        this.rightClickPropertiesPanel.splice(this.rightClickPropertiesPanel.map(item => item.text).indexOf("Paste"), 1);
                                        /* Delete (cut) portion */
                                        this.ussSrv.deleteFileOrFolder(pathAndName)
                                            .subscribe({
                                            next: (resp) => {
                                                this.isLoading = false;
                                                this.removeChild(fileNode);
                                                this.snackBar.open('Paste successful: ' + name, 'Dismiss', quickSnackbarOptions);
                                            },
                                            error: (error) => {
                                                if (error.status == '500') { //Internal Server Error
                                                    this.snackBar.open("Copied successfully, but failed to cut '" + pathAndName + "' Server returned with: " + error._body, 'Dismiss', longSnackbarOptions);
                                                }
                                                else if (error.status == '404') { //Not Found
                                                    this.snackBar.open("Copied successfully, but '" + pathAndName + "' has already been deleted or does not exist.", 'Dismiss', defaultSnackbarOptions);
                                                    this.removeChild(fileNode);
                                                }
                                                else if (error.status == '400' || error.status == '403') { //Bad Request
                                                    this.snackBar.open("Copied successfully but failed to cut '" + pathAndName + "' This is probably due to a permission problem.", 'Dismiss', defaultSnackbarOptions);
                                                }
                                                else { //Unknown
                                                    this.snackBar.open("Copied successfully, but unknown error cutting '" + error.status + "' occurred for '" + pathAndName + "' Server returned with: " + error._body, 'Dismiss', longSnackbarOptions);
                                                }
                                                this.isLoading = false;
                                                this.log.severe(error);
                                            }
                                        });
                                    }
                                    else {
                                        this.isLoading = false;
                                        this.snackBar.open('Paste successful: ' + name, 'Dismiss', quickSnackbarOptions);
                                    }
                                },
                                error: (error) => {
                                    if (error.status == '500') { //Internal Server Error
                                        this.snackBar.open("Paste failed: HTTP 500 from app-server or agent occurred for '" + pathAndName + "'. Server returned with: " + error._body, 'Dismiss', longSnackbarOptions);
                                    }
                                    else if (error.status == '404') { //Not Found
                                        this.snackBar.open("Paste failed: '" + pathAndName + "' does not exist.", 'Dismiss', defaultSnackbarOptions);
                                    }
                                    else if (error.status == '400') { //Bad Request
                                        this.snackBar.open("Paste failed: HTTP 400 occurred for '" + pathAndName + "'. Check that you have correct permissions for this action.", 'Dismiss', defaultSnackbarOptions);
                                    }
                                    else { //Unknown
                                        this.snackBar.open("Paste failed: '" + error.status + "' occurred for '" + pathAndName + "' Server returned with: " + error._body, 'Dismiss', longSnackbarOptions);
                                    }
                                    this.isLoading = false;
                                    this.log.severe(error);
                                }
                            });
                            setTimeout(() => {
                                if (copySubscription.closed == false) {
                                    this.snackBar.open('Pasting ' + pathAndName + '... Larger payloads may take longer. Please be patient.', 'Dismiss', quickSnackbarOptions);
                                }
                            }, 4000);
                        },
                        error: (error) => {
                            if (error.status == '403') { //Permission denied
                                this.snackBar.open('Failed to access destination folder: Permission denied.', 'Dismiss', defaultSnackbarOptions);
                            }
                            else if (error.status == '0') {
                                this.snackBar.open("Failed to communicate with the App server: " + error.status, 'Dismiss', defaultSnackbarOptions);
                            }
                            else if (error.status == '404') {
                                this.snackBar.open("Destination folder not found. " + error.status, 'Dismiss', quickSnackbarOptions);
                            }
                            else {
                                this.snackBar.open("An unknown error occurred: " + error.status, 'Dismiss', defaultSnackbarOptions);
                            }
                            this.log.severe(error);
                        }
                    });
                }
            },
            error: (error) => {
                if (error.status == '404') { // This happens when user attempts to paste a file that's been deleted after copying
                    this.snackBar.open("Paste failed: Original '" + pathAndName + "' no longer exists.", 'Dismiss', defaultSnackbarOptions);
                }
                this.isLoading = false;
                this.log.warn(error);
            }
        });
    }
    showPropertiesDialog(rightClickedFile) {
        const filePropConfig = new MatDialogConfig();
        filePropConfig.data = {
            event: rightClickedFile
        };
        filePropConfig.maxWidth = '350px';
        this.dialog.open(FilePropertiesModal, filePropConfig);
    }
    showRenameField(file) {
        const selectedNode = this.rightClickedEvent.originalEvent.srcElement;
        let oldName = file.name;
        let oldPath = file.path;
        file.selectable = false;
        let renameFn = (node) => {
            renameField.parentNode.replaceChild(node, renameField);
            file.selectable = true;
            let nameFromNode = renameField.value;
            let pathForRename = this.getPathFromPathAndName(oldPath);
            if (oldName != nameFromNode) {
                let newPath = `${pathForRename}/${nameFromNode}`;
                this.ussSrv.renameFile(oldPath, newPath).subscribe({
                    next: (res) => {
                        this.snackBar.open("Renamed '" + oldName + "' to '" + nameFromNode + "'", 'Dismiss', quickSnackbarOptions);
                        // this.updateUss(this.path); - We don't need to update the whole tree for 1 changed node (rename should be O(1) operation), 
                        // but if problems come up uncomment this
                        this.ussRenameEvent.emit(this.rightClickedEvent.node);
                        if (this.showSearch) { // Update saved cache if we're using the search bar
                            let nodeCached = this.findNodeByPath(this.dataCached, file.path)[0];
                            if (nodeCached) {
                                nodeCached.label = nameFromNode;
                                nodeCached.path = newPath;
                                nodeCached.name = nameFromNode;
                            }
                        }
                        file.label = nameFromNode;
                        file.path = newPath;
                        file.name = nameFromNode;
                        return;
                    },
                    error: (error) => {
                        if (error.status == '403') { //Internal Server Error
                            this.snackBar.open("Failed to rename '" + file.path + "'. Bad permissions.", 'Dismiss', defaultSnackbarOptions);
                        }
                        else if (error.status == '404') { //Not Found
                            this.snackBar.open("'" + file.path + "' could not be opened or does not exist.", 'Dismiss', defaultSnackbarOptions);
                        }
                        else { //Unknown
                            this.snackBar.open("Failed to rename '" + file.path + "'. Error: " + error._body, 'Dismiss', longSnackbarOptions);
                        }
                        this.log.severe(error);
                        return;
                    }
                });
            }
        };
        var renameField = document.createElement("input");
        renameField.setAttribute('id', 'renameHighlightedField');
        renameField.value = oldName;
        renameField.style.width = selectedNode.style.width;
        renameField.style.height = selectedNode.style.height;
        let rnNode = (e) => {
            if (e.which == 13 || e.key == "Enter" || e.keyCode == 13) {
                e.stopImmediatePropagation();
                e.stopPropagation();
                e.preventDefault();
                e.cancelBubble = true;
                renameField.blur();
                return;
            }
        };
        renameField.addEventListener('keydown', rnNode);
        renameField.onblur = function (e) {
            renameFn(selectedNode);
        };
        selectedNode.parentNode.replaceChild(renameField, selectedNode);
        renameField.focus();
        renameField.select();
    }
    showPermissionsDialog(rightClickedFile) {
        const filePropConfig = new MatDialogConfig();
        filePropConfig.data = {
            event: rightClickedFile
        };
        filePropConfig.width = '400px';
        const dialogRef = this.dialog.open(FilePermissionsModal, filePropConfig);
        dialogRef.afterClosed().subscribe((res) => {
            if (res) {
                this.addChild(rightClickedFile, true);
            }
        });
    }
    showOwnerDialog(rightClickedFile) {
        const filePropConfig = new MatDialogConfig();
        filePropConfig.data = {
            event: rightClickedFile
        };
        filePropConfig.maxWidth = '400px';
        const dialogRef = this.dialog.open(FileOwnershipModal, filePropConfig);
        dialogRef.afterClosed().subscribe((res) => {
            if (res) {
                this.addChild(rightClickedFile, true);
            }
        });
    }
    showDeleteDialog(rightClickedFile) {
        if (this.checkIfInDeletionQueueAndMessage(rightClickedFile.path, "This is already being deleted.") == true) {
            return;
        }
        const fileDeleteConfig = new MatDialogConfig();
        fileDeleteConfig.data = {
            event: rightClickedFile,
            width: '600px'
        };
        let fileDeleteRef = this.dialog.open(DeleteFileModal, fileDeleteConfig);
        const deleteFileOrFolder = fileDeleteRef.componentInstance.onDelete.subscribe(() => {
            this.deleteFileOrFolder(rightClickedFile);
        });
    }
    attemptDownload(rightClickedFile) {
        let remotePath = rightClickedFile.path;
        let filename = rightClickedFile.name;
        let downloadObject = rightClickedFile;
        let url = ZoweZLUX.uriBroker.unixFileUri('contents', remotePath);
        this.downloadService.fetchFileHandler(url, filename, downloadObject).then((res) => {
            // TODO: Download queue code for progress bar could go here
        });
    }
    showCreateFolderDialog(rightClickedFile) {
        if (rightClickedFile.path) { // If this came from a node object
            if (this.checkIfInDeletionQueueAndMessage(rightClickedFile.path, "Cannot create a directory inside a directory queued for deletion.") == true) {
                return;
            }
        }
        else { // Or if this is just a path
            if (this.checkIfInDeletionQueueAndMessage(rightClickedFile, "Cannot create a directory inside a directory queued for deletion.") == true) {
                return;
            }
        }
        const folderCreateConfig = new MatDialogConfig();
        folderCreateConfig.data = {
            event: rightClickedFile,
            width: '600px'
        };
        let fileCreateRef = this.dialog.open(CreateFolderModal, folderCreateConfig);
        const createFolder = fileCreateRef.componentInstance.onCreate.subscribe(onCreateResponse => {
            /* pathAndName - Path and name obtained from create folder prompt
            updateExistingTree - Should the existing tree update or fetch a new one */
            this.createFolder(onCreateResponse.get("pathAndName"), rightClickedFile, onCreateResponse.get("updateExistingTree"));
            // emit the event with node info only when node is right clicked and not on file tree panel
            this.newFolderClick.emit(this.rightClickedEvent.node ? this.rightClickedEvent.node : '');
        });
    }
    showCreateFileDialog(rightClickedFile) {
        if (rightClickedFile.path) { // If this came from a node object
            if (this.checkIfInDeletionQueueAndMessage(rightClickedFile.path, "Cannot create a file inside a directory queued for deletion.") == true) {
                return;
            }
        }
        else { // Or if this is just a path
            if (this.checkIfInDeletionQueueAndMessage(rightClickedFile, "Cannot create a file inside a directory queued for deletion.") == true) {
                return;
            }
        }
        const fileCreateConfig = new MatDialogConfig();
        fileCreateConfig.data = {
            event: rightClickedFile,
            width: '600px'
        };
        let fileCreateRef = this.dialog.open(CreateFileModal, fileCreateConfig);
        const createFile = fileCreateRef.componentInstance.onFileCreate.subscribe(onFileCreateResponse => {
            /* pathAndName - Path and name obtained from create folder prompt
            updateExistingTree - Should the existing tree update or fetch a new one */
            this.createFile(onFileCreateResponse.get("pathAndName"), rightClickedFile, onFileCreateResponse.get("updateExistingTree"));
            // emit the event with node info only when node is right clicked and not on file tree panel
            this.newFileClick.emit(this.rightClickedEvent.node ? this.rightClickedEvent.node : '');
        });
    }
    showUploadDialog(rightClickedFile) {
        const folderUploadConfig = new MatDialogConfig();
        folderUploadConfig.data = {
            event: rightClickedFile || this.path,
            width: '600px'
        };
        let fileUploadRef = this.dialog.open(UploadModal, folderUploadConfig);
        const upload = fileUploadRef.componentInstance.onUpload.subscribe(onUploadResponse => {
            if (rightClickedFile && rightClickedFile.path && rightClickedFile.path != this.path) {
                this.addChild(rightClickedFile, true);
                this.fileUploaded.emit(this.rightClickedEvent.node.path);
            }
            else {
                this.displayTree(this.path, false);
                this.fileUploaded.emit(this.path);
            }
        });
    }
    copyLink(rightClickedFile) {
        let link = '';
        if (rightClickedFile.directory) {
            link = `${window.location.origin}${window.location.pathname}?pluginId=${this.pluginDefinition.getBasePlugin().getIdentifier()}:data:${encodeURIComponent(`{"type":"openDir","name":"${rightClickedFile.path}","toggleTree":false}`)}`;
        }
        else {
            link = `${window.location.origin}${window.location.pathname}?pluginId=${this.pluginDefinition.getBasePlugin().getIdentifier()}:data:${encodeURIComponent(`{"type":"openFile","name":"${rightClickedFile.path}","toggleTree":true}`)}`;
        }
        navigator.clipboard.writeText(link).then(() => {
            this.log.debug("Link copied to clipboard");
            this.snackBar.open("Copied link successfully", 'Dismiss', quickSnackbarOptions);
        }).catch(() => {
            console.error("Failed to copy Link to clipboard");
        });
    }
    copyPath(rightClickedFile) {
        navigator.clipboard.writeText(rightClickedFile.path).then(() => {
            this.log.debug("Path copied to clipboard");
        }).catch(() => {
            console.error("Failed to copy path to clipboard");
        });
    }
    showTaggingDialog(rightClickedFile) {
        const config = new MatDialogConfig();
        config.data = {
            node: rightClickedFile
        };
        config.maxWidth = '450px';
        const dialogRef = this.dialog.open(FileTaggingModal, config);
        dialogRef.afterClosed().subscribe((res) => {
            if (res) {
                this.addChild(rightClickedFile, true);
            }
        });
    }
    toggleSearch() {
        this.showSearch = !this.showSearch;
        if (this.showSearch) {
            this.focusSearchInput();
            this.dataCached = _.cloneDeep(this.data); // We want a deep clone so we can modify this.data w/o changing this.dataCached
            if (this.searchCtrl.value) {
                this.searchInputChanged(this.searchCtrl.value);
            }
        }
        else {
            if (this.dataCached) {
                this.data = this.dataCached; // We don't care about deep clone because we just want to get dataCached back
            }
        }
    }
    // TODO: There's an app2app opportunity here, where an app using the File Tree could spawn with a pre-filtered list of nodes
    focusSearchInput(attemptCount) {
        if (this.searchUSS) {
            this.searchUSS.nativeElement.focus();
            return;
        }
        const maxAttempts = 10;
        if (typeof attemptCount !== 'number') {
            attemptCount = maxAttempts;
        }
        if (attemptCount > 0) {
            attemptCount--;
            setTimeout(() => this.focusSearchInput(attemptCount), 100);
        }
    }
    // onNewFileClick($event: any): void {
    //   this.newFileClick.emit($event);
    // }
    onNodeClick($event) {
        this.path = this.path.replace(/\/$/, '');
        this.selectedNode = $event.node;
        if ($event.node.data === 'Folder') {
            if (this.checkIfInDeletionQueueAndMessage($event.node.path, "Cannot open a directory queued for deletion.") == true) {
                return;
            }
            this.addChild($event.node);
            this.nodeClick.emit($event.node);
        }
        else {
            if (this.checkIfInDeletionQueueAndMessage($event.node.path, "Cannot open a file queued for deletion.") == true) {
                return;
            }
            this.nodeClick.emit($event.node);
        }
    }
    onNodeDblClick($event) {
        let updateTree = false; // A double click drills into a folder, so we make a fresh query instead of update
        this.displayTree($event.node.path, updateTree);
        this.nodeDblClick.emit($event.node);
        this.selectedNode = $event.node;
    }
    onNodeRightClick($event) {
        let node = $event.node;
        let rightClickProperties;
        if (node.directory) {
            rightClickProperties = this.rightClickPropertiesFolder;
            this.selectedNode = node;
        }
        else {
            rightClickProperties = this.rightClickPropertiesFile;
            this.selectedNode = node.parent;
        }
        if (this.windowActions) {
            let didContextMenuSpawn = this.windowActions.spawnContextMenu($event.originalEvent.clientX, $event.originalEvent.clientY, rightClickProperties, true);
            // TODO: Fix Zowe's context menu such that if it doesn't have enough space to spawn, it moves itself accordingly to spawn.
            if (!didContextMenuSpawn) { // If context menu failed to spawn...
                let heightAdjustment = $event.originalEvent.clientY - 25; // Bump it up 25px
                didContextMenuSpawn = this.windowActions.spawnContextMenu($event.originalEvent.clientX, heightAdjustment, rightClickProperties, true);
            }
        }
        this.rightClickedFile = node;
        this.rightClickedEvent = $event;
        this.rightClick.emit($event.node);
        $event.originalEvent.preventDefault();
    }
    onPanelRightClick($event) {
        if (this.windowActions) {
            let didContextMenuSpawn = this.windowActions.spawnContextMenu($event.clientX, $event.clientY, this.rightClickPropertiesPanel, true);
            // TODO: Fix Zowe's context menu such that if it doesn't have enough space to spawn, it moves itself accordingly to spawn.
            if (!didContextMenuSpawn) { // If context menu failed to spawn...
                let heightAdjustment = $event.clientY - 25; // Bump it up 25px
                didContextMenuSpawn = this.windowActions.spawnContextMenu($event.clientX, heightAdjustment, this.rightClickPropertiesPanel, true);
            }
        }
        this.rightClickedEvent = $event;
    }
    onPathChanged($event) {
        this.pathChanged.emit($event);
    }
    onDataChanged($event) {
        this.dataChanged.emit($event);
    }
    sortFn(a, b) {
        if (a.directory !== b.directory) {
            if (a.directory === true) {
                return -1;
            }
            else {
                return 1;
            }
        }
        else {
            if (a.name.toLowerCase() < b.name.toLowerCase()) {
                return -1;
            }
            else {
                return 1;
            }
        }
    }
    collapseTree() {
        let dataArray = this.data;
        this.selectedNode = null;
        for (let i = 0; i < dataArray.length; i++) {
            if (this.data[i].expanded == true) {
                this.data[i].expanded = false;
            }
        }
        this.treeComponent.unselectNode();
    }
    //Displays the starting file structure of 'path'. When update == true, tree will be updated
    //instead of reset to 'path' (meaning currently opened children don't get wiped/closed)
    displayTree(path, update) {
        //To reduce unintentional bugs by defaulting to root directory or dropping if caller sent an object we're not supposed to be using
        if (path === undefined || path === '') {
            path = this.root;
        }
        else if (typeof path !== 'string') {
            this.log.warn("The FT received a path object that wasn't a string so it couldn't continue, object=", path);
            return;
        }
        this.selectedNode = null;
        this.isLoading = true;
        let ussData = this.ussSrv.getFileContents(path);
        ussData.subscribe({
            next: (files) => {
                this.isLoading = false;
                if (!files || !files?.entries) { // Reduces console errors and other bugs by accidentally providing a USS file as USS path
                    return;
                }
                files.entries.sort(this.sortFn);
                this.onDataChanged(files.entries);
                const tempChildren = [];
                for (let i = 0; i < files.entries.length; i++) {
                    if (files.entries[i].directory) {
                        files.entries[i].children = [];
                        files.entries[i].data = "Folder";
                        files.entries[i].collapsedIcon = "fa fa-folder";
                        files.entries[i].expandedIcon = "fa fa-folder-open";
                    }
                    else {
                        files.entries[i].items = {};
                        files.entries[i].icon = "fa fa-file";
                        files.entries[i].data = "File";
                    }
                    files.entries[i].label = files.entries[i].name;
                    files.entries[i].id = i;
                    tempChildren.push(files.entries[i]);
                }
                this.isLoading = false;
                if (update == true) { //Tree is displayed to update existing opened nodes, while maintaining currently opened trees 
                    let indexArray;
                    let dataArray; //represents the working FileTreeNode[] that will eventually be added to tempChildren and make up the tree
                    let networkArray; //represents the FileTreeNode[] obtained from the uss server, will iteratively replace dataArray as need be
                    let parentNode;
                    indexArray = [0];
                    dataArray = this.data;
                    networkArray = tempChildren;
                    while (indexArray[indexArray.length - 1] <= dataArray.length) {
                        //Go back up a layer
                        if (indexArray[indexArray.length - 1] == dataArray.length) {
                            indexArray.pop();
                            if (parentNode !== undefined && parentNode.parent !== undefined) {
                                parentNode = parentNode.parent;
                                dataArray = parentNode.children;
                                networkArray = dataArray;
                            }
                            else {
                                if (parentNode !== undefined) {
                                    for (let i = 0; i < tempChildren.length; i++) {
                                        if (parentNode.label == tempChildren[i].label || parentNode.children == tempChildren[i].children) {
                                            tempChildren[i] = parentNode;
                                            break;
                                        }
                                    }
                                }
                                dataArray = this.data;
                                networkArray = tempChildren;
                            }
                        }
                        else if (dataArray[indexArray[indexArray.length - 1]] !== undefined && dataArray[indexArray[indexArray.length - 1]].data == 'Folder'
                            && dataArray[indexArray[indexArray.length - 1]].children !== undefined && dataArray[indexArray[indexArray.length - 1]].children.length !== 0) {
                            //... if the children of dataArray with index in last element of indexArray are not empty, drill into them!
                            parentNode = dataArray[indexArray[indexArray.length - 1]];
                            dataArray = parentNode.children;
                            networkArray = dataArray;
                            indexArray[indexArray.length - 1]++;
                            indexArray.push(0);
                        }
                        else {
                            dataArray[indexArray[indexArray.length - 1]] = networkArray[indexArray[indexArray.length - 1]];
                            indexArray[indexArray.length - 1]++; //go up index to check new element in data array
                        }
                    }
                }
                this.log.debug("Tree has been updated.");
                this.log.debug(tempChildren);
                this.data = tempChildren;
                if (this.showSearch) {
                    this.dataCached = this.data; // TODO: Implement logic to update tree of search queried results (so reverting the search filter doesn't fail)
                    if (!update) { // When a fresh tree is requested, it will get rid of this.data search queried results, so hide search bar
                        this.showSearch = false;
                    }
                }
                this.path = path;
                this.onPathChanged(this.path);
                // this.persistentDataService.getData()
                //       .subscribe(data => {
                //         this.dataObject = data.contents;
                //         this.dataObject.ussInput = this.path;
                //         this.dataObject.ussData = this.data;
                //         this.persistentDataService.setData(this.dataObject)
                //           .subscribe((res: any) => { });
                //       })
            },
            error: (error) => {
                this.isLoading = false;
                if (error.status == '403') { //Permission denied
                    this.snackBar.open('Failed to open: Permission denied.', 'Dismiss', defaultSnackbarOptions);
                }
                else if (error.status == '0') {
                    this.snackBar.open("Failed to communicate with the App server: " + error.status, 'Dismiss', defaultSnackbarOptions);
                }
                else if (error.status == '404') {
                    this.snackBar.open("File/folder not found. " + error.status, 'Dismiss', quickSnackbarOptions);
                }
                else {
                    this.snackBar.open("An unknown error occurred: " + error.status, 'Dismiss', defaultSnackbarOptions);
                }
                this.log.severe(error);
            }
        });
        this.refreshHistory(this.path);
    }
    refreshHistory(path) {
        this.ussSearchHistorySubscription = this.ussSearchHistory
            .saveSearchHistory(path)
            .subscribe();
    }
    clearSearchHistory() {
        this.ussSearchHistory.deleteSearchHistory().subscribe();
        this.ussSearchHistory.onInit(SEARCH_ID);
    }
    //Adds children to the existing node to update this.data array, 
    //fetch - fetches new data, expand - expands or not folder node after fetching new data
    addChild(node, fetch, expand) {
        let path = node.path;
        if (node.children && node.children.length > 0 && !fetch) {
            //If an opened node has children, and the user clicked on it...
            if (node.expanded) {
                node.expanded = false;
            }
            //If a closed node has children, and the user clicked on it...
            else {
                node.expanded = true;
            }
            if (this.showSearch) { // Update node in cached data as well
                let nodeCached = this.findNodeByPath(this.dataCached, path)[0];
                if (nodeCached) {
                    nodeCached.expanded = node.expanded;
                }
            }
        }
        else //When the selected node has no children or we want to fetch new data
         {
            this.refreshFileMetadata(node);
            node.expanded = expand !== undefined ? expand : true;
            let ussData = this.ussSrv.getFileContents(path);
            let tempChildren = [];
            ussData.subscribe(files => {
                files.entries.sort(this.sortFn);
                //TODO: Could be turned into a util service...
                for (let i = 0; i < files.entries.length; i++) {
                    if (files.entries[i].directory) {
                        files.entries[i].children = [];
                        files.entries[i].data = "Folder";
                        files.entries[i].collapsedIcon = "fa fa-folder";
                        files.entries[i].expandedIcon = "fa fa-folder-open";
                    }
                    else {
                        files.entries[i].items = {};
                        files.entries[i].icon = "fa fa-file";
                        files.entries[i].data = "File";
                    }
                    files.entries[i].label = files.entries[i].name;
                    files.entries[i].id = i;
                    tempChildren.push(files.entries[i]);
                }
                node.children = tempChildren;
                node.expandedIcon = "fa fa-folder-open";
                node.collapsedIcon = "fa fa-folder";
                this.log.debug(path + " was populated with " + tempChildren.length + " children.");
                while (node.parent !== undefined) {
                    let newChild = node.parent;
                    newChild.children[node.id] = node;
                    newChild.expanded = true;
                    newChild.expandedIcon = "fa fa-folder-open";
                    newChild.collapsedIcon = "fa fa-folder";
                    node = newChild;
                }
                let index = -1;
                for (let i = 0; i < this.data.length; i++) {
                    if (this.data[i].label == node.label) {
                        index = i;
                        break;
                    }
                }
                if (index != -1) {
                    this.data[index] = node;
                    if (this.showSearch) { // If we update a node in the working directory, we need to find that same node in the cached data
                        index = -1; // which may be in a different index due to filtering by search query
                        for (let i = 0; i < this.dataCached.length; i++) { // We could use this.findNodeByPath, but we need search only parent level
                            if (this.dataCached[i].label == node.label) {
                                index = i;
                                break;
                            }
                        }
                        if (index != -1) {
                            this.dataCached[index] = node;
                        }
                        else {
                            this.log.debug("Though node added in working directory, failed to find index in cached data");
                        }
                    }
                    // this.persistentDataService.getData()
                    //   .subscribe(data => {
                    //     this.dataObject = data.contents;
                    //     this.dataObject.ussInput = this.path;
                    //     this.dataObject.ussData = this.data;
                    //     this.persistentDataService.setData(this.dataObject)
                    //       .subscribe((res: any) => { });
                    //   })
                }
                else
                    this.log.debug("failed to find index");
            });
        }
    }
    refreshFileMetadata(node) {
        let path = node.path;
        let someData = this.ussSrv.getFileMetadata(path);
        someData.subscribe({
            next: (result) => {
                if (result.directory) {
                    node.data = "Folder";
                    node.collapsedIcon = "fa fa-folder";
                    node.expandedIcon = "fa fa-folder-open";
                }
                else {
                    node.items = {};
                    node.icon = "fa fa-file";
                    node.data = "File";
                }
                node.directory = result.directory;
                node.mode = result.mode;
                node.owner = result.owner;
                node.group = result.group;
                node.size = result.size;
                node.ccsid = result.ccsid;
                node.createdAt = result.createdAt;
                return node;
            },
            error: e => {
                if (e.status == 404) {
                    this.snackBar.open("Failed to refresh '" + node.name + "' No longer exists or has been renamed.", 'Dismiss', defaultSnackbarOptions);
                    this.removeChild(node);
                }
                else if (e.status == 403) {
                    this.snackBar.open("Failed to refresh '" + node.name + "' Permission denied.", 'Dismiss', defaultSnackbarOptions);
                }
                else if (e.status == 500) {
                    this.snackBar.open("Failed to refresh '" + node.name + "' Server returned with: " + e._body, 'Dismiss', longSnackbarOptions);
                }
                return node;
            }
        });
    }
    refreshFileMetadatdaUsingPath(path) {
        let foundNode = this.findNodeByPath(this.data, path)[0];
        if (foundNode) {
            this.refreshFileMetadata(foundNode);
        }
    }
    searchInputChanged(input) {
        if (this.dataCached) {
            this.data = _.cloneDeep(this.dataCached);
        }
        this.filterNodesByLabel(this.data, input);
    }
    filterNodesByLabel(data, label) {
        for (let i = 0; i < data.length; i++) {
            if (!(data[i]).label.includes(label)) {
                if (data[i].children && data[i].children.length > 0) {
                    this.filterNodesByLabel(data[i].children, label);
                }
                if (!(data[i].children && data[i].children.length > 0)) {
                    data.splice(i, 1);
                    i--;
                }
                else if (data[i].data = "Folder") { // If some children didn't get filtered out (aka we got some matches) and we have a folder
                    // then we want to expand the node so the user can see their results in the search bar
                    data[i].expanded = true;
                }
            }
        }
    }
    // TODO: Could be optimized to do breadth first search vs depth first search
    findNodeByPath(data, path) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].path == path) {
                return [data[i], i]; // 0 - node, 1 - index
            }
            if (data[i].children && data[i].children.length > 0) {
                let foundValue;
                foundValue = this.findNodeByPath(data[i].children, path);
                // if match not found in the childern nodes then contine with pending Top level nodes
                if (foundValue[0] == null && i != data.length - 1) {
                    continue;
                }
                else {
                    return foundValue;
                }
            }
        }
        return [null, null];
    }
    updateUss(path) {
        this.displayTree(path, true);
    }
    createFile(pathAndName, node, update) {
        this.ussSrv.makeFile(pathAndName).subscribe({
            next: (res) => {
                this.log.debug('Created: ' + pathAndName);
                let path = this.getPathFromPathAndName(pathAndName);
                let someData = this.ussSrv.getFileMetadata(pathAndName);
                this.snackBar.open(`Successfully created file: "${pathAndName.substring(pathAndName.lastIndexOf('/') + 1)}"`, 'Dismiss', defaultSnackbarOptions);
                someData.subscribe({
                    next: result => {
                        // If the right-clicked 'node' is the correct, valid node
                        if (node.children && node.path == path) {
                            let nodeToAdd = {
                                id: node.children.length,
                                label: this.getNameFromPathAndName(pathAndName),
                                mode: result.mode,
                                owner: result.owner,
                                group: result.group,
                                createdAt: result.createdAt,
                                data: "File",
                                directory: false,
                                icon: "fa fa-file",
                                items: {},
                                name: this.getNameFromPathAndName(pathAndName),
                                parent: node,
                                path: pathAndName,
                                size: result.size
                            };
                            node.children.push(nodeToAdd); //Add node to right clicked node
                            if (this.showSearch) { // If we update a node in the working directory, we need to find that same node in the cached data
                                let nodeCached = this.findNodeByPath(this.dataCached, node.path)[0];
                                if (nodeCached) {
                                    nodeCached.children.push(nodeToAdd);
                                }
                            }
                            node.expanded = true;
                        }
                        // ..otherwise treat folder creation without any context.
                        else {
                            if (path == this.path) { // If we are creating a folder at the parent level
                                this.displayTree(path, true);
                            }
                            else if (update) { // If we want to update the tree
                                this.addChild(node);
                            }
                            else { // If we are creating a new folder in a location we're not looking at
                                this.displayTree(path, false); // ...plop the Explorer into the newly created location.
                            }
                        }
                    }
                });
            },
            error: error => {
                this.ussSrv.getFileMetadata(pathAndName).subscribe({
                    next: response => {
                        this.snackBar.open("Failed to create File. '" + pathAndName + "' already exists", 'Dismiss', defaultSnackbarOptions);
                    },
                    error: err => {
                        this.snackBar.open("Failed to create File: '" + pathAndName + "'", 'Dismiss', defaultSnackbarOptions);
                        this.log.severe(error);
                    }
                });
            }
        });
    }
    createFolder(pathAndName, node, update) {
        this.ussSrv.makeDirectory(pathAndName)
            .subscribe({
            next: resp => {
                this.log.debug('Created: ' + pathAndName);
                let path = this.getPathFromPathAndName(pathAndName);
                let someData = this.ussSrv.getFileMetadata(pathAndName);
                someData.subscribe({
                    next: result => {
                        // If the right-clicked 'node' is the correct, valid node
                        if (node.children && node.path == path) {
                            let nodeToAdd = {
                                id: node.children.length,
                                children: [],
                                label: this.getNameFromPathAndName(pathAndName),
                                mode: result.mode,
                                owner: result.owner,
                                group: result.group,
                                createdAt: result.createdAt,
                                data: "Folder",
                                directory: true,
                                expandedIcon: "fa fa-folder-open",
                                collapsedIcon: "fa fa-folder",
                                name: this.getNameFromPathAndName(pathAndName),
                                parent: node,
                                path: pathAndName,
                                size: result.size
                            };
                            node.children.push(nodeToAdd); //Add node to right clicked node
                            if (this.showSearch) { // If we update a node in the working directory, we need to find that same node in the cached data
                                let nodeCached = this.findNodeByPath(this.dataCached, node.path)[0];
                                if (nodeCached) {
                                    nodeCached.children.push(nodeToAdd);
                                }
                            }
                            node.expanded = true;
                        }
                        // ..otherwise treat folder creation without any context.
                        else {
                            if (path == this.path) { // If we are creating a folder at the parent level
                                this.displayTree(path, true);
                            }
                            else if (update) { // If we want to update the tree
                                this.addChild(node);
                            }
                            else { // If we are creating a new folder in a location we're not looking at
                                this.displayTree(pathAndName, false); // ...plop the Explorer into the newly created location.
                            }
                        }
                    }
                });
            },
            error: error => {
                if (error.status == '500') { //Internal Server Error
                    this.snackBar.open("Failed to create directory: '" + pathAndName + "' This is probably due to a server agent problem.", 'Dismiss', defaultSnackbarOptions);
                }
                this.log.severe(error);
            }
        });
    }
    deleteFileOrFolder(rightClickedFile) {
        let pathAndName = rightClickedFile.path;
        let name = this.getNameFromPathAndName(pathAndName);
        this.isLoading = true;
        this.deletionQueue.set(rightClickedFile.path, rightClickedFile);
        rightClickedFile.styleClass = "filebrowseruss-node-deleting";
        let deleteSubscription = this.ussSrv.deleteFileOrFolder(pathAndName)
            .subscribe({
            next: resp => {
                this.isLoading = false;
                this.snackBar.open("Deleted '" + name + "'", 'Dismiss', quickSnackbarOptions);
                this.removeChild(rightClickedFile);
                this.deletionQueue.delete(rightClickedFile.path);
                rightClickedFile.styleClass = "";
                this.deleteClick.emit(this.rightClickedEvent.node);
            },
            error: error => {
                if (error.status == '500') { //Internal Server Error
                    this.snackBar.open("Failed to delete '" + pathAndName + "' Server returned with: " + error._body, 'Dismiss', longSnackbarOptions);
                }
                else if (error.status == '404') { //Not Found
                    this.snackBar.open("Failed to delete '" + pathAndName + "'. Already been deleted or does not exist.", 'Dismiss', defaultSnackbarOptions);
                    this.removeChild(rightClickedFile);
                }
                else if (error.status == '400' || error.status == '403') { //Bad Request
                    this.snackBar.open("Failed to delete '" + pathAndName + "' This is probably due to a permission problem.", 'Dismiss', defaultSnackbarOptions);
                }
                else { //Unknown
                    this.snackBar.open("Unknown error '" + error.status + "' occurred for '" + pathAndName + "' Server returned with: " + error._body, 'Dismiss', longSnackbarOptions);
                    //Error info gets printed in uss.crud.service.ts
                }
                this.deletionQueue.delete(rightClickedFile.path);
                this.isLoading = false;
                rightClickedFile.styleClass = "";
                this.log.severe(error);
            }
        });
        setTimeout(() => {
            if (deleteSubscription.closed == false) {
                this.snackBar.open("Deleting '" + pathAndName + "'... Larger payloads may take longer. Please be patient.", 'Dismiss', quickSnackbarOptions);
            }
        }, 4000);
    }
    removeChild(node) {
        let parent;
        let children;
        if (node.parent) { // If the selected node has a parent,
            parent = node.parent;
            children = parent.children; // ...just use the top-most children
        }
        else { // The selected node *is* the top-most node,
            children = this.data; // ...just use the UI nodes as our children
        }
        let nodeData = this.findNodeByPath(children, node.path);
        if (nodeData) { // If we catch the node we wanted to remove,
            let nodeObj = nodeData[0];
            let nodeIndex = nodeData[1];
            children.splice(nodeIndex, 1); // ...remove it
            if (node.parent && node.parent.children) { // Update the children to no longer include removed node
                node.parent.children = children;
            }
            else {
                this.data = children;
            }
        }
        if (this.showSearch) { // If we update a node in the working directory, we need to find that same node in the cached data
            let nodeDataCached = this.findNodeByPath(this.dataCached, node.path);
            if (nodeDataCached) {
                let nodeCached = nodeDataCached[0];
                let indexCached = nodeDataCached[1];
                if (nodeCached.parent) {
                    if (indexCached != -1) {
                        nodeCached.parent.children.splice(indexCached, 1);
                    }
                }
            }
        }
    }
    sendNotification(title, message) {
        let pluginId = this.pluginDefinition.getBasePlugin().getIdentifier();
        // We can specify a different styleClass to theme the notification UI i.e. [...] message, 1, pluginId, "org_zowe_zlux_editor_snackbar"
        let notification = ZoweZLUX.notificationManager.createNotification(title, message, 1, pluginId);
        return ZoweZLUX.notificationManager.notify(notification);
    }
    levelUp() {
        //TODO: may want to change this to 'root' depending on mainframe file access security
        //to prevent people from accessing files/folders outside their root dir
        if (this.path !== "/" && this.path !== '') {
            this.path = this.getPathFromPathAndName(this.path);
            if (this.path === '' || this.path == '/') {
                this.path = '/';
            }
            let parentindex = this.path.length - 1;
            while (this.path.charAt(parentindex) != '/') {
                parentindex--;
            }
            let parent = this.path.slice(parentindex + 1, this.path.length);
            this.log.debug("Going up to: " + parent);
            this.displayTree(this.path, false);
        }
        else {
            this.updateUss(this.path);
        }
    }
    getPathFromPathAndName(pathAndName) {
        let path = pathAndName.replace(/\/$/, '').replace(/\/[^\/]+$/, '');
        return path;
    }
    getNameFromPathAndName(pathAndName) {
        let name = pathAndName.replace(/(^.*)(\/.*\/)/, '');
        return name;
    }
    checkPath(input) {
        return this.utils.filePathEndCheck(this.path) + input;
    }
    checkPathSlash(event) {
        if (this.path == "") {
            this.path = "/";
            this.pathInputUSS.nativeElement.value = "/";
        }
    }
    checkIfInDeletionQueueAndMessage(pathAndName, message) {
        if (this.deletionQueue.has(pathAndName)) {
            this.snackBar.open("Deletion in progress: '" + pathAndName + "' " + message, 'Dismiss', defaultSnackbarOptions);
            return true;
        }
        return false;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FileBrowserUSSComponent, deps: [{ token: i0.ElementRef }, { token: UssCrudService }, { token: UtilsService }, { token: SearchHistoryService }, { token: i1.MatDialog }, { token: i3$1.MatSnackBar }, { token: DownloaderService }, { token: Angular2InjectionTokens.LOGGER }, { token: Angular2InjectionTokens.LAUNCH_METADATA }, { token: Angular2InjectionTokens.PLUGIN_DEFINITION }, { token: Angular2InjectionTokens.WINDOW_ACTIONS, optional: true }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: FileBrowserUSSComponent, selector: "file-browser-uss", inputs: { inputStyle: "inputStyle", searchStyle: "searchStyle", treeStyle: "treeStyle", showUpArrow: "showUpArrow" }, outputs: { pathChanged: "pathChanged", dataChanged: "dataChanged", nodeClick: "nodeClick", nodeDblClick: "nodeDblClick", nodeRightClick: "nodeRightClick", newFolderClick: "newFolderClick", newFileClick: "newFileClick", fileUploaded: "fileUploaded", copyClick: "copyClick", deleteClick: "deleteClick", ussRenameEvent: "ussRenameEvent", rightClick: "rightClick", openInNewTab: "openInNewTab" }, providers: [UssCrudService, /*PersistentDataService,*/ SearchHistoryService], viewQueries: [{ propertyName: "treeComponent", first: true, predicate: TreeComponent, descendants: true }, { propertyName: "pathInputUSS", first: true, predicate: ["pathInputUSS"], descendants: true }, { propertyName: "searchUSS", first: true, predicate: ["searchUSS"], descendants: true }], ngImport: i0, template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n\n<div style=\"height: 100%;\">\n\n  <!-- Tabs, searchbar, and loading indicator -->\n  @if (showUpArrow) {\n  <img data-toggle=\"tooltip\" class=\"filebrowseruss-pointer-logo\" title=\"Go up to the parent level\" (click)=\"levelUp()\"\n    [ngStyle]=\"treeStyle\" tabindex=\"0\" (keydown.enter)=\"levelUp()\">\n  }\n\n  <div class=\"filebrowseruss-search\" [ngStyle]=\"searchStyle\">\n    <input #pathInputUSS [(ngModel)]=\"path\" list=\"searchUSSHistory\" placeholder=\"Enter an absolute path...\"\n      [ngStyle]=\"inputStyle\" class=\"filebrowseruss-search-input\" (keydown.enter)=\"displayTree(path, false);\"\n      [disabled]=\"isLoading\" (ngModelChange)=\"checkPathSlash($event)\">\n    <!-- TODO: make search history a directive to use in both uss and mvs-->\n    <datalist id=\"searchUSSHistory\">\n      @for (item of ussSearchHistory.searchHistoryVal; track item) {\n      <option [value]=\"item\"></option>\n      }\n    </datalist>\n  </div>\n  <div class=\"fa fa-spinner fa-spin filebrowseruss-loading-icon\" [hidden]=\"!isLoading\" style=\"margin-left: 9px;\"></div>\n  <div class=\"fa fa-refresh filebrowseruss-loading-icon\" title=\"Refresh whole directory\"\n    (click)=\"displayTree(path, false);\" [hidden]=\"isLoading\" style=\"margin-left: 9px; cursor: pointer;\"></div>\n  <div class=\"file-tree-utilities\">\n    <div class=\"fa fa-minus-square-o filebrowser-icon\" title=\"Collapse Folders in Explorer\" (click)=\"collapseTree();\">\n    </div>\n    <div class=\"fa fa-trash-o filebrowser-icon\" title=\"Delete\" (click)=\"showDeleteDialog(selectedNode);\"></div>\n    <div class=\"fa fa-folder-o filebrowser-icon\" title=\"Create New Folder\"\n      (click)=\"showCreateFolderDialog(!selectedNode || (!selectedNode.parent && !selectedNode.directory) ? { 'path' : path } : selectedNode.directory ? selectedNode : selectedNode.parent);\">\n    </div>\n    <div class=\"fa fa-eraser filebrowser-icon special-utility\" title=\"Clear Search History\"\n      (click)=\"clearSearchHistory();\"></div>\n  </div>\n\n  <!-- Main tree -->\n  <div [hidden]=\"hideExplorer\" style=\"height: 100%;\">\n    <tree-root [treeData]=\"data\" (clickEvent)=\"onNodeClick($event)\" (dblClickEvent)=\"onNodeDblClick($event)\"\n      [ngStyle]=\"treeStyle\" (rightClickEvent)=\"onNodeRightClick($event)\"\n      (panelRightClickEvent)=\"onPanelRightClick($event)\" (dataChanged)=\"onDataChanged($event)\"></tree-root>\n  </div>\n\n  @if (showSearch) {\n  <div class=\"filebrowseruss-search-bottom-group\">\n    <p-inputGroup>\n      <p-inputGroupAddon>\n        <i class=\"fa fa-search filebrowseruss-search-bottom-icon\"></i>\n      </p-inputGroupAddon>\n      <input type=\"text\" pInputText placeholder=\"Search opened files/folders by name...\"\n        class=\"filebrowseruss-search-bottom-input\" [formControl]=\"searchCtrl\" #searchUSS>\n    </p-inputGroup>\n  </div>\n  }\n\n</div>\n\n<!--\n    This program and the accompanying materials are\n    made available under the terms of the Eclipse Public License v2.0 which accompanies\n    this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n    SPDX-License-Identifier: EPL-2.0\n\n    Copyright Contributors to the Zowe Project.\n    -->", styles: [".filebrowseruss-search{width:fit-content;min-width:250px;margin-left:5px;display:inline-block;height:40px}.filebrowseruss-search-input{width:100%;min-height:30px;font-family:sans-serif;font-size:15px;height:35px;background-color:#464646;color:#fff;padding-left:5px;border:0px}.filebrowseruss-search-bottom-group{margin-top:-17px;position:relative}.filebrowseruss-search-bottom-icon{font-size:large;position:absolute;color:#d4d4d4;padding-left:5px}.filebrowseruss-search-bottom-input{padding-left:28px;width:calc(100% - 5px);min-height:30px;font-family:sans-serif;font-size:15px;height:35px;background-color:#313030;color:#fff;border:0px;margin-top:-10px}.filebrowseruss-search-bottom-input:focus{outline:none;border:1px solid rgb(161,160,160);border-radius:3px}.filebrowseruss-dialog-menu{background:#fff;padding:0;height:auto;width:auto}.filebrowseruss-pointer-logo{content:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsSAAALEgHS3X78AAAA2UlEQVQ4y7XRwUkEQRSE4c9xDcAEFCYFYzCFCaGDavQgeDOEWTQBA1AQ9KCgpxUEQVh3vLyBgdnuw4APGprqqp96NP85KaU2pdTWPE0tjB73NUhTCd+ixTHuSpCmEO5xil2cE/T7IE0h3OIBWwx4Cm0GaQrhNS5xEIDr0GaQaYNx3zU6fAegiXs3gZzNADnnMdjlnDch76LBEFqH85zzzZhbTfcJyL4VD+N9Ey3q3xjzO/FsS6ZVBTDECpYCPvATDd6XAF7xEp63JYBnXOAIj0sAn7iK+1fJ9AcOn0qIhbHEXwAAAABJRU5ErkJggg==);width:20px;height:20px;filter:brightness(3);cursor:pointer}.filebrowseruss-node-deleting{opacity:.5}.filebrowseruss-loading-icon{margin-left:8px!important;font-size:large!important}.file-tree-utilities{overflow:hidden;border:1px solid #464646}.filebrowser-icon{margin-right:9px;float:right;cursor:pointer}.special-utility{margin-left:9px}.p-inputgroup-addon{align-items:flex-start!important}\n", ".p-overflow-hidden{overflow:hidden;padding-right:var(--scrollbar-width)}@layer primeng{.p-component,.p-component *{box-sizing:border-box}.p-hidden{display:none}.p-hidden-space{visibility:hidden}.p-hidden-accessible{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.p-hidden-accessible input,.p-hidden-accessible select{transform:scale(0)}.p-reset{margin:0;padding:0;border:0;outline:0;text-decoration:none;font-size:100%;list-style:none}.p-disabled,.p-disabled *{cursor:default!important;pointer-events:none}.p-component-overlay{position:fixed;top:0;left:0;width:100%;height:100%}.p-unselectable-text{-webkit-user-select:none;user-select:none}.p-scrollbar-measure{width:100px;height:100px;overflow:scroll;position:absolute;top:-9999px}@-webkit-keyframes p-fadein{0%{opacity:0}to{opacity:1}}@keyframes p-fadein{0%{opacity:0}to{opacity:1}}input[type=button],input[type=submit],input[type=reset],input[type=file]::-webkit-file-upload-button,button{border-radius:0}.p-link{text-align:left;background-color:transparent;margin:0;padding:0;border:0;cursor:pointer;-webkit-user-select:none;user-select:none}.p-link:disabled{cursor:default}.p-sr-only{border:0;clip:rect(1px,1px,1px,1px);clip-path:inset(50%);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;word-wrap:normal!important}.p-connected-overlay{opacity:0;transform:scaleY(.8);transition:transform .12s cubic-bezier(0,0,.2,1),opacity .12s cubic-bezier(0,0,.2,1)}.p-connected-overlay-visible{opacity:1;transform:scaleY(1)}.p-connected-overlay-hidden{opacity:0;transform:scaleY(1);transition:opacity .1s linear}.p-toggleable-content.ng-animating{overflow:hidden}.p-icon-wrapper{display:inline-flex}.p-icon{display:inline-block}.p-icon-spin{-webkit-animation:p-icon-spin 2s infinite linear;animation:p-icon-spin 2s infinite linear}}@-webkit-keyframes p-icon-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@keyframes p-icon-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@layer primeng{.p-badge{display:inline-block;border-radius:10px;text-align:center;padding:0 .5rem}.p-overlay-badge{position:relative}.p-overlay-badge .p-badge{position:absolute;top:0;right:0;transform:translate(50%,-50%);transform-origin:100% 0;margin:0}.p-badge-dot{width:.5rem;min-width:.5rem;height:.5rem;border-radius:50%;padding:0}.p-badge-no-gutter{padding:0;border-radius:50%}}@layer primeng{.p-button{margin:0;display:inline-flex;cursor:pointer;-webkit-user-select:none;user-select:none;align-items:center;vertical-align:bottom;text-align:center;overflow:hidden;position:relative}.p-button-label{flex:1 1 auto}.p-button-icon-right{order:1}.p-button:disabled{cursor:default;pointer-events:none}.p-button-icon-only{justify-content:center}.p-button-icon-only:after{content:\"p\";visibility:hidden;clip:rect(0 0 0 0);width:0}.p-button-vertical{flex-direction:column}.p-button-icon-bottom{order:2}.p-button-group .p-button{margin:0}.p-button-group .p-button:focus,.p-button-group p-button:focus .p-button,.p-buttonset .p-button:focus,.p-buttonset p-button:focus .p-button{position:relative;z-index:1}.p-button-group .p-button:not(:last-child),.p-button-group .p-button:not(:last-child):hover,.p-button-group p-button:not(:last-child) .p-button,.p-button-group p-button:not(:last-child) .p-button:hover,.p-buttonset .p-button:not(:last-child),.p-buttonset .p-button:not(:last-child):hover,.p-buttonset p-button:not(:last-child) .p-button,.p-buttonset p-button:not(:last-child) .p-button:hover{border-right:0 none}.p-button-group .p-button:not(:first-of-type):not(:last-of-type),.p-button-group p-button:not(:first-of-type):not(:last-of-type) .p-button,.p-buttonset .p-button:not(:first-of-type):not(:last-of-type),.p-buttonset p-button:not(:first-of-type):not(:last-of-type) .p-button{border-radius:0}.p-button-group .p-button:first-of-type:not(:only-of-type),.p-button-group p-button:first-of-type:not(:only-of-type) .p-button,.p-buttonset .p-button:first-of-type:not(:only-of-type),.p-buttonset p-button:first-of-type:not(:only-of-type) .p-button{border-top-right-radius:0;border-bottom-right-radius:0}.p-button-group .p-button:last-of-type:not(:only-of-type),.p-button-group p-button:last-of-type:not(:only-of-type) .p-button,.p-buttonset .p-button:last-of-type:not(:only-of-type),.p-buttonset p-button:last-of-type:not(:only-of-type) .p-button{border-top-left-radius:0;border-bottom-left-radius:0}p-button[iconpos=right] spinnericon{order:1}}@layer primeng{.p-checkbox{display:inline-flex;cursor:pointer;-webkit-user-select:none;user-select:none;vertical-align:bottom;position:relative}.p-checkbox-disabled{cursor:default!important;pointer-events:none}.p-checkbox-box{display:flex;justify-content:center;align-items:center}p-checkbox{display:inline-flex;vertical-align:bottom;align-items:center}.p-checkbox-label{line-height:1}}.p-colorpicker-panel .p-colorpicker-color{background:transparent url(data:image/png;base64,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) no-repeat left top}.p-colorpicker-panel .p-colorpicker-hue{background:transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAACWCAIAAAC3uvTNAAAA7ElEQVRYw+2YUQqDQAxEh9GWuqV6Be9/JT88RN0VRUuv0ElBwhKY3yF5m90kLKd+mF/975r6geNyjm9Fy0kgqTJ6nqoIdGKczjmPJU5tZxA8wWPL7YOHKhZAlcmTAVVcxSCrMbfgqY/H6JEOoASPe56tgSrqLR7U2zWojwWjJ3jq47HEiZoGTwJxP1RRXw8y9RZfCMhbhTHOVTxXnUFtPJ5rGjzu35y2KfKGQxWT2K4TQL1d2zz6KAH1kRU8wfOXx+37qY3Hct+aDaqot2u7R/wMuDS3qnj0z0HqK4X/+kRNHdfUwFP2Nisqe/sFuUZiVjC9HCUAAAAASUVORK5CYII=) no-repeat left top}@layer primeng{.p-inputtext{margin:0}.p-fluid .p-inputtext{width:100%}.p-inputgroup{display:flex;align-items:stretch;width:100%}.p-inputgroup-addon{display:flex;align-items:center;justify-content:center}.p-inputgroup .p-float-label{display:flex;align-items:stretch;width:100%}.p-inputgroup .p-inputtext,.p-fluid .p-inputgroup .p-inputtext,.p-inputgroup .p-inputwrapper,.p-inputgroup .p-inputwrapper>.p-component{flex:1 1 auto;width:1%}.p-float-label{display:block;position:relative}.p-float-label label{position:absolute;pointer-events:none;top:50%;margin-top:-.5rem;transition-property:all;transition-timing-function:ease;line-height:1}.p-float-label textarea~label{top:1rem}.p-float-label input:focus~label,.p-float-label input.p-filled~label,.p-float-label textarea:focus~label,.p-float-label textarea.p-filled~label,.p-float-label .p-inputwrapper-focus~label,.p-float-label .p-inputwrapper-filled~label{top:-.75rem;font-size:12px}.p-float-label .input:-webkit-autofill~label{top:-20px;font-size:12px}.p-float-label .p-placeholder,.p-float-label input::placeholder,.p-float-label .p-inputtext::placeholder{opacity:0;transition-property:all;transition-timing-function:ease}.p-float-label .p-focus .p-placeholder,.p-float-label input:focus::placeholder,.p-float-label .p-inputtext:focus::placeholder{opacity:1;transition-property:all;transition-timing-function:ease}.p-input-icon-left,.p-input-icon-right{position:relative;display:inline-block}.p-input-icon-left>i,.p-input-icon-left>.p-icon-wrapper,.p-input-icon-right>i,.p-input-icon-right>.p-icon-wrapper{position:absolute;top:50%;margin-top:-.5rem}.p-fluid .p-input-icon-left,.p-fluid .p-input-icon-right{display:block;width:100%}}@layer primeng{.p-inputtextarea-resizable{overflow:hidden;resize:none}.p-fluid .p-inputtextarea{width:100%}}@layer primeng{.p-password{position:relative;display:inline-flex}.p-password-panel{position:absolute;top:0;left:0}.p-password .p-password-panel{min-width:100%}.p-password-meter{height:10px}.p-password-strength{height:100%;width:0;transition:width 1s ease-in-out}.p-fluid .p-password{display:flex}.p-password-input::-ms-reveal,.p-password-input::-ms-clear{display:none}.p-password-clear-icon{position:absolute;top:50%;margin-top:-.5rem;cursor:pointer}.p-password .p-icon{cursor:pointer}.p-password-clearable.p-password-mask .p-password-clear-icon{margin-top:unset}.p-password-clearable{position:relative}}@layer primeng{.p-radiobutton{display:inline-flex;cursor:pointer;-webkit-user-select:none;user-select:none;vertical-align:bottom;position:relative}.p-radiobutton-box{display:flex;justify-content:center;align-items:center}.p-radiobutton-icon{-webkit-backface-visibility:hidden;backface-visibility:hidden;transform:translateZ(0) scale(.1);border-radius:50%;visibility:hidden}.p-radiobutton-box.p-highlight .p-radiobutton-icon{transform:translateZ(0) scale(1);visibility:visible}p-radiobutton{display:inline-flex;vertical-align:bottom;align-items:center}.p-radiobutton-label{line-height:1}}@layer primeng{.p-ripple{overflow:hidden;position:relative}.p-ink{display:block;position:absolute;background:#ffffff80;border-radius:100%;transform:scale(0)}.p-ink-active{animation:ripple .4s linear}.p-ripple-disabled .p-ink{display:none!important}}@keyframes ripple{to{opacity:0;transform:scale(2.5)}}@layer primeng{.p-tooltip{position:absolute;display:none;padding:.25em .5rem;max-width:12.5rem;pointer-events:none}.p-tooltip.p-tooltip-right,.p-tooltip.p-tooltip-left{padding:0 .25rem}.p-tooltip.p-tooltip-top,.p-tooltip.p-tooltip-bottom{padding:.25em 0}.p-tooltip .p-tooltip-text{white-space:pre-line;word-break:break-word}.p-tooltip-arrow{scale:2;position:absolute;width:0;height:0;border-color:transparent;border-style:solid}.p-tooltip-right .p-tooltip-arrow{top:50%;left:0;margin-top:-.25rem;border-width:.25em .25em .25em 0}.p-tooltip-left .p-tooltip-arrow{top:50%;right:0;margin-top:-.25rem;border-width:.25em 0 .25em .25rem}.p-tooltip.p-tooltip-top{padding:.25em 0}.p-tooltip-top .p-tooltip-arrow{bottom:0;left:50%;margin-left:-.25rem;border-width:.25em .25em 0}.p-tooltip-bottom .p-tooltip-arrow{top:0;left:50%;margin-left:-.25rem;border-width:0 .25em .25rem}}\n"], dependencies: [{ kind: "directive", type: i7$1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "directive", type: i4.NgSelectOption, selector: "option", inputs: ["ngValue", "value"] }, { kind: "directive", type: i4.ɵNgSelectMultipleOption, selector: "option", inputs: ["ngValue", "value"] }, { kind: "directive", type: i4.DefaultValueAccessor, selector: "input:not([type=checkbox])[formControlName],textarea[formControlName],input:not([type=checkbox])[formControl],textarea[formControl],input:not([type=checkbox])[ngModel],textarea[ngModel],[ngDefaultControl]" }, { kind: "directive", type: i4.NgControlStatus, selector: "[formControlName],[ngModel],[formControl]" }, { kind: "directive", type: i4.NgModel, selector: "[ngModel]:not([formControlName]):not([formControl])", inputs: ["name", "disabled", "ngModel", "ngModelOptions"], outputs: ["ngModelChange"], exportAs: ["ngModel"] }, { kind: "directive", type: i10$1.InputText, selector: "[pInputText]", inputs: ["variant"] }, { kind: "component", type: i10$2.InputGroup, selector: "p-inputGroup", inputs: ["style", "styleClass"] }, { kind: "component", type: i11$1.InputGroupAddon, selector: "p-inputGroupAddon", inputs: ["style", "styleClass"] }, { kind: "directive", type: i4.FormControlDirective, selector: "[formControl]", inputs: ["formControl", "disabled", "ngModel"], outputs: ["ngModelChange"], exportAs: ["ngForm"] }, { kind: "component", type: TreeComponent, selector: "tree-root", inputs: ["treeData", "treeId", "style", "treeStyle"], outputs: ["clickEvent", "dblClickEvent", "rightClickEvent", "panelRightClickEvent"] }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: FileBrowserUSSComponent, decorators: [{
            type: Component,
            args: [{ selector: 'file-browser-uss', encapsulation: ViewEncapsulation.None, providers: [UssCrudService, /*PersistentDataService,*/ SearchHistoryService], template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n\n<div style=\"height: 100%;\">\n\n  <!-- Tabs, searchbar, and loading indicator -->\n  @if (showUpArrow) {\n  <img data-toggle=\"tooltip\" class=\"filebrowseruss-pointer-logo\" title=\"Go up to the parent level\" (click)=\"levelUp()\"\n    [ngStyle]=\"treeStyle\" tabindex=\"0\" (keydown.enter)=\"levelUp()\">\n  }\n\n  <div class=\"filebrowseruss-search\" [ngStyle]=\"searchStyle\">\n    <input #pathInputUSS [(ngModel)]=\"path\" list=\"searchUSSHistory\" placeholder=\"Enter an absolute path...\"\n      [ngStyle]=\"inputStyle\" class=\"filebrowseruss-search-input\" (keydown.enter)=\"displayTree(path, false);\"\n      [disabled]=\"isLoading\" (ngModelChange)=\"checkPathSlash($event)\">\n    <!-- TODO: make search history a directive to use in both uss and mvs-->\n    <datalist id=\"searchUSSHistory\">\n      @for (item of ussSearchHistory.searchHistoryVal; track item) {\n      <option [value]=\"item\"></option>\n      }\n    </datalist>\n  </div>\n  <div class=\"fa fa-spinner fa-spin filebrowseruss-loading-icon\" [hidden]=\"!isLoading\" style=\"margin-left: 9px;\"></div>\n  <div class=\"fa fa-refresh filebrowseruss-loading-icon\" title=\"Refresh whole directory\"\n    (click)=\"displayTree(path, false);\" [hidden]=\"isLoading\" style=\"margin-left: 9px; cursor: pointer;\"></div>\n  <div class=\"file-tree-utilities\">\n    <div class=\"fa fa-minus-square-o filebrowser-icon\" title=\"Collapse Folders in Explorer\" (click)=\"collapseTree();\">\n    </div>\n    <div class=\"fa fa-trash-o filebrowser-icon\" title=\"Delete\" (click)=\"showDeleteDialog(selectedNode);\"></div>\n    <div class=\"fa fa-folder-o filebrowser-icon\" title=\"Create New Folder\"\n      (click)=\"showCreateFolderDialog(!selectedNode || (!selectedNode.parent && !selectedNode.directory) ? { 'path' : path } : selectedNode.directory ? selectedNode : selectedNode.parent);\">\n    </div>\n    <div class=\"fa fa-eraser filebrowser-icon special-utility\" title=\"Clear Search History\"\n      (click)=\"clearSearchHistory();\"></div>\n  </div>\n\n  <!-- Main tree -->\n  <div [hidden]=\"hideExplorer\" style=\"height: 100%;\">\n    <tree-root [treeData]=\"data\" (clickEvent)=\"onNodeClick($event)\" (dblClickEvent)=\"onNodeDblClick($event)\"\n      [ngStyle]=\"treeStyle\" (rightClickEvent)=\"onNodeRightClick($event)\"\n      (panelRightClickEvent)=\"onPanelRightClick($event)\" (dataChanged)=\"onDataChanged($event)\"></tree-root>\n  </div>\n\n  @if (showSearch) {\n  <div class=\"filebrowseruss-search-bottom-group\">\n    <p-inputGroup>\n      <p-inputGroupAddon>\n        <i class=\"fa fa-search filebrowseruss-search-bottom-icon\"></i>\n      </p-inputGroupAddon>\n      <input type=\"text\" pInputText placeholder=\"Search opened files/folders by name...\"\n        class=\"filebrowseruss-search-bottom-input\" [formControl]=\"searchCtrl\" #searchUSS>\n    </p-inputGroup>\n  </div>\n  }\n\n</div>\n\n<!--\n    This program and the accompanying materials are\n    made available under the terms of the Eclipse Public License v2.0 which accompanies\n    this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\n    SPDX-License-Identifier: EPL-2.0\n\n    Copyright Contributors to the Zowe Project.\n    -->", styles: [".filebrowseruss-search{width:fit-content;min-width:250px;margin-left:5px;display:inline-block;height:40px}.filebrowseruss-search-input{width:100%;min-height:30px;font-family:sans-serif;font-size:15px;height:35px;background-color:#464646;color:#fff;padding-left:5px;border:0px}.filebrowseruss-search-bottom-group{margin-top:-17px;position:relative}.filebrowseruss-search-bottom-icon{font-size:large;position:absolute;color:#d4d4d4;padding-left:5px}.filebrowseruss-search-bottom-input{padding-left:28px;width:calc(100% - 5px);min-height:30px;font-family:sans-serif;font-size:15px;height:35px;background-color:#313030;color:#fff;border:0px;margin-top:-10px}.filebrowseruss-search-bottom-input:focus{outline:none;border:1px solid rgb(161,160,160);border-radius:3px}.filebrowseruss-dialog-menu{background:#fff;padding:0;height:auto;width:auto}.filebrowseruss-pointer-logo{content:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsSAAALEgHS3X78AAAA2UlEQVQ4y7XRwUkEQRSE4c9xDcAEFCYFYzCFCaGDavQgeDOEWTQBA1AQ9KCgpxUEQVh3vLyBgdnuw4APGprqqp96NP85KaU2pdTWPE0tjB73NUhTCd+ixTHuSpCmEO5xil2cE/T7IE0h3OIBWwx4Cm0GaQrhNS5xEIDr0GaQaYNx3zU6fAegiXs3gZzNADnnMdjlnDch76LBEFqH85zzzZhbTfcJyL4VD+N9Ey3q3xjzO/FsS6ZVBTDECpYCPvATDd6XAF7xEp63JYBnXOAIj0sAn7iK+1fJ9AcOn0qIhbHEXwAAAABJRU5ErkJggg==);width:20px;height:20px;filter:brightness(3);cursor:pointer}.filebrowseruss-node-deleting{opacity:.5}.filebrowseruss-loading-icon{margin-left:8px!important;font-size:large!important}.file-tree-utilities{overflow:hidden;border:1px solid #464646}.filebrowser-icon{margin-right:9px;float:right;cursor:pointer}.special-utility{margin-left:9px}.p-inputgroup-addon{align-items:flex-start!important}\n", ".p-overflow-hidden{overflow:hidden;padding-right:var(--scrollbar-width)}@layer primeng{.p-component,.p-component *{box-sizing:border-box}.p-hidden{display:none}.p-hidden-space{visibility:hidden}.p-hidden-accessible{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.p-hidden-accessible input,.p-hidden-accessible select{transform:scale(0)}.p-reset{margin:0;padding:0;border:0;outline:0;text-decoration:none;font-size:100%;list-style:none}.p-disabled,.p-disabled *{cursor:default!important;pointer-events:none}.p-component-overlay{position:fixed;top:0;left:0;width:100%;height:100%}.p-unselectable-text{-webkit-user-select:none;user-select:none}.p-scrollbar-measure{width:100px;height:100px;overflow:scroll;position:absolute;top:-9999px}@-webkit-keyframes p-fadein{0%{opacity:0}to{opacity:1}}@keyframes p-fadein{0%{opacity:0}to{opacity:1}}input[type=button],input[type=submit],input[type=reset],input[type=file]::-webkit-file-upload-button,button{border-radius:0}.p-link{text-align:left;background-color:transparent;margin:0;padding:0;border:0;cursor:pointer;-webkit-user-select:none;user-select:none}.p-link:disabled{cursor:default}.p-sr-only{border:0;clip:rect(1px,1px,1px,1px);clip-path:inset(50%);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px;word-wrap:normal!important}.p-connected-overlay{opacity:0;transform:scaleY(.8);transition:transform .12s cubic-bezier(0,0,.2,1),opacity .12s cubic-bezier(0,0,.2,1)}.p-connected-overlay-visible{opacity:1;transform:scaleY(1)}.p-connected-overlay-hidden{opacity:0;transform:scaleY(1);transition:opacity .1s linear}.p-toggleable-content.ng-animating{overflow:hidden}.p-icon-wrapper{display:inline-flex}.p-icon{display:inline-block}.p-icon-spin{-webkit-animation:p-icon-spin 2s infinite linear;animation:p-icon-spin 2s infinite linear}}@-webkit-keyframes p-icon-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@keyframes p-icon-spin{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(359deg);transform:rotate(359deg)}}@layer primeng{.p-badge{display:inline-block;border-radius:10px;text-align:center;padding:0 .5rem}.p-overlay-badge{position:relative}.p-overlay-badge .p-badge{position:absolute;top:0;right:0;transform:translate(50%,-50%);transform-origin:100% 0;margin:0}.p-badge-dot{width:.5rem;min-width:.5rem;height:.5rem;border-radius:50%;padding:0}.p-badge-no-gutter{padding:0;border-radius:50%}}@layer primeng{.p-button{margin:0;display:inline-flex;cursor:pointer;-webkit-user-select:none;user-select:none;align-items:center;vertical-align:bottom;text-align:center;overflow:hidden;position:relative}.p-button-label{flex:1 1 auto}.p-button-icon-right{order:1}.p-button:disabled{cursor:default;pointer-events:none}.p-button-icon-only{justify-content:center}.p-button-icon-only:after{content:\"p\";visibility:hidden;clip:rect(0 0 0 0);width:0}.p-button-vertical{flex-direction:column}.p-button-icon-bottom{order:2}.p-button-group .p-button{margin:0}.p-button-group .p-button:focus,.p-button-group p-button:focus .p-button,.p-buttonset .p-button:focus,.p-buttonset p-button:focus .p-button{position:relative;z-index:1}.p-button-group .p-button:not(:last-child),.p-button-group .p-button:not(:last-child):hover,.p-button-group p-button:not(:last-child) .p-button,.p-button-group p-button:not(:last-child) .p-button:hover,.p-buttonset .p-button:not(:last-child),.p-buttonset .p-button:not(:last-child):hover,.p-buttonset p-button:not(:last-child) .p-button,.p-buttonset p-button:not(:last-child) .p-button:hover{border-right:0 none}.p-button-group .p-button:not(:first-of-type):not(:last-of-type),.p-button-group p-button:not(:first-of-type):not(:last-of-type) .p-button,.p-buttonset .p-button:not(:first-of-type):not(:last-of-type),.p-buttonset p-button:not(:first-of-type):not(:last-of-type) .p-button{border-radius:0}.p-button-group .p-button:first-of-type:not(:only-of-type),.p-button-group p-button:first-of-type:not(:only-of-type) .p-button,.p-buttonset .p-button:first-of-type:not(:only-of-type),.p-buttonset p-button:first-of-type:not(:only-of-type) .p-button{border-top-right-radius:0;border-bottom-right-radius:0}.p-button-group .p-button:last-of-type:not(:only-of-type),.p-button-group p-button:last-of-type:not(:only-of-type) .p-button,.p-buttonset .p-button:last-of-type:not(:only-of-type),.p-buttonset p-button:last-of-type:not(:only-of-type) .p-button{border-top-left-radius:0;border-bottom-left-radius:0}p-button[iconpos=right] spinnericon{order:1}}@layer primeng{.p-checkbox{display:inline-flex;cursor:pointer;-webkit-user-select:none;user-select:none;vertical-align:bottom;position:relative}.p-checkbox-disabled{cursor:default!important;pointer-events:none}.p-checkbox-box{display:flex;justify-content:center;align-items:center}p-checkbox{display:inline-flex;vertical-align:bottom;align-items:center}.p-checkbox-label{line-height:1}}.p-colorpicker-panel .p-colorpicker-color{background:transparent url(data:image/png;base64,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) no-repeat left top}.p-colorpicker-panel .p-colorpicker-hue{background:transparent url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAACWCAIAAAC3uvTNAAAA7ElEQVRYw+2YUQqDQAxEh9GWuqV6Be9/JT88RN0VRUuv0ElBwhKY3yF5m90kLKd+mF/975r6geNyjm9Fy0kgqTJ6nqoIdGKczjmPJU5tZxA8wWPL7YOHKhZAlcmTAVVcxSCrMbfgqY/H6JEOoASPe56tgSrqLR7U2zWojwWjJ3jq47HEiZoGTwJxP1RRXw8y9RZfCMhbhTHOVTxXnUFtPJ5rGjzu35y2KfKGQxWT2K4TQL1d2zz6KAH1kRU8wfOXx+37qY3Hct+aDaqot2u7R/wMuDS3qnj0z0HqK4X/+kRNHdfUwFP2Nisqe/sFuUZiVjC9HCUAAAAASUVORK5CYII=) no-repeat left top}@layer primeng{.p-inputtext{margin:0}.p-fluid .p-inputtext{width:100%}.p-inputgroup{display:flex;align-items:stretch;width:100%}.p-inputgroup-addon{display:flex;align-items:center;justify-content:center}.p-inputgroup .p-float-label{display:flex;align-items:stretch;width:100%}.p-inputgroup .p-inputtext,.p-fluid .p-inputgroup .p-inputtext,.p-inputgroup .p-inputwrapper,.p-inputgroup .p-inputwrapper>.p-component{flex:1 1 auto;width:1%}.p-float-label{display:block;position:relative}.p-float-label label{position:absolute;pointer-events:none;top:50%;margin-top:-.5rem;transition-property:all;transition-timing-function:ease;line-height:1}.p-float-label textarea~label{top:1rem}.p-float-label input:focus~label,.p-float-label input.p-filled~label,.p-float-label textarea:focus~label,.p-float-label textarea.p-filled~label,.p-float-label .p-inputwrapper-focus~label,.p-float-label .p-inputwrapper-filled~label{top:-.75rem;font-size:12px}.p-float-label .input:-webkit-autofill~label{top:-20px;font-size:12px}.p-float-label .p-placeholder,.p-float-label input::placeholder,.p-float-label .p-inputtext::placeholder{opacity:0;transition-property:all;transition-timing-function:ease}.p-float-label .p-focus .p-placeholder,.p-float-label input:focus::placeholder,.p-float-label .p-inputtext:focus::placeholder{opacity:1;transition-property:all;transition-timing-function:ease}.p-input-icon-left,.p-input-icon-right{position:relative;display:inline-block}.p-input-icon-left>i,.p-input-icon-left>.p-icon-wrapper,.p-input-icon-right>i,.p-input-icon-right>.p-icon-wrapper{position:absolute;top:50%;margin-top:-.5rem}.p-fluid .p-input-icon-left,.p-fluid .p-input-icon-right{display:block;width:100%}}@layer primeng{.p-inputtextarea-resizable{overflow:hidden;resize:none}.p-fluid .p-inputtextarea{width:100%}}@layer primeng{.p-password{position:relative;display:inline-flex}.p-password-panel{position:absolute;top:0;left:0}.p-password .p-password-panel{min-width:100%}.p-password-meter{height:10px}.p-password-strength{height:100%;width:0;transition:width 1s ease-in-out}.p-fluid .p-password{display:flex}.p-password-input::-ms-reveal,.p-password-input::-ms-clear{display:none}.p-password-clear-icon{position:absolute;top:50%;margin-top:-.5rem;cursor:pointer}.p-password .p-icon{cursor:pointer}.p-password-clearable.p-password-mask .p-password-clear-icon{margin-top:unset}.p-password-clearable{position:relative}}@layer primeng{.p-radiobutton{display:inline-flex;cursor:pointer;-webkit-user-select:none;user-select:none;vertical-align:bottom;position:relative}.p-radiobutton-box{display:flex;justify-content:center;align-items:center}.p-radiobutton-icon{-webkit-backface-visibility:hidden;backface-visibility:hidden;transform:translateZ(0) scale(.1);border-radius:50%;visibility:hidden}.p-radiobutton-box.p-highlight .p-radiobutton-icon{transform:translateZ(0) scale(1);visibility:visible}p-radiobutton{display:inline-flex;vertical-align:bottom;align-items:center}.p-radiobutton-label{line-height:1}}@layer primeng{.p-ripple{overflow:hidden;position:relative}.p-ink{display:block;position:absolute;background:#ffffff80;border-radius:100%;transform:scale(0)}.p-ink-active{animation:ripple .4s linear}.p-ripple-disabled .p-ink{display:none!important}}@keyframes ripple{to{opacity:0;transform:scale(2.5)}}@layer primeng{.p-tooltip{position:absolute;display:none;padding:.25em .5rem;max-width:12.5rem;pointer-events:none}.p-tooltip.p-tooltip-right,.p-tooltip.p-tooltip-left{padding:0 .25rem}.p-tooltip.p-tooltip-top,.p-tooltip.p-tooltip-bottom{padding:.25em 0}.p-tooltip .p-tooltip-text{white-space:pre-line;word-break:break-word}.p-tooltip-arrow{scale:2;position:absolute;width:0;height:0;border-color:transparent;border-style:solid}.p-tooltip-right .p-tooltip-arrow{top:50%;left:0;margin-top:-.25rem;border-width:.25em .25em .25em 0}.p-tooltip-left .p-tooltip-arrow{top:50%;right:0;margin-top:-.25rem;border-width:.25em 0 .25em .25rem}.p-tooltip.p-tooltip-top{padding:.25em 0}.p-tooltip-top .p-tooltip-arrow{bottom:0;left:50%;margin-left:-.25rem;border-width:.25em .25em 0}.p-tooltip-bottom .p-tooltip-arrow{top:0;left:50%;margin-left:-.25rem;border-width:0 .25em .25rem}}\n"] }]
        }], ctorParameters: () => [{ type: i0.ElementRef }, { type: UssCrudService }, { type: UtilsService }, { type: SearchHistoryService }, { type: i1.MatDialog }, { type: i3$1.MatSnackBar }, { type: DownloaderService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.LOGGER]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.LAUNCH_METADATA]
                }] }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.PLUGIN_DEFINITION]
                }] }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [Angular2InjectionTokens.WINDOW_ACTIONS]
                }] }], propDecorators: { treeComponent: [{
                type: ViewChild,
                args: [TreeComponent]
            }], pathInputUSS: [{
                type: ViewChild,
                args: ['pathInputUSS']
            }], searchUSS: [{
                type: ViewChild,
                args: ['searchUSS']
            }], pathChanged: [{
                type: Output
            }], dataChanged: [{
                type: Output
            }], nodeClick: [{
                type: Output
            }], nodeDblClick: [{
                type: Output
            }], nodeRightClick: [{
                type: Output
            }], newFolderClick: [{
                type: Output
            }], newFileClick: [{
                type: Output
            }], fileUploaded: [{
                type: Output
            }], copyClick: [{
                type: Output
            }], deleteClick: [{
                type: Output
            }], ussRenameEvent: [{
                type: Output
            }], rightClick: [{
                type: Output
            }], openInNewTab: [{
                type: Output
            }], inputStyle: [{
                type: Input
            }], searchStyle: [{
                type: Input
            }], treeStyle: [{
                type: Input
            }], showUpArrow: [{
                type: Input
            }] } });

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
class KeybindingService {
    constructor() {
        this.keyupEvent = new Subject();
        this.keydownEvent = new Subject();
    }
    registerKeyUpEvent(appChild) {
        let elm = appChild.closest('div.window');
        fromEvent(elm, 'keyup').pipe(filter(value => value.altKey))
            .subscribe(value => this.keyupEvent.next(value));
    }
    registerKeyDownEvent(appChild) {
        let elm = appChild.closest('div.window');
        fromEvent(elm, 'keydown').pipe(filter(value => value.altKey))
            .subscribe(value => this.keydownEvent.next(value));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: KeybindingService, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: KeybindingService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: KeybindingService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [] });
var KeyCode;
(function (KeyCode) {
    KeyCode[KeyCode["BACKSPACE"] = 8] = "BACKSPACE";
    KeyCode[KeyCode["TAB"] = 9] = "TAB";
    KeyCode[KeyCode["ENTER"] = 13] = "ENTER";
    KeyCode[KeyCode["SHIFT"] = 16] = "SHIFT";
    KeyCode[KeyCode["CTRL"] = 17] = "CTRL";
    KeyCode[KeyCode["ALT"] = 18] = "ALT";
    KeyCode[KeyCode["PAUSE"] = 19] = "PAUSE";
    KeyCode[KeyCode["CAPS_LOCK"] = 20] = "CAPS_LOCK";
    KeyCode[KeyCode["ESCAPE"] = 27] = "ESCAPE";
    KeyCode[KeyCode["SPACE"] = 32] = "SPACE";
    KeyCode[KeyCode["PAGE_UP"] = 33] = "PAGE_UP";
    KeyCode[KeyCode["PAGE_DOWN"] = 34] = "PAGE_DOWN";
    KeyCode[KeyCode["END"] = 35] = "END";
    KeyCode[KeyCode["HOME"] = 36] = "HOME";
    KeyCode[KeyCode["LEFT_ARROW"] = 37] = "LEFT_ARROW";
    KeyCode[KeyCode["UP_ARROW"] = 38] = "UP_ARROW";
    KeyCode[KeyCode["RIGHT_ARROW"] = 39] = "RIGHT_ARROW";
    KeyCode[KeyCode["DOWN_ARROW"] = 40] = "DOWN_ARROW";
    KeyCode[KeyCode["INSERT"] = 45] = "INSERT";
    KeyCode[KeyCode["DELETE"] = 46] = "DELETE";
    KeyCode[KeyCode["KEY_0"] = 48] = "KEY_0";
    KeyCode[KeyCode["KEY_1"] = 49] = "KEY_1";
    KeyCode[KeyCode["KEY_2"] = 50] = "KEY_2";
    KeyCode[KeyCode["KEY_3"] = 51] = "KEY_3";
    KeyCode[KeyCode["KEY_4"] = 52] = "KEY_4";
    KeyCode[KeyCode["KEY_5"] = 53] = "KEY_5";
    KeyCode[KeyCode["KEY_6"] = 54] = "KEY_6";
    KeyCode[KeyCode["KEY_7"] = 55] = "KEY_7";
    KeyCode[KeyCode["KEY_8"] = 56] = "KEY_8";
    KeyCode[KeyCode["KEY_9"] = 57] = "KEY_9";
    KeyCode[KeyCode["KEY_A"] = 65] = "KEY_A";
    KeyCode[KeyCode["KEY_B"] = 66] = "KEY_B";
    KeyCode[KeyCode["KEY_C"] = 67] = "KEY_C";
    KeyCode[KeyCode["KEY_D"] = 68] = "KEY_D";
    KeyCode[KeyCode["KEY_E"] = 69] = "KEY_E";
    KeyCode[KeyCode["KEY_F"] = 70] = "KEY_F";
    KeyCode[KeyCode["KEY_G"] = 71] = "KEY_G";
    KeyCode[KeyCode["KEY_H"] = 72] = "KEY_H";
    KeyCode[KeyCode["KEY_I"] = 73] = "KEY_I";
    KeyCode[KeyCode["KEY_J"] = 74] = "KEY_J";
    KeyCode[KeyCode["KEY_K"] = 75] = "KEY_K";
    KeyCode[KeyCode["KEY_L"] = 76] = "KEY_L";
    KeyCode[KeyCode["KEY_M"] = 77] = "KEY_M";
    KeyCode[KeyCode["KEY_N"] = 78] = "KEY_N";
    KeyCode[KeyCode["KEY_O"] = 79] = "KEY_O";
    KeyCode[KeyCode["KEY_P"] = 80] = "KEY_P";
    KeyCode[KeyCode["KEY_Q"] = 81] = "KEY_Q";
    KeyCode[KeyCode["KEY_R"] = 82] = "KEY_R";
    KeyCode[KeyCode["KEY_S"] = 83] = "KEY_S";
    KeyCode[KeyCode["KEY_T"] = 84] = "KEY_T";
    KeyCode[KeyCode["KEY_U"] = 85] = "KEY_U";
    KeyCode[KeyCode["KEY_V"] = 86] = "KEY_V";
    KeyCode[KeyCode["KEY_W"] = 87] = "KEY_W";
    KeyCode[KeyCode["KEY_X"] = 88] = "KEY_X";
    KeyCode[KeyCode["KEY_Y"] = 89] = "KEY_Y";
    KeyCode[KeyCode["KEY_Z"] = 90] = "KEY_Z";
    KeyCode[KeyCode["LEFT_META"] = 91] = "LEFT_META";
    KeyCode[KeyCode["RIGHT_META"] = 92] = "RIGHT_META";
    KeyCode[KeyCode["SELECT"] = 93] = "SELECT";
    KeyCode[KeyCode["NUMPAD_0"] = 96] = "NUMPAD_0";
    KeyCode[KeyCode["NUMPAD_1"] = 97] = "NUMPAD_1";
    KeyCode[KeyCode["NUMPAD_2"] = 98] = "NUMPAD_2";
    KeyCode[KeyCode["NUMPAD_3"] = 99] = "NUMPAD_3";
    KeyCode[KeyCode["NUMPAD_4"] = 100] = "NUMPAD_4";
    KeyCode[KeyCode["NUMPAD_5"] = 101] = "NUMPAD_5";
    KeyCode[KeyCode["NUMPAD_6"] = 102] = "NUMPAD_6";
    KeyCode[KeyCode["NUMPAD_7"] = 103] = "NUMPAD_7";
    KeyCode[KeyCode["NUMPAD_8"] = 104] = "NUMPAD_8";
    KeyCode[KeyCode["NUMPAD_9"] = 105] = "NUMPAD_9";
    KeyCode[KeyCode["MULTIPLY"] = 106] = "MULTIPLY";
    KeyCode[KeyCode["ADD"] = 107] = "ADD";
    KeyCode[KeyCode["SUBTRACT"] = 109] = "SUBTRACT";
    KeyCode[KeyCode["DECIMAL"] = 110] = "DECIMAL";
    KeyCode[KeyCode["DIVIDE"] = 111] = "DIVIDE";
    KeyCode[KeyCode["F1"] = 112] = "F1";
    KeyCode[KeyCode["F2"] = 113] = "F2";
    KeyCode[KeyCode["F3"] = 114] = "F3";
    KeyCode[KeyCode["F4"] = 115] = "F4";
    KeyCode[KeyCode["F5"] = 116] = "F5";
    KeyCode[KeyCode["F6"] = 117] = "F6";
    KeyCode[KeyCode["F7"] = 118] = "F7";
    KeyCode[KeyCode["F8"] = 119] = "F8";
    KeyCode[KeyCode["F9"] = 120] = "F9";
    KeyCode[KeyCode["F10"] = 121] = "F10";
    KeyCode[KeyCode["F11"] = 122] = "F11";
    KeyCode[KeyCode["F12"] = 123] = "F12";
    KeyCode[KeyCode["NUM_LOCK"] = 144] = "NUM_LOCK";
    KeyCode[KeyCode["SCROLL_LOCK"] = 145] = "SCROLL_LOCK";
    KeyCode[KeyCode["SEMICOLON"] = 186] = "SEMICOLON";
    KeyCode[KeyCode["EQUALS"] = 187] = "EQUALS";
    KeyCode[KeyCode["COMMA"] = 188] = "COMMA";
    KeyCode[KeyCode["DASH"] = 189] = "DASH";
    KeyCode[KeyCode["PERIOD"] = 190] = "PERIOD";
    KeyCode[KeyCode["FORWARD_SLASH"] = 191] = "FORWARD_SLASH";
    KeyCode[KeyCode["GRAVE_ACCENT"] = 192] = "GRAVE_ACCENT";
    KeyCode[KeyCode["OPEN_BRACKET"] = 219] = "OPEN_BRACKET";
    KeyCode[KeyCode["BACK_SLASH"] = 220] = "BACK_SLASH";
    KeyCode[KeyCode["CLOSE_BRACKET"] = 221] = "CLOSE_BRACKET";
    KeyCode[KeyCode["SINGLE_QUOTE"] = 222] = "SINGLE_QUOTE";
})(KeyCode || (KeyCode = {}));

class ZluxFileTreeComponent {
    constructor(/*private persistentDataService: PersistentDataService,*/ utils, elemRef, cd, appKeyboard, log) {
        this.utils = utils;
        this.elemRef = elemRef;
        this.cd = cd;
        this.appKeyboard = appKeyboard;
        this.log = log;
        this.keyBindingSub = new Subscription();
        this.style = {};
        this.headerStyle = {};
        this.inputStyle = {};
        this.searchStyle = {};
        this.treeStyle = {};
        this.fileOutput = new EventEmitter();
        this.nodeClick = new EventEmitter();
        this.nodeDblClick = new EventEmitter();
        this.newFolderClick = new EventEmitter();
        this.fileUploaded = new EventEmitter();
        // @Output() newFileClick: EventEmitter<any> = new EventEmitter<any>();
        this.copyClick = new EventEmitter();
        this.deleteClick = new EventEmitter();
        this.ussRenameEvent = new EventEmitter();
        this.datasetSelect = new EventEmitter();
        this.ussSelect = new EventEmitter();
        this.pathChanged = new EventEmitter();
        this.dataChanged = new EventEmitter();
        this.rightClick = new EventEmitter();
        this.openInNewTab = new EventEmitter();
        this.createDataset = new EventEmitter();
        //this.componentClass = ComponentClass.FileBrowser;
        this.currentIndex = 0;
        this.tabs = [{ index: 0, name: "USS" }, { index: 1, name: "Datasets" }];
        this.showUpArrow = true;
    }
    set spawnModal(typeAndData) {
        if (typeAndData == undefined) {
            return;
        }
        let type = typeAndData.type;
        let data = typeAndData.data;
        let isDataset = (data.data && data.data.datasetAttrs) ? true : false;
        switch (type) {
            case 'properties':
                isDataset ? this.mvsComponent.showPropertiesDialog(data) : this.ussComponent.showPropertiesDialog(data);
                break;
            case 'delete':
                isDataset ? this.mvsComponent.showDeleteDialog(data) : this.ussComponent.showDeleteDialog(data);
                break;
            case 'createFolder':
                !isDataset && this.ussComponent.showCreateFolderDialog(data);
                break;
            case 'requestUpload':
                !isDataset && this.ussComponent.showUploadDialog(data);
                break;
            case 'createDataset':
                this.mvsComponent.createDatasetDialog(data);
                break;
            case 'changeOwners':
                this.ussComponent.showOwnerDialog(data);
                break;
            case 'tagFile':
                this.ussComponent.showTaggingDialog(data);
                break;
            case 'changePermissions':
                this.ussComponent.showPermissionsDialog(data);
                break;
            case 'createFile':
                this.ussComponent.showCreateFileDialog(data);
                break;
            default:
                //invalid type
                this.log.warn(`Unsuccessful in spawning modal for type: `, type);
                break;
        }
    }
    set toggleSearchInput(value) {
        if (value) {
            if (value.path.startsWith("/")) {
                if (this.ussComponent) {
                    this.ussComponent.toggleSearch();
                }
            }
            else {
                if (this.mvsComponent) {
                    this.mvsComponent.toggleSearch();
                }
            }
        }
    }
    ngOnInit() {
        // var obj = {
        //   "ussInput": "",
        //   "mvsInput": "",
        //   "ussData": [],
        //   "mvsData": []
        // }
        // this.persistentDataService.setData(obj)
        //   .subscribe((res: any) => { });
        switch (this.theme) {
            case 'carbon': {
                this.headerStyle = {
                    'background-color': '#3d70b2',
                    'color': 'white',
                    'width': '99.7%',
                    'text-align': 'right'
                };
                this.inputStyle = {
                    'background-color': '#eee',
                    'color': 'black',
                    'border': '2px solid #3d70b2',
                    'margin-top': '20px'
                };
                this.searchStyle = {
                    'min-width': '250px',
                    'display': 'inline-block',
                    'height': '40px',
                    'width': '90%',
                };
                this.treeStyle = {
                    'color': '#646464'
                };
                this.style = {
                    'background-color': '#F4F7FB',
                    'margin-top': '10px',
                    'max-height': '320px',
                    'overflow-y': 'scroll',
                    'padding': '0px',
                    'margin-left': '0px'
                };
                break;
            }
            default: {
                this.treeStyle = { 'filter': 'brightness(3)', 'color': 'white' };
                break;
            }
        }
        const fileExplorerGlobalElement = this.fileExplorerGlobal.nativeElement;
        this.appKeyboard.registerKeyUpEvent(fileExplorerGlobalElement);
        this.appKeyboard.registerKeyDownEvent(fileExplorerGlobalElement);
        this.keyBindingSub.add(this.appKeyboard.keydownEvent
            .subscribe((event) => {
            if (event.which === KeyCode.KEY_P && !event.ctrlKey) {
                this.toggleSearch();
            }
        }));
    }
    ngOnDestroy() {
        // let dataObject = {mvsData:Array<MvsDataObject>(), ussData:Array<UssDataObject>()};
        // this.persistentDataService.getData()
        //   .subscribe(data => {
        //     dataObject = data.contents;
        //     dataObject.mvsData = [];
        //     dataObject.ussData = [];
        //     //console.log(JSON.stringify(dataObject))
        //     this.persistentDataService.setData(dataObject)
        //       .subscribe((res: any) => { });
        //   })
    }
    onCreateDataset($event) {
        // Event to tell if the dataset creation is successful or not
        this.createDataset.emit($event);
    }
    deleteFileOrFolder(pathAndName) {
        this.ussComponent.deleteFileOrFolder(pathAndName);
    }
    createDirectory(pathAndName) {
        if (pathAndName) {
            this.ussComponent.showCreateFolderDialog(pathAndName);
        }
        else {
            this.ussComponent.showCreateFolderDialog(this.ussComponent.getSelectedPath());
        }
    }
    getActiveDirectory() {
        if (this.currentIndex == 0) {
            return this.ussComponent.getSelectedPath();
        }
        else { //Datasets do not yet have an active directory context
            return null;
        }
    }
    hideExplorers() {
        if (this.ussComponent) {
            this.ussComponent.hideExplorer = true;
        }
        if (this.mvsComponent) {
            this.mvsComponent.hideExplorer = true;
        }
    }
    toggleSearch() {
        if (this.currentIndex == 0) {
            this.ussComponent.toggleSearch();
        }
        else {
            this.mvsComponent.toggleSearch();
        }
    }
    displayUpArrow(show) {
        this.showUpArrow = show;
    }
    onCopyClick($event) {
        this.copyClick.emit($event);
    }
    onDeleteClick($event) {
        this.deleteClick.emit($event);
    }
    onUSSRenameEvent($event) {
        this.ussRenameEvent.emit($event);
    }
    // onNewFileClick($event:any){
    //   this.newFileClick.emit($event);
    // }
    onNewFolderClick($event) {
        this.newFolderClick.emit($event);
    }
    onFileUploaded($event) {
        this.fileUploaded.emit($event);
    }
    onNodeClick($event) {
        this.nodeClick.emit($event);
    }
    onNodeDblClick($event) {
        this.nodeDblClick.emit($event);
    }
    onPathChanged($event) {
        this.pathChanged.emit($event);
    }
    onDataChanged($event) {
        this.dataChanged.emit($event);
    }
    onRightClick($event) {
        this.rightClick.emit($event);
    }
    onOpenInNewTab($event) {
        this.openInNewTab.emit($event);
    }
    // onUssFileLoad($event:FileContents){
    //   this.fileOutput.emit($event);
    // }
    provideZLUXDispatcherCallbacks() {
        return {
            onMessage: (eventContext) => {
                return this.zluxOnMessage(eventContext);
            }
        };
    }
    setIndex(inputIndex) {
        this.currentIndex = inputIndex;
        if (this.currentIndex == 0) {
            this.ussSelect.emit();
        }
        else {
            this.datasetSelect.emit();
        }
    }
    showDatasets() {
        this.currentIndex = 1;
        if (this.mvsComponent) {
            this.mvsComponent.hideExplorer = false;
        }
    }
    showUss() {
        this.currentIndex = 0;
        if (this.ussComponent) {
            this.ussComponent.hideExplorer = false;
        }
    }
    spawnUploadModal() {
        if (this.ussComponent) {
            this.ussComponent.showUploadDialog(null);
        }
        else {
            // ... Disabled for DS mode for now
        }
    }
    updateDirectory(dirName) {
        this.showUss();
        this.ussComponent.updateUss(dirName);
    }
    updateDSList(query) {
        this.showDatasets();
        this.mvsComponent.setPath(query);
        this.mvsComponent.updateTreeView(query);
    }
    refreshFileMetadatdaByPath(path) {
        return this.ussComponent.refreshFileMetadatdaUsingPath(path);
    }
    zluxOnMessage(eventContext) {
        return new Promise((resolve, reject) => {
            if (!eventContext || !eventContext.action) {
                return reject('Event context missing or malformed');
            }
            if (eventContext.action === 'save-file') {
                // This is no longer needed as Editor takes over any file edit/context functions.
                // this.parentUssEdit = eventContext;
                // console.log("parentUssEdit:" + this.parentUssEdit)
                //TODO:throw this down to FileBrowserUSSComponent
                resolve();
            }
            // else if (eventContext.action === 'open-file'){
            //   if (!eventContext.filePath || !eventContext.fileName || !eventContext.fileContents) {
            //     return reject('Event context missing or malformed');
            //   }
            //   this.initMonaco(eventContext);
            // }
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: ZluxFileTreeComponent, deps: [{ token: UtilsService }, { token: i0.ElementRef }, { token: i0.ChangeDetectorRef }, { token: KeybindingService }, { token: Angular2InjectionTokens.LOGGER }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "17.0.0", version: "18.0.7", type: ZluxFileTreeComponent, selector: "zlux-file-tree", inputs: { spawnModal: "spawnModal", toggleSearchInput: "toggleSearchInput", selectPath: "selectPath", style: "style", headerStyle: "headerStyle", inputStyle: "inputStyle", searchStyle: "searchStyle", treeStyle: "treeStyle", theme: "theme" }, outputs: { fileOutput: "fileOutput", nodeClick: "nodeClick", nodeDblClick: "nodeDblClick", newFolderClick: "newFolderClick", fileUploaded: "fileUploaded", copyClick: "copyClick", deleteClick: "deleteClick", ussRenameEvent: "ussRenameEvent", datasetSelect: "datasetSelect", ussSelect: "ussSelect", pathChanged: "pathChanged", dataChanged: "dataChanged", rightClick: "rightClick", openInNewTab: "openInNewTab", createDataset: "createDataset" }, providers: [UtilsService /*, PersistentDataService*/], viewQueries: [{ propertyName: "ussComponent", first: true, predicate: FileBrowserUSSComponent, descendants: true }, { propertyName: "mvsComponent", first: true, predicate: FileBrowserMVSComponent, descendants: true }, { propertyName: "fileExplorerGlobal", first: true, predicate: ["fileExplorerGlobal"], descendants: true, static: true }], ngImport: i0, template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n\n<div class=\"fileexplorer-global\" #fileExplorerGlobal>\n  <nav data-tabs class=\"fileexplorer-tabs\" role=\"navigation\">\n    <div class=\"fileexplorer-tabs-trigger\" tabindex=\"-1\">\n      <a href=\"javascript:void(0)\" class=\"bx--tabs-trigger-text\" tabindex=\"-1\"></a>\n\n    </div>\n    <ul class=\"fileexplorer-tabs-list\" role=\"tablist\" [ngStyle]=\"headerStyle\">\n      @for (tab of tabs; track tab) {\n      <li [ngClass]=\"tab.index == currentIndex ? 'fileexplorer-tab-selected' : 'fileexplorer-tab'\"\n        (click)=\"setIndex(tab.index)\" id=\"tab-{{tab.index}}\" role=\"presentation\" [ngStyle]=\"headerStyle\"\n        class=\"bx--tabs__nav-item\">\n        <a class=\"fileexplorer-tabs-text\" href=\"javascript:void(0)\" role=\"tab\" aria-selected=\"false\"\n          [ngStyle]=\"headerStyle\">{{tab.name}}</a>\n      </li>\n      }\n    </ul>\n  </nav>\n  <div class=\"fileexplorer-browser-module\" [ngStyle]=\"style\">\n    <file-browser-uss #ussComponent [hidden]=\"currentIndex != 0\" (nodeClick)=\"onNodeClick($event)\"\n      (nodeDblClick)=\"onNodeDblClick($event)\" (openInNewTab)=\"onOpenInNewTab($event)\"\n      (newFolderClick)=\"onNewFolderClick($event)\" (fileUploaded)=\"onFileUploaded($event)\"\n      (deleteClick)=\"onDeleteClick($event)\" (ussRenameEvent)=\"onUSSRenameEvent($event)\"\n      (copyClick)=\"onCopyClick($event)\" (rightClick)=\"onRightClick($event)\" (pathChanged)=\"onPathChanged($event)\"\n      (dataChanged)=\"onDataChanged($event)\" [style]=\"style\" [inputStyle]=\"inputStyle\" [treeStyle]=\"treeStyle\"\n      [searchStyle]=\"searchStyle\" [showUpArrow]=\"showUpArrow\"></file-browser-uss>\n    <file-browser-mvs #mvsComponent [hidden]=\"currentIndex != 1\" (nodeClick)=\"onNodeClick($event)\"\n      (nodeDblClick)=\"onNodeDblClick($event)\" (openInNewTab)=\"onOpenInNewTab($event)\"\n      (deleteClick)=\"onDeleteClick($event)\" (rightClick)=\"onRightClick($event)\" (pathChanged)=\"onPathChanged($event)\"\n      (dataChanged)=\"onDataChanged($event)\" (createDataset)=\"onCreateDataset($event)\" [inputStyle]=\"inputStyle\"\n      [treeStyle]=\"treeStyle\" [searchStyle]=\"searchStyle\" [style]=\"style\"\n      [showUpArrow]=\"showUpArrow\"></file-browser-mvs>\n  </div>\n</div>\n\n<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\n<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->", styles: [".fileexplorer-browser-module{margin-left:10px;margin-top:10px;height:100%}.fileexplorer-global{height:100%}.fileexplorer-tabs{height:25px;text-align:center;padding-bottom:30px}.fileexplorer-tab{font-size:15px;color:#007bff;height:35px;width:170px;padding-top:6px;margin-left:-10px}.fileexplorer-tab-selected{font-size:15px;height:35px;width:165px;font-weight:700;padding-top:6px;margin-left:-7px;color:#005abb;background-color:#d4d4d4}.fileexplorer-tabs-list{-webkit-column-count:2;-moz-column-count:2;column-count:2;width:100%;height:35px;background-color:#464646;cursor:pointer}.fileexplorer-tabs-text{color:inherit;text-decoration:none;background-color:transparent}ul{padding-left:0!important}\n"], dependencies: [{ kind: "directive", type: i7$1.NgClass, selector: "[ngClass]", inputs: ["class", "ngClass"] }, { kind: "directive", type: i7$1.NgStyle, selector: "[ngStyle]", inputs: ["ngStyle"] }, { kind: "component", type: FileBrowserMVSComponent, selector: "file-browser-mvs", inputs: ["inputStyle", "searchStyle", "treeStyle", "style", "showUpArrow"], outputs: ["pathChanged", "dataChanged", "nodeClick", "nodeDblClick", "rightClick", "deleteClick", "openInNewTab", "createDataset"] }, { kind: "component", type: FileBrowserUSSComponent, selector: "file-browser-uss", inputs: ["inputStyle", "searchStyle", "treeStyle", "showUpArrow"], outputs: ["pathChanged", "dataChanged", "nodeClick", "nodeDblClick", "nodeRightClick", "newFolderClick", "newFileClick", "fileUploaded", "copyClick", "deleteClick", "ussRenameEvent", "rightClick", "openInNewTab"] }], encapsulation: i0.ViewEncapsulation.None }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: ZluxFileTreeComponent, decorators: [{
            type: Component,
            args: [{ selector: 'zlux-file-tree', encapsulation: ViewEncapsulation.None, providers: [UtilsService /*, PersistentDataService*/], template: "<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->\n\n<div class=\"fileexplorer-global\" #fileExplorerGlobal>\n  <nav data-tabs class=\"fileexplorer-tabs\" role=\"navigation\">\n    <div class=\"fileexplorer-tabs-trigger\" tabindex=\"-1\">\n      <a href=\"javascript:void(0)\" class=\"bx--tabs-trigger-text\" tabindex=\"-1\"></a>\n\n    </div>\n    <ul class=\"fileexplorer-tabs-list\" role=\"tablist\" [ngStyle]=\"headerStyle\">\n      @for (tab of tabs; track tab) {\n      <li [ngClass]=\"tab.index == currentIndex ? 'fileexplorer-tab-selected' : 'fileexplorer-tab'\"\n        (click)=\"setIndex(tab.index)\" id=\"tab-{{tab.index}}\" role=\"presentation\" [ngStyle]=\"headerStyle\"\n        class=\"bx--tabs__nav-item\">\n        <a class=\"fileexplorer-tabs-text\" href=\"javascript:void(0)\" role=\"tab\" aria-selected=\"false\"\n          [ngStyle]=\"headerStyle\">{{tab.name}}</a>\n      </li>\n      }\n    </ul>\n  </nav>\n  <div class=\"fileexplorer-browser-module\" [ngStyle]=\"style\">\n    <file-browser-uss #ussComponent [hidden]=\"currentIndex != 0\" (nodeClick)=\"onNodeClick($event)\"\n      (nodeDblClick)=\"onNodeDblClick($event)\" (openInNewTab)=\"onOpenInNewTab($event)\"\n      (newFolderClick)=\"onNewFolderClick($event)\" (fileUploaded)=\"onFileUploaded($event)\"\n      (deleteClick)=\"onDeleteClick($event)\" (ussRenameEvent)=\"onUSSRenameEvent($event)\"\n      (copyClick)=\"onCopyClick($event)\" (rightClick)=\"onRightClick($event)\" (pathChanged)=\"onPathChanged($event)\"\n      (dataChanged)=\"onDataChanged($event)\" [style]=\"style\" [inputStyle]=\"inputStyle\" [treeStyle]=\"treeStyle\"\n      [searchStyle]=\"searchStyle\" [showUpArrow]=\"showUpArrow\"></file-browser-uss>\n    <file-browser-mvs #mvsComponent [hidden]=\"currentIndex != 1\" (nodeClick)=\"onNodeClick($event)\"\n      (nodeDblClick)=\"onNodeDblClick($event)\" (openInNewTab)=\"onOpenInNewTab($event)\"\n      (deleteClick)=\"onDeleteClick($event)\" (rightClick)=\"onRightClick($event)\" (pathChanged)=\"onPathChanged($event)\"\n      (dataChanged)=\"onDataChanged($event)\" (createDataset)=\"onCreateDataset($event)\" [inputStyle]=\"inputStyle\"\n      [treeStyle]=\"treeStyle\" [searchStyle]=\"searchStyle\" [style]=\"style\"\n      [showUpArrow]=\"showUpArrow\"></file-browser-mvs>\n  </div>\n</div>\n\n<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\n<!--\nThis program and the accompanying materials are\nmade available under the terms of the Eclipse Public License v2.0 which accompanies\nthis distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\n\nSPDX-License-Identifier: EPL-2.0\n\nCopyright Contributors to the Zowe Project.\n-->", styles: [".fileexplorer-browser-module{margin-left:10px;margin-top:10px;height:100%}.fileexplorer-global{height:100%}.fileexplorer-tabs{height:25px;text-align:center;padding-bottom:30px}.fileexplorer-tab{font-size:15px;color:#007bff;height:35px;width:170px;padding-top:6px;margin-left:-10px}.fileexplorer-tab-selected{font-size:15px;height:35px;width:165px;font-weight:700;padding-top:6px;margin-left:-7px;color:#005abb;background-color:#d4d4d4}.fileexplorer-tabs-list{-webkit-column-count:2;-moz-column-count:2;column-count:2;width:100%;height:35px;background-color:#464646;cursor:pointer}.fileexplorer-tabs-text{color:inherit;text-decoration:none;background-color:transparent}ul{padding-left:0!important}\n"] }]
        }], ctorParameters: () => [{ type: UtilsService }, { type: i0.ElementRef }, { type: i0.ChangeDetectorRef }, { type: KeybindingService }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.LOGGER]
                }] }], propDecorators: { ussComponent: [{
                type: ViewChild,
                args: [FileBrowserUSSComponent]
            }], mvsComponent: [{
                type: ViewChild,
                args: [FileBrowserMVSComponent]
            }], fileExplorerGlobal: [{
                type: ViewChild,
                args: ['fileExplorerGlobal', { static: true }]
            }], spawnModal: [{
                type: Input
            }], toggleSearchInput: [{
                type: Input
            }], selectPath: [{
                type: Input
            }], style: [{
                type: Input
            }], headerStyle: [{
                type: Input
            }], inputStyle: [{
                type: Input
            }], searchStyle: [{
                type: Input
            }], treeStyle: [{
                type: Input
            }], theme: [{
                type: Input
            }], fileOutput: [{
                type: Output
            }], nodeClick: [{
                type: Output
            }], nodeDblClick: [{
                type: Output
            }], newFolderClick: [{
                type: Output
            }], fileUploaded: [{
                type: Output
            }], copyClick: [{
                type: Output
            }], deleteClick: [{
                type: Output
            }], ussRenameEvent: [{
                type: Output
            }], datasetSelect: [{
                type: Output
            }], ussSelect: [{
                type: Output
            }], pathChanged: [{
                type: Output
            }], dataChanged: [{
                type: Output
            }], rightClick: [{
                type: Output
            }], openInNewTab: [{
                type: Output
            }], createDataset: [{
                type: Output
            }] } });

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
class ZluxFileTreeModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: ZluxFileTreeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.0.7", ngImport: i0, type: ZluxFileTreeModule, declarations: [FileBrowserMVSComponent,
            FileBrowserUSSComponent,
            ZluxFileTreeComponent,
            FilePropertiesModal,
            FilePermissionsModal,
            FileOwnershipModal,
            FileTaggingModal,
            DatasetPropertiesModal,
            DeleteFileModal,
            CreateFolderModal,
            CreateFileModal,
            UploadModal,
            TreeComponent,
            CreateDatasetModal], imports: [CommonModule,
            FormsModule,
            TreeModule,
            MenuModule,
            MatDialogModule,
            DialogModule,
            ContextMenuModule,
            MatTableModule,
            MatSnackBarModule,
            MatFormFieldModule,
            MatIconModule,
            MatInputModule,
            MatListModule,
            MatCheckboxModule,
            MatButtonModule,
            MatButtonToggleModule,
            MatTooltipModule,
            MatSelectModule,
            MatAutocompleteModule,
            ZluxTabbingModule,
            MatSlideToggleModule,
            InputTextModule,
            InputGroupModule,
            InputGroupAddonModule,
            ReactiveFormsModule], exports: [ZluxFileTreeComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: ZluxFileTreeModule, providers: [
            KeybindingService,
            UploaderService,
            DownloaderService
        ], imports: [CommonModule,
            FormsModule,
            TreeModule,
            MenuModule,
            MatDialogModule,
            DialogModule,
            ContextMenuModule,
            MatTableModule,
            MatSnackBarModule,
            MatFormFieldModule,
            MatIconModule,
            MatInputModule,
            MatListModule,
            MatCheckboxModule,
            MatButtonModule,
            MatButtonToggleModule,
            MatTooltipModule,
            MatSelectModule,
            MatAutocompleteModule,
            ZluxTabbingModule,
            MatSlideToggleModule,
            InputTextModule,
            InputGroupModule,
            InputGroupAddonModule,
            ReactiveFormsModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: ZluxFileTreeModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [
                        FileBrowserMVSComponent,
                        FileBrowserUSSComponent,
                        ZluxFileTreeComponent,
                        FilePropertiesModal,
                        FilePermissionsModal,
                        FileOwnershipModal,
                        FileTaggingModal,
                        DatasetPropertiesModal,
                        DeleteFileModal,
                        CreateFolderModal,
                        CreateFileModal,
                        UploadModal,
                        TreeComponent,
                        CreateDatasetModal
                    ],
                    imports: [
                        CommonModule,
                        FormsModule,
                        TreeModule,
                        MenuModule,
                        MatDialogModule,
                        DialogModule,
                        ContextMenuModule,
                        MatTableModule,
                        MatSnackBarModule,
                        MatFormFieldModule,
                        MatIconModule,
                        MatInputModule,
                        MatListModule,
                        MatCheckboxModule,
                        MatButtonModule,
                        MatButtonToggleModule,
                        MatTooltipModule,
                        MatSelectModule,
                        MatAutocompleteModule,
                        ZluxTabbingModule,
                        MatSlideToggleModule,
                        InputTextModule,
                        InputGroupModule,
                        InputGroupAddonModule,
                        ReactiveFormsModule
                    ],
                    exports: [ZluxFileTreeComponent],
                    providers: [
                        KeybindingService,
                        UploaderService,
                        DownloaderService
                    ]
                }]
        }] });

class PersistentDataService {
    constructor(http, pluginDefinition) {
        this.http = http;
        this.pluginDefinition = pluginDefinition;
        this.scope = "instance";
        this.resourcePath = "persistance";
        this.fileName = "zlux-file-explorer.json";
    }
    setData(params) {
        let uri = ZoweZLUX.uriBroker.pluginConfigForScopeUri(this.pluginDefinition.getBasePlugin(), this.scope, this.resourcePath, this.fileName);
        if (typeof params === 'object') {
            return this.http.put(uri, this.stringify(params, null, 2, null));
            //return this.http.put(uri, JSON.stringify(params));
        }
        else {
            return this.http.put(uri, params);
        }
    }
    getData() {
        return null;
        //TODO: This code no longer functions as intended. This is supposed to introduce persistent data loading
        //so the File Explorer would re-open a user's previously opened trees/working directory when they close.
        // let uri = ZoweZLUX.uriBroker.pluginConfigForScopeUri(this.pluginDefinition.getBasePlugin(), this.scope, this.resourcePath, this.fileName);
        // let headers = new Headers({ 'Content-Type': 'application/json' });
        // let options = new RequestOptions({ headers: headers });
        // return this.http
        // .get(uri, options)
        // .map((res => { return res.json(); }))
        // .catch((err => { 
        //   console.log("Data saving file does not exist. Creating one now...");
        //   return this.http.put(uri, this.stringify(null, null, 2, null)); 
        // })); 
    }
    stringify(obj, replacer, spaces, cycleReplacer) {
        return JSON.stringify(obj, this.serializer(replacer, cycleReplacer), spaces);
    }
    serializer(replacer, cycleReplacer) {
        var stack = [], keys = [];
        if (cycleReplacer == null)
            cycleReplacer = function (key, value) {
                if (stack[0] === value)
                    return "[Circular ~]";
                return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
            };
        return function (key, value) {
            if (stack.length > 0) {
                var thisPos = stack.indexOf(this);
                ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
                ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
                if (~stack.indexOf(value))
                    value = cycleReplacer.call(this, key, value);
            }
            else
                stack.push(value);
            return replacer == null ? value : replacer.call(this, key, value);
        };
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: PersistentDataService, deps: [{ token: i1$1.HttpClient }, { token: Angular2InjectionTokens.PLUGIN_DEFINITION }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: PersistentDataService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: PersistentDataService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1$1.HttpClient }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.PLUGIN_DEFINITION]
                }] }] });

/*
 * Public API Surface of zlux-file-explorer
 */

/**
 * Generated bundle index. Do not edit.
 */

export { ConfigVariables, CreateDatasetModal, CreateFileModal, CreateFolderModal, DatasetCrudService, DatasetPropertiesModal, DeleteFileModal, DownloaderService, FileBrowserMVSComponent, FileBrowserUSSComponent, FileOwnershipModal, FilePermissionsModal, FilePropertiesModal, FileTaggingModal, KeyCode, KeybindingService, MyErrorStateMatcher, PersistentDataService, SearchHistoryService, TreeComponent, UploadModal, UploaderService, UssCrudService, UtilsService, ZluxFileTreeComponent, ZluxFileTreeModule };
//# sourceMappingURL=zlux-angular-file-tree.mjs.map
