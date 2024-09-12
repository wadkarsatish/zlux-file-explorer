
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import './dataset-properties-modal.component.scss';
import '../../../../src/app/shared/modal.component.scss';
@Component({
  selector: 'dataset-properties-modal',
  templateUrl: './dataset-properties-modal.component.html'
})
export class DatasetPropertiesModal implements OnInit {

  public datasetName = '';
  public datasetCSIEntryType = '';
  public datasetIsPDS = '';
  public datasetMaxRecordLen = 0;
  public datasetOrganization = '';
  public datasetBlockSize = 0;
  public datasetCarriageControl = '';
  public datasetIsBlocked = '';
  public datasetIsSpanned = '';
  public datasetIsStandard = '';
  public datasetRecordFormat = '';
  public datasetVolser = '';
  public datasetIcon = '';
  public datasetSummary = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) data,
  ) {
    const node = data.event;
    if (node.data) {
      const data = node.data;
      this.datasetName = data.fileName;
      this.datasetCSIEntryType = this.formatCSIEntryType(data.datasetAttrs.csiEntryType);
      if (data.datasetAttrs.dsorg) {
        if (data.datasetAttrs.dsorg.isPDSDir) {
          if (data.datasetAttrs.dsorg.isPDSE) {
            this.datasetIsPDS = "✓ (PDS/E)";
          } else {
            this.datasetIsPDS = "✓";
          }
        }
        this.datasetOrganization = this.formatOrganization(data.datasetAttrs.dsorg.organization);
        this.datasetBlockSize = data.datasetAttrs.dsorg.totalBlockSize;
        this.datasetCarriageControl = data.datasetAttrs.recfm.carriageControl;
        if (data.datasetAttrs.recfm.isBlocked) {
          this.datasetIsBlocked = "✓";
        } else {
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
    } else if (node.collapsedIcon) {
      this.datasetIcon = node.collapsedIcon;
    }
    this.datasetSummary = this.formatSummary(this.datasetOrganization, this.datasetRecordFormat, this.datasetMaxRecordLen);
  }

  ngOnInit() {
  }

  formatRecordFormat(recordFormat: string): string {
    switch (recordFormat) {
      case "U":
        recordFormat = "U - Undefined"
        break;
      case "F":
        recordFormat = "F - Fixed"
        break;
      case "V":
        recordFormat = "V - Variable"
        break;
    }
    return recordFormat;
  }

  formatSummary(org: string, recfm: string, reclen: number): string {
    let summary = "N/A";
    if (org.substring(0, 2) == "PS") {
      if (recfm[0] == 'F') {
        if (reclen > 0) {
          summary = "FB" + reclen;
        } else {
          summary = "FB";
        }
      } else if (recfm[0] == 'V') {
        if (reclen > 0) {
          summary = "VB" + reclen;
        } else {
          summary = "VB";
        }
      }
    } else if (org.substring(0, 2) == "PO") {
      if (this.datasetIsPDS.length == 0) { //PDS is false
        if (reclen > 0) {
          summary = "HFS" + reclen;
        } else {
          summary = "HFS";
        }
      } else if (this.datasetIsPDS.length == 1) { //PDS is true
        if (reclen > 0) {
          summary = "PDS" + reclen;
        } else {
          summary = "PDS";
        }
      } else { // PDS/E is true
        if (reclen > 0) {
          summary = "PDSE" + reclen;
        } else {
          summary = "PDSE";
        }
      }
    } else if (org.substring(0, 2) == "VS") {
      if (reclen > 0) {
        summary = "VSAM" + reclen;
      } else {
        summary = "VSAM";
      }
    } else if (org.substring(0, 2) == "DA") {
      if (reclen > 0) {
        summary = "DA" + reclen;
      } else {
        summary = "DA";
      }
    }
    return summary;
  }

  formatOrganization(organization?: string): string {
    if (organization) {
      switch (organization) {
        case "sequential":
          organization = "PS - Sequential"
          break;
        case "hfs":
          organization = "PO - Partitioned"
          break;
        case "partitioned":
          organization = "PO - Partitioned"
          break;
        case "vsam":
          organization = "VS - VSAM"
          break;
      }
    } else {
      organization = "DA - Direct Access";
    }
    return organization;
  }

  formatCSIEntryType(CSIEntryType: string): string {
    switch (CSIEntryType) {
      case "A":
        CSIEntryType = "A - non-VSAM data set"
        break;
      case "B":
        CSIEntryType = "B - Generation data group"
        break;
      case "C":
        CSIEntryType = "C - VSAM Cluster"
        break;
      case "D":
        CSIEntryType = "D - VSAM Data"
        break;
      case "G":
        CSIEntryType = "G - Alternate index"
        break;
      case "H":
        CSIEntryType = "H - Generation data set"
        break;
      case "I":
        CSIEntryType = "I - VSAM Index"
        break;
      case "L":
        CSIEntryType = "L - Tape volume catalog library"
        break;
      case "R":
        CSIEntryType = "R - VSAM Path"
        break;
      case "U":
        CSIEntryType = "U - User catalog connector"
        break;
      case "W":
        CSIEntryType = "W - Tape volume catalog volume"
        break;
      case "X":
        CSIEntryType = "X - Alias"
        break;
    }
    return CSIEntryType;
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
