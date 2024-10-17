import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import * as i0 from "@angular/core";
export declare class FileOwnershipModal {
    private dialogRef;
    private http;
    private snackBar;
    name: string;
    path: string;
    mode: number;
    modeSym: string;
    icon: string;
    owner: string;
    group: string;
    isDirectory: boolean;
    recursive: boolean;
    node: any;
    folderName: string;
    folderPath: string;
    constructor(data: any, dialogRef: MatDialogRef<FileOwnershipModal>, http: HttpClient, snackBar: MatSnackBar);
    formatPermissions(): void;
    saveOwnerInfo(): void;
    closeDialog(): void;
    private handleErrorObservable;
    static ɵfac: i0.ɵɵFactoryDeclaration<FileOwnershipModal, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<FileOwnershipModal, "file-ownership-modal", never, {}, {}, never, never, false, never>;
}
