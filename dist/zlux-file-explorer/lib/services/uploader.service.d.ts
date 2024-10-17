/// <reference types="../../../../zlux-platform/interface/src/index.d.ts" />
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as i0 from "@angular/core";
export declare class UploaderService {
    private http;
    private log;
    private snackBar;
    constructor(http: HttpClient, log: ZLUX.ComponentLogger, snackBar: MatSnackBar);
    chunkAndSendFile(file: File, uploadDirPath: string, targetEncoding: string): Observable<number>;
    static ɵfac: i0.ɵɵFactoryDeclaration<UploaderService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<UploaderService>;
}
