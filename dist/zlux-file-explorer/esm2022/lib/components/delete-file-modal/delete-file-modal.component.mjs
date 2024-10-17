/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, Inject, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/dialog";
import * as i2 from "@angular/material/button";
import * as i3 from "zlux-widgets";
export class DeleteFileModal {
    constructor(data) {
        this.fileName = '';
        this.fileIcon = '';
        this.onDelete = new EventEmitter();
        const node = data.event;
        this.node = data.event;
        this.fileName = node.name;
        this.fileIcon = "fa fa-ban";
    }
    deleteFileOrFolder() {
        this.onDelete.emit();
    }
    getFileName() {
        if (this.node.data.path) {
            return this.node.data.path;
        }
        else {
            return this.node.path;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: DeleteFileModal, deps: [{ token: MAT_DIALOG_DATA }], target: i0.ɵɵFactoryTarget.Component }); }
    static { this.ɵcmp = i0.ɵɵngDeclareComponent({ minVersion: "14.0.0", version: "18.0.7", type: DeleteFileModal, selector: "delete-file-modal", ngImport: i0, template: "<!-- \r\n  This program and the accompanying materials are\r\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\r\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n  \r\n  SPDX-License-Identifier: EPL-2.0\r\n  \r\n  Copyright Contributors to the Zowe Project.\r\n-->\r\n<zlux-tab-trap></zlux-tab-trap>\r\n<!-- FA Icon is determined by class name, so we hardcode the style here -->\r\n<div class=\"padding-1\">\r\n  <div class=\"d-flex\">\r\n    <div class=\"modal-icon-container\">\r\n      <i class=\"{{fileIcon}}\"\r\n        style=\"font-size: 30px; position: absolute; margin-top: 2px; margin-left: 3px; color: #e64242;padding: 1rem;\"></i>\r\n    </div>\r\n    <div>\r\n      <h2 mat-dialog-title class=\"delete-content-body\">Are you sure you wish to delete</h2>\r\n    </div>\r\n    <div>\r\n      <button mat-dialog-close class=\"close-dialog-btn padding-1\"><i class=\"fa fa-close\"></i></button>\r\n    </div>\r\n  </div>\r\n  <h2 mat-dialog-title class=\"delete-content-body\">{{getFileName()}}?</h2>\r\n  <mat-dialog-actions>\r\n    <button mat-button mat-dialog-close class=\"modal-mat-button-delete\" (click)=\"deleteFileOrFolder()\">Delete</button>\r\n    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->\r\n  </mat-dialog-actions>\r\n</div>\r\n\r\n<!-- \r\n  This program and the accompanying materials are\r\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\r\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n  \r\n  SPDX-License-Identifier: EPL-2.0\r\n  \r\n  Copyright Contributors to the Zowe Project.\r\n-->", styles: [".delete-content-body{margin-left:40px;margin-bottom:-5px;font-size:larger;min-width:400px}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"], dependencies: [{ kind: "directive", type: i1.MatDialogClose, selector: "[mat-dialog-close], [matDialogClose]", inputs: ["aria-label", "type", "mat-dialog-close", "matDialogClose"], exportAs: ["matDialogClose"] }, { kind: "directive", type: i1.MatDialogTitle, selector: "[mat-dialog-title], [matDialogTitle]", inputs: ["id"], exportAs: ["matDialogTitle"] }, { kind: "directive", type: i1.MatDialogActions, selector: "[mat-dialog-actions], mat-dialog-actions, [matDialogActions]", inputs: ["align"] }, { kind: "component", type: i2.MatButton, selector: "    button[mat-button], button[mat-raised-button], button[mat-flat-button],    button[mat-stroked-button]  ", exportAs: ["matButton"] }, { kind: "component", type: i3.ZluxTabbingComponent, selector: "zlux-tab-trap", inputs: ["hiddenIds", "hiddenPos"] }] }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: DeleteFileModal, decorators: [{
            type: Component,
            args: [{ selector: 'delete-file-modal', template: "<!-- \r\n  This program and the accompanying materials are\r\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\r\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n  \r\n  SPDX-License-Identifier: EPL-2.0\r\n  \r\n  Copyright Contributors to the Zowe Project.\r\n-->\r\n<zlux-tab-trap></zlux-tab-trap>\r\n<!-- FA Icon is determined by class name, so we hardcode the style here -->\r\n<div class=\"padding-1\">\r\n  <div class=\"d-flex\">\r\n    <div class=\"modal-icon-container\">\r\n      <i class=\"{{fileIcon}}\"\r\n        style=\"font-size: 30px; position: absolute; margin-top: 2px; margin-left: 3px; color: #e64242;padding: 1rem;\"></i>\r\n    </div>\r\n    <div>\r\n      <h2 mat-dialog-title class=\"delete-content-body\">Are you sure you wish to delete</h2>\r\n    </div>\r\n    <div>\r\n      <button mat-dialog-close class=\"close-dialog-btn padding-1\"><i class=\"fa fa-close\"></i></button>\r\n    </div>\r\n  </div>\r\n  <h2 mat-dialog-title class=\"delete-content-body\">{{getFileName()}}?</h2>\r\n  <mat-dialog-actions>\r\n    <button mat-button mat-dialog-close class=\"modal-mat-button-delete\" (click)=\"deleteFileOrFolder()\">Delete</button>\r\n    <!-- The mat-dialog-close directive optionally accepts a value as a result for the dialog. -->\r\n  </mat-dialog-actions>\r\n</div>\r\n\r\n<!-- \r\n  This program and the accompanying materials are\r\n  made available under the terms of the Eclipse Public License v2.0 which accompanies\r\n  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html\r\n  \r\n  SPDX-License-Identifier: EPL-2.0\r\n  \r\n  Copyright Contributors to the Zowe Project.\r\n-->", styles: [".delete-content-body{margin-left:40px;margin-bottom:-5px;font-size:larger;min-width:400px}\n", "mat-dialog-actions{justify-content:flex-end}.close-dialog-btn{float:right;border:none;background:transparent;outline:none;padding:1rem}.modal-column{float:left;width:50%}.modal-column-full-width{width:100%}.modal-row:after{content:\"\";display:table;clear:both}.modal-row{padding-top:15px;font-size:medium}.modal-title{vertical-align:middle;float:left}.selectable-text{-moz-user-select:text!important;-khtml-user-select:text!important;-webkit-user-select:text!important;-ms-user-select:text!important;user-select:text!important;min-width:200px}.modal-mat-button{border-radius:3px;border:solid;color:#3f51b5;border-width:1.75px;box-shadow:transparent;background-color:transparent;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button.cancel{color:#242424;border-color:transparent;margin-right:5px}.modal-mat-button.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button:hover{background-color:#2c4cff1f;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete{padding:6px;width:85px;border-radius:3px;border:solid;color:#e64242;border-width:1.75px;box-shadow:transparent;background-color:transparent;margin-top:25px;margin-right:-10px;font-family:Roboto,Helvetica Neue,sans-serif;font-size:14px;font-weight:500}.modal-mat-button-delete.cancel{border-color:transparent;color:#242424;margin-top:25px;margin-right:5px}.modal-mat-button-delete.cancel:hover{background-color:#e0e0e0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-button-delete:hover{background-color:#fff0f0;-webkit-transition-duration:.2s;transition-duration:.2s}.modal-mat-header{margin-left:1rem;-webkit-user-select:text;user-select:text}.modal-icon{font-size:24px;position:absolute;margin-top:4px;margin-left:3px}.modal-content-body{margin-left:45px;margin-bottom:-5px;margin-top:1px;font-size:17px;min-width:400px}.modal-clear-button{border-radius:100%;background-color:transparent;border-color:transparent}.modal-clear-button:hover{background-color:#0000001f!important;transition:0!important;-webkit-transition-duration:0!important;transition-duration:0!important}.padding-1{padding:1rem}.d-flex{display:flex}.flex-align-items-start{align-items:flex-start}.modal-icon-container{display:flex;flex-direction:column;justify-content:center}.mat-mdc-button:not(:disabled){color:none}.mat-mdc-form-field-focus-overlay,.mdc-text-field--focused,.mat-mdc-text-field-wrapper:hover{background-color:#fff!important}.mat-mdc-form-field-infix{padding-top:8px!important;padding-bottom:8px!important;min-height:2rem!important}.mdc-text-field{padding:0!important}label{color:#000;font-size:14px}\n"] }]
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MAT_DIALOG_DATA]
                }] }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlLWZpbGUtbW9kYWwuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemx1eC1maWxlLWV4cGxvcmVyL3NyYy9saWIvY29tcG9uZW50cy9kZWxldGUtZmlsZS1tb2RhbC9kZWxldGUtZmlsZS1tb2RhbC5jb21wb25lbnQudHMiLCIuLi8uLi8uLi8uLi8uLi8uLi9wcm9qZWN0cy96bHV4LWZpbGUtZXhwbG9yZXIvc3JjL2xpYi9jb21wb25lbnRzL2RlbGV0ZS1maWxlLW1vZGFsL2RlbGV0ZS1maWxlLW1vZGFsLmNvbXBvbmVudC5odG1sIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBOzs7Ozs7OztFQVFFO0FBQ0YsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ2hFLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQzs7Ozs7QUFRM0QsTUFBTSxPQUFPLGVBQWU7SUFPMUIsWUFDMkIsSUFBSTtRQU54QixhQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ2QsYUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNyQixhQUFRLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQU01QixNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQ3hCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN2QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDMUIsSUFBSSxDQUFDLFFBQVEsR0FBRyxXQUFXLENBQUM7SUFDOUIsQ0FBQztJQUVELGtCQUFrQjtRQUNoQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxXQUFXO1FBQ1QsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN4QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztRQUM3QixDQUFDO2FBQU0sQ0FBQztZQUNOLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDeEIsQ0FBQztJQUNILENBQUM7OEdBMUJVLGVBQWUsa0JBUWhCLGVBQWU7a0dBUmQsZUFBZSx5RENuQjVCLDhyREF1Q0c7OzJGRHBCVSxlQUFlO2tCQU4zQixTQUFTOytCQUNFLG1CQUFtQjs7MEJBYTFCLE1BQU07MkJBQUMsZUFBZSIsInNvdXJjZXNDb250ZW50IjpbIlxyXG4vKlxyXG4gIFRoaXMgcHJvZ3JhbSBhbmQgdGhlIGFjY29tcGFueWluZyBtYXRlcmlhbHMgYXJlXHJcbiAgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcclxuICB0aGlzIGRpc3RyaWJ1dGlvbiwgYW5kIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5lY2xpcHNlLm9yZy9sZWdhbC9lcGwtdjIwLmh0bWxcclxuICBcclxuICBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxyXG4gIFxyXG4gIENvcHlyaWdodCBDb250cmlidXRvcnMgdG8gdGhlIFpvd2UgUHJvamVjdC5cclxuKi9cclxuaW1wb3J0IHsgQ29tcG9uZW50LCBJbmplY3QsIEV2ZW50RW1pdHRlciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBNQVRfRElBTE9HX0RBVEEgfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9kaWFsb2cnO1xyXG5cclxuQENvbXBvbmVudCh7XHJcbiAgc2VsZWN0b3I6ICdkZWxldGUtZmlsZS1tb2RhbCcsXHJcbiAgdGVtcGxhdGVVcmw6ICcuL2RlbGV0ZS1maWxlLW1vZGFsLmNvbXBvbmVudC5odG1sJyxcclxuICBzdHlsZVVybHM6IFsnLi9kZWxldGUtZmlsZS1tb2RhbC5jb21wb25lbnQuc2NzcycsXHJcbiAgICAnLi4vLi4vc2hhcmVkL21vZGFsLmNvbXBvbmVudC5zY3NzJ10sXHJcbn0pXHJcbmV4cG9ydCBjbGFzcyBEZWxldGVGaWxlTW9kYWwge1xyXG5cclxuICBwdWJsaWMgZmlsZU5hbWUgPSAnJztcclxuICBwdWJsaWMgZmlsZUljb24gPSAnJztcclxuICBvbkRlbGV0ZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcclxuICBwcml2YXRlIG5vZGU6IGFueTtcclxuXHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBASW5qZWN0KE1BVF9ESUFMT0dfREFUQSkgZGF0YSxcclxuICApIHtcclxuICAgIGNvbnN0IG5vZGUgPSBkYXRhLmV2ZW50O1xyXG4gICAgdGhpcy5ub2RlID0gZGF0YS5ldmVudDtcclxuICAgIHRoaXMuZmlsZU5hbWUgPSBub2RlLm5hbWU7XHJcbiAgICB0aGlzLmZpbGVJY29uID0gXCJmYSBmYS1iYW5cIjtcclxuICB9XHJcblxyXG4gIGRlbGV0ZUZpbGVPckZvbGRlcigpIHtcclxuICAgIHRoaXMub25EZWxldGUuZW1pdCgpO1xyXG4gIH1cclxuXHJcbiAgZ2V0RmlsZU5hbWUoKSB7XHJcbiAgICBpZiAodGhpcy5ub2RlLmRhdGEucGF0aCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5ub2RlLmRhdGEucGF0aDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLm5vZGUucGF0aDtcclxuICAgIH1cclxuICB9XHJcblxyXG59XHJcblxyXG4vKlxyXG4gIFRoaXMgcHJvZ3JhbSBhbmQgdGhlIGFjY29tcGFueWluZyBtYXRlcmlhbHMgYXJlXHJcbiAgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcclxuICB0aGlzIGRpc3RyaWJ1dGlvbiwgYW5kIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5lY2xpcHNlLm9yZy9sZWdhbC9lcGwtdjIwLmh0bWxcclxuICBcclxuICBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxyXG4gIFxyXG4gIENvcHlyaWdodCBDb250cmlidXRvcnMgdG8gdGhlIFpvd2UgUHJvamVjdC5cclxuKi9cclxuIiwiPCEtLSBcclxuICBUaGlzIHByb2dyYW0gYW5kIHRoZSBhY2NvbXBhbnlpbmcgbWF0ZXJpYWxzIGFyZVxyXG4gIG1hZGUgYXZhaWxhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgRWNsaXBzZSBQdWJsaWMgTGljZW5zZSB2Mi4wIHdoaWNoIGFjY29tcGFuaWVzXHJcbiAgdGhpcyBkaXN0cmlidXRpb24sIGFuZCBpcyBhdmFpbGFibGUgYXQgaHR0cHM6Ly93d3cuZWNsaXBzZS5vcmcvbGVnYWwvZXBsLXYyMC5odG1sXHJcbiAgXHJcbiAgU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEVQTC0yLjBcclxuICBcclxuICBDb3B5cmlnaHQgQ29udHJpYnV0b3JzIHRvIHRoZSBab3dlIFByb2plY3QuXHJcbi0tPlxyXG48emx1eC10YWItdHJhcD48L3psdXgtdGFiLXRyYXA+XHJcbjwhLS0gRkEgSWNvbiBpcyBkZXRlcm1pbmVkIGJ5IGNsYXNzIG5hbWUsIHNvIHdlIGhhcmRjb2RlIHRoZSBzdHlsZSBoZXJlIC0tPlxyXG48ZGl2IGNsYXNzPVwicGFkZGluZy0xXCI+XHJcbiAgPGRpdiBjbGFzcz1cImQtZmxleFwiPlxyXG4gICAgPGRpdiBjbGFzcz1cIm1vZGFsLWljb24tY29udGFpbmVyXCI+XHJcbiAgICAgIDxpIGNsYXNzPVwie3tmaWxlSWNvbn19XCJcclxuICAgICAgICBzdHlsZT1cImZvbnQtc2l6ZTogMzBweDsgcG9zaXRpb246IGFic29sdXRlOyBtYXJnaW4tdG9wOiAycHg7IG1hcmdpbi1sZWZ0OiAzcHg7IGNvbG9yOiAjZTY0MjQyO3BhZGRpbmc6IDFyZW07XCI+PC9pPlxyXG4gICAgPC9kaXY+XHJcbiAgICA8ZGl2PlxyXG4gICAgICA8aDIgbWF0LWRpYWxvZy10aXRsZSBjbGFzcz1cImRlbGV0ZS1jb250ZW50LWJvZHlcIj5BcmUgeW91IHN1cmUgeW91IHdpc2ggdG8gZGVsZXRlPC9oMj5cclxuICAgIDwvZGl2PlxyXG4gICAgPGRpdj5cclxuICAgICAgPGJ1dHRvbiBtYXQtZGlhbG9nLWNsb3NlIGNsYXNzPVwiY2xvc2UtZGlhbG9nLWJ0biBwYWRkaW5nLTFcIj48aSBjbGFzcz1cImZhIGZhLWNsb3NlXCI+PC9pPjwvYnV0dG9uPlxyXG4gICAgPC9kaXY+XHJcbiAgPC9kaXY+XHJcbiAgPGgyIG1hdC1kaWFsb2ctdGl0bGUgY2xhc3M9XCJkZWxldGUtY29udGVudC1ib2R5XCI+e3tnZXRGaWxlTmFtZSgpfX0/PC9oMj5cclxuICA8bWF0LWRpYWxvZy1hY3Rpb25zPlxyXG4gICAgPGJ1dHRvbiBtYXQtYnV0dG9uIG1hdC1kaWFsb2ctY2xvc2UgY2xhc3M9XCJtb2RhbC1tYXQtYnV0dG9uLWRlbGV0ZVwiIChjbGljayk9XCJkZWxldGVGaWxlT3JGb2xkZXIoKVwiPkRlbGV0ZTwvYnV0dG9uPlxyXG4gICAgPCEtLSBUaGUgbWF0LWRpYWxvZy1jbG9zZSBkaXJlY3RpdmUgb3B0aW9uYWxseSBhY2NlcHRzIGEgdmFsdWUgYXMgYSByZXN1bHQgZm9yIHRoZSBkaWFsb2cuIC0tPlxyXG4gIDwvbWF0LWRpYWxvZy1hY3Rpb25zPlxyXG48L2Rpdj5cclxuXHJcbjwhLS0gXHJcbiAgVGhpcyBwcm9ncmFtIGFuZCB0aGUgYWNjb21wYW55aW5nIG1hdGVyaWFscyBhcmVcclxuICBtYWRlIGF2YWlsYWJsZSB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEVjbGlwc2UgUHVibGljIExpY2Vuc2UgdjIuMCB3aGljaCBhY2NvbXBhbmllc1xyXG4gIHRoaXMgZGlzdHJpYnV0aW9uLCBhbmQgaXMgYXZhaWxhYmxlIGF0IGh0dHBzOi8vd3d3LmVjbGlwc2Uub3JnL2xlZ2FsL2VwbC12MjAuaHRtbFxyXG4gIFxyXG4gIFNQRFgtTGljZW5zZS1JZGVudGlmaWVyOiBFUEwtMi4wXHJcbiAgXHJcbiAgQ29weXJpZ2h0IENvbnRyaWJ1dG9ycyB0byB0aGUgWm93ZSBQcm9qZWN0LlxyXG4tLT4iXX0=