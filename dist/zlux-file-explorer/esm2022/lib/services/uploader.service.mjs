/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
import { Inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Angular2InjectionTokens } from '../../pluginlib/inject-resources';
import { longSnackbarOptions } from '../shared/snackbar-options';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
import * as i2 from "@angular/material/snack-bar";
export class UploaderService {
    constructor(http, log, snackBar) {
        this.http = http;
        this.log = log;
        this.snackBar = snackBar;
    }
    // uploadDirPath should be a directory on the remote server without a / at the end.
    // Example: '/u/ts6531'
    chunkAndSendFile(file, uploadDirPath, targetEncoding) {
        return new Observable(observer => {
            const fileSize = file.size;
            const chunkSize = 3 * 1024 * 1024; // bytes
            let sourceEncoding;
            targetEncoding === 'BINARY' ? sourceEncoding = 'BINARY' : sourceEncoding = 'UTF-8';
            let chunkIdx = 0;
            let offset = 0;
            let sessionID;
            const uri = ZoweZLUX.uriBroker.unixFileUri('contents', uploadDirPath.slice(1) + '/' + file.name, sourceEncoding, targetEncoding, undefined, true);
            //console.table({'URI': uri, 'File Name': file.name, 'File Size': fileSize, 'Chunk Size': chunkSize}); - easy to see, useful for dev
            // Initiate connection with the zssServer
            const getSessionID = () => {
                return this.http.put(uri, '');
            };
            // Generate the HTTP PUT request and return an Observable for the response
            const sendChunk = (blob, lastChunk, sessionID) => {
                let parameters = new HttpParams();
                parameters = parameters.append('chunkIndex', chunkIdx.toString());
                if (sessionID) {
                    parameters = parameters.append('sessionID', sessionID.toString());
                }
                if (lastChunk) {
                    parameters = parameters.append('lastChunk', 'true');
                }
                else {
                    parameters = parameters.append('lastChunk', 'false');
                }
                const options = {
                    params: parameters
                };
                return this.http.put(uri, blob, options);
            };
            // Once the chunk is read we must package it in an HTTP request and send it to the zss Server
            const readEventHandler = (event) => {
                if (event.target.error === null) {
                    offset += chunkSize;
                    let lastChunk = false;
                    if (offset >= fileSize) {
                        offset = fileSize;
                        lastChunk = true;
                        this.log.debug('Sending last chunk');
                    }
                    // console.table({'offset': offset, 'fileSize': fileSize, 'progress': offset / fileSize}); - easy to see, useful for dev
                    observer.next(offset / fileSize);
                    const commaIdx = event.target.result.indexOf(',');
                    sendChunk(event.target.result.slice(commaIdx + 1), lastChunk, sessionID)
                        .subscribe((response) => {
                        this.log.debug('Chunk sent - chunkIdx:', chunkIdx, ', offset:', offset);
                        if (offset < fileSize) {
                            chunkReaderBlock(offset, chunkSize, file);
                            chunkIdx++;
                        }
                        else {
                            observer.complete();
                        }
                    }, (error) => {
                        this.log.debug(error);
                        observer.error();
                    });
                }
                else {
                    this.log.debug('Read Error: ' + event.target.error);
                    return;
                }
            };
            // Read slice of file, then run the readEventHandler
            const chunkReaderBlock = (_offset, length, _file) => {
                const reader = new FileReader();
                const blob = _file.slice(_offset, length + _offset);
                reader.onload = readEventHandler;
                reader.readAsDataURL(blob); // Base 64
            };
            getSessionID()
                .subscribe((response) => {
                sessionID = response['sessionID'];
                chunkReaderBlock(offset, chunkSize, file);
            }, (error) => {
                this.snackBar.open(("An error occurred while uploading " + file.name + " - " + error.error.error), 'Dismiss', longSnackbarOptions);
                this.log.debug(error);
            });
        });
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: UploaderService, deps: [{ token: i1.HttpClient }, { token: Angular2InjectionTokens.LOGGER }, { token: i2.MatSnackBar }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: UploaderService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: UploaderService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.LOGGER]
                }] }, { type: i2.MatSnackBar }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXBsb2FkZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Byb2plY3RzL3psdXgtZmlsZS1leHBsb3Jlci9zcmMvbGliL3NlcnZpY2VzL3VwbG9hZGVyLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O0VBUUU7QUFFRixPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNuRCxPQUFPLEVBQWMsVUFBVSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDOUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUNsQyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUMzRSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQzs7OztBQUlqRSxNQUFNLE9BQU8sZUFBZTtJQUN4QixZQUFvQixJQUFnQixFQUNnQixHQUF5QixFQUNqRSxRQUFxQjtRQUZiLFNBQUksR0FBSixJQUFJLENBQVk7UUFDZ0IsUUFBRyxHQUFILEdBQUcsQ0FBc0I7UUFDakUsYUFBUSxHQUFSLFFBQVEsQ0FBYTtJQUFJLENBQUM7SUFFdEMsbUZBQW1GO0lBQ25GLHVCQUF1QjtJQUN2QixnQkFBZ0IsQ0FBQyxJQUFVLEVBQUUsYUFBcUIsRUFBRSxjQUFzQjtRQUN0RSxPQUFPLElBQUksVUFBVSxDQUNqQixRQUFRLENBQUMsRUFBRTtZQUNQLE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7WUFDM0IsTUFBTSxTQUFTLEdBQUksQ0FBQyxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQyxRQUFRO1lBQzVDLElBQUksY0FBYyxDQUFDO1lBQ25CLGNBQWMsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLGNBQWMsR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLGNBQWMsR0FBRyxPQUFPLENBQUM7WUFDbkYsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ2pCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQztZQUNmLElBQUksU0FBaUIsQ0FBQztZQUN0QixNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksRUFDL0YsY0FBYyxFQUFFLGNBQWMsRUFBRSxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFFakQsb0lBQW9JO1lBRXBJLHlDQUF5QztZQUN6QyxNQUFNLFlBQVksR0FBRyxHQUFHLEVBQUU7Z0JBQ3RCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2xDLENBQUMsQ0FBQTtZQUVELDBFQUEwRTtZQUMxRSxNQUFNLFNBQVMsR0FBRyxDQUFDLElBQVUsRUFBRSxTQUFrQixFQUFFLFNBQWlCLEVBQUUsRUFBRTtnQkFDcEUsSUFBSSxVQUFVLEdBQUcsSUFBSSxVQUFVLEVBQUUsQ0FBQztnQkFDbEMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsWUFBWSxFQUFFLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO2dCQUVsRSxJQUFJLFNBQVMsRUFBRSxDQUFDO29CQUNaLFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztnQkFDdEUsQ0FBQztnQkFDRCxJQUFJLFNBQVMsRUFBRSxDQUFDO29CQUNaLFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDeEQsQ0FBQztxQkFBTSxDQUFDO29CQUNKLFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDekQsQ0FBQztnQkFDRCxNQUFNLE9BQU8sR0FBRztvQkFDWixNQUFNLEVBQUUsVUFBVTtpQkFDckIsQ0FBQTtnQkFDRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDN0MsQ0FBQyxDQUFBO1lBRUQsNkZBQTZGO1lBQzdGLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxLQUFVLEVBQUUsRUFBRTtnQkFDcEMsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUUsQ0FBQztvQkFDOUIsTUFBTSxJQUFJLFNBQVMsQ0FBQztvQkFFcEIsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDO29CQUN0QixJQUFJLE1BQU0sSUFBSSxRQUFRLEVBQUUsQ0FBQzt3QkFDckIsTUFBTSxHQUFHLFFBQVEsQ0FBQzt3QkFDbEIsU0FBUyxHQUFHLElBQUksQ0FBQzt3QkFDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztvQkFDekMsQ0FBQztvQkFFRCx3SEFBd0g7b0JBQ3hILFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLFFBQVEsQ0FBQyxDQUFDO29CQUVqQyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBRWxELFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUM7eUJBQ25FLFNBQVMsQ0FDTixDQUFDLFFBQWEsRUFBRSxFQUFFO3dCQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLHdCQUF3QixFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7d0JBQ3hFLElBQUksTUFBTSxHQUFHLFFBQVEsRUFBRSxDQUFDOzRCQUNwQixnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDOzRCQUMxQyxRQUFRLEVBQUUsQ0FBQzt3QkFDZixDQUFDOzZCQUFNLENBQUM7NEJBQ0osUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO3dCQUN4QixDQUFDO29CQUNMLENBQUMsRUFDRCxDQUFDLEtBQVUsRUFBRSxFQUFFO3dCQUNYLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO3dCQUN0QixRQUFRLENBQUMsS0FBSyxFQUFFLENBQUM7b0JBQ3JCLENBQUMsQ0FDSixDQUFDO2dCQUNWLENBQUM7cUJBQU0sQ0FBQztvQkFDSixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxjQUFjLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDcEQsT0FBTztnQkFDWCxDQUFDO1lBQ0wsQ0FBQyxDQUFDO1lBRUYsb0RBQW9EO1lBQ3BELE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxPQUFlLEVBQUUsTUFBYyxFQUFFLEtBQVcsRUFBRSxFQUFFO2dCQUN0RSxNQUFNLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNoQyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxNQUFNLEdBQUcsT0FBTyxDQUFDLENBQUM7Z0JBQ3BELE1BQU0sQ0FBQyxNQUFNLEdBQUcsZ0JBQWdCLENBQUM7Z0JBQ2pDLE1BQU0sQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVO1lBQzFDLENBQUMsQ0FBQTtZQUVELFlBQVksRUFBRTtpQkFDVCxTQUFTLENBQUMsQ0FBQyxRQUFhLEVBQUUsRUFBRTtnQkFDekIsU0FBUyxHQUFHLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztnQkFDbEMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM5QyxDQUFDLEVBQUUsQ0FBQyxLQUFVLEVBQUUsRUFBRTtnQkFDZCxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLG9DQUFvQyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEVBQy9HLFNBQVMsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO2dCQUNsQixJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMxQixDQUFDLENBQUMsQ0FBQztRQUNYLENBQUMsQ0FDSixDQUFDO0lBQ04sQ0FBQzs4R0F4R1EsZUFBZSw0Q0FFWix1QkFBdUIsQ0FBQyxNQUFNO2tIQUZqQyxlQUFlOzsyRkFBZixlQUFlO2tCQUQzQixVQUFVOzswQkFHRixNQUFNOzJCQUFDLHVCQUF1QixDQUFDLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gIFRoaXMgcHJvZ3JhbSBhbmQgdGhlIGFjY29tcGFueWluZyBtYXRlcmlhbHMgYXJlXHJcbiAgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcclxuICB0aGlzIGRpc3RyaWJ1dGlvbiwgYW5kIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5lY2xpcHNlLm9yZy9sZWdhbC9lcGwtdjIwLmh0bWxcclxuICBcclxuICBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxyXG4gIFxyXG4gIENvcHlyaWdodCBDb250cmlidXRvcnMgdG8gdGhlIFpvd2UgUHJvamVjdC5cclxuKi9cclxuXHJcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBIdHRwQ2xpZW50LCBIdHRwUGFyYW1zIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xyXG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IEFuZ3VsYXIySW5qZWN0aW9uVG9rZW5zIH0gZnJvbSAnLi4vLi4vcGx1Z2lubGliL2luamVjdC1yZXNvdXJjZXMnO1xyXG5pbXBvcnQgeyBsb25nU25hY2tiYXJPcHRpb25zIH0gZnJvbSAnLi4vc2hhcmVkL3NuYWNrYmFyLW9wdGlvbnMnO1xyXG5pbXBvcnQgeyBNYXRTbmFja0JhciB9IGZyb20gJ0Bhbmd1bGFyL21hdGVyaWFsL3NuYWNrLWJhcic7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBVcGxvYWRlclNlcnZpY2Uge1xyXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBodHRwOiBIdHRwQ2xpZW50LCBcclxuICAgICAgICBASW5qZWN0KEFuZ3VsYXIySW5qZWN0aW9uVG9rZW5zLkxPR0dFUikgcHJpdmF0ZSBsb2c6IFpMVVguQ29tcG9uZW50TG9nZ2VyLFxyXG4gICAgICAgIHByaXZhdGUgc25hY2tCYXI6IE1hdFNuYWNrQmFyKSB7IH1cclxuXHJcbiAgICAvLyB1cGxvYWREaXJQYXRoIHNob3VsZCBiZSBhIGRpcmVjdG9yeSBvbiB0aGUgcmVtb3RlIHNlcnZlciB3aXRob3V0IGEgLyBhdCB0aGUgZW5kLlxyXG4gICAgLy8gRXhhbXBsZTogJy91L3RzNjUzMSdcclxuICAgIGNodW5rQW5kU2VuZEZpbGUoZmlsZTogRmlsZSwgdXBsb2FkRGlyUGF0aDogc3RyaW5nLCB0YXJnZXRFbmNvZGluZzogc3RyaW5nKTogT2JzZXJ2YWJsZTxudW1iZXI+IHtcclxuICAgICAgICByZXR1cm4gbmV3IE9ic2VydmFibGUoXHJcbiAgICAgICAgICAgIG9ic2VydmVyID0+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGVTaXplID0gZmlsZS5zaXplO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgY2h1bmtTaXplID0gIDMgKiAxMDI0ICogMTAyNDsgLy8gYnl0ZXNcclxuICAgICAgICAgICAgICAgIGxldCBzb3VyY2VFbmNvZGluZztcclxuICAgICAgICAgICAgICAgIHRhcmdldEVuY29kaW5nID09PSAnQklOQVJZJyA/IHNvdXJjZUVuY29kaW5nID0gJ0JJTkFSWScgOiBzb3VyY2VFbmNvZGluZyA9ICdVVEYtOCc7XHJcbiAgICAgICAgICAgICAgICBsZXQgY2h1bmtJZHggPSAwO1xyXG4gICAgICAgICAgICAgICAgbGV0IG9mZnNldCA9IDA7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2Vzc2lvbklEOiBudW1iZXI7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB1cmkgPSBab3dlWkxVWC51cmlCcm9rZXIudW5peEZpbGVVcmkoJ2NvbnRlbnRzJywgdXBsb2FkRGlyUGF0aC5zbGljZSgxKSArICcvJyArIGZpbGUubmFtZSxcclxuICAgICAgICAgICAgICAgIHNvdXJjZUVuY29kaW5nLCB0YXJnZXRFbmNvZGluZywgdW5kZWZpbmVkLCB0cnVlKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUudGFibGUoeydVUkknOiB1cmksICdGaWxlIE5hbWUnOiBmaWxlLm5hbWUsICdGaWxlIFNpemUnOiBmaWxlU2l6ZSwgJ0NodW5rIFNpemUnOiBjaHVua1NpemV9KTsgLSBlYXN5IHRvIHNlZSwgdXNlZnVsIGZvciBkZXZcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJbml0aWF0ZSBjb25uZWN0aW9uIHdpdGggdGhlIHpzc1NlcnZlclxyXG4gICAgICAgICAgICAgICAgY29uc3QgZ2V0U2Vzc2lvbklEID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmh0dHAucHV0KHVyaSwgJycpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEdlbmVyYXRlIHRoZSBIVFRQIFBVVCByZXF1ZXN0IGFuZCByZXR1cm4gYW4gT2JzZXJ2YWJsZSBmb3IgdGhlIHJlc3BvbnNlXHJcbiAgICAgICAgICAgICAgICBjb25zdCBzZW5kQ2h1bmsgPSAoYmxvYjogQmxvYiwgbGFzdENodW5rOiBib29sZWFuLCBzZXNzaW9uSUQ6IG51bWJlcikgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGxldCBwYXJhbWV0ZXJzID0gbmV3IEh0dHBQYXJhbXMoKTtcclxuICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzID0gcGFyYW1ldGVycy5hcHBlbmQoJ2NodW5rSW5kZXgnLCBjaHVua0lkeC50b1N0cmluZygpKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlc3Npb25JRCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzID0gcGFyYW1ldGVycy5hcHBlbmQoJ3Nlc3Npb25JRCcsIHNlc3Npb25JRC50b1N0cmluZygpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhc3RDaHVuaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbWV0ZXJzID0gcGFyYW1ldGVycy5hcHBlbmQoJ2xhc3RDaHVuaycsICd0cnVlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1ldGVycyA9IHBhcmFtZXRlcnMuYXBwZW5kKCdsYXN0Q2h1bmsnLCAnZmFsc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyYW1zOiBwYXJhbWV0ZXJzXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmh0dHAucHV0KHVyaSwgYmxvYiwgb3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gT25jZSB0aGUgY2h1bmsgaXMgcmVhZCB3ZSBtdXN0IHBhY2thZ2UgaXQgaW4gYW4gSFRUUCByZXF1ZXN0IGFuZCBzZW5kIGl0IHRvIHRoZSB6c3MgU2VydmVyXHJcbiAgICAgICAgICAgICAgICBjb25zdCByZWFkRXZlbnRIYW5kbGVyID0gKGV2ZW50OiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LmVycm9yID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldCArPSBjaHVua1NpemU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgbGFzdENodW5rID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvZmZzZXQgPj0gZmlsZVNpemUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IGZpbGVTaXplO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdENodW5rID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubG9nLmRlYnVnKCdTZW5kaW5nIGxhc3QgY2h1bmsnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS50YWJsZSh7J29mZnNldCc6IG9mZnNldCwgJ2ZpbGVTaXplJzogZmlsZVNpemUsICdwcm9ncmVzcyc6IG9mZnNldCAvIGZpbGVTaXplfSk7IC0gZWFzeSB0byBzZWUsIHVzZWZ1bCBmb3IgZGV2XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLm5leHQob2Zmc2V0IC8gZmlsZVNpemUpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tbWFJZHggPSBldmVudC50YXJnZXQucmVzdWx0LmluZGV4T2YoJywnKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbmRDaHVuayhldmVudC50YXJnZXQucmVzdWx0LnNsaWNlKGNvbW1hSWR4ICsgMSksIGxhc3RDaHVuaywgc2Vzc2lvbklEKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnN1YnNjcmliZShcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAocmVzcG9uc2U6IGFueSkgPT4geyAvLyBzdWNjZXNzZnVsIFBVVFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZygnQ2h1bmsgc2VudCAtIGNodW5rSWR4OicsIGNodW5rSWR4LCAnLCBvZmZzZXQ6Jywgb2Zmc2V0KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9mZnNldCA8IGZpbGVTaXplKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaHVua1JlYWRlckJsb2NrKG9mZnNldCwgY2h1bmtTaXplLCBmaWxlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rSWR4Kys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYnNlcnZlci5jb21wbGV0ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoZXJyb3I6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9ic2VydmVyLmVycm9yKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZy5kZWJ1ZygnUmVhZCBFcnJvcjogJyArIGV2ZW50LnRhcmdldC5lcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJlYWQgc2xpY2Ugb2YgZmlsZSwgdGhlbiBydW4gdGhlIHJlYWRFdmVudEhhbmRsZXJcclxuICAgICAgICAgICAgICAgIGNvbnN0IGNodW5rUmVhZGVyQmxvY2sgPSAoX29mZnNldDogbnVtYmVyLCBsZW5ndGg6IG51bWJlciwgX2ZpbGU6IEZpbGUpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGJsb2IgPSBfZmlsZS5zbGljZShfb2Zmc2V0LCBsZW5ndGggKyBfb2Zmc2V0KTtcclxuICAgICAgICAgICAgICAgICAgICByZWFkZXIub25sb2FkID0gcmVhZEV2ZW50SGFuZGxlcjtcclxuICAgICAgICAgICAgICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChibG9iKTsgLy8gQmFzZSA2NFxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGdldFNlc3Npb25JRCgpXHJcbiAgICAgICAgICAgICAgICAgICAgLnN1YnNjcmliZSgocmVzcG9uc2U6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uSUQgPSByZXNwb25zZVsnc2Vzc2lvbklEJ107XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNodW5rUmVhZGVyQmxvY2sob2Zmc2V0LCBjaHVua1NpemUsIGZpbGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0sIChlcnJvcjogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc25hY2tCYXIub3BlbigoXCJBbiBlcnJvciBvY2N1cnJlZCB3aGlsZSB1cGxvYWRpbmcgXCIgKyBmaWxlLm5hbWUgKyBcIiAtIFwiICsgZXJyb3IuZXJyb3IuZXJyb3IpLFxyXG4gICAgICAgICAgJ0Rpc21pc3MnLCBsb25nU25hY2tiYXJPcHRpb25zKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2cuZGVidWcoZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG4iXX0=