/// <reference types="../../../../zlux-platform/interface/src/index.d.ts" />
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CustomErrorStateMatcher } from '../../shared/error-state-matcher';
import { FileTag } from '../../shared/file-tag';
import * as i0 from "@angular/core";
export declare class FileTaggingModal {
    private dialogRef;
    private http;
    private snackBar;
    node: any;
    isDirectory: boolean;
    icon: string;
    name: string;
    title: string;
    matcher: CustomErrorStateMatcher;
    recursive: boolean;
    tagOptions: FileTag[];
    filteredOptions: FileTag[];
    selectedOption: FileTag | string;
    constructor(data: any, dialogRef: MatDialogRef<FileTaggingModal>, http: HttpClient, snackBar: MatSnackBar);
    changeTag(): void;
    closeDialog(): void;
    onTaggingSuccess(path: string, type: ZLUX.TagType, option: FileTag): void;
    onTaggingFailure(err: HttpErrorResponse): void;
    displayFn(option?: FileTag): string | undefined;
    onValueChange(value?: string | FileTag): void;
    get isOptionSelected(): boolean;
    private filter;
    static ɵfac: i0.ɵɵFactoryDeclaration<FileTaggingModal, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FileTaggingModal, "file-tagging-modal", never, {}, {}, never, never, false, never>;
}
