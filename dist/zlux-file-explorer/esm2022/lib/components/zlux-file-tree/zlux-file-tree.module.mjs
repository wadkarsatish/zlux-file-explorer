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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiemx1eC1maWxlLXRyZWUubW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemx1eC1maWxlLWV4cGxvcmVyL3NyYy9saWIvY29tcG9uZW50cy96bHV4LWZpbGUtdHJlZS96bHV4LWZpbGUtdHJlZS5tb2R1bGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7Ozs7Ozs7O0VBUUU7QUFFRixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDL0MsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN6QyxPQUFPLEVBQUUsV0FBVyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDbEUsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDdkUsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzNELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3hFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUMzRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUNsRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUN2RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDM0QsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDdEUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDaEUsT0FBTyxF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akIsZUFBZTtZQUNmLHFCQUFxQjtZQUNyQixnQkFBZ0I7WUFDaEIsZUFBZTtZQUNmLHFCQUFxQjtZQUNyQixpQkFBaUI7WUFDakIsb0JBQW9CO1lBQ3BCLGVBQWU7WUFDZixtQkFBbUI7OzJGQVNkLGtCQUFrQjtrQkFoRDlCLFFBQVE7bUJBQUM7b0JBQ04sWUFBWSxFQUFFO3dCQUNWLHVCQUF1Qjt3QkFDdkIsdUJBQXVCO3dCQUN2QixxQkFBcUI7d0JBQ3JCLG1CQUFtQjt3QkFDbkIsb0JBQW9CO3dCQUNwQixrQkFBa0I7d0JBQ2xCLGdCQUFnQjt3QkFDaEIsc0JBQXNCO3dCQUN0QixlQUFlO3dCQUNmLGlCQUFpQjt3QkFDakIsZUFBZTt3QkFDZixXQUFXO3dCQUNYLGFBQWE7d0JBQ2Isa0JBQWtCO3FCQUFDO29CQUN2QixPQUFPLEVBQUU7d0JBQ0wsWUFBWTt3QkFDWixXQUFXO3dCQUNYLFVBQVU7d0JBQ1YsVUFBVTt3QkFDVixlQUFlO3dCQUNmLFlBQVk7d0JBQ1osaUJBQWlCO3dCQUNqQixjQUFjO3dCQUNkLGlCQUFpQjt3QkFDakIsa0JBQWtCO3dCQUNsQixhQUFhO3dCQUNiLGNBQWM7d0JBQ2QsYUFBYTt3QkFDYixpQkFBaUI7d0JBQ2pCLGVBQWU7d0JBQ2YscUJBQXFCO3dCQUNyQixnQkFBZ0I7d0JBQ2hCLGVBQWU7d0JBQ2YscUJBQXFCO3dCQUNyQixpQkFBaUI7d0JBQ2pCLG9CQUFvQjt3QkFDcEIsZUFBZTt3QkFDZixtQkFBbUI7cUJBQ3RCO29CQUNELE9BQU8sRUFBRSxDQUFDLHFCQUFxQixDQUFDO29CQUNoQyxTQUFTLEVBQUU7d0JBQ1AsaUJBQWlCO3dCQUNqQixlQUFlO3dCQUNmLGlCQUFpQjtxQkFDcEI7aUJBQ0oiLCJzb3VyY2VzQ29udGVudCI6WyJcclxuLypcclxuICBUaGlzIHByb2dyYW0gYW5kIHRoZSBhY2NvbXBhbnlpbmcgbWF0ZXJpYWxzIGFyZVxyXG4gIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRWNsaXBzZSBQdWJsaWMgTGljZW5zZSB2Mi4wIHdoaWNoIGFjY29tcGFuaWVzXHJcbiAgdGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXHJcbiAgXHJcbiAgU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcclxuICBcclxuICBDb3B5cmlnaHQgQ29udHJpYnV0b3JzIHRvIHRoZSBab3dlIFByb2plY3QuXHJcbiovXHJcblxyXG5pbXBvcnQgeyBDb21tb25Nb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvY29tbW9uXCI7XHJcbmltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcclxuaW1wb3J0IHsgRm9ybXNNb2R1bGUsIFJlYWN0aXZlRm9ybXNNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvZm9ybXNcIjtcclxuaW1wb3J0IHsgTWF0QXV0b2NvbXBsZXRlTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL21hdGVyaWFsL2F1dG9jb21wbGV0ZVwiO1xyXG5pbXBvcnQgeyBNYXRCdXR0b25Nb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvbWF0ZXJpYWwvYnV0dG9uXCI7XHJcbmltcG9ydCB7IE1hdEJ1dHRvblRvZ2dsZU1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9tYXRlcmlhbC9idXR0b24tdG9nZ2xlXCI7XHJcbmltcG9ydCB7IE1hdENoZWNrYm94TW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL21hdGVyaWFsL2NoZWNrYm94XCI7XHJcbmltcG9ydCB7IE1hdERpYWxvZ01vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2dcIjtcclxuaW1wb3J0IHsgTWF0Rm9ybUZpZWxkTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL21hdGVyaWFsL2Zvcm0tZmllbGRcIjtcclxuaW1wb3J0IHsgTWF0SWNvbk1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9tYXRlcmlhbC9pY29uXCI7XHJcbmltcG9ydCB7IE1hdElucHV0TW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL21hdGVyaWFsL2lucHV0XCI7XHJcbmltcG9ydCB7IE1hdExpc3RNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvbWF0ZXJpYWwvbGlzdFwiO1xyXG5pbXBvcnQgeyBNYXRTZWxlY3RNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvbWF0ZXJpYWwvc2VsZWN0XCI7XHJcbmltcG9ydCB7IE1hdFNsaWRlVG9nZ2xlTW9kdWxlIH0gZnJvbSBcIkBhbmd1bGFyL21hdGVyaWFsL3NsaWRlLXRvZ2dsZVwiO1xyXG5pbXBvcnQgeyBNYXRTbmFja0Jhck1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9tYXRlcmlhbC9zbmFjay1iYXJcIjtcclxuaW1wb3J0IHsgTWF0VGFibGVNb2R1bGUgfSBmcm9tIFwiQGFuZ3VsYXIvbWF0ZXJpYWwvdGFibGVcIjtcclxuaW1wb3J0IHsgTWF0VG9vbHRpcE1vZHVsZSB9IGZyb20gXCJAYW5ndWxhci9tYXRlcmlhbC90b29sdGlwXCI7XHJcbmltcG9ydCB7IFpsdXhUYWJiaW5nTW9kdWxlIH0gZnJvbSBcInpsdXgtd2lkZ2V0c1wiO1xyXG5pbXBvcnQgeyBEb3dubG9hZGVyU2VydmljZSB9IGZyb20gXCIuLi8uLi9zZXJ2aWNlcy9kb3dubG9hZGVyLnNlcnZpY2VcIjtcclxuaW1wb3J0IHsgS2V5YmluZGluZ1NlcnZpY2UgfSBmcm9tIFwiLi4vLi4vc2VydmljZXMva2V5YmluZGluZy5zZXJ2aWNlXCI7XHJcbmltcG9ydCB7IFVwbG9hZGVyU2VydmljZSB9IGZyb20gXCIuLi8uLi9zZXJ2aWNlcy91cGxvYWRlci5zZXJ2aWNlXCI7XHJcbmltcG9ydCB7IENyZWF0ZURhdGFzZXRNb2RhbCB9IGZyb20gXCIuLi9jcmVhdGUtZGF0YXNldC1tb2RhbC9jcmVhdGUtZGF0YXNldC1tb2RhbC5jb21wb25lbnRcIjtcclxuaW1wb3J0IHsgQ3JlYXRlRmlsZU1vZGFsIH0gZnJvbSBcIi4uL2NyZWF0ZS1maWxlLW1vZGFsL2NyZWF0ZS1maWxlLW1vZGFsLmNvbXBvbmVudFwiO1xyXG5pbXBvcnQgeyBDcmVhdGVGb2xkZXJNb2RhbCB9IGZyb20gXCIuLi9jcmVhdGUtZm9sZGVyLW1vZGFsL2NyZWF0ZS1mb2xkZXItbW9kYWwuY29tcG9uZW50XCI7XHJcbmltcG9ydCB7IERhdGFzZXRQcm9wZXJ0aWVzTW9kYWwgfSBmcm9tIFwiLi4vZGF0YXNldC1wcm9wZXJ0aWVzLW1vZGFsL2RhdGFzZXQtcHJvcGVydGllcy1tb2RhbC5jb21wb25lbnRcIjtcclxuaW1wb3J0IHsgRGVsZXRlRmlsZU1vZGFsIH0gZnJvbSBcIi4uL2RlbGV0ZS1maWxlLW1vZGFsL2RlbGV0ZS1maWxlLW1vZGFsLmNvbXBvbmVudFwiO1xyXG5pbXBvcnQgeyBGaWxlT3duZXJzaGlwTW9kYWwgfSBmcm9tIFwiLi4vZmlsZS1vd25lcnNoaXAtbW9kYWwvZmlsZS1vd25lcnNoaXAtbW9kYWwuY29tcG9uZW50XCI7XHJcbmltcG9ydCB7IEZpbGVQZXJtaXNzaW9uc01vZGFsIH0gZnJvbSBcIi4uL2ZpbGUtcGVybWlzc2lvbnMtbW9kYWwvZmlsZS1wZXJtaXNzaW9ucy1tb2RhbC5jb21wb25lbnRcIjtcclxuaW1wb3J0IHsgRmlsZVByb3BlcnRpZXNNb2RhbCB9IGZyb20gXCIuLi9maWxlLXByb3BlcnRpZXMtbW9kYWwvZmlsZS1wcm9wZXJ0aWVzLW1vZGFsLmNvbXBvbmVudFwiO1xyXG5pbXBvcnQgeyBGaWxlVGFnZ2luZ01vZGFsIH0gZnJvbSBcIi4uL2ZpbGUtdGFnZ2luZy1tb2RhbC9maWxlLXRhZ2dpbmctbW9kYWwuY29tcG9uZW50XCI7XHJcbmltcG9ydCB7IEZpbGVCcm93c2VyTVZTQ29tcG9uZW50IH0gZnJvbSBcIi4uL2ZpbGVicm93c2VybXZzL2ZpbGVicm93c2VybXZzLmNvbXBvbmVudFwiO1xyXG5pbXBvcnQgeyBGaWxlQnJvd3NlclVTU0NvbXBvbmVudCB9IGZyb20gXCIuLi9maWxlYnJvd3NlcnVzcy9maWxlYnJvd3NlcnVzcy5jb21wb25lbnRcIjtcclxuaW1wb3J0IHsgVHJlZUNvbXBvbmVudCB9IGZyb20gXCIuLi90cmVlL3RyZWUuY29tcG9uZW50XCI7XHJcbmltcG9ydCB7IFVwbG9hZE1vZGFsIH0gZnJvbSBcIi4uL3VwbG9hZC1maWxlcy1tb2RhbC91cGxvYWQtZmlsZXMtbW9kYWwuY29tcG9uZW50XCI7XHJcbmltcG9ydCB7IFpsdXhGaWxlVHJlZUNvbXBvbmVudCB9IGZyb20gXCIuL3psdXgtZmlsZS10cmVlLmNvbXBvbmVudFwiO1xyXG5pbXBvcnQgeyBUcmVlTW9kdWxlIH0gZnJvbSAncHJpbWVuZy90cmVlJztcclxuaW1wb3J0IHsgTWVudU1vZHVsZSB9IGZyb20gJ3ByaW1lbmcvbWVudSc7XHJcbmltcG9ydCB7IERpYWxvZ01vZHVsZSB9IGZyb20gXCJwcmltZW5nL2RpYWxvZ1wiO1xyXG5pbXBvcnQgeyBDb250ZXh0TWVudU1vZHVsZSB9IGZyb20gXCJwcmltZW5nL2NvbnRleHRtZW51XCI7XHJcbmltcG9ydCB7IElucHV0VGV4dE1vZHVsZSB9IGZyb20gXCJwcmltZW5nL2lucHV0dGV4dFwiO1xyXG5cclxuQE5nTW9kdWxlKHtcclxuICAgIGRlY2xhcmF0aW9uczogW1xyXG4gICAgICAgIEZpbGVCcm93c2VyTVZTQ29tcG9uZW50LFxyXG4gICAgICAgIEZpbGVCcm93c2VyVVNTQ29tcG9uZW50LFxyXG4gICAgICAgIFpsdXhGaWxlVHJlZUNvbXBvbmVudCxcclxuICAgICAgICBGaWxlUHJvcGVydGllc01vZGFsLFxyXG4gICAgICAgIEZpbGVQZXJtaXNzaW9uc01vZGFsLFxyXG4gICAgICAgIEZpbGVPd25lcnNoaXBNb2RhbCxcclxuICAgICAgICBGaWxlVGFnZ2luZ01vZGFsLFxyXG4gICAgICAgIERhdGFzZXRQcm9wZXJ0aWVzTW9kYWwsXHJcbiAgICAgICAgRGVsZXRlRmlsZU1vZGFsLFxyXG4gICAgICAgIENyZWF0ZUZvbGRlck1vZGFsLFxyXG4gICAgICAgIENyZWF0ZUZpbGVNb2RhbCxcclxuICAgICAgICBVcGxvYWRNb2RhbCxcclxuICAgICAgICBUcmVlQ29tcG9uZW50LFxyXG4gICAgICAgIENyZWF0ZURhdGFzZXRNb2RhbF0sXHJcbiAgICBpbXBvcnRzOiBbXHJcbiAgICAgICAgQ29tbW9uTW9kdWxlLFxyXG4gICAgICAgIEZvcm1zTW9kdWxlLFxyXG4gICAgICAgIFRyZWVNb2R1bGUsXHJcbiAgICAgICAgTWVudU1vZHVsZSxcclxuICAgICAgICBNYXREaWFsb2dNb2R1bGUsXHJcbiAgICAgICAgRGlhbG9nTW9kdWxlLFxyXG4gICAgICAgIENvbnRleHRNZW51TW9kdWxlLFxyXG4gICAgICAgIE1hdFRhYmxlTW9kdWxlLFxyXG4gICAgICAgIE1hdFNuYWNrQmFyTW9kdWxlLFxyXG4gICAgICAgIE1hdEZvcm1GaWVsZE1vZHVsZSxcclxuICAgICAgICBNYXRJY29uTW9kdWxlLFxyXG4gICAgICAgIE1hdElucHV0TW9kdWxlLFxyXG4gICAgICAgIE1hdExpc3RNb2R1bGUsXHJcbiAgICAgICAgTWF0Q2hlY2tib3hNb2R1bGUsXHJcbiAgICAgICAgTWF0QnV0dG9uTW9kdWxlLFxyXG4gICAgICAgIE1hdEJ1dHRvblRvZ2dsZU1vZHVsZSxcclxuICAgICAgICBNYXRUb29sdGlwTW9kdWxlLFxyXG4gICAgICAgIE1hdFNlbGVjdE1vZHVsZSxcclxuICAgICAgICBNYXRBdXRvY29tcGxldGVNb2R1bGUsXHJcbiAgICAgICAgWmx1eFRhYmJpbmdNb2R1bGUsXHJcbiAgICAgICAgTWF0U2xpZGVUb2dnbGVNb2R1bGUsXHJcbiAgICAgICAgSW5wdXRUZXh0TW9kdWxlLFxyXG4gICAgICAgIFJlYWN0aXZlRm9ybXNNb2R1bGVcclxuICAgIF0sXHJcbiAgICBleHBvcnRzOiBbWmx1eEZpbGVUcmVlQ29tcG9uZW50XSxcclxuICAgIHByb3ZpZGVyczogW1xyXG4gICAgICAgIEtleWJpbmRpbmdTZXJ2aWNlLFxyXG4gICAgICAgIFVwbG9hZGVyU2VydmljZSxcclxuICAgICAgICBEb3dubG9hZGVyU2VydmljZVxyXG4gICAgXVxyXG59KVxyXG5leHBvcnQgY2xhc3MgWmx1eEZpbGVUcmVlTW9kdWxlIHsgfVxyXG5cclxuXHJcbi8qXHJcbiAgVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcclxuICBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEVjbGlwc2UgUHVibGljIExpY2Vuc2UgdjIuMCB3aGljaCBhY2NvbXBhbmllc1xyXG4gIHRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MjAuaHRtbFxyXG4gIFxyXG4gIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBFUEwtMi4wXHJcbiAgXHJcbiAgQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxyXG4qL1xyXG4iXX0=