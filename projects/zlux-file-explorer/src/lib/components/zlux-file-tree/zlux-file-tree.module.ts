
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

@NgModule({
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
        CreateDatasetModal],
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
})
export class ZluxFileTreeModule { }


/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
