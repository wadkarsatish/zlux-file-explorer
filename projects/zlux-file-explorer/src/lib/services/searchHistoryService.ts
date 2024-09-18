import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, Inject } from '@angular/core';
import { Angular2InjectionTokens } from '../../pluginlib/inject-resources';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


@Injectable()
export class SearchHistoryService {
  private scope: string = 'user';
  private resourcePath: string = 'ui/history';
  private basePlugin: ZLUX.Plugin;

  private resourceName: string;
  private uri: string;
  public searchHistory: string[];
  private initHistory:boolean; 
  private type:string;

  constructor(@Inject(Angular2InjectionTokens.PLUGIN_DEFINITION) private pluginDefinition: ZLUX.ContainerPluginDefinition
  ,  private http: HttpClient) {
    
  }

  onInit(type: string) { //'uss' or 'mvs'
    this.type = type;
    this.basePlugin = this.pluginDefinition.getBasePlugin();
    this.resourceName = `${type}Search.json`;
    this.uri = ZoweZLUX.uriBroker.pluginConfigForScopeUri(this.basePlugin, this.scope, this.resourcePath, this.resourceName);
    this.searchHistory = [];
    this.getData();
  }

  private getData(): void {

    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let options = { headers: headers };

    const getRequest =  this.http
      .get(this.uri, options).pipe(
        catchError((err => {
          let type = this.type;
          console.log(err);
          return null;
        }))
      )

      const sub = getRequest.subscribe((data:any) => {
        if (data && data.contents && data.contents.history) {
          this.searchHistory = Array.from(new Set(this.searchHistory.concat(data.contents.history)));
        };
  
        this.initHistory = true;
        sub.unsubscribe();
      });
  }

  private saveData(history: string[]): Observable<any> {

    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    let options = { headers: headers };

    let params = {
        "history": history
    };

    return this.http
      .put(this.uri, params, options).pipe(
        catchError((err => {
          let type = this.type;
          console.log(`save${type}SearchHistory error`, err);
          return null
        }))
      )
  }

  public saveSearchHistory(path: string):Observable<any> {
    if (path && path.trim() != '' && !this.searchHistory.includes(path)) {
      this.searchHistory.push(path);
      if(this.initHistory) {
        //setTimeout(()=> {
        return this.saveData(this.searchHistory);
        //}, 100); 
      } 
      else {
        return of(this.searchHistory);
      }
    }

    return of(this.searchHistory);
  }

  public get searchHistoryVal():string[] {
     return this.searchHistory;
  }

  public deleteSearchHistory():Observable<any> {
    return this.http.delete(this.uri).pipe(
      catchError((err => {
        let type = this.type;
        console.log(`delete${type}SearchHistory error`, err);
        return null
      }))
    )
  }

}