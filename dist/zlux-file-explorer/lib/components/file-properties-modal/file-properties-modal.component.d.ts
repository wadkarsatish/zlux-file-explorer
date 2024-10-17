import { OnInit } from '@angular/core';
import { FileTag } from '../../shared/file-tag';
import * as i0 from "@angular/core";
export declare class FilePropertiesModal implements OnInit {
    fileName: string;
    fileCreatedAt: string;
    fileType: string;
    filePath: string;
    fileMode: number;
    fileSize: string;
    fileIcon: string;
    fileOwner: string;
    fileGroup: string;
    sizeType: string;
    tag?: FileTag;
    constructor(data: any);
    ngOnInit(): void;
    applyFilter(filterValue: string): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<FilePropertiesModal, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FilePropertiesModal, "file-properties-modal", never, {}, {}, never, never, false, never>;
}
