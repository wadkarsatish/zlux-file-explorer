/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ZluxTabbingModule } from "zlux-widgets";
import { DownloaderService } from "../../services/downloader.service";
import { KeybindingService } from "../../services/keybinding.service";
import { UploaderService } from "../../services/uploader.service";
import { CreateDatasetModal } from "../create-dataset-modal/create-dataset-modal.component";
import { CreateFileModal } from "../create-file-modal/create-file-modal.component";
import { CreateFolderModal } from "../create-folder-modal/create-folder-modal.component";
import { DatasetPropertiesModal } from "../dataset-properties-modal/dataset-properties-modal.component";
import { DeleteFileModal } from "../delete-file-modal/delete-file-modal.component";
import { FileOwnershipModal } from "../file-ownership-modal/file-ownership-modal.component";
import { FilePermissionsModal } from "../file-permissions-modal/file-permissions-modal.component";
import { FilePropertiesModal } from "../file-properties-modal/file-properties-modal.component";
import { FileTaggingModal } from "../file-tagging-modal/file-tagging-modal.component";
import { FileBrowserMVSComponent } from "../filebrowsermvs/filebrowsermvs.component";
import { FileBrowserUSSComponent } from "../filebrowseruss/filebrowseruss.component";
import { TreeComponent } from "../tree/tree.component";
import { UploadModal } from "../upload-files-modal/upload-files-modal.component";
import { ZluxFileTreeComponent } from "./zlux-file-tree.component";
import { TreeModule } from 'primeng/tree';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from "primeng/dialog";
import { ContextMenuModule } from "primeng/contextmenu";
import { InputTextModule } from "primeng/inputtext";
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import * as i0 from "@angular/core";
export class ZluxFileTreeModule {
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: ZluxFileTreeModule, deps: [], target: i0.ɵɵFactoryTarget.NgModule }); }
    static { this.ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "18.0.7", ngImport: i0, type: ZluxFileTreeModule, declarations: [FileBrowserMVSComponent,
            FileBrowserUSSComponent,
            ZluxFileTreeComponent,
            FilePropertiesModal,
            FilePermissionsModal,
            FileOwnershipModal,
            FileTaggingModal,
            DatasetPropertiesModal,
            DeleteFileModal,
            CreateFolderModal,
            CreateFileModal,
            UploadModal,
            TreeComponent,
            CreateDatasetModal], imports: [CommonModule,
            FormsModule,
            TreeModule,
            MenuModule,
            MatDialogModule,
            DialogModule,
            ContextMenuModule,
            MatTableModule,
            MatSnackBarModule,
            MatFormFieldModule,
            MatIconModule,
            MatInputModule,
            MatListModule,
            MatCheckboxModule,
            MatButtonModule,
            MatButtonToggleModule,
            MatTooltipModule,
            MatSelectModule,
            MatAutocompleteModule,
            ZluxTabbingModule,
            MatSlideToggleModule,
            InputTextModule,
            InputGroupModule,
            InputGroupAddonModule,
            ReactiveFormsModule], exports: [ZluxFileTreeComponent] }); }
    static { this.ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: ZluxFileTreeModule, providers: [
            KeybindingService,
            UploaderService,
            DownloaderService
        ], imports: [CommonModule,
            FormsModule,
            TreeModule,
            MenuModule,
            MatDialogModule,
            DialogModule,
            ContextMenuModule,
            MatTableModule,
            MatSnackBarModule,
            MatFormFieldModule,
            MatIconModule,
            MatInputModule,
            MatListModule,
            MatCheckboxModule,
            MatButtonModule,
            MatButtonToggleModule,
            MatTooltipModule,
            MatSelectModule,
            MatAutocompleteModule,
            ZluxTabbingModule,
            MatSlideToggleModule,
            InputTextModule,
            InputGroupModule,
            InputGroupAddonModule,
            ReactiveFormsModule] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: ZluxFileTreeModule, decorators: [{
            type: NgModule,
            args: [{
                    declarations: [
                        FileBrowserMVSComponent,
                        FileBrowserUSSComponent,
                        ZluxFileTreeComponent,
                        FilePropertiesModal,
                        FilePermissionsModal,
                        FileOwnershipModal,
                        FileTaggingModal,
                        DatasetPropertiesModal,
                        DeleteFileModal,
                        CreateFolderModal,
                        CreateFileModal,
                        UploadModal,
                        TreeComponent,
                        CreateDatasetModal
                    ],
                    imports: [
                        CommonModule,
                        FormsModule,
                        TreeModule,
                        MenuModule,
                        MatDialogModule,
                        DialogModule,
                        ContextMenuModule,
                        MatTableModule,
                        MatSnackBarModule,
                        MatFormFieldModule,
                        MatIconModule,
                        MatInputModule,
                        MatListModule,
                        MatCheckboxModule,
                        MatButtonModule,
                        MatButtonToggleModule,
                        MatTooltipModule,
                        MatSelectModule,
                        MatAutocompleteModule,
                        ZluxTabbingModule,
                        MatSlideToggleModule,
                        InputTextModule,
                        InputGroupModule,
                        InputGroupAddonModule,
                        ReactiveFormsModule
                    ],
                    exports: [ZluxFileTreeComponent],
                    providers: [
                        KeybindingService,
                        UploaderService,
                        DownloaderService
                    ]
                }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemx1eC1maWxlLXRyZWUubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemx1eC1maWxlLWV4cGxvcmVyL3NyYy9saWIvY29tcG9uZW50cy96bHV4LWZpbGUtdHJlZS96bHV4LWZpbGUtdHJlZS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7Ozs7Ozs7O0VBUUU7QUFFRixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDbEUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDdkUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzNELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDM0QsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDdEUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDaEUsT0FBTyxF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aUJBQWlCO3FCQUNsQjtpQkFDRiIsInNvdXJjZXNDb250ZW50IjpbIlxyXG4vKlxyXG4gIFRoaXMgcHJvZ3JhbSBhbmQgdGhlIGFjY29tcGFueWluZyBtYXRlcmlhbHMgYXJlXHJcbiAgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcclxuICB0aGlzIGRpc3RyaWJ1dGlvbiwgYW5kIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5lY2xpcHNlLm9yZy9sZWdhbC9lcGwtdjIwLmh0bWxcclxuICBcclxuICBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxyXG4gIFxyXG4gIENvcHlyaWdodCBDb250cmlidXRvcnMgdG8gdGhlIFpvd2UgUHJvamVjdC5cclxuKi9cclxuXHJcbmltcG9ydCB7IENvbW1vbk1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9jb21tb25cIjtcclxuaW1wb3J0IHsgTmdNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29yZVwiO1xyXG5pbXBvcnQgeyBGb3Jtc01vZHVsZSwgUmVhY3RpdmVGb3Jtc01vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9mb3Jtc1wiO1xyXG5pbXBvcnQgeyBNYXRBdXRvY29tcGxldGVNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvbWF0ZXJpYWwvYXV0b2NvbXBsZXRlXCI7XHJcbmltcG9ydCB7IE1hdEJ1dHRvbk1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9tYXRlcmlhbC9idXR0b25cIjtcclxuaW1wb3J0IHsgTWF0QnV0dG9uVG9nZ2xlTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL21hdGVyaWFsL2J1dHRvbi10b2dnbGVcIjtcclxuaW1wb3J0IHsgTWF0Q2hlY2tib3hNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvbWF0ZXJpYWwvY2hlY2tib3hcIjtcclxuaW1wb3J0IHsgTWF0RGlhbG9nTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL21hdGVyaWFsL2RpYWxvZ1wiO1xyXG5pbXBvcnQgeyBNYXRGb3JtRmllbGRNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvbWF0ZXJpYWwvZm9ybS1maWVsZFwiO1xyXG5pbXBvcnQgeyBNYXRJY29uTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL21hdGVyaWFsL2ljb25cIjtcclxuaW1wb3J0IHsgTWF0SW5wdXRNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvbWF0ZXJpYWwvaW5wdXRcIjtcclxuaW1wb3J0IHsgTWF0TGlzdE1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9tYXRlcmlhbC9saXN0XCI7XHJcbmltcG9ydCB7IE1hdFNlbGVjdE1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9tYXRlcmlhbC9zZWxlY3RcIjtcclxuaW1wb3J0IHsgTWF0U2xpZGVUb2dnbGVNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvbWF0ZXJpYWwvc2xpZGUtdG9nZ2xlXCI7XHJcbmltcG9ydCB7IE1hdFNuYWNrQmFyTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL21hdGVyaWFsL3NuYWNrLWJhclwiO1xyXG5pbXBvcnQgeyBNYXRUYWJsZU1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9tYXRlcmlhbC90YWJsZVwiO1xyXG5pbXBvcnQgeyBNYXRUb29sdGlwTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL21hdGVyaWFsL3Rvb2x0aXBcIjtcclxuaW1wb3J0IHsgWmx1eFRhYmJpbmdNb2R1bGUgfSBmcm9tIFwiemx1eC13aWRnZXRzXCI7XHJcbmltcG9ydCB7IERvd25sb2FkZXJTZXJ2aWNlIH0gZnJvbSBcIi4uLy4uL3NlcnZpY2VzL2Rvd25sb2FkZXIuc2VydmljZVwiO1xyXG5pbXBvcnQgeyBLZXliaW5kaW5nU2VydmljZSB9IGZyb20gXCIuLi8uLi9zZXJ2aWNlcy9rZXliaW5kaW5nLnNlcnZpY2VcIjtcclxuaW1wb3J0IHsgVXBsb2FkZXJTZXJ2aWNlIH0gZnJvbSBcIi4uLy4uL3NlcnZpY2VzL3VwbG9hZGVyLnNlcnZpY2VcIjtcclxuaW1wb3J0IHsgQ3JlYXRlRGF0YXNldE1vZGFsIH0gZnJvbSBcIi4uL2NyZWF0ZS1kYXRhc2V0LW1vZGFsL2NyZWF0ZS1kYXRhc2V0LW1vZGFsLmNvbXBvbmVudFwiO1xyXG5pbXBvcnQgeyBDcmVhdGVGaWxlTW9kYWwgfSBmcm9tIFwiLi4vY3JlYXRlLWZpbGUtbW9kYWwvY3JlYXRlLWZpbGUtbW9kYWwuY29tcG9uZW50XCI7XHJcbmltcG9ydCB7IENyZWF0ZUZvbGRlck1vZGFsIH0gZnJvbSBcIi4uL2NyZWF0ZS1mb2xkZXItbW9kYWwvY3JlYXRlLWZvbGRlci1tb2RhbC5jb21wb25lbnRcIjtcclxuaW1wb3J0IHsgRGF0YXNldFByb3BlcnRpZXNNb2RhbCB9IGZyb20gXCIuLi9kYXRhc2V0LXByb3BlcnRpZXMtbW9kYWwvZGF0YXNldC1wcm9wZXJ0aWVzLW1vZGFsLmNvbXBvbmVudFwiO1xyXG5pbXBvcnQgeyBEZWxldGVGaWxlTW9kYWwgfSBmcm9tIFwiLi4vZGVsZXRlLWZpbGUtbW9kYWwvZGVsZXRlLWZpbGUtbW9kYWwuY29tcG9uZW50XCI7XHJcbmltcG9ydCB7IEZpbGVPd25lcnNoaXBNb2RhbCB9IGZyb20gXCIuLi9maWxlLW93bmVyc2hpcC1tb2RhbC9maWxlLW93bmVyc2hpcC1tb2RhbC5jb21wb25lbnRcIjtcclxuaW1wb3J0IHsgRmlsZVBlcm1pc3Npb25zTW9kYWwgfSBmcm9tIFwiLi4vZmlsZS1wZXJtaXNzaW9ucy1tb2RhbC9maWxlLXBlcm1pc3Npb25zLW1vZGFsLmNvbXBvbmVudFwiO1xyXG5pbXBvcnQgeyBGaWxlUHJvcGVydGllc01vZGFsIH0gZnJvbSBcIi4uL2ZpbGUtcHJvcGVydGllcy1tb2RhbC9maWxlLXByb3BlcnRpZXMtbW9kYWwuY29tcG9uZW50XCI7XHJcbmltcG9ydCB7IEZpbGVUYWdnaW5nTW9kYWwgfSBmcm9tIFwiLi4vZmlsZS10YWdnaW5nLW1vZGFsL2ZpbGUtdGFnZ2luZy1tb2RhbC5jb21wb25lbnRcIjtcclxuaW1wb3J0IHsgRmlsZUJyb3dzZXJNVlNDb21wb25lbnQgfSBmcm9tIFwiLi4vZmlsZWJyb3dzZXJtdnMvZmlsZWJyb3dzZXJtdnMuY29tcG9uZW50XCI7XHJcbmltcG9ydCB7IEZpbGVCcm93c2VyVVNTQ29tcG9uZW50IH0gZnJvbSBcIi4uL2ZpbGVicm93c2VydXNzL2ZpbGVicm93c2VydXNzLmNvbXBvbmVudFwiO1xyXG5pbXBvcnQgeyBUcmVlQ29tcG9uZW50IH0gZnJvbSBcIi4uL3RyZWUvdHJlZS5jb21wb25lbnRcIjtcclxuaW1wb3J0IHsgVXBsb2FkTW9kYWwgfSBmcm9tIFwiLi4vdXBsb2FkLWZpbGVzLW1vZGFsL3VwbG9hZC1maWxlcy1tb2RhbC5jb21wb25lbnRcIjtcclxuaW1wb3J0IHsgWmx1eEZpbGVUcmVlQ29tcG9uZW50IH0gZnJvbSBcIi4vemx1eC1maWxlLXRyZWUuY29tcG9uZW50XCI7XHJcbmltcG9ydCB7IFRyZWVNb2R1bGUgfSBmcm9tICdwcmltZW5nL3RyZWUnO1xyXG5pbXBvcnQgeyBNZW51TW9kdWxlIH0gZnJvbSAncHJpbWVuZy9tZW51JztcclxuaW1wb3J0IHsgRGlhbG9nTW9kdWxlIH0gZnJvbSBcInByaW1lbmcvZGlhbG9nXCI7XHJcbmltcG9ydCB7IENvbnRleHRNZW51TW9kdWxlIH0gZnJvbSBcInByaW1lbmcvY29udGV4dG1lbnVcIjtcclxuaW1wb3J0IHsgSW5wdXRUZXh0TW9kdWxlIH0gZnJvbSBcInByaW1lbmcvaW5wdXR0ZXh0XCI7XHJcbmltcG9ydCB7IElucHV0R3JvdXBNb2R1bGUgfSBmcm9tICdwcmltZW5nL2lucHV0Z3JvdXAnO1xyXG5pbXBvcnQgeyBJbnB1dEdyb3VwQWRkb25Nb2R1bGUgfSBmcm9tICdwcmltZW5nL2lucHV0Z3JvdXBhZGRvbic7XHJcblxyXG5ATmdNb2R1bGUoe1xyXG4gIGRlY2xhcmF0aW9uczogW1xyXG4gICAgRmlsZUJyb3dzZXJNVlNDb21wb25lbnQsXHJcbiAgICBGaWxlQnJvd3NlclVTU0NvbXBvbmVudCxcclxuICAgIFpsdXhGaWxlVHJlZUNvbXBvbmVudCxcclxuICAgIEZpbGVQcm9wZXJ0aWVzTW9kYWwsXHJcbiAgICBGaWxlUGVybWlzc2lvbnNNb2RhbCxcclxuICAgIEZpbGVPd25lcnNoaXBNb2RhbCxcclxuICAgIEZpbGVUYWdnaW5nTW9kYWwsXHJcbiAgICBEYXRhc2V0UHJvcGVydGllc01vZGFsLFxyXG4gICAgRGVsZXRlRmlsZU1vZGFsLFxyXG4gICAgQ3JlYXRlRm9sZGVyTW9kYWwsXHJcbiAgICBDcmVhdGVGaWxlTW9kYWwsXHJcbiAgICBVcGxvYWRNb2RhbCxcclxuICAgIFRyZWVDb21wb25lbnQsXHJcbiAgICBDcmVhdGVEYXRhc2V0TW9kYWxcclxuICBdLFxyXG4gIGltcG9ydHM6IFtcclxuICAgIENvbW1vbk1vZHVsZSxcclxuICAgIEZvcm1zTW9kdWxlLFxyXG4gICAgVHJlZU1vZHVsZSxcclxuICAgIE1lbnVNb2R1bGUsXHJcbiAgICBNYXREaWFsb2dNb2R1bGUsXHJcbiAgICBEaWFsb2dNb2R1bGUsXHJcbiAgICBDb250ZXh0TWVudU1vZHVsZSxcclxuICAgIE1hdFRhYmxlTW9kdWxlLFxyXG4gICAgTWF0U25hY2tCYXJNb2R1bGUsXHJcbiAgICBNYXRGb3JtRmllbGRNb2R1bGUsXHJcbiAgICBNYXRJY29uTW9kdWxlLFxyXG4gICAgTWF0SW5wdXRNb2R1bGUsXHJcbiAgICBNYXRMaXN0TW9kdWxlLFxyXG4gICAgTWF0Q2hlY2tib3hNb2R1bGUsXHJcbiAgICBNYXRCdXR0b25Nb2R1bGUsXHJcbiAgICBNYXRCdXR0b25Ub2dnbGVNb2R1bGUsXHJcbiAgICBNYXRUb29sdGlwTW9kdWxlLFxyXG4gICAgTWF0U2VsZWN0TW9kdWxlLFxyXG4gICAgTWF0QXV0b2NvbXBsZXRlTW9kdWxlLFxyXG4gICAgWmx1eFRhYmJpbmdNb2R1bGUsXHJcbiAgICBNYXRTbGlkZVRvZ2dsZU1vZHVsZSxcclxuICAgIElucHV0VGV4dE1vZHVsZSxcclxuICAgIElucHV0R3JvdXBNb2R1bGUsXHJcbiAgICBJbnB1dEdyb3VwQWRkb25Nb2R1bGUsXHJcbiAgICBSZWFjdGl2ZUZvcm1zTW9kdWxlXHJcbiAgXSxcclxuICBleHBvcnRzOiBbWmx1eEZpbGVUcmVlQ29tcG9uZW50XSxcclxuICBwcm92aWRlcnM6IFtcclxuICAgIEtleWJpbmRpbmdTZXJ2aWNlLFxyXG4gICAgVXBsb2FkZXJTZXJ2aWNlLFxyXG4gICAgRG93bmxvYWRlclNlcnZpY2VcclxuICBdXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBabHV4RmlsZVRyZWVNb2R1bGUgeyB9XHJcblxyXG5cclxuLypcclxuICBUaGlzIHByb2dyYW0gYW5kIHRoZSBhY2NvbXBhbnlpbmcgbWF0ZXJpYWxzIGFyZVxyXG4gIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRWNsaXBzZSBQdWJsaWMgTGljZW5zZSB2Mi4wIHdoaWNoIGFjY29tcGFuaWVzXHJcbiAgdGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXHJcbiAgXHJcbiAgU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcclxuICBcclxuICBDb3B5cmlnaHQgQ29udHJpYnV0b3JzIHRvIHRoZSBab3dlIFByb2plY3QuXHJcbiovXHJcbiJdfQ==