
/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/

import { TreeNode } from 'primeng/api';

import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Angular2InjectionTokens } from '../../pluginlib/inject-resources';

@Injectable()
export class PersistentDataService {
    private ussData: TreeNode[];
    private scope: string = "instance";
    private resourcePath: string = "persistance";
    private fileName: string = "zlux-file-explorer.json"
    
    constructor(private http: HttpClient,
        @Inject(Angular2InjectionTokens.PLUGIN_DEFINITION) private pluginDefinition: ZLUX.ContainerPluginDefinition,

    ) { }

    public setData(params: any): Observable<any> {

        let uri = ZoweZLUX.uriBroker.pluginConfigForScopeUri(this.pluginDefinition.getBasePlugin(), this.scope, this.resourcePath, this.fileName);

        if (typeof params === 'object') {
            return this.http.put(uri, this.stringify(params, null, 2, null));
            //return this.http.put(uri, JSON.stringify(params));
        } else {
            return this.http.put(uri, params);
        }
    }


    public getData(): Observable<any> {
      return null;
        //TODO: This code no longer functions as intended. This is supposed to introduce persistent data loading
        //so the File Explorer would re-open a user's previously opened trees/working directory when they close.

        // let uri = ZoweZLUX.uriBroker.pluginConfigForScopeUri(this.pluginDefinition.getBasePlugin(), this.scope, this.resourcePath, this.fileName);

        // let headers = new Headers({ 'Content-Type': 'application/json' });
        // let options = new RequestOptions({ headers: headers });
        // return this.http
        // .get(uri, options)
        // .map((res => { return res.json(); }))
        // .catch((err => { 
        //   console.log("Data saving file does not exist. Creating one now...");
        //   return this.http.put(uri, this.stringify(null, null, 2, null)); 
        // })); 
    }

    public stringify(obj, replacer, spaces, cycleReplacer) {
        return JSON.stringify(obj, this.serializer(replacer, cycleReplacer), spaces)
      }

    public serializer(replacer, cycleReplacer) {
        var stack = [], keys = []
      
        if (cycleReplacer == null) cycleReplacer = function(key, value) {
          if (stack[0] === value) return "[Circular ~]"
          return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]"
        }
      
        return function(key, value) {
          if (stack.length > 0) {
            var thisPos = stack.indexOf(this)
            ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
            ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key)
            if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
          }
          else stack.push(value)
      
          return replacer == null ? value : replacer.call(this, key, value)
        }
      }

    
}






/*
  This program and the accompanying materials are
  made available under the terms of the Eclipse Public License v2.0 which accompanies
  this distribution, and is available at https://www.eclipse.org/legal/epl-v20.html
  
  SPDX-License-Identifier: EPL-2.0
  
  Copyright Contributors to the Zowe Project.
*/
