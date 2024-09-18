import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DatasetAttributes } from '../structures/editor-project';
import { UtilsService } from './utils.service';
import * as i0 from "@angular/core";
export declare class DatasetCrudService {
    private http;
    private utils;
    constructor(http: HttpClient, utils: UtilsService);
    private handleErrorObservable;
    addfolder(): void;
    removefolder(): void;
    copyfolder(): void;
    deletefolder(): void;
    renamefolder(): void;
    addfile(): void;
    removefile(): void;
    copyfile(): void;
    deletefile(): void;
    renamefile(): void;
    deleteNonVsamDatasetOrMember(rightClickedFile: any): Observable<any>;
    deleteVsamDataset(rightClickedFile: any): Observable<any>;
    queryDatasets(query: string, detail?: boolean, includeAdditionalQualifiers?: boolean): Observable<any>;
    getDataset(path: string): Observable<Object>;
    recallDataset(path: string): Observable<DatasetAttributes>;
    createDataset(datasetAttributes: any, name: string): Observable<any>;
    static ɵfac: i0.ɵɵFactoryDeclaration<DatasetCrudService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DatasetCrudService>;
}
