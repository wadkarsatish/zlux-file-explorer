import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class DeleteFileModal {
    fileName: string;
    fileIcon: string;
    onDelete: EventEmitter<any>;
    private node;
    constructor(data: any);
    deleteFileOrFolder(): void;
    getFileName(): any;
    static ɵfac: i0.ɵɵFactoryDeclaration<DeleteFileModal, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<DeleteFileModal, "delete-file-modal", never, {}, {}, never, never, false, never>;
}
