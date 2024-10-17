import { EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as i0 from "@angular/core";
export declare class CreateFileModal {
    private http;
    private snackBar;
    fileName: string;
    dirPath: string;
    folderPathObtainedFromNode: string;
    filePattern: RegExp;
    onFileCreate: EventEmitter<any>;
    constructor(data: any, http: HttpClient, snackBar: MatSnackBar);
    createFile(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<CreateFileModal, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<CreateFileModal, "create-file-modal", never, {}, {}, never, never, false, never>;
}
