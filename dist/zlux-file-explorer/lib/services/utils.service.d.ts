import { DatasetAttributes } from '../structures/editor-project';
import * as i0 from "@angular/core";
export declare class UtilsService {
    constructor();
    filePathCheck(path: string): string;
    filePathEndCheck(path: string): string;
    isDatasetMigrated(attrs: DatasetAttributes): boolean;
    static ɵfac: i0.ɵɵFactoryDeclaration<UtilsService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<UtilsService>;
}
