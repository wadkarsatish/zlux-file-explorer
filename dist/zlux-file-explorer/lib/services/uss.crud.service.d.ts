import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UtilsService } from './utils.service';
import * as i0 from "@angular/core";
export declare class UssCrudService {
    private http;
    private utils;
    private handleErrorObservable;
    constructor(http: HttpClient, utils: UtilsService);
    makeDirectory(path: string, forceOverwrite?: boolean): Observable<any>;
    makeFile(path: string): Observable<any>;
    getFileContents(path: string): Observable<any>;
    getFileMetadata(path: string): Observable<any>;
    copyFile(oldPath: string, newPath: string, forceOverwrite?: boolean): Observable<any>;
    deleteFileOrFolder(path: string): Observable<any>;
    renameFile(oldPath: string, newPath: string, forceOverwrite?: boolean): Observable<any>;
    saveFile(path: string, fileContents: string, targetEncoding?: string, forceOverwrite?: boolean): Observable<any>;
    getUserHomeFolder(): Observable<{
        home: string;
    }>;
    static ɵfac: i0.ɵɵFactoryDeclaration<UssCrudService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<UssCrudService>;
}
