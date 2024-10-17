import { EventEmitter } from '@angular/core';
import * as i0 from "@angular/core";
export declare class CreateFolderModal {
    folderName: string;
    folderPath: string;
    folderPathObtainedFromNode: string;
    folderPattern: RegExp;
    onCreate: EventEmitter<any>;
    constructor(data: any);
    createFolder(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CreateFolderModal, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CreateFolderModal, "create-folder-modal", never, {}, {}, never, never, false, never>;
}
