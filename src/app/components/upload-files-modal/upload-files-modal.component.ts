
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Component, Inject, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UploaderService } from '../../services/uploader.service';
import { defaultSnackbarOptions } from '../../shared/snackbar-options';

import './upload-files-modal.component.scss';
import '../../../../src/app/shared/modal.component.scss';
@Component({
  selector: 'upload-files-modal',
  templateUrl: './upload-files-modal.component.html'
})
export class UploadModal {

  public folderPath = "";
  public onUpload = new EventEmitter();
  @ViewChild('fileUpload') fileUpload: ElementRef;
  public files: Array<File>;
  private fileEncodings: Array<string>;
  private encodings = [
    // { TODO: API Bug - Upload fails with Binary as target for now
    //     name: 'BINARY',
    //     value: 'BINARY',
    //     selected: true
    // },
    {
      name: 'UTF-8',
      value: 'UTF-8',
      selected: false
    },
    {
      name: 'ISO-8859-1',
      value: 'ISO-8859-1',
      selected: false
    },
    {
      name: 'International EBCDIC 1047',
      value: 'IBM-1047',
      selected: false
    },
    // { TODO: These encodings don't work yet in API
    //     name: 'German/Austrian EBCDIC 273',
    //     value: 'IBM-273',
    //     selected: false
    // },
    // {
    //     name: 'Danish/Norwegian EBCDIC 277',
    //     value: 'IBM-277',
    //     selected: false
    // },
    // {
    //     name: 'Finnish/Swedish EBCDIC 278',
    //     value: 'IBM-278',
    //     selected: false
    // },
    // {
    //     name: 'Italian EBCDIC 278',
    //     value: 'IBM-278',
    //     selected: false
    // },
    // {
    //     name: 'Japanese Katakana 290',
    //     value: 'IBM-290',
    //     selected: false
    // },
    // {
    //     name: 'French EBCDIC 297',
    //     value: 'IBM-297',
    //     selected: false
    // },
    // {
    //     name: 'Arabic (type 4) EBCDIC 420',
    //     value: 'IBM-420',
    //     selected: false
    // },
    // {
    //     name: 'Hebrew EBCDIC 424',
    //     value: 'IBM-424',
    //     selected: false
    // },
    // {
    //     name: 'International EBCDIC 500',
    //     value: 'IBM-500',
    //     selected: false
    // },
    // {
    //     name: 'Thai EBCDIC 838',
    //     value: 'IBM-838',
    //     selected: false
    // },
    // {
    //     name: 'Croat/Czech/Polish/Serbian/Slovak EBCDIC 870',
    //     value: 'IBM-870',
    //     selected: false
    // },
    // {
    //     name: 'Greek EBCDIC 875',
    //     value: 'IBM-875',
    //     selected: false
    // },
    // {
    //     name: 'Urdu EBCDIC 918',
    //     value: 'IBM-918',
    //     selected: false
    // },
    // {
    //     name: 'Cyrillic(Russian) EBCDIC 1025',
    //     value: 'IBM-1025',
    //     selected: false
    // },
    // {
    //     name: 'Turkish EBCDIC 1026',
    //     value: 'IBM-1026',
    //     selected: false
    // },
    // {
    //     name: 'Farsi Bilingual EBCDIC 1097',
    //     value: 'IBM-1097',
    //     selected: false
    // },
    // {
    //     name: 'Baltic Multilingual EBCDIC 1112',
    //     value: 'IBM-1112',
    //     selected: false
    // },
    // {
    //     name: 'Devanagari EBCDIC 1137',
    //     value: 'IBM-1137',
    //     selected: false
    // },
    // {
    //     name: 'Chinese Traditional EBCDIC 937',
    //     value: 'IBM-937',
    //     selected: false
    // },
    // {
    //     name: 'Chinese Simplified EBCDIC 935',
    //     value: 'IBM-935',
    //     selected: false
    // },
    // {
    //     name: 'Japanese EBCDIC 930',
    //     value: 'IBM-930',
    //     selected: false
    // },
    // {
    //     name: 'Japanese EBCDIC 931',
    //     value: 'IBM-931',
    //     selected: false
    // },
    // {
    //     name: 'Japanese EBCDIC 939',
    //     value: 'IBM-939',
    //     selected: false
    // },
    // {
    //     name: 'Japanese EBCDIC 1390',
    //     value: 'IBM-1390',
    //     selected: false
    // },
    // {
    //     name: 'Japanese EBCDIC 1399',
    //     value: 'IBM-1399',
    //     selected: false
    // },
    // {
    //     name: 'Korean EBCDIC 933',
    //     value: 'IBM-933',
    //     selected: false
    // }
  ];
  private filteredOptions = [];
  private selectedOption = "";
  public selectedOptionValid = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) data, private uploader: UploaderService, private snackBar: MatSnackBar
  ) {
    const node = data.event;
    if (node.data && node.data == "Folder") {
      this.folderPath = node.path;
    } else if (node.data) { // Takes folder name from folder name + path
      this.folderPath = node.path.replace(/\/$/, '').replace(/\/[^\/]+$/, '');
    } else {
      this.folderPath = node;
    }
    this.files = new Array<File>();
    this.fileEncodings = new Array<string>();
    this.filteredOptions = this.fileEncodings;
  }

  addFile() {
    if (this.fileUpload) {
      this.fileUpload.nativeElement.click();
    }
  }

  onFileUploaded(event: any): void {
    if (this.files.length > 0) {
      this.files = new Array<File>();
    }
    // TODO: This Array filter method is already set up for multi-file select. Now we just need to add a queue for multiple files upload
    const names = Array.from(this.files, file => file.name);
    for (let file of event.target.files) {
      if (!(names.includes(file.name))) {
        this.files.push(file);
        //this.fileEncodings.push('BINARY');
      }
    }
  }

  onValueChange(value?: string): void {
    if (value) {
      for (let i = 0; i < this.encodings.length; i++) {
        if (this.encodings[i].value == value) {
          this.selectedOptionValid = true;
          return;
        }
      }
    }
    this.selectedOptionValid = false;
  }

  uploadHandlerSetup(): void {

    // We should make a queue that holds the list of files we wish to upload
    // That queue should likely be stored in a service (probably the uploader service that exists)

    const filesCopy = this.files;
    const fileEncodingsCopy = this.fileEncodings;
    let fileIdx = 0;
    const uploadFiles = () => {
      if (fileIdx < filesCopy.length) {
        const file = filesCopy[fileIdx];
        this.uploader.chunkAndSendFile(file, this.folderPath, this.selectedOption)
          .subscribe(
            value => { // TODO: Future upload progress bar
            },
            error => { // Error caught upstream in service
            },
            () => {
              this.onUpload.emit();
              this.snackBar.open(file.name + ' has been successfully uploaded. ',
                'Dismiss', defaultSnackbarOptions);
            }
          );
      }
    }
    uploadFiles();
  }

}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
