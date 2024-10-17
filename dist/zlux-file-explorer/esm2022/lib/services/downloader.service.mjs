// /*
//   This program and the accompanying materials are
//   made available under the terms of the Eclipse Public License v2.0 which accompanies
//   this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
//   SPDX-License-Identifier: EPL-2.0
//   Copyright Contributors to the Zowe Project.
// */
import { Inject, Injectable } from '@angular/core';
import * as streamSaver from 'streamsaver';
import { Angular2InjectionTokens } from '../../pluginlib/inject-resources';
import { WritableStream, ReadableStream, CountQueuingStrategy } from 'web-streams-polyfill';
import * as i0 from "@angular/core";
export var ConfigVariables;
(function (ConfigVariables) {
    ConfigVariables["ASCII"] = "819";
    ConfigVariables["EBCDIC"] = "1047";
    ConfigVariables["UTF8"] = "1208";
})(ConfigVariables || (ConfigVariables = {}));
export class DownloaderService {
    constructor(log) {
        this.log = log;
        this.totalSize = 1;
        this.startTime = 0;
    }
    async fetchFileHandler(fetchPath, fileName, downloadObject) {
        this.abortController = new AbortController();
        this.abortSignal = this.abortController.signal;
        this.totalSize = downloadObject.size;
        // Define the endcoding type.(in case of USS file download)
        if (downloadObject.sourceEncoding != undefined && downloadObject.targetEncoding != undefined) {
            let queriesObject = {
                "source": downloadObject.sourceEncoding,
                "target": downloadObject.targetEncoding
            };
            fetchPath = fetchPath + "?" + await this.getQueryString(queriesObject);
        }
        this.startTime = new Date().getTime();
        const response = await fetch(fetchPath, { signal: this.abortSignal });
        // Mock size for now
        // this.totalSize =  Number(response.headers.get('X-zowe-filesize'));
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
        await new Promise((resolve, reject) => {
            new ReadableStream({
                start(controller) {
                    let reader = null;
                    if (downloadObject.data.isDataset) {
                        response.json().then(json => {
                            reader = json.records.filter(function (record) { return record.length > 0; }).map(function (record) { return record.trim(); }).join("\n");
                            const blob = new Blob([reader], { type: 'text/plain' });
                            createAndDownloadElement(blob, downloadObject.data.path);
                            resolve();
                        })
                            .catch(error => {
                            context.log.severe("An error occurred downloading " + fileName);
                            controller.error(error);
                            reject(error);
                        });
                    }
                    else {
                        reader = response.body.getReader();
                        read();
                    }
                    function read() {
                        reader.read().then(({ done, value }) => {
                            if (done) { // If download completes...
                                writer.close();
                                controller.close();
                                context.log.debug("Finished writing the content to the target file " + fileName + " in host machine. Cleaning up...");
                                resolve();
                            }
                            if (value != undefined) {
                                writer.write(value);
                                read();
                            }
                        }).catch(error => {
                            context.log.severe("An error occurred downloading " + fileName);
                            controller.error(error);
                            reject(error);
                        });
                    }
                }
            }, queuingStrategy);
        });
    }
    // Create query strings to append in the request.
    getQueryString(queries) {
        return Object.keys(queries).reduce((result, key) => {
            if (ConfigVariables[queries[key]]) {
                return [...result, `${encodeURIComponent(key)}=${encodeURIComponent(ConfigVariables[queries[key]])}`];
            }
            else {
                return [];
            }
        }, []).join('&');
    }
    ;
    // Cancel current download.
    cancelDownload() {
        if (this.currentWriter) {
            this.currentWriter.abort();
            this.currentWriter.releaseLock();
            this.abortController.abort();
            this.totalSize = 1;
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: DownloaderService, deps: [{ token: Angular2InjectionTokens.LOGGER }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: DownloaderService }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.7", ngImport: i0, type: DownloaderService, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [Angular2InjectionTokens.LOGGER]
                }] }] });
