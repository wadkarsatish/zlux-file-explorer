// /*
//   This program and the accompanying materials are
//   made available under the terms of the Eclipse Public License v2.0 which accompanies
//   this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
//   SPDX-License-Identifier: EPL-2.0
//   Copyright Contributors to the Zowe Project.
// */

import { Inject, Injectable } from '@angular/core';
import * as streamSaver from 'streamsaver'
import { Angular2InjectionTokens } from 'pluginlib/inject-resources';
import { WritableStream, ReadableStream, CountQueuingStrategy } from 'web-streams-polyfill'

export enum ConfigVariables {
  ASCII = "819", 
  EBCDIC = "1047",
  UTF8 = "1208"
}

@Injectable()
export class DownloaderService {
    abortController: AbortController;
    abortSignal: AbortSignal;
    currentWriter: any;
    downObj = null;
    finalObj = null;
    totalSize = 1;
    startTime = 0;

    constructor(@Inject(Angular2InjectionTokens.LOGGER) private log: ZLUX.ComponentLogger,) {
    }

    async fetchFileHandler(fetchPath: string, fileName: string, downloadObject:any): Promise<any> {
      this.abortController =  new AbortController();
      this.abortSignal = this.abortController.signal;
      this.totalSize = downloadObject.size;

      // Define the endcoding type.
      if(downloadObject.sourceEncoding != undefined && downloadObject.targetEncoding != undefined){
        let queriesObject =
          {
           "source": downloadObject.sourceEncoding,
           "target": downloadObject.targetEncoding
          };
        
        fetchPath = fetchPath+"?"+await this.getQueryString(queriesObject);
      }

      const response = await fetch(fetchPath, {signal: this.abortSignal})

      // Mock size for now
      // this.totalSize =  Number(response.headers.get('X-zowe-filesize'));

      this.startTime = new Date().getTime();

      // TODO: The following core download logic is from the FTA & may require refactoring or future bug-proofing
      // get the stream from the resposnse body.
      const readbleStream = response.body != null ? response.body : Promise.reject("Cannot receive data from the host machine");
      // queueing strategy.
      const queuingStrategy = new CountQueuingStrategy({ highWaterMark: 5 });
      // for browsers not supporting writablestram make sure to assign the polyfil writablestream.
      streamSaver.WritableStream = WritableStream;
      // create the write stream.
      const fileStream = streamSaver.createWriteStream(fileName, {
        writableStrategy: queuingStrategy,
        readableStrategy: queuingStrategy
      });
      const writer = fileStream.getWriter();
      this.currentWriter = writer;
      const context = this;

      await new Promise(async resolve => {
        new ReadableStream({
          start(controller) {
            const reader = response.body.getReader();
            read();
            function read() {
              reader.read().then(({done, value}) => {
                if (done) { // If download completes...
                  writer.close();
                  controller.close();
                  context.log.debug("Finished writing the content to the target file " + fileName + " in host machine. Cleaning up...");
                  resolve();
                }
                if(value != undefined){
                  writer.write(value);
                  read();
                }
              }).catch(error => {
                context.log.severe("An error occurred downloading " + fileName + " : ", error)
                controller.error(error);   
                resolve(error);               
              })
            }
          }
        },queuingStrategy);
      });
    }

    // Create query strings to append in the request.
    getQueryString(queries){
      return Object.keys(queries).reduce((result, key) => {
          return [...result, `${encodeURIComponent(key)}=${encodeURIComponent(ConfigVariables[queries[key]])}`]
      }, []).join('&');
    };

    // Cancel current download.
    cancelDownload(): void {
      if(this.currentWriter){
        this.currentWriter.abort();
        this.currentWriter.releaseLock();
        this.abortController.abort();
        this.totalSize = 1;
      }
    }
}