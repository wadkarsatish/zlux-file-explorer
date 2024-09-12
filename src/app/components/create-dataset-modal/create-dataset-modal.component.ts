/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, ElementRef, ViewChild, Inject } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomErrorStateMatcher } from '../../shared/error-state-matcher';

import './create-dataset-modal.component.scss';
import '../../../../src/app/shared/modal.component.scss';
interface templateParams {
  allocationUnit: string,
  primarySpace: string,
  secondarySpace: string,
  directoryBlocks: string,
  recordFormat: string,
  recordLength: string,
}

interface dsntParams {
  organization: string;
}

const TEMPLATE = new Map<string, templateParams>([
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

const DATASETNAMETYPE = new Map<string, dsntParams>([
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

@Component({
  selector: 'create-dataset-modal',
  templateUrl: './create-dataset-modal.component.html'
})
export class CreateDatasetModal {
  public properties = {
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
  public numericPattern: string;
  public numericPatternExZero: string;
  public datasetNamePattern: string;
  public alphaNumericPattern: string;
  public templateOptions: string[];
  public allocationUnitOptions: string[];
  public datasetNameTypeOptions: string[];
  public recordFormatOptions: string[];
  public organizationOptions: string[];
  public recordUnitOptions: string[];
  public matcher = new CustomErrorStateMatcher();
  public isDirBlockValid: boolean = true;
  public dirBlockError: string;
  public dirBlockTouched: boolean = false;
  public isPrimeSpaceValid: boolean = true;
  public isSecondSpaceValid: boolean = true;
  public isRecLengthValid: boolean = true;
  public isBlockSizeValid: boolean = true;
  public primarySpaceError: string = "Primary space value cannot be more than '16777215' ";
  public secondarySpaceError: string = "Secondary space value cannot be more than '16777215' ";
  public recordLengthError: string = "Record length cannot be more than '32760' bytes";
  public blockSizeError: string = "Block size cannot be more than '32760' bytes";
  public isRecordFormatValid: boolean = true;
  public recordFormatErrorMessage: string;
  public blockSizeTouched: boolean = false;
  public isAllocUnitValid: boolean = true;
  public allocUnitErrorMessage: string = "If allocation unit is 'BLK' then record format must be blocked type: FB, VB, VBA";
  public isRecFormatTouched: boolean = false;

  @ViewChild('dirblocks') dirblocks: ElementRef;
  @ViewChild('primeSpace') primeSpace: ElementRef;
  @ViewChild('allocUnit') allocUnit: MatSelect;
  @ViewChild('secondSpace') secondSpace: ElementRef;
  @ViewChild('recordLength') recordLength: ElementRef;
  @ViewChild('recordFormat') recordFormat: MatSelect;
  @ViewChild('dsorg') dsorg: ElementRef;


  constructor(private el: ElementRef, @Inject(MAT_DIALOG_DATA) data) {
    if (data && data.data) {
      this.properties.name = data.data.dsName;
      this.properties.datasetNameType = data.data.dsNameType;
      this.properties.organization = data.data.dsOrg;
    } else {
      this.properties.datasetNameType = 'PDS';
      this.properties.organization = 'PO'
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

  onTemplateChange(value: string): void {
    this.setTemplateProperties(value);
  }

  setDatasetNameTypeProperties(datasetNameType: string): void {
    this.dsorg.nativeElement.setAttribute('style', 'padding-bottom: 4px; margin-bottom: -7px; border-bottom: 2px solid #000099');
    setTimeout(() => {
      this.dsorg.nativeElement.setAttribute('style', 'margin-bottom: 0px; border-bottom: 0px');
    }, 3000)

    if (!datasetNameType) {
      this.properties.organization = 'PS';
    } else {
      this.properties.organization = DATASETNAMETYPE.get(datasetNameType)?.organization;
    }
    if (this.dirBlockTouched) {
      this.checkForValidDirBlockCombination();
    }
  }

  setTemplateProperties(template: string): void {
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
    }, 3000)

    this.dirBlockTouched = true;

    if (!template) {
      this.properties.allocationUnit = '';
      this.properties.primarySpace = '';
      this.properties.secondarySpace = '';
      this.properties.directoryBlocks = '';
      this.properties.recordFormat = '';
      this.properties.recordLength = '';
    }

    this.properties.allocationUnit = TEMPLATE.get(template).allocationUnit;
    this.properties.primarySpace = TEMPLATE.get(template).primarySpace;
    this.properties.secondarySpace = TEMPLATE.get(template).secondarySpace;
    if (this.properties.organization == 'PS') {
      this.properties.directoryBlocks = '0';
    } else {
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

  onDirBlockChange(value): void {
    this.dirBlockTouched = true;
    if (parseInt(this.properties.directoryBlocks) > 16777215) {
      this.isDirBlockValid = false;
      this.dirBlockError = 'Directory blocks cannot be more than 16777215';
    } else {
      this.checkForValidDirBlockCombination();
    }
  }

  checkForValidDirBlockCombination(): void {
    if (this.properties.organization == 'PS') {
      if (this.properties.directoryBlocks == '') {
        this.isDirBlockValid = true;
      } else if (parseInt(this.properties.directoryBlocks) > 0) {
        this.isDirBlockValid = false;
        this.dirBlockError = 'Directory blocks must be 0 for the sequential dataset';
      } else {
        this.isDirBlockValid = true;
      }
    }

    if (this.properties.organization == 'PO') {
      if (this.properties.directoryBlocks == '') {
        this.isDirBlockValid = true;
      } else if (parseInt(this.properties.directoryBlocks) < 1) {
        this.isDirBlockValid = false;
        this.dirBlockError = 'Directory blocks must be greater than 0 for the partitioned dataset';
      } else {
        this.isDirBlockValid = true;
      }
    }
  }

  checkForValidRecordFormatCombination(): void {
    if (this.properties.recordFormat == 'F') {
      if (this.properties.blockSize !== '' && this.properties.recordLength !== this.properties.blockSize) {
        this.isRecordFormatValid = false;
        this.recordFormatErrorMessage = 'Block size must be equal to the record length for fixed record format';
      } else {
        this.isRecordFormatValid = true;
      }
    }
    if (this.properties.recordFormat == 'FB') {
      if (this.properties.blockSize !== '' && (parseInt(this.properties.blockSize) % parseInt(this.properties.recordLength)) != 0) {
        this.isRecordFormatValid = false;
        this.recordFormatErrorMessage = 'Block size must be a multiple of the record length for fixed blocked record format';
      } else {
        this.isRecordFormatValid = true;
      }
    }
    if (this.properties.recordFormat == 'V' || this.properties.recordFormat == 'VB') {
      if (this.properties.blockSize !== '' && parseInt(this.properties.blockSize) < (parseInt(this.properties.recordLength) + 4)) {
        this.isRecordFormatValid = false;
        this.recordFormatErrorMessage = 'Block size must be atleast 4 more than the record length for V, VB, VBA record format';
      } else {
        this.isRecordFormatValid = true;
      }
    }
    if (this.properties.recordFormat == 'VBA') {
      if (parseInt(this.properties.recordLength) < 5) {
        this.isRecordFormatValid = false;
        this.recordFormatErrorMessage = 'Record length must be atleast 5 for VBA record format';
      } else if (this.properties.blockSize !== '' && parseInt(this.properties.blockSize) < (parseInt(this.properties.recordLength) + 4)) {
        this.isRecordFormatValid = false;
        this.recordFormatErrorMessage = 'Block size must be atleast 4 more than the record length for V, VB, VBA record format';
      } else {
        this.isRecordFormatValid = true;
      }
    }
    if (this.properties.recordFormat == 'U') {
      if (parseInt(this.properties.recordLength) > 0) {
        this.isRecordFormatValid = false;
        this.recordFormatErrorMessage = 'Record length must be equal to 0 for undefined record format';
      } else {
        this.isRecordFormatValid = true;
      }
    }
  }

  checkForValidAllocUnitCombination(): void {
    if (this.properties.allocationUnit == 'BLK') {
      if (this.properties.recordFormat !== 'FB' && this.properties.recordFormat !== 'VB' && this.properties.recordFormat !== 'VBA') {
        this.isAllocUnitValid = false;
      } else {
        this.isAllocUnitValid = true;
      }
    } else {
      this.isAllocUnitValid = true;
    }
  }

  onPrimeSpaceChange(primarySpace): void {
    if (parseInt(primarySpace) > 16777215) {
      this.isPrimeSpaceValid = false;
    } else {
      this.isPrimeSpaceValid = true;
    }
  }

  onSecondSpaceChange(SecondarySpace): void {
    if (parseInt(SecondarySpace) > 16777215) {
      this.isSecondSpaceValid = false;
    } else {
      this.isSecondSpaceValid = true;
    }
  }

  onRecLengthChange(recordLength): void {
    if (parseInt(recordLength) > 32760) {
      this.isRecLengthValid = false;
    } else {
      this.isRecLengthValid = true;
    }
    if (this.blockSizeTouched || this.properties.recordFormat == 'U' || this.properties.recordFormat == 'VBA') {
      this.checkForValidRecordFormatCombination();
    }
  }

  onBlockSizeChange(blockSize): void {
    this.blockSizeTouched = true;
    if (parseInt(blockSize) > 32760) {
      this.isBlockSizeValid = false;
    } else {
      this.isBlockSizeValid = true;
    }
    this.checkForValidRecordFormatCombination();
  }

  onRecordFormatChange(value): void {
    this.isRecFormatTouched = true;
    if (this.blockSizeTouched || this.properties.recordFormat == 'U') {
      this.checkForValidRecordFormatCombination();
    }
    this.checkForValidAllocUnitCombination();
  }

  onAllocUnitChange(value): void {
    if (this.isRecFormatTouched) {
      this.checkForValidAllocUnitCombination();
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