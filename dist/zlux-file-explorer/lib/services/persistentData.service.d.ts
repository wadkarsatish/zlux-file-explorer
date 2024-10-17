/// <reference types="../../../../zlux-platform/interface/src/index.d.ts" />
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as i0 from "@angular/core";
export declare class PersistentDataService {
    private http;
    private pluginDefinition;
    private ussData;
    private scope;
    private resourcePath;
    private fileName;
    constructor(http: HttpClient, pluginDefinition: ZLUX.ContainerPluginDefinition);
    setData(params: any): Observable<any>;
    getData(): Observable<any>;
    stringify(obj: any, replacer: any, spaces: any, cycleReplacer: any): string;
    serializer(replacer: any, cycleReplacer: any): (key: any, value: any) => any;
    static ɵfac: i0.ɵɵFactoryDeclaration<PersistentDataService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<PersistentDataService>;
}
