

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { Injectable   } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { UtilsService } from './utils.service'

@Injectable()
export class UssCrudService {

  private handleErrorObservable (error: Response | any) {
    console.error(error.message || error);
    return throwError(error.message || error);
  }
  constructor(private http: HttpClient, private utils:UtilsService){}
  makeDirectory(path:string, forceOverwrite?: boolean): Observable<any>{
    let url:string = ZoweZLUX.uriBroker.unixFileUri('mkdir', path, undefined, undefined, undefined, forceOverwrite);
    return this.http.post(url, null).pipe(
      catchError(this.handleErrorObservable)
    )
  }

  makeFile(path:string): Observable<any>{
    let url:string = ZoweZLUX.uriBroker.unixFileUri('touch', path);
    return this.http.post(url, null).pipe(
      catchError(this.handleErrorObservable)
    )
  }

  getFileContents(path:string): Observable<any> {
    let filePath:string = this.utils.filePathCheck(path);
    let url:string = ZoweZLUX.uriBroker.unixFileUri('contents', filePath);
    return this.http.get(url).pipe(
      catchError(this.handleErrorObservable)
    )
  }

  getFileMetadata(path:string): Observable<any> {
    let filePath:string = this.utils.filePathCheck(path);
    let url:string = ZoweZLUX.uriBroker.unixFileUri('metadata', filePath);

    //TODO: Fix ZSS bug where "%2F" is not properly processed as a "/" character
    url = url.split("%2F").join("/");

    return this.http.get(url).pipe(
      catchError(this.handleErrorObservable)
    )
  }

  copyFile(oldPath:string, newPath:string, forceOverwrite?: boolean): Observable<any>{
      let url :string = ZoweZLUX.uriBroker.unixFileUri('copy', oldPath, undefined, undefined, newPath, forceOverwrite, undefined, true);
      return this.http.post(url, null).pipe(
        catchError(this.handleErrorObservable)
      )
  }

  deleteFileOrFolder(path:string): Observable<any>{
    let filePath:string = this.utils.filePathCheck(path);
    let url :string = ZoweZLUX.uriBroker.unixFileUri('contents', filePath);
    return this.http.delete(url).pipe(
      catchError(this.handleErrorObservable)
    )
  }

  renameFile(oldPath:string, newPath:string, forceOverwrite?: boolean): Observable<any>{
      let url :string = ZoweZLUX.uriBroker.unixFileUri('rename', oldPath, undefined, undefined, newPath, forceOverwrite);
      return this.http.post(url, null).pipe(
        catchError(this.handleErrorObservable)
      )
  }

  saveFile(path:string, fileContents:string, targetEncoding?: string, forceOverwrite?: boolean): Observable<any>{
      let url :string = ZoweZLUX.uriBroker.unixFileUri('contents', path, "UTF-8", targetEncoding, undefined, forceOverwrite, undefined, true);
      return this.http.put(url,fileContents).pipe(
        catchError(this.handleErrorObservable)
      )
  }
  
  getUserHomeFolder(): Observable<{home: string}>{
    let url :string = ZoweZLUX.uriBroker.userInfoUri();
    return this.http.get(url).pipe(
      map((res:any)=>res),
      catchError(this.handleErrorObservable)
    )
  }
}

/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

