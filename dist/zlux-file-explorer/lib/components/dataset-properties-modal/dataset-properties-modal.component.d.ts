import { OnInit } from '@angular/core';
import * as i0 from "@angular/core";
export declare class DatasetPropertiesModal implements OnInit {
    datasetName: string;
    datasetCSIEntryType: string;
    datasetIsPDS: string;
    datasetMaxRecordLen: number;
    datasetOrganization: string;
    datasetBlockSize: number;
    datasetCarriageControl: string;
    datasetIsBlocked: string;
    datasetIsSpanned: string;
    datasetIsStandard: string;
    datasetRecordFormat: string;
    datasetVolser: string;
    datasetIcon: string;
    datasetSummary: string;
    constructor(data: any);
    ngOnInit(): void;
    formatRecordFormat(recordFormat: string): string;
    formatSummary(org: string, recfm: string, reclen: number): string;
    formatOrganization(organization?: string): string;
    formatCSIEntryType(CSIEntryType: string): string;
    static ɵfac: i0.ɵɵFactoryDeclaration<DatasetPropertiesModal, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DatasetPropertiesModal, "dataset-properties-modal", never, {}, {}, never, never, false, never>;
}