function createAndDownloadElement(blob, fileName) {
    const elem = window.document.createElement('a');
    elem.href = window.URL.createObjectURL(blob);
    elem.download = fileName;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG93bmxvYWRlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vcHJvamVjdHMvemx1eC1maWxlLWV4cGxvcmVyL3NyYy9saWIvc2VydmljZXMvZG93bmxvYWRlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLEtBQUs7QUFDTCxvREFBb0Q7QUFDcEQsd0ZBQXdGO0FBQ3hGLHNGQUFzRjtBQUN0RixxQ0FBcUM7QUFDckMsZ0RBQWdEO0FBQ2hELEtBQUs7QUFFTCxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNuRCxPQUFPLEtBQUssV0FBVyxNQUFNLGFBQWEsQ0FBQTtBQUMxQyxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUMzRSxPQUFPLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxvQkFBb0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDOztBQUU1RixNQUFNLENBQU4sSUFBWSxlQUlYO0FBSkQsV0FBWSxlQUFlO0lBQ3pCLGdDQUFhLENBQUE7SUFDYixrQ0FBZSxDQUFBO0lBQ2YsZ0NBQWEsQ0FBQTtBQUNmLENBQUMsRUFKVyxlQUFlLEtBQWYsZUFBZSxRQUkxQjtBQUdELE1BQU0sT0FBTyxpQkFBaUI7SUFPNUIsWUFBNEQsR0FBeUI7UUFBekIsUUFBRyxHQUFILEdBQUcsQ0FBc0I7UUFIckYsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUNkLGNBQVMsR0FBRyxDQUFDLENBQUM7SUFHZCxDQUFDO0lBRUQsS0FBSyxDQUFDLGdCQUFnQixDQUFDLFNBQWlCLEVBQUUsUUFBZ0IsRUFBRSxjQUFtQjtRQUM3RSxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksZUFBZSxFQUFFLENBQUM7UUFDN0MsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQztRQUMvQyxJQUFJLENBQUMsU0FBUyxHQUFHLGNB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O0lBQzdDLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0lBQ3pCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNiLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyAvKlxyXG4vLyAgIFRoaXMgcHJvZ3JhbSBhbmQgdGhlIGFjY29tcGFueWluZyBtYXRlcmlhbHMgYXJlXHJcbi8vICAgbWFkZSBhdmFpbGFibGUgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBFY2xpcHNlIFB1YmxpYyBMaWNlbnNlIHYyLjAgd2hpY2ggYWNjb21wYW5pZXNcclxuLy8gICB0aGlzIGRpc3RyaWJ1dGlvbiwgYW5kIGlzIGF2YWlsYWJsZSBhdCBodHRwczovL3d3dy5lY2xpcHNlLm9yZy9sZWdhbC9lcGwtdjIwLmh0bWxcclxuLy8gICBTUERYLUxpY2Vuc2UtSWRlbnRpZmllcjogRVBMLTIuMFxyXG4vLyAgIENvcHlyaWdodCBDb250cmlidXRvcnMgdG8gdGhlIFpvd2UgUHJvamVjdC5cclxuLy8gKi9cclxuXHJcbmltcG9ydCB7IEluamVjdCwgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgKiBhcyBzdHJlYW1TYXZlciBmcm9tICdzdHJlYW1zYXZlcidcclxuaW1wb3J0IHsgQW5ndWxhcjJJbmplY3Rpb25Ub2tlbnMgfSBmcm9tICcuLi8uLi9wbHVnaW5saWIvaW5qZWN0LXJlc291cmNlcyc7XHJcbmltcG9ydCB7IFdyaXRhYmxlU3RyZWFtLCBSZWFkYWJsZVN0cmVhbSwgQ291bnRRdWV1aW5nU3RyYXRlZ3kgfSBmcm9tICd3ZWItc3RyZWFtcy1wb2x5ZmlsbCc7XHJcblxyXG5leHBvcnQgZW51bSBDb25maWdWYXJpYWJsZXMge1xyXG4gIEFTQ0lJID0gXCI4MTlcIixcclxuICBFQkNESUMgPSBcIjEwNDdcIixcclxuICBVVEY4ID0gXCIxMjA4XCJcclxufVxyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgRG93bmxvYWRlclNlcnZpY2Uge1xyXG4gIGFib3J0Q29udHJvbGxlcjogQWJvcnRDb250cm9sbGVyO1xyXG4gIGFib3J0U2lnbmFsOiBBYm9ydFNpZ25hbDtcclxuICBjdXJyZW50V3JpdGVyOiBhbnk7XHJcbiAgdG90YWxTaXplID0gMTtcclxuICBzdGFydFRpbWUgPSAwO1xyXG5cclxuICBjb25zdHJ1Y3RvcihASW5qZWN0KEFuZ3VsYXIySW5qZWN0aW9uVG9rZW5zLkxPR0dFUikgcHJpdmF0ZSBsb2c6IFpMVVguQ29tcG9uZW50TG9nZ2VyLCkge1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZmV0Y2hGaWxlSGFuZGxlcihmZXRjaFBhdGg6IHN0cmluZywgZmlsZU5hbWU6IHN0cmluZywgZG93bmxvYWRPYmplY3Q6IGFueSk6IFByb21pc2U8YW55PiB7XHJcbiAgICB0aGlzLmFib3J0Q29udHJvbGxlciA9IG5ldyBBYm9ydENvbnRyb2xsZXIoKTtcclxuICAgIHRoaXMuYWJvcnRTaWduYWwgPSB0aGlzLmFib3J0Q29udHJvbGxlci5zaWduYWw7XHJcbiAgICB0aGlzLnRvdGFsU2l6ZSA9IGRvd25sb2FkT2JqZWN0LnNpemU7XHJcblxyXG4gICAgLy8gRGVmaW5lIHRoZSBlbmRjb2RpbmcgdHlwZS4oaW4gY2FzZSBvZiBVU1MgZmlsZSBkb3dubG9hZClcclxuICAgIGlmIChkb3dubG9hZE9iamVjdC5zb3VyY2VFbmNvZGluZyAhPSB1bmRlZmluZWQgJiYgZG93bmxvYWRPYmplY3QudGFyZ2V0RW5jb2RpbmcgIT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIGxldCBxdWVyaWVzT2JqZWN0ID1cclxuICAgICAge1xyXG4gICAgICAgIFwic291cmNlXCI6IGRvd25sb2FkT2JqZWN0LnNvdXJjZUVuY29kaW5nLFxyXG4gICAgICAgIFwidGFyZ2V0XCI6IGRvd25sb2FkT2JqZWN0LnRhcmdldEVuY29kaW5nXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBmZXRjaFBhdGggPSBmZXRjaFBhdGggKyBcIj9cIiArIGF3YWl0IHRoaXMuZ2V0UXVlcnlTdHJpbmcocXVlcmllc09iamVjdCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5zdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcclxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZmV0Y2hQYXRoLCB7IHNpZ25hbDogdGhpcy5hYm9ydFNpZ25hbCB9KVxyXG5cclxuICAgIC8vIE1vY2sgc2l6ZSBmb3Igbm93XHJcbiAgICAvLyB0aGlzLnRvdGFsU2l6ZSA9ICBOdW1iZXIocmVzcG9uc2UuaGVhZGVycy5nZXQoJ1gtem93ZS1maWxlc2l6ZScpKTtcclxuXHJcbiAgICAvLyBUT0RPOiBUaGUgZm9sbG93aW5nIGNvcmUgZG93bmxvYWQgbG9naWMgaXMgZnJvbSB0aGUgRlRBICYgbWF5IHJlcXVpcmUgcmVmYWN0b3Jpbmcgb3IgZnV0dXJlIGJ1Zy1wcm9vZmluZ1xyXG4gICAgLy8gZ2V0IHRoZSBzdHJlYW0gZnJvbSB0aGUgcmVzcG9zbnNlIGJvZHkuXHJcbiAgICBjb25zdCByZWFkYmxlU3RyZWFtID0gcmVzcG9uc2UuYm9keSAhPSBudWxsID8gcmVzcG9uc2UuYm9keSA6IFByb21pc2UucmVqZWN0KFwiQ2Fubm90IHJlY2VpdmUgZGF0YSBmcm9tIHRoZSBob3N0IG1hY2hpbmVcIik7XHJcbiAgICAvLyBxdWV1ZWluZyBzdHJhdGVneS5cclxuICAgIGNvbnN0IHF1ZXVpbmdTdHJhdGVneSA9IG5ldyBDb3VudFF1ZXVpbmdTdHJhdGVneSh7IGhpZ2hXYXRlck1hcms6IDUgfSk7XHJcbiAgICAvLyBmb3IgYnJvd3NlcnMgbm90IHN1cHBvcnRpbmcgd3JpdGFibGVzdHJhbSBtYWtlIHN1cmUgdG8gYXNzaWduIHRoZSBwb2x5ZmlsIHdyaXRhYmxlc3RyZWFtLlxyXG4gICAgc3RyZWFtU2F2ZXIuV3JpdGFibGVTdHJlYW0gPSBXcml0YWJsZVN0cmVhbTtcclxuICAgIC8vIGNyZWF0ZSB0aGUgd3JpdGUgc3RyZWFtLlxyXG4gICAgY29uc3QgZmlsZVN0cmVhbSA9IHN0cmVhbVNhdmVyLmNyZWF0ZVdyaXRlU3RyZWFtKGZpbGVOYW1lLCB7XHJcbiAgICAgIHdyaXRhYmxlU3RyYXRlZ3k6IHF1ZXVpbmdTdHJhdGVneSxcclxuICAgICAgcmVhZGFibGVTdHJhdGVneTogcXVldWluZ1N0cmF0ZWd5XHJcbiAgICB9KTtcclxuICAgIGNvbnN0IHdyaXRlciA9IGZpbGVTdHJlYW0uZ2V0V3JpdGVyKCk7XHJcbiAgICB0aGlzLmN1cnJlbnRXcml0ZXIgPSB3cml0ZXI7XHJcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcztcclxuXHJcbiAgICBhd2FpdCBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIG5ldyBSZWFkYWJsZVN0cmVhbSh7XHJcbiAgICAgICAgc3RhcnQoY29udHJvbGxlcikge1xyXG4gICAgICAgICAgbGV0IHJlYWRlciA9IG51bGw7XHJcbiAgICAgICAgICBpZiAoZG93bmxvYWRPYmplY3QuZGF0YS5pc0RhdGFzZXQpIHtcclxuICAgICAgICAgICAgcmVzcG9uc2UuanNvbigpLnRoZW4oanNvbiA9PiB7XHJcbiAgICAgICAgICAgICAgcmVhZGVyID0ganNvbi5yZWNvcmRzLmZpbHRlcihmdW5jdGlvbiAocmVjb3JkKSB7IHJldHVybiByZWNvcmQubGVuZ3RoID4gMCB9KS5tYXAoZnVuY3Rpb24gKHJlY29yZCkgeyByZXR1cm4gcmVjb3JkLnRyaW0oKSB9KS5qb2luKFwiXFxuXCIpO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbcmVhZGVyXSwgeyB0eXBlOiAndGV4dC9wbGFpbicgfSk7XHJcbiAgICAgICAgICAgICAgY3JlYXRlQW5kRG93bmxvYWRFbGVtZW50KGJsb2IsIGRvd25sb2FkT2JqZWN0LmRhdGEucGF0aCk7XHJcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgIC5jYXRjaChlcnJvciA9PiB7XHJcbiAgICAgICAgICAgICAgICBjb250ZXh0LmxvZy5zZXZlcmUoXCJBbiBlcnJvciBvY2N1cnJlZCBkb3dubG9hZGluZyBcIiArIGZpbGVOYW1lKVxyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlci5lcnJvcihlcnJvcik7XHJcbiAgICAgICAgICAgICAgICByZWplY3QoZXJyb3IpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVhZGVyID0gcmVzcG9uc2UuYm9keS5nZXRSZWFkZXIoKTtcclxuICAgICAgICAgICAgcmVhZCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZnVuY3Rpb24gcmVhZCgpIHtcclxuICAgICAgICAgICAgcmVhZGVyLnJlYWQoKS50aGVuKCh7IGRvbmUsIHZhbHVlIH0pID0+IHtcclxuICAgICAgICAgICAgICBpZiAoZG9uZSkgeyAvLyBJZiBkb3dubG9hZCBjb21wbGV0ZXMuLi5cclxuICAgICAgICAgICAgICAgIHdyaXRlci5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgY29udHJvbGxlci5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgY29udGV4dC5sb2cuZGVidWcoXCJGaW5pc2hlZCB3cml0aW5nIHRoZSBjb250ZW50IHRvIHRoZSB0YXJnZXQgZmlsZSBcIiArIGZpbGVOYW1lICsgXCIgaW4gaG9zdCBtYWNoaW5lLiBDbGVhbmluZyB1cC4uLlwiKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKHZhbHVlICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgd3JpdGVyLndyaXRlKHZhbHVlKTtcclxuICAgICAgICAgICAgICAgIHJlYWQoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLmNhdGNoKGVycm9yID0+IHtcclxuICAgICAgICAgICAgICBjb250ZXh0LmxvZy5zZXZlcmUoXCJBbiBlcnJvciBvY2N1cnJlZCBkb3dubG9hZGluZyBcIiArIGZpbGVOYW1lKVxyXG4gICAgICAgICAgICAgIGNvbnRyb2xsZXIuZXJyb3IoZXJyb3IpO1xyXG4gICAgICAgICAgICAgIHJlamVjdChlcnJvcik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9LCBxdWV1aW5nU3RyYXRlZ3kpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyBDcmVhdGUgcXVlcnkgc3RyaW5ncyB0byBhcHBlbmQgaW4gdGhlIHJlcXVlc3QuXHJcbiAgZ2V0UXVlcnlTdHJpbmcocXVlcmllcykge1xyXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKHF1ZXJpZXMpLnJlZHVjZSgocmVzdWx0LCBrZXkpID0+IHtcclxuICAgICAgaWYgKENvbmZpZ1ZhcmlhYmxlc1txdWVyaWVzW2tleV1dKSB7XHJcbiAgICAgICAgcmV0dXJuIFsuLi5yZXN1bHQsIGAke2VuY29kZVVSSUNvbXBvbmVudChrZXkpfT0ke2VuY29kZVVSSUNvbXBvbmVudChDb25maWdWYXJpYWJsZXNbcXVlcmllc1trZXldXSl9YF1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gW11cclxuICAgICAgfVxyXG4gICAgfSwgW10pLmpvaW4oJyYnKTtcclxuICB9O1xyXG5cclxuICAvLyBDYW5jZWwgY3VycmVudCBkb3dubG9hZC5cclxuICBjYW5jZWxEb3dubG9hZCgpOiB2b2lkIHtcclxuICAgIGlmICh0aGlzLmN1cnJlbnRXcml0ZXIpIHtcclxuICAgICAgdGhpcy5jdXJyZW50V3JpdGVyLmFib3J0KCk7XHJcbiAgICAgIHRoaXMuY3VycmVudFdyaXRlci5yZWxlYXNlTG9jaygpO1xyXG4gICAgICB0aGlzLmFib3J0Q29udHJvbGxlci5hYm9ydCgpO1xyXG4gICAgICB0aGlzLnRvdGFsU2l6ZSA9IDE7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjcmVhdGVBbmREb3dubG9hZEVsZW1lbnQoYmxvYjogQmxvYiwgZmlsZU5hbWU6IGFueSkge1xyXG4gIGNvbnN0IGVsZW0gPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xyXG4gIGVsZW0uaHJlZiA9IHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xyXG4gIGVsZW0uZG93bmxvYWQgPSBmaWxlTmFtZTtcclxuICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsZW0pO1xyXG4gIGVsZW0uY2xpY2soKTtcclxuICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGVsZW0pO1xyXG59XHJcbiJdfQ==