import { EventEmitter, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UploaderService } from '../../services/uploader.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import * as i0 from "@angular/core";
/** Error when invalid control is dirty, touched, or submitted. */
export declare class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean;
}
export declare class UploadModal {
    private uploader;
    private snackBar;
    folderPath: string;
    onUpload: EventEmitter<any>;
    fileUpload: ElementRef;
    files: Array<File>;
    private fileEncodings;
    matcher: MyErrorStateMatcher;
    encodings: {
        name: string;
        value: string;
        selected: boolean;
    }[];
    private filteredOptions;
    selectedOption: string;
    selectedOptionValid: boolean;
    constructor(data: any, uploader: UploaderService, snackBar: MatSnackBar);
    addFile(): void;
    onFileUploaded(event: any): void;
    onValueChange(value?: string): void;
    displayFn(val: string): string;
    uploadHandlerSetup(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<UploadModal, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<UploadModal, "upload-files-modal", never, {}, {}, never, never, false, never>;
}
