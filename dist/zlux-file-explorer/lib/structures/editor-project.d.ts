export interface ProjectStructure {
    id: string;
    name: string;
    ext?: string;
    language?: string;
    children?: ProjectStructure[];
    hasChildren: boolean;
    contents?: string;
    line?: number;
    parent?: string;
    path?: string;
    fileName?: string;
    isDataset: boolean;
    encoding?: number;
    datasetAttrs?: DatasetAttributes;
}
export interface DatasetAttributes {
    csiEntryType: string;
    dsorg: DatasetOrganization;
    recfm: RecordFormat;
    volser: string;
    members?: Member[];
}
export interface Member {
    name: string;
}
export interface RecordFormat {
    carriageControl: string;
    isBlocked: boolean;
    recordLength: string;
}
export interface DatasetOrganization {
    maxRecordLen: number;
    organization: string;
    totalBlockSize: number;
}
